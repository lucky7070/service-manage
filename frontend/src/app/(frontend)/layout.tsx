import type { Metadata } from "next";
import "./front.css";

export const metadata: Metadata = {
    title: "Service Hub",
    description: "Book trusted plumbers, electricians, salon and cleaning services."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return children
}
