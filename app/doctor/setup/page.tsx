"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
    Loader2, CheckCircle2, Shield, FileText, 
    ArrowRight, Info, Heart
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

export default function DoctorWizardPage() {
    const router = useRouter();
    const { user, setAuth, updateUser } = useAuthStore();
    const [step, setStep] = useState(1);
    const [specialization, setSpecialization] = useState("");
    const [credentials, setCredentials] = useState("");
    const [bio, setBio] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError("");

        const res = await api.post<any>("/api/v1/auth/doctor/wizard", {
            specialization,
            credentials,
            bio
        });

        if (res.success) {
            // Update local user state
            updateUser({ setup_complete: true });
            router.push("/doctor/dashboard");
        } else {
            setError(res.error || "Failed to save profile. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[150px] -z-10" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px] -z-10" />

            <div className="w-full max-w-2xl">
                {/* Progress */}
                <div className="flex items-center justify-between mb-12 px-2">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-3">
                            <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all border",
                                step === s ? "bg-white text-black border-white shadow-xl shadow-white/10" : 
                                step > s ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : 
                                "bg-white/5 text-white/20 border-white/5"
                            )}>
                                {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                            </div>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-[0.2em]",
                                step === s ? "text-white" : "text-white/20"
                            )}>
                                {s === 1 ? "Expertise" : s === 2 ? "Creds" : "Bio"}
                            </span>
                            {s < 3 && <div className="w-8 h-[1px] bg-white/5 ml-2" />}
                        </div>
                    ))}
                </div>

                <div className="glass border-white/10 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
                    {error && (
                        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-medium">
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">What is your primary medical expertise?</h1>
                                <p className="text-white/40 mt-3 text-sm">This helps us route relevant patient cases to your queue.</p>
                            </div>
                            <div className="space-y-4">
                                {["General Medicine", "Cardiology", "Neurology", "Pediatrics", "Dermatology", "Other"].map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => {
                                            setSpecialization(opt);
                                            setStep(2);
                                        }}
                                        className={cn(
                                            "w-full p-6 bg-white/5 border border-white/5 rounded-3xl text-left hover:bg-white/10 hover:border-white/10 transition-all flex items-center justify-between group",
                                            specialization === opt && "bg-white/10 border-white/20"
                                        )}
                                    >
                                        <span className="font-bold">{opt}</span>
                                        <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-white transition-all group-hover:translate-x-1" />
                                    </button>
                                ))}
                                {specialization === "Other" && (
                                    <input
                                        autoFocus
                                        placeholder="Type your specialization..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-white/20 transition-all text-sm mt-4"
                                        onChange={(e) => setSpecialization(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && specialization.trim() && setStep(2)}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase text-white/30 hover:text-white mb-4">← Back</button>
                                <h1 className="text-3xl font-bold tracking-tight">Professional Proof</h1>
                                <p className="text-white/40 mt-3 text-sm">Enter your medical license number or primary clinical credentials.</p>
                            </div>
                            <div className="relative group">
                                <Shield className="absolute left-6 top-6 h-5 w-5 text-white/20 group-focus-within:text-white transition-colors" />
                                <textarea
                                    required
                                    rows={3}
                                    value={credentials}
                                    onChange={(e) => setCredentials(e.target.value)}
                                    placeholder="e.g. GMC No: 1234567 | MBChB University of Oxford"
                                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-16 pr-6 py-6 text-white text-lg focus:outline-none focus:border-white/20 focus:bg-white/8 transition-all resize-none"
                                />
                            </div>
                            <button
                                onClick={() => credentials.trim() && setStep(3)}
                                disabled={!credentials.trim()}
                                className="w-full h-16 bg-white text-black font-extrabold text-base rounded-[1.5rem] hover:bg-white/90 disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                Continue <ArrowRight className="h-5 w-5" />
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <button onClick={() => setStep(2)} className="text-[10px] font-black uppercase text-white/30 hover:text-white mb-4">← Back</button>
                                <h1 className="text-3xl font-bold tracking-tight">Professional Bio</h1>
                                <p className="text-white/40 mt-3 text-sm">A brief summary of your background and clinical interests. Patients will see this.</p>
                            </div>
                            <div className="relative group">
                                <FileText className="absolute left-6 top-6 h-5 w-5 text-white/20 group-focus-within:text-white transition-colors" />
                                <textarea
                                    required
                                    rows={5}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us about your medical journey..."
                                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-16 pr-6 py-6 text-white text-base focus:outline-none focus:border-white/20 focus:bg-white/8 transition-all resize-none leading-relaxed"
                                />
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !bio.trim()}
                                className="w-full h-20 bg-emerald-500 text-black font-extrabold text-lg rounded-[1.5rem] hover:bg-emerald-400 disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-2xl shadow-emerald-500/20"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="h-6 w-6 animate-spin" /> Completing Setup...</>
                                ) : (
                                    <><Heart className="h-6 w-6" /> Finish & Enter Dashboard</>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center flex items-center justify-center gap-8 text-white/20">
                    <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest font-mono">HIPAA SECURE</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest font-mono">MD VERIFIED</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChevronRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    )
}
