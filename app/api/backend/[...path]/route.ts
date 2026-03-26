import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

/**
 * Universal Backend Proxy
 *
 * Routes all /api/backend/* requests to the Go backend on Render.
 * Because this runs on Vercel's server (same domain as the frontend),
 * cookies set by the backend are forwarded to the browser on the Vercel
 * domain — which means Next.js middleware CAN read them.
 *
 * This is the standard senior-engineer solution to the Vercel/Render
 * cross-domain cookie problem.
 */
async function handler(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const pathname = path.join("/");
    const search = request.nextUrl.search;

    const backendURL = `${BACKEND_URL}/${pathname}${search}`;

    // Forward all original headers, including the cookie header
    const headers = new Headers(request.headers);
    headers.set("x-forwarded-for", request.headers.get("x-forwarded-for") || "");
    headers.set("x-forwarded-host", request.nextUrl.host);
    // Remove the host header so it matches the backend's expected host
    headers.delete("host");

    let body: BodyInit | null = null;
    const method = request.method;
    if (method !== "GET" && method !== "HEAD") {
        body = await request.arrayBuffer();
    }

    try {
        const backendResponse = await fetch(backendURL, {
            method,
            headers,
            body,
            // Important: do not follow redirects automatically
            redirect: "manual",
        });

        // Forward all response headers back to the browser
        const responseHeaders = new Headers(backendResponse.headers);

        // Relay Set-Cookie headers verbatim — this is the key to making
        // HttpOnly cookies work from the Vercel domain
        const setCookies = backendResponse.headers.getSetCookie?.() ?? [];
        if (setCookies.length > 0) {
            responseHeaders.delete("set-cookie");
            for (const cookie of setCookies) {
                responseHeaders.append("set-cookie", cookie);
            }
        }

        const responseBody = await backendResponse.arrayBuffer();

        return new NextResponse(responseBody, {
            status: backendResponse.status,
            statusText: backendResponse.statusText,
            headers: responseHeaders,
        });
    } catch (err) {
        console.error("[proxy] Error forwarding request to backend:", err);
        return NextResponse.json(
            { success: false, message: "Backend unreachable" },
            { status: 502 }
        );
    }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
