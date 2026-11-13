import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import EnrollmentForm from "@/components/enrollment/EnrollmentForm";
import ReviewActions from "@/components/enrollment/ReviewActions";

export default function EnrollmentReview() {
    const { name = "" } = useParams();

    return (
        <section className="space-y-4">
            <Link
                to="/admin/enrollment-records"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#1a237e] hover:underline"
            >
                <ArrowLeft className="h-4 w-4" /> Back to records
            </Link>

            <ReviewActions name={name} />
            <EnrollmentForm key={name} mode="admin" name={name} />
        </section>
    );
}