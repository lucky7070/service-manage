import * as React from "react";
import { cn, resolveFileUrl } from "@/helpers/utils";
import { Button } from "@/components/ui/Button";
import { DownloadCloud } from "lucide-react";

const fileInputClassName = "block w-full min-w-0 cursor-pointer text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-700 dark:text-slate-300 dark:file:bg-indigo-500/15 dark:file:text-indigo-200";

const InputFile = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { value?: string | null }>(({ className, value, ...props }, ref) => {
    if (value && typeof value === 'string') {
        return <div className="flex border border-indigo-100 rounded-md">
            <input ref={ref} type="file" className={cn(fileInputClassName, className)} {...props} />
            <a href={resolveFileUrl(value) || "#"} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="secondary" title="Download" aria-label="Download" className="rounded-l-none">
                    <DownloadCloud className="h-4 w-4 shrink-0" strokeWidth={2} />
                </Button>
            </a>
        </div>
    } else {
        return <input ref={ref} type="file" className={cn(fileInputClassName, "border border-indigo-100 rounded-md", className)} {...props} />
    }
});

InputFile.displayName = "InputFile";

export default InputFile;
