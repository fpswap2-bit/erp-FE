import api from "./axios";
import type { FrappeResponse } from "../types/api";

export const getLoggedUser = async (): Promise<string> => {
    const response = await api.get<FrappeResponse<string>>(
        "/api/method/frappe.auth.get_logged_user"
    );

    return response.data.message;
};