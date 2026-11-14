import { useEffect, useState } from "react";
import {
    getMyFeeOverview,
    type MyFeeOverview,
    type MyFeePlan,
} from "@/api/studentFee";

const formatAmount = (value?: number | null) =>
    Number(value || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    });

const planLabel = (plan: MyFeePlan) =>
    `${plan.academic_year} (Year ${plan.study_year})`;

export default function StudentFeeStructure() {
    const [data, setData] = useState<MyFeeOverview | null>(null);
    const [selected, setSelected] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        (async () => {
            try {
                const result = await getMyFeeOverview();
                if (active) setData(result);
            } catch (e: any) {
                console.error("Student fee overview error:", e);
                if (active) {
                    setError(
                        e.response?.data?.exception ||
                            e.message ||
                            "Unable to load your fee details."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    if (loading) {
        return (
            <section className="rounded-md border border-[#e8e2df] bg-white p-9 text-center text-sm text-neutral-500">
                Loading your fee details...
            </section>
        );
    }

    if (error) {
        return (
            <section>
                <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </p>
            </section>
        );
    }

    const student = data?.student;
    const plans = data?.plans ?? [];
    const plan = plans[selected] ?? plans[0];

    return (
        <section>
            {/* Intro */}
            <div className="mb-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#1a237e]">
                    Fees
                </p>
                <h1 className="font-serif text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
                    My Fee Plan
                </h1>
                {student?.student_name && (
                    <p className="mt-2 text-sm text-neutral-500">
                        {student.student_name}
                        {student.enrollment_number
                            ? ` — ${student.enrollment_number}`
                            : ""}
                    </p>
                )}
            </div>

            {!student && (
                <EmptyState message="No enrollment record was found for your account. Please contact the academic office." />
            )}

            {student && plans.length === 0 && (
                <EmptyState message="No fee plan has been created for you yet. Please contact the accounts office." />
            )}

            {plan && (
                <>
                    {/* Plan switcher (only when there is more than one plan) */}
                    {plans.length > 1 && (
                        <div className="mb-5 flex flex-wrap gap-2">
                            {plans.map((p, index) => (
                                <button
                                    key={p.name}
                                    type="button"
                                    onClick={() => setSelected(index)}
                                    className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
                                        index === selected
                                            ? "border-[#1a237e] bg-[#1a237e] text-white"
                                            : "border-[#e8e2df] bg-white text-[#55504d] hover:bg-[#faf9f8]"
                                    }`}
                                >
                                    {planLabel(p)}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Plan summary */}
                    <div className="mb-5 rounded-md border border-[#e8e2df] bg-white p-5 sm:p-6">
                        <h2 className="mb-5 font-serif text-xl font-bold">
                            Plan Summary
                        </h2>
                        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                            <Detail label="Branch" value={plan.branch} />
                            <Detail
                                label="Academic Year"
                                value={plan.academic_year}
                            />
                            <Detail
                                label="Study Year"
                                value={`Year ${plan.study_year}`}
                            />
                            <Detail
                                label="Total Payable"
                                value={formatAmount(plan.total_amount)}
                                strong
                            />
                        </div>
                    </div>

                    {/* Semester-wise fees */}
                    <div className="mb-5 rounded-md border border-[#e8e2df] bg-white p-5 sm:p-6">
                        <h2 className="mb-4 font-serif text-xl font-bold">
                            Semester-wise Fees
                        </h2>

                        {plan.items.length === 0 ? (
                            <p className="text-sm text-neutral-500">
                                No semesters have been added to this plan.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[420px] text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-[#e8e2df] text-xs text-neutral-500">
                                            <th className="py-2 pr-4 font-medium">
                                                Semester
                                            </th>
                                            <th className="py-2 pr-4 font-medium">
                                                Period
                                            </th>
                                            <th className="py-2 text-right font-medium">
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {plan.items.map((item) => (
                                            <tr
                                                key={item.semester_no}
                                                className="border-b border-[#f0ebe8] last:border-0"
                                            >
                                                <td className="py-3 pr-4 font-medium text-gray-900">
                                                    Semester {item.semester_no}
                                                </td>
                                                <td className="py-3 pr-4 text-[#55504d]">
                                                    {item.period || "—"}
                                                </td>
                                                <td className="py-3 text-right">
                                                    {item.overridden ? (
                                                        <>
                                                            <span className="mr-2 text-xs text-neutral-400 line-through">
                                                                {formatAmount(
                                                                    item.default_amount
                                                                )}
                                                            </span>
                                                            <span className="mr-2 rounded-full bg-[#fff6e5] px-2 py-0.5 text-xs font-semibold text-[#8a5a00]">
                                                                Adjusted
                                                            </span>
                                                        </>
                                                    ) : null}
                                                    <span className="font-semibold text-gray-900">
                                                        {formatAmount(
                                                            item.amount
                                                        )}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t border-[#e8e2df]">
                                            <td
                                                colSpan={2}
                                                className="pt-3 font-bold text-gray-900"
                                            >
                                                Total
                                            </td>
                                            <td className="pt-3 text-right font-bold text-gray-900">
                                                {formatAmount(plan.total_amount)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Fee structure the plan is based on */}
                    <div className="rounded-md border border-[#e8e2df] bg-white p-5 sm:p-6">
                        <h2 className="mb-2 font-serif text-xl font-bold">
                            Fee Structure
                        </h2>
                        <p className="mb-5 text-sm text-neutral-500">
                            The standard fees for your branch and year. Your plan
                            above is based on this and may include adjustments.
                        </p>

                        {plan.structure ? (
                            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
                                <Detail
                                    label="Branch"
                                    value={plan.structure.branch}
                                />
                                <Detail
                                    label="Academic Year"
                                    value={plan.structure.academic_year}
                                />
                                <Detail
                                    label="Study Year"
                                    value={`Year ${plan.structure.study_year}`}
                                />
                                <Detail
                                    label="Odd Semester (Jul–Dec)"
                                    value={formatAmount(
                                        plan.structure.odd_semester_fee
                                    )}
                                    strong
                                />
                                <Detail
                                    label="Even Semester (Jan–Jun)"
                                    value={formatAmount(
                                        plan.structure.even_semester_fee
                                    )}
                                    strong
                                />
                                <Detail
                                    label="Full Year"
                                    value={formatAmount(
                                        Number(plan.structure.odd_semester_fee) +
                                            Number(
                                                plan.structure.even_semester_fee
                                            )
                                    )}
                                    strong
                                />
                            </div>
                        ) : (
                            <p className="text-sm text-neutral-500">
                                The fee structure for this plan is not available.
                            </p>
                        )}
                    </div>
                </>
            )}
        </section>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <p className="rounded-md border border-[#e8e2df] bg-white p-9 text-center text-sm text-neutral-500">
            {message}
        </p>
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