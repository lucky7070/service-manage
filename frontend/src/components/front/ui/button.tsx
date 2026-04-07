import * as React from 'react'
import { cn } from '@/helpers/utils'

const buttonBaseClass = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg'

function getVariantClass(variant: ButtonVariant = 'default'): string {
    switch (variant) {
        case 'destructive':
            return 'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60'
        case 'outline':
            return 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50'
        case 'secondary':
            return 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        case 'ghost':
            return 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50'
        case 'link':
            return 'text-primary underline-offset-4 hover:underline'
        case 'default':
        default:
            return 'bg-primary hover:bg-primary/90'
    }
}

function getSizeClass(size: ButtonSize = 'default'): string {
    switch (size) {
        case 'sm':
            return 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5'
        case 'lg':
            return 'h-10 rounded-md px-6 has-[>svg]:px-4'
        case 'icon':
            return 'size-9'
        case 'icon-sm':
            return 'size-8'
        case 'icon-lg':
            return 'size-10'
        case 'default':
        default:
            return 'h-9 px-4 py-2 has-[>svg]:px-3'
    }
}

type ButtonProps = React.ComponentProps<'button'> & {
    variant?: ButtonVariant
    size?: ButtonSize
    asChild?: boolean
}

function Button({ className, variant = 'default', size = 'default', ...props }: ButtonProps) {
    return <button data-slot="button" className={cn(buttonBaseClass, getVariantClass(variant), getSizeClass(size), className)} {...props} />
}

export { Button }
