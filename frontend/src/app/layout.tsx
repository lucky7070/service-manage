import type { Metadata } from "next";
import Providers from "@/app/providers";
import { getServerSettings } from "@/lib/api.server";

export const metadata: Metadata = {
    title: "Service Management Platform",
    description: "Book trusted plumbers, electricians, salon and cleaning services.",
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        ],
        apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/site.webmanifest",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const initialSettings = await getServerSettings();
    return (
        <html lang="en">
            <body>
                <Providers initialSettings={initialSettings}>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
