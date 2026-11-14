
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { feeReceiptApi, type FeeReceiptDetails } from "@/api/feeReceipt";
import { Button } from "@/components/ui/button";
import { exportElementToA4Pdf } from "@/lib/snapshot";

function formatAmount(value: number) {
    return Number(value || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    });
}

function formatDate(value?: string | null) {
    return value
        ? new Date(value).toLocaleString("en-IN", {
              dateStyle: "long",
              timeStyle: "short",
          })
        : "—";
}

export default function ReceiptDetail() {
    const { name } = useParams();
    const navigate = useNavigate();

    const receiptRef = useRef<HTMLDivElement>(null);

    const [receipt, setReceipt] = useState<FeeReceiptDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [printing, setPrinting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let ignore = false;

        const load = async () => {
            if (!name) {
                setError("Receipt ID is missing.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");

            try {
                const result = await feeReceiptApi.getReceipt(name);
                if (!ignore) setReceipt(result);
            } catch (e: any) {
                console.error("Receipt detail error:", e);

                if (!ignore) {
                    setError(
                        e.response?.data?.exception ||
                            e.message ||
                            "Unable to load receipt."
                    );
                }
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        load();

        return () => {
            ignore = true;
        };
    }, [name]);

    const handlePrint = async () => {
        if (!receiptRef.current || !receipt) return;

        setPrinting(true);

        try {
            await exportElementToA4Pdf(
                receiptRef.current,
                `${receipt.name}.pdf`
            );
        } catch (e) {
            console.error("Receipt PDF export error:", e);
            setError("Unable to generate receipt PDF.");
        } finally {
            setPrinting(false);
        }
    };

    if (loading) {
        return (
            <section className="rounded-md border border-[#e8e2df] bg-white p-9 text-center text-sm text-neutral-500">
                Loading receipt...
            </section>
        );
    }

    if (error && !receipt) {
        return (
            <section>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/receipts")}
                    className="mb-5"
                >
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Back to Receipts
                </Button>

                <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </p>
            </section>
        );
    }

    if (!receipt) return null;

    return (
        <section>
            {/* Page header */}
            <div className="mb-8">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/receipts")}
                    className="mb-5 text-[#1a237e]"
                >
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Back to Receipts
                </Button>

                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#1a237e]">
                    Student Portal
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-serif text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
                            Fee Receipt
                        </h1>
                        <p className="mt-2 text-sm text-neutral-500">
                            Receipt No. {receipt.name}
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <p className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </p>
            )}
                    <Button
                        variant="outline"
                        onClick={handlePrint}
                        className="hover:bg-gray-200 mb-10"
                        disabled={printing}
                    >
                        <Printer className="mr-2 h-4 w-4                 " />
                        {printing ? "Generating PDF..." : "Print Receipt"}
                    </Button>

            {/* Printable receipt */}
            <div
                ref={receiptRef}
                className="border border-[#e8e2df] bg-white p-3 sm:p-10"
            >
                {/* Receipt header */}
                <div className="relative border-b-2 border-[#8e1b1b] px-16 pb-6 text-center">
                    <img
                        src="/logo.svg"
                        alt="Surabhi Institute"
                        className="absolute left-0 top-0 h-24 w-40 object-contain"
                    />

                    <img
                        src="/rgpv.webp"
                        alt="RGPV"
                        className="absolute right-0 top-0 h-16 w-16 object-contain"
                    />

                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8e1b1b]">
                        Surabhi Group of Institutions
                    </p>

                    <h2 className="mt-2 font-serif text-3xl font-bold text-gray-900">
                        Payment Receipt
                    </h2>

                    <p className="mt-2 text-sm text-neutral-500">
                        Acknowledgement of fee payment
                    </p>
                </div>

                {/* Receipt metadata */}
                <div className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ReceiptField label="Receipt Number" value={receipt.name} />
                    <ReceiptField
                        label="Date of Issue"
                        value={formatDate(receipt.issued_on)}
                    />
                </div>

                {/* Student information */}
                <div className="mb-6">
                    <SectionHeading>Student Information</SectionHeading>

                    <div className="grid grid-cols-1 gap-5 border-b border-[#eeeae7] py-5 sm:grid-cols-2">
                        <ReceiptField
                            label="Student Name"
                            value={receipt.student_name}
                        />
                        <ReceiptField
                            label="Enrollment Number"
                            value={receipt.enrollment_number}
                        />
                        <ReceiptField
                            label="Academic Year"
                            value={receipt.academic_year}
                        />
                        <ReceiptField
                            label="Branch"
                            value={receipt.branch}
                        />
                    </div>
                </div>

                {/* Payment information */}
                <div className="mb-6">
                    <SectionHeading>Payment Information</SectionHeading>

                    <div className="grid grid-cols-1 gap-5 border-b border-[#eeeae7] py-5 sm:grid-cols-2">
                        <ReceiptField
                            label="Payment ID"
                            value={receipt.payment}
                        />
                        <ReceiptField
                            label="Semester"
                            value={receipt.semester}
                        />
                        <ReceiptField
                            label="Transaction ID / Reference No."
                            value={receipt.transaction_id}
                        />
                        <ReceiptField
                            label="Issued By"
                            value={receipt.issued_by}
                        />
                    </div>
                </div>

                {/* Amount */}
                <div className="mb-8 rounded-md border border-[#e8e2df] bg-[#faf9f8] p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Amount Received
                    </p>
                    <p className="mt-2 font-serif text-3xl font-bold text-[#8e1b1b]">
                        {formatAmount(receipt.amount)}
                    </p>
                </div>

                {/* Screenshot */}
                {receipt.payment_screenshot && (
                    <div className="mb-8">
                        <SectionHeading>Payment Proof</SectionHeading>
                        <img
                            src={receipt.payment_screenshot}
                            alt="Payment proof"
                            className="mt-4 max-h-[320px] max-w-full rounded-md border border-[#e8e2df] object-contain"
                        />
                    </div>
                )}

                {/* Footer */}
                <div className="border-t border-[#e8e2df] pt-5 text-center">
                    <p className="font-serif text-base font-bold text-gray-900">
                        Thank you
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                        This is a system-generated receipt and does not require
                        a physical signature.
                    </p>
                    <p className="mt-3 text-[10px] text-neutral-400">
                        {receipt.name}
                    </p>
                </div>
            </div>
        </section>
    );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <h3 className="border-b border-[#e8e2df] pb-2 text-xs font-bold uppercase tracking-wider text-[#8e1b1b]">
            {children}
        </h3>
    );
}

function ReceiptField({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) {
    return (
        <div className="min-w-0">
            <p className="mb-1 text-xs text-neutral-500">{label}</p>
            <p className="wrap-break-word text-sm font-semibold text-gray-900">
                {value || "—"}
            </p>
        </div>
    );
}
