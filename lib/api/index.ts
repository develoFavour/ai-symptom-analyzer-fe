import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

// ── Standardized API Response ──────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
    data: T | null;
    error: string | null;
    success: boolean;
    status: number;
}

// ── Axios Instance ─────────────────────────────────────────────────────────────
const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
    headers: { "Content-Type": "application/json" },
    timeout: 30000,
    withCredentials: true, // Crucial for HttpOnly cookies
});

// ── Request Interceptor: No longer need manual token attachment with cookies ──
axiosInstance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle 401 & Automatic Token Refresh ────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown) => {
    failedQueue.forEach((p) => {
        if (error) p.reject(error);
        else p.resolve(undefined);
    });
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Queue requests while a refresh is in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => axiosInstance(originalRequest))
                  .catch((e) => Promise.reject(e));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await axios.post(
                    `${axiosInstance.defaults.baseURL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                processQueue(null);
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);

                if (typeof window !== "undefined") {
                    // Clear Zustand store so UI reflects logged-out state
                    try {
                        const { useAuthStore } = await import("@/store/auth.store");
                        useAuthStore.getState().clearAuth();
                    } catch (_) {}
                    window.location.href = "/login?session_expired=true";
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

// ── Core Request Handler ───────────────────────────────────────────────────────
async function request<T>(
    config: AxiosRequestConfig
): Promise<ApiResponse<T>> {
    try {
        const response: AxiosResponse<{
            success: boolean;
            message: string;
            data: T;
        }> = await axiosInstance(config);

        return {
            data: response.data.data,
            error: null,
            success: true,
            status: response.status,
        };
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            return {
                data: null,
                error:
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    err.message ||
                    "An error occurred",
                success: false,
                status: err.response?.status || 500,
            };
        }
        return {
            data: null,
            error: "An unexpected error occurred",
            success: false,
            status: 500,
        };
    }
}

// ── Exported API Methods ───────────────────────────────────────────────────────
export const api = {
    /** GET request */
    get: <T>(url: string, config?: AxiosRequestConfig) =>
        request<T>({ ...config, method: "GET", url }),

    /** POST request with JSON body */
    post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
        request<T>({ ...config, method: "POST", url, data: body }),

    /** PUT request with JSON body */
    put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
        request<T>({ ...config, method: "PUT", url, data: body }),

    /** PATCH request with JSON body */
    patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
        request<T>({ ...config, method: "PATCH", url, data: body }),

    /** DELETE request */
    del: <T>(url: string, config?: AxiosRequestConfig) =>
        request<T>({ ...config, method: "DELETE", url }),

    /** POST with multipart/form-data (file uploads) */
    upload: <T>(
        url: string,
        formData: FormData,
        config?: AxiosRequestConfig
    ) =>
        request<T>({
            ...config,
            method: "POST",
            url,
            data: formData,
            headers: { "Content-Type": "multipart/form-data" },
        }),
};
