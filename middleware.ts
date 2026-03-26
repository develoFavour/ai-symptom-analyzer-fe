import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Route prefixes by role
const PATIENT_PREFIXES = [
    "/dashboard",
    "/symptom-checker",
    "/history",
    "/consultation",
    "/notifications",
    "/profile",
];
const DOCTOR_PREFIXES = ["/doctor"];
const ADMIN_PREFIXES = ["/admin"];

const PUBLIC_PATHS = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/verify-email",
    "/verify",
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public paths & Next.js internal routes
    const isPublic =
        PUBLIC_PATHS.some(path => pathname === path || (path !== "/" && pathname.startsWith(path))) ||
        pathname.startsWith("/doctor/setup") ||
        pathname.startsWith("/api/");

    if (isPublic) return NextResponse.next();

    // ── Auth check ─────────────────────────────────────────────────────────────
    // These HttpOnly cookies are set by our server-side proxy (same Vercel domain),
    // so the middleware can read them correctly — unlike cookies from Render directly.
    const accessToken = request.cookies.get("access_token")?.value;
    const refreshToken = request.cookies.get("refresh_token")?.value;
    const role = request.cookies.get("user_role")?.value;

    if (!accessToken) {
        if (refreshToken) {
            const refreshUrl = new URL("/api/auth/silent-refresh", request.url);
            refreshUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(refreshUrl);
        }
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ── Role-based access control ──────────────────────────────────────────────
    const isAdminRoute = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
    const isDoctorRoute = DOCTOR_PREFIXES.some((p) => pathname.startsWith(p));

    if (isAdminRoute && role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (isDoctorRoute && role !== "doctor") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
    ],
};

