"use client";

import { useAuthStore } from "@/store/auth.store";
import { Search, Settings, HelpCircle, LogOut, User, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
            clearAuth();
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
        <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between border-b border-[#dcece8] bg-white/90 px-4 backdrop-blur-xl lg:px-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="rounded-xl border border-[#d7ebe6] bg-[#f4fbf9] p-2 text-[#7d9a95] hover:text-[#163332] lg:hidden"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <div>
                    <h2 className="text-[10px] font-medium uppercase tracking-wider text-[#8aa39e] lg:text-sm">Welcome back,</h2>
                    <h1 className="text-base font-bold tracking-tight text-[#163332] lg:text-xl">{user?.name} Hi</h1>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="group hidden w-72 items-center rounded-2xl border border-[#d7ebe6] bg-[#f7fbfa] px-4 py-2.5 transition-all focus-within:border-[#8ec9be] md:flex">
                    <Search className="h-4 w-4 text-[#9db2ae] transition-colors group-focus-within:text-[#2c756e]" />
                    <input
                        type="text"
                        placeholder="Search symptoms or advice..."
                        className="ml-3 border-none bg-transparent text-sm text-[#163332] outline-none placeholder:text-[#8aa39e]"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <NotificationDropdown />

                    <button className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d7ebe6] bg-[#f4fbf9] text-[#7d9a95] transition-all hover:bg-[#e8f6f3] hover:text-[#163332]">
                        <HelpCircle className="h-5 w-5" />
                    </button>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger className="outline-none">
                        <div className="flex items-center gap-3 border-l border-[#e1efec] pl-4">
                            <div className="flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-all hover:bg-[#f7fbfa]">
                            <Avatar className="h-11 w-11 border border-[#d7ebe6] p-0.5">
                                <AvatarFallback className="bg-[#e8f6f3] text-[#1d5a56] font-bold text-xs">
                                    {user ? getInitials(user.name) : <User className="h-5 w-5" />}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden lg:block text-left">
                                <p className="text-sm font-bold leading-none text-[#163332]">{user?.name}</p>
                                <p className="mt-1 text-xs text-[#7d9a95]">
                                    {user?.role === "doctor" ? "Doctor Account" : user?.role === "admin" ? "Administrator" : "Patient Account"}
                                </p>
                            </div>
                            </div>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="mt-2 w-56 rounded-2xl border border-[#d7ebe6] bg-white p-2 text-[#163332] shadow-[0_24px_60px_rgba(19,51,50,0.10)]">
                        <div className="px-3 py-2 text-xs uppercase tracking-widest text-[#8aa39e]">Settings</div>
                        <DropdownMenuItem className="h-12 cursor-pointer rounded-xl pl-3 text-[#365653] focus:bg-[#eef8f5]">
                            <User className="mr-3 h-4 w-4" />
                            My Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="h-12 cursor-pointer rounded-xl pl-3 text-[#365653] focus:bg-[#eef8f5]">
                            <Settings className="mr-3 h-4 w-4" />
                            Account Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-2 bg-[#eef4f2]" />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="h-12 cursor-pointer rounded-xl pl-3 text-red-500 focus:bg-red-50"
                        >
                            <LogOut className="mr-3 h-4 w-4" />
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
