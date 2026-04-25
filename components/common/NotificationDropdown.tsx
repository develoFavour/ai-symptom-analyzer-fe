"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, CheckCircle2, Clock, MessageSquare, AlertCircle, Trash2, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    ref_id?: string;
    created_at: string;
}

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        const res = await api.get<Notification[]>("/notifications");
        if (res.success && res.data) {
            setNotifications(res.data);
            setHasUnread(res.data.some(n => !n.is_read));
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Poll every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = async (id: string) => {
        const res = await api.patch(`/notifications/${id}/read`, {});
        if (res.success) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setHasUnread(notifications.some(n => n.id !== id && !n.is_read));
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "consultation_answered": return <MessageSquare className="h-4 w-4 text-emerald-400" />;
            case "doctor_approved": return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
            case "system_alert": return <AlertCircle className="h-4 w-4 text-red-400" />;
            default: return <Bell className="h-4 w-4 text-blue-400" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
                <div className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-[#d7ebe6] bg-[#f4fbf9] text-[#7d9a95] transition-all hover:bg-[#e8f6f3] hover:text-[#163332]">
                    <Bell className={cn("h-5 w-5", hasUnread && "animate-tada")} />
                    {hasUnread && (
                        <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 shadow-sm" />
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mt-4 w-80 overflow-hidden rounded-[2rem] border border-[#d7ebe6] bg-white p-0 text-[#163332] shadow-[0_24px_60px_rgba(19,51,50,0.10)]">
                <div className="flex items-center justify-between border-b border-[#e7f1ef] bg-[#f9fcfb] p-6">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#163332]">Inbox</h3>
                        <p className="mt-1 text-[10px] font-bold uppercase text-[#8aa39e]">Updates & Alerts</p>
                    </div>
                    {hasUnread && (
                        <span className="rounded-lg bg-red-50 px-2 py-0.5 text-[10px] font-black text-red-500">NEW</span>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {isLoading && notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 p-10">
                            <Loader2 className="h-5 w-5 animate-spin text-[#2c756e]" />
                            <span className="text-[10px] font-bold uppercase text-[#8aa39e]">Syncing...</span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-12 text-center">
                            <Bell className="mx-auto mb-4 h-10 w-10 text-[#c7dad6]" />
                            <p className="text-xs font-medium text-[#8aa39e]">All caught up here.</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={cn(
                                    "group relative cursor-pointer border-b border-[#eef4f2] p-5 transition-all hover:bg-[#f9fcfb]",
                                    !notif.is_read && "bg-[#f6fbfa]"
                                )}
                                onClick={() => !notif.is_read && markAsRead(notif.id)}
                            >
                                <div className="flex gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d7ebe6] bg-[#f4fbf9] transition-colors group-hover:bg-[#eef8f5]">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className={cn("text-xs font-bold", notif.is_read ? "text-[#7d9a95]" : "text-[#163332]")}>
                                                {notif.title}
                                            </h4>
                                            <span className="text-[9px] font-medium text-[#9bb1ad]">
                                                {format(new Date(notif.created_at), "HH:mm")}
                                            </span>
                                        </div>
                                        <p className="line-clamp-2 text-[11px] leading-relaxed text-[#698782]">
                                            {notif.message}
                                        </p>
                                    </div>
                                </div>
                                {!notif.is_read && (
                                    <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[#2c756e]" />
                                )}
                                {notif.ref_id && (
                                    <Link
                                        href={notif.type.includes("consultation") ? `/consultation/${notif.ref_id}` : "#"}
                                        className="absolute inset-0 z-10"
                                    />
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="border-t border-[#e7f1ef] bg-[#f9fcfb] p-4 text-center">
                    <button className="text-[10px] font-black uppercase tracking-widest text-[#7d9a95] transition-colors hover:text-[#163332]">
                        View Clear All
                    </button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
