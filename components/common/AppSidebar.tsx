"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Stethoscope,
    History,
    MessageSquare,
    Bell,
    User,
    Users,
    LogOut,
    Menu,
    ChevronRight,
    BookOpen,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/route.constants";
import { useAuthStore } from "@/store/auth.store";

const NAV_ITEMS_PATIENT = [
    { label: "Home", href: ROUTES.PATIENT.DASHBOARD, icon: LayoutDashboard },
    { label: "Check Health", href: ROUTES.PATIENT.SYMPTOM_CHECKER, icon: Stethoscope },
    { label: "Help from Doctor", href: ROUTES.PATIENT.CONSULTATION, icon: MessageSquare },
];

const NAV_ITEMS_DOCTOR = [
    { label: "Dashboard", href: ROUTES.DOCTOR.DASHBOARD, icon: LayoutDashboard },
    { label: "Queue", href: ROUTES.DOCTOR.CONSULTATIONS, icon: MessageSquare },
    { label: "Clinical Library", href: ROUTES.DOCTOR.KNOWLEDGE_BASE, icon: BookOpen },
    // { label: "Notifications", href: ROUTES.DOCTOR.NOTIFICATIONS, icon: Bell },
];

const NAV_ITEMS_ADMIN = [
    { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard },
    { label: "User Management", href: ROUTES.ADMIN.USERS, icon: Users },
    { label: "Knowledge Base", href: ROUTES.ADMIN.KNOWLEDGE_BASE, icon: BookOpen },
];

export default function AppSidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    const pathname = usePathname();
    const { clearAuth, user } = useAuthStore();

    const items = user?.role === "doctor"
        ? NAV_ITEMS_DOCTOR
        : user?.role === "admin"
            ? NAV_ITEMS_ADMIN
            : NAV_ITEMS_PATIENT;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden animate-fade-in"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "w-72 h-screen fixed left-0 top-0 z-[70] bg-[#050505] border-r border-white/5 flex flex-col pt-8 pb-6 px-4 transition-transform duration-300 ease-in-out lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Mobile Close Button */}
                <button
                    onClick={onClose}
                    className="lg:hidden absolute top-6 right-6 p-2 text-white/40 hover:text-white"
                >
                    <X className="h-6 w-6" />
                </button>
                {/* Logo */}
                <div className="px-4 mb-10 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center">
                        <div className="h-5 w-5 bg-[#0a2a2a] rounded-sm rotate-45" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">Vitalis AI</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2">
                    {items.map((item) => {
                        const isActive = pathname === item.href || (item.href as string !== "/" && pathname.startsWith(item.href as string));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-white text-[#0a2a2a] shadow-xl shadow-white/5"
                                        : "text-white/40 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon className={cn(
                                    "h-5 w-5 transition-colors",
                                    isActive ? "text-[#0a2a2a]" : "text-white/40 group-hover:text-white"
                                )} />
                                <span className="font-semibold text-[15px]">{item.label}</span>

                                {isActive && (
                                    <ChevronRight className="ml-auto h-4 w-4" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="pt-4 mt-auto border-t border-white/5 px-2">
                    <button
                        onClick={() => clearAuth()}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all group"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="font-semibold text-[15px]">Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
