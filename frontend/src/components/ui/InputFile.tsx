import * as React from "react";
import { cn } from "@/helpers/utils";

const fileInputClassName = "block w-full min-w-0 cursor-pointer text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-700 dark:text-slate-300 dark:file:bg-indigo-500/15 dark:file:text-indigo-200";

const InputFile = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
    <input ref={ref} type="file" className={cn(fileInputClassName, className)} {...props} />
));

InputFile.displayName = "InputFile";

export default InputFile;
