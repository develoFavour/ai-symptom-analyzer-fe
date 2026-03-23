"use client";

import Link from "next/link";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/route.constants";
import AuthLayout from "@/components/auth/auth-layout";

export default function VerifyEmailPage() {
    return (
        <AuthLayout
            title="Check your email"
            subtitle="We've sent a verification link to your email address"
        >
            <div className="space-y-8 text-center">
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-white/5 rounded-full blur-xl animate-pulse" />
                        <div className="relative bg-[#0a2a2a] p-6 rounded-full border border-white/10 shadow-2xl">
                            <Mail className="h-12 w-12 text-white" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-white/60 text-lg leading-relaxed">
                        To complete your registration, please click the link in the email we just sent you. 
                        If you don't see it, check your spam folder.
                    </p>
                    
                    <div className="flex items-center justify-center gap-2 text-sm text-white/40">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Link sent via Brevo Secure Mail</span>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <Link
                        href={ROUTES.LOGIN}
                        className={cn(
                            buttonVariants(),
                            "w-full h-14 rounded-full bg-white text-[#0a2a2a] font-bold text-lg hover:bg-white/90 transition-all active:scale-[0.98] shadow-2xl"
                        )}
                    >
                        Go to Login
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>

                    <p className="text-white/40 text-sm">
                        Didn't receive the email?{" "}
                        <button className="text-white/80 font-bold hover:text-white transition-colors">
                            Resend link
                        </button>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}
