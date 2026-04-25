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
            subtitle="We&apos;ve sent a verification link to your email address"
        >
            <div className="space-y-8 text-center">
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="absolute -inset-4 rounded-full bg-[#e8f6f3] blur-xl animate-pulse" />
                        <div className="relative rounded-full border border-[#d5ebe6] bg-[#f4fbf9] p-6 shadow-[0_18px_40px_rgba(19,51,50,0.08)]">
                            <Mail className="h-12 w-12 text-[#1d5a56]" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-lg leading-relaxed text-[#5f7e79]">
                        To complete your registration, please click the link in the email we just sent you. 
                        If you don&apos;t see it, check your spam folder.
                    </p>
                    
                    <div className="flex items-center justify-center gap-2 text-sm text-[#688782]">
                        <CheckCircle2 className="h-4 w-4 text-[#2c756e]" />
                        <span>Link sent via Brevo Secure Mail</span>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <Link
                        href={ROUTES.LOGIN}
                        className={cn(
                            buttonVariants(),
                            "h-14 w-full rounded-full border border-[#8ec9be] bg-[#1d5a56] text-lg font-bold text-white transition-all hover:bg-[#236762] active:scale-[0.98]"
                        )}
                    >
                        Go to Login
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>

                    <p className="text-sm text-[#688782]">
                        Didn&apos;t receive the email?{" "}
                        <button className="font-bold text-[#1d5a56] transition-colors hover:text-[#163332]">
                            Resend link
                        </button>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}
