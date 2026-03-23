"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, User, Mail, Lock, UserPlus, Calendar, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Field,
    FieldLabel,
    FieldError,
} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/route.constants";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import AuthLayout from "@/components/auth/auth-layout";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    age: z.coerce.number().min(1, "Age is required").max(120, "Invalid age"),
    gender: z.enum(["male", "female", "other"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { setAuth } = useAuthStore();

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema) as any,
        defaultValues: {
            name: "",
            email: "",
            password: "",
            age: 0,
            gender: "male",
        },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        try {
            const response = await authService.register(data as any);

            if (response.success) {
                toast.success("Verification email sent! Please check your inbox.");
                router.push(ROUTES.VERIFY_EMAIL);
            } else {
                toast.error(response.error || "Failed to create account");
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthLayout
            title="Join Us"
            subtitle="Create your account"
        >
            <div className="space-y-8 font-sans">
                <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
                    <Controller
                        control={form.control}
                        name="name"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <div className="relative group">
                                    <Input
                                        {...field}
                                        id={field.name}
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Full Name"
                                        className="auth-input"
                                    />
                                </div>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

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
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Controller
                            control={form.control}
                            name="age"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <div className="relative group">
                                        <Input
                                            {...field}
                                            id={field.name}
                                            type="number"
                                            value={field.value || ""}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Age"
                                            className="auth-input"
                                            onChange={(e) => field.onChange(e.target.value)}
                                        />
                                    </div>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="gender"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <Select
                                        name={field.name}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <div className="relative group">
                                            <SelectTrigger
                                                id="gender-select"
                                                aria-invalid={fieldState.invalid}
                                                className="auth-input pr-10"
                                            >
                                                <SelectValue placeholder="Gender" />
                                            </SelectTrigger>
                                        </div>
                                        <SelectContent
                                            alignItemWithTrigger={false}
                                            sideOffset={8}
                                            className="glass border-white/10 rounded-[2rem] shadow-2xl text-white p-2 min-w-[200px]"
                                        >
                                            <SelectItem value="male" className="rounded-2xl h-12 mb-1 focus:bg-white/10 hover:bg-white/10 cursor-pointer transition-colors pl-4 pr-10">Male</SelectItem>
                                            <SelectItem value="female" className="rounded-2xl h-12 mb-1 focus:bg-white/10 hover:bg-white/10 cursor-pointer transition-colors pl-4 pr-10">Female</SelectItem>
                                            <SelectItem value="other" className="rounded-2xl h-12 focus:bg-white/10 hover:bg-white/10 cursor-pointer transition-colors pl-4 pr-10">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </div>

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
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full h-14 rounded-full bg-[#0a2a2a] text-white font-bold text-lg hover:bg-[#0d3d3d] transition-all active:scale-[0.98] shadow-2xl border border-white/5 mt-4"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                <span>Creating...</span>
                            </>
                        ) : (
                            <span>Register</span>
                        )}
                    </Button>
                </form>

                <p className="text-center text-white/40 text-sm font-medium">
                    Already a member?{" "}
                    <Link
                        href={ROUTES.LOGIN}
                        className="text-white/80 font-bold hover:text-white transition-colors"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}