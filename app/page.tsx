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
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen gradient-teal overflow-x-hidden font-sans selection:bg-white/20">
      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="fixed top-4 lg:top-6 left-1/2 -translate-x-1/2 w-[92%] lg:w-[88%] max-w-7xl z-50 glass rounded-full px-6 lg:px-10 py-3 lg:py-4 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between">
          <Link href={ROUTES.HOME} className="flex items-center gap-2 lg:gap-3 group">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/10 rounded-xl lg:rounded-2xl flex items-center justify-center border border-white/20 transition-all group-hover:scale-110">
              <HeartPulse className="text-white w-5 h-5 lg:w-7 lg:h-7" />
            </div>
            <span className="text-lg lg:text-2xl font-bold tracking-tight text-white">
              Vitalis<span className="text-white/40">AI</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-10 text-sm font-medium text-white/60">
            <a href="#how-it-works" className="hover:text-white transition-all hover:scale-105 active:scale-95">Methodology</a>
            <a href="#features" className="hover:text-white transition-all hover:scale-105 active:scale-95">Capabilities</a>
            <a href="#specialists" className="hover:text-white transition-all hover:scale-105 active:scale-95">For Providers</a>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <Link href={ROUTES.LOGIN}>
              <button className="hidden sm:block font-bold text-white/80 hover:text-white hover:bg-white/5 rounded-full px-4 lg:px-6 py-2 transition-all">
                Login
              </button>
            </Link>
            <Link href={ROUTES.REGISTER}>
              <Button className="bg-[#0a2a2a] text-white rounded-full px-5 lg:px-8 font-bold border border-white/5 shadow-2xl hover:bg-[#0d3d3d] hover:scale-105 active:scale-95 transition-all h-10 lg:h-12 text-sm lg:text-base">
                Join Network
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative pt-32 lg:pt-48 pb-16 lg:pb-32 px-6 sm:px-10 lg:px-12 overflow-hidden">

        {/* Dot-grid background */}
        <div className="absolute inset-0 pointer-events-none -z-0"
          style={{backgroundImage:"radial-gradient(circle, rgba(6,182,212,0.07) 1px, transparent 1px)", backgroundSize:"38px 38px"}} />

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* ── Left: Headline + CTAs ── */}
          <div className="flex-1 space-y-6 lg:space-y-10 text-center lg:text-left w-full">
            <div className="inline-flex items-center gap-3 px-4 py-2 lg:px-5 lg:py-2.5 rounded-full glass border border-white/10 text-white/90 text-xs lg:text-sm font-medium animate-fade-in shadow-xl mx-auto lg:mx-0">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Clinical-Grade Intelligence
            </div>

            <h1 className="text-5xl lg:text-8xl font-medium text-white leading-[1.05] tracking-tight animate-slide-up">
              Redefining <br />
              <span className="italic font-light opacity-60">Human Triage</span>
            </h1>

            <p className="text-white/60 text-lg lg:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 font-light animate-slide-up delay-100">
              Advanced AI models trained on verified clinical datasets to provide
              secure, instant health diagnostics and seamless provider connectivity.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 lg:gap-6 pt-2 animate-slide-up delay-200">
              <Link href={ROUTES.REGISTER}>
                <Button className="h-14 lg:h-16 px-8 lg:px-10 rounded-full bg-white text-[#0a2a2a] text-base lg:text-lg font-bold shadow-2xl shadow-white/5 hover:scale-105 active:scale-95 transition-all">
                  Begin Triage
                  <ArrowRight className="ml-3 w-5 h-5" />
                </Button>
              </Link>
              <div className="glass px-5 py-3 rounded-3xl flex items-center justify-center lg:justify-start gap-4 border border-white/5">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-[#0a2a2a] bg-white/20 backdrop-blur-md overflow-hidden">
                      <img src={`https://i.pravatar.cc/40?u=${i + 10}`} alt="user" className="opacity-80" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-white text-sm font-bold">10k+ Providers</span>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => <Star key={s} className="w-3 h-3 fill-cyan-400 text-cyan-400" />)}
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
                <div className="w-96 h-96 rounded-full border border-cyan-400/8 animate-pulse-ring" />
                <div className="absolute w-72 h-72 rounded-full border border-cyan-400/8 animate-pulse-ring delay-700" />
              </div>

              {/* Card */}
              <div className="relative glass rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden">

                {/* Scan sweep */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent animate-scan pointer-events-none z-20" />

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Live Diagnosis</p>
                      <p className="text-white/30 text-[10px] uppercase tracking-widest">Vitalis Engine v4.2</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-cyan-400 text-[10px] font-bold uppercase tracking-wider">Processing</span>
                  </div>
                </div>

                {/* Input mock */}
                <div className="px-6 pt-5">
                  <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">Patient Input</p>
                  <div className="bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 text-white/70 text-sm font-light leading-relaxed">
                    "Persistent headache for 3 days, mild fever, and stiff neck..."
                    <span className="inline-block w-[2px] h-4 bg-cyan-400 ml-1 align-middle animate-blink" />
                  </div>
                </div>

                {/* Token stream */}
                <div className="px-6 pt-4 overflow-hidden">
                  <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">Neural Analysis</p>
                  <div className="overflow-hidden whitespace-nowrap">
                    <div className="inline-flex gap-2 animate-marquee">
                      {["Meningism","Photophobia","Nuchal Rigidity","CBC Panel","CSF Analysis","CT Scan","Risk: High","LP Recommended",
                        "Meningism","Photophobia","Nuchal Rigidity","CBC Panel","CSF Analysis","CT Scan","Risk: High","LP Recommended"].map((t, i) => (
                        <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 shrink-0">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Severity score */}
                <div className="px-6 pt-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Severity Score</span>
                    <span className="text-cyan-400 text-sm font-bold">82 / 100</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 shadow-[0_0_16px_rgba(6,182,212,0.6)]" />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-white/20 text-[9px]">Low</span>
                    <span className="text-white/20 text-[9px]">Critical</span>
                  </div>
                </div>

                {/* Differentials */}
                <div className="px-6 pt-4">
                  <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">Top Differentials</p>
                  <div className="flex flex-wrap gap-2">
                    {[{label:"Bacterial Meningitis",conf:"91%"},{label:"Viral Meningitis",conf:"71%"},{label:"Migraine + Fever",conf:"38%"}].map((d) => (
                      <div key={d.label} className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/[0.04] border border-white/5">
                        <span className="text-white/60 text-xs">{d.label}</span>
                        <span className="text-cyan-400 text-[10px] font-bold">{d.conf}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendation */}
                <div className="px-6 pt-4">
                  <div className="p-4 bg-cyan-500/5 border border-cyan-400/15 rounded-2xl flex gap-3">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-white/55 text-xs leading-relaxed italic">
                      "Immediate neurological consult and lumbar puncture advised. Do not delay intervention."
                    </p>
                  </div>
                </div>

                {/* Footer CTA */}
                <div className="px-6 py-5 mt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-white/30" />
                    <span className="text-white/30 text-xs">3 specialists available</span>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#0a2a2a] text-xs font-bold hover:scale-105 transition-transform">
                    Connect Now <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Floating stat badges */}
              <div className="absolute -left-6 top-[30%] glass border border-white/10 rounded-2xl px-4 py-3 shadow-xl animate-float hidden lg:block">
                <p className="text-[10px] text-white/30 uppercase tracking-widest">Accuracy</p>
                <p className="text-xl font-bold text-white">99.2%</p>
              </div>
              <div className="absolute -right-6 top-[55%] glass border border-white/10 rounded-2xl px-4 py-3 shadow-xl animate-float-reverse hidden lg:block">
                <p className="text-[10px] text-white/30 uppercase tracking-widest">Avg. Time</p>
                <p className="text-xl font-bold text-white">60s</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Bar */}
        <div className="max-w-7xl mx-auto mt-16 lg:mt-24 relative z-10">
          <div className="glass rounded-3xl lg:rounded-[3rem] p-6 lg:p-10 grid grid-cols-2 md:grid-cols-4 items-center gap-8 lg:gap-12 border border-white/5 shadow-2xl">
            <Stat item="99.2%" label="Accuracy" />
            <Stat item="HIPAA" label="Compliance" />
            <Stat item="60s" label="Avg. Time" />
            <Stat item="2k+" label="Parameters" />
          </div>
        </div>
      </section>

      {/* ── Features Grid ────────────────────────────────────────────── */}
      <section id="features" className="py-20 lg:py-32 px-6 sm:px-10 lg:px-12 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 lg:space-y-6 mb-16 lg:mb-24 animate-fade-in">
            <div className="inline-block px-4 py-1.5 glass rounded-full text-cyan-400 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] mb-2 lg:mb-4">
              Core Stack
            </div>
            <h2 className="text-3xl lg:text-7xl font-medium text-white tracking-tight leading-tight">Built for Clinical <br className="hidden sm:block" /> Reliability</h2>
            <p className="text-white/40 text-base lg:text-xl font-light">Engineered to bridge the gap between initial symptoms and professional specialized care.</p>
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
        <div className="absolute bottom-[-10%] left-[-5%] w-[60%] h-[40%] bg-cyan-500/10 rounded-full blur-[100px] lg:blur-[150px] pointer-events-none" />
      </section>

      {/* ── Workflow ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 lg:py-32 px-6 sm:px-10 lg:px-12 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="flex-1 space-y-10 lg:space-y-12">
              <div className="space-y-4 lg:space-y-6 text-center lg:text-left">
                <h2 className="text-3xl lg:text-7xl font-medium text-white leading-tight">Three steps to <br className="hidden sm:block" /> clarity.</h2>
                <p className="text-white/40 text-base lg:text-xl font-light leading-relaxed">
                  Our refined methodology removes the friction of initial triage,
                  allowing for faster intervention.
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
                <div className="absolute inset-0 glass rounded-3xl lg:rounded-[4rem] p-8 lg:p-12 border border-white/10 shadow-2xl flex flex-col justify-between">
                  <div className="space-y-6 lg:space-y-8">
                    <div className="flex items-center gap-4 lg:gap-6">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/5 rounded-2xl lg:rounded-3xl flex items-center justify-center border border-white/10">
                        <ShieldCheck className="text-cyan-400 w-6 h-6 lg:w-8 lg:h-8" />
                      </div>
                      <div>
                        <h4 className="text-white text-lg lg:text-2xl font-medium">Risk Analysis</h4>
                        <p className="text-white/40 text-xs lg:text-sm">Vitalis System v4.2</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="h-1.5 lg:h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 w-[78%] rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
                      </div>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                        <span>Severity Score</span>
                        <span>78/100</span>
                      </div>
                    </div>

                    <div className="p-4 lg:p-6 bg-white/5 rounded-2xl lg:rounded-3xl border border-white/10 italic text-white/60 leading-relaxed text-sm lg:text-base">
                      "Symptoms suggest a potential localized inflammation. Immediate specialized consultation is highly recommended."
                    </div>
                  </div>

                  <Button className="w-full h-12 lg:h-16 rounded-full bg-white text-[#0a2a2a] font-bold text-sm lg:text-lg hover:bg-white/90">
                    Connect with Specialist
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="py-16 lg:py-24 px-6 sm:px-10 lg:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          <div className="sm:col-span-2 space-y-6 lg:space-y-8 text-center sm:text-left">
            <Link href={ROUTES.HOME} className="flex items-center justify-center sm:justify-start gap-4 group">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                <HeartPulse className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white italic">Vitalis AI</span>
            </Link>
            <p className="text-white/40 text-base lg:text-lg leading-relaxed max-w-sm mx-auto sm:mx-0 font-light">
              Pioneering the intersection of artificial intelligence and proactive clinical care.
            </p>
          </div>

          <div className="space-y-6 lg:space-y-8 text-center sm:text-left">
            <h4 className="text-white font-bold text-lg tracking-tight">Platform</h4>
            <ul className="space-y-3 lg:space-y-4 text-white/40 font-light text-sm lg:text-base">
              <li><Link href={ROUTES.LOGIN} className="hover:text-white transition-colors">Interface Access</Link></li>
              <li><Link href={ROUTES.REGISTER} className="hover:text-white transition-colors">Provider Enrollment</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
            </ul>
          </div>

          <div className="space-y-6 lg:space-y-8 text-center sm:text-left">
            <h4 className="text-white font-bold text-lg tracking-tight">Governance</h4>
            <ul className="space-y-3 lg:space-y-4 text-white/40 font-light text-sm lg:text-base">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Framework</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Clinical Ethics</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security Standards</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-12 lg:pt-16 mt-12 lg:mt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 lg:gap-8 text-white/20 text-[10px] lg:text-sm font-medium tracking-wide italic text-center">
          <p>&copy; {new Date().getFullYear()} Vitalis Artificial Intelligence. Core diagnostics for humanity.</p>
          <div className="flex gap-6 lg:gap-10">
            <a href="#" className="hover:text-white transition-all uppercase tracking-widest text-[9px] lg:text-[10px]">Twitter</a>
            <a href="#" className="hover:text-white transition-all uppercase tracking-widest text-[9px] lg:text-[10px]">LinkedIn</a>
            <a href="#" className="hover:text-white transition-all uppercase tracking-widest text-[9px] lg:text-[10px]">GitHub</a>
          </div>
        </div>
      </footer>

      {/* Global Decorative Gradients */}
      <div className="fixed top-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[200px] -z-10 pointer-events-none" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[180px] -z-10 pointer-events-none" />
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: string }) {
  return (
    <div className={`p-10 glass rounded-[3rem] border border-white/5 hover:border-white/20 transition-all duration-500 group animate-slide-up ${delay}`}>
      <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-cyan-400 mb-8 border border-white/5 group-hover:scale-110 group-hover:bg-cyan-400 group-hover:text-[#0a2a2a] transition-all duration-500">
        {icon}
      </div>
      <h3 className="text-2xl font-medium text-white mb-4 tracking-tight">{title}</h3>
      <p className="text-white/40 text-base leading-relaxed font-light">{desc}</p>
    </div>
  );
}

function Stat({ item, label }: { item: string, label: string }) {
  return (
    <div className="flex flex-col gap-1 items-center md:items-start">
      <div className="text-4xl lg:text-5xl font-medium text-white tracking-tighter">{item}</div>
      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500/60 transition-colors group-hover:text-cyan-400">{label}</div>
    </div>
  );
}

function Step({ number, title, desc, icon }: { number: string, title: string, desc: string, icon: React.ReactNode }) {
  return (
    <div className="flex gap-8 group">
      <div className="flex-shrink-0 w-16 h-16 glass rounded-3xl flex items-center justify-center relative border border-white/10 group-hover:bg-white group-hover:text-[#0a2a2a] transition-all duration-500 group-hover:scale-110">
        <span className="absolute -top-3 -left-3 w-8 h-8 bg-[#0a2a2a] border border-white/10 text-white text-[10px] font-black rounded-lg flex items-center justify-center shadow-2xl">
          {number}
        </span>
        <div className="text-white group-hover:text-[#0a2a2a] transition-colors duration-500">{icon}</div>
      </div>
      <div className="space-y-2 py-1">
        <h4 className="text-2xl font-medium text-white tracking-tight">{title}</h4>
        <p className="text-white/40 text-base font-light leading-relaxed max-w-md">{desc}</p>
      </div>
    </div>
  );
}
