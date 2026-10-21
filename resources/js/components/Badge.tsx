import React from 'react';
import { cn } from './utils';

type BadgeVariant = 'blue' | 'green' | 'amber' | 'red' | 'gray';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
    variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
    blue: 'border-transparent bg-primary text-white',
    green: 'border-transparent bg-success text-white',
    amber: 'border-transparent bg-warning text-white',
    red: 'border-transparent bg-error text-white',
    gray: 'border-transparent bg-lightgray text-dark dark:bg-link dark:text-white',
};

export function Badge({ className, variant = 'gray', ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex min-w-16 items-center justify-center rounded-sm border px-2.5 py-1 text-xs font-medium leading-4 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                variants[variant],
                className,
            )}
            {...props}
        />
    );
}
