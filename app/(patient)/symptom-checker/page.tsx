"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Plus, Loader2, MessageSquare, ChevronRight, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ROUTES } from "@/constants/route.constants";

interface SessionSummary {
    id: string;
    title: string;
    status: string;
    urgency_level: string;
    created_at: string;
}

export default function SymptomCheckerLandingPage() {
    const router = useRouter();
    const [isStarting, setIsStarting] = useState(false);
    const [sessions, setSessions] = useState<SessionSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const ITEMS_PER_PAGE = 3;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(sessions.length / ITEMS_PER_PAGE);
    const currentSessions = sessions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Load previous sessions from the server
    useEffect(() => {
        const fetchSessions = async () => {
            setIsLoading(true);
            const res = await api.get<SessionSummary[]>("/symptoms/sessions");
            if (res.success && res.data) {
                setSessions(res.data);
            } else {
                setError(res.error);
            }
            setIsLoading(false);
        };
        fetchSessions();
    }, []);

    // Reset page if sessions change
    useEffect(() => {
        setCurrentPage(1);
    }, [sessions]);

    const startNewSession = async () => {
        setIsStarting(true);
        const res = await api.post<{ session_id: string }>("/symptoms/sessions");
        if (res.success && res.data?.session_id) {
            router.push(`/symptom-checker/${res.data.session_id}`);
        } else {
            setIsStarting(false);
            alert(`Could not start a new session: ${res.error}`);
        }
    };

    const urgencyColor = (level: string) => {
        if (level === "emergency") return "text-red-400";
        if (level === "see_doctor") return "text-amber-400";
        return "text-emerald-400";
    };

    return (
        <div className="-mx-4 lg:-mx-8 -mt-8 -mb-8 lg:h-[calc(100vh-5rem)] min-h-[calc(100vh-5rem)] py-12 lg:py-0 flex flex-col items-center justify-center bg-[#050505] text-white overflow-hidden relative">

            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] lg:w-[800px] h-[600px] lg:h-[800px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full px-6">
                <div className="h-20 w-20 lg:h-24 lg:w-24 rounded-[1.5rem] lg:rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-2xl shadow-emerald-500/10 mb-6 lg:mb-8">
                    <Bot className="h-10 w-10 lg:h-12 lg:w-12 text-emerald-400" />
                </div>

                <h1 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 leading-tight">
                    How are you feeling today?
                </h1>

                <p className="text-base lg:text-lg text-white/50 mb-8 lg:mb-10 max-w-xl leading-relaxed">
                    Vitalis AI listens, asks clarifying questions, and gives you a medically-grounded preliminary assessment — securely stored and accessible from any device.
                </p>

                <button
                    onClick={startNewSession}
                    disabled={isStarting}
                    className="h-12 lg:h-14 px-6 lg:px-8 rounded-full bg-emerald-500 text-black text-sm lg:text-base font-bold hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:pointer-events-none mb-10 lg:mb-12"
                >
                    {isStarting ? (
                        <>
                            <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin" />
                            Starting Session...
                        </>
                    ) : (
                        <>
                            <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
                            Start New Conversation
                        </>
                    )}
                </button>

                {/* Session History Section */}
                <div className="w-full max-w-xl text-left">
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2 text-white/30 py-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm font-medium">Loading your history...</span>
                        </div>
                    ) : error ? (
                        <div className="flex items-center gap-2 text-white/30 py-4 justify-center">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm uppercase tracking-widest font-black text-[10px]">History unavailable</span>
                        </div>
                    ) : sessions.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between mb-4 px-2">
                                <div className="flex items-center gap-2 text-white/40">
                                    <Clock className="h-4 w-4" />
                                    <h3 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em]">Previous Conversations</h3>
                                </div>
                                <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                                    Page {currentPage} of {totalPages}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {currentSessions.map(session => (
                                    <Link href={`${ROUTES.PATIENT.SYMPTOM_CHECKER}/${session.id}`} key={session.id} className="block group">
                                        <div className="bg-white/5 border border-white/10 group-hover:border-white/20 group-hover:bg-white/10 transition-all rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-emerald-500/5">
                                            <div className="flex items-center gap-4 truncate">
                                                <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                                                    <MessageSquare className="h-4 w-4 text-emerald-400" />
                                                </div>
                                                <div className="truncate text-left">
                                                    <p className="text-sm font-medium text-white/90 truncate">{session.title || "Untitled Assessment"}</p>
                                                    <p className={`text-[10px] font-bold mt-1 uppercase tracking-wider opacity-60 ${urgencyColor(session.urgency_level)}`}>
                                                        {session.status === "completed"
                                                            ? `Completed · ${session.urgency_level?.replace("_", " ") || "Reviewing"}`
                                                            : "In Progress"}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-white transition-all transform group-hover:translate-x-1 shrink-0" />
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-4 mt-8">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="h-10 px-4 rounded-xl border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-all"
                                    >
                                        Prev
                                    </button>
                                    <div className="flex gap-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-1.5 h-1.5 rounded-full transition-all ${currentPage === page ? "bg-emerald-500 w-4 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-white/10 hover:bg-white/20"}`}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="h-10 px-4 rounded-xl border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-all"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 py-4 italic">
                            No stored health conversations found.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
