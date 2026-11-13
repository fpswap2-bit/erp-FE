import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle2,
    ExternalLink,
    Printer,
    XCircle,
} from "lucide-react";
import {
    feePaymentApi,
    type FeePaymentDetails,
    type FeePaymentStatus,
} from "@/api/feePayment";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { exportElementToA4Pdf } from "@/lib/snapshot";

const STATUS_BADGE: Record<FeePaymentStatus, string> = {
    "Pending Verification": "bg-[#fff0ee] text-[#a32929]",
    Verified: "bg-[#edf8ef] text-[#26733b]",
    Rejected: "bg-neutral-200 text-neutral-700",
};

export default function FeePaymentReview() {
    const { name } = useParams();
    const navigate = useNavigate();

    const [payment, setPayment] = useState<FeePaymentDetails | null>(null);
    const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const printRef = useRef<HTMLDivElement>(null);
    const [printing, setPrinting] = useState(false);

    const handlePrint = async () => {
        if (!printRef.current || !payment) return;

        setPrinting(true);
        setError("");

        try {
            await exportElementToA4Pdf(
                printRef.current,
                `${payment.receipt?.name ?? payment.name}.pdf`
            );
        } catch (e) {
            console.error("Payment PDF export error:", e);
            setError("Unable to generate payment PDF.");
        } finally {
            setPrinting(false);
        }
    };

    const loadPayment = async () => {
        if (!name) return;

        setLoading(true);
        setError("");

        try {
            const result = await feePaymentApi.getPayment(name);
            setPayment(result);
            setRemarks(result.remarks || "");
        } catch (e: any) {
            console.error("Fee payment review error:", e);
            setError(
                e.response?.data?.exception ||
                    e.message ||
                    "Unable to load payment details."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayment();
    }, [name]);

    const handleVerification = async (action: "Verified" | "Rejected") => {
        if (!name) return;

        if (action === "Rejected" && !remarks.trim()) {
            setError("Please provide a reason for rejecting this payment.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            await feePaymentApi.verify(name, action, remarks.trim());
            await loadPayment();
        } catch (e: any) {
            setError(
                e.response?.data?.exception ||
                    e.message ||
                    `Unable to ${action.toLowerCase()} payment.`
            );
        } finally {
            setSaving(false);
        }
    };

    const controlCls =
        "rounded-md border border-[#e8e2df] bg-[#faf9f8] text-sm text-gray-800";

    if (loading && !payment) {
        return (
            <section className="rounded-md border border-[#e8e2df] bg-white p-9 text-center text-sm text-neutral-500">
                Loading payment details...
            </section>
        );
    }

    if (error && !payment) {
        return (
            <section>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/admin/fee-payment")}
                    className="mb-5"
                >
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Back to Fee Payments
                </Button>
                <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </p>
            </section>
        );
    }

    if (!payment) return null;

    const isPending = payment.status === "Pending Verification";

    const formatDate = (value?: string) =>
        value
            ? new Date(value).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
              })
            : "—";

    const formatAmount = (value: number) =>
        Number(value || 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        });

    return (
        <section>
            {/* Top bar (not captured in PDF) */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/admin/fee-payment")}
                    className="text-[#1a237e]"
                >
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Back to Fee Payments
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    disabled={printing}
                    className="text-[#1a237e]"
                >
                    <Printer className="mr-2 h-4 w-4" />
                    {printing ? "Generating PDF..." : "Print PDF"}
                </Button>
            </div>

            {error && (
                <p className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            {/* Printable area: everything inside this div goes into the PDF */}
            <div ref={printRef} className="bg-white p-4 sm:p-6">
                {/* Intro */}
                <div className="mb-8">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#1a237e]">
                        Accounts Management
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="font-serif text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
                                Payment Reciept
                            </h1>
                            <p className="mt-2 text-sm text-neutral-500">
                                Payment ID: {payment.name}
                            </p>
                        </div>
                        <span
                            className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${STATUS_BADGE[payment.status]}`}
                        >
                            {payment.status}
                        </span>
                    </div>
                </div>

                {/* Student and payment details */}
                <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <div className="rounded-md border border-[#e8e2df] bg-white p-5 sm:p-6">
                        <h2 className="mb-5 font-serif text-xl font-bold">
                            Student Details
                        </h2>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Detail
                                label="Student Name"
                                value={payment.student_name}
                            />
                            <Detail
                                label="Enrollment Number"
                                value={payment.enrollment_number}
                            />
                            <Detail
                                label="Enrollment Record"
                                value={payment.student}
                            />
                            <Detail label="Fee Plan" value={payment.fee_plan} />
                        </div>
                    </div>

                    <div className="rounded-md border border-[#e8e2df] bg-white p-5 sm:p-6">
                        <h2 className="mb-5 font-serif text-xl font-bold">
                            Payment Details
                        </h2>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Detail label="Semester" value={payment.semester} />
                            <Detail
                                label="Amount"
                                value={formatAmount(payment.amount)}
                                strong
                            />
                            <Detail
                                label="Transaction ID"
                                value={payment.transaction_id}
                            />
                            <Detail
                                label="Submitted On"
                                value={formatDate(payment.creation)}
                            />
                        </div>
                    </div>
                </div>

                {/* Payment screenshot */}
                <div className="mb-5 rounded-md border border-[#e8e2df] bg-white p-5 sm:p-6">
                    <h2 className="mb-4 font-serif text-xl font-bold">
                        Payment Proof
                    </h2>

                    {payment.screenshot ? (
                        <div>
                            {/* Link is hidden from the PDF */}
                            <a
                                data-no-snapshot
                                href={payment.screenshot}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-[#1a237e] hover:underline"
                            >
                                View uploaded payment screenshot
                                <ExternalLink className="h-4 w-4" />
                            </a>

                            <div className="mt-4">
                                <img
                                    src={payment.screenshot}
                                    alt="Payment proof"
                                    className="max-h-[420px] max-w-full rounded-md border border-[#e8e2df] object-contain"
                                />
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-neutral-500">
                            No payment screenshot uploaded.
                        </p>
                    )}
                </div>

                {/* Verification result (only after the payment is processed) */}
                {!isPending && (
                    <div className="rounded-md border border-[#e8e2df] bg-white p-5 sm:p-6">
                        <h2 className="mb-4 font-serif text-xl font-bold">
                            Verification
                        </h2>

                        <div className="space-y-4">
                            <Detail
                                label="Verified / Rejected By"
                                value={payment.verified_by}
                            />
                            <Detail
                                label="Admin Remarks"
                                value={payment.remarks}
                            />

                            {payment.receipt && (
                                <div className="rounded-md border border-[#e8e2df] bg-[#faf9f8] p-4">
                                    <p className="text-xs text-neutral-500">
                                        Fee Receipt Generated
                                    </p>
                                    <p className="mt-1 font-semibold text-gray-900">
                                        {payment.receipt.name}
                                    </p>
                                    <p className="mt-1 text-xs text-neutral-500">
                                        Issued on{" "}
                                        {formatDate(payment.receipt.issued_on)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Verification form (pending only, outside the printable area) */}
            {isPending && (
                <div className="mt-5 rounded-md border border-[#e8e2df] bg-white p-5 sm:p-6">
                    <h2 className="mb-2 font-serif text-xl font-bold">
                        Verification
                    </h2>

                    <p className="mb-5 text-sm text-neutral-500">
                        Verify the transaction or reject it with a reason.
                    </p>

                    <label className="mb-2 block text-sm font-semibold text-gray-800">
                        Admin Remarks
                        <span className="ml-1 font-normal text-neutral-500">
                            (required for rejection)
                        </span>
                    </label>

                    <Textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Enter remarks or rejection reason..."
                        rows={3}
                        className={`mb-5 ${controlCls}`}
                    />

                    <div className="flex flex-wrap gap-3">
                        <Button
                            type="button"
                            disabled={saving}
                            onClick={() => handleVerification("Verified")}
                            className="bg-[#26733b] text-white hover:bg-[#1f6030]"
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Verify Payment
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            disabled={saving}
                            onClick={() => handleVerification("Rejected")}
                            className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject Payment
                        </Button>
                    </div>
                </div>
            )}
        </section>
    );
}

function Detail({
    label,
    value,
    strong,
}: {
    label: string;
    value?: string | number | null;
    strong?: boolean;
}) {
    return (
        <div className="min-w-0">
            <p className="mb-1 text-xs text-neutral-500">{label}</p>
            <p
                className={`break-words text-sm ${
                    strong
                        ? "font-bold text-gray-900"
                        : "font-medium text-[#55504d]"
                }`}
            >
                {value || "—"}
            </p>
        </div>
    );
}