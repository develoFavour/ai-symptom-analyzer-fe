"use client";

import { useEffect, useState } from "react";
import {
    UserPlus, Mail, Shield, ShieldAlert, CheckCircle,
    Search, Loader2, X, Ban, Trash2,
    User, Stethoscope, Clock, Calendar, ShieldCheck,
    AtSign, CheckCircle2, MoreVertical
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/common/ConfirmModal";

type TabType = "patients" | "doctors" | "admins";

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

export default function UserManagementPage() {
    const { user: currentUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState<TabType>("patients");
    const [users, setUsers] = useState<DirectoryUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    // Modals
    const [isInviteDoctorOpen, setIsInviteDoctorOpen] = useState(false);
    const [isInviteAdminOpen, setIsInviteAdminOpen] = useState(false);
    const [isInviting, setIsInviting] = useState(false);

    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
        type: "user" | "doctor" | "admin";
    }>({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => { },
        type: "user"
    });

    // Invite Form States
    const [inviteName, setInviteName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");

    const fetchUsers = async () => {
        setIsLoading(true);
        let endpoint = "/api/v1/admin/users";
        if (activeTab === "doctors") endpoint = "/api/v1/admin/doctors";
        if (activeTab === "admins") endpoint = "/api/v1/admin/admins";

        const res = await api.get<DirectoryUser[]>(endpoint);
        if (res.success && res.data) {
            setUsers(res.data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, [activeTab]);

    const handlePatientStatus = async (user: DirectoryUser) => {
        setIsUpdating(user.id);
        const res = await api.patch(`/api/v1/admin/users/${user.id}/status`, {
            is_active: String(!user.is_active)
        });
        setIsUpdating(null);
        if (res.success) {
            toast.success("Identity status updated");
            fetchUsers();
        } else {
            toast.error(res.error || "Update failed");
        }
    };

    const handleDoctorStatus = async (id: string, newStatus: string) => {
        setIsUpdating(id);
        const res = await api.patch(`/api/v1/admin/doctors/${id}/status`, { status: newStatus });
        setIsUpdating(null);
        if (res.success) {
            toast.success("Specialist credentials revised");
            fetchUsers();
        } else {
            toast.error(res.error || "Update failed");
        }
    };

    const handleDelete = (id: string, type: "user" | "doctor" | "admin") => {
        setConfirmState({
            isOpen: true,
            title: `Delete ${type} Entry?`,
            description: `This action will permanently remove this ${type} from the registry. This action cannot be reversed within the HIPAA-compliant ledger.`,
            type,
            onConfirm: async () => {
                setIsUpdating(id);
                let endpoint = `/api/v1/admin/users/${id}`;
                if (type === "admin") endpoint = `/api/v1/admin/admins/${id}`;

                const res = await api.del(endpoint);
                setIsUpdating(null);
                setConfirmState(prev => ({ ...prev, isOpen: false }));

                if (res.success) {
                    toast.success(`${type} deleted from registry`);
                    fetchUsers();
                } else {
                    toast.error(res.error || "Deletion failed");
                }
            }
        });
    };

    const handleInvite = async (e: React.FormEvent, type: "doctor" | "admin") => {
        e.preventDefault();
        setIsInviting(true);
        const endpoint = type === "doctor" ? "/api/v1/admin/doctors/invite" : "/api/v1/admin/invite";
        const payload = type === "doctor" ? { name: inviteName, email: inviteEmail } : { email: inviteEmail };

        const res = await api.post(endpoint, payload);
        setIsInviting(false);
        if (res.success) {
            toast.success(`Invitation dispatched to ${inviteEmail}`);
            setIsInviteDoctorOpen(false);
            setIsInviteAdminOpen(false);
            setInviteName("");
            setInviteEmail("");
            fetchUsers();
        } else {
            toast.error(res.error || "Dispatch failed");
        }
    };

    const filteredUsers = users.filter(u =>
        (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.username || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 lg:px-0">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight italic">User Management</h1>
                    <p className="text-white/40 mt-1 text-lg font-medium">Platform-wide governance and identity control.</p>
                </div>

                <div className="flex items-center gap-3">
                    {activeTab === "doctors" && (
                        <button
                            onClick={() => setIsInviteDoctorOpen(true)}
                            className="bg-white text-black px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 hover:bg-white/90 transition-all shadow-xl shadow-white/5 uppercase text-xs"
                        >
                            <Stethoscope className="h-4 w-4" />
                            Invite Specialist
                        </button>
                    )}
                    {activeTab === "admins" && (
                        <button
                            onClick={() => setIsInviteAdminOpen(true)}
                            className="bg-[#1e1e1e] border border-white/10 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 hover:bg-white/10 transition-all shadow-xl shadow-white/5 uppercase text-xs"
                        >
                            <Shield className="h-4 w-4 text-blue-400" />
                            Invite Administrator
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs & Search */}
            <div className="space-y-6 px-4 lg:px-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-2">
                    <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                        <TabButton active={activeTab === "patients"} onClick={() => setActiveTab("patients")} label="Patients" count={activeTab === "patients" ? users.length : undefined} />
                        <TabButton active={activeTab === "doctors"} onClick={() => setActiveTab("doctors")} label="Medical Staff" count={activeTab === "doctors" ? users.length : undefined} />
                        <TabButton active={activeTab === "admins"} onClick={() => setActiveTab("admins")} label="Admins" count={activeTab === "admins" ? users.length : undefined} />
                    </div>

                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-white transition-colors" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search directory..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Content List */}
            <div className="grid gap-4 px-4 lg:px-0">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-white/20">
                        <Loader2 className="h-10 w-10 animate-spin" />
                        <p className="text-xs font-bold uppercase tracking-widest">Indexing {activeTab}...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="bg-white/5 border border-white/5 rounded-[3rem] p-24 text-center border-dashed">
                        <User className="h-16 w-16 mx-auto mb-6 text-white/5" />
                        <h3 className="text-xl font-bold text-white/40 italic">Registry entry not found</h3>
                        <p className="text-white/20 text-sm mt-1">No matches in current directory view.</p>
                    </div>
                ) : (
                    filteredUsers.map(u => (
                        <div key={u.id} className="bg-[#0c0c0c] border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:bg-white/[0.03] transition-all group">
                            <div className="flex items-center gap-6">
                                <Avatar type={activeTab} active={u.is_active !== false && u.status !== "suspended"} />
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-xl text-white tracking-tight">{u.name || "Pending Account"}</h3>
                                        <Badge status={activeTab === "patients" ? (u.is_active ? "active" : "suspended") : (u.status || "active")} />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                        <span className="text-sm text-white/40 flex items-center gap-2"><Mail className="h-4 w-4" /> {u.email}</span>
                                        {u.specialization && <span className="text-sm text-white/40 flex items-center gap-2"><Stethoscope className="h-4 w-4" /> {u.specialization}</span>}
                                        {u.username && <span className="text-sm text-white/40 flex items-center gap-2"><AtSign className="h-4 w-4" /> {u.username}</span>}
                                        <span className="text-[10px] text-white/20 font-black uppercase tracking-widest flex items-center gap-2">
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

            {/* Modals */}
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
                onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                description={confirmState.description}
                confirmText={`Delete ${confirmState.type}`}
                isLoading={isUpdating !== null}
            />
        </div>
    );
}

// ── Shared UI Components ──────────────────────────────────────────────────────

function TabButton({ active, onClick, label, count }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "pb-4 px-2 text-sm font-black uppercase tracking-[0.2em] relative transition-all whitespace-nowrap",
                active ? "text-white" : "text-white/20 hover:text-white/40"
            )}
        >
            <span className="flex items-center gap-3">
                {label}
                {count !== undefined && (
                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">{count}</span>
                )}
            </span>
            {active && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full animate-in slide-in-from-bottom-2 duration-300" />
            )}
        </button>
    );
}

function Avatar({ type, active }: any) {
    const Icon = type === "doctors" ? Stethoscope : type === "admins" ? Shield : User;
    return (
        <div className={cn(
            "h-20 w-20 rounded-[2rem] flex items-center justify-center border transition-all duration-500",
            active ? "bg-white/5 border-white/10 text-white/20 group-hover:bg-white group-hover:text-black group-hover:scale-105" : "bg-red-500/10 border-red-500/20 text-red-500 shadow-2xl shadow-red-500/5 items-center grayscale"
        )}>
            <Icon className="h-10 w-10" />
        </div>
    );
}

function Badge({ status }: any) {
    const config: any = {
        active: { label: "Active", bg: "bg-emerald-500/10", text: "text-emerald-500", icon: ShieldCheck },
        pending: { label: "Pending", bg: "bg-amber-500/10", text: "text-amber-500", icon: Clock },
        suspended: { label: "Suspended", bg: "bg-red-500/10", text: "text-red-500", icon: ShieldAlert },
    };
    const c = config[status] || config.pending;
    return (
        <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/5", c.bg, c.text)}>
            <c.icon className="h-3 w-3" />
            {c.label}
        </span>
    );
}

function ActionButton({ icon, label, variant, onClick, disabled, loading }: any) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={cn(
                "h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 disabled:opacity-30",
                variant === "danger" ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black"
            )}
        >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : icon}
            {label}
        </button>
    );
}

function IconButton({ icon, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 text-white/20 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-95 group"
        >
            <div className="group-hover:scale-110 transition-transform">{icon}</div>
        </button>
    );
}

function InviteModal({ isOpen, onClose, onSubmit, title, isInviting, showName, name, setName, email, setEmail }: any) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
            <form onSubmit={onSubmit} className="bg-[#050505] border border-white/10 rounded-[4rem] p-12 w-full max-w-xl shadow-2xl space-y-12 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 h-64 w-64 bg-white/5 rounded-full blur-3xl" />

                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{title}</h2>
                        <p className="text-white/40 text-sm font-medium mt-1 tracking-tight">Expand the network infrastructure.</p>
                    </div>
                    <button type="button" onClick={onClose} className="h-12 w-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/20 transition-all">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="space-y-6 relative z-10">
                    {showName && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Display Identity</label>
                            <div className="relative group">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-white transition-colors" />
                                <input required value={name} onChange={e => setName(e.target.value)} placeholder="Dr. Jane Smith" className="w-full bg-white/5 border border-white/10 rounded-3xl pl-16 pr-6 py-6 text-white text-md focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-bold" />
                            </div>
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Dispatch Endpoint (Email)</label>
                        <div className="relative group">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-white transition-colors" />
                            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alias@vitalis.ai" className="w-full bg-white/5 border border-white/10 rounded-3xl pl-16 pr-6 py-6 text-white text-md focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-bold" />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isInviting}
                    className="w-full h-20 bg-white text-black font-black text-lg rounded-[2.5rem] hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-white/5 uppercase tracking-tighter italic"
                >
                    {isInviting ? <Loader2 className="h-8 w-8 animate-spin" /> : <><CheckCircle2 className="h-6 w-6" /> Send Invitation</>}
                </button>
            </form>
        </div>
    );
}
