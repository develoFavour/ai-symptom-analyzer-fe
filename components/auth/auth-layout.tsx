"use client";

import { HeartPulse } from "lucide-react";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 md:p-8 gradient-teal overflow-hidden font-sans">
            {/* ── Focused Glass Card ─────────────────────────────────────────── */}
            <div className="relative w-full max-w-xl glass rounded-[3rem] p-8 md:p-12 flex flex-col items-center gap-10 overflow-visible">

                {/* Branding Logo (Floating Top Right) */}
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-[#0a2a2a] rounded-3xl flex items-center justify-center shadow-2xl border border-white/10 z-20">
                    <HeartPulse className="text-white w-12 h-12" />
                </div>

                {/* ── Auth Content ─────────────────────────────────────────────── */}
                <div className="w-full flex flex-col gap-8 z-10">
                    <div className="space-y-2 text-center">
                        <h2 className="text-5xl font-medium text-white tracking-tight">{title}</h2>
                        <p className="text-white/60 text-xl font-light">
                            {subtitle}
                        </p>
                    </div>

                    <div className="w-full">
                        {children}
                    </div>
                </div>
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-teal-500/10 rounded-full blur-[150px] pointer-events-none" />
        </div>
    );
}
