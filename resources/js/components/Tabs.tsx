import React from 'react';
import { cn } from './utils';

type TabItem<T extends string> = {
    id: T;
    label: string;
};

type TabsProps<T extends string> = {
    active: T;
    items: Array<TabItem<T>>;
    onChange: (id: T) => void;
    className?: string;
};

export function Tabs<T extends string>({ active, className, items, onChange }: TabsProps<T>) {
    return (
        <div className={cn('inline-flex flex-wrap items-center justify-center gap-3 rounded-md bg-background p-1 text-foreground dark:bg-white/5', className)}>
            {items.map((item) => (
                <button
                    key={item.id}
                    className={cn(
                        'inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all hover:bg-lightprimary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                        active === item.id && 'bg-primary text-white shadow-sm hover:bg-primary hover:text-white',
                    )}
                    type="button"
                    onClick={() => onChange(item.id)}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}
