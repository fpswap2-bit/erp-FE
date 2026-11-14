import { useEffect, useMemo, useState } from "react";
import {
    CheckCircle2,
    Clock,
    CreditCard,
    Upload,
    QrCode,
} from "lucide-react";
import {
    studentFeePaymentApi,
    type StudentPaymentContext,
    type StudentPaymentSettings,
} from "@/api/studentFeePayment";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

function formatAmount(value: number) {
    return Number(value || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    });
}

export default function PayFees() {
    const [context, setContext] = useState<StudentPaymentContext | null>(null);
    const [settings, setSettings] = useState<StudentPaymentSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [semester, setSemester] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);

    const loadPage = async () => {
        setLoading(true);
        setError("");

        try {
            const [paymentContext, paymentSettings] = await Promise.all([
                studentFeePaymentApi.getContext(),
                studentFeePaymentApi.getSettings(),
            ]);

            setContext(paymentContext);
            setSettings(paymentSettings);
        } catch (e: any) {
            setError(
                e.response?.data?.message ||
                    e.message ||
                    "Unable to load payment details.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPage();
    }, []);

    const selectedItem = useMemo(
        () =>
            context?.fee_plan.items.find(
                (item) => item.semester === semester,
            ),
        [context, semester],
    );

    const availableItems =
        context?.fee_plan.items.filter(
            (item) => !item.status || item.status === "Rejected",
        ) ?? [];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files?.[0] || null;
        setError("");

        if (picked) {
            if (!ALLOWED_TYPES.includes(picked.type)) {
                setError("Only JPG, PNG or PDF files are allowed.");
                setFile(null);
                e.target.value = "";
                return;
            }
            if (picked.size > MAX_SIZE_MB * 1024 * 1024) {
                setError(`File must be smaller than ${MAX_SIZE_MB} MB.`);
                setFile(null);
                e.target.value = "";
                return;
            }
        }

        setFile(picked);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!semester || !selectedItem) {
            setError("Please select a semester.");
            return;
        }

        if (!transactionId.trim()) {
            setError("Please enter the transaction reference number.");
            return;
        }

        if (!file) {
            setError("Please attach your payment screenshot.");
            return;
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            setError("Only JPG, PNG or PDF files are allowed.");
            return;
        }

        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`File must be smaller than ${MAX_SIZE_MB} MB.`);
            return;
        }

        setSubmitting(true);
        setUploadProgress(0);

        try {
            const uploadRes = await studentFeePaymentApi.uploadScreenshot(
                file,
                (percent) => setUploadProgress(percent),
            );
            const fileUrl: string | undefined =
                uploadRes.data?.message?.file_url;

            if (!fileUrl) {
                throw new Error("Screenshot upload failed. Please try again.");
            }

            const payment = await studentFeePaymentApi.createPayment({
                fee_plan: context!.fee_plan.name,
                semester,
                transaction_id: transactionId.trim(),
                screenshot: fileUrl,
            });

            setSuccess(
                `Payment ${payment.name} has been submitted for verification.`,
            );

            setTransactionId("");
            setSemester("");
            setFile(null);

            await loadPage();
        } catch (e: any) {
            setError(
                e.response?.data?.exception ||
                    e.response?.data?.message ||
                    e.message ||
                    "Unable to submit payment.",
            );
        } finally {
            setSubmitting(false);
            setUploadProgress(0);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-sm text-neutral-500">
                Loading payment details...
            </div>
        );
    }

    if (!context) {
        return (
            <section className="rounded-md border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                {error || "Payment details are unavailable."}
            </section>
        );
    }

    return (
        <section>
            <div className="mb-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#1a237e]">
                    Student Portal
                </p>

                <h1 className="font-serif text-3xl font-bold text-gray-900 sm:text-4xl">
                    Pay Fees
                </h1>

                <p className="mt-2 text-sm text-neutral-500">
                    Make your semester fee payment and submit the transaction
                    details for verification.
                </p>
            </div>

            {error && (
                <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-5 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {success}
                </div>
            )}

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                {/* Payment window */}
                <div className="rounded-xl border border-[#e8e2df] bg-white p-5 sm:p-7">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-lg bg-[#f5f2f0] p-2.5 text-[#8e1b1b]">
                            <CreditCard className="h-5 w-5" />
                        </div>

                        <div>
                            <h2 className="font-serif text-xl font-bold text-gray-900">
                                Payment Details
                            </h2>
                            <p className="text-xs text-neutral-500">
                                Your enrollment information is preloaded.
                            </p>
                        </div>
                    </div>

                    {/* Student details */}
                    <div className="mb-7 grid grid-cols-1 gap-4 rounded-lg bg-[#faf9f8] p-4 sm:grid-cols-2">
                        <ReadOnlyField
                            label="Student Name"
                            value={context.student.name_as_per_10th}
                        />

                        <ReadOnlyField
                            label="Enrollment Number"
                            value={context.student.enrollment_number}
                        />

                        <ReadOnlyField
                            label="Academic Year"
                            value={context.student.academic_year}
                        />

                        <ReadOnlyField
                            label="Branch"
                            value={context.student.branch}
                        />

                        <ReadOnlyField
                            label="Fee Plan"
                            value={context.fee_plan.name}
                        />

                        <ReadOnlyField
                            label="Study Year"
                            value={`Year ${context.fee_plan.study_year}`}
                        />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-800">
                                Select Semester
                            </label>

                            <select
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                                required
                                disabled={submitting}
                                className="w-full rounded-md border border-[#d8d2ce] bg-white px-3 py-3 text-sm outline-none focus:border-[#8e1b1b]"
                            >
                                <option value="">Choose semester</option>

                                {context.fee_plan.items.map((item) => (
                                    <option
                                        key={item.semester}
                                        value={item.semester}
                                        disabled={
                                            item.status ===
                                                "Pending Verification" ||
                                            item.status === "Verified"
                                        }
                                    >
                                        Semester {item.semester} —{" "}
                                        {formatAmount(item.amount)}
                                        {item.status
                                            ? ` (${item.status})`
                                            : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedItem && (
                            <div className="rounded-lg border border-[#e8e2df] bg-[#faf9f8] p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                    Amount Payable
                                </p>

                                <p className="mt-1 font-serif text-3xl font-bold text-[#8e1b1b]">
                                    {formatAmount(selectedItem.amount)}
                                </p>

                                <p className="mt-1 text-xs text-neutral-500">
                                    {selectedItem.period ||
                                        `Semester ${semester}`}
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-800">
                                Transaction ID / Reference Number
                            </label>

                            <input
                                value={transactionId}
                                onChange={(e) =>
                                    setTransactionId(e.target.value)
                                }
                                placeholder="Enter UTR / transaction reference"
                                required
                                disabled={submitting}
                                className="w-full rounded-md border border-[#d8d2ce] px-3 py-3 text-sm outline-none focus:border-[#8e1b1b]"
                            />
                        </div>

                        {/* Screenshot upload */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-800">
                                Payment Screenshot
                            </label>

                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#d8d2ce] bg-[#faf9f8] px-5 py-7 text-center hover:border-[#8e1b1b]">
                                <Upload className="mb-2 h-6 w-6 text-neutral-500" />

                                <span className="text-sm font-semibold text-gray-800">
                                    {file
                                        ? file.name
                                        : "Choose payment screenshot"}
                                </span>

                                <span className="mt-1 text-xs text-neutral-500">
                                    JPG, PNG or PDF, up to {MAX_SIZE_MB} MB
                                </span>

                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    className="hidden"
                                    disabled={submitting}
                                    onChange={handleFileChange}
                                />
                            </label>

                            {submitting && uploadProgress > 0 && (
                                <div className="mt-3">
                                    <div className="mb-1 flex justify-between text-xs text-neutral-500">
                                        <span>Uploading screenshot</span>
                                        <span>{uploadProgress}%</span>
                                    </div>

                                    <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
                                        <div
                                            className="h-full rounded-full bg-[#8e1b1b] transition-all"
                                            style={{
                                                width: `${uploadProgress}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || availableItems.length === 0}
                            className="w-full rounded-md bg-[#8e1b1b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#741515] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting
                                ? uploadProgress > 0 && uploadProgress < 100
                                    ? `Uploading... ${uploadProgress}%`
                                    : "Submitting..."
                                : "Submit for Verification"}
                        </button>
                    </form>

                    <div className="mt-5 flex items-start gap-2 border-t border-[#eeeae7] pt-4 text-xs leading-5 text-neutral-500">
                        <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                        Your payment will remain pending until verified by the
                        accounts office.
                    </div>
                </div>

                {/* Bank details panel */}
                <aside className="rounded-xl border border-[#e8e2df] bg-white p-5">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-lg bg-[#f5f2f0] p-2.5 text-[#8e1b1b]">
                            <QrCode className="h-5 w-5" />
                        </div>

                        <div>
                            <h2 className="font-serif text-lg font-bold text-gray-900">
                                Bank Payment
                            </h2>
                            <p className="text-xs text-neutral-500">
                                Scan to make your payment
                            </p>
                        </div>
                    </div>

                    {settings?.qr_image ? (
                        <div className="mb-5 flex justify-center rounded-lg border border-[#eeeae7] bg-white p-3">
                            <img
                                src={settings.qr_image}
                                alt="Bank payment QR code"
                                className="max-h-56 w-full object-contain"
                            />
                        </div>
                    ) : (
                        <div className="mb-5 rounded-lg bg-[#faf9f8] p-6 text-center text-xs text-neutral-500">
                            QR code has not been configured.
                        </div>
                    )}

                    {settings?.bank_details && (
                        <div className="mb-5">
                            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8e1b1b]">
                                Bank Details
                            </h3>

                            <p className="whitespace-pre-wrap rounded-lg bg-[#faf9f8] p-3 text-sm leading-6 text-gray-700">
                                {settings.bank_details}
                            </p>
                        </div>
                    )}

                    {settings?.whatsapp_number && (
                        <div className="border-t border-[#eeeae7] pt-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                Send Payment Screenshot
                            </p>

                            <p className="mt-2 text-sm font-semibold text-gray-900">
                                {settings.whatsapp_number}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                                You must still upload the screenshot and
                                submit the form here.
                            </p>
                        </div>
                    )}
                </aside>
            </div>
        </section>
    );
}

function ReadOnlyField({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) {
    return (
        <div className="min-w-0">
            <p className="mb-1 text-xs text-neutral-500">{label}</p>
            <p className="break-words text-sm font-semibold text-gray-900">
                {value || "—"}
            </p>
        </div>
    );
}