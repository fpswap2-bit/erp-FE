import api from "./axios";
import type { LoginCredentials, AuthBootstrap } from "../types/auth";
import type { FrappeResponse } from "../types/api";

export const loginRequest = async (
    credentials: LoginCredentials
) => {
    return api.post("/api/method/login", {
        usr: credentials.username,
        pwd: credentials.password,
    });
};

export const getBootstrap = async (): Promise<AuthBootstrap> => {
    const response = await api.get<FrappeResponse<AuthBootstrap>>(
        "/api/method/surabhierp.api.auth.get_bootstrap"
    );

    return response.data.message;
};

export const logoutRequest = async () => {
    return api.post("/api/method/logout");
};