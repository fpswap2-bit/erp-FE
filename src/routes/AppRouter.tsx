import { Navigate, Route, Routes } from "react-router-dom";
import ServicePlaceholder from "../pages/common/ServicePlaceholder";
import ProtectedRoute from "./ProtectedRoute";
import { ADMIN_ROLES, getPortalPath } from "./portal";
import { useAuthStore } from "../store/authStore";
import EnrollmentForm from "@/components/enrollment/EnrollmentForm";
import Login from "../pages/auth/Login";
import StudentHome from "../pages/student/StudentHome";
import AdminWorkspace from "../pages/admin/AdminWorkspace";
import EnrollmentRecords from "../pages/admin/EnrollmentRecords";
import StudentLayout from "../layouts/StudentLayout";
import AdminLayout from "../layouts/AdminLayout";
import EnrollmentReview from "@/pages/admin/EnrollmentReview";
import BankAccount from "@/pages/admin/BankAccount";
import FeePlan from "@/pages/admin/FeePlan";
import FeeStructure from "@/pages/admin/FeeStructure";
import FeePaymentRecords from "@/pages/admin/FeePaymentRecords";
import FeePaymentReview from "@/pages/admin/FeePaymentReview";
import StudentFeeStructure from "@/pages/student/FeeStucture";
import Receipts from "@/pages/student/Receipts";
import ReceiptDetail from "@/pages/student/ReceiptDetail";
import PayFees from "@/pages/student/PayFees";

function HomeRedirect() {
    const { isAuthenticated, isLoading, roles } = useAuthStore();

    if (isLoading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <Navigate
            to={isAuthenticated ? getPortalPath(roles) : "/login"}
            replace
        />
    );
}

function Unauthorized() {
    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-3xl font-bold">403</h1>
                <p className="mt-2">You don't have permission to access this page.</p>
                <a href="/" className="text-red-800 underline mt-4 inline-block">
                    Return home
                </a>
            </div>
        </main>
    );
}

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route element={<ProtectedRoute allowedRoles={["Student"]} />}>
            <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentHome />} />
            <Route path="enrollment" element={<EnrollmentForm />} />
            <Route path="fee-structure" element={<StudentFeeStructure />} />
            <Route path="pay-fees" element={<PayFees />} />
            <Route path="receipts" element={<Receipts />} />
            <Route path="receipts/:name" element={<ReceiptDetail />} />
            <Route  path="profile"  element={<ServicePlaceholder title="Student Profile" />}/>
            </Route>
            </Route>

        <Route element={<ProtectedRoute allowedRoles={ADMIN_ROLES} />}>
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminWorkspace />} />
                <Route path="enrollment-records" element={<EnrollmentRecords />} />
                <Route path="enrollment-records/:name" element={<EnrollmentReview />} />
                <Route path="fee-plan" element={<FeePlan />} />
                <Route path="fee-structure" element={<FeeStructure />}/>
                <Route path="fee-payment" element={<FeePaymentRecords />} />
                <Route path="fee-payment/:name" element={<FeePaymentReview />} />
                <Route path="bank-account" element={<BankAccount />}/>
            </Route>
        </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}