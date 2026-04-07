'use client'

import * as React from 'react'
import { cn } from '@/helpers/utils'

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    placeholder?: string
}

export function Select({ className, placeholder, children, ...props }: SelectProps) {
    return (
        <select
            data-slot="select"
            className={cn('border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex h-12 w-full min-w-0 items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50', className)}
            {...props}
        >
            {placeholder ? <option value="" disabled>{placeholder}</option> : null}
            {children}
        </select>
    )
}

