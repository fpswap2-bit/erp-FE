export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthBootstrap {
    authenticated: boolean;
    user: string | null;
    full_name: string | null;
    roles: string[];
    csrf_token: string | null;
}