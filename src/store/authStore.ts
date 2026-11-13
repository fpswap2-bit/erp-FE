import { create } from "zustand";
import {
    loginRequest,
    getBootstrap,
    logoutRequest,
} from "../api/auth";
import { setCsrfToken } from "../api/csrf";
import type { LoginCredentials } from "../types/auth";

interface AuthState {
    user: string | null;
    fullName: string | null;
    roles: string[];
    isAuthenticated: boolean;
    isLoading: boolean;

    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    initialize: () => Promise<void>;
}

const clearAuth = () => {
    setCsrfToken(null);

    return {
        user: null,
        fullName: null,
        roles: [],
        isAuthenticated: false,
    };
};

export const useAuthStore = create<AuthState>((set) => ({
    ...clearAuth(),
    isLoading: true,

    login: async (credentials) => {
        set({ isLoading: true });

        try {
            await loginRequest(credentials);

            const session = await getBootstrap();

            if (!session.authenticated || !session.user) {
                throw new Error("Unable to establish Frappe session");
            }

            setCsrfToken(session.csrf_token);

            set({
                user: session.user,
                fullName: session.full_name,
                roles: session.roles,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            set({
                ...clearAuth(),
                isLoading: false,
            });

            throw error;
        }
    },

    logout: async () => {
        await logoutRequest();

        set({
            ...clearAuth(),
            isLoading: false,
        });
    },

    initialize: async () => {
        try {
            const session = await getBootstrap();

            if (!session.authenticated || !session.user) {
                setCsrfToken(null);

                set({
                    ...clearAuth(),
                    isLoading: false,
                });

                return;
            }

            setCsrfToken(session.csrf_token);

            set({
                user: session.user,
                fullName: session.full_name,
                roles: session.roles,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch {
            set({
                ...clearAuth(),
                isLoading: false,
            });
        }
    },
}));