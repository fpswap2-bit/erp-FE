import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ban, CheckCircle2, Pencil, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEnrollmentStore } from "@/store/enrollmentStore";

export default function ReviewActions({ name }: { name: string }) {
    const navigate = useNavigate();
    const { docstatus, loading, acting, saving, values, submit, reject, cancel, amend } =
        useEnrollmentStore();

    const [panel, setPanel] = useState<"reject" | "cancel" | null>(null);
    const [reason, setReason] = useState("");
    const busy = acting || saving;

    if (loading || docstatus === null) return null;

    const closePanel = () => {
        setPanel(null);
        setReason("");
    };

    const onSubmit = async () => {
        if (!window.confirm("Approve and submit this application? It will be locked for editing.")) return;
        await submit();
    };

    const onAmend = async () => {
        if (
            !window.confirm(
                "This cancels the submitted record and creates an editable draft copy. Continue?"
            )
        )
            return;
        const newName = await amend();
        if (newName) {
            navigate(`/admin/enrollment-records/${encodeURIComponent(newName)}`, { replace: true });
        }
    };

    const onConfirmReason = async () => {
        const text = reason.trim();
        if (!text) return;
        const ok = panel === "reject" ? await reject(text) : await cancel(text);
        if (ok) closePanel();
    };

    return (
        <div className="rounded-md border border-[#e8e2df] bg-white p-4 shadow-sm lg:sticky lg:top-16 lg:z-20">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate font-serif text-lg font-bold text-gray-900">
                        {values.name_as_per_10th || "Unnamed student"}
                    </p>
                    <p className="text-xs text-neutral-500">{name}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {docstatus === 0 && (
                        <>
                            <Button
                                variant="outline"
                                disabled={busy}
                                onClick={() => setPanel("reject")}
                                className="border-[#8e1b1b] text-[#8e1b1b]"
                            >
                                <XCircle className="mr-1.5 h-4 w-4" /> Reject
                            </Button>
                            <Button
                                disabled={busy}
                                onClick={onSubmit}
                                className="bg-[#1a237e] text-white hover:bg-[#151b63]"
                            >
                                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                {acting ? "Working..." : "Approve & Submit"}
                            </Button>
                        </>
                    )}

                    {docstatus === 1 && (
                        <>
                            <Button variant="outline" disabled={busy} onClick={onAmend}>
                                <Pencil className="mr-1.5 h-4 w-4" /> Amend
                            </Button>
                            <Button
                                variant="outline"
                                disabled={busy}
                                onClick={() => setPanel("cancel")}
                                className="border-[#8e1b1b] text-[#8e1b1b]"
                            >
                                <Ban className="mr-1.5 h-4 w-4" /> Cancel Application
                            </Button>
                        </>
                    )}

                    {docstatus === 2 && (
                        <span className="text-sm text-neutral-500">Cancelled. No further actions.</span>
                    )}
                </div>
            </div>

            {panel && (
                <div className="mt-4 space-y-2 border-t border-[#e8e2df] pt-4">
                    <label className="text-sm font-semibold">
                        {panel === "reject"
                            ? "Reason for rejection (shown to the student)"
                            : "Reason for cancellation"}
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        className="w-full rounded-md border border-[#e8e2df] bg-[#faf9f8] p-3 text-sm outline-none focus:border-[#1a237e] focus:bg-white"
                        placeholder="Write the reason..."
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={closePanel} disabled={busy}>
                            Back
                        </Button>
                        <Button
                            size="sm"
                            disabled={busy || !reason.trim()}
                            onClick={onConfirmReason}
                            className="bg-[#8e1b1b] text-white hover:bg-[#751515]"
                        >
                            {acting ? "Working..." : panel === "reject" ? "Confirm Reject" : "Confirm Cancel"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}