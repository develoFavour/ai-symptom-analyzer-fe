"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Field,
    FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/route.constants";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import AuthLayout from "@/components/auth/auth-layout";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const { setAuth } = useAuthStore();
    const redirect = searchParams.get("redirect") || ROUTES.PATIENT.DASHBOARD;

    // Show toast if user was redirected due to session expiry
    useEffect(() => {
        if (searchParams.get("session_expired") === "true") {
            toast.warning("Your session has expired. Please log in again.", {
                duration: 5000,
                description: "For your security, sessions expire after 7 days of inactivity.",
            });
        }
    }, [searchParams]);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(data: LoginFormValues) {
        setIsLoading(true);
        try {
            const response = await authService.login(data);

            if (response.success && response.data) {
                const { user, role } = response.data;
                const authUser = { ...user, role };
                setAuth(authUser);
                toast.success(`Welcome back, ${user.name}!`);

                if (role === "admin") router.push(ROUTES.ADMIN.DASHBOARD);
                else if (role === "doctor") router.push(ROUTES.DOCTOR.DASHBOARD);
                else router.push(redirect);
            } else {
                toast.error(response.error || "Invalid credentials");
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthLayout
            title="Welcome!"
            subtitle="Login to your account"
        >
            <div className="space-y-8">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <Controller
                            control={form.control}
                            name="email"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <div className="relative group">
                                        <Input
                                            {...field}
                                            id={field.name}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Email"
                                            className="auth-input"
                                        />
                                    </div>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="password"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <div className="relative group">
                                        <Input
                                            {...field}
                                            id={field.name}
                                            type="password"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Password"
                                            className="auth-input"
                                        />
                                    </div>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="h-14 w-full rounded-full border border-[#8ec9be] bg-[#1d5a56] text-lg font-bold text-white shadow-lg shadow-[#1d5a56]/15 transition-all hover:bg-[#236762] active:scale-[0.98]"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                <span>Securing Access...</span>
                            </>
                        ) : (
                            <span>Login</span>
                        )}
                    </Button>
                </form>

                <p className="text-center text-sm font-medium text-[#688782]">
                    Don&apos;t have an account?{" "}
                    <Link
                        href={ROUTES.REGISTER}
                        className="font-bold text-[#1d5a56] transition-colors hover:text-[#163332]"
                    >
                        Register
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-[#f7fbfa]">
                <Loader2 className="h-8 w-8 animate-spin text-[#2c756e]" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
