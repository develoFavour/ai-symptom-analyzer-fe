"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import {
    Activity,
    Calendar,
    ArrowRight,
    Plus,
    Clock,
    AlertCircle,
    Zap,
    Heart,
    ShieldCheck,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/route.constants";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export interface DashboardData {
    stats: {
        symptom_checks: number;
        consultations: number;
        health_score: string;
    };
    recent_history: Array<{
        id: string;
        type: string;
        title: string;
        date: string;
        urgency: string;
        status: string;
    }>;
    active_consultation?: {
        id: string;
        status: string;
        created_at: string;
    };
    health_tip: string;
}

export default function PatientDashboard() {
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);

    useEffect(() => {
        async function fetchDashboard() {
            setIsLoading(true);
            const res = await api.get<DashboardData>("/api/v1/user/dashboard");
            if (res.success && res.data) {
                setData(res.data);
            }
            setIsLoading(false);
        }
        fetchDashboard();
    }, []);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center">
                <Loader2 className="h-12 w-12 text-emerald-400 animate-spin mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Syncing Your Dashboard</h3>
                <p className="text-white/40 max-w-sm">We're gathering your latest health insights and consultation records...</p>
            </div>
        );
    }

    const QUICK_STATS = data ? [
        {
            label: "Symptom Checks",
            value: data.stats.symptom_checks.toString(),
            icon: Activity,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
        },
        {
            label: "Consultations",
            value: data.stats.consultations.toString(),
            icon: Clock,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
        },
        {
            label: "Health Score",
            value: data.stats.health_score,
            icon: ShieldCheck,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
        },
    ] : [];

    const RECENT_HISTORY = (data?.recent_history || []).slice(0, 5);

    return (
        <div className="max-w-7xl mx-auto space-y-10">
            {/* Hero / Welcome Banner */}
            <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0a2a2a] via-[#051a1a] to-[#050505] p-10 lg:p-14 border border-white/5 shadow-2xl">
                <div className="relative z-10 max-w-xl space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-widest">
                        <Zap className="h-3 w-3 text-amber-400 fill-amber-400" />
                        AI Powered Health Assistant
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                        Check your symptoms <br />
                        <span className="text-white/40 font-medium italic">anytime, anywhere.</span>
                    </h1>
                    <p className="text-white/50 text-lg leading-relaxed">
                        Welcome back, <span className="text-white font-bold">{user?.name}</span>. I'm here to help you understand your symptoms. Get a quick health check and personalized advice in minutes.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        <Link
                            href={ROUTES.PATIENT.SYMPTOM_CHECKER}
                            className="h-14 px-8 rounded-full bg-white text-[#0a2a2a] font-bold text-lg hover:bg-white/90 transition-all flex items-center gap-2 group shadow-xl shadow-white/5"
                        >
                            Start Check
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href={ROUTES.PATIENT.CONSULTATION_REQUEST}
                            className="h-14 px-8 rounded-full bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all flex items-center gap-2"
                        >
                            Talk to Doctor
                        </Link>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:flex items-center justify-center pointer-events-none opacity-40">
                    <div className="relative h-[300px] w-[300px]">
                        <div className="absolute inset-0 bg-[#0ea5e9]/20 rounded-full blur-[100px]" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 border border-white/5 rounded-full animate-pulse" />
                        <Heart className="h-24 w-24 text-white/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                </div>
            </section>

            {/* Stats Overview */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {QUICK_STATS.map((stat) => (
                    <div key={stat.label} className="glass p-6 rounded-[2rem] border-white/5 flex items-center gap-5 group hover:bg-white/5 transition-colors">
                        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
                            <stat.icon className={cn("h-7 w-7", stat.color)} />
                        </div>
                        <div>
                            <p className="text-white/40 text-sm font-semibold">{stat.label}</p>
                            <p className="text-white text-2xl font-bold mt-0.5">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <section className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            Recent History
                            <span className="h-6 px-2.5 rounded-lg bg-white/5 text-white/30 text-xs font-bold leading-6">{RECENT_HISTORY.length} {RECENT_HISTORY.length === 1 ? 'Entry' : 'Entries'}</span>
                        </h3>
                        <Link href={ROUTES.PATIENT.SYMPTOM_CHECKER} className="text-white/40 text-sm font-bold hover:text-white transition-colors">
                            View All
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {RECENT_HISTORY.length > 0 ? RECENT_HISTORY.map((item, idx) => (
                            <div key={idx} className="glass group p-6 rounded-[2.5rem] border-white/5 hover:bg-white/5 transition-all flex items-center">
                                <div className="h-14 w-14 rounded-full bg-white/5 flex items-center justify-center mr-6 border border-white/5">
                                    <Clock className="h-6 w-6 text-white/20" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-bold text-lg">{item.title}</h4>
                                    <div className="flex items-center gap-4 mt-1.5">
                                        <span className="text-white/30 text-sm flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                                        </span>
                                        <span className={cn(
                                            "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            item.urgency === "self_care" ? "bg-emerald-500/10 text-emerald-400" :
                                                item.urgency === "emergency" ? "bg-red-500/10 text-red-400" :
                                                    "bg-amber-500/10 text-amber-400"
                                        )}>
                                            {item.urgency.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                                <Link
                                    href={item.type === 'symptom_check' ? `${ROUTES.PATIENT.SYMPTOM_CHECKER}/${item.id}` : `${ROUTES.PATIENT.CONSULTATION}/${item.id}`}
                                    className="h-12 w-12 rounded-full border border-white/5 flex items-center justify-center text-white/20 group-hover:text-white group-hover:bg-white/10 transition-all"
                                >
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            </div>
                        )) : (
                            <div className="glass p-10 rounded-[2.5rem] border-white/5 text-center text-white/20 italic">
                                No recent symptom analyses found.
                            </div>
                        )}
                    </div>

                    <Link
                        href={ROUTES.PATIENT.SYMPTOM_CHECKER}
                        className="w-full h-20 rounded-[2.5rem] border-2 border-dashed border-white/5 flex items-center justify-center text-white/20 hover:text-white/40 hover:border-white/10 transition-all gap-3 group"
                    >
                        <Plus className="h-6 w-6 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-lg tracking-tight">Record New Symptom Analysis</span>
                    </Link>
                </section>

                {/* Sidebar Cards */}
                <aside className="space-y-8">
                    {/* Health Tip */}
                    <div className="bg-[#0a2a2a] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <Activity className="h-24 w-24 text-white" />
                        </div>
                        <h4 className="text-white/60 font-bold text-xs uppercase tracking-[0.2em] mb-4">Daily Health Tip</h4>
                        <p className="text-white text-xl font-medium leading-relaxed mb-6">
                            {data?.health_tip}
                        </p>
                        <div className="h-1 w-20 bg-emerald-400 rounded-full" />
                    </div>

                    {/* Pending Consultation Alert */}
                    {data?.active_consultation && (
                        <Link
                            href={`${ROUTES.PATIENT.CONSULTATION}/${data.active_consultation.id}`}
                            className="block glass p-8 rounded-[2.5rem] border-amber-500/20 shadow-2xl relative overflow-hidden hover:bg-white/5 transition-all"
                        >
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                    <AlertCircle className="h-6 w-6 text-amber-500" />
                                </div>
                                <div className="space-y-2 text-left">
                                    <h4 className="text-white font-bold text-lg">Active Case</h4>
                                    <p className="text-white/40 text-sm leading-relaxed">
                                        Your consultation is {data.active_consultation.status}. Click here to view the latest update.
                                    </p>
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* App Features */}
                    <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 space-y-6">
                        <h4 className="text-white/40 font-bold text-xs uppercase tracking-widest text-center">Safety Guarantee</h4>
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                <ShieldCheck className="h-10 w-10 text-emerald-400" />
                            </div>
                            <p className="text-white/60 text-sm italic">
                                "Your data is encrypted and only shared with doctors if you request a consultation."
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
