"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Field,
    FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/route.constants";
import { authService } from "@/services/auth.service";
import AuthLayout from "@/components/auth/auth-layout";

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    async function onSubmit(data: ForgotPasswordFormValues) {
        setIsLoading(true);
        try {
            const response = await authService.forgotPassword(data.email);

            if (response.success) {
                setIsSubmitted(true);
                toast.success("Reset link sent to your email!");
            } else {
                toast.error(response.error || "Failed to send reset link");
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    if (isSubmitted) {
        return (
            <AuthLayout
                title="Sent!"
                subtitle="Check your email"
            >
                <div className="text-center space-y-8 py-4">
                    <div className="flex justify-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-[#d7ebe6] bg-[#f1fbf8] animate-pulse">
                            <CheckCircle2 className="h-12 w-12 text-[#1d5a56]" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-lg font-light leading-relaxed text-[#5f7e79]">
                            We&apos;ve sent a reset link to your email.
                            It will expire in 60 minutes.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Button
                            variant="outline"
                            className="h-14 w-full rounded-full border border-[#d7ebe6] bg-[#f6fbfa] font-bold text-[#163332] transition-all hover:bg-[#eef8f5]"
                            onClick={() => setIsSubmitted(false)}
                        >
                            Resend Link
                        </Button>

                        <Link
                            href={ROUTES.LOGIN}
                            className="flex items-center justify-center gap-2 text-sm font-bold text-[#688782] transition-colors hover:text-[#163332]"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Reset Access"
            subtitle="Enter your email address"
        >
            <div className="space-y-8">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                        placeholder="Email Address"
                                        className="auth-input"
                                    />
                                </div>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    <Button
                        type="submit"
                        className="h-14 w-full rounded-full border border-[#8ec9be] bg-[#1d5a56] text-lg font-bold text-white shadow-lg shadow-[#1d5a56]/15 transition-all hover:bg-[#236762] active:scale-[0.98]"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                <span>Sending...</span>
                            </>
                        ) : (
                            <span>Send Link</span>
                        )}
                    </Button>
                </form>

                <Link
                    href={ROUTES.LOGIN}
                    className="flex items-center justify-center gap-2 text-sm font-bold text-[#688782] transition-colors hover:text-[#163332]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Secure Sign In
                </Link>
            </div>
        </AuthLayout>
    );
}
