import axios from "axios";
import { getCsrfToken } from "./csrf";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

api.interceptors.request.use((config) => {
    const method = config.method?.toLowerCase();
    const csrfToken = getCsrfToken();

    if (
        csrfToken &&
        method &&
        ["post", "put", "patch", "delete"].includes(method)
    ) {
        config.headers.set("X-Frappe-CSRF-Token", csrfToken);
    }

    return config;
});

export default api;