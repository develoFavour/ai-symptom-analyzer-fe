"use client";

import { useAuthStore } from "@/store/auth.store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AppSidebar from "@/components/common/AppSidebar";
import AppHeader from "@/components/common/AppHeader";
import { ROUTES } from "@/constants/route.constants";

export default function DoctorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, user } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        if (!isAuthenticated) {
            router.push(ROUTES.LOGIN);
        } else if (user?.role !== "doctor") {
            // Redirect based on role if they try to access doctor routes
            if (user?.role === "patient") router.push(ROUTES.PATIENT.DASHBOARD);
            else if (user?.role === "admin") router.push(ROUTES.ADMIN.DASHBOARD);
        } else if (!user.setup_complete && pathname !== "/doctor/setup") {
            // Force wizard if not complete
            router.push("/doctor/setup");
        } else if (user.setup_complete && pathname === "/doctor/setup") {
            // Don't allow wizard if already complete
            router.push(ROUTES.DOCTOR.DASHBOARD);
        }
    }, [isMounted, isAuthenticated, user, router, pathname]);

    if (!isMounted || !isAuthenticated || user?.role !== "doctor") {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#f7fbfa]">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#d2e8e3] border-t-[#1d5a56]" />
            </div>
        );
    }

    // If it's the setup page, we don't show the sidebar/header
    if (pathname === "/doctor/setup") {
        return <div className="min-h-screen bg-[#f7fbfa] text-[#163332]">{children}</div>;
    }

    return (
        <div className="min-h-screen bg-[#f7fbfa] text-[#163332]">
            <AppSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="lg:pl-72 flex flex-col min-h-screen">
                <AppHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 bg-[#f7fbfa] p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
