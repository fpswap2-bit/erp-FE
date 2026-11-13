import { toCanvas } from "html-to-image";
import { jsPDF } from "jspdf";

const A4_W = 210; // mm
const A4_H = 297; // mm
const MAX_CANVAS_PX = 16000; // browsers fail on canvases much taller than this

const PLACEHOLDER_GIF =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export interface PdfExportOptions {
    /** Output file name. */
    filename?: string;
    /** Page margin in mm. */
    marginMm?: number;
    /** Render sharpness. 2 is crisp; it is clamped automatically for very long content. */
    scale?: number;
    backgroundColor?: string;
    /**
     * Elements matching this selector are never split across pages
     * (a page break is moved above them instead).
     */
    keepTogether?: string;
    /**
     * Skips embedding web fonts (avoids cross-origin stylesheet errors).
     * Set to false if you use custom web fonts and they must appear in the PDF.
     */
    skipFonts?: boolean;
}

/* ------------------------------------------------------------------ */
/* Image inlining                                                      */
/* ------------------------------------------------------------------ */

const blobToDataUrl = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = () => reject(r.error);
        r.readAsDataURL(blob);
    });

/**
 * Fetch an image as a data URL.
 * - cache: "reload" bypasses the browser's cached copy. An <img> that was loaded
 *   without CORS headers is cached without them, and a later CORS fetch of the
 *   same URL then fails. This is a very common cause of blank images.
 * - Tries with cookies first (private Frappe files), then without (a server that
 *   answers with `Access-Control-Allow-Origin: *` rejects credentialed requests).
 */
async function fetchAsDataUrl(src: string): Promise<string> {
    let lastError: unknown;

    for (const credentials of ["include", "omit"] as const) {
        try {
            const res = await fetch(src, { credentials, cache: "reload" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const blob = await res.blob();
            // A login page returned with status 200 ends up here
            if (!blob.type.startsWith("image/")) {
                throw new Error(`Not an image (${blob.type || "unknown type"})`);
            }
            return await blobToDataUrl(blob);
        } catch (e) {
            lastError = e;
        }
    }
    throw lastError;
}

/** Replaces every <img> source with a data URL. Returns a function that restores them. */
async function inlineImages(root: HTMLElement) {
    const imgs = Array.from(root.querySelectorAll("img"));
    const originals: { img: HTMLImageElement; src: string | null; srcset: string | null }[] = [];
    const failed: string[] = [];

    await Promise.all(
        imgs.map(async (img) => {
            const src = img.currentSrc || img.src;
            if (!src) return;

            if (!src.startsWith("data:")) {
                try {
                    const dataUrl = await fetchAsDataUrl(src);
                    originals.push({
                        img,
                        src: img.getAttribute("src"),
                        srcset: img.getAttribute("srcset"),
                    });
                    img.removeAttribute("srcset");
                    img.src = dataUrl;
                } catch (error) {
                    failed.push(src);
                    console.error("PDF image fetch error:", src, error);
                }
            }

            try {
                await img.decode();
            } catch (error) {
                console.error("PDF image decode error:", img.src.slice(0, 80), error);
            }
        })
    );

    if (failed.length) {
        console.warn(
            `${failed.length} image(s) could not be inlined and may be blank in the PDF.`
        );
    }

    return () => {
        originals.forEach(({ img, src, srcset }) => {
            if (src === null) img.removeAttribute("src");
            else img.setAttribute("src", src);

            if (srcset === null) img.removeAttribute("srcset");
            else img.setAttribute("srcset", srcset);
        });
    };
}

/* ------------------------------------------------------------------ */
/* Page-break helpers                                                  */
/* ------------------------------------------------------------------ */

type Block = { top: number; bottom: number };

/** Measures keep-together blocks in canvas pixels, relative to the root element. */
function measureBlocks(root: HTMLElement, selector: string, k: number): Block[] {
    const rootTop = root.getBoundingClientRect().top;

    return Array.from(root.querySelectorAll<HTMLElement>(selector)).map((el) => {
        const r = el.getBoundingClientRect();
        return { top: (r.top - rootTop) * k, bottom: (r.bottom - rootTop) * k };
    });
}

/* ------------------------------------------------------------------ */
/* Main export                                                         */
/* ------------------------------------------------------------------ */

/**
 * Renders an element to a multi-page A4 PDF and downloads it.
 *
 * Hidden from the PDF: <button>, file inputs, and anything with `data-no-snapshot`.
 * Kept on one page where possible: anything with `data-pdf-block`
 * (or whatever `keepTogether` selects).
 */
export async function exportElementToA4Pdf(
    el: HTMLElement,
    filename = "document.pdf",
    options: PdfExportOptions = {}
) {
    const {
        marginMm = 10,
        scale: requestedScale = 2,
        backgroundColor = "#ffffff",
        keepTogether = "[data-pdf-block]",
        skipFonts = true,
    } = options;

    await document.fonts.ready;

    // Hide UI-only elements while measuring and capturing so that layout
    // positions used for page breaks match what ends up in the image.
    const hidden = Array.from(
        el.querySelectorAll<HTMLElement>(
            "[data-no-snapshot], button, input[type='file']"
        )
    ).map((node) => ({ node, display: node.style.display }));
    hidden.forEach(({ node }) => (node.style.display = "none"));

    const restoreImages = await inlineImages(el);

    try {
        // Keep the canvas under the browser size limit for long content
        const scale = Math.max(
            1,
            Math.min(
                requestedScale,
                MAX_CANVAS_PX / Math.max(el.scrollHeight, 1),
                MAX_CANVAS_PX / Math.max(el.scrollWidth, 1)
            )
        );

        const render = () =>
            toCanvas(el, {
                pixelRatio: scale,
                backgroundColor,
                cacheBust: false,
                skipFonts,
                imagePlaceholder: PLACEHOLDER_GIF,
            });

        let canvas: HTMLCanvasElement;
        try {
            // First pass warms up image decoding; Safari/Firefox often draw
            // images blank on the very first render.
            if (el.querySelector("img")) await render().catch(() => undefined);
            canvas = await render();
        } catch (e: any) {
            // html-to-image often rejects with an Event instead of an Error
            const detail =
                e instanceof Error
                    ? e.message
                    : e?.target?.src
                    ? `image failed to load: ${String(e.target.src).slice(0, 120)}`
                    : String(e);
            throw new Error(`Snapshot failed: ${detail}`);
        }

        // --- Slice the canvas into A4 pages --------------------------------
        const contentW = A4_W - marginMm * 2;
        const contentH = A4_H - marginMm * 2;
        const pxPerMm = canvas.width / contentW;
        const pageHpx = Math.floor(contentH * pxPerMm);

        const k = canvas.width / el.offsetWidth; // CSS px -> canvas px
        const blocks = measureBlocks(el, keepTogether, k);
        const breakPoints = blocks.flatMap((b) => [b.top, b.bottom]);
        // A break is clean if it doesn't fall inside any block
        const isClean = (y: number) =>
            !blocks.some((b) => y > b.top + 1 && y < b.bottom - 1);

        const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

        let y = 0;
        let page = 0;

        while (y < canvas.height - 1) {
            let end = Math.min(y + pageHpx, canvas.height);

            if (end < canvas.height) {
                const minEnd = y + pageHpx * 0.4; // avoid near-empty pages
                const clean = breakPoints
                    .filter((p) => p <= end && p > minEnd)
                    .sort((a, b) => b - a)
                    .find(isClean);

                if (clean !== undefined) end = Math.floor(clean);
            }

            const sliceH = Math.max(1, end - y);

            const slice = document.createElement("canvas");
            slice.width = canvas.width;
            slice.height = sliceH;

            const ctx = slice.getContext("2d");
            if (!ctx) throw new Error("Canvas 2D context unavailable.");

            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, slice.width, slice.height);
            ctx.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

            if (page > 0) pdf.addPage();
            pdf.addImage(
                slice.toDataURL("image/jpeg", 0.95),
                "JPEG",
                marginMm,
                marginMm,
                contentW,
                sliceH / pxPerMm,
                undefined,
                "FAST"
            );

            y += sliceH;
            page += 1;
        }

        pdf.save(filename);
    } finally {
        restoreImages();
        hidden.forEach(({ node, display }) => (node.style.display = display));
    }
}