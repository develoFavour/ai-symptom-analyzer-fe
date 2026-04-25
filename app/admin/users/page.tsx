"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Mail,
    Shield,
    ShieldAlert,
    CheckCircle,
    Search,
    Loader2,
    X,
    Ban,
    Trash2,
    User,
    Stethoscope,
    Clock,
    Calendar,
    ShieldCheck,
    AtSign,
    CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/common/ConfirmModal";

type TabType = "patients" | "doctors" | "admins";
type ConfirmType = "user" | "doctor" | "admin";

interface DirectoryUser {
    id: string;
    name: string;
    email: string;
    username?: string;
    is_active?: boolean;
    status?: string;
    specialization?: string;
    created_at: string;
}

interface ConfirmState {
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    type: ConfirmType;
}

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    label: string;
    count?: number;
}

interface AvatarProps {
    type: TabType;
    active: boolean;
}

interface BadgeProps {
    status: string;
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
    variant: "danger" | "success";
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
}

interface IconButtonProps {
    icon: React.ReactNode;
    onClick: () => void;
}

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    title: string;
    isInviting: boolean;
    showName?: boolean;
    name?: string;
    setName?: React.Dispatch<React.SetStateAction<string>>;
    email: string;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
}

export default function UserManagementPage() {
    const { user: currentUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState<TabType>("patients");
    const [users, setUsers] = useState<DirectoryUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [isInviteDoctorOpen, setIsInviteDoctorOpen] = useState(false);
    const [isInviteAdminOpen, setIsInviteAdminOpen] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [inviteName, setInviteName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [confirmState, setConfirmState] = useState<ConfirmState>({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => {},
        type: "user",
    });

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        let endpoint = "/admin/users";
        if (activeTab === "doctors") endpoint = "/admin/doctors";
        if (activeTab === "admins") endpoint = "/admin/admins";

        const res = await api.get<DirectoryUser[]>(endpoint);
        if (res.success && res.data) {
            setUsers(res.data);
        }
        setIsLoading(false);
    }, [activeTab]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            void fetchUsers();
        }, 0);

        return () => clearTimeout(timeoutId);
    }, [fetchUsers]);

    const handlePatientStatus = async (user: DirectoryUser) => {
        setIsUpdating(user.id);
        const res = await api.patch(`/admin/users/${user.id}/status`, {
            is_active: String(!user.is_active),
        });
        setIsUpdating(null);
        if (res.success) {
            toast.success("Identity status updated");
            void fetchUsers();
        } else {
            toast.error(res.error || "Update failed");
        }
    };

    const handleDoctorStatus = async (id: string, newStatus: string) => {
        setIsUpdating(id);
        const res = await api.patch(`/admin/doctors/${id}/status`, { status: newStatus });
        setIsUpdating(null);
        if (res.success) {
            toast.success("Specialist credentials revised");
            void fetchUsers();
        } else {
            toast.error(res.error || "Update failed");
        }
    };

    const handleDelete = (id: string, type: ConfirmType) => {
        setConfirmState({
            isOpen: true,
            title: `Delete ${type} Entry?`,
            description: `This action will permanently remove this ${type} from the registry. This action cannot be reversed within the HIPAA-compliant ledger.`,
            type,
            onConfirm: async () => {
                setIsUpdating(id);
                let endpoint = `/admin/users/${id}`;
                if (type === "admin") endpoint = `/admin/admins/${id}`;

                const res = await api.del(endpoint);
                setIsUpdating(null);
                setConfirmState((prev) => ({ ...prev, isOpen: false }));

                if (res.success) {
                    toast.success(`${type} deleted from registry`);
                    void fetchUsers();
                } else {
                    toast.error(res.error || "Deletion failed");
                }
            },
        });
    };

    const handleInvite = async (e: React.FormEvent, type: "doctor" | "admin") => {
        e.preventDefault();
        setIsInviting(true);
        const endpoint = type === "doctor" ? "/admin/doctors/invite" : "/admin/invite";
        const payload = type === "doctor" ? { name: inviteName, email: inviteEmail } : { email: inviteEmail };

        const res = await api.post(endpoint, payload);
        setIsInviting(false);
        if (res.success) {
            toast.success(`Invitation dispatched to ${inviteEmail}`);
            setIsInviteDoctorOpen(false);
            setIsInviteAdminOpen(false);
            setInviteName("");
            setInviteEmail("");
            void fetchUsers();
        } else {
            toast.error(res.error || "Dispatch failed");
        }
    };

    const filteredUsers = users.filter(
        (u) =>
            (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.username || "").toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <div className="mx-auto max-w-7xl space-y-10 pb-20 text-[#163332]">
            <div className="flex flex-col justify-between gap-6 px-4 md:flex-row md:items-end lg:px-0">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-[#163332]">User Management</h1>
                    <p className="mt-1 text-lg font-medium text-[#698782]">Platform-wide governance and identity control.</p>
                </div>

                <div className="flex items-center gap-3">
                    {activeTab === "doctors" && (
                        <button
                            onClick={() => setIsInviteDoctorOpen(true)}
                            className="flex items-center gap-2 rounded-2xl bg-[#2c756e] px-8 py-3.5 text-xs font-black uppercase text-white shadow-[0_14px_30px_rgba(44,117,110,0.18)] transition-all hover:bg-[#245f5a]"
                        >
                            <Stethoscope className="h-4 w-4" />
                            Invite Specialist
                        </button>
                    )}
                    {activeTab === "admins" && (
                        <button
                            onClick={() => setIsInviteAdminOpen(true)}
                            className="flex items-center gap-2 rounded-2xl border border-[#d7ebe6] bg-white px-8 py-3.5 text-xs font-black uppercase text-[#163332] shadow-[0_10px_24px_rgba(19,51,50,0.05)] transition-all hover:bg-[#f7fbfa]"
                        >
                            <Shield className="h-4 w-4 text-sky-600" />
                            Invite Administrator
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-6 px-4 lg:px-0">
                <div className="flex flex-col justify-between gap-6 border-b border-[#e7f1ef] pb-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                        <TabButton
                            active={activeTab === "patients"}
                            onClick={() => setActiveTab("patients")}
                            label="Patients"
                            count={activeTab === "patients" ? users.length : undefined}
                        />
                        <TabButton
                            active={activeTab === "doctors"}
                            onClick={() => setActiveTab("doctors")}
                            label="Medical Staff"
                            count={activeTab === "doctors" ? users.length : undefined}
                        />
                        <TabButton
                            active={activeTab === "admins"}
                            onClick={() => setActiveTab("admins")}
                            label="Admins"
                            count={activeTab === "admins" ? users.length : undefined}
                        />
                    </div>

                    <div className="group relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9bb3ae] transition-colors group-focus-within:text-[#2c756e]" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search directory..."
                            className="w-full rounded-2xl border border-[#d7ebe6] bg-white py-3 pl-12 pr-6 text-sm text-[#163332] shadow-[0_10px_24px_rgba(19,51,50,0.04)] transition-all placeholder:text-[#9bb3ae] focus:border-[#9dcfc6] focus:outline-none focus:ring-4 focus:ring-[#dff2ed]"
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 px-4 lg:px-0">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-32 text-[#8aa39e]">
                        <Loader2 className="h-10 w-10 animate-spin text-[#2c756e]" />
                        <p className="text-xs font-bold uppercase tracking-widest">Indexing {activeTab}...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="rounded-[3rem] border border-dashed border-[#d7ebe6] bg-white p-24 text-center shadow-[0_18px_40px_rgba(19,51,50,0.04)]">
                        <User className="mx-auto mb-6 h-16 w-16 text-[#c4d7d3]" />
                        <h3 className="text-xl font-bold text-[#4f6d68]">Registry entry not found</h3>
                        <p className="mt-1 text-sm text-[#8aa39e]">No matches in current directory view.</p>
                    </div>
                ) : (
                    filteredUsers.map((u) => (
                        <div
                            key={u.id}
                            className="group flex flex-col justify-between gap-8 rounded-[2.5rem] border border-[#dcece8] bg-white p-8 shadow-[0_14px_32px_rgba(19,51,50,0.05)] transition-all hover:border-[#bfded7] hover:bg-[#fcfffe] md:flex-row md:items-center"
                        >
                            <div className="flex items-center gap-6">
                                <Avatar type={activeTab} active={u.is_active !== false && u.status !== "suspended"} />
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold tracking-tight text-[#163332]">{u.name || "Pending Account"}</h3>
                                        <Badge status={activeTab === "patients" ? (u.is_active ? "active" : "suspended") : (u.status || "active")} />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                        <span className="flex items-center gap-2 text-sm text-[#698782]">
                                            <Mail className="h-4 w-4" /> {u.email}
                                        </span>
                                        {u.specialization && (
                                            <span className="flex items-center gap-2 text-sm text-[#698782]">
                                                <Stethoscope className="h-4 w-4" /> {u.specialization}
                                            </span>
                                        )}
                                        {u.username && (
                                            <span className="flex items-center gap-2 text-sm text-[#698782]">
                                                <AtSign className="h-4 w-4" /> {u.username}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#8aa39e]">
                                            <Calendar className="h-3 w-3" /> Registered {format(new Date(u.created_at), "MMM yyyy")}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {activeTab === "patients" && (
                                    <>
                                        <ActionButton
                                            icon={u.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                            label={u.is_active ? "Suspend" : "Activate"}
                                            variant={u.is_active ? "danger" : "success"}
                                            onClick={() => handlePatientStatus(u)}
                                            loading={isUpdating === u.id}
                                        />
                                        <IconButton icon={<Trash2 className="h-4 w-4" />} onClick={() => handleDelete(u.id, "user")} />
                                    </>
                                )}
                                {activeTab === "doctors" && (
                                    <ActionButton
                                        icon={u.status === "suspended" ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                                        label={u.status === "suspended" ? "Reactivate" : "Suspend Access"}
                                        variant={u.status === "suspended" ? "success" : "danger"}
                                        onClick={() => handleDoctorStatus(u.id, u.status === "suspended" ? "active" : "suspended")}
                                        loading={isUpdating === u.id}
                                    />
                                )}
                                {activeTab === "admins" && (
                                    <ActionButton
                                        icon={<Trash2 className="h-4 w-4" />}
                                        label="Revoke Access"
                                        variant="danger"
                                        onClick={() => handleDelete(u.id, "admin")}
                                        disabled={currentUser?.id === u.id}
                                        loading={isUpdating === u.id}
                                    />
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <InviteModal
                isOpen={isInviteDoctorOpen}
                onClose={() => setIsInviteDoctorOpen(false)}
                onSubmit={(e: React.FormEvent) => handleInvite(e, "doctor")}
                title="Specialist Invitation"
                isInviting={isInviting}
                showName
                name={inviteName}
                setName={setInviteName}
                email={inviteEmail}
                setEmail={setInviteEmail}
            />

            <InviteModal
                isOpen={isInviteAdminOpen}
                onClose={() => setIsInviteAdminOpen(false)}
                onSubmit={(e: React.FormEvent) => handleInvite(e, "admin")}
                title="Admin Invitation"
                isInviting={isInviting}
                email={inviteEmail}
                setEmail={setInviteEmail}
            />

            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                description={confirmState.description}
                confirmText={`Delete ${confirmState.type}`}
                isLoading={isUpdating !== null}
            />
        </div>
    );
}

function TabButton({ active, onClick, label, count }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative whitespace-nowrap px-2 pb-4 text-sm font-black uppercase tracking-[0.2em] transition-all",
                active ? "text-[#163332]" : "text-[#8aa39e] hover:text-[#4f6d68]",
            )}
        >
            <span className="flex items-center gap-3">
                {label}
                {count !== undefined && (
                    <span className="rounded-lg border border-[#d7ebe6] bg-[#f4fbf9] px-2 py-0.5 text-[10px] text-[#698782]">{count}</span>
                )}
            </span>
            {active && <div className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-[#2c756e] animate-in slide-in-from-bottom-2 duration-300" />}
        </button>
    );
}

function Avatar({ type, active }: AvatarProps) {
    const Icon = type === "doctors" ? Stethoscope : type === "admins" ? Shield : User;
    return (
        <div
            className={cn(
                "flex h-20 w-20 items-center justify-center rounded-[2rem] border transition-all duration-500",
                active
                    ? "border-[#d7ebe6] bg-[#f4fbf9] text-[#8aa39e] group-hover:border-[#c6e4dd] group-hover:bg-[#eef8f5] group-hover:text-[#2c756e]"
                    : "border-red-200 bg-red-50 text-red-500 grayscale",
            )}
        >
            <Icon className="h-10 w-10" />
        </div>
    );
}

function Badge({ status }: BadgeProps) {
    const config = {
        active: { label: "Active", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: ShieldCheck },
        pending: { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Clock },
        suspended: { label: "Suspended", bg: "bg-red-50", text: "text-red-600", border: "border-red-200", icon: ShieldAlert },
    } as const;
    const c = config[status as keyof typeof config] || config.pending;
    return (
        <span className={cn("flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest", c.bg, c.text, c.border)}>
            <c.icon className="h-3 w-3" />
            {c.label}
        </span>
    );
}

function ActionButton({ icon, label, variant, onClick, disabled, loading }: ActionButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={cn(
                "flex h-12 items-center gap-3 rounded-2xl border px-6 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30",
                variant === "danger"
                    ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white",
            )}
        >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : icon}
            {label}
        </button>
    );
}

function IconButton({ icon, onClick }: IconButtonProps) {
    return (
        <button
            onClick={onClick}
            className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d7ebe6] bg-white text-[#8aa39e] transition-all active:scale-95 hover:border-red-500 hover:bg-red-500 hover:text-white"
        >
            <div className="transition-transform group-hover:scale-110">{icon}</div>
        </button>
    );
}

function InviteModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    isInviting,
    showName,
    name,
    setName,
    email,
    setEmail,
}: InviteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(17,33,32,0.35)] p-6 backdrop-blur-sm">
            <form
                onSubmit={onSubmit}
                className="relative w-full max-w-xl space-y-12 overflow-hidden rounded-[3rem] border border-[#dcece8] bg-white p-12 shadow-[0_24px_60px_rgba(19,51,50,0.18)]"
            >
                <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[#eef8f5] blur-3xl" />

                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-[#163332]">{title}</h2>
                        <p className="mt-1 text-sm font-medium tracking-tight text-[#698782]">Expand the network infrastructure.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f4fbf9] text-[#698782] transition-all hover:bg-[#e9f5f2] hover:text-[#163332]"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="relative z-10 space-y-6">
                    {showName && setName && (
                        <div className="space-y-2">
                            <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#8aa39e]">Display Identity</label>
                            <div className="group relative">
                                <User className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9bb3ae] transition-colors group-focus-within:text-[#2c756e]" />
                                <input
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Dr. Jane Smith"
                                    className="w-full rounded-3xl border border-[#d7ebe6] bg-[#f9fcfb] py-6 pl-16 pr-6 text-md font-bold text-[#163332] transition-all placeholder:text-[#b7cbc7] focus:border-[#9dcfc6] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#dff2ed]"
                                />
                            </div>
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#8aa39e]">Dispatch Endpoint (Email)</label>
                        <div className="group relative">
                            <Mail className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9bb3ae] transition-colors group-focus-within:text-[#2c756e]" />
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="alias@vitalis.ai"
                                className="w-full rounded-3xl border border-[#d7ebe6] bg-[#f9fcfb] py-6 pl-16 pr-6 text-md font-bold text-[#163332] transition-all placeholder:text-[#b7cbc7] focus:border-[#9dcfc6] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#dff2ed]"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isInviting}
                    className="flex h-20 w-full items-center justify-center gap-4 rounded-[2.5rem] bg-[#2c756e] text-lg font-black text-white shadow-[0_18px_36px_rgba(44,117,110,0.18)] transition-all active:scale-95 hover:bg-[#245f5a] disabled:opacity-50"
                >
                    {isInviting ? <Loader2 className="h-8 w-8 animate-spin" /> : <><CheckCircle2 className="h-6 w-6" /> Send Invitation</>}
                </button>
            </form>
        </div>
    );
}
