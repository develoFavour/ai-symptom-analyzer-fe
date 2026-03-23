import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Silent Token Refresh API Route
 *
 * Called by middleware when access_token is expired but refresh_token still exists.
 * It proxies the /auth/refresh call to the Go backend so the backend can set
 * new HttpOnly cookies on the response. Then it redirects back to the original page.
 */
export async function GET(request: NextRequest) {
    const redirect = request.nextUrl.searchParams.get("redirect") || "/dashboard";
    const refreshToken = request.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
        // No refresh token either — send to login
        return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(redirect)}`, request.url));
    }

    try {
        // Call the backend refresh endpoint, forwarding the refresh_token cookie
        const backendRes = await fetch(`${API_URL}/api/v1/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Forward the refresh_token as a cookie to the backend
                Cookie: `refresh_token=${refreshToken}`,
            },
            credentials: "include",
        });

        if (!backendRes.ok) {
            // Refresh token is also expired or invalid — send to login
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", redirect);
            loginUrl.searchParams.set("session_expired", "true");
            const res = NextResponse.redirect(loginUrl);
            // Clear stale cookies
            res.cookies.delete("access_token");
            res.cookies.delete("refresh_token");
            res.cookies.delete("user_role");
            return res;
        }

        // Parse the Set-Cookie headers from the backend and forward them to the browser
        const setCookieHeader = backendRes.headers.get("set-cookie");

        // Redirect to the intended page
        const finalRedirect = new URL(redirect.startsWith("/") ? redirect : `/${redirect}`, request.url);
        const response = NextResponse.redirect(finalRedirect);

        if (setCookieHeader) {
            // Split multiple cookies and set each one
            // The Go backend sends: access_token, refresh_token, user_role
            const cookies = splitCookieHeader(setCookieHeader);
            for (const cookie of cookies) {
                response.headers.append("Set-Cookie", cookie);
            }
        }

        return response;
    } catch (err) {
        console.error("[silent-refresh] Network error calling backend:", err);
        const loginUrl = new URL(`/login?redirect=${encodeURIComponent(redirect)}`, request.url);
        return NextResponse.redirect(loginUrl);
    }
}

/**
 * Naively splits a combined Set-Cookie header string into individual cookie strings.
 * This is needed because fetch() combines multiple Set-Cookie into one header.
 */
function splitCookieHeader(header: string): string[] {
    const cookies: string[] = [];
    // Split on ", " but only when followed by a cookie name= pattern
    // This avoids splitting on ", " inside "expires=Thu, 01 Jan..."
    const parts = header.split(/,\s*(?=[a-zA-Z_]+=)/);
    for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed) cookies.push(trimmed);
    }
    return cookies;
}
