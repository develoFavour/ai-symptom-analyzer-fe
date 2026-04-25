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

interface SessionDetailResponse {
    chat_history: ChatMessage[] | string;
    status?: string;
}

interface ChatResponse {
    bot_message: string;
    is_diagnosis_ready: boolean;
    possible_conditions?: Array<{ name: string; description: string; confidence: string; common_causes: string }>;
    urgency_level?: string;
    health_advice?: string;
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
    const [hasDiagnosis, setHasDiagnosis] = useState(false);
    const [diagnosisSymptoms, setDiagnosisSymptoms] = useState("");

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadSession = async () => {
            setIsLoadingHistory(true);
            const res = await api.get<SessionDetailResponse>(`/symptoms/sessions/${chatId}`);
            if (res.success && res.data) {
                const stored = res.data.chat_history;
                if (stored && stored !== "[]" && stored !== "") {
                    try {
                        const parsed: ChatMessage[] = typeof stored === "string" ? JSON.parse(stored) : stored;
                        if (parsed.length > 0) {
                            const mappedMessages = serverHistoryToMessages(parsed);
                            setMessages(mappedMessages);

                            if (res.data.status === "completed") {
                                setHasDiagnosis(true);
                            }

                            const firstUser = parsed.find((m) => m.role === "user");
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
            const chatHistory: ChatMessage[] = updatedMessages
                .filter((m) => m.id !== "greeting")
                .map((m) => ({
                    role: m.role === "assistant" ? "model" : "user",
                    content: m.content,
                }));

            const response = await api.post<ChatResponse>("/symptoms/chat", {
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
                setMessages((prev) => [...prev, aiMsg]);

                if (aiData.is_diagnosis_ready) {
                    setHasDiagnosis(true);
                }

                if (!diagnosisSymptoms && input) {
                    setDiagnosisSymptoms(input);
                }
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: `Error: ${response.error || "Failed to reach Vitalis AI."}`,
                    },
                ]);
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "I'm having trouble connecting right now. Please try again later.",
                },
            ]);
        } finally {
            setIsThinking(false);
        }
    };

    if (loadError) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-[#698782]">
                <AlertCircle className="h-10 w-10 text-red-400/60" />
                <p className="text-sm">{loadError}</p>
                <button onClick={() => router.push("/symptom-checker")} className="text-xs text-[#2c756e] underline">
                    Back to sessions
                </button>
            </div>
        );
    }

    if (isLoadingHistory) {
        return (
            <div className="flex h-full items-center justify-center gap-3 text-[#8aa39e]">
                <Loader2 className="h-5 w-5 animate-spin text-[#2c756e]" />
                <span className="text-sm">Restoring session...</span>
            </div>
        );
    }

    return (
        <div className="relative flex h-full w-full flex-col bg-[#f7fbfa]">
            <div className="absolute right-8 top-4 z-20">
                <button
                    onClick={() => router.push("/symptom-checker")}
                    className="flex h-10 items-center gap-2 rounded-full border border-[#d7ebe6] bg-white px-4 text-xs font-bold text-[#698782] shadow-[0_12px_28px_rgba(19,51,50,0.05)] transition-all hover:bg-[#eef8f5] hover:text-[#163332]"
                >
                    <Info className="h-4 w-4" />
                    All Sessions
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-[#d7ebe6] scrollbar-track-transparent md:px-12">
                <div className="mx-auto w-full max-w-7xl space-y-6 pb-2">
                    <div className="py-4 text-center">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#8aa39e]">Session · {chatId.slice(0, 8)}</p>
                    </div>

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn("flex w-full gap-6", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
                        >
                            <div
                                className={cn(
                                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                                    msg.role === "assistant" ? "border border-[#d7ebe6] bg-white" : "bg-[#dff2ee]",
                                )}
                            >
                                {msg.role === "assistant" ? (
                                    <Bot className="h-6 w-6 text-[#2c756e]" />
                                ) : (
                                    <User className="h-6 w-6 text-[#2c756e]" />
                                )}
                            </div>

                            <div
                                className={cn(
                                    "relative max-w-[70%] rounded-[2rem] px-6 py-4 text-[16px] leading-relaxed",
                                    msg.role === "assistant"
                                        ? "rounded-tl-none border border-[#dcece8] bg-white text-[#365653] shadow-[0_14px_32px_rgba(19,51,50,0.05)]"
                                        : "rounded-tr-none border border-[#bfe0d9] bg-[#e8f6f3] text-[#163332]",
                                )}
                            >
                                {msg.content}

                                {msg.isDiagnosis && msg.conditions && (
                                    <div className="mt-4 space-y-4 border-t border-[#e7f1ef] pt-4">
                                        {msg.conditions.map((cond, idx) => (
                                            <div key={idx} className="rounded-xl border border-[#e7f1ef] bg-[#f9fcfb] p-4">
                                                <div className="mb-2 flex items-start justify-between">
                                                    <h4 className="font-bold text-emerald-600">{cond.name}</h4>
                                                    <span
                                                        className={cn(
                                                            "rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
                                                            cond.confidence === "high"
                                                                ? "bg-red-500/20 text-red-500"
                                                                : cond.confidence === "medium"
                                                                  ? "bg-amber-500/20 text-amber-500"
                                                                  : "bg-emerald-500/20 text-emerald-500",
                                                        )}
                                                    >
                                                        {cond.confidence} Match
                                                    </span>
                                                </div>
                                                <p className="text-sm text-[#5c7873]">{cond.description}</p>
                                            </div>
                                        ))}

                                        {msg.advice && (
                                            <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                                                <h4 className="mb-1 text-sm font-bold text-emerald-600">Recommended Action</h4>
                                                <p className="text-sm text-[#2f655f]">{msg.advice}</p>
                                            </div>
                                        )}

                                        {msg.urgency && (
                                            <div className="mt-2 inline-block rounded-lg bg-[#f4fbf9] px-3 py-2 text-xs font-bold capitalize text-[#5c7873]">
                                                Urgency: {msg.urgency.replace("_", " ")}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isThinking && (
                        <div className="flex w-full gap-6 animate-pulse">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#d7ebe6] bg-white">
                                <Bot className="h-6 w-6 text-[#9db2ae]" />
                            </div>
                            <div className="flex items-center gap-2 rounded-[2rem] rounded-tl-none border border-[#dcece8] bg-white px-6 py-4 shadow-[0_14px_32px_rgba(19,51,50,0.05)]">
                                <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#c5d9d5] delay-75" />
                                <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#c5d9d5] delay-150" />
                                <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#c5d9d5] delay-300" />
                            </div>
                        </div>
                    )}

                    {hasDiagnosis && (
                        <div className="mt-8 animate-fade-in-up">
                            <div className="flex flex-col items-center gap-4 rounded-3xl border border-[#cde7e1] bg-white p-8 text-center shadow-[0_14px_32px_rgba(19,51,50,0.05)]">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eef8f5]">
                                    <Stethoscope className="h-8 w-8 text-[#2c756e]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[#163332]">Need a professional opinion?</h3>
                                    <p className="mt-1 max-w-md text-sm text-[#698782]">
                                        You can request a private consultation with one of our verified doctors to review your AI assessment.
                                    </p>
                                </div>
                                <Link
                                    href={`/consultation?session=${chatId}&symptoms=${encodeURIComponent(diagnosisSymptoms)}`}
                                    className="rounded-2xl border border-[#8ec9be] bg-[#1d5a56] px-8 py-3 font-bold text-white transition-all hover:scale-105 hover:bg-[#236762] active:scale-95"
                                >
                                    Request Doctor Consultation
                                </Link>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} className="h-1" />
                </div>
            </div>

            <div className="relative z-10 shrink-0 border-t border-[#e7f1ef] bg-white px-6 py-6 md:px-12">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="relative flex items-end gap-4">
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
                            className="h-[60px] min-h-[60px] max-h-40 flex-1 resize-none rounded-[2rem] border border-[#d7ebe6] bg-[#f7fbfa] px-6 py-4 text-[16px] text-[#163332] outline-none placeholder:text-[#8aa39e] shadow-inner transition-all focus:border-[#8ec9be] focus:bg-white"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isThinking}
                            className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[2rem] border border-[#8ec9be] bg-[#1d5a56] text-white transition-all hover:bg-[#236762] disabled:border-[#d7ebe6] disabled:bg-[#eef4f2] disabled:text-[#9db2ae]"
                        >
                            {isThinking ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="ml-1 h-6 w-6" />}
                        </button>
                    </div>
                    <p className="mt-4 text-center text-xs font-medium tracking-wide text-[#8aa39e]">
                        Disclaimer: Vitalis AI is for preliminary informational purposes and is not a substitute for professional medical advice.
                    </p>
                </div>
            </div>
        </div>
    );
}
