"use client";

import { useEffect, useState, use } from "react";
import {
    ChevronLeft, Loader2, User, Clock, AlertCircle,
    MessageSquare, Shield, FileText, Send,
    Info, Stethoscope, AlertTriangle, ArrowRight,
    Activity, MessageCircle, Star
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
    symptoms: string;
    patient_note: string;
    created_at: string;
    doctor?: {
        name: string;
        specialization: string;
    };
    replies?: Array<{
        reply_text: string;
        recommendation?: string;
        is_ai_correction: boolean;
        created_at: string;
    }>;
    messages?: ConsultationMessage[];
}

interface ConsultationMessage {
    id: string;
    sender_id: string;
    sender_role: string;
    content: string;
    created_at: string;
}

export default function PatientConsultationDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [consult, setConsult] = useState<ConsultationDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [messageInput, setMessageInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [activeTab, setActiveTab] = useState<"summary" | "discussion">("summary");

    // WebSocket implementation - Bypass proxy for WebSockets
    const wsBase = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL?.replace("http", "ws") || "ws://localhost:8080/api/v1";
    const socketUrl = `${wsBase}/consultations/${id}/ws`;
    
    useWebSocket(socketUrl, {
        onOpen: () => console.log("WebSocket connected"),
        onMessage: (message) => {
            try {
                const event = JSON.parse(message.data);
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
        },
        shouldReconnect: () => true,
    });

    useEffect(() => {
        const loadDetail = async () => {
            setIsLoading(true);
            const res = await api.get<ConsultationDetail>(`/consultations/${id}`);
            if (res.success && res.data) {
                setConsult(res.data);
            }
            setIsLoading(false);
        };
        loadDetail();
    }, [id]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || isSending) return;
        setIsSending(true);
        const res = await api.post<ConsultationMessage>(`/consultations/${id}/messages`, {
            content: messageInput
        });
        if (res.success) {
            setMessageInput("");
            // The list will be updated by WebSocket, but we can also manually add it for speed
            if (res.data) {
                const newMessage = res.data;
                setConsult(prev => {
                    if (!prev) return prev;
                    if (prev.messages?.some(m => m.id === newMessage.id)) return prev;
                    return {
                        ...prev,
                        messages: [...(prev.messages || []), newMessage]
                    };
                });
            }
        } else {
            alert(`Failed: ${res.error}`);
        }
        setIsSending(false);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-40 text-[#88a19c]">
                <Loader2 className="h-10 w-10 animate-spin text-[#2c756e]" />
                <p>Retrieving your medical record...</p>
            </div>
        );
    }

    if (!consult) {
        return (
            <div className="text-center py-40">
                <AlertCircle className="h-16 w-16 mx-auto mb-6 text-red-400/30" />
                <h2 className="text-2xl font-bold text-[#163332]">Record Not Found</h2>
                <p className="mt-2 text-[#698782]">This consultation request may have been deleted.</p>
                <button onClick={() => router.back()} className="mt-8 font-bold text-[#2c756e] hover:underline">Return to History</button>
            </div>
        );
    }

    const isAnswered = consult.status === "answered";

    return (
        <div className="mx-auto max-w-5xl space-y-8 pb-32 text-[#163332]">
            {/* Header */}
            <div className="flex items-center gap-6">
                <button
                    onClick={() => router.back()}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d7ebe6] bg-white text-[#7ca6a0] transition-all hover:bg-[#eef8f5] hover:text-[#163332]"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#163332]">Consultation Details</h1>
                    <p className="mt-1 text-sm text-[#698782]">Reference ID: <span className="font-mono text-[#2c756e]">{consult.id}</span></p>
                </div>

                <div className={cn(
                    "ml-auto px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest border",
                    isAnswered ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-[#f4fbf9] border-[#d7ebe6] text-[#7d9a95]"
                )}>
                    {isAnswered ? "Review Complete" : "Pending Review"}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex w-fit items-center gap-1 rounded-[2rem] border border-[#d7ebe6] bg-white p-1.5 shadow-[0_10px_24px_rgba(19,51,50,0.05)]">
                <button
                    onClick={() => setActiveTab("summary")}
                    className={cn(
                        "flex items-center gap-3 px-8 py-3 rounded-[1.5rem] font-bold text-sm transition-all",
                        activeTab === "summary" 
                        ? "bg-[#1d5a56] text-white shadow-lg shadow-[#1d5a56]/15" 
                        : "text-[#7d9a95] hover:text-[#163332] hover:bg-[#f4fbf9]"
                    )}
                >
                    <Activity className="h-4 w-4" /> Medical Analysis
                </button>
                <button
                    onClick={() => setActiveTab("discussion")}
                    className={cn(
                        "flex items-center gap-3 px-8 py-3 rounded-[1.5rem] font-bold text-sm transition-all relative",
                        activeTab === "discussion" 
                        ? "bg-[#1d5a56] text-white shadow-lg shadow-[#1d5a56]/15" 
                        : "text-[#7d9a95] hover:text-[#163332] hover:bg-[#f4fbf9]"
                    )}
                >
                    <MessageCircle className="h-4 w-4" /> Discussion
                    {consult.messages && consult.messages.length > 0 && activeTab !== "discussion" && (
                        <span className="absolute top-2 right-4 h-2 w-2 animate-pulse rounded-full border border-white bg-red-500" />
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    {activeTab === "summary" ? (
                        <div className="space-y-10">
                            {/* Doctor's Response Section */}
                            {isAnswered && consult.replies && consult.replies.length > 0 ? (
                                <div className="space-y-6">
                                    <h3 className="ml-2 flex items-center gap-3 text-xl font-bold text-[#163332]">
                                        <Stethoscope className="h-5 w-5 text-[#2c756e]" /> Doctor&apos;s Clinical Assessment
                                    </h3>

                                    {consult.replies.map((reply, idx) => (
                                        <div key={idx} className="group relative overflow-hidden rounded-[3rem] border border-[#dcece8] bg-white p-10 text-[#163332] shadow-[0_18px_40px_rgba(19,51,50,0.06)] space-y-8">
                                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
                                                <MessageSquare className="h-32 w-32" />
                                            </div>

                                            <div className="flex items-center gap-6 relative z-10">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef8f5] text-[#2c756e]">
                                                    <User className="h-7 w-7" />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold tracking-tight">
                                                        {idx === 0 ? "Specialist Analysis" : "Follow-up Update"}
                                                    </h2>
                                                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#8aa39e]">Received {format(new Date(reply.created_at), "MMMM d, yyyy 'at' HH:mm")}</p>
                                                </div>
                                            </div>

                                            <div className="relative z-10">
                                                <p className="whitespace-pre-wrap text-lg font-medium leading-relaxed text-[#365653]">
                                                    {reply.reply_text}
                                                </p>
                                            </div>

                                            {reply.recommendation && (
                                                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] p-8 relative z-10">
                                                    <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/70">Doctor&apos;s Recommended Plan</h4>
                                                    <div className="flex items-start gap-5">
                                                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                            <ArrowRight className="h-6 w-6 text-emerald-400" />
                                                        </div>
                                                        <p className="text-lg font-medium leading-relaxed text-[#2b615c]">{reply.recommendation}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {reply.is_ai_correction && (
                                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 flex items-start gap-4 relative z-10">
                                                    <Info className="h-6 w-6 text-amber-600 shrink-0 mt-1" />
                                                    <div>
                                                        <p className="text-xs font-bold text-amber-900 uppercase tracking-tight">Professional Clarification</p>
                                                        <p className="text-xs font-medium text-amber-800/70 mt-1 leading-relaxed">
                                                            The attending doctor has provided a specialized opinion that may refine or differ from the initial AI assessment.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-[3rem] border border-dashed border-[#d7ebe6] bg-white p-20 text-center shadow-[0_18px_40px_rgba(19,51,50,0.04)]">
                                    <Clock className="mx-auto mb-6 h-12 w-12 animate-pulse text-[#c4d7d3]" />
                                    <h3 className="text-xl font-bold text-[#4f6d68]">Waiting for Specialist Review</h3>
                                    <p className="mx-auto mt-2 max-w-sm text-sm text-[#8aa39e]">
                                        A qualified medical professional is reviewing your symptoms and AI chat history. You&apos;ll receive an email once they reply.
                                    </p>
                                </div>
                            )}

                            {/* Case Context Re-cap */}
                            <div className="overflow-hidden rounded-[3rem] border border-[#dcece8] bg-white shadow-[0_18px_40px_rgba(19,51,50,0.05)]">
                                {/* Section Header */}
                                <div className="flex items-center gap-4 border-b border-[#e7f1ef] bg-[#f9fcfb] px-10 py-7">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold tracking-tight text-[#163332]">Case Reference & Submission</h3>
                                        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-[#8aa39e]">What you shared with your doctor</p>
                                    </div>
                                </div>

                                <div className="p-8 space-y-4">
                                    {/* Top row: symptoms + notes side by side */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="rounded-3xl border border-[#e7f1ef] bg-[#f9fcfb] p-6">
                                            <p className="text-[10px] font-bold text-emerald-400/50 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                                                Reported Symptoms
                                            </p>
                                            <p className="text-sm font-medium leading-relaxed text-[#365653]">
                                                &ldquo;{consult.symptoms}&rdquo;
                                            </p>
                                        </div>

                                        <div className="rounded-3xl border border-[#e7f1ef] bg-[#f9fcfb] p-6">
                                            <p className="text-[10px] font-bold text-emerald-400/50 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                                <span className="h-1.5 w-1.5 bg-white/20 rounded-full" />
                                                Your Notes
                                            </p>
                                            <p className="text-sm leading-relaxed italic text-[#698782]">
                                                {consult.patient_note || "No additional notes provided."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Triage AI Summary — full width, stylized */}
                                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-3xl overflow-hidden">
                                        <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-amber-500/10">
                                            <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                                <AlertTriangle className="h-4 w-4 text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">AI Triage Summary</p>
                                                <p className="text-[10px] text-amber-400/40 mt-0.5">Automatically generated from your symptom checker session</p>
                                            </div>
                                        </div>
                                        <div className="px-6 py-5">
                                            {consult.shared_summary ? (
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap text-[#5c7873]">
                                                    {consult.shared_summary}
                                                </p>
                                            ) : (
                                                <p className="text-sm italic text-[#8aa39e]">
                                                    No triage summary was shared. Your doctor has access to the full AI transcript.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Metadata row */}
                                    <div className="flex items-center gap-6 pt-2 px-2 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8aa39e]">Urgency</span>
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase px-2.5 py-1 rounded-full",
                                                consult.urgency === "urgent" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                                consult.urgency === "soon" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                                "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                            )}>
                                                {consult.urgency}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8aa39e]">Data Sharing</span>
                                            <span className="rounded-full border border-[#d7ebe6] bg-[#f4fbf9] px-2.5 py-1 text-[10px] font-bold uppercase text-[#698782]">
                                                {consult.sharing_mode === "full" ? "Full Transcript" : "Summary Only"}
                                            </span>
                                        </div>
                                        <div className="ml-auto text-[10px] font-medium text-[#8aa39e]">
                                            Submitted {format(new Date(consult.created_at), "MMMM d, yyyy")}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Discussion Tab Content */
                        <div className="space-y-6">
                            <div className="flex min-h-[600px] flex-col overflow-hidden rounded-[3rem] border border-[#dcece8] bg-white shadow-[0_18px_40px_rgba(19,51,50,0.06)]">
                                <div className="flex items-center justify-between border-b border-[#e7f1ef] bg-[#f9fcfb] p-10">
                                    <div className="text-left">
                                        <h3 className="flex items-center gap-3 text-xl font-bold text-[#163332]">
                                            <MessageSquare className="h-6 w-6 text-[#2c756e]" /> Direct Discussion
                                        </h3>
                                        <p className="mt-1 text-xs text-[#8aa39e]">Live correspondence with Dr. {consult.doctor?.name || "Specialist"}</p>
                                    </div>
                                    <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-500/20">Secure & Encrypted</div>
                                </div>

                                <div className="p-10 space-y-6 h-[450px] overflow-y-auto custom-scrollbar flex flex-col bg-transparent">
                                    {(!consult.messages || consult.messages.length === 0) ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
                                            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                                <MessageCircle className="h-10 w-10 text-white/10" />
                                            </div>
                                            <p className="text-white/30 text-sm max-w-xs mx-auto leading-relaxed">
                                                You can ask follow-up questions to your doctor here. Responses will appear in real-time.
                                            </p>
                                        </div>
                                    ) : (
                                        consult.messages.map((m, idx) => (
                                            <div key={idx} className={cn(
                                                "max-w-[75%] p-5 rounded-3xl text-sm leading-relaxed shadow-lg",
                                                m.sender_role === "patient"
                                                    ? "bg-emerald-500 text-black self-end ml-auto rounded-tr-none shadow-emerald-500/10"
                                                    : "bg-white/10 text-white/90 self-start mr-auto rounded-tl-none border border-white/5 backdrop-blur-md"
                                            )}>
                                                <p className={cn(
                                                    "font-bold text-[9px] uppercase tracking-widest mb-2 opacity-50",
                                                    m.sender_role === "patient" ? "text-black" : "text-emerald-400"
                                                )}>
                                                    {m.sender_role === "patient" ? "You" : `Dr. ${consult.doctor?.name}`}
                                                </p>
                                                <p className="whitespace-pre-wrap font-medium">{m.content}</p>
                                                <p className={cn(
                                                    "text-[8px] mt-2 opacity-40 font-bold",
                                                    m.sender_role === "patient" ? "text-right" : "text-left"
                                                )}>
                                                    {format(new Date(m.created_at), "HH:mm")}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Message Input Area */}
                                <div className="p-8 bg-white/[0.02] border-t border-white/5">
                                    <div className="relative group">
                                        <textarea
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                            placeholder="Ask a medical follow-up question..."
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl pl-6 pr-20 py-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-all resize-none shadow-inner min-h-[60px]"
                                            rows={1}
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={!messageInput.trim() || isSending}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-emerald-500 text-black flex items-center justify-center hover:bg-emerald-400 disabled:opacity-50 transition-all active:scale-90"
                                        >
                                            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-white/20 mt-3 text-center italic font-medium tracking-tight">Messages are secure and private between you and the clinician.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <aside className="space-y-8">
                    {/* Doctor Info */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] p-8 text-center space-y-6">
                        <div className="h-20 w-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-2xl translate-y-2">
                            <Stethoscope className="h-10 w-10 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-emerald-400/50 uppercase tracking-widest mb-1">Attending Specialist</p>
                            <h4 className="text-xl font-bold text-white">{consult.doctor?.name || "Assigning Doctor..."}</h4>
                            <p className="text-sm text-white/40 mt-1">{consult.doctor?.specialization || "General Practitioner"}</p>
                        </div>
                        <div className="pt-4 flex items-center justify-center gap-1">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 fill-emerald-500 text-emerald-500" />)}
                            <span className="text-[10px] font-bold text-white/30 ml-2">VERIFIED</span>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-4">
                        <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-emerald-500" />
                            <h4 className="text-sm font-bold text-white tracking-tight">Trust & Safety</h4>
                        </div>
                        <p className="text-xs text-white/30 leading-relaxed font-medium">
                            This consultation is private between you and the healthcare professional. All medical data is stored with end-to-end encryption.
                        </p>
                        <div className="pt-2">
                            <p className="text-[10px] text-white/20 italic leading-relaxed">
                                * This digital consultation is not for emergency use. If you are experiencing a life-threatening emergency, call your local emergency services immediately.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
