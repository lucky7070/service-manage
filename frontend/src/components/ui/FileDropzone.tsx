"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { ImagePlus } from "lucide-react";
import { cn } from "@/helpers/utils";

export type FileDropzoneContext = {
    openFileDialog: () => void;
};

const FileDropzoneContextObj = createContext<FileDropzoneContext | null>(null);

/** Use inside a custom label component rendered as a child of {@link FileDropzone}. */
export function useFileDropzone(): FileDropzoneContext {
    const ctx = useContext(FileDropzoneContextObj);
    if (!ctx) {
        throw new Error("useFileDropzone must be used within FileDropzone.");
    }
    return ctx;
}

function FileDropzoneCustomLabel({ children }: { children: (ctx: FileDropzoneContext) => ReactNode }) {
    const ctx = useFileDropzone();
    return <>{children(ctx)}</>;
}

export type FileDropzoneProps = {
    onFilesSelected: (files: File[]) => void;
    disabled?: boolean;
    uploading?: boolean;
    accept?: string;
    multiple?: boolean;
    className?: string;
    icon?: ReactNode;
    /**
     * Custom label; receives `openFileDialog` for a “browse” control.
     * If omitted, a default drag-and-drop + browse prompt is shown.
     */
    children?: (ctx: FileDropzoneContext) => ReactNode;
};

export default function FileDropzone({
    onFilesSelected,
    disabled = false,
    uploading = false,
    accept = "*/*",
    multiple = true,
    className,
    icon,
    children
}: FileDropzoneProps) {
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const openFileDialog = useCallback(() => {
        if (!disabled && !uploading) {
            inputRef.current?.click();
        }
    }, [disabled, uploading]);

    const contextValue = useMemo<FileDropzoneContext>(() => ({ openFileDialog }), [openFileDialog]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (disabled) return;
        onFilesSelected(Array.from(e.dataTransfer.files || []));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        e.target.value = "";
        if (files.length) onFilesSelected(files);
    };

    return (
        <FileDropzoneContextObj.Provider value={contextValue}>
            <div
                className={cn(
                    "rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
                    dragOver ? "border-primary-500 bg-primary-50/50 dark:bg-primary-950/20" : "border-indigo-200 bg-white dark:border-slate-600 dark:bg-slate-900/40",
                    disabled && "pointer-events-none opacity-50",
                    className
                )}
                onDragEnter={(e) => {
                    e.preventDefault();
                    if (!disabled) setDragOver(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    if (!disabled) setDragOver(true);
                }}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    className="hidden"
                    onChange={handleChange}
                    disabled={disabled || uploading}
                />
                {icon ?? <ImagePlus className="mx-auto h-10 w-10 text-slate-400" aria-hidden />}
                <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {children ? (
                        <FileDropzoneCustomLabel>{children}</FileDropzoneCustomLabel>
                    ) : (
                        <p>
                            {!disabled ? (
                                <>
                                    Drag and drop files here, or{" "}
                                    <button
                                        type="button"
                                        className="font-medium text-primary-600 underline hover:text-primary-700 dark:text-primary-400"
                                        onClick={openFileDialog}
                                        disabled={uploading}
                                    >
                                        browse
                                    </button>
                                </>
                            ) : (
                                <span>File upload is disabled.</span>
                            )}
                        </p>
                    )}
                </div>
                {uploading ? <p className="mt-1 text-xs text-slate-500">Uploading…</p> : null}
            </div>
        </FileDropzoneContextObj.Provider>
    );
}
