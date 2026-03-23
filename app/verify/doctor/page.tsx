"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
    Loader2, CheckCircle2, Lock, 
    Stethoscope, AlertCircle,
    User, ArrowRight
} from "lucide-react";
import { api } from "@/lib/api";

function DoctorSetupContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [isLoading, setIsLoading] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [error, setError] = useState("");
    
    // Form fields
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("No invitation token found. Please check your email link.");
            setIsLoading(false);
            return;
        }
        setIsLoading(false);
    }, [token]);

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        const res = await api.post<any>("/api/v1/auth/doctor/setup", {
            invite_token: token,
            name,
            password,
        });

        setIsSubmitting(false);

        if (res.success) {
            setTokenValid(true);
            setTimeout(() => {
                router.push("/doctor/dashboard");
            }, 2000);
        } else {
            setError(res.error || "Failed to set up account. The link may be expired.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                <p className="text-white/30 font-medium">Verifying invitation...</p>
            </div>
        );
    }

    if (tokenValid) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
                <div className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center animate-bounce">
                    <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Account Activated</h2>
                    <p className="text-white/50 mt-2">Welcome to the medical team, Dr. {name}.</p>
                </div>
                <p className="text-[11px] font-bold text-emerald-500/30 uppercase tracking-[0.3em] font-mono">Launching dashboard...</p>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto py-12 px-6">
            <div className="text-center mb-12">
                <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/10">
                    <Stethoscope className="h-8 w-8 text-[#0a2a2a]" />
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight">Activate Your Account</h1>
                <p className="text-white/40 mt-3 text-lg">Secure your specialist account to begin provided clinical oversight.</p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 flex items-start gap-4 mb-10">
                    <AlertCircle className="h-6 w-6 text-red-400 shrink-0" />
                    <p className="text-red-400 text-sm font-medium leading-relaxed">{error}</p>
                </div>
            )}

            <form onSubmit={handleSetup} className="space-y-8 bg-white/5 border border-white/10 rounded-[3rem] p-10 shadow-2xl">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">Confirm Full Name</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-white transition-colors" />
                            <input
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Jane Smith, MD"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:outline-none focus:border-white/20 focus:bg-white/8 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">Set Your Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-white transition-colors" />
                            <input
                                required
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="At least 8 characters"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:outline-none focus:border-white/20 focus:bg-white/8 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-16 bg-white text-black font-extrabold text-base rounded-[1.5rem] hover:bg-white/90 disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="h-5 w-5 animate-spin" /> Activating...</>
                        ) : (
                            <><CheckCircle2 className="h-5 w-5" /> Activate Specialist Account <ArrowRight className="h-4 w-4" /></>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function DoctorSetupPage() {
    return (
        <div className="min-h-screen bg-[#050505] flex flex-col justify-center">
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                </div>
            }>
                <DoctorSetupContent />
            </Suspense>
        </div>
    );
}
