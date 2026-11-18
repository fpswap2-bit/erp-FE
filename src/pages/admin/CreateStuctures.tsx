import { useEffect, useState } from "react";
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    createFeeStructure,
    getFeeStructureOptions,
    type FeeStructureOptions,
} from "@/api/feeStructure";

const initialForm = {
    branch: "",
    academic_year: "",
    study_year: "1",
    odd_semester_fee: "",
    even_semester_fee: "",
};

const currency = (value: string) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);

export default function CreateFeeStructure() {
    const [options, setOptions] = useState<FeeStructureOptions>({
        branches: [],
        academic_years: [],
    });

    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        getFeeStructureOptions()
            .then(setOptions)
            .catch(err => {
                setError(
                    err.response?.data?.message ||
                    "Unable to load Branch and Academic Year options."
                );
            })
            .finally(() => setLoading(false));
    }, []);

    const updateField = (field: keyof typeof initialForm, value: string) => {
        setForm(current => ({ ...current, [field]: value }));
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (
            !form.branch ||
            !form.academic_year ||
            !form.study_year ||
            form.odd_semester_fee === "" ||
            form.even_semester_fee === ""
        ) {
            setError("Please complete all fields.");
            return;
        }

        if (
            Number(form.odd_semester_fee) < 0 ||
            Number(form.even_semester_fee) < 0
        ) {
            setError("Fee amounts cannot be negative.");
            return;
        }

        setSaving(true);

        try {
            const result = await createFeeStructure({
                ...form,
                odd_semester_fee: Number(form.odd_semester_fee),
                even_semester_fee: Number(form.even_semester_fee),
            });

            setSuccess(`Fee Structure created successfully: ${result.name}`);
            setForm(initialForm);
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Unable to create Fee Structure."
            );
        } finally {
            setSaving(false);
        }
    };
    const navigate = useNavigate();
    return (
        <div className="mx-auto max-w-4xl space-y-6 text-neutral-800">
            <div>
                 <button
                     type="button"
                     onClick={() => navigate("/admin/fee-structure")}
                     className="mb-3 flex items-center gap-2 text-sm text-neutral-500 hover:text-[#8e1b1b]"
                 >
                     <ArrowLeft size={16} />
                     Back
                 </button>

                <h1 className="text-2xl font-semibold">Create Fee Structure</h1>
                <p className="mt-1 text-sm text-neutral-500">
                    Configure the default semester fees for a branch and academic year.
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    {success}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
            >
                <div className="border-b border-neutral-100 px-6 py-5">
                    <h2 className="font-semibold">Structure Details</h2>
                    <p className="mt-1 text-xs text-neutral-500">
                        Select the academic context for this fee structure.
                    </p>
                </div>

                <div className="grid gap-5 p-6 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Branch <span className="text-red-600">*</span>
                        </label>
                        <select
                            required
                            disabled={loading}
                            value={form.branch}
                            onChange={e => updateField("branch", e.target.value)}
                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8e1b1b]"
                        >
                            <option value="">Select Branch</option>
                            {options.branches.map(branch => (
                                <option key={branch} value={branch}>
                                    {branch}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Academic Year <span className="text-red-600">*</span>
                        </label>
                        <select
                            required
                            disabled={loading}
                            value={form.academic_year}
                            onChange={e => updateField("academic_year", e.target.value)}
                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8e1b1b]"
                        >
                            <option value="">Select Academic Year</option>
                            {options.academic_years.map(year => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Study Year <span className="text-red-600">*</span>
                        </label>
                        <select
                            required
                            value={form.study_year}
                            onChange={e => updateField("study_year", e.target.value)}
                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8e1b1b]"
                        >
                            {[1, 2, 3, 4].map(year => (
                                <option key={year} value={String(year)}>
                                    Year {year}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="border-y border-neutral-100 px-6 py-5">
                    <h2 className="font-semibold">Semester Fees</h2>
                    <p className="mt-1 text-xs text-neutral-500">
                        Set the default amount for each semester.
                    </p>
                </div>

                <div className="grid gap-5 p-6 sm:grid-cols-2">
                    <div className="rounded-xl border border-neutral-200 p-4">
                        <p className="font-medium">Odd Semester</p>
                        <p className="mb-4 mt-1 text-xs text-neutral-500">
                            July – December
                        </p>

                        <label className="mb-2 block text-sm font-medium">
                            Fee Amount (₹) <span className="text-red-600">*</span>
                        </label>
                        <input
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.odd_semester_fee}
                            onChange={e => updateField("odd_semester_fee", e.target.value)}
                            placeholder="50000"
                            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:border-[#8e1b1b]"
                        />
                        <p className="mt-2 text-xs text-neutral-500">
                            Preview: {currency(form.odd_semester_fee)}
                        </p>
                    </div>

                    <div className="rounded-xl border border-neutral-200 p-4">
                        <p className="font-medium">Even Semester</p>
                        <p className="mb-4 mt-1 text-xs text-neutral-500">
                            January – June
                        </p>

                        <label className="mb-2 block text-sm font-medium">
                            Fee Amount (₹) <span className="text-red-600">*</span>
                        </label>
                        <input
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.even_semester_fee}
                            onChange={e => updateField("even_semester_fee", e.target.value)}
                            placeholder="50000"
                            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 outline-none focus:border-[#8e1b1b]"
                        />
                        <p className="mt-2 text-xs text-neutral-500">
                            Preview: {currency(form.even_semester_fee)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-6 py-4">
                    <p className="text-sm text-neutral-500">
                        Total: <strong className="text-neutral-800">
                            {currency(
                                String(
                                    (Number(form.odd_semester_fee) || 0) +
                                    (Number(form.even_semester_fee) || 0)
                                )
                            )}
                        </strong>
                    </p>

                    <button
                        type="submit"
                        disabled={saving || loading}
                        className="flex items-center gap-2 rounded-lg bg-[#8e1b1b] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#741616] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save size={16} />
                        {saving ? "Creating..." : "Create Fee Structure"}
                    </button>
                </div>
            </form>
        </div>
    );
}
