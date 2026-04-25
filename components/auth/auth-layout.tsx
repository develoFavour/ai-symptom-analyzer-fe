"use client";

import { HeartPulse } from "lucide-react";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f7fbfa] p-4 font-sans md:p-8">
            <div
                className="pointer-events-none absolute inset-0"
                style={{ backgroundImage: "radial-gradient(circle, rgba(29,90,86,0.07) 1px, transparent 1px)", backgroundSize: "34px 34px" }}
            />
            <div className="pointer-events-none absolute left-0 top-0 h-[24rem] w-[28rem] bg-[#edf7f5]" />
            <div className="pointer-events-none absolute right-0 bottom-0 h-[22rem] w-[30rem] bg-[#f1fbf8]" />

            <div className="relative z-10 w-full max-w-xl overflow-visible rounded-[2.5rem] border border-[#dcece8] bg-white p-8 shadow-[0_24px_60px_rgba(19,51,50,0.08)] md:p-12">
                <div className="absolute -top-5 -right-5 z-20 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.75rem] border border-[#d3e8e3] bg-[#e9f6f3] shadow-[0_16px_30px_rgba(19,51,50,0.08)]">
                    <HeartPulse className="h-10 w-10 text-[#1d5a56]" />
                </div>

                <div className="relative z-10 flex w-full flex-col gap-8">
                    <div className="space-y-2 text-center">
                        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-[#d5ebe6] bg-[#f3fbf9] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2c756e]">
                            Secure Access
                        </div>
                        <h2 className="text-4xl font-medium tracking-tight text-[#163332] md:text-5xl">{title}</h2>
                        <p className="text-lg font-light text-[#5f7e79] md:text-xl">{subtitle}</p>
                    </div>

                    <div className="w-full">{children}</div>
                </div>
            </div>
        </div>
    );
}
