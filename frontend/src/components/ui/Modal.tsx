"use client";

import * as React from "react";
import { cn } from "@/helpers/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl" | "xxxxl" | "full";

const sizeToClass: Record<ModalSize, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    xxl: "max-w-2xl",
    xxxl: "max-w-3xl",
    xxxxl: "max-w-4xl",
    full: "w-full max-w-7xl"
};

export type ModalProps = {
    show: boolean;
    onClose?: () => void;
    title?: string;
    subTitle?: string;
    children?: React.ReactNode;
    size?: ModalSize;
    centered?: boolean;
    fullscreen?: boolean;
    scrollable?: boolean;
    showHeader?: boolean;
    showFooter?: boolean;
    footer?: React.ReactNode;
    modalClass?: string;
    modalHeaderClass?: string;
    modalBodyClass?: string;
    disableBackdropClose?: boolean;
};

export default function Modal({
    show,
    onClose = () => { },
    title = "",
    subTitle = "",
    children,
    size = "md",
    centered = true,
    fullscreen = false,
    scrollable = false,
    showHeader = true,
    showFooter = false,
    footer,
    modalClass = "",
    modalHeaderClass = "",
    modalBodyClass = "",
    disableBackdropClose = false
}: ModalProps) {
    const dialogRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (!show) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [show]);

    if (!show) return null;

    return (
        <div
            className={cn("fixed inset-0 z-999 flex w-full p-4 backdrop-blur-[2px] bg-black/60", centered ? "items-center justify-center" : "items-start justify-center")}
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => {
                if (disableBackdropClose) return;
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                ref={dialogRef}
                className={cn(
                    "w-full rounded-xl border border-indigo-100 bg-white text-slate-900 shadow-xl dark:border-indigo-100 dark:bg-slate-900 dark:text-slate-100",
                    fullscreen && "h-[calc(100vh-2rem)] max-w-none overflow-hidden",
                    scrollable && !fullscreen && "max-h-[90vh] overflow-y-auto",
                    !fullscreen && sizeToClass[size],
                    modalClass
                )}
                onMouseDown={(e) => e.stopPropagation()}
            >
                {showHeader ? <div className={cn("flex flex-col space-y-1.5 p-6", modalHeaderClass)}>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
                            {subTitle ? <p className="text-sm text-muted-foreground">{subTitle}</p> : null}
                        </div>
                        <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
                            <X className="size-6" />
                        </Button>
                    </div>
                </div> : null}

                <div className={cn("p-6 pt-0", modalBodyClass)}>{children}</div>
                {showFooter ? <div className="flex items-center justify-end gap-2 border-t border-indigo-100 p-4 dark:border-slate-700">
                    {footer}
                </div> : null}
            </div>
        </div>
    );
}

