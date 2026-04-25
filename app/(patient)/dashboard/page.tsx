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
            const res = await api.get<DashboardData>("/user/dashboard");
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
                <Loader2 className="mb-6 h-12 w-12 animate-spin text-[#2c756e]" />
                <h3 className="mb-2 text-xl font-bold text-[#163332]">Syncing Your Dashboard</h3>
                <p className="max-w-sm text-[#698782]">We&apos;re gathering your latest health insights and consultation records...</p>
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
        <div className="mx-auto max-w-7xl space-y-10 text-[#163332]">
            {/* Hero / Welcome Banner */}
            <section className="relative overflow-hidden rounded-[2.5rem] border border-[#dcece8] bg-white p-10 shadow-[0_24px_60px_rgba(19,51,50,0.08)] lg:p-14">
                <div className="absolute inset-y-0 right-0 w-2/5 bg-[#eef8f5]" />
                <div className="absolute bottom-0 left-0 h-32 w-32 rounded-tr-[3rem] bg-[#f4fbf9]" />
                <div className="relative z-10 max-w-xl space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d5ebe6] bg-[#f3fbf9] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#5f7e79]">
                        <Zap className="h-3 w-3 fill-amber-400 text-amber-400" />
                        AI Powered Health Assistant
                    </div>
                    <h1 className="text-4xl font-bold leading-tight text-[#163332] lg:text-5xl">
                        Check your symptoms <br />
                        <span className="font-medium italic text-[#6b8f89]">anytime, anywhere.</span>
                    </h1>
                    <p className="text-lg leading-relaxed text-[#698782]">
                        Welcome back, <span className="font-bold text-[#163332]">{user?.name}</span>. I&apos;m here to help you understand your symptoms. Get a quick health check and personalized advice in minutes.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        <Link
                            href={ROUTES.PATIENT.SYMPTOM_CHECKER}
                            className="group flex h-14 items-center gap-2 rounded-full border border-[#8ec9be] bg-[#1d5a56] px-8 text-lg font-bold text-white transition-all hover:bg-[#236762]"
                        >
                            Start Check
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href={ROUTES.PATIENT.CONSULTATION_REQUEST}
                            className="flex h-14 items-center gap-2 rounded-full border border-[#d7ebe6] bg-[#f7fbfa] px-8 text-lg font-bold text-[#163332] transition-all hover:bg-[#eef8f5]"
                        >
                            Talk to Doctor
                        </Link>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 items-center justify-center opacity-70 lg:flex">
                    <div className="relative h-[300px] w-[300px]">
                        <div className="absolute inset-0 rounded-full bg-[#dff2ee] blur-[100px]" />
                        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full border border-[#cae5df]" />
                        <Heart className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 text-[#b7cbc7]" />
                    </div>
                </div>
            </section>

            {/* Stats Overview */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {QUICK_STATS.map((stat) => (
                    <div key={stat.label} className="group flex items-center gap-5 rounded-[2rem] border border-[#dcece8] bg-white p-6 shadow-[0_14px_32px_rgba(19,51,50,0.05)] transition-colors hover:bg-[#fcfffe]">
                        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
                            <stat.icon className={cn("h-7 w-7", stat.color)} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-[#7b9792]">{stat.label}</p>
                            <p className="mt-0.5 text-2xl font-bold text-[#163332]">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <section className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="flex items-center gap-3 text-xl font-bold text-[#163332]">
                            Recent History
                            <span className="h-6 rounded-lg bg-[#eef8f5] px-2.5 text-xs font-bold leading-6 text-[#698782]">{RECENT_HISTORY.length} {RECENT_HISTORY.length === 1 ? "Entry" : "Entries"}</span>
                        </h3>
                        <Link href={ROUTES.PATIENT.SYMPTOM_CHECKER} className="text-sm font-bold text-[#698782] transition-colors hover:text-[#163332]">
                            View All
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {RECENT_HISTORY.length > 0 ? RECENT_HISTORY.map((item, idx) => (
                            <div key={idx} className="group flex items-center rounded-[2.5rem] border border-[#dcece8] bg-white p-6 shadow-[0_14px_32px_rgba(19,51,50,0.05)] transition-all hover:shadow-[0_18px_40px_rgba(19,51,50,0.07)]">
                                <div className="mr-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#d7ebe6] bg-[#f4fbf9]">
                                    <Clock className="h-6 w-6 text-[#8aa39e]" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-bold text-[#163332]">{item.title}</h4>
                                    <div className="flex items-center gap-4 mt-1.5">
                                        <span className="flex items-center gap-1.5 text-sm text-[#7d9a95]">
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
                                    href={item.type === "symptom_check" ? `${ROUTES.PATIENT.SYMPTOM_CHECKER}/${item.id}` : `${ROUTES.PATIENT.CONSULTATION}/${item.id}`}
                                    className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d7ebe6] text-[#8aa39e] transition-all group-hover:bg-[#eef8f5] group-hover:text-[#163332]"
                                >
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            </div>
                        )) : (
                            <div className="rounded-[2.5rem] border border-[#dcece8] bg-white p-10 text-center italic text-[#8aa39e] shadow-[0_14px_32px_rgba(19,51,50,0.05)]">
                                No recent symptom analyses found.
                            </div>
                        )}
                    </div>

                    <Link
                        href={ROUTES.PATIENT.SYMPTOM_CHECKER}
                        className="group flex h-20 w-full items-center justify-center gap-3 rounded-[2.5rem] border-2 border-dashed border-[#d7ebe6] bg-[#fbfefd] text-[#8aa39e] transition-all hover:border-[#b7d8d0] hover:text-[#163332]"
                    >
                        <Plus className="h-6 w-6 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-lg tracking-tight">Record New Symptom Analysis</span>
                    </Link>
                </section>

                {/* Sidebar Cards */}
                <aside className="space-y-8">
                    {/* Health Tip */}
                    <div className="group relative overflow-hidden rounded-[2.5rem] border border-[#dcece8] bg-[#eef8f5] p-8 shadow-[0_18px_40px_rgba(19,51,50,0.06)]">
                        <div className="absolute right-0 top-0 p-8 opacity-20 transition-transform duration-500 group-hover:scale-110">
                            <Activity className="h-24 w-24 text-[#8cb8b0]" />
                        </div>
                        <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#6b8f89]">Daily Health Tip</h4>
                        <p className="mb-6 text-xl font-medium leading-relaxed text-[#163332]">
                            {data?.health_tip}
                        </p>
                        <div className="h-1 w-20 rounded-full bg-[#4aa896]" />
                    </div>

                    {/* Pending Consultation Alert */}
                    {data?.active_consultation && (
                        <Link
                            href={`${ROUTES.PATIENT.CONSULTATION}/${data.active_consultation.id}`}
                            className="block overflow-hidden rounded-[2.5rem] border border-amber-200 bg-white p-8 shadow-[0_16px_36px_rgba(19,51,50,0.06)] transition-all hover:bg-[#fffdfa]"
                        >
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                    <AlertCircle className="h-6 w-6 text-amber-500" />
                                </div>
                                <div className="space-y-2 text-left">
                                    <h4 className="text-lg font-bold text-[#163332]">Active Case</h4>
                                    <p className="text-sm leading-relaxed text-[#698782]">
                                        Your consultation is {data.active_consultation.status}. Click here to view the latest update.
                                    </p>
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* App Features */}
                    <div className="space-y-6 rounded-[2.5rem] border border-[#dcece8] bg-white p-8 shadow-[0_14px_32px_rgba(19,51,50,0.05)]">
                        <h4 className="text-center text-xs font-bold uppercase tracking-widest text-[#698782]">Safety Guarantee</h4>
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#d7ebe6] bg-[#eef8f5]">
                                <ShieldCheck className="h-10 w-10 text-[#2c756e]" />
                            </div>
                            <p className="text-sm italic text-[#698782]">
                                &ldquo;Your data is encrypted and only shared with doctors if you request a consultation.&rdquo;
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
