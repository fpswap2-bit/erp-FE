import { Outlet } from "react-router-dom";

interface PortalLayoutProps {
    subtitle?: string; // kept so AdminLayout / StudentLayout still compile
    homePath?: string;
}

export default function PortalLayout(_props: PortalLayoutProps) {
    return (
        <div>
            <div className="rounded-2xl bg-[#f7f7e6] px-6 py-14 sm:px-8">
                <Outlet />
            </div>
        </div>
    );
}