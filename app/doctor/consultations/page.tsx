"use client";

import { useEffect, useState } from "react";
import { 
    Search, ChevronRight, Clock, User,
    Stethoscope, Loader2, AlertTriangle
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

export default function DoctorConsultationsQueue() {
    const [queue, setQueue] = useState<Consultation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        const fetchQueue = async () => {
            setIsLoading(true);
            const res = await api.get<Consultation[]>("/doctor/consultations");
            if (res.success && res.data) {
                setQueue(res.data);
            }
            setIsLoading(false);
        };
        fetchQueue();
    }, []);

    const filteredQueue = queue.filter(c => {
        const matchesSearch = c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             c.symptoms.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const urgencyConfig = {
        routine: "bg-emerald-500/10 text-emerald-600",
        soon: "bg-amber-500/10 text-amber-600",
        urgent: "bg-red-500/10 text-red-600",
    };

    const statusConfig = {
        pending: "border-amber-200 bg-amber-50 text-amber-700",
        answered: "border-emerald-200 bg-emerald-50 text-emerald-700",
        closed: "border-slate-200 bg-slate-50 text-slate-500",
    };

    return (
        <div className="mx-auto max-w-6xl space-y-8 pb-20 text-[#163332]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#163332]">Consultation Queue</h1>
                    <p className="mt-2 text-[#698782]">Manage and respond to all assigned patient requests.</p>
                </div>
                
                {/* Stats summary */}
                <div className="flex gap-4">
                    <div className="flex flex-col items-center rounded-2xl border border-[#d7ebe6] bg-white px-5 py-3 shadow-[0_10px_24px_rgba(19,51,50,0.05)]">
                        <span className="text-xl font-bold text-[#163332]">{queue.filter(c => c.status === "pending").length}</span>
                        <span className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[#8aa39e]">Pending</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9bb3ae] transition-colors group-focus-within:text-[#2c756e]" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by patient name or symptom keyword..."
                        className="w-full rounded-2xl border border-[#d7ebe6] bg-white py-3 pl-12 pr-4 font-medium text-[#163332] placeholder:text-[#9bb3ae] shadow-[0_10px_24px_rgba(19,51,50,0.04)] transition-all focus:border-[#9dcfc6] focus:outline-none focus:ring-4 focus:ring-[#dff2ed]"
                    />
                </div>
                
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="cursor-pointer appearance-none rounded-2xl border border-[#d7ebe6] bg-white px-6 py-3 text-sm font-bold text-[#163332] shadow-[0_10px_24px_rgba(19,51,50,0.04)] transition-all focus:border-[#9dcfc6] focus:outline-none focus:ring-4 focus:ring-[#dff2ed]"
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending Only</option>
                    <option value="answered">Answered</option>
                    <option value="closed">Closed</option>
                </select>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-32 text-[#8aa39e]">
                    <Loader2 className="h-10 w-10 animate-spin text-[#2c756e]" />
                    <span>Retrieving patient queue...</span>
                </div>
            ) : filteredQueue.length === 0 ? (
                <div className="rounded-[3rem] border border-dashed border-[#d7ebe6] bg-white p-24 text-center shadow-[0_18px_40px_rgba(19,51,50,0.04)]">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f4fbf9]">
                        <Stethoscope className="h-10 w-10 text-[#c4d7d3]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#4f6d68]">No matching requests found</h3>
                    <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-[#8aa39e]">Try adjusting your filters or search terms to find what you&apos;re looking for.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredQueue.map(consult => (
                        <Link
                            key={consult.id}
                            href={`/doctor/consultations/${consult.id}`}
                            className="group flex flex-col justify-between gap-6 rounded-3xl border border-[#dcece8] bg-white p-6 shadow-[0_14px_32px_rgba(19,51,50,0.05)] transition-all hover:border-[#bfded7] hover:bg-[#fcfffe] md:flex-row md:items-center"
                        >
                            <div className="flex items-center gap-6">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#d7ebe6] bg-[#f4fbf9] shadow-sm transition-all group-hover:border-[#c6e4dd] group-hover:bg-[#eef8f5]">
                                    <User className="h-7 w-7 text-[#8aa39e] group-hover:text-[#2c756e]" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-lg font-bold text-[#163332] transition-colors group-hover:text-[#2c756e]">{consult.user.name}</h4>
                                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border", statusConfig[consult.status as keyof typeof statusConfig])}>
                                            {consult.status}
                                        </span>
                                    </div>
                                    <p className="max-w-md line-clamp-1 text-sm italic text-[#698782]">&ldquo;{consult.symptoms}&rdquo;</p>
                                    <div className="mt-2 flex items-center gap-4">
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter text-[#8aa39e]"><Clock className="h-3 w-3" /> {format(new Date(consult.created_at), "MMM d, HH:mm")}</span>
                                        <div className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter", urgencyConfig[consult.urgency])}>
                                            {consult.urgency} priority
                                        </div>
                                        {consult.session?.diagnoses?.some(d => d.confidence === "high") && (
                                            <div className="flex items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter text-red-500 animate-pulse">
                                                <AlertTriangle className="h-3 w-3" /> AI RED FLAG
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 self-end md:self-auto">
                                <div className="text-right hidden lg:block">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#8aa39e]">Tracking Reference</p>
                                    <p className="mt-0.5 font-mono text-xs text-[#698782]">{consult.id.slice(0, 12)}</p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4fbf9] transition-all group-hover:bg-[#eef8f5]">
                                    <ChevronRight className="h-6 w-6 text-[#8aa39e] group-hover:text-[#163332]" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
