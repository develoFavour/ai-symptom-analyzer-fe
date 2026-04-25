"use client";

import { useCallback, useEffect, useState } from "react";
import {
	Users,
	Stethoscope,
	Activity,
	ArrowUpRight,
	TrendingUp,
	Shield,
	Globe,
	Loader2,
	Database,
	Zap,
	UserPlus,
	X,
	Mail,
	CheckCircle2,
	ShieldAlert,
	BarChart3,
	LineChart,
} from "lucide-react";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	BarChart,
	Bar,
	Cell,
} from "recharts";
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

interface HealthStatProps {
	label: string;
	status: string;
	desc: string;
	icon: React.ReactNode;
}

interface ActionItemProps {
	user: string;
	action: string;
	time: string;
}

const CHART_COLORS = ["#2c756e", "#3f8f87", "#6ea8a1", "#f97316", "#ef4444"];

export default function AdminDashboard() {
	const [stats, setStats] = useState<AdminStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
	const [inviteEmail, setInviteEmail] = useState("");
	const [isInviting, setIsInviting] = useState(false);
	const [inviteSuccess, setInviteSuccess] = useState(false);

	const fetchStats = useCallback(async () => {
		setIsLoading(true);
		const res = await api.get<AdminStats>("/admin/stats");
		if (res.success && res.data) {
			setStats(res.data);
		}
		setIsLoading(false);
	}, []);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			void fetchStats();
		}, 0);

		return () => clearTimeout(timeoutId);
	}, [fetchStats]);

	const handleInviteAdmin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsInviting(true);
		const res = await api.post("/admin/invite", { email: inviteEmail });
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
			<div className="flex flex-col items-center justify-center gap-6 py-40 uppercase tracking-[0.3em] text-[#8aa39e]">
				<Loader2 className="h-12 w-12 animate-spin text-[#2c756e]" />
				<p className="text-[10px] font-black">Syncing Executive Analytics...</p>
			</div>
		);
	}

	const cards = [
		{
			label: "Total Patients",
			value: stats?.total_patients || 0,
			icon: Users,
			color: "text-sky-600",
			bg: "bg-sky-50",
			iconWrap: "border-sky-100",
			trend: "+12.5%",
			trendUp: true,
		},
		{
			label: "Active Doctors",
			value: stats?.active_doctors || 0,
			icon: Stethoscope,
			color: "text-emerald-600",
			bg: "bg-emerald-50",
			iconWrap: "border-emerald-100",
			trend: "94.2% Load",
			trendUp: false,
		},
		{
			label: "AI Assessments",
			value: stats?.total_assessments || 0,
			icon: Activity,
			color: "text-violet-600",
			bg: "bg-violet-50",
			iconWrap: "border-violet-100",
			trend: "98.2% Accuracy",
			trendUp: true,
		},
		{
			label: "Pending Invites",
			value: stats?.pending_invites || 0,
			icon: Zap,
			color: "text-amber-600",
			bg: "bg-amber-50",
			iconWrap: "border-amber-100",
			trend: "Executive Access",
			trendUp: true,
		},
	];

	return (
		<div className="mx-auto max-w-7xl space-y-10 px-6 pb-20 text-[#163332] lg:px-0">
			<div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
				<div>
					<h1 className="text-4xl font-black tracking-tight text-[#163332]">
						Registry Overview
					</h1>
					<p className="mt-1 text-lg font-medium text-[#698782]">
						Advanced system telemetry and governance dashboard.
					</p>
				</div>
				<div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-6 py-3">
					<div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
					<span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
						Protocol Operational
					</span>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				{cards.map((card, idx) => (
					<div
						key={idx}
						className="group relative space-y-6 overflow-hidden rounded-[2.5rem] border border-[#dcece8] bg-white p-8 shadow-[0_14px_32px_rgba(19,51,50,0.05)] transition-all hover:border-[#bfded7] hover:bg-[#fcfffe]"
					>
						<div className="absolute right-0 top-0 p-8 opacity-[0.04] transition-transform group-hover:scale-125">
							<card.icon className="h-24 w-24" />
						</div>
						<div className="relative z-10 flex items-center justify-between">
							<div
								className={cn(
									"flex h-14 w-14 items-center justify-center rounded-2xl border shadow-sm transition-transform group-hover:scale-110",
									card.bg,
									card.iconWrap,
								)}
							>
								<card.icon className={cn("h-7 w-7", card.color)} />
							</div>
							<div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d7ebe6] text-[#8aa39e]">
								<ArrowUpRight className="h-4 w-4" />
							</div>
						</div>
						<div className="relative z-10">
							<p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8aa39e]">
								{card.label}
							</p>
							<h2 className="mt-1 text-4xl font-black tracking-tight text-[#163332]">
								{card.value}
							</h2>
						</div>
						<div
							className={cn(
								"relative z-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
								card.trendUp ? "text-emerald-600" : "text-amber-600",
							)}
						>
							<TrendingUp className="h-3.5 w-3.5" />
							{card.trend}
						</div>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
				<div className="relative space-y-8 overflow-hidden rounded-[3rem] border border-[#dcece8] bg-white p-10 shadow-[0_18px_40px_rgba(19,51,50,0.06)]">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<h3 className="flex items-center gap-2 text-xl font-black tracking-tight text-[#163332]">
								<LineChart className="h-5 w-5 text-sky-600" />
								Diagnostic Activity
							</h3>
							<p className="text-xs font-bold uppercase tracking-widest text-[#8aa39e]">
								AI Inference Volumetric Analysis
							</p>
						</div>
						<select className="cursor-pointer rounded-xl border border-[#d7ebe6] bg-[#f7fbfa] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#698782] transition-all focus:border-[#9dcfc6] focus:outline-none focus:ring-4 focus:ring-[#dff2ed]">
							<option>Last 7 Days</option>
							<option>Last 30 Days</option>
						</select>
					</div>

					<div className="mt-4 h-[300px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={stats?.activity || []}>
								<defs>
									<linearGradient
										id="colorAssessments"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop offset="5%" stopColor="#2c756e" stopOpacity={0.22} />
										<stop offset="95%" stopColor="#2c756e" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="#dcece8"
									vertical={false}
								/>
								<XAxis
									dataKey="name"
									stroke="#8aa39e"
									fontSize={10}
									tickLine={false}
									axisLine={false}
									fontWeight="bold"
								/>
								<YAxis
									stroke="#8aa39e"
									fontSize={10}
									tickLine={false}
									axisLine={false}
									fontWeight="bold"
								/>
								<Tooltip
									contentStyle={{
										background: "#ffffff",
										border: "1px solid #d7ebe6",
										borderRadius: "1rem",
										fontSize: "12px",
										color: "#163332",
										boxShadow: "0 10px 24px rgba(19,51,50,0.08)",
									}}
									cursor={{ stroke: "#bfded7", strokeWidth: 2 }}
								/>
								<Area
									type="monotone"
									dataKey="assessments"
									stroke="#2c756e"
									strokeWidth={4}
									fillOpacity={1}
									fill="url(#colorAssessments)"
									animationDuration={2000}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="relative space-y-8 overflow-hidden rounded-[3rem] border border-[#dcece8] bg-white p-10 shadow-[0_18px_40px_rgba(19,51,50,0.06)]">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<h3 className="flex items-center gap-2 text-xl font-black tracking-tight text-[#163332]">
								<BarChart3 className="h-5 w-5 text-emerald-600" />
								Epidemic Distribution
							</h3>
							<p className="text-xs font-bold uppercase tracking-widest text-[#8aa39e]">
								Global Disease Surveillance Data
							</p>
						</div>
						<button className="text-[10px] font-black uppercase tracking-widest text-[#698782] underline underline-offset-8 transition-all hover:text-[#163332]">
							Download CSV
						</button>
					</div>

					<div className="mt-4 h-[300px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={stats?.distribution || []}>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="#dcece8"
									vertical={false}
								/>
								<XAxis
									dataKey="name"
									stroke="#8aa39e"
									fontSize={10}
									tickLine={false}
									axisLine={false}
									fontWeight="bold"
								/>
								<YAxis
									stroke="#8aa39e"
									fontSize={10}
									tickLine={false}
									axisLine={false}
									fontWeight="bold"
								/>
								<Tooltip
									cursor={{ fill: "rgba(223,242,237,0.8)" }}
									contentStyle={{
										background: "#ffffff",
										border: "1px solid #d7ebe6",
										borderRadius: "1rem",
										fontSize: "12px",
										color: "#163332",
										boxShadow: "0 10px 24px rgba(19,51,50,0.08)",
									}}
								/>
								<Bar
									dataKey="count"
									radius={[12, 12, 0, 0]}
									animationDuration={2500}
								>
									{(stats?.distribution || []).map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={CHART_COLORS[index % CHART_COLORS.length]}
											fillOpacity={0.9}
										/>
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
				<div className="relative space-y-10 overflow-hidden rounded-[3rem] border border-[#dcece8] bg-white p-10 shadow-[0_18px_40px_rgba(19,51,50,0.06)] lg:col-span-2">
					<div className="absolute bottom-0 right-0 p-10 opacity-[0.03]">
						<Globe className="h-[400px] w-[400px]" />
					</div>

					<div className="relative z-10 flex items-center justify-between">
						<h3 className="text-2xl font-black tracking-tight text-[#163332]">
							Protocol Infrastructure
						</h3>
						<button className="text-[10px] font-black uppercase tracking-[0.3em] text-[#698782] transition-colors hover:text-[#163332]">
							Advanced Diagnostics
						</button>
					</div>

					<div className="relative z-10 grid grid-cols-1 gap-10 md:grid-cols-2">
						<HealthStat
							label="GORM PostgreSQL Cluster"
							status="Sovereign"
							desc="0.2ms latency optimization active"
							icon={<Database className="h-5 w-5 text-sky-600" />}
						/>
						<HealthStat
							label="Gemini LLM Inference"
							status="Responsive"
							desc="Token speed: 124/sec"
							icon={<Zap className="h-5 w-5 text-amber-600" />}
						/>
						<HealthStat
							label="JWT Secure Kernel"
							status="Locked"
							desc="Bi-directional handshake established"
							icon={<Shield className="h-5 w-5 text-emerald-600" />}
						/>
						<HealthStat
							label="WebSocket Pipeline"
							status="Live"
							desc="Real-time consultation sync"
							icon={<Activity className="h-5 w-5 text-violet-600" />}
						/>
					</div>
				</div>

				<div className="space-y-6">
					<div className="group relative space-y-6 overflow-hidden rounded-[2.5rem] border border-[#dcece8] bg-white p-10 shadow-[0_18px_40px_rgba(19,51,50,0.06)]">
						<div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#eef8f5] blur-2xl transition-colors group-hover:bg-[#e1f2ed]" />
						<h3 className="relative z-10 flex items-center gap-2 text-xl font-black tracking-tight text-[#163332]">
							<ShieldAlert className="h-5 w-5 text-[#2c756e]" />
							Security Panel
						</h3>
						<p className="relative z-10 text-sm font-bold leading-relaxed text-[#698782]">
							Scale administrative oversight by granting executive access to
							validated personnel.
						</p>
						<button
							onClick={() => setIsInviteModalOpen(true)}
							className="relative z-10 flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-[#2c756e] text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all hover:scale-[1.02] active:scale-95"
						>
							<UserPlus className="h-4 w-4" />
							Issue Executive Token
						</button>
					</div>

					<div className="rounded-[2.5rem] border border-[#dcece8] bg-white p-8 shadow-[0_14px_32px_rgba(19,51,50,0.05)]">
						<h4 className="mb-6 text-[10px] font-black uppercase tracking-widest text-[#8aa39e]">
							System Logs
						</h4>
						<div className="space-y-6">
							{stats?.recent_actions && stats.recent_actions.length > 0 ? (
								stats.recent_actions.map((item, idx) => (
									<ActionItem
										key={idx}
										user={item.user}
										action={item.action}
										time={formatDistanceToNow(new Date(item.time), {
											addSuffix: true,
										})}
									/>
								))
							) : (
								<p className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-[#8aa39e]">
									Registry Clear
								</p>
							)}
						</div>
					</div>
				</div>
			</div>

			{isInviteModalOpen && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(17,33,32,0.35)] p-6 backdrop-blur-sm">
					<form
						onSubmit={handleInviteAdmin}
						className="relative w-full max-w-md space-y-10 overflow-hidden rounded-[3rem] border border-[#dcece8] bg-white p-12 shadow-[0_24px_60px_rgba(19,51,50,0.18)] animate-in zoom-in duration-300"
					>
						{inviteSuccess && (
							<div className="absolute inset-0 z-50 flex flex-col items-center justify-center space-y-6 bg-emerald-500 p-10 text-center text-white animate-in fade-in duration-500">
								<CheckCircle2 className="h-24 w-24" />
								<h2 className="text-4xl font-black tracking-tight">
									Access Granted
								</h2>
								<p className="text-lg font-extrabold opacity-90">
									Executive invitation has been dispatched to surveillance hub.
								</p>
							</div>
						)}

						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<h2 className="text-3xl font-black tracking-tight text-[#163332]">
									Elevate Privileges
								</h2>
								<p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8aa39e]">
									Issuing secure governance token.
								</p>
							</div>
							<button
								type="button"
								onClick={() => setIsInviteModalOpen(false)}
								className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f4fbf9] text-[#698782] transition-colors hover:bg-[#e9f5f2] hover:text-[#163332]"
							>
								<X className="h-6 w-6" />
							</button>
						</div>

						<div className="space-y-8">
							<div className="space-y-3">
								<label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#8aa39e]">
									Official Inbox
								</label>
								<div className="group relative">
									<Mail className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9bb3ae] transition-colors group-focus-within:text-[#2c756e]" />
									<input
										required
										type="email"
										value={inviteEmail}
										onChange={(e) => setInviteEmail(e.target.value)}
										placeholder="admin@vitalis.ai"
										className="w-full rounded-[1.5rem] border border-[#d7ebe6] bg-[#f9fcfb] py-5 pl-14 pr-8 text-md font-bold text-[#163332] placeholder:text-[#b7cbc7] transition-all focus:border-[#9dcfc6] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#dff2ed]"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-3 rounded-2xl border border-[#e7f1ef] bg-[#f7fbfa] p-6">
							<li className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#698782]">
								<div className="h-1.5 w-1.5 rounded-full bg-sky-500" />
								24H Token Expiry Lifecycle
							</li>
							<li className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#698782]">
								<div className="h-1.5 w-1.5 rounded-full bg-sky-500" />
								Multi-Factor Authentication Required
							</li>
						</div>

						<button
							type="submit"
							disabled={isInviting || inviteSuccess}
							className="flex h-16 w-full items-center justify-center gap-3 rounded-[1.5rem] bg-[#2c756e] text-sm font-black uppercase tracking-[0.2em] text-white shadow-[0_18px_36px_rgba(44,117,110,0.18)] transition-all active:scale-95 hover:bg-[#245f5a] disabled:opacity-50"
						>
							{isInviting ? (
								<>
									<Loader2 className="h-5 w-5 animate-spin" /> Verifying
									Credentials...
								</>
							) : (
								<>
									<Shield className="h-5 w-5" /> Deploy Access
								</>
							)}
						</button>
					</form>
				</div>
			)}
		</div>
	);
}

function HealthStat({ label, status, desc, icon }: HealthStatProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-4">
				<div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d7ebe6] bg-[#f4fbf9] shadow-inner">
					{icon}
				</div>
				<div>
					<h4 className="text-sm font-black tracking-tight text-[#163332]">
						{label}
					</h4>
					<p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#8aa39e]">
						{status}
					</p>
				</div>
			</div>
			<div className="h-1 w-full overflow-hidden rounded-full bg-[#e7f1ef]">
				<div className="h-full w-full bg-[#2c756e] opacity-45" />
			</div>
			<p className="text-[10px] font-bold uppercase tracking-tight text-[#698782]">
				{desc}
			</p>
		</div>
	);
}

function ActionItem({ user, action, time }: ActionItemProps) {
	return (
		<div className="flex items-center justify-between text-[10px] transition-opacity hover:opacity-80">
			<div className="flex items-center gap-3">
				<div className="h-1.5 w-1.5 rounded-full bg-[#c6d9d4]" />
				<p className="leading-tight font-bold uppercase tracking-widest text-[#698782]">
					<span className="text-[#163332]">{user}</span> {action}
				</p>
			</div>
			<span className="ml-3 shrink-0 font-mono text-[9px] text-[#9bb3ae]">
				{time}
			</span>
		</div>
	);
}
