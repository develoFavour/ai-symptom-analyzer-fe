"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
	Stethoscope,
	Search,
	Loader2,
	CheckCircle2,
	FileText,
	Send,
	X,
	User,
	MessageCircle,
	Clock,
	ChevronRight,
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

	const [activeTab, setActiveTab] = useState<"requests" | "find">(
		sessionId ? "find" : "requests",
	);

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
				api.get<Consultation[]>("/consultations"),
			]);

			if (doctorsRes.success && doctorsRes.data) setDoctors(doctorsRes.data);
			if (consultsRes.success && consultsRes.data)
				setConsultations(consultsRes.data);
			setIsLoading(false);
		};
		fetchData();
	}, []);

	const filteredDoctors = doctors.filter(
		(d) =>
			d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			d.specialization.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const handleSubmit = async () => {
		if (!selectedDoctor) return;
		setIsSubmitting(true);

		const res = await api.post<Consultation>("/consultations", {
			doctor_id: selectedDoctor.id,
			session_id: sessionId || undefined,
			symptoms,
			patient_note: patientNote,
			urgency,
			sharing_mode: sharingMode,
		});

		setIsSubmitting(false);
		if (res.success) {
			setSuccessMsg(
				`Your request has been sent to Dr. ${selectedDoctor.name}! They will review it and respond shortly.`,
			);
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
		routine: {
			label: "Routine",
			color: "text-emerald-400",
			bg: "bg-emerald-500/10 border-emerald-500/20",
		},
		soon: {
			label: "Soon",
			color: "text-amber-400",
			bg: "bg-amber-500/10 border-amber-500/20",
		},
		urgent: {
			label: "Urgent",
			color: "text-red-400",
			bg: "bg-red-500/10 border-red-500/20",
		},
	};

	const statusConfig = {
		pending: {
			label: "Pending Review",
			color: "text-amber-400",
			bg: "bg-amber-400/10",
		},
		answered: {
			label: "Doctor Responded",
			color: "text-emerald-400",
			bg: "bg-emerald-400/10",
		},
		closed: { label: "Closed", color: "text-white/30", bg: "bg-white/5" },
	};

	return (
		<div className="mx-auto max-w-5xl space-y-8 pb-20 text-[#163332]">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-[#163332]">
						Medical Consultation
					</h1>
					<p className="mt-2 text-[#698782]">
						Connect with healthcare professionals for expert advice on your
						health concerns.
					</p>
				</div>

				{/* Tabs */}
				<div className="flex shrink-0 rounded-2xl border border-[#d7ebe6] bg-white p-1 shadow-[0_10px_24px_rgba(19,51,50,0.05)]">
					<button
						onClick={() => setActiveTab("requests")}
						className={cn(
							"px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
							activeTab === "requests"
								? "bg-[#e8f6f3] text-[#163332] shadow-sm"
								: "text-[#6c8b86] hover:text-[#163332]",
						)}
					>
						<MessageCircle className="h-4 w-4" />
						My Requests
					</button>
					<button
						onClick={() => setActiveTab("find")}
						className={cn(
							"px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
							activeTab === "find"
								? "bg-[#e8f6f3] text-[#163332] shadow-sm"
								: "text-[#6c8b86] hover:text-[#163332]",
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
							<div className="flex flex-col items-center justify-center gap-3 py-20 text-[#88a19c]">
								<Loader2 className="h-8 w-8 animate-spin text-[#2c756e]" />
								<span>Loading your history...</span>
							</div>
						) : consultations.length === 0 ? (
							<div className="rounded-[2.5rem] border border-[#dcece8] bg-white p-16 text-center shadow-[0_18px_40px_rgba(19,51,50,0.06)]">
								<Stethoscope className="mx-auto mb-6 h-16 w-16 text-[#b7cbc7]" />
								<h3 className="mb-2 text-xl font-bold text-[#163332]">
									No Consultation Requests Yet
								</h3>
								<p className="mx-auto mb-8 max-w-sm text-sm text-[#698782]">
									When you request a review from a doctor, it will appear here.
									You&apos;ll get notified when they respond.
								</p>
								<button
									onClick={() => setActiveTab("find")}
									className="rounded-2xl border border-[#8ec9be] bg-[#1d5a56] px-8 py-3 text-sm font-bold text-white transition-all hover:bg-[#236762]"
								>
									Browse Available Doctors
								</button>
							</div>
						) : (
							<div className="grid gap-4">
								{consultations.map((consult) => (
									<div
										key={consult.id}
										onClick={() => router.push(`/consultation/${consult.id}`)}
										className="group flex cursor-pointer flex-col justify-between gap-6 rounded-3xl border border-[#dcece8] bg-white p-6 transition-all hover:border-[#b8d8d1] hover:shadow-[0_16px_36px_rgba(19,51,50,0.06)] md:flex-row md:items-center"
									>
										<div className="flex items-center gap-5">
											<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#d7ebe6] bg-[#f4fbf9] transition-all group-hover:border-[#9ecfc5] group-hover:bg-[#e8f6f3]">
												<User className="h-7 w-7 text-[#7ca6a0] group-hover:text-[#2c756e]" />
											</div>
											<div>
												<div className="flex items-center gap-2 mb-1">
													<h4 className="font-bold text-[#163332]">
														{consult.doctor?.name || "Unassigned Doctor"}
													</h4>
													<span
														className={cn(
															"px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
															statusConfig[consult.status].bg,
															statusConfig[consult.status].color,
														)}
													>
														{statusConfig[consult.status].label}
													</span>
												</div>
												<p className="max-w-md line-clamp-1 text-sm text-[#698782]">
													{consult.symptoms}
												</p>
												<div className="mt-2 flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-widest text-[#8aa39e]">
													<span className="flex items-center gap-1">
														<Clock className="h-3 w-3" />{" "}
														{format(
															new Date(consult.created_at),
															"MMM d, yyyy",
														)}
													</span>
													<span className="h-1 w-1 rounded-full bg-[#c7dad6]" />
													<span
														className={urgencyConfig[consult.urgency].color}
													>
														{consult.urgency} Priority
													</span>
												</div>
											</div>
										</div>

										<div className="flex items-center gap-4">
											<div className="text-right hidden md:block">
												<p className="text-xs font-medium text-[#8aa39e]">
													Tracking ID
												</p>
												<p className="mt-0.5 font-mono text-xs text-[#698782]">
													{consult.id.slice(0, 8)}...
												</p>
											</div>
											<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4fbf9] transition-all group-hover:bg-[#e8f6f3]">
												<ChevronRight className="h-5 w-5 text-[#7ca6a0] group-hover:text-[#163332]" />
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
							<Search className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-[#95ada8] transition-colors group-focus-within:text-[#2c756e]" />
							<input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search by name, specialization, or expertise..."
								className="w-full rounded-[1.5rem] border border-[#d7ebe6] bg-white py-5 pl-16 pr-6 text-lg text-[#163332] placeholder:text-[#8aa39e] shadow-[0_12px_28px_rgba(19,51,50,0.05)] transition-all focus:border-[#8ec9be] focus:bg-[#fcfffe] focus:outline-none"
							/>
						</div>

						{isLoading ? (
							<div className="flex items-center justify-center gap-3 py-20 text-[#88a19c]">
								<Loader2 className="h-5 w-5 animate-spin text-[#2c756e]" />
								<span>Discovering medical experts...</span>
							</div>
						) : filteredDoctors.length === 0 ? (
							<div className="rounded-[2.5rem] border border-[#dcece8] bg-white py-20 text-center shadow-[0_18px_40px_rgba(19,51,50,0.05)]">
								<Search className="mx-auto mb-4 h-12 w-12 text-[#b7cbc7]" />
								<p className="text-lg font-medium text-[#163332]">
									No matching doctors found
								</p>
								<p className="mt-1 text-sm text-[#698782]">
									Try searching for &apos;General&apos; or another keyword.
								</p>
							</div>
						) : (
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
								{filteredDoctors.map((doctor) => (
									<div
										key={doctor.id}
										className="group relative flex flex-col gap-6 overflow-hidden rounded-[2.5rem] border border-[#dcece8] bg-white p-8 transition-all hover:border-[#b8d8d1] hover:shadow-[0_18px_40px_rgba(19,51,50,0.06)]"
									>
										{/* Background Decoration */}
										<div className="absolute right-5 top-5 h-20 w-20 rounded-full bg-[#f3fbf9] opacity-70 transition-all group-hover:bg-[#edf7f5]" />

										{/* Avatar & Name */}
										<div className="flex items-center gap-5 relative z-10">
											<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] border border-[#cce6e1] bg-[#eef8f5] shadow-sm">
												<User className="h-8 w-8 text-[#2c756e]" />
											</div>
											<div>
												<h3 className="text-lg font-bold leading-tight text-[#163332]">
													{doctor.name}
												</h3>
												<p className="mt-1 text-sm font-medium text-[#2c756e]">
													{doctor.specialization || "General Medicine"}
												</p>
											</div>
										</div>

										{/* Credentials */}
										{doctor.credentials && (
											<p className="text-sm leading-relaxed italic text-[#698782]">
												&apos;{doctor.credentials}&apos;
											</p>
										)}

										{/* Meta */}
										<div className="mt-auto space-y-4 border-t border-[#e3efec] pt-4">
											<div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
												<span className="text-[#8aa39e]">Response Time</span>
												<span className="text-[#2c756e]">~2-4 Hours</span>
											</div>
											<div className="flex items-center gap-1.5 text-xs text-[#698782]">
												<CheckCircle2 className="h-3.5 w-3.5 text-[#2c756e]" />
												<span>Medical License Verified</span>
											</div>

											{/* Request Button */}
											<button
												onClick={() => setSelectedDoctor(doctor)}
												className="h-12 w-full rounded-2xl border border-[#8ec9be] bg-[#1d5a56] text-sm font-bold text-white transition-all active:scale-95 hover:bg-[#236762]"
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
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#143231]/25 p-4 backdrop-blur-sm">
					<div className="custom-scrollbar max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[3rem] border border-[#dcece8] bg-white p-10 shadow-[0_24px_60px_rgba(19,51,50,0.12)]">
						{/* Modal Header */}
						<div className="flex items-center justify-between mb-10">
							<div>
								<h2 className="text-2xl font-bold text-[#163332]">
									Consultation Details
								</h2>
								<p className="mt-2 text-base text-[#698782]">
									Requesting clinical review from{" "}
									<span className="font-bold text-[#2c756e]">
										{selectedDoctor.name}
									</span>
								</p>
							</div>
							<button
								onClick={() => setSelectedDoctor(null)}
								className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f4fbf9] text-[#7ca6a0] transition-all hover:bg-[#e8f6f3] hover:text-[#163332] active:scale-90"
							>
								<X className="h-6 w-6" />
							</button>
						</div>

						<div className="space-y-8">
							{/* Symptoms */}
							<div className="space-y-3">
								<label className="ml-1 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#8aa39e]">
									Your Symptoms Summary
								</label>
								<textarea
									value={symptoms}
									onChange={(e) => setSymptoms(e.target.value)}
									placeholder="Enter symptoms for the doctor to review..."
									rows={3}
									className="w-full resize-none rounded-3xl border border-[#d7ebe6] bg-[#f7fbfa] px-6 py-4 text-sm leading-relaxed text-[#163332] placeholder:text-[#8aa39e] transition-all focus:border-[#8ec9be] focus:bg-white focus:outline-none"
								/>
							</div>

							{/* Patient note */}
							<div className="space-y-3">
								<label className="ml-1 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#8aa39e]">
									Message to Doctor (Optional)
								</label>
								<textarea
									value={patientNote}
									onChange={(e) => setPatientNote(e.target.value)}
									placeholder="Any specific questions? How does this affect your daily life?"
									rows={3}
									className="w-full resize-none rounded-3xl border border-[#d7ebe6] bg-[#f7fbfa] px-6 py-4 text-sm leading-relaxed text-[#163332] placeholder:text-[#8aa39e] transition-all focus:border-[#8ec9be] focus:bg-white focus:outline-none"
								/>
							</div>

							{/* Urgency */}
							<div className="space-y-4">
								<label className="ml-1 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#8aa39e]">
									Select Urgency Level
								</label>
								<div className="grid grid-cols-3 gap-4">
									{(["routine", "soon", "urgent"] as Urgency[]).map((u) => (
										<button
											key={u}
											onClick={() => setUrgency(u)}
											className={cn(
												"h-14 rounded-2xl border font-bold text-sm transition-all capitalize shadow-lg",
												urgency === u
													? urgencyConfig[u].bg +
															" " +
															urgencyConfig[u].color +
															" border-opacity-50"
													: "border-[#d7ebe6] bg-[#f7fbfa] text-[#698782] hover:border-[#bfded7]",
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
									<label className="ml-1 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#8aa39e]">
										Data Privacy & Sharing
									</label>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<button
											onClick={() => setSharingMode("summary")}
											className={cn(
												"relative flex flex-col items-start gap-4 p-6 rounded-3xl border text-left transition-all group",
												sharingMode === "summary"
													? "bg-[#eef8f5] border-[#9ecfc5]"
													: "bg-[#f7fbfa] border-[#d7ebe6] hover:border-[#bfded7]",
											)}
										>
											<FileText
												className={cn(
													"h-6 w-6",
													sharingMode === "summary"
														? "text-[#2c756e]"
														: "text-[#9bb1ad]",
												)}
											/>
											<div>
												<p className="text-sm font-bold text-[#163332]">
													AI Clinical Summary
												</p>
												<p className="mt-1.5 text-[11px] leading-relaxed text-[#698782]">
													Doctor only sees a structured summary of your chat.
													Most private.
												</p>
											</div>
											{sharingMode === "summary" && (
												<CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-[#2c756e]" />
											)}
										</button>
										{/* 
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
                                        </button> */}
									</div>
								</div>
							)}

							{/* Submit */}
							<button
								onClick={handleSubmit}
								disabled={isSubmitting || !symptoms.trim()}
								className="mt-4 flex h-16 w-full items-center justify-center gap-3 rounded-[1.5rem] border border-[#8ec9be] bg-[#1d5a56] text-lg font-extrabold text-white transition-all active:scale-95 hover:bg-[#236762] disabled:pointer-events-none disabled:opacity-50"
							>
								{isSubmitting ? (
									<>
										<Loader2 className="h-6 w-6 animate-spin" /> Processing...
									</>
								) : (
									<>
										<Send className="h-6 w-6" /> Send Consultation Request
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Success overlay */}
			{successMsg && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#143231]/30 p-4 backdrop-blur-sm">
					<div className="w-full max-w-md rounded-[3rem] border border-[#cfe6e1] bg-white p-12 text-center shadow-[0_24px_60px_rgba(19,51,50,0.12)]">
						<div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#eef8f5] animate-bounce">
							<CheckCircle2 className="h-10 w-10 text-[#2c756e]" />
						</div>
						<h2 className="mb-4 text-2xl font-bold tracking-tight text-[#163332]">
							Request Successfully Sent
						</h2>
						<p className="text-base leading-relaxed text-[#698782]">
							{successMsg}
						</p>
						<div className="mt-10 border-t border-[#e3efec] pt-10">
							<p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-[#8aa39e]">
								Closing modal...
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
