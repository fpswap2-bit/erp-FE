import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { ADMIN_ROLES, getPortalPath } from "@/routes/portal";
import logo from "@/assets/logo.svg"

const STUDENT_LINKS = [
    { label: "Home", to: "/student", end: true },
    { label: "Enrollment", to: "/student/enrollment" },
    { label: "Fee Structure", to: "/student/fee-structure" },
    { label: "Pay Fees", to: "/student/pay-fees" },
    { label: "Receipts", to: "/student/receipts" },
    { label: "Profile", to: "/student/profile" },
];

const ADMIN_LINKS = [
    { label: "Home", to: "/admin", end: true },
    { label: "Enrollment", to: "/admin/enrollment-records" },
    { label: "Fee Plan", to: "/admin/fee-plan" },
    { label: "Fee Structure", to: "/admin/fee-structure" },
    { label: "Fees Record", to: "/admin/fee-payment" },
    { label: "Bank Details", to: "/admin/bank-account" },
];

export default function Navbar() {
    const { isAuthenticated, roles, user, fullName, logout } = useAuthStore();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const isAdmin = (roles ?? []).some((r: string) => (ADMIN_ROLES as string[]).includes(r));
    const links = isAuthenticated ? (isAdmin ? ADMIN_LINKS : STUDENT_LINKS) : [];
    const displayName = fullName || user || "";
    const initial = (displayName.trim().charAt(0) || "S").toUpperCase();


    const handleLogout = async () => {
        setOpen(false);
        await logout?.();
        navigate("/login", { replace: true });
    };
    

    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `rounded-md px-3 py-2 text-sm font-semibold transition ${
            isActive
                ? "bg-[#f6f1ec] text-[#1a237e]"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-[#1a237e]"
        }`;

    return (
        <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/70 backdrop-blur">
            <div className="mx-auto flex h-10 max-w-6xl items-center justify-between  px-4">
                <Link
                    to={isAuthenticated ? getPortalPath(roles) : "/login"}
                    className="flex shrink-0 items-center"
                >
                    <img src= {logo} alt="Surabhi Group of Institutions" className="h-6" />
                </Link>

                {/* Desktop links */}
                <nav className="hidden items-center gap-7 lg:flex">
                    {links.map((l) => (
                        <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                            {l.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-6">
                    {isAuthenticated && (
                        <>
                        <span
                        title={displayName}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-medium text-emerald-800">
                            {initial}
                        </span>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="hidden items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold text-[#8e1b1b] transition hover:bg-[#8e1b1b] hover:text-white lg:flex"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>

                            <button
                                type="button"
                                aria-label="Toggle menu"
                                onClick={() => setOpen((o) => !o)}
                                className="rounded-md p-2 text-neutral-700 hover:bg-neutral-100 lg:hidden"
                            >
                                {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile menu */}
            {isAuthenticated && open && (
                <nav className="border-t border-neutral-200 bg-white px-4 py-3 lg:hidden">
                    <div className="flex flex-col gap-1">
                        {links.map((l) => (
                            <NavLink
                                key={l.to}
                                to={l.to}
                                end={l.end}
                                onClick={() => setOpen(false)}
                                className={linkClass}
                            >
                                {l.label}
                            </NavLink>
                        ))}
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="mt-1 flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-[#8e1b1b] hover:bg-neutral-100"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </nav>
            )}
        </header>
    );
}