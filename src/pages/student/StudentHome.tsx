import {
    ClipboardList,
    Layers,
    CreditCard,
    Receipt,
    UserRound,
} from "lucide-react";

import ServiceCard from "../../components/common/ServiceCard";

const services = [
    {
        title: "Enrollment",
        description:
            "Complete or review your student enrollment form and required details.",
        icon: ClipboardList,
        to: "/student/enrollment",
    },
    {
        title: "Fee Structure",
        description:
            "View your applicable programme, semester and academic fees.",
        icon: Layers,
        to: "/student/fee-structure",
    },
    {
        title: "Pay Fees",
        description:
            "Pay outstanding academic fees and track payment progress.",
        icon: CreditCard,
        to: "/student/pay-fees",
    },
    {
        title: "Fee Receipts",
        description:
            "Access verified fee receipts and download payment records.",
        icon: Receipt,
        to: "/student/receipts",
    },
    {
        title: "Student Profile",
        description:
            "View your personal, contact and academic information.",
        icon: UserRound,
        to: "/student/profile",
    },
];

export default function StudentHome() {
    return (
        <section>
    <div className="mb-10 max-w-2xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#1a237e]">
            Student Services
        </p>

        <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
            Your academic services, all in one place.
        </h1>

        <p className="mt-4 text-base text-gray-600">Choose a service below to continue.</p>
    </div>

    <div className="rounded-[40px] border-2 border-t-[6px] border-l-4 border-neutral-600 p-6 sm:p-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
                <ServiceCard key={service.title} {...service} />
            ))}
        </div>
    </div>
</section>
    );
}