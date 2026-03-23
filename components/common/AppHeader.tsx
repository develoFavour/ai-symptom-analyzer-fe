"use client";

import { useAuthStore } from "@/store/auth.store";
import { Search, Settings, HelpCircle, LogOut, User, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/route.constants";
import NotificationDropdown from "./NotificationDropdown";

export default function AppHeader({ onMenuClick }: { onMenuClick?: () => void }) {
    const { user, clearAuth } = useAuthStore();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await authService.logout();
            clearAuth();
            router.push(ROUTES.LOGIN);
        } catch (error) {
            console.error("Logout failed", error);
            clearAuth(); // Clear anyway
            router.push(ROUTES.LOGIN);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <header className="h-20 w-full sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 px-4 lg:px-8 flex items-center justify-between">
            {/* Mobile Menu Trigger & Greeting */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-white/40 hover:text-white bg-white/5 rounded-xl border border-white/5"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <div>
                    <h2 className="text-white/40 text-[10px] lg:text-sm font-medium uppercase tracking-wider">Welcome back,</h2>
                    <h1 className="text-white text-base lg:text-xl font-bold tracking-tight">{user?.name} 👋</h1>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6">
                {/* Search Bar (Visual only for now) */}
                <div className="hidden md:flex items-center bg-white/5 border border-white/5 rounded-2xl px-4 py-2.5 w-72 group focus-within:border-white/10 transition-all">
                    <Search className="h-4 w-4 text-white/20 group-focus-within:text-white/40 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search symptoms or advice..."
                        className="bg-transparent border-none outline-none text-sm text-white ml-3 placeholder:text-white/20"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <NotificationDropdown />

                    <button className="h-11 w-11 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                        <HelpCircle className="h-5 w-5" />
                    </button>
                </div>

                {/* Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="outline-none">
                        <div className="flex items-center gap-3 pl-4 border-l border-white/5">
                            <Avatar className="h-11 w-11 border border-white/10 p-0.5">
                                <AvatarFallback className="bg-[#0a2a2a] text-white font-bold text-xs">
                                    {user ? getInitials(user.name) : <User className="h-5 w-5" />}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden lg:block text-left">
                                <p className="text-white font-bold text-sm leading-none">{user?.name}</p>
                                <p className="text-white/30 text-xs mt-1">
                                    {user?.role === "doctor" ? "Doctor Account" : user?.role === "admin" ? "Administrator" : "Patient Account"}
                                </p>
                            </div>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass border-white/10 rounded-2xl p-2 w-56 text-white mt-2">
                        <DropdownMenuLabel className="px-3 py-2 text-white/40 text-xs uppercase tracking-widest">Settings</DropdownMenuLabel>
                        <DropdownMenuItem className="rounded-xl h-12 focus:bg-white/5 cursor-pointer pl-3">
                            <User className="h-4 w-4 mr-3" />
                            My Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl h-12 focus:bg-white/5 cursor-pointer pl-3">
                            <Settings className="h-4 w-4 mr-3" />
                            Account Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/5 my-2" />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="rounded-xl h-12 focus:bg-red-500/10 text-red-400 cursor-pointer pl-3"
                        >
                            <LogOut className="h-4 w-4 mr-3" />
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
