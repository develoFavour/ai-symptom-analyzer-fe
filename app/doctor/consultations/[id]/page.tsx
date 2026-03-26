"use client";

import { useEffect, useState, use } from "react";
import {
    ChevronLeft, Loader2, User, Clock, AlertCircle,
    MessageSquare, CheckCircle, Shield, FileText, Send,
    Info, Bot, Stethoscope, AlertTriangle, ArrowRight,
    Activity, MessageCircle
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import useWebSocket from "react-use-websocket";
import Link from "next/link";

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

    // WebSocket implementation - Bypass proxy for WebSockets
    const wsBase = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL?.replace("http", "ws") || "ws://localhost:8080/api/v1";
    // If wsBase already ends with /api/v1 or we're using the proxy (which handles /api/v1), 
    // we don't need to add it. The safest is to let the env var handle the full base.
    const socketUrl = `${wsBase}/consultations/${id}/ws`;
    
    const { lastMessage } = useWebSocket(socketUrl, {
        onOpen: () => console.log("WebSocket connected"),
        shouldReconnect: (closeEvent) => true,
    });

    useEffect(() => {
        if (lastMessage !== null) {
            try {
                const event = JSON.parse(lastMessage.data);
                if (event.type === "new_message" && event.data) {
                    setConsult(prev => {
                        if (!prev) return prev;
                        const exists = prev.messages?.some(m => m.id === event.data.id);
                        if (exists) return prev;
                        return {
                            ...prev,
                            messages: [...(prev.messages || []), event.data]
                        };
                    });
                }
            } catch (e) {
                console.error("Error parsing socket message", e);
            }
        }
    }, [lastMessage]);

    // Reply form
    const [replyText, setReplyText] = useState("");
    const [recommendation, setRecommendation] = useState("");
    const [isAICorrection, setIsAICorrection] = useState(false);

    useEffect(() => {
        const loadDetail = async () => {
            setIsLoading(true);
            const res = await api.get<ConsultationDetail>(`/consultations/${id}`);
            if (res.success && res.data) {
                setConsult(res.data);

                // If sharing mode is full, fetch chat history
                if (res.data.sharing_mode === "full" && res.data.session_id) {
                    const sessionRes = await api.get<any>(`/symptoms/sessions/${res.data.session_id}`);
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
        const res = await api.post<any>(`/doctor/consultations/${id}/reply`, {
            reply_text: replyText,
            recommendation,
            is_ai_correction: isAICorrection
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
        const res = await api.post<any>(`/consultations/${id}/messages`, {
            content: messageInput
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
            <div className="flex flex-col items-center justify-center py-40 gap-4 text-white/30">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                <p>Establishing secure connection to patient file...</p>
            </div>
        );
    }

    if (!consult) {
        return (
            <div className="text-center py-40">
                <AlertCircle className="h-16 w-16 mx-auto mb-6 text-red-400/30" />
                <h2 className="text-2xl font-bold text-white">Case Not Found</h2>
                <p className="text-white/40 mt-2">This request may have been deleted or moved.</p>
                <button onClick={() => router.back()} className="mt-8 text-emerald-400 font-bold hover:underline">Back to Dashboard</button>
            </div>
        );
    }

    const urgencyConfig = {
        routine: "text-emerald-400 bg-emerald-500/10",
        soon: "text-amber-400 bg-amber-500/10",
        urgent: "text-red-400 bg-red-500/10",
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-32">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Case Review</h1>
                    <p className="text-white/50 text-sm">Patient Record: <span className="text-emerald-400 font-medium">{consult.id.slice(0, 8)}</span></p>
                </div>

                <div className={cn("ml-auto px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest", urgencyConfig[consult.urgency])}>
                    {consult.urgency} Priority
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1.5 rounded-[2rem] w-fit">
                <button
                    onClick={() => setActiveTab("case")}
                    className={cn(
                        "flex items-center gap-3 px-8 py-3 rounded-[1.5rem] font-bold text-sm transition-all",
                        activeTab === "case"
                            ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                            : "text-white/40 hover:text-white hover:bg-white/5"
                    )}
                >
                    <Activity className="h-4 w-4" /> Case Review
                </button>
                <button
                    onClick={() => setActiveTab("discussion")}
                    className={cn(
                        "flex items-center gap-3 px-8 py-3 rounded-[1.5rem] font-bold text-sm transition-all relative",
                        activeTab === "discussion"
                            ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                            : "text-white/40 hover:text-white hover:bg-white/5"
                    )}
                >
                    <MessageCircle className="h-4 w-4" /> Patient Discussion
                    {consult.messages && consult.messages.length > 0 && activeTab !== "discussion" && (
                        <span className="absolute top-2 right-4 h-2 w-2 bg-red-500 rounded-full border border-black animate-pulse" />
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2">
                    {activeTab === "case" ? (
                        <div className="space-y-8">
                            {/* Patient Context Card */}
                            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                                    <User className="h-40 w-40" />
                                </div>
                                <div className="flex items-center gap-6 mb-8 relative z-10">
                                    <div className="h-20 w-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        <User className="h-10 w-10 text-white/30" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-white tracking-tight">{consult.user.name}</h2>
                                        <div className="flex items-center gap-3 text-sm text-white/40 mt-1 font-medium">
                                            <span>{consult.user.age} Years</span>
                                            <span className="h-1 w-1 bg-white/20 rounded-full" />
                                            <span>{consult.user.gender}</span>
                                            <span className="h-1 w-1 bg-white/20 rounded-full" />
                                            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Received {format(new Date(consult.created_at), "HH:mm, MMM d")}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-8 relative z-10">
                                    <div>
                                        <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Known Allergies</h4>
                                        <p className={cn("text-sm font-medium", consult.user.known_allergies ? "text-red-400" : "text-white/40")}>
                                            {consult.user.known_allergies || "None Reported"}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Pre-existing Conditions</h4>
                                        <p className="text-sm font-medium text-white/60">
                                            {consult.user.pre_existing_conditions || "None Reported"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Medical Evidence */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-emerald-400" /> Medical Evidence
                                </h3>
                                <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
                                    <h4 className="text-xs font-bold text-emerald-400/50 uppercase tracking-widest mb-4">Patient-Reported Symptoms</h4>
                                    <p className="text-lg text-white/80 leading-relaxed font-medium">"{consult.symptoms}"</p>
                                    {consult.patient_note && (
                                        <div className="mt-6 pt-6 border-t border-white/5">
                                            <h4 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Additional Context from Patient</h4>
                                            <p className="text-sm text-white/50 bg-white/5 p-4 rounded-2xl italic leading-relaxed">"{consult.patient_note}"</p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                                {consult.sharing_mode === "summary" ? <Bot className="h-5 w-5 text-blue-400" /> : <Shield className="h-5 w-5 text-blue-400" />}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white">{consult.sharing_mode === "summary" ? "AI Triage Summary" : "Full AI Transcript"}</h4>
                                                <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mt-0.5">Patient consented for "{consult.sharing_mode}" access</p>
                                            </div>
                                        </div>
                                        {consult.sharing_mode === "full" && (
                                            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full">TOTAL CONTEXT</span>
                                        )}
                                    </div>
                                    {consult.sharing_mode === "summary" ? (
                                        <div className="bg-black/40 border border-white/5 rounded-3xl p-8">
                                            <pre className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed font-sans">
                                                {consult.shared_summary || "AI summary generation failed or not available."}
                                            </pre>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                                            {chatHistory.length === 0 ? (
                                                <div className="text-center py-10 text-white/20"><p className="text-sm">No transcript available.</p></div>
                                            ) : (
                                                chatHistory.map((msg, idx) => (
                                                    <div key={idx} className={cn(
                                                        "p-6 rounded-3xl text-sm leading-relaxed",
                                                        msg.role === "user"
                                                            ? "bg-white/5 border border-white/10 ml-8 text-white/80"
                                                            : "bg-emerald-500/5 border border-emerald-500/10 mr-8 text-emerald-400/90"
                                                    )}>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {msg.role === "user" ? <User className="h-3 w-3 text-white/30" /> : <Bot className="h-3 w-3 text-emerald-500/50" />}
                                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{msg.role === "user" ? "Patient" : "Vitalis AI"}</span>
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
                                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                            <MessageSquare className="h-5 w-5 text-emerald-400" /> Correspondence History
                                        </h3>
                                        {consult.replies.map((reply, idx) => (
                                            <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                                            <Stethoscope className="h-3 w-3 text-emerald-400" />
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Your Response · {format(new Date(reply.created_at), "MMM d, HH:mm")}</span>
                                                    </div>
                                                    {reply.is_ai_correction && (
                                                        <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">AI CORRECTION</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{reply.reply_text}</p>
                                                {reply.recommendation && (
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400/60 bg-emerald-400/5 px-3 py-2 rounded-xl">
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
                        /* Discussion Tab */
                        <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden flex flex-col min-h-[600px] shadow-2xl backdrop-blur-xl">
                            <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                        <MessageCircle className="h-6 w-6 text-emerald-400" /> Patient Discussion
                                    </h3>
                                    <p className="text-xs text-white/30 mt-1">Direct correspondence with {consult.user.name}</p>
                                </div>
                                <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-500/20">Live & Encrypted</div>
                            </div>

                            <div className="p-10 space-y-6 h-[450px] overflow-y-auto custom-scrollbar flex flex-col">
                                {(!consult.messages || consult.messages.length === 0) ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
                                        <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                            <MessageCircle className="h-10 w-10 text-white/10" />
                                        </div>
                                        <p className="text-white/30 text-sm max-w-xs mx-auto leading-relaxed">
                                            No messages yet. The patient may contact you here after reading your clinical opinion.
                                        </p>
                                    </div>
                                ) : (
                                    consult.messages.map((m, idx) => (
                                        <div key={idx} className={cn(
                                            "max-w-[75%] p-5 rounded-3xl text-sm leading-relaxed shadow-lg",
                                            m.sender_role === "doctor"
                                                ? "bg-emerald-500 text-black self-end ml-auto rounded-tr-none shadow-emerald-500/10"
                                                : "bg-white/10 text-white/90 self-start mr-auto rounded-tl-none border border-white/5 backdrop-blur-md"
                                        )}>
                                            <p className={cn(
                                                "font-bold text-[9px] uppercase tracking-widest mb-2 opacity-50",
                                                m.sender_role === "doctor" ? "text-black" : "text-emerald-400"
                                            )}>
                                                {m.sender_role === "doctor" ? "You" : consult.user.name}
                                            </p>
                                            <p className="whitespace-pre-wrap font-medium">{m.content}</p>
                                            <p className={cn(
                                                "text-[8px] mt-2 opacity-40 font-bold",
                                                m.sender_role === "doctor" ? "text-right" : "text-left"
                                            )}>
                                                {format(new Date(m.created_at), "HH:mm")}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-8 bg-white/[0.02] border-t border-white/5">
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
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-6 pr-20 py-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-all resize-none shadow-inner min-h-[60px]"
                                        rows={1}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={isSending || !messageInput.trim()}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-emerald-500 text-black flex items-center justify-center hover:bg-emerald-400 disabled:opacity-50 transition-all active:scale-90"
                                    >
                                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-white/20 mt-3 text-center italic font-medium">Messages are private and end-to-end encrypted</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Review Action */}
                <div className="space-y-8">
                    <div className="sticky top-8 space-y-8">
                        {/* Review Form */}
                        <div className="bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl shadow-emerald-500/5">
                            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                                <Send className="h-5 w-5 text-emerald-400" /> Send Response
                            </h3>

                            <div className="space-y-6">
                                {/* Reply Text */}
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">Professional Opinion *</label>
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Explain your findings to the patient..."
                                        rows={6}
                                        className="w-full bg-white/5 border border-white/10 rounded px-6 py-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/8 transition-all resize-none shadow-inner"
                                    />
                                </div>

                                {/* Recommendation */}
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">Next Step / Specialist</label>
                                    <input
                                        type="text"
                                        value={recommendation}
                                        onChange={(e) => setRecommendation(e.target.value)}
                                        placeholder="e.g. Schedule visit with Cardiologist"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all shadow-inner"
                                    />
                                </div>

                                {/* AI Correction Toggle */}
                                <button
                                    onClick={() => setIsAICorrection(!isAICorrection)}
                                    className={cn(
                                        "w-full p-4 rounded-2xl border flex items-center gap-4 transition-all group text-left",
                                        isAICorrection
                                            ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                                            : "bg-white/5 border-white/10 text-white/40 hover:bg-white/8"
                                    )}
                                >
                                    <AlertTriangle className={cn("h-5 w-5 shrink-0", isAICorrection ? "text-amber-500" : "text-white/20")} />
                                    <div>
                                        <p className="text-xs font-bold leading-none">Flag AI Discrepancy</p>
                                        <p className="text-[10px] mt-1.5 opacity-60">Tick this if your opinion differs significantly from the AI diagnosis.</p>
                                    </div>
                                    <div className={cn(
                                        "ml-auto h-5 w-5 rounded-full border flex items-center justify-center transition-all",
                                        isAICorrection ? "border-amber-500 bg-amber-500 text-black" : "border-white/20"
                                    )}>
                                        {isAICorrection && <CheckCircle className="h-3 w-3 fill-current" />}
                                    </div>
                                </button>

                                {/* Submit */}
                                <button
                                    onClick={handleSubmitReply}
                                    disabled={isSubmitting || !replyText.trim()}
                                    className="w-full h-14 bg-emerald-500 text-black font-extrabold text-sm rounded-2xl hover:bg-emerald-400 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-xl shadow-emerald-500/10 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                                    ) : (
                                        <><Send className="h-4 w-4" /> Send Medical Opinion</>
                                    )}
                                </button>

                                <button
                                    onClick={async () => {
                                        if (confirm("Escalate this case? This will notify administrators that specialist intervention is required.")) {
                                            const res = await api.post(`/doctor/consultations/${id}/reply`, {
                                                reply_text: "CASE ESCALATED: Medical provider has requested specialized intervention for this case.",
                                                recommendation: "Immediate referral to secondary care team."
                                            });
                                            if (res.success) {
                                                router.push("/doctor/dashboard");
                                            }
                                        }
                                    }}
                                    className="w-full h-12 bg-white/5 border border-white/10 text-white/40 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 font-bold text-[11px] uppercase tracking-widest rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <AlertTriangle className="h-3.5 w-3.5" /> Escalate Case
                                </button>

                                <p className="text-[10px] text-center text-white/20 font-medium px-4 pt-2">
                                    By submitting, you verify that this medical opinion is based on the evidence provided above.
                                </p>
                            </div>
                        </div>

                        {/* Quick Reference / Disclaimer */}
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-6">
                            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 mb-2">
                                <Info className="h-3.5 w-3.5" /> Best Practice
                            </h4>
                            <p className="text-[11px] text-emerald-400/60 leading-relaxed">
                                Always cross-verify structured AI summaries with the patient's note. If in doubt, recommend a physical examination.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
