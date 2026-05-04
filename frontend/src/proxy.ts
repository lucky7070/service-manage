import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_PAGES, AUTH_PAGES_USER } from "@/config";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith("/admin")) {
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
    }

    if (pathname.startsWith("/user") || AUTH_PAGES_USER.includes(pathname)) {
        const token = request.cookies.get("customer_token")?.value;
        if (AUTH_PAGES_USER.includes(pathname) && token) {
            const url = request.nextUrl.clone();
            url.pathname = "/user/dashboard";
            return NextResponse.redirect(url);
        }

        if (AUTH_PAGES_USER.includes(pathname)) return NextResponse.next();

        if (!token) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/user/:path*", '/login']
};

