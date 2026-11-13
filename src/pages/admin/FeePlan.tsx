
import { useCallback, useEffect, useState } from "react";
import { Search, RefreshCw, X, Save, ChevronLeft, ChevronRight } from "lucide-react";
import {
    getFeePlans,
    getFeePlan,
    updateFeePlan,
    type FeePlan,
    type FeePlanDetails,
    type FeePlanItem,
} from "../../api/feePlan";

const PAGE_SIZE = 20;

const currency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value || 0);

export default function FeePlan() {
    const [plans, setPlans] = useState<FeePlan[]>([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [academicYear, setAcademicYear] = useState("");
    const [branch, setBranch] = useState("");
    const [studyYear, setStudyYear] = useState("");
    const [page, setPage] = useState(0);

    const [selected, setSelected] = useState<FeePlanDetails | null>(null);
    const [items, setItems] = useState<FeePlanItem[]>([]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const loadPlans = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const result = await getFeePlans({
                search: search.trim() || undefined,
                academic_year: academicYear || undefined,
                branch: branch.trim() || undefined,
                study_year: studyYear || undefined,
                start: page * PAGE_SIZE,
                page_length: PAGE_SIZE,
            });

            setPlans(result.records);
            setTotal(result.total);
        } catch (err: any) {
            setError(err.response?.data?.message || "Unable to load fee plans.");
        } finally {
            setLoading(false);
        }
    }, [search, academicYear, branch, studyYear, page]);

    useEffect(() => {
        loadPlans();
    }, [loadPlans]);

    const openPlan = async (name: string) => {
        setError("");

        try {
            const result = await getFeePlan(name);
            setSelected(result);
            setItems(result.items.map(item => ({ ...item })));
        } catch (err: any) {
            setError(err.response?.data?.message || "Unable to load fee plan.");
        }
    };

    const updateItem = (
        index: number,
        field: "amount" | "override_reason",
        value: string
    ) => {
        setItems(current =>
            current.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        [field]: field === "amount" ? Number(value) : value,
                    }
                    : item
            )
        );
    };

    const totalAmount = items.reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0
    );

    const savePlan = async () => {
        if (!selected) return;

        
        setSaving(true);
        setError("");

        try {
            await updateFeePlan(
                selected.name,
                items.map(({ name, amount, override_reason }) => ({
                    name,
                    amount,
                    override_reason,
                }))
            );

            const refreshed = await getFeePlan(selected.name);
            setSelected(refreshed);
            setItems(refreshed.items.map(item => ({ ...item })));
            await loadPlans();
        } catch (err: any) {
            setError(err.response?.data?.message || "Unable to save fee plan.");
        } finally {
            setSaving(false);
        }
    };

    const resetFilters = () => {
        setSearch("");
        setAcademicYear("");
        setBranch("");
        setStudyYear("");
        setPage(0);
    };

    return (
        <div className="space-y-6 text-neutral-800">
            <div>
                <h1 className="text-2xl font-semibold">Fee Plans</h1>
                <p className="mt-1 text-sm text-neutral-500">
                    Review student fee plans and manage semester fee overrides.
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="grid gap-3 md:grid-cols-4">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                        <input
                            value={search}
                            onChange={e => {
                                setSearch(e.target.value);
                                setPage(0);
                            }}
                            placeholder="Search student or enrollment number"
                            className="w-full rounded-lg border border-neutral-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#8e1b1b]"
                        />
                    </div>

                    <input
                        value={academicYear}
                        onChange={e => {
                            setAcademicYear(e.target.value);
                            setPage(0);
                        }}
                        placeholder="Academic Year"
                        className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#8e1b1b]"
                    />

                    <input
                        value={branch}
                        onChange={e => {
                            setBranch(e.target.value);
                            setPage(0);
                        }}
                        placeholder="Branch"
                        className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#8e1b1b]"
                    />

                    <select
                        value={studyYear}
                        onChange={e => {
                            setStudyYear(e.target.value);
                            setPage(0);
                        }}
                        className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#8e1b1b]"
                    >
                        <option value="">All Study Years</option>
                        {[1, 2, 3, 4].map(year => (
                            <option key={year} value={String(year)}>
                                Year {year}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={resetFilters}
                        className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
                    >
                        <RefreshCw size={15} /> Reset filters
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
                    <h2 className="font-semibold">Student Fee Plans</h2>
                    <span className="text-sm text-neutral-500">
                        {total} records
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
                            <tr>
                                <th className="px-5 py-3">Student</th>
                                <th className="px-5 py-3">Enrollment No.</th>
                                <th className="px-5 py-3">Academic Year</th>
                                <th className="px-5 py-3">Branch</th>
                                <th className="px-5 py-3">Study Year</th>
                                <th className="px-5 py-3 text-right">Total</th>
                                <th className="px-5 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-10 text-center text-neutral-500">
                                        Loading fee plans...
                                    </td>
                                </tr>
                            ) : plans.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-10 text-center text-neutral-500">
                                        No fee plans found.
                                    </td>
                                </tr>
                            ) : plans.map(plan => (
                                <tr key={plan.name} className="hover:bg-neutral-50">
                                    <td className="px-5 py-4 font-medium">
                                        {plan.student_name || plan.student}
                                    </td>
                                    <td className="px-5 py-4 text-neutral-600">
                                        {plan.enrollment_number || "—"}
                                    </td>
                                    <td className="px-5 py-4">{plan.academic_year}</td>
                                    <td className="px-5 py-4">{plan.branch}</td>
                                    <td className="px-5 py-4">Year {plan.study_year}</td>
                                    <td className="px-5 py-4 text-right font-medium">
                                        {currency(plan.total_amount)}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <button
                                            onClick={() => openPlan(plan.name)}
                                            className="font-medium text-[#8e1b1b] hover:underline"
                                        >
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3">
                    <span className="text-xs text-neutral-500">
                        Showing {total ? page * PAGE_SIZE + 1 : 0}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 0 || loading}
                            onClick={() => setPage(p => p - 1)}
                            className="rounded-lg border p-2 disabled:opacity-30"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            disabled={(page + 1) * PAGE_SIZE >= total || loading}
                            onClick={() => setPage(p => p + 1)}
                            className="rounded-lg border p-2 disabled:opacity-30"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {selected && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
                    <div className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b px-6 py-5">
                            <div>
                                <h2 className="text-lg font-semibold">Manage Fee Plan</h2>
                                <p className="mt-1 text-xs text-neutral-500">{selected.name}</p>
                            </div>
                            <button
                                onClick={() => setSelected(null)}
                                className="rounded-lg p-2 hover:bg-neutral-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 space-y-6 p-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-neutral-500">Student</p>
                                    <p className="mt-1 font-medium">{selected.student}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500">Academic Year</p>
                                    <p className="mt-1 font-medium">{selected.academic_year}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500">Branch</p>
                                    <p className="mt-1 font-medium">{selected.branch}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500">Fee Structure</p>
                                    <p className="mt-1 font-medium">{selected.fee_structure}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold">Semester Breakdown</h3>

                                {items.map((item, index) => (
                                    <div key={item.name} className="space-y-3 rounded-xl border border-neutral-200 p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Semester {item.semester_no}</p>
                                                <p className="text-xs text-neutral-500">{item.period}</p>
                                            </div>
                                            {item.overridden ? (
                                                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-700">
                                                    Overridden
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600">
                                                    Default
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="mb-1 text-xs text-neutral-500">Default amount</p>
                                                <p className="font-medium">{currency(item.default_amount)}</p>
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs text-neutral-500">
                                                    Current amount (₹)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.amount}
                                                    onChange={e => updateItem(index, "amount", e.target.value)}
                                                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:border-[#8e1b1b]"
                                                />
                                            </div>
                                        </div>

                                        {Number(item.amount) !== Number(item.default_amount) && (
                                            <div>
                                                <label className="mb-1 block text-xs text-neutral-500">
                                                    Override reason *
                                                </label>
                                                <textarea
                                                    value={item.override_reason || ""}
                                                    onChange={e => updateItem(index, "override_reason", e.target.value)}
                                                    rows={2}
                                                    placeholder="Explain why this amount is different..."
                                                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[#8e1b1b]"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-4">
                                <span className="text-sm font-medium">Total Fee</span>
                                <span className="text-xl font-semibold">{currency(totalAmount)}</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t px-6 py-4">
                            <button
                                onClick={() => setSelected(null)}
                                className="rounded-lg border px-4 py-2 text-sm"
                            >
                                Close
                            </button>
                            <button
                                onClick={savePlan}
                                disabled={saving}
                                className="flex items-center gap-2 rounded-lg bg-[#8e1b1b] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                            >
                                <Save size={15} />
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
