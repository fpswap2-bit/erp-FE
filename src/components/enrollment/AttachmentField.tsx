import { useRef, useState } from "react";
import { enrollmentApi } from "@/api/enrollment";
import { Button } from "@/components/ui/button";

const MAX_SIZE_MB = 5;
const IMAGE_TYPES = ["image/jpeg", "image/png"];
const DOC_TYPES = [...IMAGE_TYPES, "application/pdf"];

interface Props {
    fieldname: string;
    fieldtype: string; // "Attach" | "Attach Image"
    value?: string;
    docName: string;
    disabled?: boolean;
    onUploaded: (fileUrl: string) => void;
}

export default function AttachmentField({
    fieldname,
    fieldtype,
    value,
    docName,
    disabled,
    onUploaded,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [progress, setProgress] = useState<number | null>(null);
    const [error, setError] = useState("");

    const isImage = fieldtype === "Attach Image";
    const allowed = isImage ? IMAGE_TYPES : DOC_TYPES;
    const accept = isImage ? ".jpg,.jpeg,.png" : ".jpg,.jpeg,.png,.pdf";

    if (!docName) {
        return (
            <p className="text-xs text-muted-foreground">
                Save your draft first, then you can upload this file.
            </p>
        );
    }

    const handleFile = async (file: File) => {
        setError("");

        if (!allowed.includes(file.type)) {
            setError(isImage ? "Only JPG or PNG images are allowed." : "Only PDF, JPG or PNG files are allowed.");
            return;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`File must be smaller than ${MAX_SIZE_MB} MB.`);
            return;
        }

        try {
            setProgress(0);
            const uploadRes = await enrollmentApi.uploadFile(
                file,
                docName,
                fieldname,
                setProgress
            );
            const fileUrl: string = uploadRes.data.message.file_url;

            await enrollmentApi.setAttachment(docName, fieldname, fileUrl);
            onUploaded(fileUrl);
        } catch (err: any) {
            setError(
                err.response?.data?.exception ||
                "Upload failed. Please try again."
            );
        } finally {
            setProgress(null);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const uploading = progress !== null;

    return (
        <div className="space-y-2">
            {value && (
                <div className="flex items-center gap-3">
                    {isImage && (
                        <img
                            src={value}
                            alt=""
                            className="h-16 w-16 rounded-md border object-cover"
                        />
                    )}
                    <a
                        href={value}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 underline"
                    >
                        {value.split("/").pop()}
                    </a>
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                disabled={disabled || uploading}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                }}
            />

            <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || uploading}
                onClick={() => inputRef.current?.click()}
            >
                {uploading
                    ? `Uploading ${progress}%`
                    : value
                    ? "Replace file"
                    : "Choose file"}
            </Button>

            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}