"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Bot,
    Plus,
    Loader2,
    MessageSquare,
    ChevronRight,
    Clock,
    AlertCircle,
} from "lucide-react";
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

interface CreateSessionResponse {
    session_id: string;
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
    const safeCurrentPage = Math.min(currentPage, Math.max(totalPages, 1));
    const currentSessions = sessions.slice(
        (safeCurrentPage - 1) * ITEMS_PER_PAGE,
        safeCurrentPage * ITEMS_PER_PAGE,
    );

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

    const startNewSession = async () => {
        setIsStarting(true);
        const res = await api.post<CreateSessionResponse>("/symptoms/sessions");
        if (res.success && res.data?.session_id) {
            router.push(`/symptom-checker/${res.data.session_id}`);
        } else {
            setIsStarting(false);
            alert(`Could not start a new session: ${res.error}`);
        }
    };

    const urgencyColor = (level: string) => {
        if (level === "emergency") return "text-red-400";
        if (level === "see_doctor") return "text-amber-500";
        return "text-emerald-500";
    };

    return (
        <div className="-mx-4 -mt-8 -mb-8 relative flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center bg-[#f7fbfa] py-12 text-[#163332] lg:-mx-8 lg:py-20">
            <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(29,90,86,0.07) 1px, transparent 1px)", backgroundSize: "34px 34px" }} />
            <div className="pointer-events-none absolute left-0 top-0 h-64 w-64 rounded-br-[3rem] bg-[#eef8f5]" />
            <div className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-tl-[3rem] bg-[#f1fbf8]" />

            <div className="relative z-10 flex w-full max-w-2xl flex-col items-center px-6 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-[#d7ebe6] bg-white shadow-[0_18px_40px_rgba(19,51,50,0.06)] lg:mb-8 lg:h-24 lg:w-24 lg:rounded-[2rem]">
                    <Bot className="h-10 w-10 text-[#2c756e] lg:h-12 lg:w-12" />
                </div>

                <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-[#163332] lg:text-5xl">
                    How are you feeling today?
                </h1>

                <p className="mb-8 max-w-xl text-base leading-relaxed text-[#698782] lg:mb-10 lg:text-lg">
                    Vitalis AI listens, asks clarifying questions, and gives you a medically-grounded preliminary assessment, securely stored and accessible from any device.
                </p>

                <button
                    onClick={startNewSession}
                    disabled={isStarting}
                    className="mb-10 flex h-12 items-center gap-3 rounded-full border border-[#8ec9be] bg-[#1d5a56] px-6 text-sm font-bold text-white transition-all hover:scale-105 hover:bg-[#236762] active:scale-95 disabled:pointer-events-none disabled:opacity-50 lg:mb-12 lg:h-14 lg:px-8 lg:text-base"
                >
                    {isStarting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin lg:h-5 lg:w-5" />
                            Starting Session...
                        </>
                    ) : (
                        <>
                            <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
                            Start New Conversation
                        </>
                    )}
                </button>

                <div className="w-full max-w-xl text-left">
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2 py-4 text-[#8aa39e]">
                            <Loader2 className="h-4 w-4 animate-spin text-[#2c756e]" />
                            <span className="text-sm font-medium">Loading your history...</span>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center gap-2 py-4 text-[#8aa39e]">
                            <AlertCircle className="h-4 w-4 text-red-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest">History unavailable</span>
                        </div>
                    ) : sessions.length > 0 ? (
                        <>
                            <div className="mb-4 flex items-center justify-between px-2">
                                <div className="flex items-center gap-2 text-[#7d9a95]">
                                    <Clock className="h-4 w-4" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] lg:text-xs">Previous Conversations</h3>
                                </div>
                                <span className="rounded-lg border border-[#d7ebe6] bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#8aa39e]">
                                    Page {safeCurrentPage} of {totalPages}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {currentSessions.map((session) => (
                                    <Link href={`${ROUTES.PATIENT.SYMPTOM_CHECKER}/${session.id}`} key={session.id} className="block group">
                                        <div className="flex items-center justify-between rounded-2xl border border-[#dcece8] bg-white p-4 shadow-[0_12px_28px_rgba(19,51,50,0.05)] transition-all group-hover:border-[#bfded7] group-hover:bg-[#fcfffe]">
                                            <div className="flex items-center gap-4 truncate">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d7ebe6] bg-[#eef8f5] transition-colors group-hover:bg-[#e2f4ef]">
                                                    <MessageSquare className="h-4 w-4 text-[#2c756e]" />
                                                </div>
                                                <div className="truncate text-left">
                                                    <p className="truncate text-sm font-medium text-[#163332]">
                                                        {session.title || "Untitled Assessment"}
                                                    </p>
                                                    <p className={`mt-1 text-[10px] font-bold uppercase tracking-wider opacity-70 ${urgencyColor(session.urgency_level)}`}>
                                                        {session.status === "completed"
                                                            ? `Completed · ${session.urgency_level?.replace("_", " ") || "Reviewing"}`
                                                            : "In Progress"}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-5 w-5 shrink-0 text-[#8aa39e] transition-all group-hover:translate-x-1 group-hover:text-[#163332]" />
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-8 flex items-center justify-center gap-4">
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={safeCurrentPage === 1}
                                        className="h-10 rounded-xl border border-[#d7ebe6] bg-white px-4 text-[10px] font-black uppercase tracking-widest text-[#7d9a95] transition-all hover:bg-[#eef8f5] hover:text-[#163332] disabled:pointer-events-none disabled:opacity-20"
                                    >
                                        Prev
                                    </button>
                                    <div className="flex gap-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`h-1.5 w-1.5 rounded-full transition-all ${safeCurrentPage === page ? "w-4 bg-[#2c756e]" : "bg-[#c6d9d5] hover:bg-[#9ecfc5]"}`}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={safeCurrentPage === totalPages}
                                        className="h-10 rounded-xl border border-[#d7ebe6] bg-white px-4 text-[10px] font-black uppercase tracking-widest text-[#7d9a95] transition-all hover:bg-[#eef8f5] hover:text-[#163332] disabled:pointer-events-none disabled:opacity-20"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="py-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#8aa39e] italic">
                            No stored health conversations found.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
