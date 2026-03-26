import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Headers that must not be forwarded to/from the backend (hop-by-hop headers)
const HOP_BY_HOP_REQUEST = new Set([
    "host",
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "upgrade",
]);

// Headers that must not be forwarded in the response back to the browser.
// content-encoding is critical: Node.js fetch auto-decompresses gzip, but if
// we forward the header the browser tries to decompress again and fails.
const HOP_BY_HOP_RESPONSE = new Set([
    "content-encoding",
    "transfer-encoding",
    "content-length", // may be wrong after decompression
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "upgrade",
]);

async function handler(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const pathname = path.join("/");
    const search = request.nextUrl.search;

    const backendURL = `${BACKEND_URL}/${pathname}${search}`;

    // Build forwarded request headers, stripping hop-by-hop headers
    const forwardHeaders = new Headers();
    request.headers.forEach((value, key) => {
        if (!HOP_BY_HOP_REQUEST.has(key.toLowerCase())) {
            forwardHeaders.set(key, value);
        }
    });
    forwardHeaders.set("x-forwarded-host", request.nextUrl.host);
    forwardHeaders.set("x-forwarded-for", request.headers.get("x-forwarded-for") || "");

    let body: BodyInit | null = null;
    const method = request.method;
    if (method !== "GET" && method !== "HEAD") {
        body = await request.arrayBuffer();
    }

    try {
        const backendResponse = await fetch(backendURL, {
            method,
            headers: forwardHeaders,
            body,
            redirect: "manual",
        });

        // Build response headers, stripping hop-by-hop headers
        const responseHeaders = new Headers();
        backendResponse.headers.forEach((value, key) => {
            if (!HOP_BY_HOP_RESPONSE.has(key.toLowerCase())) {
                responseHeaders.set(key, value);
            }
        });

        // Relay Set-Cookie headers — critical for HttpOnly auth cookies
        // Use getSetCookie() with a fallback for older Node.js runtimes
        const rawCookieHeader = backendResponse.headers.get("set-cookie");
        const setCookies: string[] =
            typeof backendResponse.headers.getSetCookie === "function"
                ? backendResponse.headers.getSetCookie()
                : rawCookieHeader
                ? rawCookieHeader.split(/,(?=[^ ])/)
                : [];

        responseHeaders.delete("set-cookie");
        for (const cookie of setCookies) {
            responseHeaders.append("set-cookie", cookie);
        }

        // Body is already decompressed by Node.js fetch (since we stripped content-encoding)
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
