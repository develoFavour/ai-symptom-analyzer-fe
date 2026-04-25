"use client";

import { useEffect, useState } from "react";
import {
    Users,
    AlertTriangle,
    CheckCircle,
    ChevronRight,
    Clock,
    ArrowUpRight,
    Loader2,
    Calendar,
    User,
    Stethoscope,
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
        urgentCount: 0,
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            const res = await api.get<Consultation[]>("/doctor/consultations");
            if (res.success && res.data) {
                setQueue(res.data);

                const pending = res.data.filter((c) => c.status === "pending").length;
                const answered = res.data.filter((c) => c.status === "answered").length;
                const urgent = res.data.filter((c) => c.urgency === "urgent" && c.status === "pending").length;

                setStats({
                    pending,
                    reviewedCount: answered,
                    urgentCount: urgent,
                });
            }
            setIsLoading(false);
        };
        fetchDashboardData();
    }, []);

    const urgencyConfig = {
        routine: "bg-emerald-500/10 text-emerald-500",
        soon: "bg-amber-500/10 text-amber-500",
        urgent: "animate-pulse bg-red-500/10 text-red-500",
    };

    return (
        <div className="mx-auto max-w-6xl space-y-10 pb-20 text-[#163332]">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#163332]">Clinical Dashboard</h1>
                    <p className="mt-1 text-[#698782]">Review patient requests and manage your medical queue.</p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-[#d7ebe6] bg-white px-4 py-2 shadow-[0_10px_24px_rgba(19,51,50,0.05)]">
                    <Calendar className="h-4 w-4 text-[#2c756e]" />
                    <span className="text-sm font-medium text-[#698782]">{format(new Date(), "MMMM do, yyyy")}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <StatCard
                    icon={<Clock className="h-6 w-6 text-amber-500" />}
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
                    icon={<CheckCircle className="h-6 w-6 text-emerald-500" />}
                    label="Reviewed Today"
                    value={stats.reviewedCount}
                    subtext="Successfully answered"
                />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-[#163332]">Incoming Queue</h2>
                        <Link
                            href="/doctor/consultations"
                            className="group flex items-center gap-1 text-xs font-bold text-[#2c756e] transition-colors hover:text-[#163332]"
                        >
                            VIEW FULL QUEUE
                            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center gap-4 rounded-[2.5rem] border border-[#dcece8] bg-white p-20 shadow-[0_18px_40px_rgba(19,51,50,0.05)]">
                            <Loader2 className="h-10 w-10 animate-spin text-[#2c756e]" />
                            <p className="text-sm text-[#8aa39e]">Syncing medical queue...</p>
                        </div>
                    ) : queue.length === 0 ? (
                        <div className="rounded-[2.5rem] border border-dashed border-[#d7ebe6] bg-white p-16 text-center shadow-[0_18px_40px_rgba(19,51,50,0.04)]">
                            <Stethoscope className="mx-auto mb-4 h-12 w-12 text-[#c4d7d3]" />
                            <h3 className="text-lg font-bold text-[#4f6d68]">Queue is Clear</h3>
                            <p className="mt-1 text-sm text-[#8aa39e]">New patient requests will appear here as they arrive.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {queue.slice(0, 5).map((consult) => (
                                <Link
                                    key={consult.id}
                                    href={`/doctor/consultations/${consult.id}`}
                                    className="group block rounded-3xl border border-[#dcece8] bg-white p-6 shadow-[0_14px_32px_rgba(19,51,50,0.05)] transition-all hover:border-[#bfded7] hover:bg-[#fcfffe]"
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d7ebe6] bg-[#f4fbf9] text-[#8aa39e] transition-colors group-hover:bg-[#eef8f5] group-hover:text-[#2c756e]">
                                                <User className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#163332] transition-colors group-hover:text-[#2c756e]">
                                                    {consult.user.name}
                                                </h4>
                                                <p className="text-xs text-[#8aa39e]">
                                                    {consult.user.age} yrs • {consult.user.gender}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 text-right">
                                            <div className={cn("rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider", urgencyConfig[consult.urgency])}>
                                                {consult.urgency}
                                            </div>
                                            {consult.session?.diagnoses?.some((d) => d.confidence === "high") && (
                                                <div className="flex items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter text-red-500 animate-pulse">
                                                    <AlertTriangle className="h-3 w-3" /> AI RED FLAG
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="line-clamp-1 text-sm italic text-[#698782]">&ldquo;{consult.symptoms}&rdquo;</p>
                                        </div>
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full text-[#8aa39e] transition-all group-hover:bg-[#eef8f5] group-hover:text-[#163332]">
                                            <ChevronRight className="h-4 w-4" />
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t border-[#e7f1ef] pt-4 font-mono text-[10px] uppercase tracking-widest text-[#8aa39e]">
                                        <span>Received: {format(new Date(consult.created_at), "HH:mm, MMM d")}</span>
                                        <span className="text-[#b7cbc7]">ID: {consult.id.slice(0, 8)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    <div className="rounded-[2.5rem] border border-[#cfe6e1] bg-[#eef8f5] p-8 shadow-[0_18px_40px_rgba(19,51,50,0.06)]">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#2c756e]">
                            <Users className="h-5 w-5" /> Active Review
                        </h3>
                        <p className="mb-6 text-sm leading-relaxed text-[#5f7e79]">
                            Verified health assessments are critical. Your professional input helps patients receive safer, better care.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-[#7d9a95]">Average Response Time</span>
                                <span className="font-bold text-[#163332]">2.4h</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#dcece8]">
                                <div className="h-full w-[80%] bg-[#2c756e]" />
                            </div>
                            <p className="text-[10px] font-medium text-[#4d8d82]">YOU ARE PERFORMING BETTER THAN 80% OF PEERS</p>
                        </div>
                    </div>

                    <div className="rounded-[2.5rem] border border-[#dcece8] bg-white p-8 shadow-[0_14px_32px_rgba(19,51,50,0.05)]">
                        <h3 className="mb-6 font-bold text-[#163332]">System Health</h3>
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

function StatCard({
    icon,
    label,
    value,
    subtext,
    highlight = false,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    subtext: string;
    highlight?: boolean;
}) {
    return (
        <div
            className={cn(
                "flex items-center gap-6 rounded-[2.5rem] border border-[#dcece8] bg-white p-8 shadow-[0_14px_32px_rgba(19,51,50,0.05)] transition-all hover:bg-[#fcfffe]",
                highlight && "border-red-200 bg-red-50/70",
            )}
        >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#d7ebe6] bg-[#f4fbf9]">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-[#7d9a95]">{label}</p>
                <h2 className="mt-1 text-3xl font-bold text-[#163332]">{value}</h2>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#8aa39e]">{subtext}</p>
            </div>
        </div>
    );
}

function HealthItem({ label, status }: { label: string; status: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-[#698782]">{label}</span>
            <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">{status}</span>
            </div>
        </div>
    );
}
