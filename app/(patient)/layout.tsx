"use client";

import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppSidebar from "@/components/common/AppSidebar";
import AppHeader from "@/components/common/AppHeader";
import { ROUTES } from "@/constants/route.constants";

export default function PatientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, user } = useAuthStore();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        if (!isAuthenticated) {
            router.push(ROUTES.LOGIN);
        } else if (user?.role !== "patient") {
            // Redirect based on role if they try to access patient routes
            if (user?.role === "doctor") router.push(ROUTES.DOCTOR.DASHBOARD);
            else if (user?.role === "admin") router.push(ROUTES.ADMIN.DASHBOARD);
        }
    }, [isMounted, isAuthenticated, user, router]);

    if (!isMounted || !isAuthenticated || user?.role !== "patient") {
        return (
            <div className="h-screen w-full bg-[#050505] flex items-center justify-center">
                <div className="h-10 w-10 border-4 border-[#0a2a2a] border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
            <AppSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="lg:pl-72 flex flex-col min-h-screen">
                <AppHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
