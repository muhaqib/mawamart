import React from 'react';
import { cn } from './utils';

type DataTableProps = React.HTMLAttributes<HTMLDivElement>;

export function DataTable({ children, className, ...props }: DataTableProps) {
    return (
        <div
            className={cn(
                'relative w-full overflow-x-auto rounded-md border border-ld',
                '[&_table]:w-full [&_table]:min-w-[680px] [&_table]:caption-bottom [&_table]:border-collapse [&_table]:text-sm',
                '[&_thead_tr]:border-b [&_tr]:border-b [&_tr]:border-ld [&_tr]:transition-colors [&_tbody_tr:last-child]:border-0 [&_tbody_tr]:hover:bg-primary/10',
                '[&_th]:h-12 [&_th]:whitespace-nowrap [&_th]:px-4 [&_th]:text-center [&_th]:align-middle [&_th]:text-sm [&_th]:font-semibold [&_th]:text-foreground',
                '[&_td]:whitespace-nowrap [&_td]:px-4 [&_td]:py-4 [&_td]:align-middle [&_td]:text-center [&_td]:font-medium [&_td]:text-card-foreground',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}
