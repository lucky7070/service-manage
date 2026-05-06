"use client";

import { useMemo } from "react";
import moment from "moment";
import { CheckCheck } from "lucide-react";

export type BookingChatMessage = {
    _id: string;
    senderType: "customer" | "provider";
    message: string;
    createdAt?: string;
};

type BookingChatThreadProps = {
    messages: BookingChatMessage[];
    customerMessagesOnLeft: boolean;
    variant: "admin" | "customer";
    emptyLabel?: string;
    className?: string;
};

function sortByCreatedAt(messages: BookingChatMessage[]) {
    return [...messages].sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (ta !== tb) return ta - tb;
        return String(a._id).localeCompare(String(b._id));
    });
}

export function BookingChatThread({
    messages,
    customerMessagesOnLeft,
    variant,
    emptyLabel = "No messages.",
    className = "",
}: BookingChatThreadProps) {
    const groups = useMemo(() => {
        const sorted = sortByCreatedAt(messages);
        const bucket: { dateKey: string; label: string; items: BookingChatMessage[] }[] = [];
        for (const m of sorted) {
            const t = m.createdAt && moment(m.createdAt).isValid() ? moment(m.createdAt) : null;
            const dateKey = t ? t.format("YYYY-MM-DD") : "unknown";
            const label = t ? t.format("MMMM D, YYYY") : "Date unknown";
            let g = bucket.find((row) => row.dateKey === dateKey);
            if (!g) {
                g = { dateKey, label, items: [] };
                bucket.push(g);
            }
            g.items.push(m);
        }
        return bucket;
    }, [messages]);

    const outgoing = (m: BookingChatMessage) => customerMessagesOnLeft ? m.senderType === "provider" : m.senderType === "customer";

    const sepClass = variant === "admin" ? "bg-slate-200 dark:bg-slate-700" : "bg-border";
    const dateLabelClass = variant === "admin" ? "text-slate-500 dark:text-slate-400" : "text-muted-foreground";
    const metaTimeClass = variant === "admin" ? "text-slate-500 dark:text-slate-400" : "text-muted-foreground";
    const checkClass = variant === "admin" ? "text-indigo-600 dark:text-indigo-400" : "text-primary";
    const bubbleIncoming = variant === "admin" ? "rounded-es-md bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100" : "rounded-es-md bg-muted text-foreground";
    const bubbleOutgoing = variant === "admin" ? "rounded-ee-md bg-indigo-600 text-white dark:bg-indigo-500" : "rounded-ee-md bg-primary text-primary-foreground";

    if (!messages.length) {
        return <p className={`py-10 text-center text-sm ${variant === "admin" ? "text-slate-500 dark:text-slate-400" : "text-muted-foreground"} ${className}`}>
            {emptyLabel}
        </p>
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {groups.map((group) => (
                <div key={group.dateKey}>
                    <div className="mb-4 flex items-center gap-3">
                        <div className={`h-px flex-1 ${sepClass}`} role="presentation" />
                        <span className={`shrink-0 text-[10px] font-medium tracking-wider uppercase ${dateLabelClass}`}>
                            {group.label}
                        </span>
                        <div className={`h-px flex-1 ${sepClass}`} role="presentation" />
                    </div>
                    <div className="space-y-3">
                        {group.items.map((msg) => {
                            const isOutbound = outgoing(msg);
                            const time = msg.createdAt && moment(msg.createdAt).isValid() ? moment(msg.createdAt).format("h:mm A") : "";
                            return (
                                <div key={msg._id} className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
                                    <div className={`flex max-w-[75%] flex-col ${isOutbound ? "items-end" : "items-start"}`}>
                                        <div className={`rounded-2xl px-3.5 py-2 ${isOutbound ? bubbleOutgoing : bubbleIncoming}`}>
                                            <p className="wrap-break-word whitespace-pre-wrap text-sm">
                                                {msg.message}
                                            </p>
                                        </div>
                                        <div className={`mt-1 flex items-center gap-1 px-1 ${isOutbound ? "justify-end" : "justify-start"}`}>
                                            <span className={`text-[10px] ${metaTimeClass}`}>
                                                {time}
                                            </span>
                                            {isOutbound ? <CheckCheck className={`h-3 w-3 shrink-0 ${checkClass}`} aria-hidden /> : null}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
