import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
    children: ReactNode;
};

type State = {
    hasError: boolean;
};

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = { hasError: false };

    public static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error('Mawa Mart frontend error', error, info.componentStack);
    }

    public render(): ReactNode {
        if (! this.state.hasError) {
            return this.props.children;
        }

        return (
            <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-slate-100">
                <section className="w-full max-w-lg rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-xl">
                    <h1 className="text-xl font-semibold">Halaman tidak dapat ditampilkan</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                        Terjadi kesalahan pada tampilan. Data yang sudah tersimpan tetap aman.
                    </p>
                    <button
                        type="button"
                        className="mt-5 rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500"
                        onClick={() => window.location.reload()}
                    >
                        Muat ulang
                    </button>
                </section>
            </main>
        );
    }
}
