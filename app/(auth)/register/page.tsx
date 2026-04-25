"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Field,
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
import AuthLayout from "@/components/auth/auth-layout";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    age: z.coerce.number().min(1, "Age is required").max(120, "Invalid age"),
    gender: z.enum(["male", "female", "other"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;
type RegisterFormInput = z.input<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<RegisterFormInput, unknown, RegisterFormValues>({
        resolver: zodResolver(registerSchema),
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
            const response = await authService.register(data);

            if (response.success) {
                toast.success("Verification email sent! Please check your inbox.");
                router.push(ROUTES.VERIFY_EMAIL);
            } else {
                toast.error(response.error || "Failed to create account");
            }
        } catch {
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                            value={typeof field.value === "string" || typeof field.value === "number" ? field.value : ""}
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
                                            className="min-w-[200px] rounded-[2rem] border border-[#d7ebe6] bg-white p-2 text-[#163332] shadow-[0_18px_40px_rgba(19,51,50,0.08)]"
                                        >
                                            <SelectItem value="male" className="mb-1 h-12 cursor-pointer rounded-2xl pl-4 pr-10 transition-colors hover:bg-[#eef8f5] focus:bg-[#eef8f5]">Male</SelectItem>
                                            <SelectItem value="female" className="mb-1 h-12 cursor-pointer rounded-2xl pl-4 pr-10 transition-colors hover:bg-[#eef8f5] focus:bg-[#eef8f5]">Female</SelectItem>
                                            <SelectItem value="other" className="h-12 cursor-pointer rounded-2xl pl-4 pr-10 transition-colors hover:bg-[#eef8f5] focus:bg-[#eef8f5]">Other</SelectItem>
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
                        className="mt-4 h-14 w-full rounded-full border border-[#8ec9be] bg-[#1d5a56] text-lg font-bold text-white shadow-lg shadow-[#1d5a56]/15 transition-all hover:bg-[#236762] active:scale-[0.98]"
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

                <p className="text-center text-sm font-medium text-[#688782]">
                    Already a member?{" "}
                    <Link
                        href={ROUTES.LOGIN}
                        className="font-bold text-[#1d5a56] transition-colors hover:text-[#163332]"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
