import React from 'react';
import { cn } from './utils';

type ButtonVariant = 'default' | 'primary' | 'soft' | 'danger' | 'ghost';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
    default: 'bg-primary text-white hover:bg-primaryemphasis',
    primary: 'bg-primary text-white hover:bg-primaryemphasis',
    soft: 'bg-lightprimary text-primary hover:bg-primary hover:text-white',
    danger: 'bg-lighterror text-error hover:bg-error hover:text-white',
    ghost: 'bg-transparent text-primary hover:bg-lightprimary hover:text-primary',
};

export function Button({ className, variant = 'default', type = 'button', ...props }: ButtonProps) {
    return (
        <button
            type={type}
            className={cn(
                'inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-sm px-5 py-2 text-sm font-medium ring-offset-background transition-colors hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
                variants[variant],
                className,
            )}
            {...props}
        />
    );
}
