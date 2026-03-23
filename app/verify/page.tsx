"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/route.constants";
import { authService } from "@/services/auth.service";
import AuthLayout from "@/components/auth/auth-layout";
import { toast } from "sonner";

function VerifyContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying your email...");
    const hasCalled = useRef(false);

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            setStatus("error");
            setMessage("No verification token found.");
            return;
        }

        if (hasCalled.current) return;
        hasCalled.current = true;

        const verify = async () => {
            try {
                const response = await authService.verifyEmail(token);
                if (response.success) {
                    setStatus("success");
                    setMessage("Your email has been successfully verified! You can now log in to your account.");
                    toast.success("Email verified successfully!");
                } else {
                    setStatus("error");
                    setMessage(response.error || "Verification failed. The link may be expired or invalid.");
                }
            } catch (err: any) {
                setStatus("error");
                setMessage("Something went wrong during verification.");
            }
        };

        verify();
    }, [searchParams]);

    return (
        <AuthLayout
            title={status === "loading" ? "Verifying..." : status === "success" ? "All set!" : "Oops!"}
            subtitle={status === "loading" ? "Please wait a moment" : status === "success" ? "Verification complete" : "Verification failed"}
        >
            <div className="space-y-8 text-center">
                <div className="flex justify-center">
                    {status === "loading" && (
                        <div className="relative">
                            <div className="absolute inset-0 bg-white/5 rounded-full blur-xl animate-pulse" />
                            <Loader2 className="h-16 w-16 text-white animate-spin relative" />
                        </div>
                    )}
                    {status === "success" && (
                        <div className="relative">
                            <div className="absolute -inset-4 bg-green-500/20 rounded-full blur-xl animate-pulse" />
                            <CheckCircle className="h-16 w-16 text-green-400 relative" />
                        </div>
                    )}
                    {status === "error" && (
                        <div className="relative">
                            <div className="absolute -inset-4 bg-red-500/20 rounded-full blur-xl animate-pulse" />
                            <XCircle className="h-16 w-16 text-red-400 relative" />
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <p className="text-white/70 text-lg leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="pt-4">
                    <Link
                        href={ROUTES.LOGIN}
                        className={cn(
                            buttonVariants(),
                            "w-full h-14 rounded-full bg-white text-[#0a2a2a] font-bold text-lg hover:bg-white/90 transition-all active:scale-[0.98] shadow-2xl"
                        )}
                    >
                        {status === "success" ? "Proceed to Login" : "Back to Login"}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <AuthLayout title="Verifying..." subtitle="Please wait">
                <div className="flex justify-center p-12">
                    <Loader2 className="h-16 w-16 text-white animate-spin" />
                </div>
            </AuthLayout>
        }>
            <VerifyContent />
        </Suspense>
    );
}
