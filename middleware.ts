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

    // Allow public paths & Next.js internal API routes
    const isPublic =
        PUBLIC_PATHS.some(path => pathname === path || (path !== "/" && pathname.startsWith(path))) ||
        pathname.startsWith("/doctor/setup") || // invite link setup page
        pathname.startsWith("/api/auth/silent-refresh"); // our own refresh route must not be protected

    if (isPublic) return NextResponse.next();

    const accessToken = request.cookies.get("access_token")?.value;
    const refreshToken = request.cookies.get("refresh_token")?.value;
    const role = request.cookies.get("user_role")?.value;

    // ── No access token ────────────────────────────────────────────────────────
    if (!accessToken) {
        // If we have a refresh token, try a silent refresh instead of booting to login
        if (refreshToken) {
            const refreshUrl = new URL("/api/auth/silent-refresh", request.url);
            refreshUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(refreshUrl);
        }

        // No tokens at all — send to login
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
        /*
         * Match all paths EXCEPT:
         * - /api/* (Next.js API routes, including our silent-refresh)
         * - /_next/static, /_next/image (Next.js internals)
         * - /favicon.ico, image files
         */
        "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
    ],
};
