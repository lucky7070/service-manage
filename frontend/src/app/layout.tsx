import type { Metadata } from "next";
import Providers from "@/app/providers";
import { getServerSettings } from "@/lib/settings.server";

export const metadata: Metadata = {
    title: "Service Manage",
    description: "Book trusted plumbers, electricians, salon and cleaning services."
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
