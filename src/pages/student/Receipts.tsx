
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { feeReceiptApi, type FeeReceipt } from "@/api/feeReceipt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 20;

function useDebounced<T>(value: T, delay = 350) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}

function formatAmount(value: number) {
    return Number(value || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    });
}

export default function Receipts() {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    const [data, setData] = useState<{
        records: FeeReceipt[];
        total: number;
    } | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const debouncedSearch = useDebounced(search);

    useEffect(() => {
        let ignore = false;

        const load = async () => {
            setLoading(true);
            setError("");

            try {
                const result = await feeReceiptApi.getRecords({
                    search: debouncedSearch.trim(),
                    start: page * PAGE_SIZE,
                    page_length: PAGE_SIZE,
                });

                if (!ignore) setData(result);
            } catch (e: any) {
                console.error("Fee receipts error:", e);

                if (!ignore) {
                    setError(
                        e.response?.data?.exception ||
                            e.message ||
                            "Unable to load your receipts."
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
    }, [debouncedSearch, page, refreshKey]);

    const records = data?.records ?? [];
    const total = data?.total ?? 0;
    const first = total ? page * PAGE_SIZE + 1 : 0;
    const last = Math.min((page + 1) * PAGE_SIZE, total);

    const controlCls =
        "h-10 w-full rounded-md border border-[#e8e2df] bg-[#faf9f8] px-3 text-sm outline-none " +
        "focus-visible:border-[#1a237e] focus-visible:bg-white focus-visible:ring-0";

    const openReceipt = (name: string) => navigate(`/student/receipts/${encodeURIComponent(name)}`);
    return (
        <section>
            {/* Intro */}
            <div className="mb-8 max-w-2xl">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#1a237e]">
                    Student Portal
                </p>
                <h1 className="font-serif text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
                    Fee Receipts
                </h1>
                <p className="mt-3 text-base text-gray-600">
                    View and download receipts for your verified fee payments.
                </p>
            </div>

            {/* Summary */}
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-2 rounded-md border border-[#e8e2df] bg-white px-5 py-4">
                    <span className="text-xs text-neutral-500">
                        Total Receipts
                    </span>
                    <strong className="font-serif text-2xl text-gray-900">
                        {data ? total : "—"}
                    </strong>
                </div>

                <div className="flex flex-col gap-2 rounded-md border border-[#e8e2df] bg-white px-5 py-4">
                    <span className="text-xs text-neutral-500">
                        Records Per Page
                    </span>
                    <strong className="font-serif text-2xl text-gray-900">
                        {PAGE_SIZE}
                    </strong>
                </div>
            </div>

            {/* List */}
            <div className="rounded-md border border-[#e8e2df] bg-white p-4 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="font-serif text-xl font-bold">
                            Your Payment Receipts
                        </h2>
                        <p className="mt-1 text-xs text-neutral-500">
                            Select a receipt to view or print it.
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

                {/* Search */}
                <div className="mb-4">
                    <Input
                        className={controlCls}
                        placeholder="Search receipt number, payment ID or transaction ID..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(0);
                        }}
                    />
                </div>

                {/* Table */}
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[760px] border-collapse text-left">
                        <thead className="bg-[#f5f2f0]">
                            <tr>
                                {[
                                    "Receipt No.",
                                    "Semester",
                                    "Amount",
                                    "Transaction ID",
                                    "Issued On",
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
                            {loading && !data ? (
                                <MessageRow text="Loading your receipts..." />
                            ) : error ? (
                                <MessageRow text={error} error />
                            ) : records.length === 0 ? (
                                <MessageRow text="No fee receipts found." />
                            ) : (
                                records.map((record) => (
                                    <tr
                                        key={record.name}
                                        tabIndex={0}
                                        onClick={() => openReceipt(record.name)}
                                        onKeyDown={(e) =>
                                            e.key === "Enter" &&
                                            openReceipt(record.name)
                                        }
                                        className="cursor-pointer transition hover:bg-[#f6f1ec] focus-visible:bg-[#f6f1ec] focus-visible:outline-none"
                                    >
                                        <td className="border-b border-[#eeeae7] px-3.5 py-4 text-sm font-bold text-gray-900">
                                            {record.name}
                                        </td>
                                        <Cell>{record.semester}</Cell>
                                        <Cell>{formatAmount(record.amount)}</Cell>
                                        <Cell>{record.transaction_id}</Cell>
                                        <Cell>
                                            {record.issued_on
                                                ? new Date(
                                                      record.issued_on
                                                  ).toLocaleDateString("en-IN")
                                                : "—"}
                                        </Cell>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-5 flex flex-col gap-3 border-t border-[#e8e2df] pt-4 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                        Showing {first}–{last} of {total} receipts
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
                colSpan={5}
                className={`p-9 text-center text-sm ${
                    error ? "text-red-700" : "text-neutral-500"
                }`}
            >
                {text}
            </td>
        </tr>
    );
}
