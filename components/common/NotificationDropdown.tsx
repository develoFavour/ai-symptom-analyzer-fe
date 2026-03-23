"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, CheckCircle2, Clock, MessageSquare, AlertCircle, Trash2, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
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
        const res = await api.get<Notification[]>("/api/v1/notifications");
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
        const res = await api.patch(`/api/v1/notifications/${id}/read`, {});
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
                <div className="h-11 w-11 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all relative group">
                    <Bell className={cn("h-5 w-5", hasUnread && "animate-tada")} />
                    {hasUnread && (
                        <span className="absolute top-3 right-3 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-[#050505] shadow-lg shadow-red-500/50" />
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass border-white/10 rounded-[2rem] p-0 w-80 text-white mt-4 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest">Inbox</h3>
                        <p className="text-[10px] text-white/30 font-bold uppercase mt-1">Updates & Alerts</p>
                    </div>
                    {hasUnread && (
                        <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-black rounded-lg">NEW</span>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {isLoading && notifications.length === 0 ? (
                        <div className="p-10 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="h-5 w-5 animate-spin text-white/20" />
                            <span className="text-[10px] text-white/20 font-bold uppercase">Syncing...</span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-12 text-center">
                            <Bell className="h-10 w-10 mx-auto mb-4 text-white/5" />
                            <p className="text-white/30 text-xs font-medium">All caught up here.</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={cn(
                                    "p-5 hover:bg-white/5 transition-all border-b border-white/5 cursor-pointer group relative",
                                    !notif.is_read && "bg-white/[0.02]"
                                )}
                                onClick={() => !notif.is_read && markAsRead(notif.id)}
                            >
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-white/10 transition-colors">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className={cn("text-xs font-bold", notif.is_read ? "text-white/40" : "text-white")}>
                                                {notif.title}
                                            </h4>
                                            <span className="text-[9px] text-white/20 font-medium">
                                                {format(new Date(notif.created_at), "HH:mm")}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-white/30 leading-relaxed line-clamp-2">
                                            {notif.message}
                                        </p>
                                    </div>
                                </div>
                                {!notif.is_read && (
                                    <span className="absolute top-1/2 -translate-y-1/2 left-0 w-1 h-8 bg-emerald-500 rounded-r-full" />
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

                <div className="p-4 bg-white/5 border-t border-white/5 text-center">
                    <button className="text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-white transition-colors">
                        View Clear All
                    </button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
