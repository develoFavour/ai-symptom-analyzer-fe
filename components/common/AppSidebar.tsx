"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	LayoutDashboard,
	Stethoscope,
	MessageSquare,
	Users,
	LogOut,
	ChevronRight,
	BookOpen,
	X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/route.constants";
import { useAuthStore } from "@/store/auth.store";
import Image from "next/image";

const NAV_ITEMS_PATIENT = [
	{ label: "Home", href: ROUTES.PATIENT.DASHBOARD, icon: LayoutDashboard },
	{
		label: "Check Health",
		href: ROUTES.PATIENT.SYMPTOM_CHECKER,
		icon: Stethoscope,
	},
	{
		label: "Help from Doctor",
		href: ROUTES.PATIENT.CONSULTATION,
		icon: MessageSquare,
	},
];

const NAV_ITEMS_DOCTOR = [
	{ label: "Dashboard", href: ROUTES.DOCTOR.DASHBOARD, icon: LayoutDashboard },
	{ label: "Queue", href: ROUTES.DOCTOR.CONSULTATIONS, icon: MessageSquare },
	{
		label: "Clinical Library",
		href: ROUTES.DOCTOR.KNOWLEDGE_BASE,
		icon: BookOpen,
	},
];

const NAV_ITEMS_ADMIN = [
	{ label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard },
	{ label: "User Management", href: ROUTES.ADMIN.USERS, icon: Users },
	{
		label: "Knowledge Base",
		href: ROUTES.ADMIN.KNOWLEDGE_BASE,
		icon: BookOpen,
	},
];

export default function AppSidebar({
	isOpen,
	onClose,
}: {
	isOpen?: boolean;
	onClose?: () => void;
}) {
	const pathname = usePathname();
	const { clearAuth, user } = useAuthStore();

	const items =
		user?.role === "doctor"
			? NAV_ITEMS_DOCTOR
			: user?.role === "admin"
				? NAV_ITEMS_ADMIN
				: NAV_ITEMS_PATIENT;

	return (
		<>
			{isOpen && (
				<div
					className="fixed inset-0 z-[60] bg-[#143231]/20 backdrop-blur-sm animate-fade-in lg:hidden"
					onClick={onClose}
				/>
			)}

			<aside
				className={cn(
					"fixed left-0 top-0 z-[70] flex h-screen w-72 flex-col border-r border-[#dcece8] bg-white px-4 pt-8 pb-6 transition-transform duration-300 ease-in-out lg:translate-x-0",
					isOpen ? "translate-x-0" : "-translate-x-full",
				)}
			>
				<button
					onClick={onClose}
					className="absolute top-6 right-6 p-2 text-[#8aa39e] hover:text-[#163332] lg:hidden"
				>
					<X className="h-6 w-6" />
				</button>

				<div className="mb-10 flex items-center gap-3 px-4">
					<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f6f3]">
						<Image
							src={"/hallmark-logo.svg"}
							alt="hallmark-logo"
							height={100}
							width={100}
							className="rounded-full"
						/>
					</div>
					<span className="text-xl font-bold tracking-tight text-[#163332]">
						Vitalis AI
					</span>
				</div>

				<nav className="flex-1 space-y-2">
					{items.map((item) => {
						const isActive =
							pathname === item.href ||
							((item.href as string) !== "/" &&
								pathname.startsWith(item.href as string));
						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200",
									isActive
										? "bg-[#e8f6f3] text-[#163332] shadow-sm"
										: "text-[#7d9a95] hover:bg-[#f4fbf9] hover:text-[#163332]",
								)}
							>
								<item.icon
									className={cn(
										"h-5 w-5 transition-colors",
										isActive
											? "text-[#1d5a56]"
											: "text-[#7d9a95] group-hover:text-[#163332]",
									)}
								/>
								<span className="text-[15px] font-semibold">{item.label}</span>

								{isActive && <ChevronRight className="ml-auto h-4 w-4" />}
							</Link>
						);
					})}
				</nav>

				<div className="mt-auto border-t border-[#eef4f2] px-2 pt-4">
					<button
						onClick={() => clearAuth()}
						className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-red-400/70 transition-all hover:bg-red-50 hover:text-red-500"
					>
						<LogOut className="h-5 w-5" />
						<span className="text-[15px] font-semibold">Sign Out</span>
					</button>
				</div>
			</aside>
		</>
	);
}
