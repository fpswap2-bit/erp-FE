
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { ArrowRight, Lock, UserRound } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getPortalPath } from "@/routes/portal";
import logo from "@/assets/logo.svg";

const UNDERLINE_INPUT =
    "w-full border border-b-4 border-r-4 border-white/30 bg-white/10 rounded-md py-3 pl-9 pr-1 text-base text-white " +
    "placeholder:text-white/60 outline-none transition hover:border-white hover:bg-white/15 " +
    "[&:-webkit-autofill]:[-webkit-text-fill-color:white] " +
    "[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#754040]";

export default function Login() {
    const navigate = useNavigate();
    const { login, isAuthenticated, roles } = useAuthStore();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (isAuthenticated) {
        return <Navigate to={getPortalPath(roles)} replace />;
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setError("");
        setSubmitting(true);

        try {
            await login({ username, password });
            const updatedRoles = useAuthStore.getState().roles;
            navigate(getPortalPath(updatedRoles), { replace: true });
        } catch {
            setError("Invalid username or password.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="relative flex flex-1 items-center justify-center p-8 py-36">

            <form
                onSubmit={handleSubmit}
                className="relative w-3xl space-y-24 rounded-3xl border border-t-4 border-black/15 bg-black/95 p-4 shadow-xl backdrop-blur-2xl sm:p-10 bg-[radial-gradient(ellipse_at_top,#992000_2%,#944029_20%,#dbd4bd_100%)]"
            >
                <div className="flex flex-col items-center gap-9 text-center">
                    <span className="rounded-xl bg-white/90 px-4 py-2">
                        <img src={logo} alt="Surabhi Group of Institutions" className="h-16 w-auto" />
                    </span>
                    <p className="text-lg text-white/70">Sign in to continue</p>
                </div>

                <div className="space-y-6 ">
                    <label className="relative block">
                        <span className="sr-only">Username or email</span>
                        <UserRound className="pointer-events-none absolute mx-1.5 left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
                        <input
                            type="text"
                            placeholder="Email Address"
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className={UNDERLINE_INPUT}
                        />
                    </label>

                    <label className="relative block">
                        <span className="sr-only">Password</span>
                        <Lock className="pointer-events-none absolute mx-1.5 left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
                        <input
                            type="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={UNDERLINE_INPUT}
                        />
                    </label>
                </div>

                {error && (
                    <p role="alert" className="-mt-3 text-sm text-red-300">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8e1b1b] py-3.5 text-lg font-semibold text-white shadow-lg shadow-black/30 transition hover:bg-[#741616] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? "Signing in..." : "Sign In"}
                    {!submitting && <ArrowRight className="h-5 w-5" />}
                </button>
            </form>
        </main>
    );
}
