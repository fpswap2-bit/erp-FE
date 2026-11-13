
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import {
    feePaymentApi,
    type FeePayment,
    type FeePaymentStatus,
} from "@/api/feePayment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 20;

const STATUS_BADGE: Record<FeePaymentStatus, { text: string; cls: string }> = {
    "Pending Verification": {
        text: "Pending Verification",
        cls: "bg-[#fff0ee] text-[#a32929]",
    },
    Verified: {
        text: "Verified",
        cls: "bg-[#edf8ef] text-[#26733b]",
    },
    Rejected: {
        text: "Rejected",
        cls: "bg-neutral-200 text-neutral-700",
    },
};

function useDebounced<T>(value: T, delay = 350) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}

export default function FeePaymentRecords() {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [page, setPage] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    const [records, setRecords] = useState<FeePayment[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const debouncedSearch = useDebounced(search);

    useEffect(() => {
        let ignore = false;

        const load = async () => {
            setLoading(true);
            setError("");

            try {
                const res = await feePaymentApi.getRecords({
                    search: debouncedSearch.trim(),
                    status,
                    start: page * PAGE_SIZE,
                    page_length: PAGE_SIZE,
                });

                if (!ignore) {
                    setRecords(res.records);
                    setTotal(res.total);
                }
            } catch (e: any) {
                console.error("Fee payment records error:", e);
                if (!ignore) {
                    setError(
                        e.response?.data?.exception ||
                            e.message ||
                            "Unable to load fee payment records."
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
    }, [debouncedSearch, status, page, refreshKey]);

    const first = total ? page * PAGE_SIZE + 1 : 0;
    const last = Math.min((page + 1) * PAGE_SIZE, total);

    const openRecord = (name: string) =>
        navigate(`/admin/fee-payment/${encodeURIComponent(name)}`);

    const controlCls =
        "h-10 w-full rounded-md border border-[#e8e2df] bg-[#faf9f8] px-3 text-sm outline-none " +
        "focus-visible:border-[#1a237e] focus-visible:bg-white focus-visible:ring-0";

    return (
        <section>
            {/* Intro */}
            <div className="mb-8 max-w-2xl">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#1a237e]">
                    Accounts Management
                </p>
                <h1 className="font-serif text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
                    Fee Payments
                </h1>
                <p className="mt-3 text-base text-gray-600">
                    Review student payment submissions and verify transactions.
                </p>
            </div>

            {/* Summary */}
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                    { label: "Total Records", value: total },
                    {
                        label: "Current Filter",
                        value: status === "All" ? "All Statuses" : status,
                    },
                    { label: "Records Per Page", value: PAGE_SIZE },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="flex flex-col gap-2 rounded-md border border-[#e8e2df] bg-white px-5 py-4"
                    >
                        <span className="text-xs text-neutral-500">
                            {item.label}
                        </span>
                        <strong className="font-serif text-2xl text-gray-900">
                            {item.value}
                        </strong>
                    </div>
                ))}
            </div>

            {/* List */}
            <div className="rounded-md border border-[#e8e2df] bg-white p-4 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="font-serif text-xl font-bold">
                            Student Payment Records
                        </h2>
                        <p className="mt-1 text-xs text-neutral-500">
                            Search and select a payment record to review.
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setRefreshKey((key) => key + 1)}
                        disabled={loading}
                        className="text-[#1a237e]"
                    >
                        <RefreshCw
                            className={`mr-1.5 h-4 w-4 ${
                                loading ? "animate-spin" : ""
                            }`}
                        />
                        Refresh
                    </Button>
                </div>

                {/* Filters */}
                <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_200px]">
                    <Input
                        className={controlCls}
                        placeholder="Search student, enrollment no. or transaction ID..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(0);
                        }}
                    />

                    <select
                        className={controlCls}
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(0);
                        }}
                    >
                        <option value="All">All statuses</option>
                        <option value="Pending Verification">
                            Pending Verification
                        </option>
                        <option value="Verified">Verified</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>

                {/* Table */}
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[850px] border-collapse text-left">
                        <thead className="bg-[#f5f2f0]">
                            <tr>
                                {[
                                    "Student Name",
                                    "Status",
                                    "Enrollment No.",
                                    "Semester",
                                    "Amount",
                                    "Transaction ID",
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className="whitespace-nowrap px-3.5 py-3 text-xs font-bold text-[#55504d]"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {loading && records.length === 0 ? (
                                <MessageRow text="Loading fee payment records..." />
                            ) : error ? (
                                <MessageRow text={error} error />
                            ) : records.length === 0 ? (
                                <MessageRow text="No fee payment records found." />
                            ) : (
                                records.map((record) => {
                                    const badge = STATUS_BADGE[record.status];

                                    return (
                                        <tr
                                            key={record.name}
                                            tabIndex={0}
                                            onClick={() => openRecord(record.name)}
                                            onKeyDown={(e) =>
                                                e.key === "Enter" &&
                                                openRecord(record.name)
                                            }
                                            className={`cursor-pointer transition hover:bg-[#f6f1ec] focus-visible:bg-[#f6f1ec] focus-visible:outline-none ${
                                                loading ? "opacity-60" : ""
                                            }`}
                                        >
                                            <td className="border-b border-[#eeeae7] px-3.5 py-4 text-sm font-bold text-gray-900">
                                                {record.student_name || "—"}
                                            </td>
                                            <td className="border-b border-[#eeeae7] px-3.5 py-4">
                                                <span
                                                    className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold ${badge.cls}`}
                                                >
                                                    {badge.text}
                                                </span>
                                            </td>
                                            <Cell>{record.enrollment_number}</Cell>
                                            <Cell>{record.semester}</Cell>
                                            <Cell>
                                                {Number(record.amount || 0).toLocaleString(
                                                    "en-IN",
                                                    {
                                                        style: "currency",
                                                        currency: "INR",
                                                        maximumFractionDigits: 2,
                                                    }
                                                )}
                                            </Cell>
                                            <Cell>{record.transaction_id}</Cell>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-5 flex flex-col gap-3 border-t border-[#e8e2df] pt-4 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                        Showing {first}–{last} of {total} records
                    </span>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={page === 0 || loading}
                            onClick={() => setPage((p) => Math.max(p - 1, 0))}
                        >
                            Previous
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={last >= total || loading}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Cell({ children }: { children: React.ReactNode }) {
    return (
        <td className="border-b border-[#eeeae7] px-3.5 py-4 text-sm text-[#55504d]">
            {children || "—"}
        </td>
    );
}

function MessageRow({ text, error }: { text: string; error?: boolean }) {
    return (
        <tr>
            <td
                colSpan={6}
                className={`p-9 text-center text-sm ${
                    error ? "text-red-700" : "text-neutral-500"
                }`}
            >
                {text}
            </td>
        </tr>
    );
}
