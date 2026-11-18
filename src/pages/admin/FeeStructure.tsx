
import { useCallback, useEffect, useState } from "react";
import {
    Search,
    RefreshCw,
    ChevronLeft,
    ChevronRight,Plus} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    getFeeStructureOptions,
    getFeeStructures,
    type FeeStructure,
    type FeeStructureOptions,
} from "@/api/feeStructure";

const PAGE_SIZE = 20;

const currency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value || 0);

export default function FeeStructures() {
    const [records, setRecords] = useState<FeeStructure[]>([]);
    const [total, setTotal] = useState(0);

    const [options, setOptions] = useState<FeeStructureOptions>({
        branches: [],
        academic_years: [],
    });

    const [search, setSearch] = useState("");
    const [academicYear, setAcademicYear] = useState("");
    const [branch, setBranch] = useState("");
    const [studyYear, setStudyYear] = useState("");
    const [page, setPage] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const loadStructures = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const result = await getFeeStructures({
                search: search.trim() || undefined,
                academic_year: academicYear || undefined,
                branch: branch || undefined,
                study_year: studyYear || undefined,
                start: page * PAGE_SIZE,
                page_length: PAGE_SIZE,
            });

            setRecords(result.records);
            setTotal(result.total);
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Unable to load fee structures."
            );
        } finally {
            setLoading(false);
        }
    }, [search, academicYear, branch, studyYear, page]);

    useEffect(() => {
        getFeeStructureOptions()
            .then(setOptions)
            .catch(() => {
                setError("Unable to load filter options.");
            });
    }, []);

    useEffect(() => {
        loadStructures();
    }, [loadStructures]);

    const resetFilters = () => {
        setSearch("");
        setAcademicYear("");
        setBranch("");
        setStudyYear("");
        setPage(0);
    };
    const navigate = useNavigate();
    return (
        <div className="space-y-6 text-neutral-800">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                 <div>
                     <h1 className="text-2xl font-semibold">
                         Fee Structures
                     </h1>
                     <p className="mt-1 text-sm text-neutral-500">
                         View and review semester fee structures
                         configured for each branch and academic year.
                     </p>
                 </div>

                 <Button
                     variant="default"
                     onClick={() => navigate("/admin/fee-structure/new")}
                 >
                     <Plus size={16} className="mr-2" />
                     Create Fee Structure
                 </Button>
             </div>

            {/* Error */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Filters */}
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
                            placeholder="Search fee structure..."
                            className="w-full rounded-lg border border-neutral-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#8e1b1b]"
                        />
                    </div>

                    <select
                        value={academicYear}
                        onChange={e => {
                            setAcademicYear(e.target.value);
                            setPage(0);
                        }}
                        className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#8e1b1b]"
                    >
                        <option value="">All Academic Years</option>

                        {options.academic_years.map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>

                    <select
                        value={branch}
                        onChange={e => {
                            setBranch(e.target.value);
                            setPage(0);
                        }}
                        className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#8e1b1b]"
                    >
                        <option value="">All Branches</option>

                        {options.branches.map(item => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>

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
                        <RefreshCw size={15} />
                        Reset filters
                    </button>

                </div>
            </div>

            {/* Records */}
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">

                <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
                    <div>
                        <h2 className="font-semibold">
                            Configured Fee Structures
                        </h2>
                        <p className="mt-1 text-xs text-neutral-500">
                            Branch-wise semester fee configuration
                        </p>
                    </div>

                    <span className="text-sm text-neutral-500">
                        {total} records
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">

                        <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
                            <tr>
                                <th className="px-5 py-3">Branch</th>
                                <th className="px-5 py-3">Academic Year</th>
                                <th className="px-5 py-3">Study Year</th>
                                <th className="px-5 py-3 text-right">
                                    Odd Semester
                                </th>
                                <th className="px-5 py-3 text-right">
                                    Even Semester
                                </th>
                                <th className="px-5 py-3 text-right">
                                    Annual Total
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-neutral-100">

                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-10 text-center text-neutral-500"
                                    >
                                        Loading fee structures...
                                    </td>
                                </tr>
                            ) : records.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-10 text-center text-neutral-500"
                                    >
                                        No fee structures found.
                                    </td>
                                </tr>
                            ) : (
                                records.map(record => (
                                    <tr
                                        key={record.name}
                                        className="hover:bg-neutral-50"
                                    >
                                        <td className="px-5 py-4 font-medium">
                                            {record.branch}
                                        </td>

                                        <td className="px-5 py-4 text-neutral-600">
                                            {record.academic_year}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
                                                Year {record.study_year}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-right tabular-nums">
                                            {currency(record.odd_semester_fee)}
                                        </td>

                                        <td className="px-5 py-4 text-right tabular-nums">
                                            {currency(record.even_semester_fee)}
                                        </td>

                                        <td className="px-5 py-4 text-right font-semibold tabular-nums">
                                            {currency(
                                                Number(record.odd_semester_fee) +
                                                Number(record.even_semester_fee)
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}

                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3">

                    <span className="text-xs text-neutral-500">
                        Showing {total ? page * PAGE_SIZE + 1 : 0}
                        –
                        {Math.min((page + 1) * PAGE_SIZE, total)}
                        {" "}of {total}
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
                            disabled={
                                (page + 1) * PAGE_SIZE >= total ||
                                loading
                            }
                            onClick={() => setPage(p => p + 1)}
                            className="rounded-lg border p-2 disabled:opacity-30"
                        >
                            <ChevronRight size={16} />
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}
