import React from 'react';
import { cn } from './utils';

const controlStyles = [
    '[&_input]:flex [&_input]:h-10 [&_input]:w-full [&_input]:rounded-sm [&_input]:border [&_input]:border-ld [&_input]:bg-transparent [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:text-foreground [&_input]:outline-none [&_input]:transition disabled:[&_input]:cursor-not-allowed disabled:[&_input]:opacity-50',
    '[&_select]:flex [&_select]:h-10 [&_select]:w-full [&_select]:rounded-sm [&_select]:border [&_select]:border-ld [&_select]:bg-transparent [&_select]:px-3 [&_select]:py-2 [&_select]:pe-9 [&_select]:text-sm [&_select]:text-foreground [&_select]:outline-none [&_select]:transition',
    '[&_textarea]:min-h-16 [&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:rounded-md [&_textarea]:border [&_textarea]:border-ld [&_textarea]:bg-transparent [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-sm [&_textarea]:text-foreground [&_textarea]:outline-none [&_textarea]:transition',
    '[&_input:focus]:border-primary [&_input:focus]:ring-0',
    '[&_select:focus]:border-primary [&_select:focus]:ring-0',
    '[&_textarea:focus]:border-primary [&_textarea:focus]:ring-0',
].join(' ');

type FormGridProps = React.FormHTMLAttributes<HTMLFormElement>;

export function FormGrid({ className, ...props }: FormGridProps) {
    return (
        <form
            className={cn('grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4', controlStyles, className)}
            {...props}
        />
    );
}

type FormStackProps =
    | ({ as?: 'div' } & React.HTMLAttributes<HTMLDivElement>)
    | ({ as: 'form' } & React.FormHTMLAttributes<HTMLFormElement>);

export function FormStack(props: FormStackProps) {
    if (props.as === 'form') {
        const { as: _as, className, ...formProps } = props;

        return <form className={cn('grid gap-4', controlStyles, className)} {...formProps} />;
    }

    const { as: _as, className, ...divProps } = props;

    return <div className={cn('grid gap-4', controlStyles, className)} {...divProps} />;
}

type FieldProps = React.HTMLAttributes<HTMLDivElement> & {
    label: React.ReactNode;
};

export function Field({ children, className, label, ...props }: FieldProps) {
    return (
        <div className={cn('grid gap-2', className)} {...props}>
            <label className="flex items-center gap-2 text-sm font-semibold leading-none text-link dark:text-white">{label}</label>
            {children}
        </div>
    );
}
