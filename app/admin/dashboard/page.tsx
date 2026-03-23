"use client";

import { useEffect, useState } from "react";
import {
    Users, Stethoscope, Activity, Clock,
    ArrowUpRight, TrendingUp, Shield, Globe,
    Loader2, Database, Zap, UserPlus, X, Mail, CheckCircle2,
    Bug, ShieldAlert, BarChart3, LineChart
} from "lucide-react";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface AdminStats {
    total_patients: number;
    active_doctors: number;
    pending_invites: number;
    total_assessments: number;
    recent_actions: Array<{
        user: string;
        action: string;
        time: string;
    }>;
    activity: Array<{
        name: string;
        assessments: number;
        accuracy: number;
    }>;
    distribution: Array<{
        name: string;
        count: number;
    }>;
}

// Color palette for the bar chart
const CHART_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b'];

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Invite Modal State
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [isInviting, setIsInviting] = useState(false);
    const [inviteSuccess, setInviteSuccess] = useState(false);

    const fetchStats = async () => {
        setIsLoading(true);
        const res = await api.get<AdminStats>("/api/v1/admin/stats");
        if (res.success && res.data) {
            setStats(res.data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleInviteAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInviting(true);
        const res = await api.post("/api/v1/admin/invite", { email: inviteEmail });
        setIsInviting(false);
        
        if (res.success) {
            setInviteSuccess(true);
            setInviteEmail("");
            setTimeout(() => {
                setInviteSuccess(false);
                setIsInviteModalOpen(false);
            }, 3000);
            fetchStats();
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-6 text-white/20 uppercase tracking-[0.3em]">
                <Loader2 className="h-12 w-12 animate-spin text-white/40" />
                <p className="text-[10px] font-black">Syncing Executive Analytics...</p>
            </div>
        );
    }

    const cards = [
        {
            label: "Total Patients",
            value: stats?.total_patients || 0,
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            trend: "+12.5%",
            trendUp: true
        },
        {
            label: "Active Doctors",
            value: stats?.active_doctors || 0,
            icon: Stethoscope,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
            trend: "94.2% Load",
            trendUp: false
        },
        {
            label: "AI Assessments",
            value: stats?.total_assessments || 0,
            icon: Activity,
            color: "text-purple-400",
            bg: "bg-purple-400/10",
            trend: "98.2% Accuracy",
            trendUp: true
        },
        {
            label: "Inference Time",
            value: "1.2s",
            icon: Zap,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            trend: "-0.4s Optimized",
            trendUp: true
        },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20 px-6 lg:px-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Registry Overview</h1>
                    <p className="text-white/40 mt-1 text-lg font-medium italic">Advanced system telemetry and governance dashboard.</p>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Protocol Operational</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6 hover:bg-white/8 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform">
                            <card.icon className="h-24 w-24" />
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110", card.bg)}>
                                <card.icon className={cn("h-7 w-7", card.color)} />
                            </div>
                            <div className="h-8 w-8 rounded-full border border-white/5 flex items-center justify-center text-white/20">
                                <ArrowUpRight className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">{card.label}</p>
                            <h2 className="text-4xl font-black text-white mt-1 italic tracking-tighter uppercase">{card.value}</h2>
                        </div>
                        <div className={cn(
                            "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest relative z-10",
                            card.trendUp ? "text-emerald-500" : "text-amber-500"
                        )}>
                            <TrendingUp className="h-3.5 w-3.5" />
                            {card.trend}
                        </div>
                    </div>
                ))}
            </div>

            {/* Visual Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Activity Graph */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 space-y-8 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-2 italic">
                                <LineChart className="h-5 w-5 text-blue-400" />
                                Diagnostic Activity
                            </h3>
                            <p className="text-xs text-white/30 font-bold uppercase tracking-widest">AI Inference Volumetric Analysis</p>
                        </div>
                        <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all cursor-pointer">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.activity || []}>
                                <defs>
                                    <linearGradient id="colorAssessments" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#ffffff20" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    fontWeight="bold"
                                />
                                <YAxis 
                                    stroke="#ffffff20" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    fontWeight="bold"
                                />
                                <Tooltip 
                                    contentStyle={{ background: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                    cursor={{ stroke: '#ffffff10', strokeWidth: 2 }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="assessments" 
                                    stroke="#3b82f6" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#colorAssessments)" 
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Epidemiological Bar Chart */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 space-y-8 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-2 italic">
                                <BarChart3 className="h-5 w-5 text-emerald-400" />
                                Epidemic Distribution
                            </h3>
                            <p className="text-xs text-white/30 font-bold uppercase tracking-widest">Global Disease Surveillance Data</p>
                        </div>
                        <button className="text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-white transition-all underline underline-offset-8">Download CSV</button>
                    </div>

                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.distribution || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#ffffff20" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    fontWeight="bold"
                                />
                                <YAxis 
                                    stroke="#ffffff20" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    fontWeight="bold"
                                />
                                <Tooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.03)'}}
                                    contentStyle={{ background: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', fontSize: '12px' }}
                                />
                                <Bar dataKey="count" radius={[12, 12, 0, 0]} animationDuration={2500}>
                                    {(stats?.distribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Infrastructure & Audit */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* System Health */}
                <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 space-y-10 relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 p-10 opacity-[0.01]">
                        <Globe className="h-[400px] w-[400px]" />
                    </div>

                    <div className="flex items-center justify-between relative z-10">
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic">Protocol Infrastructure</h3>
                        <button className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] hover:text-white transition-colors">Advanced Diagnostics</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                        <HealthStat
                            label="GORM PostgreSQL Cluster"
                            status="Sovereign"
                            desc="0.2ms latency optimization active"
                            icon={<Database className="h-5 w-5 text-blue-400" />}
                        />
                        <HealthStat
                            label="Gemini LLM Inference"
                            status="Responsive"
                            desc="Token speed: 124/sec"
                            icon={<Zap className="h-5 w-5 text-amber-500" />}
                        />
                        <HealthStat
                            label="JWT Secure Kernel"
                            status="Locked"
                            desc="Bi-directional handshake established"
                            icon={<Shield className="h-5 w-5 text-emerald-500" />}
                        />
                        <HealthStat
                            label="WebSocket Pipeline"
                            status="Live"
                            desc="Real-time consultation sync"
                            icon={<Activity className="h-5 w-5 text-purple-400" />}
                        />
                    </div>
                </div>

                {/* Governance Section */}
                <div className="space-y-6">
                    <div className="bg-white text-black rounded-[2.5rem] p-10 space-y-6 shadow-2xl shadow-white/5 relative overflow-hidden group">
                        <div className="absolute -top-4 -right-4 h-24 w-24 bg-black/5 rounded-full blur-2xl group-hover:bg-black/10 transition-colors" />
                        <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2 relative z-10 italic">
                            <ShieldAlert className="h-5 w-5" />
                            Security Panel
                        </h3>
                        <p className="text-sm font-bold leading-relaxed opacity-60 relative z-10 italic">
                            Scale administrative oversight by granting executive access to validated personnel.
                        </p>
                        <button 
                            onClick={() => setIsInviteModalOpen(true)}
                            className="w-full h-16 bg-black text-white rounded-2xl flex items-center justify-center gap-2 font-black text-[11px] tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all uppercase relative z-10"
                        >
                            <UserPlus className="h-4 w-4" />
                            Issue Executive Token
                        </button>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                        <h4 className="text-white/40 font-black text-[10px] uppercase tracking-widest mb-6 italic opacity-50">Governance Log</h4>
                        <div className="space-y-6">
                            {stats?.recent_actions && stats.recent_actions.length > 0 ? (
                                stats.recent_actions.map((item, idx) => (
                                    <ActionItem
                                        key={idx}
                                        user={item.user}
                                        action={item.action}
                                        time={formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                                    />
                                ))
                            ) : (
                                <p className="text-white/20 text-[10px] font-black uppercase tracking-widest text-center py-4">Registry Clear</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Invite Admin Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-6">
                    <form 
                        onSubmit={handleInviteAdmin}
                        className="bg-[#050505] border border-white/10 rounded-[3.5rem] p-12 w-full max-w-md shadow-2xl space-y-10 relative overflow-hidden animate-in zoom-in duration-300"
                    >
                        {/* Success Overlay */}
                        {inviteSuccess && (
                            <div className="absolute inset-0 bg-emerald-500 z-50 flex flex-col items-center justify-center text-black p-10 text-center space-y-6 animate-in fade-in duration-500">
                                <CheckCircle2 className="h-24 w-24" />
                                <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Access Granted</h2>
                                <p className="font-extrabold text-lg opacity-80 leading-tight">Executive invitation has been dispatched to surveillance hub.</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Elevate Privileges</h2>
                                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] italic">Issuing secure governance token.</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setIsInviteModalOpen(false)}
                                className="h-12 w-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2 italic">Official Inbox</label>
                                <div className="relative group">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-white transition-colors" />
                                    <input
                                        required
                                        type="email"
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                        placeholder="admin@vitalis.ai"
                                        className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] pl-14 pr-8 py-5 text-white text-md focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-bold placeholder:text-white/5"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                            <li className="flex items-center gap-3 text-[10px] font-black text-white/20 uppercase tracking-widest italic">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                24H Token Expiry Lifecycle
                            </li>
                            <li className="flex items-center gap-3 text-[10px] font-black text-white/20 uppercase tracking-widest italic">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                Multi-Factor Authentication Required
                            </li>
                        </div>

                        <button
                            type="submit"
                            disabled={isInviting || inviteSuccess}
                            className="w-full h-16 bg-white text-black font-black text-sm rounded-[1.5rem] hover:bg-white/90 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-white/5 active:scale-95 uppercase tracking-[0.2em] italic"
                        >
                            {isInviting ? (
                                <><Loader2 className="h-5 w-5 animate-spin" /> Verifying Credentials...</>
                            ) : (
                                <><Shield className="h-5 w-5" /> Deploy Access</>
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

function HealthStat({ label, status, desc, icon }: any) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
                    {icon}
                </div>
                <div>
                    <h4 className="text-white font-black text-sm uppercase tracking-tight">{label}</h4>
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mt-0.5 italic">{status}</p>
                </div>
            </div>
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[100%] opacity-40" />
            </div>
            <p className="text-[10px] text-white/30 font-bold italic uppercase tracking-tighter">{desc}</p>
        </div>
    );
}

function ActionItem({ user, action, time }: any) {
    return (
        <div className="flex items-center justify-between text-[10px] transition-opacity hover:opacity-80">
            <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
                <p className="text-white/40 leading-tight font-bold uppercase tracking-widest">
                    <span className="text-white italic">{user}</span> {action}
                </p>
            </div>
            <span className="text-white/10 font-mono text-[9px] shrink-0 ml-3 italic">{time}</span>
        </div>
    );
}
