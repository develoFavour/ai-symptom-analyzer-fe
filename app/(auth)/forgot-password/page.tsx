"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Field,
    FieldLabel,
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
        } catch (error) {
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
                        <div className="w-24 h-24 glass rounded-3xl flex items-center justify-center animate-pulse">
                            <CheckCircle2 className="w-12 h-12 text-white" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-white/60 text-lg font-light leading-relaxed">
                            We&apos;ve sent a reset link to your email.
                            It will expire in 60 minutes.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Button
                            variant="outline"
                            className="w-full h-14 rounded-full border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 transition-all"
                            onClick={() => setIsSubmitted(false)}
                        >
                            Resend Link
                        </Button>

                        <Link
                            href={ROUTES.LOGIN}
                            className="flex items-center justify-center gap-2 text-white/40 font-bold hover:text-white transition-colors text-sm"
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
                        className="w-full h-14 rounded-full bg-[#0a2a2a] text-white font-bold text-lg hover:bg-[#0d3d3d] transition-all active:scale-[0.98] shadow-2xl border border-white/5"
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
                    className="flex items-center justify-center gap-2 text-white/40 font-bold hover:text-white transition-colors text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Secure Sign In
                </Link>
            </div>
        </AuthLayout>
    );
}
