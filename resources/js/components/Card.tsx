import React from 'react';
import { cn } from './utils';

type CardProps = React.HTMLAttributes<HTMLElement> & {
    title?: React.ReactNode;
};

export function Card({ children, className, title, ...props }: CardProps) {
    return (
        <section
            data-slot="card"
            className={cn('flex w-full min-w-0 flex-col gap-6 rounded-xl bg-card p-6 text-card-foreground shadow-xs', className)}
            {...props}
        >
            {title && <h2 className="card-title leading-none tracking-tight">{title}</h2>}
            {children}
        </section>
    );
}
