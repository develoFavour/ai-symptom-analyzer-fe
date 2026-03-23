"use client";

import { useEffect, useState } from "react";
import { 
    Search, Filter, ChevronRight, Clock, User, 
    Stethoscope, Loader2, Calendar, LayoutGrid, List, Bot, AlertTriangle
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
            const res = await api.get<Consultation[]>("/api/v1/doctor/consultations");
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
        routine: "text-emerald-400 bg-emerald-500/10",
        soon: "text-amber-400 bg-amber-500/10",
        urgent: "text-red-400 bg-red-500/10",
    };

    const statusConfig = {
        pending: "border-amber-500/20 text-amber-500 bg-amber-500/5",
        answered: "border-emerald-500/20 text-emerald-500 bg-emerald-500/5",
        closed: "border-white/10 text-white/30 bg-white/5",
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Consultation Queue</h1>
                    <p className="text-white/50 mt-2">Manage and respond to all assigned patient requests.</p>
                </div>
                
                {/* Stats summary */}
                <div className="flex gap-4">
                    <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl flex flex-col items-center">
                        <span className="text-white font-bold text-xl">{queue.filter(c => c.status === "pending").length}</span>
                        <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">Pending</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by patient name or symptom keyword..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all font-medium"
                    />
                </div>
                
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-white focus:outline-none focus:border-white/30 appearance-none font-bold text-sm cursor-pointer"
                >
                    <option value="all" className="bg-[#050505]">All Statuses</option>
                    <option value="pending" className="bg-[#050505]">Pending Only</option>
                    <option value="answered" className="bg-[#050505]">Answered</option>
                    <option value="closed" className="bg-[#050505]">Closed</option>
                </select>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-3 text-white/20">
                    <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                    <span>Retrieving patient queue...</span>
                </div>
            ) : filteredQueue.length === 0 ? (
                <div className="bg-white/5 border border-white/5 rounded-[3rem] p-24 text-center border-dashed">
                    <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Stethoscope className="h-10 w-10 text-white/10" />
                    </div>
                    <h3 className="text-xl font-bold text-white/60">No matching requests found</h3>
                    <p className="text-white/30 text-sm mt-1 max-w-sm mx-auto leading-relaxed">Try adjusting your filters or search terms to find what you're looking for.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredQueue.map(consult => (
                        <Link
                            key={consult.id}
                            href={`/doctor/consultations/${consult.id}`}
                            className="group bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/20 hover:bg-white/8 transition-all"
                        >
                            <div className="flex items-center gap-6">
                                <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all shadow-lg">
                                    <User className="h-7 w-7 text-white/20 group-hover:text-emerald-400" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-bold text-white text-lg group-hover:text-emerald-500 transition-colors">{consult.user.name}</h4>
                                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border", statusConfig[consult.status as keyof typeof statusConfig])}>
                                            {consult.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/40 line-clamp-1 italic max-w-md">"{consult.symptoms}"</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter flex items-center gap-1.5"><Clock className="h-3 w-3" /> {format(new Date(consult.created_at), "MMM d, HH:mm")}</span>
                                        <div className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter", urgencyConfig[consult.urgency])}>
                                            {consult.urgency} priority
                                        </div>
                                        {consult.session?.diagnoses?.some(d => d.confidence === "high") && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-tighter rounded-md animate-pulse">
                                                <AlertTriangle className="h-3 w-3" /> AI RED FLAG
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 self-end md:self-auto">
                                <div className="text-right hidden lg:block">
                                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Tracking Reference</p>
                                    <p className="text-xs text-white/40 font-mono mt-0.5">{consult.id.slice(0, 12)}</p>
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                                    <ChevronRight className="h-6 w-6 text-white/20 group-hover:text-white" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
