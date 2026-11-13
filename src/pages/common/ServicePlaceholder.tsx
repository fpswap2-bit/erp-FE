import { ArrowLeft, Construction } from "lucide-react";
import { Link } from "react-router-dom";

interface ServicePlaceholderProps {
    title: string;
}

export default function ServicePlaceholder({
    title,
}: ServicePlaceholderProps) {
    return (
        <section className="max-w-2xl">
            <Link
                to=".."
                relative="path"
                className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#8e1b1b]"
            >
                <ArrowLeft size={16} />
                Back to workspace
            </Link>

            <div className="rounded-xl border border-gray-200 bg-white p-8 sm:p-10">
                <Construction
                    size={32}
                    className="mb-5 text-[#8e1b1b]"
                />

                <h1 className="text-2xl font-semibold text-gray-900">
                    {title}
                </h1>

                <p className="mt-3 leading-7 text-gray-500">
                    This service is being prepared. Its functionality will
                    be connected to the Surabhi ERP backend.
                </p>
            </div>
        </section>
    );
}