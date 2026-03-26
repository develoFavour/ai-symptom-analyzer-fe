"use client";

import { useEffect, useState } from "react";
import { 
    Users, MessageSquare, AlertTriangle, CheckCircle, 
    ChevronRight, Clock, ArrowUpRight, Loader2,
    Calendar, User, Stethoscope
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";

interface Consultation {
    id: string;
    status: string;
    urgency: "routine" | "soon" | "urgent";
    created_at: string;
    user: {
        name: string;
        age: number;
        gender: string;
    };
    symptoms: string;
    session?: {
        diagnoses?: Array<{
            condition_name: string;
            confidence: string;
        }>;
    };
}

export default function DoctorDashboard() {
    const [queue, setQueue] = useState<Consultation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        pending: 0,
        reviewedCount: 0,
        urgentCount: 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            const res = await api.get<Consultation[]>("/doctor/consultations");
            if (res.success && res.data) {
                setQueue(res.data);
                
                // Calculate stats
                const pending = res.data.filter(c => c.status === "pending").length;
                const answered = res.data.filter(c => c.status === "answered").length;
                const urgent = res.data.filter(c => c.urgency === "urgent" && c.status === "pending").length;
                
                setStats({
                    pending,
                    reviewedCount: answered,
                    urgentCount: urgent
                });
            }
            setIsLoading(false);
        };
        fetchDashboardData();
    }, []);

    const urgencyConfig = {
        routine: "text-emerald-400 bg-emerald-500/10",
        soon: "text-amber-400 bg-amber-500/10",
        urgent: "text-red-400 bg-red-500/10 animate-pulse",
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            {/* Greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Clinical Dashboard</h1>
                    <p className="text-white/50 mt-1">Review patient requests and manage your medical queue.</p>
                </div>
                <div className="flex bg-white/5 px-4 py-2 rounded-2xl border border-white/10 items-center gap-3">
                    <Calendar className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-medium text-white/70">{format(new Date(), "MMMM do, yyyy")}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    icon={<Clock className="h-6 w-6 text-amber-400" />}
                    label="Pending Requests"
                    value={stats.pending}
                    subtext="Needs your review"
                />
                <StatCard 
                    icon={<AlertTriangle className="h-6 w-6 text-red-500" />}
                    label="Urgent Cases"
                    value={stats.urgentCount}
                    subtext="Priority attention"
                    highlight={stats.urgentCount > 0}
                />
                <StatCard 
                    icon={<CheckCircle className="h-6 w-6 text-emerald-400" />}
                    label="Reviewed Today"
                    value={stats.reviewedCount}
                    subtext="Successfully answered"
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Queue */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Incoming Queue</h2>
                        <Link href="/doctor/consultations" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 group">
                            VIEW FULL QUEUE <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
                            <p className="text-white/30 text-sm">Syncing medical queue...</p>
                        </div>
                    ) : queue.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-16 text-center border-dashed">
                            <Stethoscope className="h-12 w-12 mx-auto mb-4 text-white/5" />
                            <h3 className="text-lg font-bold text-white/40">Queue is Clear</h3>
                            <p className="text-white/20 text-sm mt-1">New patient requests will appear here as they arrive.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {queue.slice(0, 5).map(consult => (
                                <Link 
                                    key={consult.id}
                                    href={`/doctor/consultations/${consult.id}`}
                                    className="block bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/8 hover:border-white/20 transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-emerald-400 transition-colors">
                                                <User className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white group-hover:text-emerald-500 transition-colors">{consult.user.name}</h4>
                                                <p className="text-xs text-white/30">{consult.user.age} yrs • {consult.user.gender}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 text-right">
                                            <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", urgencyConfig[consult.urgency])}>
                                                {consult.urgency}
                                            </div>
                                            {consult.session?.diagnoses?.some(d => d.confidence === "high") && (
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-tighter rounded-md animate-pulse">
                                                    <AlertTriangle className="h-3 w-3" /> AI RED FLAG
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex-1">
                                            <p className="text-sm text-white/50 line-clamp-1 italic">"{consult.symptoms}"</p>
                                        </div>
                                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-white/20 group-hover:text-white group-hover:bg-white/5 transition-all">
                                            <ChevronRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-white/20 font-mono uppercase tracking-widest">
                                        <span>Received: {format(new Date(consult.created_at), "HH:mm, MMM d")}</span>
                                        <span className="text-white/10">ID: {consult.id.slice(0, 8)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar Info / Activity */}
                <div className="space-y-8">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] p-8">
                        <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                             <Users className="h-5 w-5" /> Active Review
                        </h3>
                        <p className="text-white/60 text-sm leading-relaxed mb-6">
                            Verified health assessments are critical. Your professional input helps patients receive safer, better care.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-white/30">Average Response Time</span>
                                <span className="text-white font-bold">2.4h</span>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full w-[80%]" />
                            </div>
                            <p className="text-[10px] text-emerald-400/50 font-medium">YOU ARE PERFORMING BETTER THAN 80% OF PEERS</p>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                        <h3 className="font-bold text-white mb-6">System Health</h3>
                        <div className="space-y-6">
                            <HealthItem label="AI Engine: Gemini 2.0" status="optimal" />
                            <HealthItem label="PostgreSQL Nodes" status="optimal" />
                            <HealthItem label="Knowledge Graphs" status="optimal" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, subtext, highlight = false }: any) {
    return (
        <div className={cn(
            "bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex items-center gap-6 transition-all hover:bg-white/8",
            highlight && "border-red-500/30 bg-red-500/5"
        )}>
            <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-white/30">{label}</p>
                <h2 className="text-3xl font-bold text-white mt-1">{value}</h2>
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-1">{subtext}</p>
            </div>
        </div>
    );
}

function HealthItem({ label, status }: any) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-white/50">{label}</span>
            <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{status}</span>
            </div>
        </div>
    );
}
