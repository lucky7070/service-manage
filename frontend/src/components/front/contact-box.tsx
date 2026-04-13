"use client"

import { RootState } from "@/store";
import { useAppSelector } from "@/store/hooks";

const ContactBox = ({ title, content }: { title: string, content: string }) => {

    const settings = useAppSelector((state: RootState) => state.settings);
    return <section>
        <h2 className="mb-4 text-xl font-semibold text-foreground">{title}</h2>
        <p className="text-muted-foreground">{content}</p>
        <div className="mt-4 rounded-lg border bg-card p-4">
            <p className="font-semibold text-primary mb-2 text-lg">{settings.application_name || ""}</p>
            <p className="text-sm text-muted-foreground"><span className="font-semibold text-primary">Email : </span> {settings.email || ""}</p>
            <p className="text-sm text-muted-foreground"><span className="font-semibold text-primary">Phone : </span> {settings.phone || ""}</p>
            <p className="text-sm text-muted-foreground"><span className="font-semibold text-primary">Address : </span> {settings.address || ""}</p>
        </div>
    </section>
}

export default ContactBox