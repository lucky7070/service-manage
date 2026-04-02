import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_PAGES } from "./config";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (!pathname.startsWith("/admin")) return NextResponse.next();

    const token = request.cookies.get("admin_token")?.value;

    if (AUTH_PAGES.includes(pathname) && token) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/dashboard";
        return NextResponse.redirect(url);
    }

    if (AUTH_PAGES.includes(pathname)) return NextResponse.next();

    if (!token) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"]
};

