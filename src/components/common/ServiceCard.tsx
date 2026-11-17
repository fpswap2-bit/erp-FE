import { Link } from "react-router-dom";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface ServiceCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    to: string;
}

export default function ServiceCard({ title, description, icon: Icon, to }: ServiceCardProps) {
    return (
        <Link
            to={to}
            className="group flex flex-col rounded-xl border border-neutral-300 border-t-4 border-r-4 border-neutral-600 bg-amber-100/50 p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
            <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg border border-[#e8dcd6] bg-[#f6f1ec] text-[#1a237e]">
                <Icon className="h-6 w-6" strokeWidth={1.75} />
            </span>

            <h3 className="font-serif text-xl font-bold text-gray-900">{title}</h3>
            <p className="mt-3 flex-1 text-[15px] leading-relaxed text-gray-600">{description}</p>

            <span className="mt-7 flex items-center justify-between text-[15px] font-semibold text-[#1a237e]">
                Open service
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </span>
        </Link>
    );
}