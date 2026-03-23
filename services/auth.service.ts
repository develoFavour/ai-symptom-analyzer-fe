import { api } from "@/lib/api";
import { ENDPOINTS } from "@/constants/endpoint.const";

export interface LoginPayload {
    email: string;
    password: string;
    role: "patient" | "doctor" | "admin";
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    age: number;
    gender: "male" | "female" | "other";
}

export interface DoctorSetupPayload {
    invite_token: string;
    name: string;
    password: string;
    specialization: string;
    credentials?: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: any;
    role: "patient" | "doctor" | "admin";
}

export const authService = {
    login: (payload: LoginPayload) =>
        api.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, payload),

    register: (payload: RegisterPayload) =>
        api.post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, payload),

    logout: () =>
        api.post(ENDPOINTS.AUTH.LOGOUT),

    verifyEmail: (token: string) =>
        api.get(`${ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`),

    doctorSetup: (payload: DoctorSetupPayload) =>
        api.post<AuthResponse>(ENDPOINTS.AUTH.DOCTOR_SETUP, payload),

    getMe: () =>
        api.get(ENDPOINTS.AUTH.ME),

    forgotPassword: (email: string) =>
        api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),

    resetPassword: (token: string, password: string) =>
        api.post(ENDPOINTS.AUTH.RESET_PASSWORD, { token, password }),
};
