import {
    ClipboardList,
    FileText,
    Layers,
    IndianRupee,
    Landmark,
} from "lucide-react";

import ServiceCard from "@/components/common/ServiceCard";

const services = [
    {
        title: "Enrollment Record",
        description:
            "View and manage student enrollment applications and records.",
        icon: ClipboardList,
        to: "/admin/enrollment-records",
    },
    {
        title: "Fee Plan",
        description:
            "Configure programme-wise and academic fee plans.",
        icon: FileText,
        to: "/admin/fee-plan",
    },
    {
        title: "Fee Structure",
        description:
            "Define semester-wise and applicable student fee structures.",
        icon: Layers,
        to: "/admin/fee-structure",
    },
    {
        title: "Fees Record",
        description:
            "Review fee payments, verification status and transaction records.",
        icon: IndianRupee,
        to: "/admin/fee-payment",
    },
    {
        title: "Setup Bank Details",
        description:
            "Configure and manage institutional bank account details.",
        icon: Landmark,
        to: "/admin/bank-account",
    },
];

export default function AdminWorkspace() {
    return (
    <section>
    <div className="mb-6 max-w-4xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#1a237e]">
            Administration
        </p>

        <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
            Manage academic and administrative services.
        </h1>

        <p className="mt-4 text-base text-gray-600">
            Select a department or service to continue.
        </p>
    </div>

    <div className="rounded-[40px] border-2 bg-white border-t-[6px] border-l-4 border-neutral-600 p-6 sm:p-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
                <ServiceCard key={service.title} {...service} />
            ))}
        </div>
    </div>
    </section>
    );
}