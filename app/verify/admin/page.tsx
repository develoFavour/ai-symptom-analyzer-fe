"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    Shield, Loader2, CheckCircle2, AlertCircle,
    Lock, User, UserCheck, Eye, EyeOff, ArrowRight,
    AtSign
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

function AdminSetupContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const token = searchParams.get("token");

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Administrative invitation token is missing or malformed.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setIsLoading(true);
        setError(null);

        const res = await api.post("/api/v1/auth/admin/setup", {
            invite_token: token,
            name,
            username,
            password
        });

        setIsLoading(false);

        if (res.success && res.data) {
            setIsSuccess(true);
            const { user, role } = res.data as any;

            setTimeout(() => {
                setAuth({ ...user, role });
                router.push("/admin/dashboard");
            }, 2000);
        } else {
            setError(res.error || "Failed to finalize administrative setup.");
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in fade-in duration-500">
                <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                </div>
                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Identity Verified</h1>
                    <p className="text-white/40 font-medium">Your executive credentials have been securely provisioned.</p>
                </div>
                <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl">
                    <Loader2 className="h-4 w-4 animate-spin text-white/40" />
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Redirecting to Control Center...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-xl bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Shield className="h-40 w-40" />
            </div>

            <div className="relative z-10 space-y-12">
                <div className="space-y-4">
                    <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center">
                        <Lock className="h-7 w-7 text-black" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Admin Account Setup</h1>
                        <p className="text-white/40 mt-1">Finalize your administrative access credentials.</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-4 animate-in slide-in-from-top-2">
                        <AlertCircle className="h-6 w-6 text-red-500 shrink-0" />
                        <p className="text-sm font-bold text-red-500 leading-relaxed uppercase tracking-tighter">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Full Legal Name</label>
                            <div className="relative group">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-white transition-colors" />
                                <input
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Jane Smith"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-semibold"
                                />
                            </div>
                        </div>

                        {/* Username */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Administrative Alias</label>
                            <div className="relative group">
                                <AtSign className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-white transition-colors" />
                                <input
                                    required
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="janesmith_admin"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-semibold"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Master Access Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-white transition-colors" />
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-14 py-5 text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-semibold"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <ul className="space-y-3 px-1">
                        <li className="flex items-center gap-3 text-[10px] font-black text-white/20 uppercase tracking-widest">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            HIPAA Compliant Encryption
                        </li>
                        <li className="flex items-center gap-3 text-[10px] font-black text-white/20 uppercase tracking-widest">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Authorized Governance Access
                        </li>
                    </ul>

                    <button
                        type="submit"
                        disabled={isLoading || !token}
                        className="w-full h-18 bg-white text-black font-black uppercase tracking-widest rounded-3xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <><Loader2 className="h-6 w-6 animate-spin text-black" /> Provising Node...</>
                        ) : (
                            <><UserCheck className="h-6 w-6" /> Finalize Board Access <ArrowRight className="h-5 w-5" /></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function AdminSetupPage() {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 lg:p-20 selection:bg-white selection:text-black">
            <Suspense fallback={
                <div className="flex flex-col items-center gap-4 text-white/20 uppercase tracking-widest font-black text-xs">
                    <Loader2 className="h-10 w-10 animate-spin" />
                    Initializing Secure Handshake...
                </div>
            }>
                <AdminSetupContent />
            </Suspense>
        </div>
    );
}
