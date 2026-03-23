"use client";

import { X, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning";
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm Action",
    cancelText = "Cancel",
    variant = "danger",
    isLoading = false
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[150] flex items-center justify-center p-6 selection:bg-white selection:text-black">
            <div 
                className="bg-[#050505] border border-white/10 rounded-[4rem] p-12 w-full max-w-xl shadow-2xl space-y-12 relative overflow-hidden animate-in fade-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative Elements */}
                <div className={cn(
                    "absolute -top-10 -right-10 h-64 w-64 rounded-full blur-3xl opacity-20",
                    variant === "danger" ? "bg-red-500" : "bg-amber-500"
                )} />

                <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                    <div className={cn(
                        "h-24 w-24 rounded-[2.5rem] flex items-center justify-center border",
                        variant === "danger" ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                    )}>
                        <AlertTriangle className="h-12 w-12" />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{title}</h2>
                        <p className="text-white/40 text-lg font-medium leading-relaxed max-w-sm mx-auto">{description}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full h-18 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-3xl hover:bg-white/10 transition-all active:scale-95 disabled:opacity-30"
                    >
                        {cancelText}
                    </button>
                    
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={cn(
                            "w-full h-18 font-black uppercase tracking-widest rounded-3xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50",
                            variant === "danger" ? "bg-red-500 text-white hover:bg-red-600 shadow-xl shadow-red-500/10" : "bg-amber-500 text-black hover:bg-amber-600 shadow-xl shadow-amber-500/10"
                        )}
                    >
                        {isLoading ? (
                            <><Loader2 className="h-6 w-6 animate-spin" /> Processing...</>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>

                <button 
                    onClick={onClose}
                    className="absolute top-8 right-8 h-12 w-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/20 transition-all"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
}
