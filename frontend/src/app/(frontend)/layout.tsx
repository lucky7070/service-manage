import type { Metadata } from "next";
import { Header } from "@/components/front/header";
import { Footer } from "@/components/front/footer";
import Provider from "./provider";
import "@/app/(frontend)/front.css";

export const metadata: Metadata = {
    title: "Service Hub",
    description: "Book trusted plumbers, electricians, salon and cleaning services."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <div className="bg-white">
        <Provider>
            <Header />
            <main className="min-h-screen">
                {children}
            </main>
            <Footer />
        </Provider>
    </div>
}
