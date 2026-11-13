import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { enrollmentApi, type EnrollmentRecordsResponse } from "@/api/enrollment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 20;

const STATUS_BADGE: Record<number, { text: string; cls: string }> = {
    0: { text: "Draft", cls: "bg-[#fff0ee] text-[#a32929]" },
    1: { text: "Submitted", cls: "bg-[#edf5ff] text-[#1767a9]" },
    2: { text: "Cancelled", cls: "bg-neutral-200 text-neutral-700" },
};

function useDebounced<T>(value: T, delay = 350) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export default function EnrollmentRecords() {
    const navigate = useNavigate();

    const [studentName, setStudentName] = useState("");
    const [enrollmentNo, setEnrollmentNo] = useState("");
    const [status, setStatus] = useState("All");
    const [page, setPage] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    const [data, setData] = useState<EnrollmentRecordsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const debouncedName = useDebounced(studentName);
    const debouncedEnrollment = useDebounced(enrollmentNo);

    useEffect(() => {
        let ignore = false; // drops out-of-order responses

        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await enrollmentApi.getRecords({
                    student_name: debouncedName.trim(),
                    enrollment_no: debouncedEnrollment.trim(),
                    status,
                    start: page * PAGE_SIZE,
                    page_length: PAGE_SIZE,
                });
                if (!ignore) setData(res.data.message);
            } catch (e: any) {
                console.error("Enrollment records error:", e);
                if (!ignore) {
                    setError(
                        e.response?.data?.exception ||
                            e.message ||
                            "Unable to load enrollment records."
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
    }, [debouncedName, debouncedEnrollment, status, page, refreshKey]);

    const total = data?.total ?? 0;
    const records = data?.records ?? [];
    const first = total ? page * PAGE_SIZE + 1 : 0;
    const last = Math.min((page + 1) * PAGE_SIZE, total);

    const openRecord = (name: string) =>
        navigate(`/admin/enrollment-records/${encodeURIComponent(name)}`);

    const summary = [
        { label: "Total Records", value: data?.counts.total },
        { label: "Draft Applications", value: data?.counts.draft },
        { label: "Submitted", value: data?.counts.submitted },
    ];

    const controlCls =
        "h-10 w-full rounded-md border border-[#e8e2df] bg-[#faf9f8] px-3 text-sm outline-none " +
        "focus-visible:border-[#1a237e] focus-visible:bg-white focus-visible:ring-0";

    return (
        <section>
            {/* Intro */}
            <div className="mb-8 max-w-2xl">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#1a237e]">
                    Admission Management
                </p>
                <h1 className="font-serif text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
                    Enrollment Records
                </h1>
                <p className="mt-3 text-base text-gray-600">
                    Review student applications and manage enrollment submissions.
                </p>
            </div>

            {/* Summary */}
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {summary.map((s) => (
                    <div
                        key={s.label}
                        className="flex flex-col gap-2 rounded-md border border-[#e8e2df] bg-white px-5 py-4"
                    >
                        <span className="text-xs text-neutral-500">{s.label}</span>
                        <strong className="font-serif text-2xl text-gray-900">
                            {s.value ?? "—"}
                        </strong>
                    </div>
                ))}
            </div>

            {/* List */}
            <div className="rounded-md border border-[#e8e2df] bg-white p-4 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="font-serif text-xl font-bold">Student Applications</h2>
                        <p className="mt-1 text-xs text-neutral-500">
                            Search and select an enrollment record to review.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setRefreshKey((k) => k + 1)}
                        disabled={loading}
                        className="text-[#1a237e]"
                    >
                        <RefreshCw className={`mr-1.5 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>

                {/* Filters */}
                <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_1fr_180px]">
                    <Input
                        className={controlCls}
                        placeholder="Search student name..."
                        value={studentName}
                        onChange={(e) => {
                            setStudentName(e.target.value);
                            setPage(0);
                        }}
                    />
                    <Input
                        className={controlCls}
                        placeholder="Search enrollment number..."
                        value={enrollmentNo}
                        onChange={(e) => {
                            setEnrollmentNo(e.target.value);
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
                        <option value="Draft">Draft</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Table */}
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[760px] border-collapse text-left">
                        <thead className="bg-[#f5f2f0]">
                            <tr>
                                {[
                                    "Student Name",
                                    "Status",
                                    "Registration No.",
                                    "Academic Year",
                                    "Enrollment Number",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="whitespace-nowrap px-3.5 py-3 text-xs font-bold text-[#55504d]"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading && !data ? (
                                <MessageRow text="Loading enrollment records..." />
                            ) : error ? (
                                <MessageRow text={error} error />
                            ) : records.length === 0 ? (
                                <MessageRow text="No enrollment records found." />
                            ) : (
                                records.map((r) => {
                                    const badge = STATUS_BADGE[r.docstatus] ?? STATUS_BADGE[0];
                                    return (
                                        <tr
                                            key={r.name}
                                            tabIndex={0}
                                            onClick={() => openRecord(r.name)}
                                            onKeyDown={(e) => e.key === "Enter" && openRecord(r.name)}
                                            className={`cursor-pointer transition hover:bg-[#f6f1ec] focus-visible:bg-[#f6f1ec] focus-visible:outline-none ${
                                                loading ? "opacity-60" : ""
                                            }`}
                                        >
                                            <td className="border-b border-[#eeeae7] px-3.5 py-4 text-sm font-bold text-gray-900">
                                                {r.name_as_per_10th || "—"}
                                            </td>
                                            <td className="border-b border-[#eeeae7] px-3.5 py-4">
                                                <span
                                                    className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold ${badge.cls}`}
                                                >
                                                    {badge.text}
                                                </span>
                                            </td>
                                            <Cell>{r.registration_no}</Cell>
                                            <Cell>{r.academic_year}</Cell>
                                            <Cell>{r.enrollment_number}</Cell>
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
                colSpan={5}
                className={`p-9 text-center text-sm ${error ? "text-red-700" : "text-neutral-500"}`}
            >
                {text}
            </td>
        </tr>
    );
}