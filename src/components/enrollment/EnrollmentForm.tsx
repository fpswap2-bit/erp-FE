import { useEffect, useRef, useState } from "react";
import AttachmentField from "@/components/enrollment/AttachmentField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { exportElementToA4Pdf } from "@/lib/snapshot";
import { useEnrollmentStore, type FormField } from "@/store/enrollmentStore";
import logo from "@/assets/rgpv.webp?inline";

const LAYOUT_TYPES = new Set(["Section Break", "Column Break", "Tab Break"]);
const HIDDEN_EXTRA = new Set(["amended_from"]);

const ENCLOSURES: [string, string][] = [
    ["file_enrollment_form", "Enrollment Form"],
    ["file_payment_receipt", "Payment Receipt"],
    ["file_10th_marksheet", "10th Marksheet"],
    ["file_12th_marksheet", "12th Marksheet"],
    ["file_graduation_marksheet", "Diploma / Graduation Marksheet"],
    ["file_admission_slip", "Admission Slip"],
    ["file_tc_copy", "Transfer Certificate (TC) Copy"],
    ["file_migration_certificate", "Migration Certificate"],
    ["file_aadhar_card", "Aadhaar Card"],
];

const PLACED = new Set([
    "college_code", "academic_year", "enrollment_number", "college_name",
    "name_as_per_10th", "date_of_birth", "name_as_per_admission_slip", "gender",
    "name_in_hindi", "fathers_name", "course", "branch", "branch_code",
    "category", "email_id", "mobile_no", "aadhar_no", "seat_category",
    "aapar_abc_id", "mobile_linked_aadhar", "medium_hindi", "medium_english",
    "student_photo", "student_signature", "name_of_principal",
    ...ENCLOSURES.map(([name]) => name),
]);

const LINE =
    "h-8 w-full min-w-0 flex-1 rounded-none border-0 border-b border-dotted border-neutral-600 " +
    "bg-transparent px-1 py-1 text-sm shadow-none outline-none " +
    "focus-visible:border-b-2 focus-visible:border-solid focus-visible:border-[#8e1b1b] " +
    "focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-70";

const ROW = "flex flex-col gap-4 md:flex-row md:gap-6";
const LABEL =
    "flex min-w-0 flex-1 flex-col gap-1 text-[13px] font-semibold sm:flex-row sm:items-end sm:gap-2";
const SECTION = "space-y-4 border-b border-neutral-400 py-4";

const getSelectOptions = (options?: string[] | string): string[] => {
    if (Array.isArray(options)) return options;
    if (typeof options === "string") {
        return options.split("\n").map((o) => o.trim()).filter(Boolean);
    }
    return [];
};

interface Props {
    mode?: "student" | "admin";
    name?: string; // enrollment record id (admin mode)
}

export default function EnrollmentForm({ mode = "student", name }: Props) {
    const {
        fields, options, values, docName, docstatus, rejectionReason,
        loading, saving, notice,
        loadStudent, loadAdmin, setValue, saveDraft,
    } = useEnrollmentStore();

    const isAdmin = mode === "admin";

    const paperRef = useRef<HTMLDivElement>(null);
    const [exporting, setExporting] = useState(false);
    const [pdfError, setPdfError] = useState("");

    const isDraft = docstatus === 0;
    const isSubmitted = docstatus === 1;
    const isCancelled = docstatus === 2;

    useEffect(() => {
        if (isAdmin) {
            if (name) void loadAdmin(name);
        } else {
            void loadStudent();
        }
    }, [isAdmin, name, loadAdmin, loadStudent]);

    const downloadPdf = async () => {
        if (!paperRef.current) return;
        setExporting(true);
        setPdfError("");
        try {
            await exportElementToA4Pdf(paperRef.current, `enrollment-${docName}.pdf`);
        } catch (error: any) {
            console.error(error);
            setPdfError(error?.message || "Unable to create the PDF. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    if (loading) return <p className="p-6">Loading enrollment form...</p>;

    if (!fields.length && notice?.error) {
        return <p className="p-6 text-red-700">{notice.text}</p>;
    }

    const fieldMap = Object.fromEntries(fields.map((f) => [f.fieldname, f]));

    // ---- render helpers (plain functions, NOT components, so inputs keep focus) ----

    const control = (f: FormField) => {
        const value = values[f.fieldname] ?? "";
        const readOnly = Boolean(f.read_only);

        if (["Attach", "Attach Image"].includes(f.fieldtype)) {
            return (
                <AttachmentField
                    fieldname={f.fieldname}
                    fieldtype={f.fieldtype}
                    value={value}
                    docName={docName}
                    disabled={!isDraft || readOnly}
                    onUploaded={(url) => setValue(f.fieldname, url)}
                />
            );
        }

        if (f.fieldtype === "Check") {
            return (
                <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#8e1b1b]"
                    checked={Boolean(value)}
                    disabled={readOnly}
                    onChange={(e) => setValue(f.fieldname, e.target.checked ? 1 : 0)}
                />
            );
        }

        const choices =
            f.fieldtype === "Select"
                ? getSelectOptions(f.options)
                : f.fieldtype === "Link"
                ? options.link[f.fieldname]
                : undefined;

        const list =
            choices && value && !choices.includes(value) ? [...choices, value] : choices;

        if (list) {
            return (
                <select
                    className={LINE}
                    value={value}
                    disabled={readOnly}
                    onChange={(e) => setValue(f.fieldname, e.target.value)}
                >
                    <option value="">Select</option>
                    {list.map((o) => (
                        <option key={o} value={o}>
                            {o}
                        </option>
                    ))}
                </select>
            );
        }

        return (
            <Input
                className={LINE}
                type={f.fieldtype === "Date" ? "date" : f.fieldtype === "Int" ? "number" : "text"}
                value={value}
                required={Boolean(f.reqd)}
                disabled={readOnly}
                onChange={(e) => setValue(f.fieldname, e.target.value)}
            />
        );
    };

    const labelText = (f: FormField, override?: string, wrap = false) => (
        <span className={wrap ? "" : "whitespace-nowrap"}>
            {override ?? f.label}
            {f.reqd ? <span className="text-red-700"> *</span> : null}
        </span>
    );

    const field = (fieldname: string, label?: string, wrapperClass = "", wrap = false) => {
        const f = fieldMap[fieldname];
        if (!f) return null;

        const isAttach = ["Attach", "Attach Image"].includes(f.fieldtype);
        const Wrapper = isAttach ? "div" : "label";

        return (
            <Wrapper key={fieldname} className={`${LABEL} ${wrapperClass}`}>
                {labelText(f, label, wrap)}
                {control(f)}
            </Wrapper>
        );
    };

    const checkbox = (fieldname: string, label: string) => {
        const f = fieldMap[fieldname];
        if (!f) return null;
        return (
            <label key={fieldname} className="flex items-center gap-2 text-[13px] font-semibold">
                {control(f)}
                {label}
            </label>
        );
    };

    const attach = (fieldname: string) => (fieldMap[fieldname] ? control(fieldMap[fieldname]) : null);

    const enclosureRows = ENCLOSURES.filter(([n]) => fieldMap[n]);
    const extraFields = fields.filter(
        (f) =>
            !LAYOUT_TYPES.has(f.fieldtype) &&
            !PLACED.has(f.fieldname) &&
            !HIDDEN_EXTRA.has(f.fieldname)
    );

    const rejected = isDraft && Boolean(rejectionReason);

    const statusBadge = isSubmitted
        ? { text: "Submitted", cls: "bg-amber-100 text-amber-800" }
        : isCancelled
        ? { text: "Cancelled", cls: "bg-neutral-200 text-neutral-700" }
        : rejected
        ? { text: "Rejected", cls: "bg-red-100 text-red-800" }
        : { text: "Draft", cls: "bg-emerald-100 text-emerald-800" };

    const statusMessage = pdfError || notice?.text || "";
    const statusIsError = Boolean(pdfError) || Boolean(notice?.error);

    return (
        <div className="mx-auto max-w-5xl px-3 py-6 text-neutral-800">
            {/* Toolbar */}
            <div className="mb-3 flex items-center justify-between text-[13px] text-neutral-500">
                <span>{isAdmin ? "Admin / Enrollment Review" : "Student Portal / Enrollment"}</span>
                <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${statusBadge.cls}`}>
                    {statusBadge.text}
                </span>
            </div>

            {rejected && (
                <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    <strong>{isAdmin ? "Rejected:" : "Returned for changes:"}</strong> {rejectionReason}
                    {!isAdmin && " Update your details and save your draft."}
                </div>
            )}

            {isSubmitted && (
                <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    {isAdmin
                        ? "This application is submitted and locked. Use Amend in the review panel to edit it."
                        : "Your application has been submitted and is locked for editing. Contact the Academic Office if changes are required."}
                </div>
            )}

            {isCancelled && (
                <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    {isAdmin
                        ? "This application was cancelled and cannot be changed."
                        : "Your application has been cancelled and is locked for editing."}
                </div>
            )}

            {/* Locks every input when the application is not a draft */}
            <fieldset disabled={!isDraft} className="m-0 min-w-0 border-0 p-0">
                <div
                    ref={paperRef}
                    className="border-2 border-neutral-700 bg-white px-4 py-5 shadow-[0_5px_24px_rgba(0,0,0,0.07)] sm:px-6"
                >
                    {/* Header */}
                    <header className="grid items-center gap-3 border-b-[3px] border-double border-neutral-700 pb-3 text-center md:grid-cols-[90px_1fr_90px]">
                        <div className="mx-auto h-[90px] w-[90px]">
                            <img
                                src={logo}
                                alt="University emblem"
                                className="h-full w-full rounded-full object-contain"
                            />
                        </div>
                        <div className="font-serif">
                            <h1 className="text-base font-extrabold sm:text-xl">
                                RAJIV GANDHI PROUDYOGIKI VISHWAVIDYALAYA
                            </h1>
                            <h2 className="my-0.5 text-sm sm:text-[17px]">BHOPAL – 462033</h2>
                            <h3 className="mt-2 text-xs sm:text-sm">
                                STUDENT DATA FORM (SDF) &amp; ENCLOSURE VERIFICATION LIST (EVL)
                            </h3>
                            <p className="font-sans text-xs font-semibold">(To be filled by the student)</p>
                        </div>
                        <div className="mx-auto hidden rounded-full border-2 border-neutral-700 px-1 py-2 text-[10px] font-bold md:block">
                            SDF &amp; EVL
                        </div>
                    </header>

                    {/* College details */}
                    <section className={SECTION}>
                        <div className={ROW}>
                            {field("college_code", "College Code")}
                            {field("academic_year", "Year of Admission")}
                        </div>
                        <div className={ROW}>{field("enrollment_number", "Enrollment Number")}</div>
                        <div className={ROW}>{field("college_name", "College Name")}</div>
                    </section>

                    {/* Student details */}
                    <section className={SECTION}>
                        <div className={ROW}>
                            {field("name_as_per_10th", "Name (As per 10th Marksheet)")}
                            {field("date_of_birth", "Date of Birth", "md:max-w-[38%]")}
                        </div>
                        <div className={ROW}>{field("name_as_per_admission_slip", "Name (As per Admission Slip)")}</div>
                        <div className={ROW}>{field("name_in_hindi", "Name in Hindi")}</div>
                        <div className={ROW}>{field("fathers_name", "Father’s Name")}</div>

                        <div className="grid gap-4 md:grid-cols-2 md:gap-x-6">
                            {field("course", "Course")}
                            {field("branch", "Branch")}
                            {field("branch_code", "Branch Code")}
                            {field("category", "Category")}
                            {field("gender", "Gender")}
                            {field("seat_category", "Seat Category")}
                        </div>

                        <div className={ROW}>
                            {field("email_id", "Email ID")}
                            {field("mobile_no", "Mobile No.")}
                        </div>
                        <div className={ROW}>
                            {field("aadhar_no", "Aadhaar No.")}
                            {field("mobile_linked_aadhar", "Mobile linked to Aadhaar")}
                        </div>
                        <div className={ROW}>{field("aapar_abc_id", "APAAR / ABC ID")}</div>

                        {(fieldMap.medium_hindi || fieldMap.medium_english) && (
                            <div className="flex flex-wrap items-center gap-5 pt-2 text-[13px]">
                                <strong>Medium of Instruction:</strong>
                                {checkbox("medium_hindi", "Hindi")}
                                {checkbox("medium_english", "English")}
                            </div>
                        )}
                    </section>

                    {/* Photo / thumb / signature */}
                    <section className="grid grid-cols-2 gap-3.5 py-5 md:grid-cols-[1.1fr_1fr_1fr_1fr]">
                        <div className="flex min-h-[145px] flex-col items-center justify-center gap-2 border border-neutral-600 p-3 text-center text-xs text-neutral-600">
                            <span>Student Colour Photograph</span>
                            {attach("student_photo")}
                        </div>

                        {["Left", "Right"].map((side) => (
                            <div
                                key={side}
                                className="flex min-h-[145px] flex-col items-center justify-center gap-2 border border-neutral-600 p-3 text-center text-xs text-neutral-600"
                            >
                                <span>{side} Thumb Impression</span>
                                <div className="h-[100px] w-full border border-dashed border-neutral-500 bg-white" />
                            </div>
                        ))}

                        <div className="flex min-h-[145px] flex-col items-center justify-center gap-2 border border-neutral-600 p-3 text-center text-xs text-neutral-600">
                            <span>Student Signature</span>
                            {attach("student_signature")}
                        </div>
                    </section>

                    {/* Principal block: editable by admins, read-only for students */}
                    <section className="mb-5 mt-1 text-[13px] md:ml-[43%]">
                        <strong>Verified by Principal</strong>
                        <p className="border-b border-dotted border-neutral-600 py-2">
                            Signature: __________________________________
                        </p>
                        <label className="flex items-center gap-2 py-1">
                            Name of Principal
                            <input
                                disabled={!isAdmin || !fieldMap.name_of_principal}
                                value={values.name_of_principal ?? ""}
                                onChange={(e) => setValue("name_of_principal", e.target.value)}
                                placeholder="To be completed by college"
                                className={LINE}
                            />
                        </label>
                        <small className="text-neutral-500">
                            Principal verification is completed by the college office.
                        </small>
                    </section>

                    {/* Enclosure checklist */}
                    {enclosureRows.length > 0 && (
                        <section>
                            <h3 className="my-2.5 text-[15px] font-extrabold">Check List for UG/PG</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-[13px]">
                                    <thead>
                                        <tr>
                                            <th className="w-14 border-2 border-neutral-700 p-1.5 text-center">S. No.</th>
                                            <th className="border-2 border-neutral-700 p-1.5 text-left">Enclosures</th>
                                            <th className="w-[38%] border-2 border-neutral-700 p-1.5 text-left">
                                                Upload document
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enclosureRows.map(([n, label], i) => (
                                            <tr key={n}>
                                                <td className="border-2 border-neutral-700 p-1.5 text-center">{i + 1}</td>
                                                <td className="border-2 border-neutral-700 p-1.5">
                                                    {label}
                                                    {fieldMap[n].reqd ? <span className="text-red-700"> *</span> : null}
                                                </td>
                                                <td className="border-2 border-neutral-700 p-1.5">{attach(n)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* Fields not placed above (college verification for admins) */}
                    {extraFields.length > 0 && (
                        <section className={`${SECTION} mt-4 border-t`}>
                            <h3 className="text-[15px] font-extrabold">
                                {isAdmin || isSubmitted ? "College Verification" : "Additional Details"}
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2 md:gap-x-6">
                                {extraFields.map((f) => (
                                    <div key={f.fieldname}>
                                        {field(f.fieldname, undefined, "", true)}
                                        {f.description && (
                                            <p className="mt-1 text-xs text-neutral-500">{f.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <p className="mt-4 text-xs font-semibold">
                        Please verify all details carefully. Submitted information may require
                        college approval for correction.
                    </p>
                </div>
            </fieldset>

            {/* Sticky action bar */}
            <div className="sticky bottom-0 z-10 mt-4 flex items-center justify-between gap-3 bg-white/90 py-3 backdrop-blur">
                <p className={`text-sm ${statusIsError ? "text-red-700" : ""}`} role="status">
                    {statusMessage}
                </p>
                <div className="flex gap-2">
                    {docName && (
                        <Button variant="outline" onClick={downloadPdf} disabled={exporting}>
                            {exporting ? "Preparing PDF..." : "Download PDF"}
                        </Button>
                    )}
                    {isDraft && (
                        <Button
                            onClick={() => void saveDraft()}
                            disabled={saving}
                            className="bg-[#8e1b1b] font-bold text-white hover:bg-[#751515]"
                        >
                            {saving ? "Saving..." : isAdmin ? "Save Changes" : "Save Draft"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}