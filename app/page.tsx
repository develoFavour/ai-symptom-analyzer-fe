"use client";

import Link from "next/link";
import { ROUTES } from "@/constants/route.constants";
import {
	HeartPulse,
	Activity,
	ShieldCheck,
	Zap,
	ArrowRight,
	Stethoscope,
	BrainCircuit,
	MessageSquare,
	Shield,
	Star,
	Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
	return (
		<div className="flex min-h-screen flex-col overflow-x-hidden bg-[#f7fbfa] font-sans text-[#163332] selection:bg-[#d8f3ee] selection:text-[#10302f]">
			{/* ── Navigation ─────────────────────────────────────────────────── */}
			<nav className="fixed top-4 left-1/2 z-50 w-[92%] max-w-7xl -translate-x-1/2 rounded-full border border-[#cfe6e1] bg-white/92 px-6 py-3 shadow-[0_16px_45px_rgba(19,51,50,0.08)] backdrop-blur-xl lg:top-6 lg:w-[88%] lg:px-10 lg:py-4">
				<div className="flex items-center justify-between">
					<Link
						href={ROUTES.HOME}
						className="flex items-center gap-2 lg:gap-3 group"
					>
						<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d7ebe7] bg-[#e8f6f3] transition-all group-hover:scale-110 lg:h-12 lg:w-12 lg:rounded-2xl">
							<Image
								src={"/hallmark-logo.svg"}
								alt="hallmark-logo"
								height={100}
								width={100}
								className="rounded-full"
							/>
						</div>
						<span className="text-lg font-bold tracking-tight text-[#163332] lg:text-2xl">
							Vitalis<span className="text-[#6b8f89]">AI</span>
						</span>
					</Link>

					<div className="hidden items-center gap-10 text-sm font-medium text-[#5d7a75] lg:flex">
						<a
							href="#how-it-works"
							className="transition-all hover:scale-105 hover:text-[#163332] active:scale-95"
						>
							Methodology
						</a>
						<a
							href="#features"
							className="transition-all hover:scale-105 hover:text-[#163332] active:scale-95"
						>
							Capabilities
						</a>
						<a
							href="#specialists"
							className="transition-all hover:scale-105 hover:text-[#163332] active:scale-95"
						>
							For Providers
						</a>
					</div>

					<div className="flex items-center gap-2 lg:gap-4">
						<Link href={ROUTES.LOGIN}>
							<button className="hidden rounded-full px-4 py-2 font-bold text-[#42645f] transition-all hover:bg-[#edf7f5] hover:text-[#163332] sm:block lg:px-6">
								Login
							</button>
						</Link>
						<Link href={ROUTES.REGISTER}>
							<Button className="h-10 rounded-full border border-[#95cbc1] bg-[#1d5a56] px-5 font-bold text-white shadow-lg shadow-[#1d5a56]/15 transition-all hover:scale-105 hover:bg-[#236762] active:scale-95 lg:h-12 lg:px-8 lg:text-base">
								Join Network
							</Button>
						</Link>
					</div>
				</div>
			</nav>

			{/* ── Hero Section ──────────────────────────────────────────────── */}
			<section className="relative overflow-hidden border-b border-[#e1efec] bg-white px-6 pt-32 pb-16 sm:px-10 lg:px-12 lg:pt-48 lg:pb-28">
				{/* Dot-grid background */}
				<div
					className="absolute inset-0 -z-0 pointer-events-none"
					style={{
						backgroundImage:
							"radial-gradient(circle, rgba(29,90,86,0.08) 1px, transparent 1px)",
						backgroundSize: "38px 38px",
					}}
				/>

				<div className="absolute right-0 top-0 -z-10 h-[26rem] w-[42%] bg-[#edf7f5]" />
				<div className="absolute left-0 bottom-0 -z-10 h-[18rem] w-[36%] bg-[#f2fbf8]" />

				<div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
					{/* ── Left: Headline + CTAs ── */}
					<div className="flex-1 space-y-6 lg:space-y-10 text-center lg:text-left w-full">
						<div className="mx-auto inline-flex items-center gap-3 rounded-full border border-[#d6ebe7] bg-[#f3fbf9] px-4 py-2 text-xs font-medium text-[#1f615d] shadow-sm animate-fade-in lg:mx-0 lg:px-5 lg:py-2.5 lg:text-sm">
							<span className="flex h-2 w-2 relative">
								<span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-[#67b9ab] opacity-75"></span>
								<span className="relative inline-flex h-2 w-2 rounded-full bg-[#1d5a56]"></span>
							</span>
							Clinical-Grade Intelligence
						</div>

						<h1 className="animate-slide-up text-5xl font-medium leading-[1.05] tracking-tight text-[#163332] lg:text-8xl">
							Redefining <br />
							<span className="font-light italic text-[#5e7f79]">
								Human Triage
							</span>
						</h1>

						<p className="mx-auto max-w-xl animate-slide-up text-lg leading-relaxed font-light text-[#5f7e79] delay-100 lg:mx-0 lg:text-xl">
							Advanced AI models trained on verified clinical datasets to
							provide secure, instant health diagnostics and seamless provider
							connectivity.
						</p>

						<div className="flex flex-col justify-center gap-4 pt-2 animate-slide-up delay-200 sm:flex-row lg:justify-start lg:gap-6">
							<Link href={ROUTES.REGISTER}>
								<Button className="h-14 rounded-full border border-[#8ec9be] bg-[#1d5a56] px-8 text-base font-bold text-white shadow-xl shadow-[#1d5a56]/15 transition-all hover:scale-105 hover:bg-[#236762] active:scale-95 lg:h-16 lg:px-10 lg:text-lg">
									Begin Triage
									<ArrowRight className="ml-3 w-5 h-5" />
								</Button>
							</Link>
							<div className="flex items-center justify-center gap-4 rounded-3xl border border-[#d8ebe7] bg-[#f6fbfa] px-5 py-3 lg:justify-start">
								<div className="flex -space-x-3">
									{[1, 2, 3].map((i) => (
										<div
											key={i}
											className="overflow-hidden rounded-full border-2 border-white bg-[#dbeeea] shadow-sm"
										>
											<img
												src={`https://i.pravatar.cc/40?u=${i + 10}`}
												alt="user"
												className="opacity-80"
											/>
										</div>
									))}
								</div>
								<div className="flex flex-col text-left">
									<span className="text-sm font-bold text-[#163332]">
										10k+ Providers
									</span>
									<div className="flex gap-0.5">
										{[1, 2, 3, 4, 5].map((s) => (
											<Star
												key={s}
												className="h-3 w-3 fill-[#4aa896] text-[#4aa896]"
											/>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* ── Right: Live AI Diagnosis Mockup ── */}
					<div className="flex-1 w-full animate-slide-up delay-300">
						<div className="relative mx-auto max-w-md">
							{/* Ambient pulse rings */}
							<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
								<div className="h-96 w-96 rounded-full border border-[#9be7db]/[0.12] animate-pulse-ring" />
								<div className="absolute h-72 w-72 rounded-full border border-[#9be7db]/[0.12] animate-pulse-ring delay-700" />
							</div>

							{/* Card */}
							<div className="relative overflow-hidden rounded-[2rem] border border-[#dcece8] bg-[#1c5653] shadow-[0_22px_60px_rgba(8,20,20,0.12)]">
								{/* Scan sweep */}
								<div className="absolute inset-x-0 top-0 z-20 h-[2px] animate-scan bg-[#9be7db]/[0.7] pointer-events-none" />

								{/* Header */}
								<div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5">
									<div className="flex items-center gap-3">
										<div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#9be7db]/20 bg-[#d8f3ee]/10">
											<Activity className="h-4 w-4 text-[#9be7db]" />
										</div>
										<div>
											<p className="text-white text-sm font-semibold">
												Live Diagnosis
											</p>
											<p className="text-[10px] uppercase tracking-widest text-white/40">
												Vitalis Engine v4.2
											</p>
										</div>
									</div>
									<div className="flex items-center gap-1.5">
										<span className="h-2 w-2 rounded-full bg-[#9be7db] animate-pulse" />
										<span className="text-[10px] font-bold uppercase tracking-wider text-[#b3efe5]">
											Processing
										</span>
									</div>
								</div>

								{/* Input mock */}
								<div className="px-6 pt-5">
									<p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">
										Patient Input
									</p>
									<div className="bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 text-white/70 text-sm font-light leading-relaxed">
										&ldquo;Persistent headache for 3 days, mild fever, and stiff
										neck...&rdquo;
										<span className="ml-1 inline-block h-4 w-[2px] animate-blink bg-[#9be7db] align-middle" />
									</div>
								</div>

								{/* Token stream */}
								<div className="px-6 pt-4 overflow-hidden">
									<p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">
										Neural Analysis
									</p>
									<div className="overflow-hidden whitespace-nowrap">
										<div className="inline-flex gap-2 animate-marquee">
											{[
												"Meningism",
												"Photophobia",
												"Nuchal Rigidity",
												"CBC Panel",
												"CSF Analysis",
												"CT Scan",
												"Risk: High",
												"LP Recommended",
												"Meningism",
												"Photophobia",
												"Nuchal Rigidity",
												"CBC Panel",
												"CSF Analysis",
												"CT Scan",
												"Risk: High",
												"LP Recommended",
											].map((t, i) => (
												<span
													key={i}
													className="inline-flex shrink-0 items-center rounded-full border border-[#9be7db]/20 bg-[#d8f3ee]/[0.08] px-3 py-1 text-[10px] font-semibold text-[#b8f2e8]"
												>
													{t}
												</span>
											))}
										</div>
									</div>
								</div>

								{/* Severity score */}
								<div className="px-6 pt-5">
									<div className="flex justify-between items-center mb-2">
										<span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
											Severity Score
										</span>
										<span className="text-sm font-bold text-[#b3efe5]">
											82 / 100
										</span>
									</div>
									<div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
										<div className="h-full w-[82%] rounded-full bg-[#9be7db] shadow-[0_0_16px_rgba(155,231,219,0.35)]" />
									</div>
									<div className="flex justify-between mt-1.5">
										<span className="text-white/20 text-[9px]">Low</span>
										<span className="text-white/20 text-[9px]">Critical</span>
									</div>
								</div>

								{/* Differentials */}
								<div className="px-6 pt-4">
									<p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">
										Top Differentials
									</p>
									<div className="flex flex-wrap gap-2">
										{[
											{ label: "Bacterial Meningitis", conf: "91%" },
											{ label: "Viral Meningitis", conf: "71%" },
											{ label: "Migraine + Fever", conf: "38%" },
										].map((d) => (
											<div
												key={d.label}
												className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/[0.04] border border-white/5"
											>
												<span className="text-white/60 text-xs">{d.label}</span>
												<span className="text-[10px] font-bold text-[#b3efe5]">
													{d.conf}
												</span>
											</div>
										))}
									</div>
								</div>

								{/* Recommendation */}
								<div className="px-6 pt-4">
									<div className="flex gap-3 rounded-2xl border border-[#9be7db]/[0.15] bg-[#d8f3ee]/[0.06] p-4">
										<ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#9be7db]" />
										<p className="text-xs leading-relaxed italic text-white/[0.55]">
											&ldquo;Immediate neurological consult and lumbar puncture
											advised. Do not delay intervention.&rdquo;
										</p>
									</div>
								</div>

								{/* Footer CTA */}
								<div className="px-6 py-5 mt-4 border-t border-white/5 flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Stethoscope className="w-4 h-4 text-white/30" />
										<span className="text-white/30 text-xs">
											3 specialists available
										</span>
									</div>
									<button className="flex items-center gap-2 rounded-full bg-[#e8fbf7] px-4 py-2 text-xs font-bold text-[#143231] transition-transform hover:scale-105">
										Connect Now <ArrowRight className="w-3 h-3" />
									</button>
								</div>
							</div>

							{/* Floating stat badges */}
							<div className="absolute -left-6 top-[30%] hidden rounded-2xl border border-[#dcece8] bg-white px-4 py-3 shadow-lg animate-float lg:block">
								<p className="text-[10px] uppercase tracking-widest text-[#6b8f89]">
									Accuracy
								</p>
								<p className="text-xl font-bold text-[#163332]">99.2%</p>
							</div>
							<div className="absolute -right-6 top-[55%] hidden rounded-2xl border border-[#dcece8] bg-[#f4fbf9] px-4 py-3 shadow-lg animate-float-reverse lg:block">
								<p className="text-[10px] uppercase tracking-widest text-[#6b8f89]">
									Avg. Time
								</p>
								<p className="text-xl font-bold text-[#163332]">60s</p>
							</div>
						</div>
					</div>
				</div>

				{/* Trust Bar */}
				<div className="max-w-7xl mx-auto mt-16 lg:mt-24 relative z-10">
					<div className="grid grid-cols-2 items-center gap-8 rounded-3xl border border-[#dcece8] bg-[#f4fbf9] p-6 shadow-[0_18px_40px_rgba(19,51,50,0.06)] md:grid-cols-4 lg:rounded-[3rem] lg:gap-12 lg:p-10">
						<Stat item="99.2%" label="Accuracy" />
						<Stat item="HIPAA" label="Compliance" />
						<Stat item="60s" label="Avg. Time" />
						<Stat item="2k+" label="Parameters" />
					</div>
				</div>
			</section>

			{/* ── Features Grid ────────────────────────────────────────────── */}
			<section
				id="features"
				className="relative bg-[#eff8f5] px-6 py-20 sm:px-10 lg:px-12 lg:py-32"
			>
				<div className="max-w-7xl mx-auto relative z-10">
					<div className="text-center max-w-3xl mx-auto space-y-4 lg:space-y-6 mb-16 lg:mb-24 animate-fade-in">
						<div className="mb-2 inline-block rounded-full border border-[#d3e8e3] bg-white px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#2c756e] lg:mb-4 lg:text-xs">
							Core Stack
						</div>
						<h2 className="text-3xl font-medium leading-tight tracking-tight text-[#163332] lg:text-7xl">
							Built for Clinical <br className="hidden sm:block" /> Reliability
						</h2>
						<p className="text-base font-light text-[#5f7e79] lg:text-xl">
							Engineered to bridge the gap between initial symptoms and
							professional specialized care.
						</p>
					</div>

					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
						<FeatureCard
							icon={<BrainCircuit className="w-6 h-6 lg:w-8 lg:h-8" />}
							title="Neuromorphic Engine"
							desc="Deep logic processing that understands natural human descriptions beyond simple keywords."
							delay="delay-100"
						/>
						<FeatureCard
							icon={<Shield className="w-6 h-6 lg:w-8 lg:h-8" />}
							title="Encrypted Identity"
							desc="Zero-trust architecture ensuring all personal health indicators remain anonymously processed."
							delay="delay-200"
						/>
						<FeatureCard
							icon={<Activity className="w-6 h-6 lg:w-8 lg:h-8" />}
							title="Pathology Mapping"
							desc="Real-time matching against a database of 20,000+ documented medical conditions."
							delay="delay-300"
						/>
						<FeatureCard
							icon={<Users className="w-6 h-6 lg:w-8 lg:h-8" />}
							title="Specialist Routing"
							desc="Automated handoffs to verified medical professionals when severity thresholds are met."
							delay="delay-400"
						/>
						<FeatureCard
							icon={<Zap className="w-6 h-6 lg:w-8 lg:h-8" />}
							title="Latency-Free Triage"
							desc="Sub-second analysis powered by Groq's LPU™ architecture for immediate peace of mind."
							delay="delay-500"
						/>
						<FeatureCard
							icon={<HeartPulse className="w-6 h-6 lg:w-8 lg:h-8" />}
							title="Continuous Vitals"
							desc="History tracking to monitor symptom evolution over time for better longitudinal insights."
							delay="delay-600"
						/>
					</div>
				</div>

				{/* Bottom Blur Decor */}
			</section>

			{/* ── Workflow ─────────────────────────────────────────────────── */}
			<section
				id="how-it-works"
				className="relative bg-white px-6 py-20 sm:px-10 lg:px-12 lg:py-32"
			>
				<div className="max-w-7xl mx-auto">
					<div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
						<div className="flex-1 space-y-10 lg:space-y-12">
							<div className="space-y-4 lg:space-y-6 text-center lg:text-left">
								<h2 className="text-3xl font-medium leading-tight text-[#163332] lg:text-7xl">
									Three steps to <br className="hidden sm:block" /> clarity.
								</h2>
								<p className="text-base font-light leading-relaxed text-[#5f7e79] lg:text-xl">
									Our refined methodology removes the friction of initial
									triage, allowing for faster intervention.
								</p>
							</div>

							<div className="space-y-8 lg:space-y-10">
								<Step
									number="01"
									title="Natural Discourse"
									desc="Describe what you're feeling in your own words. Our NLP interprets context and nuance."
									icon={<MessageSquare className="w-5 h-5 lg:w-6 lg:h-6" />}
								/>
								<Step
									number="02"
									title="Pattern Sync"
									desc="AI cross-references inputs against diagnostic parameters and historical medical data."
									icon={<BrainCircuit className="w-5 h-5 lg:w-6 lg:h-6" />}
								/>
								<Step
									number="03"
									title="Clinical Path"
									desc="Receive a prioritized risk report with explicit next-step recommendations."
									icon={<Activity className="w-5 h-5 lg:w-6 lg:h-6" />}
								/>
							</div>
						</div>

						<div className="flex-1 w-full flex justify-center">
							<div className="relative w-full max-w-sm lg:max-w-lg aspect-[4/5] lg:aspect-square">
								{/* Card Mockup */}
								<div className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-[#dcece8] bg-[#f4fbf9] p-8 shadow-[0_18px_40px_rgba(19,51,50,0.08)] lg:rounded-[4rem] lg:p-12">
									<div className="space-y-6 lg:space-y-8">
										<div className="flex items-center gap-4 lg:gap-6">
											<div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d7ebe6] bg-white lg:h-16 lg:w-16 lg:rounded-3xl">
												<ShieldCheck className="h-6 w-6 text-[#2c756e] lg:h-8 lg:w-8" />
											</div>
											<div>
												<h4 className="text-lg font-medium text-[#163332] lg:text-2xl">
													Risk Analysis
												</h4>
												<p className="text-xs text-[#6d8f8a] lg:text-sm">
													Vitalis System v4.2
												</p>
											</div>
										</div>

										<div className="space-y-4">
											<div className="h-1.5 overflow-hidden rounded-full bg-[#dcece8] lg:h-2">
												<div className="h-full w-[78%] rounded-full bg-[#4aa896]" />
											</div>
											<div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#6d8f8a]">
												<span>Severity Score</span>
												<span>78/100</span>
											</div>
										</div>

										<div className="rounded-2xl border border-[#d7ebe6] bg-white p-4 text-sm leading-relaxed text-[#557671] italic lg:rounded-3xl lg:p-6 lg:text-base">
											&ldquo;Symptoms suggest a potential localized
											inflammation. Immediate specialized consultation is highly
											recommended.&rdquo;
										</div>
									</div>

									<Button className="h-12 w-full rounded-full border border-[#8ec9be] bg-[#1d5a56] font-bold text-sm text-white hover:bg-[#236762] lg:h-16 lg:text-lg">
										Connect with Specialist
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ── Footer ────────────────────────────────────────────────────── */}
			<footer className="border-t border-[#225552] bg-[#1a4a47] px-6 py-16 text-white sm:px-10 lg:px-12 lg:py-24">
				<div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
					<div className="sm:col-span-2 space-y-6 lg:space-y-8 text-center sm:text-left">
						<Link
							href={ROUTES.HOME}
							className="flex items-center justify-center sm:justify-start gap-4 group"
						>
							<div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
								<Image
									src={"/hallmark-logo.svg"}
									alt="hallmark-logo"
									height={100}
									width={100}
									className="rounded-full"
								/>
							</div>
							<span className="text-xl font-bold tracking-tight text-white italic">
								Vitalis AI
							</span>
						</Link>
						<p className="text-white/40 text-base lg:text-lg leading-relaxed max-w-sm mx-auto sm:mx-0 font-light">
							Pioneering the intersection of artificial intelligence and
							proactive clinical care.
						</p>
					</div>

					<div className="space-y-6 lg:space-y-8 text-center sm:text-left">
						<h4 className="text-white font-bold text-lg tracking-tight">
							Platform
						</h4>
						<ul className="space-y-3 lg:space-y-4 text-white/40 font-light text-sm lg:text-base">
							<li>
								<Link
									href={ROUTES.LOGIN}
									className="hover:text-white transition-colors"
								>
									Interface Access
								</Link>
							</li>
							<li>
								<Link
									href={ROUTES.REGISTER}
									className="hover:text-white transition-colors"
								>
									Provider Enrollment
								</Link>
							</li>
							<li>
								<a href="#" className="hover:text-white transition-colors">
									API Documentation
								</a>
							</li>
						</ul>
					</div>

					<div className="space-y-6 lg:space-y-8 text-center sm:text-left">
						<h4 className="text-white font-bold text-lg tracking-tight">
							Governance
						</h4>
						<ul className="space-y-3 lg:space-y-4 text-white/40 font-light text-sm lg:text-base">
							<li>
								<a href="#" className="hover:text-white transition-colors">
									Privacy Framework
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-white transition-colors">
									Clinical Ethics
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-white transition-colors">
									Security Standards
								</a>
							</li>
						</ul>
					</div>
				</div>

				<div className="max-w-7xl mx-auto pt-12 lg:pt-16 mt-12 lg:mt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 lg:gap-8 text-white/20 text-[10px] lg:text-sm font-medium tracking-wide italic text-center">
					<p>
						&copy; {new Date().getFullYear()} Vitalis Artificial Intelligence.
						Core diagnostics for humanity.
					</p>
					<div className="flex gap-6 lg:gap-10">
						<a
							href="#"
							className="hover:text-white transition-all uppercase tracking-widest text-[9px] lg:text-[10px]"
						>
							Twitter
						</a>
						<a
							href="#"
							className="hover:text-white transition-all uppercase tracking-widest text-[9px] lg:text-[10px]"
						>
							LinkedIn
						</a>
						<a
							href="#"
							className="hover:text-white transition-all uppercase tracking-widest text-[9px] lg:text-[10px]"
						>
							GitHub
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}

function FeatureCard({
	icon,
	title,
	desc,
	delay,
}: {
	icon: React.ReactNode;
	title: string;
	desc: string;
	delay: string;
}) {
	return (
		<div
			className={`group animate-slide-up rounded-[3rem] border border-[#d6ebe7] bg-white p-10 transition-all duration-500 hover:border-[#add5cc] hover:shadow-[0_18px_40px_rgba(19,51,50,0.08)] ${delay}`}
		>
			<div className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl border border-[#d7ebe6] bg-[#eff8f5] text-[#2c756e] transition-all duration-500 group-hover:scale-110 group-hover:bg-[#d8f3ee] group-hover:text-[#143231]">
				{icon}
			</div>
			<h3 className="mb-4 text-2xl font-medium tracking-tight text-[#163332]">
				{title}
			</h3>
			<p className="text-base leading-relaxed font-light text-[#5f7e79]">
				{desc}
			</p>
		</div>
	);
}

function Stat({ item, label }: { item: string; label: string }) {
	return (
		<div className="flex flex-col gap-1 items-center md:items-start">
			<div className="text-4xl font-medium tracking-tighter text-[#163332] lg:text-5xl">
				{item}
			</div>
			<div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4d8d82] transition-colors group-hover:text-[#2c756e]">
				{label}
			</div>
		</div>
	);
}

function Step({
	number,
	title,
	desc,
	icon,
}: {
	number: string;
	title: string;
	desc: string;
	icon: React.ReactNode;
}) {
	return (
		<div className="flex gap-8 group">
			<div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-3xl border border-[#d7ebe6] bg-[#f4fbf9] transition-all duration-500 group-hover:scale-110 group-hover:bg-[#e8fbf7] group-hover:text-[#143231]">
				<span className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-lg border border-[#9bc9c0] bg-[#1d5a56] text-[10px] font-black text-white shadow-lg">
					{number}
				</span>
				<div className="text-[#2c756e] transition-colors duration-500 group-hover:text-[#143231]">
					{icon}
				</div>
			</div>
			<div className="space-y-2 py-1">
				<h4 className="text-2xl font-medium tracking-tight text-[#163332]">
					{title}
				</h4>
				<p className="max-w-md text-base font-light leading-relaxed text-[#5f7e79]">
					{desc}
				</p>
			</div>
		</div>
	);
}
