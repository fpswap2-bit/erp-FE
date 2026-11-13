export interface FrappeResponse<T> {
    message: T;
}

export interface FrappeError {
    exc_type?: string;
    exception?: string;
    message?: string;
}
