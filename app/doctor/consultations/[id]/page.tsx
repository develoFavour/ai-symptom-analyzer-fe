"use client";

import { useEffect, useState, use } from "react";
import {
    ChevronLeft,
    Loader2,
    User,
    Clock,
    AlertCircle,
    MessageSquare,
    CheckCircle,
    Shield,
    FileText,
    Send,
    Info,
    Bot,
    Stethoscope,
    AlertTriangle,
    ArrowRight,
    Activity,
    MessageCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import useWebSocket from "react-use-websocket";

interface ConsultationDetail {
    id: string;
    status: string;
    urgency: "routine" | "soon" | "urgent";
    sharing_mode: "full" | "summary";
    shared_summary?: string;
    session_id?: string;
    symptoms: string;
    patient_note: string;
    created_at: string;
    user: {
        id: string;
        name: string;
        age: number;
        gender: string;
        known_allergies?: string;
        pre_existing_conditions?: string;
    };
    replies?: Array<{
        reply_text: string;
        recommendation?: string;
        is_ai_correction: boolean;
        created_at: string;
    }>;
    messages?: Array<{
        id: string;
        sender_id: string;
        sender_role: string;
        content: string;
        created_at: string;
    }>;
}

interface ChatMessage {
    role: "model" | "user";
    content: string;
}

export default function DoctorConsultationReview({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [consult, setConsult] = useState<ConsultationDetail | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageInput, setMessageInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [activeTab, setActiveTab] = useState<"case" | "discussion">("case");

    const wsBase =
        process.env.NEXT_PUBLIC_WS_URL ||
        process.env.NEXT_PUBLIC_API_URL?.replace("http", "ws") ||
        "ws://localhost:8080/api/v1";
    const socketUrl = `${wsBase}/consultations/${id}/ws`;

    useWebSocket(socketUrl, {
        onOpen: () => console.log("WebSocket connected"),
        onMessage: (message) => {
            try {
                const event = JSON.parse(message.data);
                if (event.type === "new_message" && event.data) {
                    setConsult((prev) => {
                        if (!prev) return prev;
                        const exists = prev.messages?.some((m) => m.id === event.data.id);
                        if (exists) return prev;
                        return {
                            ...prev,
                            messages: [...(prev.messages || []), event.data],
                        };
                    });
                }
            } catch (e) {
                console.error("Error parsing socket message", e);
            }
        },
        shouldReconnect: () => true,
    });

    const [replyText, setReplyText] = useState("");
    const [recommendation, setRecommendation] = useState("");
    const [isAICorrection, setIsAICorrection] = useState(false);

    useEffect(() => {
        const loadDetail = async () => {
            setIsLoading(true);
            const res = await api.get<ConsultationDetail>(`/consultations/${id}`);
            if (res.success && res.data) {
                setConsult(res.data);

                if (res.data.sharing_mode === "full" && res.data.session_id) {
                    const sessionRes = await api.get<{ chat_history: ChatMessage[] | string }>(
                        `/symptoms/sessions/${res.data.session_id}`,
                    );
                    if (sessionRes.success && sessionRes.data) {
                        const history = sessionRes.data.chat_history;
                        setChatHistory(typeof history === "string" ? JSON.parse(history) : history);
                    }
                }
            }
            setIsLoading(false);
        };
        loadDetail();
    }, [id]);

    const handleSubmitReply = async () => {
        if (!replyText.trim()) return;
        setIsSubmitting(true);
        const res = await api.post(`/doctor/consultations/${id}/reply`, {
            reply_text: replyText,
            recommendation,
            is_ai_correction: isAICorrection,
        });
        setIsSubmitting(false);
        if (res.success) {
            router.push("/doctor/dashboard");
        } else {
            alert(`Error: ${res.error}`);
        }
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || isSending) return;
        setIsSending(true);
        const res = await api.post(`/consultations/${id}/messages`, {
            content: messageInput,
        });
        if (res.success) {
            setMessageInput("");
            const updated = await api.get<ConsultationDetail>(`/consultations/${id}`);
            if (updated.success) setConsult(updated.data);
        }
        setIsSending(false);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-40 text-[#8aa39e]">
                <Loader2 className="h-10 w-10 animate-spin text-[#2c756e]" />
                <p>Establishing secure connection to patient file...</p>
            </div>
        );
    }

    if (!consult) {
        return (
            <div className="py-40 text-center">
                <AlertCircle className="mx-auto mb-6 h-16 w-16 text-red-200" />
                <h2 className="text-2xl font-bold text-[#163332]">Case Not Found</h2>
                <p className="mt-2 text-[#698782]">This request may have been deleted or moved.</p>
                <button onClick={() => router.back()} className="mt-8 font-bold text-[#2c756e] hover:underline">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const urgencyConfig = {
        routine: "bg-emerald-500/10 text-emerald-600",
        soon: "bg-amber-500/10 text-amber-600",
        urgent: "bg-red-500/10 text-red-600",
    };

    return (
        <div className="mx-auto max-w-6xl space-y-8 pb-32 text-[#163332]">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d7ebe6] bg-white text-[#8aa39e] shadow-[0_10px_24px_rgba(19,51,50,0.05)] transition-all hover:text-[#163332]"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#163332]">Case Review</h1>
                    <p className="text-sm text-[#698782]">
                        Patient Record: <span className="font-medium text-[#2c756e]">{consult.id.slice(0, 8)}</span>
                    </p>
                </div>

                <div className={cn("ml-auto rounded-2xl px-4 py-2 text-xs font-bold uppercase tracking-widest", urgencyConfig[consult.urgency])}>
                    {consult.urgency} Priority
                </div>
            </div>

            <div className="flex w-fit items-center gap-1 rounded-[2rem] border border-[#d7ebe6] bg-white p-1.5 shadow-[0_10px_24px_rgba(19,51,50,0.04)]">
                <button
                    onClick={() => setActiveTab("case")}
                    className={cn(
                        "flex items-center gap-3 rounded-[1.5rem] px-8 py-3 text-sm font-bold transition-all",
                        activeTab === "case"
                            ? "bg-[#2c756e] text-white shadow-lg shadow-[#2c756e]/15"
                            : "text-[#7d9a95] hover:bg-[#f4fbf9] hover:text-[#163332]",
                    )}
                >
                    <Activity className="h-4 w-4" /> Case Review
                </button>
                <button
                    onClick={() => setActiveTab("discussion")}
                    className={cn(
                        "relative flex items-center gap-3 rounded-[1.5rem] px-8 py-3 text-sm font-bold transition-all",
                        activeTab === "discussion"
                            ? "bg-[#2c756e] text-white shadow-lg shadow-[#2c756e]/15"
                            : "text-[#7d9a95] hover:bg-[#f4fbf9] hover:text-[#163332]",
                    )}
                >
                    <MessageCircle className="h-4 w-4" /> Patient Discussion
                    {consult.messages && consult.messages.length > 0 && activeTab !== "discussion" && (
                        <span className="absolute right-4 top-2 h-2 w-2 rounded-full border border-white bg-red-500 animate-pulse" />
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    {activeTab === "case" ? (
                        <div className="space-y-8">
                            <div className="relative overflow-hidden rounded-[2.5rem] border border-[#dcece8] bg-white p-10 shadow-[0_14px_32px_rgba(19,51,50,0.05)]">
                                <div className="absolute right-0 top-0 p-10 opacity-[0.05]">
                                    <User className="h-40 w-40" />
                                </div>
                                <div className="relative z-10 mb-8 flex items-center gap-6">
                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-[#d7ebe6] bg-[#f4fbf9]">
                                        <User className="h-10 w-10 text-[#9bb3ae]" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold tracking-tight text-[#163332]">{consult.user.name}</h2>
                                        <div className="mt-1 flex items-center gap-3 text-sm font-medium text-[#698782]">
                                            <span>{consult.user.age} Years</span>
                                            <span className="h-1 w-1 rounded-full bg-[#c6d9d4]" />
                                            <span>{consult.user.gender}</span>
                                            <span className="h-1 w-1 rounded-full bg-[#c6d9d4]" />
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5" /> Received {format(new Date(consult.created_at), "HH:mm, MMM d")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative z-10 grid grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8aa39e]">Known Allergies</h4>
                                        <p className={cn("text-sm font-medium", consult.user.known_allergies ? "text-red-500" : "text-[#698782]")}>
                                            {consult.user.known_allergies || "None Reported"}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8aa39e]">Pre-existing Conditions</h4>
                                        <p className="text-sm font-medium text-[#698782]">
                                            {consult.user.pre_existing_conditions || "None Reported"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="flex items-center gap-3 text-xl font-bold text-[#163332]">
                                    <FileText className="h-5 w-5 text-[#2c756e]" /> Medical Evidence
                                </h3>

                                <div className="rounded-3xl border border-[#dcece8] bg-white p-8 shadow-[0_14px_32px_rgba(19,51,50,0.05)]">
                                    <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#2c756e]">Patient-Reported Symptoms</h4>
                                    <p className="text-lg font-medium leading-relaxed text-[#163332]">&ldquo;{consult.symptoms}&rdquo;</p>
                                    {consult.patient_note && (
                                        <div className="mt-6 border-t border-[#e7f1ef] pt-6">
                                            <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-[#8aa39e]">Additional Context from Patient</h4>
                                            <p className="rounded-2xl bg-[#f4fbf9] p-4 text-sm italic leading-relaxed text-[#698782]">
                                                &ldquo;{consult.patient_note}&rdquo;
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-[2.5rem] border border-[#dcece8] bg-white p-10 shadow-[0_14px_32px_rgba(19,51,50,0.05)]">
                                    <div className="mb-8 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf5ff]">
                                                {consult.sharing_mode === "summary" ? (
                                                    <Bot className="h-5 w-5 text-[#4d7bb3]" />
                                                ) : (
                                                    <Shield className="h-5 w-5 text-[#4d7bb3]" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-[#163332]">
                                                    {consult.sharing_mode === "summary" ? "AI Triage Summary" : "Full AI Transcript"}
                                                </h4>
                                                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[#8aa39e]">
                                                    Patient consented for &ldquo;{consult.sharing_mode}&rdquo; access
                                                </p>
                                            </div>
                                        </div>
                                        {consult.sharing_mode === "full" && (
                                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">
                                                TOTAL CONTEXT
                                            </span>
                                        )}
                                    </div>

                                    {consult.sharing_mode === "summary" ? (
                                        <div className="rounded-3xl border border-[#e7f1ef] bg-[#f7fbfa] p-8">
                                            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#5f7e79]">
                                                {consult.shared_summary || "AI summary generation failed or not available."}
                                            </pre>
                                        </div>
                                    ) : (
                                        <div className="max-h-[600px] space-y-4 overflow-y-auto pr-4 custom-scrollbar">
                                            {chatHistory.length === 0 ? (
                                                <div className="py-10 text-center text-[#8aa39e]">
                                                    <p className="text-sm">No transcript available.</p>
                                                </div>
                                            ) : (
                                                chatHistory.map((msg, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={cn(
                                                            "rounded-3xl p-6 text-sm leading-relaxed",
                                                            msg.role === "user"
                                                                ? "ml-8 border border-[#dcece8] bg-[#f7fbfa] text-[#4f6d68]"
                                                                : "mr-8 border border-emerald-100 bg-emerald-50 text-emerald-700",
                                                        )}
                                                    >
                                                        <div className="mb-2 flex items-center gap-2">
                                                            {msg.role === "user" ? (
                                                                <User className="h-3 w-3 text-[#9bb3ae]" />
                                                            ) : (
                                                                <Bot className="h-3 w-3 text-emerald-500" />
                                                            )}
                                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                                                                {msg.role === "user" ? "Patient" : "Vitalis AI"}
                                                            </span>
                                                        </div>
                                                        {msg.content}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                {consult.replies && consult.replies.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="flex items-center gap-3 text-xl font-bold text-[#163332]">
                                            <MessageSquare className="h-5 w-5 text-[#2c756e]" /> Correspondence History
                                        </h3>
                                        {consult.replies.map((reply, idx) => (
                                            <div
                                                key={idx}
                                                className="space-y-4 rounded-3xl border border-[#dcece8] bg-white p-8 shadow-[0_14px_32px_rgba(19,51,50,0.05)]"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100">
                                                            <Stethoscope className="h-3 w-3 text-emerald-700" />
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8aa39e]">
                                                            Your Response · {format(new Date(reply.created_at), "MMM d, HH:mm")}
                                                        </span>
                                                    </div>
                                                    {reply.is_ai_correction && (
                                                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-500">
                                                            AI CORRECTION
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#4f6d68]">{reply.reply_text}</p>
                                                {reply.recommendation && (
                                                    <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-700">
                                                        <ArrowRight className="h-3 w-3" /> REC: {reply.recommendation}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex min-h-[600px] flex-col overflow-hidden rounded-[3rem] border border-[#dcece8] bg-white shadow-[0_18px_40px_rgba(19,51,50,0.06)]">
                            <div className="flex items-center justify-between border-b border-[#e7f1ef] bg-[#f7fbfa] p-10">
                                <div>
                                    <h3 className="flex items-center gap-3 text-xl font-bold text-[#163332]">
                                        <MessageCircle className="h-6 w-6 text-[#2c756e]" /> Patient Discussion
                                    </h3>
                                    <p className="mt-1 text-xs text-[#8aa39e]">Direct correspondence with {consult.user.name}</p>
                                </div>
                                <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                                    Live & Encrypted
                                </div>
                            </div>

                            <div className="flex h-[450px] flex-col space-y-6 overflow-y-auto p-10 custom-scrollbar">
                                {!consult.messages || consult.messages.length === 0 ? (
                                    <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
                                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f4fbf9]">
                                            <MessageCircle className="h-10 w-10 text-[#c4d7d3]" />
                                        </div>
                                        <p className="mx-auto max-w-xs text-sm leading-relaxed text-[#8aa39e]">
                                            No messages yet. The patient may contact you here after reading your clinical opinion.
                                        </p>
                                    </div>
                                ) : (
                                    consult.messages.map((m, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "max-w-[75%] rounded-3xl p-5 text-sm leading-relaxed shadow-lg",
                                                m.sender_role === "doctor"
                                                    ? "ml-auto self-end rounded-tr-none bg-[#2c756e] text-white shadow-[#2c756e]/10"
                                                    : "mr-auto self-start rounded-tl-none border border-[#dcece8] bg-[#f7fbfa] text-[#4f6d68]",
                                            )}
                                        >
                                            <p
                                                className={cn(
                                                    "mb-2 text-[9px] font-bold uppercase tracking-widest opacity-50",
                                                    m.sender_role === "doctor" ? "text-white" : "text-[#2c756e]",
                                                )}
                                            >
                                                {m.sender_role === "doctor" ? "You" : consult.user.name}
                                            </p>
                                            <p className="whitespace-pre-wrap font-medium">{m.content}</p>
                                            <p className={cn("mt-2 text-[8px] font-bold opacity-40", m.sender_role === "doctor" ? "text-right" : "text-left")}>
                                                {format(new Date(m.created_at), "HH:mm")}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="border-t border-[#e7f1ef] bg-[#f7fbfa] p-8">
                                <div className="relative">
                                    <textarea
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder="Reply to patient..."
                                        className="min-h-[60px] w-full resize-none rounded-2xl border border-[#d7ebe6] bg-white py-4 pl-6 pr-20 text-sm text-[#163332] placeholder:text-[#9bb3ae] shadow-inner transition-all focus:border-[#9dcfc6] focus:outline-none focus:ring-4 focus:ring-[#dff2ed]"
                                        rows={1}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={isSending || !messageInput.trim()}
                                        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-[#2c756e] text-white transition-all active:scale-90 hover:bg-[#245f5a] disabled:opacity-50"
                                    >
                                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </button>
                                </div>
                                <p className="mt-3 text-center text-[10px] font-medium italic text-[#8aa39e]">
                                    Messages are private and end-to-end encrypted
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    <div className="sticky top-8 space-y-8">
                        <div className="rounded-[2.5rem] border border-[#dcece8] bg-white p-10 shadow-[0_18px_40px_rgba(19,51,50,0.06)]">
                            <h3 className="mb-8 flex items-center gap-3 text-xl font-bold text-[#163332]">
                                <Send className="h-5 w-5 text-[#2c756e]" /> Send Response
                            </h3>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="ml-1 text-[11px] font-bold uppercase tracking-widest text-[#8aa39e]">
                                        Professional Opinion *
                                    </label>
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Explain your findings to the patient..."
                                        rows={6}
                                        className="w-full resize-none rounded-2xl border border-[#d7ebe6] bg-[#f9fcfb] px-6 py-4 text-sm text-[#163332] placeholder:text-[#9bb3ae] shadow-inner transition-all focus:border-[#9dcfc6] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#dff2ed]"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="ml-1 text-[11px] font-bold uppercase tracking-widest text-[#8aa39e]">
                                        Next Step / Specialist
                                    </label>
                                    <input
                                        type="text"
                                        value={recommendation}
                                        onChange={(e) => setRecommendation(e.target.value)}
                                        placeholder="e.g. Schedule visit with Cardiologist"
                                        className="w-full rounded-2xl border border-[#d7ebe6] bg-[#f9fcfb] px-6 py-4 text-sm text-[#163332] placeholder:text-[#9bb3ae] shadow-inner transition-all focus:border-[#9dcfc6] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#dff2ed]"
                                    />
                                </div>

                                <button
                                    onClick={() => setIsAICorrection(!isAICorrection)}
                                    className={cn(
                                        "group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                                        isAICorrection
                                            ? "border-amber-300 bg-amber-50 text-amber-700"
                                            : "border-[#d7ebe6] bg-[#f9fcfb] text-[#698782] hover:bg-white",
                                    )}
                                >
                                    <AlertTriangle className={cn("h-5 w-5 shrink-0", isAICorrection ? "text-amber-600" : "text-[#9bb3ae]")} />
                                    <div>
                                        <p className="text-xs font-bold leading-none">Flag AI Discrepancy</p>
                                        <p className="mt-1.5 text-[10px] opacity-60">
                                            Tick this if your opinion differs significantly from the AI diagnosis.
                                        </p>
                                    </div>
                                    <div
                                        className={cn(
                                            "ml-auto flex h-5 w-5 items-center justify-center rounded-full border transition-all",
                                            isAICorrection ? "border-amber-500 bg-amber-500 text-white" : "border-[#c6d9d4]",
                                        )}
                                    >
                                        {isAICorrection && <CheckCircle className="h-3 w-3 fill-current" />}
                                    </div>
                                </button>

                                <button
                                    onClick={handleSubmitReply}
                                    disabled={isSubmitting || !replyText.trim()}
                                    className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#2c756e] text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(44,117,110,0.18)] transition-all active:scale-95 hover:bg-[#245f5a] disabled:pointer-events-none disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" /> Send Medical Opinion
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={async () => {
                                        if (
                                            confirm(
                                                "Escalate this case? This will notify administrators that specialist intervention is required.",
                                            )
                                        ) {
                                            const res = await api.post(`/doctor/consultations/${id}/reply`, {
                                                reply_text:
                                                    "CASE ESCALATED: Medical provider has requested specialized intervention for this case.",
                                                recommendation: "Immediate referral to secondary care team.",
                                            });
                                            if (res.success) {
                                                router.push("/doctor/dashboard");
                                            }
                                        }
                                    }}
                                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#d7ebe6] bg-[#f9fcfb] text-[11px] font-bold uppercase tracking-widest text-[#698782] transition-all active:scale-95 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                                >
                                    <AlertTriangle className="h-3.5 w-3.5" /> Escalate Case
                                </button>

                                <p className="px-4 pt-2 text-center text-[10px] font-medium text-[#8aa39e]">
                                    By submitting, you verify that this medical opinion is based on the evidence provided above.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
                            <h4 className="mb-2 flex items-center gap-2 text-xs font-bold text-emerald-700">
                                <Info className="h-3.5 w-3.5" /> Best Practice
                            </h4>
                            <p className="text-[11px] leading-relaxed text-emerald-700/80">
                                Always cross-verify structured AI summaries with the patient&apos;s note. If in doubt, recommend a physical examination.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
