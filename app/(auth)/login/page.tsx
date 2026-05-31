"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import {
	ArrowRight,
	GraduationCap,
	Loader2,
	ShieldCheck,
	Stethoscope,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/route.constants";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import AuthLayout from "@/components/auth/auth-layout";

const loginSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const loginRoles = [
	{
		value: "patient",
		label: "Patient",
		description:
			"Access the symptom checker for preliminary health assessment.",
		icon: GraduationCap,
	},
	{
		value: "doctor",
		label: "Doctor",
		description:
			"Review consultations, patient summaries, and AI-assisted reports.",
		icon: Stethoscope,
	},
	{
		value: "admin",
		label: "Admin",
		description: "Manage users, doctors, and the system knowledge base.",
		icon: ShieldCheck,
	},
] as const;

function LoginContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const { setAuth } = useAuthStore();
	const redirect = searchParams.get("redirect") || ROUTES.PATIENT.DASHBOARD;
	const requestedRole = searchParams.get("role");
	const selectedRole = loginRoles.find(
		(role) =>
			role.value === requestedRole ||
			(requestedRole === "student" && role.value === "patient"),
	);

	function getRoleHref(role: string) {
		const params = new URLSearchParams(searchParams.toString());
		params.set("role", role);
		return `${ROUTES.LOGIN}?${params.toString()}`;
	}

	function getRoleSelectionHref() {
		const params = new URLSearchParams(searchParams.toString());
		params.delete("role");
		const query = params.toString();
		return query ? `${ROUTES.LOGIN}?${query}` : ROUTES.LOGIN;
	}

	// Show toast if user was redirected due to session expiry
	useEffect(() => {
		if (searchParams.get("session_expired") === "true") {
			toast.warning("Your session has expired. Please log in again.", {
				duration: 5000,
				description:
					"For your security, sessions expire after 7 days of inactivity.",
			});
		}
	}, [searchParams]);

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(data: LoginFormValues) {
		if (!selectedRole) return;

		setIsLoading(true);
		try {
			const response = await authService.login({
				...data,
				role: selectedRole.value,
			});

			if (response.success && response.data) {
				const { user, role } = response.data;
				const authUser = { ...user, role };
				setAuth(authUser);
				toast.success(`Welcome back, ${user.name}!`);

				if (role === "admin") router.push(ROUTES.ADMIN.DASHBOARD);
				else if (role === "doctor") router.push(ROUTES.DOCTOR.DASHBOARD);
				else router.push(redirect);
			} else {
				toast.error(response.error || "Invalid credentials");
			}
		} catch {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}

	if (!selectedRole) {
		return (
			<AuthLayout
				title="Choose Login Type"
				subtitle="Select the account category you want to continue with."
			>
				<div className="space-y-4">
					{loginRoles.map((role) => {
						const Icon = role.icon;

						return (
							<Link
								key={role.value}
								href={getRoleHref(role.value)}
								className="group flex items-center gap-4 rounded-3xl border border-[#d8ebe7] bg-[#f8fcfb] p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#9ecfc6] hover:bg-white hover:shadow-[0_16px_40px_rgba(19,51,50,0.08)]"
							>
								<span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#d4e9e5] bg-[#eaf6f3] text-[#1d5a56] transition-all group-hover:bg-[#1d5a56] group-hover:text-white">
									<Icon className="h-7 w-7" />
								</span>
								<span className="min-w-0 flex-1">
									<span className="block text-lg font-bold text-[#163332]">
										Login as {role.label}
									</span>
									<span className="mt-1 block text-sm leading-relaxed text-[#688782]">
										{role.description}
									</span>
								</span>
								<ArrowRight className="h-5 w-5 shrink-0 text-[#6d918b] transition-all group-hover:translate-x-1 group-hover:text-[#1d5a56]" />
							</Link>
						);
					})}
				</div>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout
			title="Welcome!"
			subtitle={`Login as ${selectedRole.label.toLowerCase()}`}
		>
			<div className="space-y-8">
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<div className="space-y-4">
						<Controller
							control={form.control}
							name="email"
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<div className="relative group">
										<Input
											{...field}
											id={field.name}
											aria-invalid={fieldState.invalid}
											placeholder="Email"
											className="auth-input"
										/>
									</div>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						<Controller
							control={form.control}
							name="password"
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<div className="relative group">
										<Input
											{...field}
											id={field.name}
											type="password"
											aria-invalid={fieldState.invalid}
											placeholder="Password"
											className="auth-input"
										/>
									</div>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
					</div>

					<Button
						type="submit"
						className="h-14 w-full rounded-full border border-[#8ec9be] bg-[#1d5a56] text-lg font-bold text-white shadow-lg shadow-[#1d5a56]/15 transition-all hover:bg-[#236762] active:scale-[0.98]"
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<Loader2 className="h-6 w-6 animate-spin mr-2" />
								<span>Securing Access...</span>
							</>
						) : (
							<span>Login</span>
						)}
					</Button>
				</form>

				<p className="text-center text-sm font-medium text-[#688782]">
					Don&apos;t have an account?{" "}
					<Link
						href={ROUTES.REGISTER}
						className="font-bold text-[#1d5a56] transition-colors hover:text-[#163332]"
					>
						Register
					</Link>
				</p>

				<p className="text-center text-sm font-medium text-[#688782]">
					Not logging in as {selectedRole.label.toLowerCase()}?{" "}
					<Link
						href={getRoleSelectionHref()}
						className="font-bold text-[#1d5a56] transition-colors hover:text-[#163332]"
					>
						Change login type
					</Link>
				</p>
			</div>
		</AuthLayout>
	);
}

export default function LoginPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center bg-[#f7fbfa]">
					<Loader2 className="h-8 w-8 animate-spin text-[#2c756e]" />
				</div>
			}
		>
			<LoginContent />
		</Suspense>
	);
}
