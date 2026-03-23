"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Info, AlertCircle, Stethoscope } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface ChatMessage {
    role: "model" | "user";
    content: string;
}

interface Message {
    id: string;
    role: "assistant" | "user";
    content: string;
    isDiagnosis?: boolean;
    conditions?: Array<{ name: string; description: string; confidence: string; common_causes: string }>;
    urgency?: string;
    advice?: string;
}

const GREETING: Message = {
    id: "greeting",
    role: "assistant",
    content: "Hello! I'm Vitalis, your AI symptom assessment assistant. Please describe what you're feeling, including how long you've had the symptoms.",
};

// Convert server-side ChatMessage[] (role: "model"/"user") to display Messages
function serverHistoryToMessages(history: ChatMessage[]): Message[] {
    return history.map((m, i) => ({
        id: `h-${i}`,
        role: m.role === "model" ? "assistant" : "user",
        content: m.content,
    }));
}

export default function SymptomChatInterface({ chatId }: { chatId: string }) {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([GREETING]);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [hasDiagnosis, setHasDiagnosis] = useState(false); // tracks if any message is a final diagnosis
    const [diagnosisSymptoms, setDiagnosisSymptoms] = useState(""); // first user message for pre-fill

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // === Load session from server on mount (page refresh restore) ===
    useEffect(() => {
        const loadSession = async () => {
            setIsLoadingHistory(true);
            const res = await api.get<any>(`/api/v1/symptoms/sessions/${chatId}`);
            if (res.success && res.data) {
                const stored = res.data.chat_history;
                if (stored && stored !== "[]" && stored !== "") {
                    try {
                        const parsed: ChatMessage[] = typeof stored === "string" ? JSON.parse(stored) : stored;
                        if (parsed.length > 0) {
                            const mappedMessages = serverHistoryToMessages(parsed);
                            setMessages(mappedMessages);
                            
                            // Check if history already has a diagnosis
                            const hasDiag = parsed.some(m => m.role === "model" && m.content.includes("possible_conditions")); 
                            // Note: Since server stores raw JSON in some cases, we might need a better check.
                            // But usually, if the session status is 'completed' we can assume diagnosis.
                            if (res.data.status === "completed") {
                                setHasDiagnosis(true);
                            }

                            // Capture first user message for symptoms pre-fill
                            const firstUser = parsed.find(m => m.role === "user");
                            if (firstUser) setDiagnosisSymptoms(firstUser.content);
                        }
                    } catch (e) {
                        console.warn("Could not parse stored history", e);
                    }
                }
            } else {
                setLoadError("Session not found or you are not authorized.");
            }
            setIsLoadingHistory(false);
        };
        loadSession();
    }, [chatId]);

    // === Auto-scroll to bottom ===
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isThinking]);

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput("");
        setIsThinking(true);

        try {
            // Build the chat_history payload for the Go backend (role: "user" | "model")
            const chatHistory: ChatMessage[] = updatedMessages
                .filter(m => m.id !== "greeting") // exclude our static greeting we injected
                .map(m => ({
                    role: m.role === "assistant" ? "model" : "user",
                    content: m.content,
                }));

            const response = await api.post<any>("/api/v1/symptoms/chat", {
                session_id: chatId,
                patient_context: "Age: 30, General Health: Good",
                chat_history: chatHistory,
            });

            if (response.success && response.data) {
                const aiData = response.data;
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: aiData.bot_message,
                    isDiagnosis: aiData.is_diagnosis_ready,
                    conditions: aiData.possible_conditions,
                    urgency: aiData.urgency_level,
                    advice: aiData.health_advice,
                };
                setMessages(prev => [...prev, aiMsg]);
                
                if (aiData.is_diagnosis_ready) {
                    setHasDiagnosis(true);
                }

                // If this was the first turn, capture symptoms
                if (!diagnosisSymptoms && input) {
                    setDiagnosisSymptoms(input);
                }
            } else {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: `Error: ${response.error || "Failed to reach Vitalis AI."}`,
                }]);
            }
        } catch {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "I'm having trouble connecting right now. Please try again later.",
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    if (loadError) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-white/50">
                <AlertCircle className="h-10 w-10 text-red-400/60" />
                <p className="text-sm">{loadError}</p>
                <button
                    onClick={() => router.push("/symptom-checker")}
                    className="text-xs text-emerald-400 underline"
                >
                    ← Back to sessions
                </button>
            </div>
        );
    }

    if (isLoadingHistory) {
        return (
            <div className="flex items-center justify-center h-full gap-3 text-white/30">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Restoring session...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full bg-[#050505] relative">

            {/* Floating Reset Button */}
            <div className="absolute top-4 right-8 z-20">
                <button
                    onClick={() => router.push("/symptom-checker")}
                    className="h-10 px-4 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-xs font-bold shadow-xl backdrop-blur-md"
                >
                    <Info className="h-4 w-4" />
                    All Sessions
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 md:px-12 py-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="w-full max-w-7xl mx-auto space-y-6 pb-2">
                    <div className="text-center py-4">
                        <p className="text-white/20 text-xs font-bold uppercase tracking-widest">Session · {chatId.slice(0, 8)}</p>
                    </div>

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex gap-6 w-full",
                                msg.role === "user" ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            {/* Avatar */}
                            <div className={cn(
                                "h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center",
                                msg.role === "assistant"
                                    ? "bg-white/5 border border-white/10"
                                    : "bg-emerald-500/20"
                            )}>
                                {msg.role === "assistant"
                                    ? <Bot className="h-6 w-6 text-emerald-400" />
                                    : <User className="h-6 w-6 text-emerald-400" />
                                }
                            </div>

                            {/* Bubble */}
                            <div className={cn(
                                "px-6 py-4 rounded-[2rem] text-[16px] leading-relaxed relative max-w-[70%]",
                                msg.role === "assistant"
                                    ? "bg-[#0a2a2a] text-white/90 rounded-tl-none border border-white/5 shadow-xl shadow-black/20"
                                    : "bg-emerald-500/20 text-emerald-50 rounded-tr-none border border-emerald-500/20"
                            )}>
                                {msg.content}

                                {/* Diagnosis Cards */}
                                {msg.isDiagnosis && msg.conditions && (
                                    <div className="mt-4 space-y-4 pt-4 border-t border-white/10">
                                        {msg.conditions.map((cond, idx) => (
                                            <div key={idx} className="bg-black/20 p-4 rounded-xl">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-emerald-400">{cond.name}</h4>
                                                    <span className={cn(
                                                        "text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full",
                                                        cond.confidence === "high" ? "bg-red-500/20 text-red-500" :
                                                            cond.confidence === "medium" ? "bg-amber-500/20 text-amber-500" :
                                                                "bg-emerald-500/20 text-emerald-500"
                                                    )}>
                                                        {cond.confidence} Match
                                                    </span>
                                                </div>
                                                <p className="text-sm opacity-80">{cond.description}</p>
                                            </div>
                                        ))}

                                        {msg.advice && (
                                            <div className="mt-4 bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-xl">
                                                <h4 className="font-bold text-emerald-500 mb-1 text-sm">Recommended Action</h4>
                                                <p className="text-sm opacity-90">{msg.advice}</p>
                                            </div>
                                        )}

                                        {msg.urgency && (
                                            <div className="mt-2 text-xs font-bold px-3 py-2 rounded-lg bg-white/5 inline-block capitalize">
                                                Urgency: {msg.urgency.replace("_", " ")}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isThinking && (
                        <div className="flex gap-6 w-full animate-pulse">
                            <div className="h-12 w-12 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Bot className="h-6 w-6 text-white/20" />
                            </div>
                            <div className="px-6 py-4 rounded-[2rem] bg-[#0a2a2a] rounded-tl-none border border-white/5 flex items-center gap-2 shadow-xl shadow-black/20">
                                <div className="h-2.5 w-2.5 bg-white/20 rounded-full animate-bounce delay-75" />
                                <div className="h-2.5 w-2.5 bg-white/20 rounded-full animate-bounce delay-150" />
                                <div className="h-2.5 w-2.5 bg-white/20 rounded-full animate-bounce delay-300" />
                            </div>
                        </div>
                    )}

                    {/* Request Doctor Banner */}
                    {hasDiagnosis && (
                        <div className="mt-8 animate-fade-in-up">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 flex flex-col items-center text-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <Stethoscope className="h-8 w-8 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Need a professional opinion?</h3>
                                    <p className="text-white/50 text-sm mt-1 max-w-md">You can request a private consultation with one of our verified doctors to review your AI assessment.</p>
                                </div>
                                <Link 
                                    href={`/consultation?session=${chatId}&symptoms=${encodeURIComponent(diagnosisSymptoms)}`}
                                    className="px-8 py-3 rounded-2xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all shadow-lg hover:scale-105 active:scale-95"
                                >
                                    Request Doctor Consultation
                                </Link>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} className="h-1" />
                </div>
            </div>

            {/* Input Area */}
            <div className="px-6 md:px-12 py-6 shrink-0 bg-gradient-to-t from-[#050505] via-[#050505] to-[#050505]/80 backdrop-blur-sm relative z-10">
                <div className="w-full max-w-7xl mx-auto">
                    <div className="relative flex gap-4 items-end">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Type your symptoms here..."
                            className="flex-1 bg-white/5 border border-white/10 outline-none resize-none h-[60px] min-h-[60px] max-h-40 rounded-[2rem] text-white placeholder:text-white/20 px-6 py-4 text-[16px] scrollbar-none focus:border-white/30 focus:bg-white/10 transition-all shadow-inner"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isThinking}
                            className="h-[60px] w-[60px] shrink-0 rounded-[2rem] bg-white text-[#0a2a2a] flex items-center justify-center hover:bg-white/90 disabled:bg-white/10 disabled:text-white/20 transition-all shadow-xl"
                        >
                            {isThinking ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6 ml-1" />}
                        </button>
                    </div>
                    <p className="text-center text-xs text-white/30 mt-4 font-medium tracking-wide">
                        Disclaimer: Vitalis AI is for preliminary informational purposes and is not a substitute for professional medical advice.
                    </p>
                </div>
            </div>
        </div>
    );
}
