"use client";

type ChatTypingIndicatorProps = {
    label: string;
    className?: string;
};

export function ChatTypingIndicator({ label, className = "" }: ChatTypingIndicatorProps) {
    return (
        <div
            className={`flex min-h-[1.35rem] items-center gap-2 text-xs text-muted-foreground ${className}`}
            role="status"
            aria-live="polite"
            aria-label={label}
        >
            <span className="shrink-0">{label}</span>
            <span className="inline-flex items-center gap-1 text-muted-foreground" aria-hidden>
                <span className="animate-chat-typing-dot h-1.5 w-1.5 rounded-full bg-current [animation-delay:0ms]" />
                <span className="animate-chat-typing-dot h-1.5 w-1.5 rounded-full bg-current [animation-delay:150ms]" />
                <span className="animate-chat-typing-dot h-1.5 w-1.5 rounded-full bg-current [animation-delay:300ms]" />
            </span>
        </div>
    );
}
