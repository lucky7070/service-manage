import * as React from "react";
import { cn } from "@/helpers/utils";

export const textareaClassName = "w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
    ({ className, ...props }, ref) => <textarea ref={ref} className={cn(textareaClassName, className)} {...props} />
);

Textarea.displayName = "Textarea";

export default Textarea;
