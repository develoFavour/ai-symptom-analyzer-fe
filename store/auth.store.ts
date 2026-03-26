import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "patient" | "doctor" | "admin";

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    age?: number;
    gender?: string;
    specialization?: string; // doctor only
    setup_complete?: boolean; // doctor only
}

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;

    setAuth: (user: AuthUser) => void;
    clearAuth: () => void;
    updateUser: (updates: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,

            setAuth: (user) => {
                set({ user, isAuthenticated: true });
            },

            clearAuth: () => {
                set({ user: null, isAuthenticated: false });
            },

            updateUser: (updates) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                })),
        }),
        {
            name: "auth-store",
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

