"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    Stethoscope, Search, Loader2, CheckCircle2, Shield, Zap, FileText,
    ChevronDown, Send, X, User, MessageCircle, Clock, AlertCircle, ChevronRight
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Doctor {
    id: string;
    name: string;
    specialization: string;
    credentials: string;
    created_at: string;
}

interface Consultation {
    id: string;
    doctor_id: string;
    symptoms: string;
    status: "pending" | "answered" | "closed";
    urgency: "routine" | "soon" | "urgent";
    sharing_mode: "full" | "summary";
    created_at: string;
    doctor?: Doctor;
}

type SharingMode = "summary" | "full";
type Urgency = "routine" | "soon" | "urgent";

export default function ConsultationPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Pre-fill from query params (passed from symptom-checker after diagnosis)
    const sessionId = searchParams.get("session") || "";
    const prefillSymptoms = searchParams.get("symptoms") || "";

    const [activeTab, setActiveTab] = useState<"requests" | "find">(sessionId ? "find" : "requests");
    
    // Data states
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Request Modal state
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [patientNote, setPatientNote] = useState("");
    const [urgency, setUrgency] = useState<Urgency>("routine");
    const [sharingMode, setSharingMode] = useState<SharingMode>("summary");
    const [symptoms, setSymptoms] = useState(prefillSymptoms);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [doctorsRes, consultsRes] = await Promise.all([
                api.get<Doctor[]>("/consultations/doctors"),
                api.get<Consultation[]>("/consultations")
            ]);

            if (doctorsRes.success && doctorsRes.data) setDoctors(doctorsRes.data);
            if (consultsRes.success && consultsRes.data) setConsultations(consultsRes.data);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const filteredDoctors = doctors.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.specialization.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async () => {
        if (!selectedDoctor) return;
        setIsSubmitting(true);

        const res = await api.post<any>("/consultations", {
            doctor_id: selectedDoctor.id,
            session_id: sessionId || undefined,
            symptoms,
            patient_note: patientNote,
            urgency,
            sharing_mode: sharingMode,
        });

        setIsSubmitting(false);
        if (res.success) {
            setSuccessMsg(`Your request has been sent to Dr. ${selectedDoctor.name}! They will review it and respond shortly.`);
            // Refresh list
            const updated = await api.get<Consultation[]>("/consultations");
            if (updated.success) setConsultations(updated.data || []);
            
            setTimeout(() => {
                setSuccessMsg("");
                setSelectedDoctor(null);
                setActiveTab("requests");
            }, 3000);
        } else {
            alert(`Error: ${res.error}`);
        }
    };

    const urgencyConfig = {
        routine: { label: "Routine", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
        soon: { label: "Soon", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
        urgent: { label: "Urgent", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
    };

    const statusConfig = {
        pending: { label: "Pending Review", color: "text-amber-400", bg: "bg-amber-400/10" },
        answered: { label: "Doctor Responded", color: "text-emerald-400", bg: "bg-emerald-400/10" },
        closed: { label: "Closed", color: "text-white/30", bg: "bg-white/5" },
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Medical Consultation</h1>
                    <p className="text-white/50 mt-2">Connect with healthcare professionals for expert advice on your health concerns.</p>
                </div>
                
                {/* Tabs */}
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shrink-0">
                    <button
                        onClick={() => setActiveTab("requests")}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                            activeTab === "requests" ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/60"
                        )}
                    >
                        <MessageCircle className="h-4 w-4" />
                        My Requests
                    </button>
                    <button
                        onClick={() => setActiveTab("find")}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                            activeTab === "find" ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/60"
                        )}
                    >
                        <Search className="h-4 w-4" />
                        Find a Doctor
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === "requests" ? (
                    /* ====== My Requests Tab ====== */
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/20">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <span>Loading your history...</span>
                            </div>
                        ) : consultations.length === 0 ? (
                            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-16 text-center">
                                <Stethoscope className="h-16 w-16 mx-auto mb-6 text-white/10" />
                                <h3 className="text-xl font-bold text-white mb-2">No Consultation Requests Yet</h3>
                                <p className="text-white/40 text-sm max-w-sm mx-auto mb-8">
                                    When you request a review from a doctor, it will appear here. You'll get notified when they respond.
                                </p>
                                <button
                                    onClick={() => setActiveTab("find")}
                                    className="px-8 py-3 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/15 transition-all text-sm"
                                >
                                    Browse Available Doctors
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {consultations.map(consult => (
                                    <div
                                        key={consult.id}
                                        onClick={() => router.push(`/consultation/${consult.id}`)}
                                        className="group bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/20 hover:bg-white/8 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all">
                                                <User className="h-7 w-7 text-white/20 group-hover:text-emerald-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-white">{consult.doctor?.name || "Unassigned Doctor"}</h4>
                                                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", statusConfig[consult.status].bg, statusConfig[consult.status].color)}>
                                                        {statusConfig[consult.status].label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-white/40 line-clamp-1 max-w-md">{consult.symptoms}</p>
                                                <div className="flex items-center gap-3 mt-2 text-[11px] text-white/20 font-medium font-mono uppercase tracking-widest">
                                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(consult.created_at), "MMM d, yyyy")}</span>
                                                    <span className="h-1 w-1 bg-white/10 rounded-full" />
                                                    <span className={urgencyConfig[consult.urgency].color}>{consult.urgency} Priority</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden md:block">
                                                <p className="text-xs text-white/30 font-medium">Tracking ID</p>
                                                <p className="text-xs text-white/50 font-mono mt-0.5">{consult.id.slice(0, 8)}...</p>
                                            </div>
                                            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                                                <ChevronRight className="h-5 w-5 text-white/30 group-hover:text-white" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* ====== Find a Doctor Tab ====== */
                    <div className="space-y-6">
                        {/* Search Bar */}
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, specialization, or expertise..."
                                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] pl-16 pr-6 py-5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-lg"
                            />
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-20 gap-3 text-white/30">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Discovering medical experts...</span>
                            </div>
                        ) : filteredDoctors.length === 0 ? (
                            <div className="text-center py-20 bg-white/5 border border-white/5 rounded-[2.5rem]">
                                <Search className="h-12 w-12 mx-auto mb-4 text-white/10" />
                                <p className="text-lg font-medium text-white/60">No matching doctors found</p>
                                <p className="text-sm text-white/30 mt-1">Try searching for "General" or another keyword.</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredDoctors.map(doctor => (
                                    <div
                                        key={doctor.id}
                                        className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:border-white/20 hover:bg-white/8 transition-all group flex flex-col gap-6 relative overflow-hidden"
                                    >
                                        {/* Background Decoration */}
                                        <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-all" />

                                        {/* Avatar & Name */}
                                        <div className="flex items-center gap-5 relative z-10">
                                            <div className="h-16 w-16 rounded-[1.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-xl shadow-emerald-500/5">
                                                <User className="h-8 w-8 text-emerald-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-lg leading-tight">{doctor.name}</h3>
                                                <p className="text-sm text-emerald-400 font-medium mt-1">{doctor.specialization || "General Medicine"}</p>
                                            </div>
                                        </div>

                                        {/* Credentials */}
                                        {doctor.credentials && (
                                            <p className="text-sm text-white/40 leading-relaxed italic">
                                                "{doctor.credentials}"
                                            </p>
                                        )}

                                        {/* Meta */}
                                        <div className="mt-auto space-y-4 pt-4 border-t border-white/5">
                                            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                                                <span className="text-white/20">Response Time</span>
                                                <span className="text-emerald-400">~2-4 Hours</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-white/30">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                                <span>Medical License Verified</span>
                                            </div>

                                            {/* Request Button */}
                                            <button
                                                onClick={() => setSelectedDoctor(doctor)}
                                                className="w-full h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all shadow-xl shadow-emerald-500/5 active:scale-95"
                                            >
                                                Send Request
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ====== Request Modal ====== */}
            {selectedDoctor && !successMsg && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-[#080808] border border-white/10 rounded-[3rem] p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-emerald-500/10 custom-scrollbar">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Consultation Details</h2>
                                <p className="text-white/50 text-base mt-2">Requesting clinical review from <span className="text-emerald-400 font-bold">{selectedDoctor.name}</span></p>
                            </div>
                            <button
                                onClick={() => setSelectedDoctor(null)}
                                className="h-12 w-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all active:scale-90"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-8">
                            {/* Symptoms */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1 block">Your Symptoms Summary</label>
                                <textarea
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                    placeholder="Enter symptoms for the doctor to review..."
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/8 resize-none transition-all text-sm leading-relaxed"
                                />
                            </div>

                            {/* Patient note */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1 block">Message to Doctor (Optional)</label>
                                <textarea
                                    value={patientNote}
                                    onChange={(e) => setPatientNote(e.target.value)}
                                    placeholder="Any specific questions? How does this affect your daily life?"
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/8 resize-none transition-all text-sm leading-relaxed"
                                />
                            </div>

                            {/* Urgency */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1 block">Select Urgency Level</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {(["routine", "soon", "urgent"] as Urgency[]).map(u => (
                                        <button
                                            key={u}
                                            onClick={() => setUrgency(u)}
                                            className={cn(
                                                "h-14 rounded-2xl border font-bold text-sm transition-all capitalize shadow-lg",
                                                urgency === u
                                                    ? urgencyConfig[u].bg + " " + urgencyConfig[u].color + " border-opacity-50"
                                                    : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                                            )}
                                        >
                                            {urgencyConfig[u].label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sharing Mode */}
                            {sessionId && (
                                <div className="space-y-4">
                                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1 block">
                                        Data Privacy & Sharing
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setSharingMode("summary")}
                                            className={cn(
                                                "relative flex flex-col items-start gap-4 p-6 rounded-3xl border text-left transition-all group",
                                                sharingMode === "summary"
                                                    ? "bg-emerald-500/10 border-emerald-500/30"
                                                    : "bg-white/5 border-white/10 hover:border-white/20"
                                            )}
                                        >
                                            <FileText className={cn("h-6 w-6", sharingMode === "summary" ? "text-emerald-400" : "text-white/20")} />
                                            <div>
                                                <p className="font-bold text-sm text-white">AI Clinical Summary</p>
                                                <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">Doctor only sees a structured summary of your chat. Most private.</p>
                                            </div>
                                            {sharingMode === "summary" && <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-emerald-400" />}
                                        </button>

                                        <button
                                            onClick={() => setSharingMode("full")}
                                            className={cn(
                                                "relative flex flex-col items-start gap-4 p-6 rounded-3xl border text-left transition-all group",
                                                sharingMode === "full"
                                                    ? "bg-blue-500/10 border-blue-500/30"
                                                    : "bg-white/5 border-white/10 hover:border-white/20"
                                            )}
                                        >
                                            <Shield className={cn("h-6 w-6", sharingMode === "full" ? "text-blue-400" : "text-white/20")} />
                                            <div>
                                                <p className="font-bold text-sm text-white">Full Chat History</p>
                                                <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">Doctor can read the entire AI chat transcript for maximum context.</p>
                                            </div>
                                            {sharingMode === "full" && <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-blue-400" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !symptoms.trim()}
                                className="w-full h-16 rounded-[1.5rem] bg-emerald-500 text-black font-extrabold text-lg hover:bg-emerald-400 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/20 mt-4 active:scale-95"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="h-6 w-6 animate-spin" /> Processing...</>
                                ) : (
                                    <><Send className="h-6 w-6" /> Send Consultation Request</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success overlay */}
            {successMsg && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
                    <div className="bg-[#080808] border border-emerald-500/30 rounded-[3rem] p-12 w-full max-w-md text-center shadow-2xl shadow-emerald-500/20">
                        <div className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-8 animate-bounce">
                            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">Request Successfully Sent</h2>
                        <p className="text-white/60 text-base leading-relaxed">{successMsg}</p>
                        <div className="mt-10 pt-10 border-t border-white/5">
                            <p className="text-emerald-400/30 text-[11px] font-bold uppercase tracking-[0.3em] font-mono">Closing modal...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
