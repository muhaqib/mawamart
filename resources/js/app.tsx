import React, { FormEvent, useEffect, useId, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Badge, Button, Card, DataTable, Field, FormGrid, FormStack, Tabs } from './components';
import ErrorBoundary from './ErrorBoundary';

type User = {
    id: number;
    name: string;
    username: string;
    email: string;
    role: 'admin' | 'cashier';
    status: string;
    isAdmin: boolean;
};

type Product = {
    id: number;
    kode_barang: string;
    nama_barang: string;
    kategori: string;
    harga_modal: number;
    harga_jual: number;
    stok: number;
    stok_minimal: number;
    satuan: string;
    status: string;
    foto_produk_url: string | null;
    deskripsi: string | null;
    update_url: string | null;
    destroy_url: string | null;
};

type Transaction = {
    id: number;
    kode_transaksi: string;
    created_at: string;
    created_at_input: string;
    paid_at_input: string | null;
    cashier: string;
    customer_name: string | null;
    payment_type: string | null;
    payment_status: 'paid' | 'pending';
    status: 'completed' | 'void';
    discount_total: number;
    void_reason: string | null;
    payment_verified_at: string | null;
    total: number;
    uang_diterima: number;
    kembalian: number;
    receipt_url: string;
    receipt_pdf_url: string;
    receipt_jpeg_url: string;
    thermal_receipt_url: string;
    thermal_payload_url: string;
    update_url: string | null;
    settle_url: string | null;
    destroy_url: string | null;
    verify_transfer_url: string | null;
    details: Array<{ id: number; product_id: number | null; product: string; qty: number; harga: number; subtotal: number }>;
};

type StockIn = {
    id: number;
    invoice_number: string | null;
    product_id: number | null;
    tanggal: string;
    tanggal_input: string | null;
    expired_at: string | null;
    expired_at_input: string | null;
    supplier: string | null;
    product: string;
    product_code: string | null;
    product_category: string | null;
    qty: number;
    satuan: string | null;
    harga_beli: number;
    harga_jual: number;
    discount_percent: number;
    discount_amount: number;
    subtotal: number;
    barcode: string | null;
    amount: number;
    keterangan: string | null;
    nota_url: string | null;
    surat_jalan_url: string | null;
    update_url: string | null;
    destroy_url: string | null;
};

type Expense = {
    id: number;
    spent_at: string;
    spent_at_input: string;
    category: string;
    uraian: string;
    description: string;
    volume: number;
    unit: string | null;
    price: number;
    amount: number;
    notes: string | null;
    user: string;
    attachment_url: string | null;
    update_url: string | null;
    destroy_url: string | null;
};

type Category = {
    id: number;
    nama_kategori: string;
    update_url: string | null;
    destroy_url: string | null;
};

type Supplier = {
    id: number;
    nama: string;
    nomor_telepon: string | null;
    email: string | null;
    alamat: string | null;
    update_url: string | null;
    destroy_url: string | null;
};

type Cashier = {
    id: number;
    name: string;
    username: string;
    role: string;
    status: string;
    today_sales: number;
    transactions_count: number;
    has_transactions: boolean;
    has_activity: boolean;
    is_current_user: boolean;
    update_url: string | null;
    destroy_url: string | null;
    reset_password_url: string | null;
};

type CashierShift = {
    id: number;
    cashier: string;
    opened_at: string;
    closed_at: string | null;
    opening_cash: number;
    closing_cash: number | null;
    expected_cash: number;
    cash_sales: number;
    transfer_sales: number;
    pending_sales: number;
    void_total: number;
    difference: number;
    notes: string | null;
    close_url: string;
};

type StockOpname = {
    id: number;
    date: string;
    date_input: string;
    update_url: string | null;
    destroy_url: string | null;
    user: string;
    notes: string | null;
    adjustments: Array<{ id: number; product_id: number; product: string; system_stock: number; actual_stock: number; difference: number; reason: string | null }>;
};

type StockOpnameRow = {
    row_id: string;
    adjustment_id: number;
    opname_id: number;
    date: string;
    date_input: string;
    update_url: string | null;
    destroy_url: string | null;
    user: string;
    product_id: number;
    product: string;
    system_stock: number;
    actual_stock: number;
    difference: number;
    reason: string | null;
};

type AuditLog = {
    id: number;
    time: string;
    user: string;
    action: string;
};

type SalesPoint = {
    label: string;
    count: number;
};

type FinancialChartPoint = {
    label: string;
    income: number;
    expense: number;
    capital: number;
    gross_profit: number;
    net_profit: number;
};

type ProductSalesPoint = {
    name: string;
    qty: number;
    total: number;
};

type ReceiptSettings = {
    receipt_store_name: string;
    receipt_address_line_1: string;
    receipt_address_line_2: string;
    receipt_phone: string;
    receipt_footer_line_1: string;
    receipt_footer_line_2: string;
    receipt_footer_line_3: string;
    receipt_paper_width: string;
    receipt_show_cashier: string;
    receipt_show_customer: string;
    receipt_show_payment: string;
};

type PaginationMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

type AppProps = {
    csrf: string;
    user: User;
    routes: Record<string, string | null>;
    settingsTab: string | null;
    receiptSettings: ReceiptSettings;
    stats: Record<string, number>;
    reportStats: Record<string, number>;
    products: Product[];
    activeProducts: Product[];
    lowStockProducts: Product[];
    transactions: Transaction[];
    dashboardTransactions: Transaction[];
    historyTransactions: Transaction[];
    stockEntries: StockIn[];
    purchaseHistory: StockIn[];
    expenses: Expense[];
    categories: Category[];
    suppliers: Supplier[];
    cashiers: Cashier[];
    currentShift: CashierShift | null;
    recentShifts: CashierShift[];
    stockOpnames: StockOpname[];
    auditLogs: AuditLog[];
    salesChart: SalesPoint[];
    netProfitChart: SalesPoint[];
    financialChart: FinancialChartPoint[];
    monthlyProductSales: ProductSalesPoint[];
    pagination: Record<string, PaginationMeta | null>;
    filters: Record<string, string | null>;
    flash: {
        success: string | null;
        warning: string | null;
    };
};

type CartItem = Product & { qty: number; discountType: 'amount' | 'percent'; discountValue: number };
type Theme = 'light' | 'dark';
type NavLeaf = { id: string; label: string; icon: string; children?: NavLeaf[] };
type NavGroup = { heading: string; items: NavLeaf[] };

declare global {
    interface Window {
        __DALWA_APP__?: AppProps;
    }
}

const rupiah = (value: number | string | null | undefined) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    })
        .format(Number(value ?? 0))
        .replace(/\s/g, ' ');

const rupiahCompact = (value: number | string | null | undefined) => {
    const number = Number(value ?? 0);

    if (number >= 1_000_000_000) {
        return `Rp ${(number / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`;
    }

    if (number >= 1_000_000) {
        return `Rp ${(number / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} Jt`;
    }

    if (number >= 1_000) {
        return `Rp ${(number / 1_000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} Rb`;
    }

    return rupiah(number);
};

const numericOnly = (value: string | number | null | undefined) => String(value ?? '').replace(/\D/g, '');
const formatThousands = (value: string | number | null | undefined) => {
    const digits = numericOnly(value);

    return digits ? Number(digits).toLocaleString('id-ID') : '';
};

function ThousandsInput({
    name,
    defaultValue = '',
    required = false,
    placeholder,
}: {
    name: string;
    defaultValue?: string | number;
    required?: boolean;
    placeholder?: string;
}) {
    const [value, setValue] = useState(numericOnly(defaultValue));

    return (
        <>
            <input type="hidden" name={name} value={value} />
            <input
                type="text"
                inputMode="numeric"
                value={formatThousands(value)}
                onChange={(event) => setValue(numericOnly(event.target.value))}
                placeholder={placeholder}
                required={required}
            />
        </>
    );
}
const parseDecimal = (value: string | number | null | undefined) => Number(String(value ?? '').replace(',', '.'));
const normalizeSearchText = (value: string | number | null | undefined) =>
    String(value ?? '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
const matchesSearchText = (source: string, query: string) => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
        return true;
    }

    return source.toLowerCase().includes(keyword) || normalizeSearchText(source).includes(normalizeSearchText(keyword));
};

const normalizePeriodMonth = (period: string | null | undefined) => {
    if (period && /^\d{4}-\d{2}$/.test(period)) {
        return period;
    }

    const date = new Date();

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const monthLabel = (period: string) => {
    const [year, month] = period.split('-').map(Number);
    const date = new Date(year, (month || 1) - 1, 1);

    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};

type SortDirection = 'asc' | 'desc';

const compareText = (first: string | number | null | undefined, second: string | number | null | undefined) => (
    String(first ?? '').localeCompare(String(second ?? ''), 'id', { numeric: true, sensitivity: 'base' })
);

const compareNumber = (first: number | string | null | undefined, second: number | string | null | undefined) => (
    Number(first ?? 0) - Number(second ?? 0)
);

const parseDateForSort = (value: string | null | undefined) => {
    const text = String(value ?? '').trim();
    const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);

    if (match) {
        const [, day, month, year, hour = '0', minute = '0'] = match;

        return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)).getTime();
    }

    const parsed = Date.parse(text);

    return Number.isNaN(parsed) ? 0 : parsed;
};

function SortableHeader<K extends string>({ align = 'center', column, label, onSort, sortDirection, sortKey }: { align?: 'left' | 'center' | 'right'; column: K; label: string; onSort: (key: K) => void; sortDirection: SortDirection; sortKey: K }) {
    const active = sortKey === column;
    const justify = align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center';
    const upActive = active && sortDirection === 'asc';
    const downActive = active && sortDirection === 'desc';

    return (
        <button className={`inline-flex w-full items-center gap-2 font-semibold text-inherit transition hover:text-primary ${justify}`} type="button" onClick={() => onSort(column)}>
            <span>{label}</span>
            <span className="grid gap-0.5 text-darklink" aria-hidden="true">
                <svg className={`h-1.5 w-2 ${upActive ? 'text-primary' : ''}`} fill="currentColor" viewBox="0 0 8 5">
                    <path d="M4 0 8 5H0L4 0Z" />
                </svg>
                <svg className={`h-1.5 w-2 ${downActive ? 'text-primary' : ''}`} fill="currentColor" viewBox="0 0 8 5">
                    <path d="M4 5 0 0h8L4 5Z" />
                </svg>
            </span>
        </button>
    );
}

function useTableSort<K extends string>(defaultKey: K, defaultDirection: SortDirection = 'asc') {
    const [sortKey, setSortKey] = useState<K>(defaultKey);
    const [sortDirection, setSortDirection] = useState<SortDirection>(defaultDirection);
    const toggleSort = (key: K) => {
        if (sortKey === key) {
            setSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc');
            return;
        }

        setSortKey(key);
        setSortDirection('asc');
    };

    return { sortKey, sortDirection, toggleSort };
}

const withSortDirection = (value: number, direction: SortDirection) => value * (direction === 'asc' ? 1 : -1);

const calculateProfitPercent = (purchasePrice: string | number, salePrice: string | number) => {
    const buy = Number(numericOnly(purchasePrice));
    const sell = Number(numericOnly(salePrice));

    if (buy <= 0 || sell <= 0) {
        return '';
    }

    return Number((((sell - buy) / buy) * 100).toFixed(2)).toLocaleString('id-ID');
};

const todayInputDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const nowInputDateTime = () => `${todayInputDate()}T${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

function EditableDateInput({ className = '', defaultValue, label, name, required = false }: { className?: string; defaultValue: string; label: string; name: string; required?: boolean }) {
    const [isoValue, setIsoValue] = useState(defaultValue.slice(0, 10));

    return (
        <input
            className={`flex h-10 w-full min-w-0 rounded-sm border border-ld bg-transparent px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary ${className}`}
            type="date"
            lang="id-ID"
            name={name}
            value={isoValue}
            aria-label={label}
            required={required}
            onChange={(event) => setIsoValue(event.target.value)}
        />
    );
}

function EditableDateTimeInput({ value, onChange, name, required = true }: { value: string; onChange: (value: string) => void; name: string; required?: boolean }) {
    return (
        <input
            className="flex h-10 w-full min-w-0 rounded-sm border border-ld bg-transparent px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
            type="datetime-local"
            lang="id-ID"
            name={name}
            value={value}
            required={required}
            aria-label={name === 'paid_at' ? 'Tanggal pembayaran' : 'Tanggal dan waktu'}
            onChange={(event) => onChange(event.target.value)}
        />
    );
}

const navFor = (isAdmin: boolean): NavGroup[] => [
    {
        heading: 'Halaman',
        items: [
            { id: 'dashboard', label: 'Beranda', icon: 'dashboard' },
            { id: 'transactions', label: 'Transaksi', icon: 'cashier' },
            { id: 'operations', label: 'Pengeluaran', icon: 'wallet' },
        ],
    },
    {
        heading: 'Data Stok',
        items: [
            { id: 'stock', label: 'Stok', icon: 'stock' },
            { id: 'purchases', label: 'Pembelian', icon: 'receipt' },
            { id: 'stock-opname', label: 'Stok Opname', icon: 'boxes' },
        ],
    },
    {
        heading: 'Data Laporan',
        items: [
            { id: 'history', label: 'Laporan', icon: 'report' },
            { id: 'transaction-history', label: 'Riwayat Transaksi', icon: 'history' },
        ],
    },
    {
        heading: 'Data Master',
        items: [
            { id: 'categories', label: 'Kategori', icon: 'category' },
            { id: 'inventory', label: 'Produk', icon: 'product' },
            { id: 'suppliers', label: 'Suplier', icon: 'supplier' },
            ...(isAdmin ? [{ id: 'audit-login', label: 'Audit Login', icon: 'history' }] : []),
        ],
    },
];

function NavIcon({ name }: { name: string }) {
    const common = {
        fill: 'none',
        stroke: 'currentColor',
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        strokeWidth: 1.9,
        viewBox: '0 0 24 24',
    };

    if (name === 'dashboard') {
        return <svg {...common}><rect x="4" y="4" width="6" height="6" rx="1.5" /><rect x="14" y="4" width="6" height="4" rx="1.3" /><rect x="4" y="14" width="6" height="6" rx="1.5" /><rect x="14" y="12" width="6" height="8" rx="1.5" /></svg>;
    }

    if (name === 'cashier') {
        return <svg {...common}><path d="M6 8h12a2 2 0 0 1 2 2v8H4v-8a2 2 0 0 1 2-2Z" /><path d="M8 8V5h8v3" /><path d="M7 13h.01" /><path d="M11 13h.01" /><path d="M15 13h2" /><path d="M7 17h10" /></svg>;
    }

    if (name === 'management') {
        return <svg {...common}><path d="M12 3 4 7.5 12 12l8-4.5L12 3Z" /><path d="m4 12 8 4.5 8-4.5" /><path d="M8 9.8v5.4" /><path d="M16 9.8v5.4" /></svg>;
    }

    if (name === 'product') {
        return <svg {...common}><path d="M10 3h4" /><path d="M11 3v3.2c0 .5-.2 1-.6 1.4l-1 1A4.8 4.8 0 0 0 8 12v6a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3v-6a4.8 4.8 0 0 0-1.4-3.4l-1-1A2 2 0 0 1 13 6.2V3" /><path d="M8 14h8" /><path d="M10 18h4" /></svg>;
    }

    if (name === 'receipt') {
        return <svg {...common}><path d="M7 3h10a2 2 0 0 1 2 2v16l-3-1.5L13 21l-3-1.5L7 21l-3-1.5V5a2 2 0 0 1 2-2Z" /><path d="M8 8h8" /><path d="M8 12h8" /><path d="M8 16h5" /></svg>;
    }

    if (name === 'boxes') {
        return <svg {...common}><path d="m12 3 7 4-7 4-7-4 7-4Z" /><path d="m5 11 7 4 7-4" /><path d="m5 15 7 4 7-4" /></svg>;
    }

    if (name === 'category') {
        return <svg {...common}><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H9l2 2h6.5A2.5 2.5 0 0 1 20 8.5v7A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5v-9Z" /><path d="M8 11h8" /><path d="M8 14h5" /></svg>;
    }

    if (name === 'stock') {
        return <svg {...common}><path d="M4 10 12 5l8 5v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9Z" /><path d="M8 20v-7h8v7" /><path d="M9.5 16h5" /><path d="M12 5V3" /></svg>;
    }

    if (name === 'supplier') {
        return <svg {...common}><path d="M4 7h10v10H4z" /><path d="M14 10h3l3 3v4h-6v-7Z" /><path d="M6.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" /><path d="M17.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" /><path d="M7 10h4" /></svg>;
    }

    if (name === 'report') {
        return <svg {...common}><path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M14 3v5h5" /><path d="M8 16h2v2H8z" /><path d="M12 13h2v5h-2z" /><path d="M16 11h2v7h-2z" /></svg>;
    }

    if (name === 'history') {
        return <svg {...common}><path d="M4 12a8 8 0 1 0 2.34-5.66" /><path d="M4 4v5h5" /><path d="M12 8v5l3 2" /></svg>;
    }

    if (name === 'edit') {
        return <svg {...common}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></svg>;
    }

    if (name === 'print') {
        return <svg {...common}><path d="M7 8V4h10v4" /><path d="M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" /><path d="M7 14h10v6H7z" /><path d="M17 12h.01" /></svg>;
    }

    if (name === 'image') {
        return <svg {...common}><rect x="4" y="5" width="16" height="14" rx="2" /><path d="m4 15 4-4 4 4 2-2 6 6" /><circle cx="15" cy="10" r="1.2" /></svg>;
    }

    if (name === 'download') {
        return <svg {...common}><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>;
    }

    if (name === 'cancel') {
        return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>;
    }

    if (name === 'trash') {
        return <svg {...common}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="m19 6-1 14H6L5 6" /><path d="M10 11v5" /><path d="M14 11v5" /></svg>;
    }

    if (name === 'power') {
        return <svg {...common}><path d="M12 2v10" /><path d="M18.4 6.6a8 8 0 1 1-12.8 0" /></svg>;
    }

    if (name === 'key') {
        return <svg {...common}><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8" /><path d="m15 8 2 2" /><path d="m17 6 2 2" /></svg>;
    }

    if (name === 'chart') {
        return <svg {...common}><path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 16v-5" /><path d="M12 16V8" /><path d="M16 16v-3" /></svg>;
    }

    if (name === 'wallet') {
        return <svg {...common}><path d="M5 7.5h12a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h11" /><path d="M16 13h4" /><path d="M16 13a1 1 0 1 0 0 .01" /><path d="M6 7.5l7-3" /></svg>;
    }

    if (name === 'clipboard') {
        return <svg {...common}><path d="M9 4h6l1 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2l1-2Z" /><path d="M9 10h6" /><path d="M9 14h6" /><path d="M9 18h3" /></svg>;
    }

    if (name === 'users') {
        return <svg {...common}><path d="M16 19a4 4 0 0 0-8 0" /><circle cx="12" cy="9" r="3" /><path d="M22 19a3.5 3.5 0 0 0-4-3.5" /><path d="M2 19a3.5 3.5 0 0 1 4-3.5" /><path d="M18 8.5a2.5 2.5 0 0 1 0 5" /><path d="M6 8.5a2.5 2.5 0 0 0 0 5" /></svg>;
    }

    if (name === 'settings') {
        return <svg {...common}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 0 1-4 0v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 0 1 0-4h.09A1.7 1.7 0 0 0 4.65 8.9a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.88.34H9a1.7 1.7 0 0 0 1-1.56V3a2 2 0 0 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.88V9a1.7 1.7 0 0 0 1.56 1H21a2 2 0 0 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z" /></svg>;
    }

    return <svg {...common}><path d="M4 13h6V4H4v9Z" /><path d="M14 20h6v-9h-6v9Z" /><path d="M4 20h6v-3H4v3Z" /><path d="M14 7h6V4h-6v3Z" /></svg>;
}

function ThemeIcon({ theme }: { theme: Theme }) {
    const common = {
        fill: 'none',
        stroke: 'currentColor',
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        strokeWidth: 1.9,
        viewBox: '0 0 24 24',
        'aria-hidden': true,
    };

    if (theme === 'dark') {
        return <svg {...common}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>;
    }

    return <svg {...common}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>;
}

function getInitialTheme(): Theme {
    const stored = window.localStorage.getItem('mawa-theme') || window.localStorage.getItem('dalwa-theme');

    if (stored === 'light' || stored === 'dark') {
        return stored;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function postForm(action: string | null, csrf: string, fields: Record<string, string | number | null | undefined> = {}) {
    if (!action) {
        return;
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = action;
    form.style.display = 'none';

    const token = document.createElement('input');
    token.type = 'hidden';
    token.name = '_token';
    token.value = csrf;
    form.appendChild(token);

    Object.entries(fields).forEach(([name, value]) => {
        if (value === undefined || value === null) {
            return;
        }

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = String(value);
        form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
}

function ServerPagination({ meta }: { meta: PaginationMeta | null | undefined }) {
    if (!meta || meta.last_page <= 1) {
        return null;
    }

    const goTo = (targetPage: number) => {
        const url = new URL(window.location.href);
        url.searchParams.set('data_page', String(targetPage));
        window.location.assign(url.toString());
    };

    return (
        <nav className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ld pt-4" aria-label="Navigasi halaman data">
            <span className="text-sm text-muted-foreground">
                Menampilkan {meta.from ?? 0}-{meta.to ?? 0} dari {meta.total} data
            </span>
            <div className="flex items-center gap-2">
                <Button variant="soft" disabled={meta.current_page <= 1} onClick={() => goTo(meta.current_page - 1)}>Sebelumnya</Button>
                <span className="px-2 text-sm font-semibold text-foreground">{meta.current_page} / {meta.last_page}</span>
                <Button variant="soft" disabled={meta.current_page >= meta.last_page} onClick={() => goTo(meta.current_page + 1)}>Berikutnya</Button>
            </div>
        </nav>
    );
}

function App({ props }: { props: AppProps }) {
    const initialPage = new URLSearchParams(window.location.search).get('page') || 'dashboard';
    const [page, setPage] = useState(initialPage);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [theme, setTheme] = useState<Theme>(getInitialTheme);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [editingStockIn, setEditingStockIn] = useState<StockIn | null>(null);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [flashVisible, setFlashVisible] = useState(Boolean(props.flash.success || props.flash.warning));
    const navGroups = navFor(props.user.isAdmin);
    const nav = navGroups.flatMap((group) => group.items);
    const bottomNav = nav;
    const lowStockProducts = props.lowStockProducts;
    const notificationCount = lowStockProducts.length;

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        window.localStorage.setItem('mawa-theme', theme);
    }, [theme]);

    useEffect(() => {
        const hasFlash = Boolean(props.flash.success || props.flash.warning);
        setFlashVisible(hasFlash);

        if (!hasFlash) {
            return;
        }

        const timer = window.setTimeout(() => setFlashVisible(false), 4200);

        return () => window.clearTimeout(timer);
    }, [props.flash.success, props.flash.warning]);

    const activate = (nextPage: string) => {
        const serverPages = new Set([
            'dashboard', 'transactions', 'inventory', 'categories', 'suppliers', 'purchases',
            'stock', 'stock-opname', 'history', 'transaction-history', 'operations',
            'audit-login', 'settings', 'account',
        ]);

        if (serverPages.has(nextPage) && nextPage !== page) {
            const url = new URL(window.location.href);
            url.searchParams.set('page', nextPage);
            url.searchParams.delete('data_page');
            window.location.assign(url.toString());

            return;
        }

        setPage(nextPage);
        setSidebarOpen(false);
        setProfileOpen(false);
        setNotificationOpen(false);
        if (nextPage !== 'product-edit') {
            setEditingProduct(null);
        }
        if (nextPage !== 'category-edit') {
            setEditingCategory(null);
        }
        if (nextPage !== 'supplier-edit') {
            setEditingSupplier(null);
        }
        if (nextPage !== 'stock-edit') {
            setEditingStockIn(null);
        }
        if (nextPage !== 'expense-edit') {
            setEditingExpense(null);
        }
        if (nextPage !== 'transaction-edit') {
            setEditingTransaction(null);
        }
        const url = new URL(window.location.href);
        url.searchParams.set('page', nextPage);
        window.history.replaceState(null, '', url.toString());
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resolvedPage = page === 'cashiers' ? 'settings' : page === 'product-create' || page === 'product-edit' ? 'inventory' : page === 'category-create' || page === 'category-edit' ? 'categories' : page === 'supplier-create' || page === 'supplier-edit' ? 'suppliers' : page === 'stockin' ? 'stock' : page === 'stock-create' || page === 'stock-edit' || page === 'stock-purchase' ? 'purchases' : page === 'expense-create' || page === 'expense-edit' ? 'operations' : page === 'transaction-edit' ? 'transaction-history' : page;

    return (
        <div className="min-h-screen bg-background text-foreground">
            {flashVisible && (props.flash.success || props.flash.warning) && (
                <div className="fixed inset-0 z-[80] grid place-items-center bg-black/20 px-4 backdrop-blur-[1px]">
                    <div className="w-full max-w-sm rounded-md border border-ld bg-card p-5 text-center shadow-2xl">
                        <span className={`mx-auto grid size-11 place-items-center rounded-full ${props.flash.warning ? 'bg-lightwarning text-warningemphasis' : 'bg-lightsuccess text-successemphasis'}`}>
                            <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                                {props.flash.warning ? <path d="M12 9v4M12 17h.01M10.3 4.5 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.5a2 2 0 0 0-3.4 0Z" /> : <path d="M20 6 9 17l-5-5" />}
                            </svg>
                        </span>
                        <strong className="mt-4 block text-base font-semibold text-foreground">{props.flash.warning ? 'Perhatian' : 'Berhasil'}</strong>
                        <p className="mt-2 text-sm font-medium text-muted-foreground">{props.flash.warning || props.flash.success}</p>
                        <button className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90" type="button" onClick={() => setFlashVisible(false)}>
                            Tutup
                        </button>
                    </div>
                </div>
            )}
            <div
                className={`fixed inset-0 z-40 bg-black/45 backdrop-blur-sm transition-opacity xl:hidden ${sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                onClick={() => setSidebarOpen(false)}
            />
            {(profileOpen || notificationOpen) && <button className="fixed inset-0 z-20 cursor-default bg-transparent" type="button" aria-label="Tutup menu" onClick={() => { setProfileOpen(false); setNotificationOpen(false); }} />}

            <aside
                className={`fixed left-0 top-0 z-50 flex h-screen w-[270px] flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-transform duration-200 dark:bg-sidebar dark:text-sidebar-foreground xl:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex min-h-[76px] items-center gap-3 overflow-hidden border-b border-border px-6">
                    <span className="grid size-14 shrink-0 place-items-center overflow-hidden">
                        <img className="h-14 w-14 rounded-md object-contain" src="/images/logo-mawa-mart.png" alt="Logo Toko Mawa" />
                    </span>
                    <span className="grid min-w-0 gap-0.5">
                        <strong className="truncate text-lg font-semibold leading-6 text-foreground">Toko Mawa</strong>
                        <small className="truncate text-xs font-medium leading-4 text-muted-foreground">Retail & Mart System</small>
                    </span>
                    <button
                        className="ms-auto grid size-10 place-items-center rounded-full text-darklink hover:bg-lightprimary hover:text-primary xl:hidden"
                        type="button"
                        aria-label="Tutup menu"
                        onClick={() => setSidebarOpen(false)}
                    >
                        x
                    </button>
                </div>

                <nav className="app-sidebar-scroll min-h-0 flex-1 overflow-y-auto px-6 py-4">
                    <div className="grid gap-5">
                        {navGroups.map((group) => (
                            <div className="grid gap-1" key={group.heading}>
                                <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                                    {group.heading}
                                </div>
                                {group.items.map((item) => {
                                    const childActive = item.children?.some((child) => resolvedPage === child.id) ?? false;
                                    const active = resolvedPage === item.id || childActive;

                                    return (
                                        <div className="grid gap-1" key={item.id}>
                                            <button
                                                className={`mt-1 flex min-h-10 w-full items-center gap-3 rounded-sm px-3 text-left text-sm font-medium leading-5 transition [&_svg]:size-[21px] ${active ? 'bg-lightprimary text-primary' : 'text-sidebar-foreground hover:bg-lightprimary hover:text-primary'}`}
                                                type="button"
                                                onClick={() => activate(item.id)}
                                            >
                                                <span className="grid size-6 place-items-center"><NavIcon name={item.icon} /></span>
                                                <span className="truncate">{item.label}</span>
                                            </button>
                                            {item.children?.map((child) => {
                                                const childIsActive = resolvedPage === child.id;

                                                return (
                                                    <button
                                                        className={`ms-9 flex min-h-9 items-center gap-2 rounded-sm px-3 text-left text-xs font-semibold leading-4 transition ${childIsActive ? 'bg-lightprimary text-primary' : 'text-muted-foreground hover:bg-lightprimary hover:text-primary'}`}
                                                        key={child.id}
                                                        type="button"
                                                        onClick={() => activate(child.id)}
                                                    >
                                                        <span className="size-1.5 rounded-full bg-current" />
                                                        <span className="truncate">{child.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </nav>

            </aside>

            <div className="min-h-screen w-full bg-background xl:ps-[270px]">
                <header className="sticky top-0 z-30 border-b border-border bg-background/95 shadow-sm backdrop-blur dark:bg-background/95">
                    <nav className="flex min-h-[76px] items-center justify-between gap-4 rounded-none px-6 py-4 sm:ps-6 sm:pe-10">
                        <button
                            className="relative grid size-10 place-items-center rounded-full text-foreground after:absolute after:size-10 after:rounded-full after:bg-transparent hover:text-primary hover:after:bg-lightprimary xl:hidden"
                            type="button"
                            aria-label="Buka menu"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <span className="text-lg leading-none">☰</span>
                        </button>

                        <div className="hidden min-w-0 xl:block" />

                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                className="relative grid size-10 place-items-center rounded-full px-2 text-foreground after:absolute after:size-10 after:rounded-full after:bg-transparent hover:text-primary hover:after:bg-lightprimary [&_svg]:size-5"
                                type="button"
                                aria-label={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
                                onClick={() => {
                                    setProfileOpen(false);
                                    setNotificationOpen(false);
                                    setTheme(theme === 'dark' ? 'light' : 'dark');
                                }}
                            >
                                <ThemeIcon theme="dark" />
                            </button>
                            <div className="relative z-30">
                                <button
                                    className={`relative grid size-10 place-items-center rounded-full px-2 text-foreground after:absolute after:size-10 after:rounded-full hover:text-primary hover:after:bg-lightprimary [&_svg]:size-5 ${notificationOpen ? 'text-primary after:bg-lightprimary' : 'after:bg-transparent'}`}
                                    type="button"
                                    aria-label="Notifikasi"
                                    aria-expanded={notificationOpen}
                                    title="Notifikasi"
                                    onClick={() => {
                                        setProfileOpen(false);
                                        setNotificationOpen((open) => !open);
                                    }}
                                >
                                    {notificationCount > 0 && <span className="absolute right-1 top-1 z-10 grid min-w-4 place-items-center rounded-full bg-error px-1 text-[10px] font-bold leading-4 text-white ring-2 ring-background">{notificationCount}</span>}
                                    <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 18.5a3.5 3.5 0 0 1-7 0" /><path d="M19 17H5l1.5-2.2V10a5.5 5.5 0 1 1 11 0v4.8L19 17Z" /><path d="M12 3V2" /></svg>
                                </button>
                                <div className={`${notificationOpen ? 'grid' : 'hidden'} absolute right-0 top-[calc(100%+10px)] z-50 w-80 gap-2 rounded-md border border-ld bg-card p-3 shadow-md`}>
                                    <div className="px-1">
                                        <strong className="block text-sm font-semibold text-foreground">Notifikasi</strong>
                                        <span className="text-xs font-medium text-muted-foreground">{notificationCount > 0 ? `${notificationCount} notifikasi perlu dicek` : 'Tidak ada notifikasi baru.'}</span>
                                    </div>
                                    {notificationCount > 0 ? (
                                        <button className="rounded-md border border-warning/30 bg-lightwarning px-3 py-3 text-left transition hover:border-warning" type="button" onClick={() => activate('stock')}>
                                            <strong className="block text-sm font-semibold text-warningemphasis">{notificationCount} barang memiliki stok di bawah minimum</strong>
                                            <span className="mt-1 block text-xs font-medium text-muted-foreground">
                                                {lowStockProducts.slice(0, 3).map((product) => product.nama_barang).join(', ')}
                                                {lowStockProducts.length > 3 ? ` dan ${lowStockProducts.length - 3} lainnya` : ''}
                                            </span>
                                        </button>
                                    ) : (
                                        <div className="rounded-md border border-ld px-3 py-3 text-sm font-medium text-muted-foreground">Stok produk aman.</div>
                                    )}
                                </div>
                            </div>
                            <div className="relative z-30">
                                <button
                                    className={`relative grid size-10 place-items-center rounded-full px-2 text-foreground after:absolute after:size-10 after:rounded-full hover:text-primary hover:after:bg-lightprimary [&_svg]:size-5 ${profileOpen ? 'text-primary after:bg-lightprimary' : 'after:bg-transparent'}`}
                                    type="button"
                                    aria-label="Profil"
                                    aria-expanded={profileOpen}
                                    onClick={() => {
                                        setNotificationOpen(false);
                                        setProfileOpen((open) => !open);
                                    }}
                                >
                                    <span className="grid size-5 place-items-center">
                                        <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg>
                                    </span>
                                </button>
                                <div className={`${profileOpen ? 'grid' : 'hidden'} absolute right-0 top-[calc(100%+10px)] z-50 w-56 gap-1 rounded-md border border-ld bg-card p-2 shadow-md`}>
                                    <button className="rounded-sm px-3 py-2 text-left text-sm font-medium hover:bg-lightprimary hover:text-primary" type="button" onClick={() => activate('account')}>Profil akun</button>
                                    {props.user.isAdmin && <button className="rounded-sm px-3 py-2 text-left text-sm font-medium hover:bg-lightprimary hover:text-primary" type="button" onClick={() => activate('settings')}>Pengaturan</button>}
                                    <button className="rounded-sm px-3 py-2 text-left text-sm font-medium text-error hover:bg-lighterror" type="button" onClick={() => postForm(props.routes.logout, props.csrf)}>Keluar</button>
                                </div>
                            </div>
                        </div>
                    </nav>
                </header>

                <div className="mr-0 flex min-h-[calc(100vh-76px)] flex-col rounded-3xl bg-background pb-28 dark:bg-dark xl:mr-3 xl:pb-0">
                    <div className="container mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-6 py-8 xl:py-30">
                        <main className="grow">
                            {resolvedPage === 'dashboard' && <Dashboard props={props} />}
                            {resolvedPage === 'transactions' && <Transactions props={props} />}
                            {page === 'transaction-edit' && editingTransaction && <TransactionEditForm transaction={editingTransaction} props={props} onBack={() => activate('transaction-history')} />}
                            {page === 'transaction-edit' && !editingTransaction && <TransactionHistory props={props} onEdit={(transaction) => { setEditingTransaction(transaction); activate('transaction-edit'); }} />}
                            {page === 'product-create' && <ProductForm props={props} onBack={() => activate('inventory')} />}
                            {page === 'product-edit' && editingProduct && <ProductForm product={editingProduct} props={props} onBack={() => activate('inventory')} />}
                            {page === 'product-edit' && !editingProduct && <Inventory props={props} onCreate={() => activate('product-create')} onEdit={(product) => { setEditingProduct(product); activate('product-edit'); }} />}
                            {page !== 'product-create' && page !== 'product-edit' && resolvedPage === 'inventory' && <Inventory props={props} onCreate={() => activate('product-create')} onEdit={(product) => { setEditingProduct(product); activate('product-edit'); }} />}
                            {page === 'category-create' && <CategoryForm props={props} onBack={() => activate('categories')} />}
                            {page === 'category-edit' && editingCategory && <CategoryForm category={editingCategory} props={props} onBack={() => activate('categories')} />}
                            {page === 'category-edit' && !editingCategory && <Categories props={props} onCreate={() => activate('category-create')} onEdit={(category) => { setEditingCategory(category); activate('category-edit'); }} />}
                            {page !== 'category-create' && page !== 'category-edit' && resolvedPage === 'categories' && <Categories props={props} onCreate={() => activate('category-create')} onEdit={(category) => { setEditingCategory(category); activate('category-edit'); }} />}
                            {page === 'supplier-create' && <SupplierForm props={props} onBack={() => activate('suppliers')} />}
                            {page === 'supplier-edit' && editingSupplier && <SupplierForm supplier={editingSupplier} props={props} onBack={() => activate('suppliers')} />}
                            {page === 'supplier-edit' && !editingSupplier && <Suppliers props={props} onCreate={() => activate('supplier-create')} onEdit={(supplier) => { setEditingSupplier(supplier); activate('supplier-edit'); }} />}
                            {page !== 'supplier-create' && page !== 'supplier-edit' && resolvedPage === 'suppliers' && <Suppliers props={props} onCreate={() => activate('supplier-create')} onEdit={(supplier) => { setEditingSupplier(supplier); activate('supplier-edit'); }} />}
                            {page === 'stock-purchase' && <PurchaseForm props={props} onBack={() => activate('purchases')} />}
                            {page === 'stock-create' && <StockInForm props={props} onBack={() => activate('purchases')} />}
                            {page === 'stock-edit' && editingStockIn && <StockInForm stockIn={editingStockIn} props={props} onBack={() => activate('purchases')} />}
                            {page === 'stock-edit' && !editingStockIn && <Purchases props={props} onCreate={() => activate('stock-purchase')} onEdit={(stockIn) => { setEditingStockIn(stockIn); activate('stock-edit'); }} />}
                            {resolvedPage === 'stock' && <StockPage props={props} />}
                            {page !== 'stock-purchase' && page !== 'stock-create' && page !== 'stock-edit' && resolvedPage === 'purchases' && <Purchases props={props} onCreate={() => activate('stock-purchase')} onEdit={(stockIn) => { setEditingStockIn(stockIn); activate('stock-edit'); }} />}
                            {resolvedPage === 'stock-opname' && <StockOpnamePage props={props} />}
                            {resolvedPage === 'history' && <History props={props} onEditTransaction={(transaction) => { setEditingTransaction(transaction); activate('transaction-edit'); }} />}
                            {resolvedPage === 'transaction-history' && page !== 'transaction-edit' && <TransactionHistory props={props} onEdit={(transaction) => { setEditingTransaction(transaction); activate('transaction-edit'); }} />}
                            {page === 'expense-create' && <ExpenseForm props={props} onBack={() => activate('operations')} />}
                            {page === 'expense-edit' && editingExpense && <ExpenseForm expense={editingExpense} props={props} onBack={() => activate('operations')} />}
                            {page === 'expense-edit' && !editingExpense && <Operations props={props} onCreate={() => activate('expense-create')} onEdit={(expense) => { setEditingExpense(expense); activate('expense-edit'); }} />}
                            {page !== 'expense-create' && page !== 'expense-edit' && resolvedPage === 'operations' && <Operations props={props} onCreate={() => activate('expense-create')} onEdit={(expense) => { setEditingExpense(expense); activate('expense-edit'); }} />}
                            {resolvedPage === 'audit-login' && props.user.isAdmin && <AuditLoginPage props={props} />}
                            {resolvedPage === 'settings' && props.user.isAdmin && <StoreSettings props={props} />}
                            {resolvedPage === 'account' && <Account props={props} />}
                        </main>
                        <footer className="mt-auto pt-8 text-left text-xs font-medium text-darklink">
                            &copy; 2026 Toko Mawa
                        </footer>
                    </div>
                </div>
            </div>

            <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 gap-1 border-t border-ld bg-card px-2 py-2 shadow-lg xl:hidden">
                {bottomNav.slice(0, props.user.isAdmin ? 5 : 4).map((item) => {
                    const active = resolvedPage === item.id || (item.children?.some((child) => resolvedPage === child.id) ?? false);

                    return (
                        <button
                            key={item.id}
                            className={`grid min-h-14 place-items-center rounded-sm px-1 text-[11px] font-bold leading-4 transition [&_svg]:size-5 ${active ? 'bg-lightprimary text-primary' : 'text-darklink hover:bg-lightprimary hover:text-primary'}`}
                            type="button"
                            onClick={() => activate(item.id)}
                        >
                            <span><NavIcon name={item.icon} /></span>
                            <span className="max-w-full truncate">{item.label.split(' ')[0]}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}

function Dashboard({ props }: { props: AppProps }) {
    const { sortDirection: recentSortDirection, sortKey: recentSortKey, toggleSort: toggleRecentSort } = useTableSort<'number' | 'cashier' | 'status' | 'total'>('number');

    const dashboardCards = [
        ['Jumlah Transaksi', props.stats.total_transactions, 'Trx'],
        ['Total Transaksi', props.stats.total_transaction_amount, 'Rp'],
        ['Pendapatan', props.stats.total_income, 'Rp'],
    ];
    const dashboardTransactions = (props.dashboardTransactions ?? []).filter((transaction) => transaction.status !== 'void');
    const recentTransactions = dashboardTransactions.slice(0, 5);
    const topProducts = Object.values(
        dashboardTransactions.reduce<Record<string, { name: string; qty: number; total: number }>>((carry, transaction) => {
            if (transaction.status === 'void') {
                return carry;
            }

            transaction.details.forEach((detail) => {
                carry[detail.product] = carry[detail.product] ?? { name: detail.product, qty: 0, total: 0 };
                carry[detail.product].qty += detail.qty;
                carry[detail.product].total += detail.subtotal;
            });

            return carry;
        }, {}),
    )
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);
    const sortedRecentTransactions = [...recentTransactions].sort((first, second) => {
        const statusText = (transaction: Transaction) => transaction.status === 'void' ? 'Batal' : transaction.payment_status === 'paid' ? 'Lunas' : 'Belum Bayar';
        const value = recentSortKey === 'cashier'
            ? compareText(first.cashier, second.cashier)
            : recentSortKey === 'status'
                ? compareText(statusText(first), statusText(second))
                : recentSortKey === 'total'
                    ? compareNumber(first.total, second.total)
                    : compareText(first.kode_transaksi, second.kode_transaksi);

        return withSortDirection(value, recentSortDirection);
    });

    return (
        <section className="grid gap-6">
            <div>
                <h1 className="text-2xl font-semibold leading-8 text-foreground">Beranda</h1>
                <p className="text-sm leading-5 text-muted-foreground">Ringkasan operasional hari ini.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
                {dashboardCards.map(([label, value, unit]) => <MetricCard key={label} label={String(label)} value={Number(value)} unit={String(unit)} />)}
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.8fr)]">
                <Card title="Transaksi Terbaru">
                    <DataTable>
                        <table>
                            <thead><tr><th><SortableHeader column="number" label="Nomor" sortDirection={recentSortDirection} sortKey={recentSortKey} onSort={toggleRecentSort} /></th><th><SortableHeader column="cashier" label="Kasir" sortDirection={recentSortDirection} sortKey={recentSortKey} onSort={toggleRecentSort} /></th><th><SortableHeader column="status" label="Status" sortDirection={recentSortDirection} sortKey={recentSortKey} onSort={toggleRecentSort} /></th><th className="!text-right"><SortableHeader align="right" column="total" label="Total" sortDirection={recentSortDirection} sortKey={recentSortKey} onSort={toggleRecentSort} /></th></tr></thead>
                            <tbody>
                                {sortedRecentTransactions.length ? sortedRecentTransactions.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td className="!text-left"><strong className="text-foreground">{transaction.kode_transaksi}</strong><br /><span className="text-xs text-muted-foreground">{transaction.created_at}</span></td>
                                        <td>{transaction.cashier}</td>
                                        <td><Badge className="rounded-full px-3 py-1" variant={transaction.status === 'void' ? 'red' : transaction.payment_status === 'paid' ? 'green' : 'amber'}>{transaction.status === 'void' ? 'Batal' : transaction.payment_status === 'paid' ? 'Lunas' : 'Belum Bayar'}</Badge></td>
                                        <td className="whitespace-nowrap !text-right font-semibold text-foreground">{rupiah(transaction.total)}</td>
                                    </tr>
                                )) : <tr><td className="text-center text-muted-foreground" colSpan={4}>Belum ada transaksi.</td></tr>}
                            </tbody>
                        </table>
                    </DataTable>
                </Card>

                <Card title="Produk Terlaris">
                    <div className="grid gap-3">
                        {topProducts.length ? topProducts.map((product, index) => (
                            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-ld bg-background px-4 py-3" key={product.name}>
                                <span className="grid size-9 place-items-center rounded-md bg-lightprimary text-sm font-semibold text-primary">{index + 1}</span>
                                <div className="min-w-0">
                                    <strong className="block truncate text-sm text-foreground">{product.name}</strong>
                                    <span className="text-xs text-muted-foreground">{product.qty} barang terjual</span>
                                </div>
                                <strong className="whitespace-nowrap text-sm text-foreground">{rupiah(product.total)}</strong>
                            </div>
                        )) : <p className="text-sm text-muted-foreground">Belum ada produk terjual hari ini.</p>}
                    </div>
                </Card>
            </div>
        </section>
    );
}

function MetricCard({ label, value, unit }: { label: string; value: number; unit: string }) {
    return (
        <Card className="min-h-28">
            <div className="grid gap-3">
                <h3 className="text-sm font-semibold leading-5 text-muted-foreground">{label}</h3>
                <div className="text-2xl font-semibold leading-none text-foreground">{unit === 'Rp' ? rupiah(value) : value}<small className="text-sm font-medium text-muted-foreground">{unit !== 'Rp' ? ` ${unit}` : ''}</small></div>
            </div>
        </Card>
    );
}

function Transactions({ props }: { props: AppProps }) {
    const [cart, setCart] = useState<Record<number, CartItem>>({});
    const [quantityInputs, setQuantityInputs] = useState<Record<number, string>>({});
    const [query, setQuery] = useState('');
    const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('paid');
    const [paymentType, setPaymentType] = useState<'cash' | 'transfer'>('cash');
    const [paid, setPaid] = useState(0);
    const [customerName, setCustomerName] = useState('');
    const [createdAt, setCreatedAt] = useState(nowInputDateTime);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const items = Object.values(cart);
    const subtotal = items.reduce((sum, item) => sum + item.harga_jual * item.qty, 0);
    const itemDiscount = (item: CartItem) => {
        const value = Math.max(0, Number(item.discountValue || 0));
        const discount = item.discountType === 'percent' ? Math.round((item.harga_jual * Math.min(value, 100)) / 100) : value;

        return Math.min(discount, item.harga_jual);
    };
    const itemLineTotal = (item: CartItem) => Math.max(0, item.harga_jual - itemDiscount(item)) * item.qty;
    const discountTotal = items.reduce((sum, item) => sum + itemDiscount(item) * item.qty, 0);
    const total = Math.max(0, subtotal - discountTotal);
    const change = Math.max(0, paid - total);
    const visibleProducts = props.activeProducts.filter((product) => {
        const matchesKeyword = matchesSearchText(`${product.nama_barang} ${product.kode_barang} ${product.kategori}`, query);

        return matchesKeyword;
    });
    const canPay = items.length > 0 && !submitting && (paymentStatus === 'pending' || paymentType === 'transfer' || paid >= total);

    const addProduct = (product: Product) => {
        setQuantityInputs((current) => {
            const next = { ...current };
            delete next[product.id];
            return next;
        });
        setCart((current) => {
            const existing = current[product.id];
            const nextQty = Math.min(product.stok, (existing?.qty ?? 0) + 1);
            return {
                ...current,
                [product.id]: {
                    ...product,
                    discountType: existing?.discountType ?? 'amount',
                    discountValue: existing?.discountValue ?? 0,
                    qty: nextQty,
                },
            };
        });
    };

    const updateQty = (id: number, qty: number) => {
        setCart((current) => {
            const item = current[id];
            if (!item) return current;
            if (item.stok < 1) return current;

            const nextQty = Number.isFinite(qty)
                ? Math.max(1, Math.min(item.stok, Math.trunc(qty)))
                : item.qty;

            return { ...current, [id]: { ...item, qty: nextQty } };
        });
    };

    const updateQuantityInput = (id: number, value: string) => {
        const digits = numericOnly(value);

        if (digits === '') {
            setQuantityInputs((current) => ({ ...current, [id]: '' }));
            return;
        }

        const item = cart[id];
        if (!item) return;

        const nextQty = Math.max(1, Math.min(item.stok, Number(digits)));

        setQuantityInputs((current) => ({ ...current, [id]: String(nextQty) }));
        updateQty(id, nextQty);
    };

    const commitQuantityInput = (id: number) => {
        setQuantityInputs((current) => {
            const next = { ...current };
            delete next[id];
            return next;
        });
    };

    const stepQuantity = (id: number, qty: number) => {
        commitQuantityInput(id);
        updateQty(id, qty);
    };

    const removeItem = (id: number) => {
        commitQuantityInput(id);
        setCart((current) => {
            const clone = { ...current };
            delete clone[id];
            return clone;
        });
    };

    const updateItemDiscount = (id: number, field: 'discountType' | 'discountValue', value: 'amount' | 'percent' | number) => {
        setCart((current) => {
            const item = current[id];
            if (!item) return current;

            return { ...current, [id]: { ...item, [field]: value } };
        });
    };

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setError('');
        if (!items.length) {
            setError('Transaksi masih kosong.');
            return;
        }

        setSubmitting(true);
        const response = await fetch(props.routes.transactionsStore ?? '', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN': props.csrf,
            },
            body: JSON.stringify({
                items: items.map((item) => ({
                    product_id: item.id,
                    qty: item.qty,
                    discount_type: item.discountType,
                    discount_value: Math.max(0, Number(item.discountValue || 0)),
                })),
                created_at: new FormData(event.currentTarget as HTMLFormElement).get('created_at'),
                payment_status: paymentStatus,
                payment_type: paymentStatus === 'pending' ? null : paymentType,
                discount_per_product: 0,
                uang_diterima: paymentStatus === 'paid' && paymentType === 'cash' ? paid : total,
                bank_name: paymentType === 'transfer' ? 'Transfer' : null,
                reference_number: null,
                customer_name: customerName || null,
            }),
        });

        if (response.redirected) {
            window.location.href = response.url;
            return;
        }

        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            setError(payload?.message || 'Transaksi gagal disimpan.');
            setSubmitting(false);
            return;
        }

        const payload = await response.json().catch(() => null);

        if (payload?.receipt_url) {
            const receiptUrl = new URL(payload.receipt_url, window.location.origin);
            receiptUrl.searchParams.set('autoprint', '1');
            window.location.href = receiptUrl.toString();
            return;
        }

        window.location.href = payload?.redirect_url || props.routes.dashboard || '/';
    };

    return (
        <section className="grid gap-5 text-foreground">
            <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold leading-8">Transaksi</h1>
                    <p className="text-sm leading-5 text-muted-foreground">Kelola transaksi penjualan dan pembayaran pelanggan Toko Mawa.</p>
                </div>
            </header>

            <form className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_410px]" onSubmit={submit}>
                <Card className="min-w-0">
                    <div className="mb-6 max-w-[360px]">
                        <div className="flex h-10 items-center gap-3 rounded-md border border-ld bg-card px-4">
                            <svg className="size-5 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
                            <input className="min-h-10 w-full border-0 bg-transparent text-sm outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari produk" />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                        {visibleProducts.length ? visibleProducts.map((product) => {
                            const isLowStock = product.stok <= 5;

                            return (
                                <article className="group relative overflow-hidden rounded-md border border-ld bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md" key={product.id}>
                                    <button className="grid min-h-36 w-full content-between gap-5 p-4 text-left" type="button" onClick={() => addProduct(product)} aria-label={`Tambah ${product.nama_barang}`}>
                                        <span className="grid gap-4">
                                            <span className="flex items-start justify-between gap-3">
                                                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-lightprimary text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                                                    <svg className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
                                                        <path d="M10 3h4" />
                                                        <path d="M11 3v3.2c0 .5-.2 1-.6 1.4l-1 1A4.8 4.8 0 0 0 8 12v6a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3v-6a4.8 4.8 0 0 0-1.4-3.4l-1-1A2 2 0 0 1 13 6.2V3" />
                                                        <path d="M8 14h8" />
                                                    </svg>
                                                </span>
                                                <span className={`whitespace-nowrap text-right text-xs font-bold leading-5 ${isLowStock ? 'text-error' : 'text-primary'}`}>Stok : {product.stok}</span>
                                            </span>
                                            <span className="text-base font-bold leading-6 text-foreground">{product.nama_barang}</span>
                                        </span>
                                        <span className="flex items-end justify-between gap-3">
                                            <span className="grid min-w-0 gap-0.5">
                                                <small className="text-[11px] font-semibold uppercase text-muted-foreground">Harga</small>
                                                <strong className="whitespace-nowrap text-base leading-5 text-primary">{rupiah(product.harga_jual)}</strong>
                                            </span>
                                        </span>
                                    </button>
                                </article>
                            );
                        }) : <div className="rounded-md border border-dashed border-ld p-8 text-center text-sm font-semibold text-muted-foreground sm:col-span-2 lg:col-span-3 2xl:col-span-4">Produk tidak ditemukan.</div>}
                    </div>
                </Card>

                <aside className="sticky top-24 self-start rounded-md border border-ld bg-card shadow-sm">
                    <div className="flex items-center justify-between gap-3 border-b border-ld px-5 py-4"><h2 className="m-0 text-lg font-semibold leading-6">Keranjang</h2></div>
                    <div className="px-5 pt-4"><Field label="Tanggal Transaksi"><EditableDateTimeInput name="created_at" value={createdAt} onChange={setCreatedAt} /></Field></div>
                    {error && <div className="mx-5 mt-4 rounded-md border border-error/30 bg-lighterror px-4 py-3 text-sm font-semibold text-error">{error}</div>}
                    {items.length > 0 && <div className="px-5 pt-5">
                        <label className="grid gap-1"><span className="text-xs font-semibold text-muted-foreground">Pembeli/Member (Opsional)</span><input className="min-h-10 rounded-md border border-ld bg-card px-3 outline-none focus:border-primary" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Nama pembeli atau member" /></label>
                    </div>}
                    <div className="mx-5 grid max-h-[390px] gap-3 overflow-y-auto py-5">
                        {items.length ? items.map((item) => (
                            <div className="grid gap-3 rounded-md border border-ld bg-background p-3" key={item.id}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <strong className="block text-sm leading-5">{item.nama_barang}</strong>
                                        <span className="text-xs text-muted-foreground">{item.kode_barang} - {rupiah(item.harga_jual)}</span>
                                    </div>
                                    <div className="grid justify-items-end gap-1">
                                        <strong className="text-sm">{rupiah(itemLineTotal(item))}</strong>
                                        <button className="text-xs font-bold text-error" type="button" onClick={() => removeItem(item.id)} aria-label={`Hapus ${item.nama_barang}`}>Hapus</button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <button className="grid size-8 place-items-center rounded-md border border-ld" type="button" onClick={() => stepQuantity(item.id, item.qty - 1)}>-</button>
                                    <input
                                        className="h-8 w-16 rounded-md border border-ld bg-card px-2 text-center text-sm outline-none"
                                        type="text"
                                        inputMode="numeric"
                                        value={formatThousands(quantityInputs[item.id] ?? String(item.qty))}
                                        onChange={(event) => updateQuantityInput(item.id, event.target.value)}
                                        onBlur={() => commitQuantityInput(item.id)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') event.currentTarget.blur();
                                        }}
                                        aria-label={`Jumlah ${item.nama_barang}`}
                                    />
                                    <button className="grid size-8 place-items-center rounded-md border border-ld" type="button" onClick={() => stepQuantity(item.id, item.qty + 1)}>+</button>
                                </div>
                                <div className="grid gap-1.5 rounded-md border border-dashed border-ld px-2 py-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[11px] font-semibold text-muted-foreground">Diskon produk</span>
                                        {itemDiscount(item) > 0 && <span className="text-[11px] font-semibold text-primary">{rupiah(itemDiscount(item) * item.qty)}</span>}
                                    </div>
                                    <div className="grid grid-cols-[66px_minmax(0,1fr)] gap-2">
                                        <select className="h-8 rounded-md border border-ld bg-card px-2 text-xs font-semibold text-foreground outline-none focus:border-primary" value={item.discountType} onChange={(event) => updateItemDiscount(item.id, 'discountType', event.target.value as 'amount' | 'percent')} aria-label={`Tipe diskon ${item.nama_barang}`}>
                                            <option value="amount">Rp</option>
                                            <option value="percent">%</option>
                                        </select>
                                        <input
                                            className="h-8 rounded-md border border-ld bg-card px-2 text-sm outline-none focus:border-primary"
                                            type="text"
                                            inputMode="numeric"
                                            value={item.discountValue ? item.discountType === 'amount' ? formatThousands(item.discountValue) : String(item.discountValue) : ''}
                                            onChange={(event) => {
                                                const value = Number(numericOnly(event.target.value));
                                                updateItemDiscount(item.id, 'discountValue', item.discountType === 'percent' ? Math.min(value, 100) : value);
                                            }}
                                            aria-label={`Nilai diskon ${item.nama_barang}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        )) : <div className="flex min-h-36 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-ld px-5 py-6 text-center text-sm text-muted-foreground">
                            <span className="grid size-12 place-items-center rounded-full bg-lightprimary text-primary">
                                <svg className="size-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M6.5 8.5h11l-.9 8.2A2.5 2.5 0 0 1 14.1 19H9.9a2.5 2.5 0 0 1-2.5-2.3L6.5 8.5Z" />
                                    <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
                                    <path d="M9.5 12h5" />
                                </svg>
                            </span>
                            <span className="block w-full text-center">Keranjang masih kosong</span>
                        </div>}
                    </div>

                    {items.length > 0 && <>
                        <div className="mx-5 grid gap-2.5 border-y border-dashed border-ld py-4 text-sm">
                            <div className="flex items-center justify-between gap-4"><span className="font-medium text-muted-foreground">Sub Total</span><strong className="text-foreground">{rupiah(subtotal)}</strong></div>
                            <div className="flex items-center justify-between gap-4"><span className="font-medium text-muted-foreground">Total Diskon</span><strong className="text-foreground">{rupiah(discountTotal)}</strong></div>
                            <div className="mt-1 flex items-center justify-between gap-4 rounded-md bg-lightprimary px-4 py-3">
                                <span className="text-sm font-semibold text-primary">Total Pembayaran</span>
                                <strong className="text-xl leading-7 text-primary">{rupiah(total)}</strong>
                            </div>
                        </div>

                        <div className="mx-5 mt-4 grid gap-3">
                            <label className="text-xs font-semibold text-muted-foreground" htmlFor="payment-method">Metode Pembayaran</label>
                            <select
                                id="payment-method"
                                className="h-11 rounded-md border border-ld bg-card px-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
                                value={paymentStatus === 'pending' ? 'pending' : paymentType}
                                onChange={(event) => {
                                    if (event.target.value === 'pending') {
                                        setPaymentStatus('pending');
                                        return;
                                    }

                                    setPaymentStatus('paid');
                                    setPaymentType(event.target.value as 'cash' | 'transfer');
                                }}
                            >
                                <option value="cash">Tunai</option>
                                <option value="transfer">Transfer</option>
                                <option value="pending">Piutang</option>
                            </select>
                        </div>

                        {paymentStatus === 'paid' && paymentType === 'cash' && <div className="mx-5 mt-4 grid gap-3"><label className="grid gap-1 text-xs font-semibold text-muted-foreground">Uang Diterima<input className="min-h-11 rounded-md border border-ld bg-card px-3 text-sm font-semibold text-foreground outline-none focus:border-primary" type="text" inputMode="numeric" value={paid ? formatThousands(paid) : ''} onChange={(event) => setPaid(Number(numericOnly(event.target.value)))} /></label><div className="flex items-center justify-between rounded-md bg-background px-4 py-3 text-sm"><span className="font-medium text-muted-foreground">Kembalian</span><strong className="text-foreground">{rupiah(change)}</strong></div></div>}
                        {paymentStatus === 'pending' && <div className="mx-5 mb-4 rounded-md bg-lightwarning px-4 py-3 text-sm font-semibold text-warningemphasis">Transaksi disimpan sebagai piutang.</div>}

                        <div className="grid gap-3 px-5 pb-5 pt-5">
                            <Button className="min-h-12 text-sm" variant="primary" type="submit" disabled={!canPay}>{submitting ? 'Menyimpan...' : 'Bayar'}</Button>
                        </div>
                    </>}
                </aside>
            </form>
        </section>
    );
}

function Inventory({ onCreate, onEdit, props }: { onCreate: () => void; onEdit: (product: Product) => void; props: AppProps }) {
    const [category, setCategory] = useState('Semua kategori');
    const [query, setQuery] = useState('');
    const productCategories = [
        'Semua kategori',
        ...Array.from(new Set([
            ...props.categories.map((item) => item.nama_kategori),
            ...props.products.map((product) => product.kategori),
        ].filter(Boolean))),
    ];
    const filteredProducts = props.products.filter((product) => {
        const matchesCategory = category === 'Semua kategori' || product.kategori === category;
        const matchesKeyword = matchesSearchText(`${product.kode_barang} ${product.nama_barang} ${product.kategori}`, query);

        return matchesCategory && matchesKeyword;
    });

    return (
        <section className="grid gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div><h1 className="text-2xl font-semibold leading-8 text-foreground">Produk</h1><p className="text-sm text-muted-foreground">Kelola katalog produk, kategori, barcode, dan batas stok minimal.</p></div>
            {(
                    <div className="flex flex-wrap gap-2">
                        <Button className="self-start" variant="primary" onClick={onCreate}>Tambah</Button>
                    </div>
                )}
            </div>

            <Card>
                <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(220px,320px)_minmax(0,1fr)_auto]">
                    <select className="h-10 w-full rounded-md border border-ld bg-card px-4 text-sm text-foreground outline-none focus:border-primary" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter kategori">
                        {productCategories.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                    <input className="h-10 w-full rounded-md border border-ld bg-card px-4 text-sm text-foreground outline-none focus:border-primary" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau kode barang..." aria-label="Cari produk" />
                    <Button className="h-10 w-full lg:w-auto" variant="soft" onClick={() => document.activeElement instanceof HTMLElement && document.activeElement.blur()}>
                        Filter
                    </Button>
                </div>
            <ProductTable products={filteredProducts} showActions csrf={props.csrf} onEdit={onEdit} />
                <ServerPagination meta={props.pagination.products} />
            </Card>
        </section>
    );
}

type StockStatusFilter = 'all' | 'safe' | 'low' | 'empty';

function getStockStatus(product: Product): Exclude<StockStatusFilter, 'all'> {
    if (product.stok <= 0) {
        return 'empty';
    }

    return product.stok <= product.stok_minimal ? 'low' : 'safe';
}

function StockPage({ props }: { props: AppProps }) {
    const [category, setCategory] = useState('Semua kategori');
    const [productId, setProductId] = useState('Semua produk');
    const [stockStatus, setStockStatus] = useState<StockStatusFilter>('all');
    const [query, setQuery] = useState('');
    const stockCategories = [
        'Semua kategori',
        ...Array.from(new Set([
            ...props.categories.map((item) => item.nama_kategori),
            ...props.products.map((product) => product.kategori),
        ].filter(Boolean))),
    ];
    const stockProducts = [
        'Semua produk',
        ...props.products.map((product) => String(product.id)),
    ];
    const stockStatusOptions: Array<{ value: StockStatusFilter; label: string }> = [
        { value: 'all', label: 'Semua status' },
        { value: 'safe', label: 'Aman' },
        { value: 'low', label: 'Menipis' },
        { value: 'empty', label: 'Habis' },
    ];
    const filteredProducts = props.products.filter((product) => {
        const matchesCategory = category === 'Semua kategori' || product.kategori === category;
        const matchesProduct = productId === 'Semua produk' || String(product.id) === productId;
        const matchesStatus = stockStatus === 'all' || getStockStatus(product) === stockStatus;
        const matchesKeyword = matchesSearchText(`${product.nama_barang} ${product.kode_barang ?? ''} ${product.kategori ?? ''}`, query);

        return matchesCategory && matchesProduct && matchesStatus && matchesKeyword;
    });
    const stockSummary = {
        products: filteredProducts.length,
        total: filteredProducts.reduce((sum, product) => sum + product.stok, 0),
        low: filteredProducts.filter((product) => getStockStatus(product) === 'low').length,
        empty: filteredProducts.filter((product) => getStockStatus(product) === 'empty').length,
    };
    const summaryItems = [
        { label: 'Total Produk', value: stockSummary.products, helper: 'Produk tampil', color: 'text-primary', accent: 'bg-primary' },
        { label: 'Total Stok', value: stockSummary.total, helper: 'Unit tersedia', color: 'text-success', accent: 'bg-success' },
        { label: 'Stok Menipis', value: stockSummary.low, helper: 'Perlu dicek', color: 'text-warning', accent: 'bg-warning' },
        { label: 'Stok Habis', value: stockSummary.empty, helper: 'Perlu restock', color: 'text-error', accent: 'bg-error' },
    ];

    return (
        <section className="grid gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold leading-8 text-foreground">Stok</h1>
                    <p className="text-sm text-muted-foreground">Informasi stok produk yang tersedia.</p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {summaryItems.map((item) => (
                    <div className="relative min-h-28 overflow-hidden rounded-xl border border-ld bg-card p-5 shadow-xs" key={item.label}>
                        <span className={`absolute inset-y-0 left-0 w-1 ${item.accent}`} aria-hidden="true" />
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-muted-foreground">{item.label}</p>
                                <strong className={`mt-4 block text-3xl font-bold leading-none ${item.color}`}>{item.value.toLocaleString('id-ID')}</strong>
                            </div>
                            <span className="rounded-md border border-ld bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">{item.helper}</span>
                        </div>
                    </div>
                ))}
            </div>

            <Card>
                <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(170px,230px)_minmax(170px,230px)_minmax(160px,200px)_minmax(280px,1fr)]">
                    <select className="h-10 w-full rounded-md border border-ld bg-card px-4 text-sm text-foreground outline-none focus:border-primary" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter kategori stok">
                        {stockCategories.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                    <select className="h-10 w-full rounded-md border border-ld bg-card px-4 text-sm text-foreground outline-none focus:border-primary" value={productId} onChange={(event) => setProductId(event.target.value)} aria-label="Filter produk stok">
                        {stockProducts.map((item) => {
                            const product = props.products.find((row) => String(row.id) === item);

                            return <option key={item} value={item}>{product?.nama_barang ?? item}</option>;
                        })}
                    </select>
                    <select className="h-10 w-full rounded-md border border-ld bg-card px-4 text-sm text-foreground outline-none focus:border-primary" value={stockStatus} onChange={(event) => setStockStatus(event.target.value as StockStatusFilter)} aria-label="Filter status stok">
                        {stockStatusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                    <div className="flex h-10 items-center gap-3 rounded-md border border-ld bg-card px-4 focus-within:border-primary">
                        <svg className="size-5 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
                        <input className="min-h-10 w-full border-0 bg-transparent text-sm text-foreground outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama barang..." aria-label="Cari stok barang" />
                    </div>
                </div>
                <StockTable products={filteredProducts} />
                <ServerPagination meta={props.pagination.products} />
            </Card>
        </section>
    );
}

function Purchases({ onCreate, onEdit, props }: { onCreate: () => void; onEdit: (stockIn: StockIn) => void; props: AppProps }) {
    const [query, setQuery] = useState('');
    const filteredPurchases = props.stockEntries.filter((stockIn) => {
        return matchesSearchText(`${stockIn.invoice_number ?? ''} ${stockIn.supplier ?? ''} ${stockIn.product} ${stockIn.barcode ?? ''} ${stockIn.product_code ?? ''}`, query);
    });

    return (
        <section className="grid gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold leading-8 text-foreground">Pembelian</h1>
                    <p className="text-sm text-muted-foreground">Kelola pembelian produk, suplier, jumlah, harga, dan diskon.</p>
                </div>
                <Button className="self-start" variant="primary" onClick={onCreate}>Tambah</Button>
            </div>

            <Card>
                <div className="mb-5 flex h-10 items-center gap-3 rounded-md border border-ld bg-card px-4 focus-within:border-primary">
                    <svg className="size-5 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
                    <input className="min-h-10 w-full border-0 bg-transparent text-sm text-foreground outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari faktur, suplier, produk, atau barcode..." aria-label="Cari pembelian" />
                </div>
                <PurchaseTable purchases={filteredPurchases} csrf={props.csrf} onEdit={onEdit} />
                <ServerPagination meta={props.pagination.stockEntries} />
            </Card>
        </section>
    );
}

function PurchaseForm({ onBack, props }: { onBack: () => void; props: AppProps }) {
    const [selectedProductId, setSelectedProductId] = useState('');
    const selectedProduct = props.products.find((product) => String(product.id) === selectedProductId) ?? null;
    const [barcode, setBarcode] = useState(selectedProduct?.kode_barang ?? '');
    const [qty, setQty] = useState('');
    const [purchasePrice, setPurchasePrice] = useState(selectedProduct?.harga_modal ? String(selectedProduct.harga_modal) : '');
    const [salePrice, setSalePrice] = useState(selectedProduct?.harga_jual ? String(selectedProduct.harga_jual) : '');
    const [profitPercent, setProfitPercent] = useState(() => calculateProfitPercent(selectedProduct?.harga_modal ?? '', selectedProduct?.harga_jual ?? ''));
    const [discountPercent, setDiscountPercent] = useState('');
    const [discountAmount, setDiscountAmount] = useState('');
    const grossSubtotal = Number(numericOnly(qty)) * Number(numericOnly(purchasePrice));
    const discountValue = Math.min(Number(numericOnly(discountAmount)), grossSubtotal);
    const subtotal = Math.max(0, grossSubtotal - discountValue);
    const discountPercentValue = parseDecimal(discountPercent);

    const recalculateDiscountByPercent = (percentValue: string, nextQty = qty, nextPurchasePrice = purchasePrice) => {
        const base = Number(numericOnly(nextQty)) * Number(numericOnly(nextPurchasePrice));
        const parsedPercent = parseDecimal(percentValue);

        setDiscountAmount(!Number.isNaN(parsedPercent) && parsedPercent > 0 && base > 0 ? String(Math.round(base * Math.min(parsedPercent, 100) / 100)) : '');
    };
    const applyProduct = (productId: string) => {
        const product = props.products.find((item) => String(item.id) === productId);
        const nextPurchasePrice = product?.harga_modal ? String(product.harga_modal) : '';
        const nextSalePrice = product?.harga_jual ? String(product.harga_jual) : '';

        setSelectedProductId(productId);
        setBarcode(product?.kode_barang ?? '');
        setPurchasePrice(nextPurchasePrice);
        setSalePrice(nextSalePrice);
        setProfitPercent(calculateProfitPercent(nextPurchasePrice, nextSalePrice));
        recalculateDiscountByPercent(discountPercent, qty, nextPurchasePrice);
    };
    const updateQty = (value: string) => {
        const digits = numericOnly(value);

        setQty(digits);
        recalculateDiscountByPercent(discountPercent, digits, purchasePrice);
    };
    const updatePurchasePrice = (value: string) => {
        const digits = numericOnly(value);

        setPurchasePrice(digits);
        setProfitPercent(calculateProfitPercent(digits, salePrice));
        recalculateDiscountByPercent(discountPercent, qty, digits);
    };
    const updateProfit = (value: string) => {
        setProfitPercent(value);

        const percent = parseDecimal(value);
        const modal = Number(numericOnly(purchasePrice));

        if (!Number.isNaN(percent) && !Number.isNaN(modal) && modal > 0) {
            setSalePrice(String(Math.round(modal + (modal * percent / 100))));
        }
    };
    const updateSalePrice = (value: string) => {
        const digits = numericOnly(value);

        setSalePrice(digits);
        setProfitPercent(calculateProfitPercent(purchasePrice, digits));
    };
    const updateDiscountPercent = (value: string) => {
        setDiscountPercent(value);
        recalculateDiscountByPercent(value);
    };
    const updateDiscountAmount = (value: string) => {
        const digits = numericOnly(value);
        const amount = Number(digits);

        setDiscountAmount(digits);
        setDiscountPercent(grossSubtotal > 0 && amount > 0 ? Number(((amount / grossSubtotal) * 100).toFixed(2)).toLocaleString('id-ID') : '');
    };

    return (
        <section className="grid gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold leading-8 text-foreground">Tambah Pembelian</h1>
                    <p className="text-sm text-muted-foreground">Catat pembelian produk, suplier, harga, diskon, dan subtotal.</p>
                </div>
                <Button className="self-start" variant="soft" onClick={onBack}>Kembali</Button>
            </div>

            <Card className="gap-0 overflow-hidden p-0">
                <FormStack as="form" method="POST" action={props.routes.stockInsStore ?? ''} encType="multipart/form-data" className="gap-4 px-6 py-6">
                    <input type="hidden" name="_token" value={props.csrf} />
                    <input type="hidden" name="harga_modal" value={purchasePrice} />
                    <input type="hidden" name="harga_beli" value={purchasePrice} />
                    <input type="hidden" name="harga_jual" value={salePrice} />
                    <input type="hidden" name="discount_percent" value={!Number.isNaN(discountPercentValue) ? String(discountPercentValue) : '0'} />
                    <input type="hidden" name="discount_amount" value={discountValue} />
                    <input type="hidden" name="subtotal" value={subtotal} />
                    <CanvasFormRow label="Nomor Faktur/Nota">
                        <input name="invoice_number" placeholder="Masukan nomor faktur atau nota" />
                    </CanvasFormRow>
                    <CanvasFormRow label="Tanggal" required>
                        <EditableDateInput name="tanggal" defaultValue={todayInputDate()} label="Tanggal pembelian" required />
                    </CanvasFormRow>
                    <CanvasFormRow label="Tanggal Kedaluwarsa">
                        <EditableDateInput name="expired_at" defaultValue={''} label="Tanggal kedaluwarsa" />
                    </CanvasFormRow>
                    <CanvasFormRow label="Nama Suplier">
                        <select name="supplier" defaultValue="">
                            <option value="">Pilih suplier</option>
                            {props.suppliers.map((supplier) => <option key={supplier.id} value={supplier.nama}>{supplier.nama}</option>)}
                        </select>
                    </CanvasFormRow>
                    <CanvasFormRow label="Produk" required>
                        <select name="product_id" value={selectedProductId} onChange={(event) => applyProduct(event.target.value)} required>
                            <option value="">Pilih produk</option>
                            {props.products.map((product) => <option key={product.id} value={product.id}>{product.nama_barang}</option>)}
                        </select>
                    </CanvasFormRow>
                    <CanvasFormRow label="Barcode">
                        <input name="kode_barang" value={barcode} onChange={(event) => setBarcode(event.target.value)} placeholder="Masukan barcode" />
                    </CanvasFormRow>
                    <CanvasFormRow label="Jumlah Produk" required>
                        <input type="hidden" name="qty" value={qty} />
                        <input type="text" inputMode="numeric" value={formatThousands(qty)} onChange={(event) => updateQty(event.target.value)} required placeholder="Masukan jumlah produk" />
                    </CanvasFormRow>
                    <CanvasFormRow label="Harga Beli" required>
                        <input type="text" inputMode="numeric" value={formatThousands(purchasePrice)} onChange={(event) => updatePurchasePrice(event.target.value)} required placeholder="Masukan harga beli" />
                    </CanvasFormRow>
                    <CanvasFormRow label="Persentase Keuntungan">
                        <div className="grid grid-cols-[minmax(0,1fr)_56px]">
                            <input className="rounded-e-none border-e-0" type="text" inputMode="decimal" value={profitPercent} onChange={(event) => updateProfit(event.target.value)} placeholder="Masukan persentase keuntungan" />
                            <span className="grid h-10 place-items-center rounded-e-sm border border-ld bg-muted text-sm font-semibold text-muted-foreground">%</span>
                        </div>
                    </CanvasFormRow>
                    <CanvasFormRow label="Harga Jual" required>
                        <input type="text" inputMode="numeric" value={formatThousands(salePrice)} onChange={(event) => updateSalePrice(event.target.value)} required placeholder="Masukan harga jual" />
                    </CanvasFormRow>
                    <CanvasFormRow label="Diskon Persentase">
                        <div className="grid grid-cols-[minmax(0,1fr)_56px]">
                            <input className="rounded-e-none border-e-0" type="text" inputMode="decimal" value={discountPercent} onChange={(event) => updateDiscountPercent(event.target.value)} placeholder="Masukan diskon persentase" />
                            <span className="grid h-10 place-items-center rounded-e-sm border border-ld bg-muted text-sm font-semibold text-muted-foreground">%</span>
                        </div>
                    </CanvasFormRow>
                    <CanvasFormRow label="Jumlah Diskon">
                        <div className="min-h-10 py-2 text-sm font-semibold text-foreground">{rupiah(discountValue)}</div>
                    </CanvasFormRow>
                    <CanvasFormRow label="Sub Total">
                        <div className="min-h-10 py-2 text-sm font-semibold text-foreground">{rupiah(subtotal)}</div>
                    </CanvasFormRow>
                    <div className="grid gap-3 pt-2 md:grid-cols-[220px_minmax(0,1fr)]">
                        <span className="hidden md:block" />
                        <div className="flex flex-wrap gap-2">
                            <Button variant="primary" type="submit" disabled={!props.products.length}>Simpan</Button>
                            <Button variant="soft" onClick={onBack}>Batal</Button>
                        </div>
                    </div>
                </FormStack>
            </Card>
        </section>
    );
}

function StockInForm({ onBack, props, stockIn }: { onBack: () => void; props: AppProps; stockIn?: StockIn }) {
    const [selectedProductId, setSelectedProductId] = useState(stockIn?.product_id ? String(stockIn.product_id) : '');
    const selectedProduct = props.products.find((product) => String(product.id) === selectedProductId) ?? null;
    const [barcode, setBarcode] = useState(stockIn?.barcode ?? selectedProduct?.kode_barang ?? '');
    const [qty, setQty] = useState(stockIn?.qty ? String(stockIn.qty) : '');
    const [purchasePrice, setPurchasePrice] = useState(stockIn?.harga_beli ? String(stockIn.harga_beli) : selectedProduct?.harga_modal ? String(selectedProduct.harga_modal) : '');
    const [salePrice, setSalePrice] = useState(stockIn?.harga_jual ? String(stockIn.harga_jual) : selectedProduct?.harga_jual ? String(selectedProduct.harga_jual) : '');
    const [profitPercent, setProfitPercent] = useState(() => calculateProfitPercent(stockIn?.harga_beli ?? selectedProduct?.harga_modal ?? '', stockIn?.harga_jual ?? selectedProduct?.harga_jual ?? ''));
    const [discountPercent, setDiscountPercent] = useState(stockIn?.discount_percent ? Number(stockIn.discount_percent).toLocaleString('id-ID') : '');
    const [discountAmount, setDiscountAmount] = useState(stockIn?.discount_amount ? String(stockIn.discount_amount) : '');
    const isEdit = Boolean(stockIn);
    const grossSubtotal = Number(numericOnly(qty)) * Number(numericOnly(purchasePrice));
    const discountValue = Math.min(Number(numericOnly(discountAmount)), grossSubtotal);
    const subtotal = Math.max(0, grossSubtotal - discountValue);
    const discountPercentValue = parseDecimal(discountPercent);

    const recalculateDiscountByPercent = (percentValue: string, nextQty = qty, nextPurchasePrice = purchasePrice) => {
        const base = Number(numericOnly(nextQty)) * Number(numericOnly(nextPurchasePrice));
        const parsedPercent = parseDecimal(percentValue);

        setDiscountAmount(!Number.isNaN(parsedPercent) && parsedPercent > 0 && base > 0 ? String(Math.round(base * Math.min(parsedPercent, 100) / 100)) : '');
    };

    const applyProduct = (productId: string) => {
        const product = props.products.find((item) => String(item.id) === productId);
        const nextPurchasePrice = product?.harga_modal ? String(product.harga_modal) : '';
        const nextSalePrice = product?.harga_jual ? String(product.harga_jual) : '';

        setSelectedProductId(productId);
        setBarcode(product?.kode_barang ?? '');
        setPurchasePrice(nextPurchasePrice);
        setSalePrice(nextSalePrice);
        setProfitPercent(calculateProfitPercent(nextPurchasePrice, nextSalePrice));
        recalculateDiscountByPercent(discountPercent, qty, nextPurchasePrice);
    };
    const updateQty = (value: string) => {
        const digits = numericOnly(value);

        setQty(digits);
        recalculateDiscountByPercent(discountPercent, digits, purchasePrice);
    };
    const updateProfit = (value: string) => {
        setProfitPercent(value);

        const percent = parseDecimal(value);
        const modal = Number(numericOnly(purchasePrice));

        if (!Number.isNaN(percent) && !Number.isNaN(modal) && modal > 0) {
            setSalePrice(String(Math.round(modal + (modal * percent / 100))));
        }
    };
    const updatePurchasePrice = (value: string) => {
        const digits = numericOnly(value);

        setPurchasePrice(digits);
        setProfitPercent(calculateProfitPercent(digits, salePrice));
        recalculateDiscountByPercent(discountPercent, qty, digits);
    };
    const updateSalePrice = (value: string) => {
        const digits = numericOnly(value);

        setSalePrice(digits);
        setProfitPercent(calculateProfitPercent(purchasePrice, digits));
    };
    const updateDiscountPercent = (value: string) => {
        setDiscountPercent(value);
        recalculateDiscountByPercent(value);
    };
    const updateDiscountAmount = (value: string) => {
        const digits = numericOnly(value);
        const amount = Number(digits);

        setDiscountAmount(digits);
        setDiscountPercent(grossSubtotal > 0 && amount > 0 ? Number(((amount / grossSubtotal) * 100).toFixed(2)).toLocaleString('id-ID') : '');
    };

    return (
        <section className="grid gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold leading-8 text-foreground">{isEdit ? 'Edit Pembelian' : 'Tambah Pembelian'}</h1>
                    <p className="text-sm text-muted-foreground">{isEdit ? 'Perbarui data pembelian produk, suplier, harga, diskon, dan subtotal.' : 'Tambahkan pembelian produk, suplier, harga, diskon, dan subtotal.'}</p>
                </div>
                <Button className="self-start" variant="soft" onClick={onBack}>Kembali</Button>
            </div>

            <Card className="gap-0 overflow-hidden p-0">
                <FormStack as="form" method="POST" action={isEdit ? stockIn?.update_url ?? '' : props.routes.stockInsStore ?? ''} encType="multipart/form-data" className="gap-4 px-6 py-6">
                    <input type="hidden" name="_token" value={props.csrf} />
                    {isEdit && <input type="hidden" name="_method" value="PUT" />}
                    <input type="hidden" name="harga_modal" value={purchasePrice} />
                    <input type="hidden" name="harga_beli" value={purchasePrice} />
                    <input type="hidden" name="harga_jual" value={salePrice} />
                    <input type="hidden" name="discount_percent" value={!Number.isNaN(discountPercentValue) ? String(discountPercentValue) : '0'} />
                    <input type="hidden" name="discount_amount" value={discountValue} />
                    <input type="hidden" name="subtotal" value={subtotal} />
                    <CanvasFormRow label="Nomor Faktur/Nota">
                        <input name="invoice_number" defaultValue={stockIn?.invoice_number ?? ''} placeholder="Masukan nomor faktur atau nota" />
                    </CanvasFormRow>
                    <CanvasFormRow label="Tanggal" required>
                        <EditableDateInput name="tanggal" defaultValue={stockIn?.tanggal_input ?? todayInputDate()} label="Tanggal pembelian" required />
                    </CanvasFormRow>
                    <CanvasFormRow label="Tanggal Kedaluwarsa">
                        <EditableDateInput name="expired_at" defaultValue={stockIn?.expired_at_input ?? ''} label="Tanggal kedaluwarsa" />
                    </CanvasFormRow>
                    <CanvasFormRow label="Nama Suplier">
                        <select name="supplier" defaultValue={stockIn?.supplier ?? ''}>
                            <option value="">Pilih suplier</option>
                            {props.suppliers.map((supplier) => <option key={supplier.id} value={supplier.nama}>{supplier.nama}</option>)}
                        </select>
                    </CanvasFormRow>
                    <CanvasFormRow label="Produk" required>
                        <select name="product_id" value={selectedProductId} onChange={(event) => applyProduct(event.target.value)} required>
                            <option value="">Pilih produk</option>
                            {props.products.map((product) => <option key={product.id} value={product.id}>{product.nama_barang}</option>)}
                        </select>
                    </CanvasFormRow>
                    <CanvasFormRow label="Barcode">
                        <input name="kode_barang" value={barcode} onChange={(event) => setBarcode(event.target.value)} placeholder="Masukan barcode" />
                    </CanvasFormRow>
                    <CanvasFormRow label="Jumlah Produk" required>
                        <input type="hidden" name="qty" value={qty} />
                        <input type="text" inputMode="numeric" value={formatThousands(qty)} onChange={(event) => updateQty(event.target.value)} required placeholder="Masukan jumlah produk" />
                    </CanvasFormRow>
                    <CanvasFormRow label="Harga Beli" required>
                        <input type="text" inputMode="numeric" value={formatThousands(purchasePrice)} onChange={(event) => updatePurchasePrice(event.target.value)} required placeholder="Masukan harga beli" />
                    </CanvasFormRow>
                    <CanvasFormRow label="Persentase Keuntungan">
                        <div className="grid grid-cols-[minmax(0,1fr)_56px]">
                            <input className="rounded-e-none border-e-0" name="profit_percent" type="text" inputMode="decimal" value={profitPercent} onChange={(event) => updateProfit(event.target.value)} placeholder="Masukan persentase keuntungan" />
                            <span className="grid h-10 place-items-center rounded-e-sm border border-ld bg-muted text-sm font-semibold text-muted-foreground">%</span>
                        </div>
                    </CanvasFormRow>
                    <CanvasFormRow label="Harga Jual" required>
                        <input type="text" inputMode="numeric" value={formatThousands(salePrice)} onChange={(event) => updateSalePrice(event.target.value)} required placeholder="Masukan harga jual" />
                    </CanvasFormRow>
                    <CanvasFormRow label="Diskon Persentase">
                        <div className="grid grid-cols-[minmax(0,1fr)_56px]">
                            <input className="rounded-e-none border-e-0" type="text" inputMode="decimal" value={discountPercent} onChange={(event) => updateDiscountPercent(event.target.value)} placeholder="Masukan diskon persentase" />
                            <span className="grid h-10 place-items-center rounded-e-sm border border-ld bg-muted text-sm font-semibold text-muted-foreground">%</span>
                        </div>
                    </CanvasFormRow>
                    <CanvasFormRow label="Jumlah Diskon">
                        <div className="min-h-10 py-2 text-sm font-semibold text-foreground">{rupiah(discountValue)}</div>
                    </CanvasFormRow>
                    <CanvasFormRow label="Sub Total">
                        <div className="min-h-10 py-2 text-sm font-semibold text-foreground">{rupiah(subtotal)}</div>
                    </CanvasFormRow>
                    <div className="grid gap-3 pt-2 md:grid-cols-[220px_minmax(0,1fr)]">
                        <span className="hidden md:block" />
                        <div className="flex flex-wrap gap-2">
                            <Button variant="primary" type="submit" disabled={!props.products.length}>Simpan</Button>
                            <Button variant="soft" onClick={onBack}>Batal</Button>
                        </div>
                    </div>
                </FormStack>
            </Card>
        </section>
    );
}

function CanvasFormRow({ children, label, required = false }: { children: React.ReactNode; label: string; required?: boolean }) {
    return (
        <div className="grid gap-2 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
            <label className="text-sm font-semibold text-muted-foreground md:text-right">
                {label} {required && <span className="text-error">*</span>}
            </label>
            {children}
        </div>
    );
}

function ProductForm({ onBack, product, props }: { onBack: () => void; product?: Product; props: AppProps }) {
    const [productBarcode, setProductBarcode] = useState(() => product?.kode_barang ?? `DW-${Date.now().toString().slice(-8)}`);
    const generateBarcode = () => {
        setProductBarcode(`DW-${Date.now().toString().slice(-8)}`);
    };
    const isEdit = Boolean(product);

    return (
        <section className="grid gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold leading-8 text-foreground">{isEdit ? 'Edit Produk' : 'Tambah Produk'}</h1>
                    <p className="text-sm text-muted-foreground">{isEdit ? 'Perbarui data katalog, barcode, dan batas stok minimal produk.' : 'Lengkapi data katalog, barcode, dan batas stok minimal produk.'}</p>
                </div>
                <Button className="self-start" variant="soft" onClick={onBack}>Kembali</Button>
            </div>

            <Card className="gap-0 overflow-hidden p-0">
                <FormStack as="form" method="POST" action={isEdit ? product?.update_url ?? '' : props.routes.productsStore ?? ''} encType="multipart/form-data" className="gap-4 px-6 py-6">
                    <input type="hidden" name="_token" value={props.csrf} />
                    {isEdit && <input type="hidden" name="_method" value="PUT" />}
                    <input type="hidden" name="harga_modal" value={product?.harga_modal ?? 0} />
                    <input type="hidden" name="harga_jual" value={product?.harga_jual ?? 0} />
                    <input type="hidden" name="stok" value={product?.stok ?? 0} />
                    {!isEdit && <input type="hidden" name="status" value="active" />}
                    <CanvasFormRow label="Nama" required>
                        <input name="nama_barang" defaultValue={product?.nama_barang ?? ''} required placeholder="Masukan nama produk" />
                    </CanvasFormRow>
                    <CanvasFormRow label="Kategori" required>
                        <select name="kategori" defaultValue={product?.kategori ?? ''} required>
                            <option value="">Pilih kategori</option>
                            {props.categories.map((category) => <option key={category.id} value={category.nama_kategori}>{category.nama_kategori}</option>)}
                        </select>
                    </CanvasFormRow>
                    <CanvasFormRow label="Satuan" required>
                        <input name="satuan" defaultValue={product?.satuan ?? 'Unit'} required placeholder="Masukan satuan produk" />
                    </CanvasFormRow>
                    <CanvasFormRow label="Stok Minimal" required>
                        <input name="stok_minimal" type="number" min={0} defaultValue={product?.stok_minimal ?? 20} required placeholder="Masukan stok minimal" />
                    </CanvasFormRow>
                    {isEdit && (
                        <CanvasFormRow label="Status" required>
                            <select name="status" defaultValue={product?.status ?? 'active'} required>
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
                            </select>
                        </CanvasFormRow>
                    )}
                    <CanvasFormRow label="Barcode" required>
                        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                            <input name="kode_barang" value={productBarcode} onChange={(event) => setProductBarcode(event.target.value)} required placeholder="Masukan barcode" />
                            <Button variant="soft" onClick={generateBarcode}>Generate</Button>
                        </div>
                    </CanvasFormRow>
                    <CanvasFormRow label="Deskripsi">
                        <textarea name="deskripsi" defaultValue={product?.deskripsi ?? ''} placeholder="Deskripsi singkat produk" />
                    </CanvasFormRow>
                    <div className="grid gap-3 pt-2 md:grid-cols-[220px_minmax(0,1fr)]">
                        <span className="hidden md:block" />
                        <div className="flex flex-wrap gap-2">
                            <Button variant="primary" type="submit">Simpan</Button>
                            <Button variant="soft" onClick={onBack}>Batal</Button>
                        </div>
                    </div>
                </FormStack>
            </Card>
        </section>
    );
}

function CategoryForm({ category, onBack, props }: { category?: Category; onBack: () => void; props: AppProps }) {
    const isEdit = Boolean(category);

    return (
        <section className="grid gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold leading-8 text-foreground">{isEdit ? 'Edit Kategori' : 'Tambah Kategori'}</h1>
                    <p className="text-sm text-muted-foreground">{isEdit ? 'Perbarui nama kategori agar katalog produk tetap rapi.' : 'Tambahkan kelompok produk agar katalog dan filter kasir lebih rapi.'}</p>
                </div>
                <Button className="self-start" variant="soft" onClick={onBack}>Kembali</Button>
            </div>

            <Card className="gap-0 overflow-hidden p-0">
                <FormStack as="form" method="POST" action={isEdit ? category?.update_url ?? '' : props.routes.categoriesStore ?? ''} className="gap-4 px-6 py-6">
                    <input type="hidden" name="_token" value={props.csrf} />
                    {isEdit && <input type="hidden" name="_method" value="PUT" />}
                    <CanvasFormRow label="Nama" required>
                        <input name="nama_kategori" defaultValue={category?.nama_kategori ?? ''} required placeholder="Contoh: Minuman" />
                    </CanvasFormRow>
                    <div className="grid gap-3 pt-2 md:grid-cols-[220px_minmax(0,1fr)]">
                        <span className="hidden md:block" />
                        <div className="flex flex-wrap gap-2">
                            <Button variant="primary" type="submit">Simpan</Button>
                            <Button variant="soft" onClick={onBack}>Batal</Button>
                        </div>
                    </div>
                </FormStack>
            </Card>
        </section>
    );
}

function Categories({ props, onCreate, onEdit }: { props: AppProps; onCreate: () => void; onEdit: (category: Category) => void }) {
    const { sortDirection, sortKey, toggleSort } = useTableSort<'name' | 'products'>('name');
    const rows = props.categories.map((category) => {
        const products = props.products.filter((product) => product.kategori === category.nama_kategori);

        return {
            ...category,
            productCount: products.length,
        };
    });
    const sortedRows = [...rows].sort((first, second) => {
        const value = sortKey === 'products'
            ? compareNumber(first.productCount, second.productCount)
            : compareText(first.nama_kategori, second.nama_kategori);

        return withSortDirection(value, sortDirection);
    });

    return (
        <section className="grid gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold leading-8 text-foreground">Kategori</h1>
                    <p className="text-sm text-muted-foreground">Ringkasan kategori produk dan jumlah barang yang terhubung.</p>
                </div>
                <Button className="self-start" variant="primary" onClick={onCreate}>Tambah</Button>
            </div>

            <Card>
                <DataTable className="[&_table]:min-w-[760px] [&_td]:py-5 [&_th]:!text-center [&_th]:text-foreground">
                    <table>
                        <thead>
                            <tr>
                                <th className="w-20 !text-center">No</th>
                                <th className="!text-center"><SortableHeader column="name" label="Nama" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                                <th className="w-56 !text-center"><SortableHeader column="products" label="Jumlah Produk" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                                <th className="w-52 !text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedRows.length ? sortedRows.map((category, index) => (
                                <tr key={category.id}>
                                    <td className="!text-center font-medium text-muted-foreground">{index + 1}</td>
                                    <td><strong className="text-foreground">{category.nama_kategori}</strong></td>
                                    <td className="!text-center font-semibold text-foreground">{category.productCount}</td>
                                    <td className="!text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {category.update_url && <button className="grid size-7 place-items-center rounded-full text-primary transition hover:bg-lightprimary [&_svg]:size-4" type="button" title="Edit" aria-label={`Edit ${category.nama_kategori}`} onClick={() => onEdit(category)}>
                                                <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path d="M12 20h9" />
                                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" />
                                                </svg>
                                            </button>}
                                            {category.destroy_url && <button className="grid size-7 place-items-center rounded-full text-error transition hover:bg-lighterror [&_svg]:size-4" type="button" title="Hapus" aria-label={`Hapus ${category.nama_kategori}`} onClick={() => {
                                                if (window.confirm(`Hapus kategori ${category.nama_kategori}?`)) {
                                                    postForm(category.destroy_url, props.csrf, { _method: 'DELETE' });
                                                }
                                            }}>
                                                <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path d="M3 6h18" />
                                                    <path d="M8 6V4h8v2" />
                                                    <path d="M19 6l-1 14H6L5 6" />
                                                    <path d="M10 11v5" />
                                                    <path d="M14 11v5" />
                                                </svg>
                                            </button>}
                                        </div>
                                    </td>
                                </tr>
                            )) : <tr><td className="text-center text-muted-foreground" colSpan={4}>Belum ada kategori.</td></tr>}
                        </tbody>
                    </table>
                </DataTable>
            </Card>
        </section>
    );
}

function SupplierForm({ supplier, onBack, props }: { supplier?: Supplier; onBack: () => void; props: AppProps }) {
    const isEdit = Boolean(supplier);

    return (
        <section className="grid gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold leading-8 text-foreground">{isEdit ? 'Edit Suplier' : 'Tambah Suplier'}</h1>
                    <p className="text-sm text-muted-foreground">{isEdit ? 'Perbarui kontak dan alamat suplier.' : 'Tambahkan data pemasok untuk kebutuhan pembelian dan stok.'}</p>
                </div>
                <Button className="self-start" variant="soft" onClick={onBack}>Kembali</Button>
            </div>

            <Card className="gap-0 overflow-hidden p-0">
                <FormStack as="form" method="POST" action={isEdit ? supplier?.update_url ?? '' : props.routes.suppliersStore ?? ''} className="gap-4 px-6 py-6">
                    <input type="hidden" name="_token" value={props.csrf} />
                    {isEdit && <input type="hidden" name="_method" value="PUT" />}
                    <CanvasFormRow label="Nama" required>
                        <input name="nama" defaultValue={supplier?.nama ?? ''} required placeholder="Masukan nama suplier" />
                    </CanvasFormRow>
                    <CanvasFormRow label="Nomor Telepon">
                        <input name="nomor_telepon" defaultValue={supplier?.nomor_telepon ?? ''} placeholder="Masukan nomor telepon" />
                    </CanvasFormRow>
                    <CanvasFormRow label="Email">
                        <input name="email" type="email" defaultValue={supplier?.email ?? ''} placeholder="Masukan email" />
                    </CanvasFormRow>
                    <CanvasFormRow label="Alamat">
                        <textarea name="alamat" defaultValue={supplier?.alamat ?? ''} placeholder="Masukan alamat lengkap" />
                    </CanvasFormRow>
                    <div className="grid gap-3 pt-2 md:grid-cols-[220px_minmax(0,1fr)]">
                        <span className="hidden md:block" />
                        <div className="flex flex-wrap gap-2">
                            <Button variant="primary" type="submit">Simpan</Button>
                            <Button variant="soft" onClick={onBack}>Batal</Button>
                        </div>
                    </div>
                </FormStack>
            </Card>
        </section>
    );
}

function Suppliers({ props, onCreate, onEdit }: { props: AppProps; onCreate: () => void; onEdit: (supplier: Supplier) => void }) {
    const { sortDirection, sortKey, toggleSort } = useTableSort<'name' | 'phone' | 'email' | 'address'>('name');
    const sortedRows = [...props.suppliers].sort((first, second) => {
        const value = sortKey === 'phone'
            ? compareText(first.nomor_telepon, second.nomor_telepon)
            : sortKey === 'email'
                ? compareText(first.email, second.email)
                : sortKey === 'address'
                    ? compareText(first.alamat, second.alamat)
                    : compareText(first.nama, second.nama);

        return withSortDirection(value, sortDirection);
    });

    return (
        <section className="grid gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold leading-8 text-foreground">Suplier</h1>
                    <p className="text-sm text-muted-foreground">Kelola data pemasok, kontak, email, dan alamat untuk kebutuhan stok.</p>
                </div>
                <Button className="self-start" variant="primary" onClick={onCreate}>Tambah</Button>
            </div>

            <Card>
                <DataTable className="[&_table]:min-w-[920px] [&_td]:py-5 [&_th]:!text-center [&_th]:text-foreground">
                    <table>
                        <thead>
                            <tr>
                                <th className="w-20 !text-center">No</th>
                                <th className="!text-center"><SortableHeader column="name" label="Nama" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                                <th className="w-44 !text-center"><SortableHeader column="phone" label="Nomor Telepon" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                                <th className="w-56 !text-center"><SortableHeader column="email" label="Email" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                                <th className="!text-center"><SortableHeader column="address" label="Alamat" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                                <th className="w-52 !text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedRows.length ? sortedRows.map((supplier, index) => (
                                <tr key={supplier.id}>
                                    <td className="!text-center font-medium text-muted-foreground">{index + 1}</td>
                                    <td><strong className="text-foreground">{supplier.nama}</strong></td>
                                    <td className="!text-center text-foreground">{supplier.nomor_telepon || '-'}</td>
                                    <td className="!text-center text-foreground">{supplier.email || '-'}</td>
                                    <td className="text-foreground">{supplier.alamat || '-'}</td>
                                    <td className="!text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {supplier.update_url && <button className="grid size-7 place-items-center rounded-full text-primary transition hover:bg-lightprimary [&_svg]:size-4" type="button" title="Edit" aria-label={`Edit ${supplier.nama}`} onClick={() => onEdit(supplier)}>
                                                <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path d="M12 20h9" />
                                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" />
                                                </svg>
                                            </button>}
                                            {supplier.destroy_url && <button className="grid size-7 place-items-center rounded-full text-error transition hover:bg-lighterror [&_svg]:size-4" type="button" title="Hapus" aria-label={`Hapus ${supplier.nama}`} onClick={() => {
                                                if (window.confirm(`Hapus suplier ${supplier.nama}?`)) {
                                                    postForm(supplier.destroy_url, props.csrf, { _method: 'DELETE' });
                                                }
                                            }}>
                                                <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path d="M3 6h18" />
                                                    <path d="M8 6V4h8v2" />
                                                    <path d="M19 6l-1 14H6L5 6" />
                                                    <path d="M10 11v5" />
                                                    <path d="M14 11v5" />
                                                </svg>
                                            </button>}
                                        </div>
                                    </td>
                                </tr>
                            )) : <tr><td className="text-center text-muted-foreground" colSpan={6}>Belum ada suplier.</td></tr>}
                        </tbody>
                    </table>
                </DataTable>
            </Card>
        </section>
    );
}

function History({ props, onEditTransaction }: { props: AppProps; onEditTransaction: (transaction: Transaction) => void }) {
    return <ReportPage props={props} />;
}

function TransactionHistory({ props, onEdit }: { props: AppProps; onEdit: (transaction: Transaction) => void }) {
    const [paymentStatus, setPaymentStatus] = useState(props.filters.payment_status ?? '');
    const [paymentType, setPaymentType] = useState(props.filters.payment_type ?? '');
    const startDate = props.filters.start_date ?? todayInputDate();
    const endDate = props.filters.end_date ?? todayInputDate();
    const visibleTransactions = props.historyTransactions.filter((transaction) => transaction.status !== 'void');
    const filteredTransactions = visibleTransactions.filter((transaction) => {
        const matchesStatus = !paymentStatus || transaction.payment_status === paymentStatus;
        const matchesType = !paymentType || transaction.payment_type === paymentType;

        return matchesStatus && matchesType;
    });

    return (
        <section className="grid gap-6">
            <div><h1 className="text-2xl font-semibold leading-8 text-foreground">Riwayat Transaksi</h1><p className="text-sm text-muted-foreground">Daftar transaksi berdasarkan akses akun</p></div>

            <Card>
                <form className="mb-5 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_180px]" method="GET">
                    <input type="hidden" name="page" value="transaction-history" />
                    <EditableDateInput name="start_date" defaultValue={startDate} label="Tanggal mulai" />
                    <EditableDateInput name="end_date" defaultValue={endDate} label="Tanggal akhir" />
                    <select className="h-10 rounded-md border border-ld bg-card px-4 text-sm text-foreground outline-none focus:border-primary" name="payment_status" value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)} aria-label="Filter status pembayaran">
                        <option value="">Semua status</option>
                        <option value="paid">Lunas</option>
                        <option value="pending">Belum Bayar</option>
                    </select>
                    <select className="h-10 rounded-md border border-ld bg-card px-4 text-sm text-foreground outline-none focus:border-primary" name="payment_type" value={paymentType} onChange={(event) => setPaymentType(event.target.value)} aria-label="Filter metode pembayaran">
                        <option value="">Semua metode</option>
                        <option value="cash">Tunai</option>
                        <option value="transfer">Transfer</option>
                    </select>
                    <Button className="h-10 w-full" type="submit">Filter</Button>
                </form>
                <TransactionTable transactions={filteredTransactions} showCashier csrf={props.csrf} onEdit={onEdit} />
                <ServerPagination meta={props.pagination.historyTransactions} />
            </Card>
        </section>
    );
}

function TransactionEditForm({ onBack, props, transaction }: { onBack: () => void; props: AppProps; transaction: Transaction }) {
    const [customerName, setCustomerName] = useState(transaction.customer_name ?? '');
    const [createdAt, setCreatedAt] = useState(transaction.created_at_input);
    const [paidAt, setPaidAt] = useState(transaction.paid_at_input ?? transaction.created_at_input);
    const [paymentType, setPaymentType] = useState<'cash' | 'transfer'>((transaction.payment_type === 'transfer' ? 'transfer' : 'cash'));
    const [received, setReceived] = useState(String(transaction.uang_diterima || transaction.total || ''));
    const [items, setItems] = useState(() => transaction.details.map((detail, index) => ({
        key: `${detail.id}-${index}`,
        productId: detail.product_id ? String(detail.product_id) : '',
        qty: String(detail.qty),
        discountValue: String(Math.max(0, detail.harga - Math.round(detail.subtotal / Math.max(1, detail.qty)))),
    })));
    const activeProducts = props.products.filter((product) => product.status === 'active' || items.some((item) => String(product.id) === item.productId));
    const rowTotal = (item: { productId: string; qty: string; discountValue: string }) => {
        const product = props.products.find((row) => String(row.id) === item.productId);
        const qty = Number(numericOnly(item.qty));
        const discount = Math.min(Number(numericOnly(item.discountValue)), product?.harga_jual ?? 0);

        return Math.max(0, (product?.harga_jual ?? 0) - discount) * qty;
    };
    const total = items.reduce((sum, item) => sum + rowTotal(item), 0);
    const receivedNumber = paymentType === 'cash' ? Number(numericOnly(received)) : total;
    const change = paymentType === 'cash' ? Math.max(0, receivedNumber - total) : 0;
    const updateItem = (key: string, field: 'productId' | 'qty' | 'discountValue', value: string) => {
        setItems((current) => current.map((item) => item.key === key ? { ...item, [field]: field === 'productId' ? value : numericOnly(value) } : item));
    };
    const addItem = () => {
        setItems((current) => [...current, { key: `new-${Date.now()}`, productId: '', qty: '1', discountValue: '' }]);
    };
    const removeItem = (key: string) => {
        setItems((current) => current.length > 1 ? current.filter((item) => item.key !== key) : current);
    };

    return (
        <section className="grid gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold leading-8 text-foreground">Edit Transaksi</h1>
                    <p className="text-sm text-muted-foreground">Koreksi produk atau jumlah jika ada kesalahan input transaksi.</p>
                </div>
                <Button className="self-start" variant="soft" onClick={onBack}>Kembali</Button>
            </div>

            <Card className="gap-0 overflow-hidden p-0">
                <FormStack as="form" method="POST" action={transaction.update_url ?? ''} className="gap-5 px-6 py-6">
                    <input type="hidden" name="_token" value={props.csrf} />
                    <input type="hidden" name="_method" value="PUT" />
                    <div className="grid gap-4 rounded-md border border-ld bg-background p-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <span className="text-xs font-semibold uppercase text-muted-foreground">Nomor</span>
                                <strong className="mt-1 block text-sm text-foreground">{transaction.kode_transaksi}</strong>
                            </div>
                            <Field label="Tanggal">
                                <EditableDateTimeInput name="created_at" value={createdAt} onChange={setCreatedAt} />
                            </Field>
                            {transaction.payment_status === 'paid' && <Field label="Tanggal Pembayaran"><EditableDateTimeInput name="paid_at" value={paidAt} onChange={setPaidAt} /></Field>}
                            <Field label="Metode Pembayaran">
                                <select name="payment_type" value={paymentType} onChange={(event) => setPaymentType(event.target.value as 'cash' | 'transfer')} required>
                                    <option value="cash">Tunai</option>
                                    <option value="transfer">Transfer</option>
                                </select>
                            </Field>
                            <Field label="Uang Diterima">
                                <input type="hidden" name="uang_diterima" value={receivedNumber} />
                                <input type="text" inputMode="numeric" value={paymentType === 'cash' ? formatThousands(received) : formatThousands(total)} onChange={(event) => setReceived(numericOnly(event.target.value))} readOnly={paymentType === 'transfer'} placeholder="Masukan uang diterima" />
                            </Field>
                        </div>
                        <div className="grid content-center gap-2 rounded-md bg-lightprimary px-4 py-3">
                            <span className="text-xs font-semibold uppercase text-muted-foreground">Total Baru</span>
                            <strong className="text-lg text-primary">{rupiah(total)}</strong>
                            <div className="flex justify-between gap-3 text-xs font-semibold text-muted-foreground"><span>Kembalian</span><span>{rupiah(change)}</span></div>
                        </div>
                    </div>
                    <CanvasFormRow label="Pembeli/Member">
                        <input name="customer_name" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Nama pembeli atau member" />
                    </CanvasFormRow>
                    <div className="grid gap-3">
                        <div className="grid gap-2">
                            <div className="hidden gap-3 px-1 text-xs font-semibold uppercase text-muted-foreground md:grid md:grid-cols-[minmax(220px,1fr)_110px_140px_130px_44px]">
                                <span>Produk</span>
                                <span>Jumlah</span>
                                <span>Diskon/item</span>
                                <span>Total</span>
                                <span />
                            </div>
                            {items.map((item, index) => (
                                <div className="grid gap-3 rounded-md border border-ld bg-card p-3 md:grid-cols-[minmax(220px,1fr)_110px_140px_130px_44px] md:items-center" key={item.key}>
                                    <select name={`items[${index}][product_id]`} value={item.productId} onChange={(event) => updateItem(item.key, 'productId', event.target.value)} required>
                                        <option value="">Pilih produk</option>
                                        {activeProducts.map((product) => <option key={product.id} value={product.id}>{product.nama_barang}</option>)}
                                    </select>
                                    <label>
                                        <input type="hidden" name={`items[${index}][qty]`} value={Number(numericOnly(item.qty))} />
                                        <input type="text" inputMode="numeric" value={formatThousands(item.qty)} onChange={(event) => updateItem(item.key, 'qty', event.target.value)} required placeholder="Qty" />
                                    </label>
                                    <label>
                                        <input type="hidden" name={`items[${index}][discount_value]`} value={Number(numericOnly(item.discountValue))} />
                                        <input type="text" inputMode="numeric" value={formatThousands(item.discountValue)} onChange={(event) => updateItem(item.key, 'discountValue', event.target.value)} placeholder="0" />
                                    </label>
                                    <strong className="text-sm text-foreground">{rupiah(rowTotal(item))}</strong>
                                    <button className="grid size-10 place-items-center rounded-md text-error hover:bg-lighterror" type="button" aria-label="Hapus item" onClick={() => removeItem(item.key)}>
                                        <svg className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M3 6h18" />
                                            <path d="M8 6V4h8v2" />
                                            <path d="M19 6l-1 14H6L5 6" />
                                            <path d="M10 11v5" />
                                            <path d="M14 11v5" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <Button className="self-start" variant="soft" onClick={addItem}>Tambah Item</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="primary" type="submit" disabled={!transaction.update_url}>Simpan</Button>
                        <Button variant="soft" onClick={onBack}>Batal</Button>
                    </div>
                </FormStack>
            </Card>
        </section>
    );
}

function Operations({ onCreate, onEdit, props }: { props: AppProps; onCreate?: () => void; onEdit?: (expense: Expense) => void }) {
    const [query, setQuery] = useState('');
    const filteredExpenses = props.expenses.filter((expense) => {
        const keyword = query.trim().toLowerCase();
        const matchesKeyword = !keyword || `${expense.uraian} ${expense.notes ?? ''} ${expense.user}`.toLowerCase().includes(keyword);

        return matchesKeyword;
    });
    const startDate = props.filters.start_date ?? todayInputDate();
    const endDate = props.filters.end_date ?? todayInputDate();

    return (
        <section className="grid gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold leading-8 text-foreground">Pengeluaran</h1>
                    <p className="text-sm text-muted-foreground">Kelola uraian, volume, harga, jumlah, dan keterangan pengeluaran.</p>
                </div>
                <Button variant="primary" onClick={onCreate}>Tambah</Button>
            </div>

            <Card>
                <div className="mb-5 grid gap-3 xl:grid-cols-[minmax(460px,620px)_minmax(320px,1fr)]">
                    <form method="GET" action={props.routes.dashboard ?? ''} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                        <input type="hidden" name="page" value="operations" />
                        <EditableDateInput name="start_date" defaultValue={startDate} label="Tanggal mulai" />
                        <EditableDateInput name="end_date" defaultValue={endDate} label="Tanggal akhir" />
                        <Button className="h-10 w-full sm:w-auto" variant="soft" type="submit">Filter</Button>
                    </form>
                    <label className="flex h-10 items-center gap-3 rounded-md border border-ld bg-card px-4 focus-within:border-primary">
                        <svg className="size-5 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
                        <input className="min-h-10 w-full border-0 bg-transparent text-sm text-foreground outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari uraian atau keterangan..." aria-label="Cari pengeluaran" />
                    </label>
                </div>
                <ExpenseTable expenses={filteredExpenses} csrf={props.csrf} showActions onEdit={(expense) => onEdit?.(expense)} />
                <ServerPagination meta={props.pagination.expenses} />
            </Card>
        </section>
    );
}

function ExpenseForm({ expense, onBack, props }: { expense?: Expense; onBack: () => void; props: AppProps }) {
    const isEdit = Boolean(expense);
    const [volume, setVolume] = useState(expense ? String(Number(expense.volume)) : '1');
    const [price, setPrice] = useState(expense?.price ? formatThousands(expense.price) : '');
    const priceValue = Number(numericOnly(price));
    const amount = Math.round(Math.max(0, Number(String(volume).replace(',', '.')) || 0) * priceValue);

    return (
        <section className="grid gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold leading-8 text-foreground">{isEdit ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}</h1>
                    <p className="text-sm text-muted-foreground">{isEdit ? 'Perbarui detail pengeluaran operasional.' : 'Tambahkan pengeluaran operasional sesuai rincian nota.'}</p>
                </div>
                <Button className="self-start" variant="soft" onClick={onBack}>Kembali</Button>
            </div>

            <Card className="gap-0 overflow-hidden p-0">
                <FormStack as="form" method="POST" action={isEdit ? expense?.update_url ?? '' : props.routes.expensesStore ?? ''} className="gap-4 px-6 py-6">
                    <input type="hidden" name="_token" value={props.csrf} />
                    {isEdit && <input type="hidden" name="_method" value="PUT" />}
                    <input type="hidden" name="price" value={priceValue} />
                    <input type="hidden" name="amount" value={amount} />
                    <CanvasFormRow label="Tanggal" required>
                        <EditableDateInput name="spent_at" defaultValue={expense?.spent_at_input ?? todayInputDate()} label="Tanggal pengeluaran" required />
                    </CanvasFormRow>
                    <CanvasFormRow label="Uraian" required>
                        <input name="uraian" defaultValue={expense?.uraian ?? ''} placeholder="Masukkan uraian" required />
                    </CanvasFormRow>
                    <CanvasFormRow label="Vol" required>
                        <input name="volume" type="number" min={0} step="0.01" value={volume} onChange={(event) => setVolume(event.target.value)} required />
                    </CanvasFormRow>
                    <CanvasFormRow label="Satuan" required>
                        <input name="unit" defaultValue={expense?.unit ?? ''} placeholder="Contoh: pcs" required />
                    </CanvasFormRow>
                    <CanvasFormRow label="Harga" required>
                        <input inputMode="numeric" value={price} onChange={(event) => setPrice(formatThousands(event.target.value))} placeholder="Masukkan harga" required />
                    </CanvasFormRow>
                    <CanvasFormRow label="Jumlah">
                        <input value={formatThousands(amount)} readOnly />
                    </CanvasFormRow>
                    <CanvasFormRow label="Keterangan">
                        <textarea name="notes" defaultValue={expense?.notes ?? ''} placeholder="Tambahkan keterangan jika ada" />
                    </CanvasFormRow>
                    <div className="grid gap-3 pt-2 md:grid-cols-[220px_minmax(0,1fr)]">
                        <span className="hidden md:block" />
                        <div className="flex flex-wrap gap-2">
                            <Button variant="primary" type="submit">Simpan</Button>
                            <Button variant="soft" onClick={onBack}>Batal</Button>
                        </div>
                    </div>
                </FormStack>
            </Card>
        </section>
    );
}

function ReportPage({ props }: { props: AppProps }) {
    const selectedPeriod = normalizePeriodMonth(props.filters.period_month);
    const selectedReportScope = props.filters.report_scope === 'year' || props.filters.report_scope === 'all' ? props.filters.report_scope : 'month';
    const selectedYear = selectedPeriod.slice(0, 4);
    const periodLabel = selectedReportScope === 'all'
        ? 'Semua periode'
        : selectedReportScope === 'year'
            ? `Tahun ${selectedYear}`
            : monthLabel(selectedPeriod);
    const expenseTotal = Number(props.reportStats.expense_total ?? props.expenses.reduce((sum, expense) => sum + expense.amount, 0));
    const incomeTotal = Number(props.reportStats.income ?? 0);
    const capitalTotal = Number(props.reportStats.capital ?? 0);
    const grossProfit = Number(props.reportStats.gross_profit ?? incomeTotal - capitalTotal);
    const netProfit = Number(props.reportStats.net_profit ?? grossProfit - expenseTotal);
    const grossMargin = incomeTotal > 0 ? Number(((grossProfit / incomeTotal) * 100).toFixed(1)) : 0;
    const transactionCount = Number(props.reportStats.transactions ?? 0);
    const expenseCount = Number(props.reportStats.expense_count ?? props.expenses.length);
    const cashIncome = Number(props.reportStats.cash_income ?? 0);
    const transferIncome = Number(props.reportStats.transfer_income ?? 0);
    const pendingIncome = Number(props.reportStats.pending_income ?? 0);
    const topProducts = props.monthlyProductSales.filter((product) => product.qty > 0).slice(0, 5);
    const topExpenses = [...props.expenses].sort((first, second) => second.amount - first.amount).slice(0, 3);
    const biggestExpense = topExpenses[0] ?? null;
    const expenseRatio = incomeTotal > 0 ? Number(((expenseTotal / incomeTotal) * 100).toFixed(1)) : 0;
    const cashFlowAfterExpense = incomeTotal - expenseTotal;
    const bestProduct = topProducts[0] ?? null;
    const periodText = selectedReportScope === 'all' ? 'semua periode' : 'periode ini';
    const insights = [
        netProfit >= 0 ? `Laba bersih ${periodText} positif sebesar ${rupiah(netProfit)}.` : `Laba bersih ${periodText} minus sebesar ${rupiah(Math.abs(netProfit))}.`,
        bestProduct ? `Produk paling laris: ${bestProduct.name} (${bestProduct.qty.toLocaleString('id-ID')} terjual).` : `Belum ada produk terjual pada ${periodText}.`,
        pendingIncome > 0 ? `Piutang masih ${rupiah(pendingIncome)} dan perlu ditagih.` : `Tidak ada piutang pada ${periodText}.`,
        biggestExpense ? `Pengeluaran terbesar: ${biggestExpense.uraian} sebesar ${rupiah(biggestExpense.amount)}.` : `Belum ada pengeluaran pada ${periodText}.`,
    ];
    return (
        <section className="grid gap-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div><h1 className="text-2xl font-semibold leading-8 text-foreground">Laporan</h1><p className="text-sm text-muted-foreground">Analisa keuangan dan performa toko - {periodLabel}</p></div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                    <form className="flex w-full flex-col gap-3 sm:w-auto lg:flex-row lg:items-center" method="GET" action={props.routes.dashboard ?? ''}>
                        <input type="hidden" name="page" value="history" />
                        <label className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-link dark:text-white">Periode</span>
                            <input
                                className="h-10 w-full rounded-sm border border-ld bg-transparent px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary sm:w-52"
                                name="period_month"
                                type="month"
                                defaultValue={selectedPeriod}
                            />
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button className={`inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition ${selectedReportScope === 'month' ? 'bg-primary text-white' : 'border border-ld bg-card text-foreground hover:bg-muted'}`} name="report_scope" type="submit" value="month">Filter</button>
                            <button className={`inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition ${selectedReportScope === 'year' ? 'bg-primary text-white' : 'border border-ld bg-card text-foreground hover:bg-muted'}`} name="report_scope" type="submit" value="year">Tahun</button>
                            <button className={`inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition ${selectedReportScope === 'all' ? 'bg-primary text-white' : 'border border-ld bg-card text-foreground hover:bg-muted'}`} name="report_scope" type="submit" value="all">Semua</button>
                        </div>
                    </form>
                    {props.routes.transactionsExportPdf && <a className="inline-flex h-10 items-center justify-center rounded-md bg-lightprimary px-4 py-2 text-sm font-semibold leading-5 text-primary transition hover:bg-primary/15" href={props.routes.transactionsExportPdf}>Cetak Laporan</a>}
                </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <Card className="overflow-hidden p-0">
                    <div className="px-6 pb-4 pt-5">
                        <span className="text-xs font-bold uppercase tracking-wide text-primary">Pemasukan</span>
                        <div className="mt-3">
                            <div>
                                <strong className="block text-3xl font-semibold leading-tight text-foreground">{rupiah(incomeTotal)}</strong>
                            </div>
                        </div>
                    </div>
                    <div className="grid px-6 pb-5 pt-2">
                        <div className="py-3">
                            <div className="flex items-center justify-between gap-4 rounded-md border border-ld bg-card px-4 py-3">
                                <span className="text-sm font-semibold text-muted-foreground">Jumlah Transaksi</span>
                                <strong className="whitespace-nowrap text-base font-semibold text-foreground">{transactionCount.toLocaleString('id-ID')} transaksi</strong>
                            </div>
                        </div>
                        <div className="py-5">
                            <IncomeDonutChart rows={[
                                { label: 'Cash', value: cashIncome, color: '#13deb9', tone: 'success' },
                                { label: 'Transfer', value: transferIncome, color: '#5d87ff', tone: 'primary' },
                                { label: 'Piutang', value: pendingIncome, color: '#f6b51e', tone: 'warning' },
                            ]} />
                        </div>
                    </div>
                </Card>

                <Card className="overflow-hidden p-0">
                    <div className="px-6 pb-4 pt-5">
                        <span className="text-xs font-bold uppercase tracking-wide text-error">Pengeluaran</span>
                        <div className="mt-3">
                            <strong className="block text-3xl font-semibold leading-tight text-error">{rupiah(expenseTotal)}</strong>
                        </div>
                    </div>
                    <div className="grid gap-5 px-6 py-5">
                        <div className="grid gap-3">
                            <div className="flex items-center justify-between gap-4 rounded-md border border-ld bg-card px-4 py-3">
                                <span className="text-sm font-semibold text-muted-foreground">Jumlah Pengeluaran</span>
                                <strong className="whitespace-nowrap text-base font-semibold text-foreground">{expenseCount.toLocaleString('id-ID')} data</strong>
                            </div>
                        </div>

                        <div className="rounded-md border border-ld bg-card px-4 py-4">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm font-semibold text-muted-foreground">Rasio biaya dari pemasukan</span>
                                <strong className="text-sm font-semibold text-warningemphasis">{expenseRatio}%</strong>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                                <span className="block h-full rounded-full bg-warning" style={{ width: `${Math.min(100, Math.max(4, expenseRatio))}%` }} />
                            </div>
                            <div className="mt-4 flex items-center justify-between gap-4 border-t border-ld pt-3">
                                <span className="text-sm font-semibold text-muted-foreground">Sisa pemasukan</span>
                                <strong className={`text-sm font-semibold ${cashFlowAfterExpense >= 0 ? 'text-successemphasis' : 'text-error'}`}>{rupiah(cashFlowAfterExpense)}</strong>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Top Pengeluaran</span>
                            {topExpenses.length ? topExpenses.map((expense, index) => (
                                <div className="flex items-center justify-between gap-3 rounded-md border border-ld bg-card px-4 py-3" key={expense.id}>
                                    <span className="min-w-0 truncate text-sm font-semibold text-muted-foreground">{index + 1}. {expense.uraian}</span>
                                    <strong className="whitespace-nowrap text-sm text-error">{rupiah(expense.amount)}</strong>
                                </div>
                            )) : <div className="rounded-md border border-dashed border-ld px-3 py-4 text-center text-sm font-semibold text-muted-foreground">Belum ada pengeluaran.</div>}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <ReportMiniMetric caption="Biaya produk terjual" icon="wallet" label="Modal" subtitle="HPP periode" value={rupiah(capitalTotal)} tone="error" />
                <ReportMiniMetric caption={`${grossMargin}% dari pemasukan`} icon="chart" label="Laba Kotor" subtitle="Sebelum pengeluaran" value={rupiah(grossProfit)} tone="success" />
                <ReportMiniMetric caption={netProfit >= 0 ? 'Sisa setelah biaya' : 'Perlu tekan biaya'} featured icon="report" label="Laba Bersih" subtitle="Setelah pengeluaran" value={rupiah(netProfit)} tone={netProfit >= 0 ? 'success' : 'error'} />
                <ReportMiniMetric caption={grossMargin >= 20 ? 'Margin sehat' : 'Margin perlu dijaga'} icon="chart" label="Margin" subtitle="Laba kotor / pemasukan" value={`${grossMargin}%`} tone="primary" progress={grossMargin} />
            </div>

            <Card className="bg-background" title="Grafik Keuangan Periode">
                <FinancialTrendChart points={props.financialChart ?? []} />
            </Card>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
                <Card className="bg-background" title="Produk Terlaris">
                    <TopProductsList products={topProducts} />
                </Card>
                <Card className="bg-background" title="Kesimpulan">
                    <div className="grid gap-3">
                        {insights.map((insight) => <div className="rounded-md border border-ld bg-card px-4 py-3 text-sm font-semibold text-muted-foreground" key={insight}>{insight}</div>)}
                    </div>
                </Card>
            </div>
        </section>
    );
}

function ReportStatRow({ label, tone = 'default', value }: { label: string; tone?: 'default' | 'primary' | 'success' | 'warning' | 'error'; value: React.ReactNode }) {
    const toneClass = {
        default: 'text-foreground',
        primary: 'text-primary',
        success: 'text-successemphasis',
        warning: 'text-warningemphasis',
        error: 'text-error',
    }[tone];

    return (
        <div className="flex items-center justify-between gap-4 py-3 text-sm">
            <span className="font-semibold text-muted-foreground">{label}</span>
            <strong className={`text-right text-base font-semibold ${toneClass}`}>{value}</strong>
        </div>
    );
}

function IncomeDonutChart({ rows }: { rows: Array<{ label: string; value: number; color: string; tone: 'primary' | 'success' | 'warning' }> }) {
    const total = rows.reduce((sum, row) => sum + Math.max(0, row.value), 0);
    let cursor = 0;
    const stops = total > 0
        ? rows.map((row) => {
            const start = cursor;
            cursor += (Math.max(0, row.value) / total) * 360;

            return `${row.color} ${start}deg ${cursor}deg`;
        }).join(', ')
        : '#334155 0deg 360deg';
    const toneClass = {
        primary: 'text-primary',
        success: 'text-successemphasis',
        warning: 'text-warningemphasis',
    };

    return (
        <div className="grid gap-5 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
            <div className="mx-auto grid size-44 place-items-center rounded-full border border-ld shadow-sm" style={{ background: `conic-gradient(${stops})` }}>
                <div className="grid size-28 place-items-center rounded-full border border-ld bg-card text-center">
                    <div>
                        <span className="block text-xs font-bold uppercase text-muted-foreground">Total</span>
                        <strong className="mt-1 block text-base font-semibold text-foreground">{rupiah(total)}</strong>
                    </div>
                </div>
            </div>
            <div className="grid gap-3">
                {rows.map((row) => {
                    const percent = total > 0 ? Math.round((Math.max(0, row.value) / total) * 100) : 0;

                    return (
                        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-ld bg-card px-3 py-2" key={row.label}>
                            <span className="size-3 rounded-full" style={{ backgroundColor: row.color }} />
                            <div className="min-w-0">
                                <strong className="block text-sm text-foreground">{row.label}</strong>
                                <span className="text-xs font-semibold text-muted-foreground">{percent}% dari pemasukan</span>
                            </div>
                            <strong className={`text-right text-sm font-semibold ${toneClass[row.tone]}`}>{rupiah(row.value)}</strong>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ReportMiniMetric({
    caption,
    featured = false,
    icon,
    label,
    progress,
    subtitle,
    tone,
    value,
}: {
    caption: string;
    featured?: boolean;
    icon: string;
    label: string;
    progress?: number;
    subtitle: string;
    tone: 'primary' | 'success' | 'error';
    value: React.ReactNode;
}) {
    const toneStyle = {
        primary: {
            backgroundImage: 'linear-gradient(135deg, rgba(93, 135, 255, 0.16), rgba(93, 135, 255, 0.03) 45%, transparent)',
            patternColor: 'rgba(93, 135, 255, 0.22)',
        },
        success: {
            backgroundImage: 'linear-gradient(135deg, rgba(19, 222, 185, 0.15), rgba(19, 222, 185, 0.03) 45%, transparent)',
            patternColor: 'rgba(19, 222, 185, 0.22)',
        },
        error: {
            backgroundImage: 'linear-gradient(135deg, rgba(250, 91, 93, 0.15), rgba(250, 91, 93, 0.03) 45%, transparent)',
            patternColor: 'rgba(250, 91, 93, 0.22)',
        },
    }[tone];
    const toneClass = {
        primary: 'text-primary',
        success: 'text-successemphasis',
        error: 'text-error',
    }[tone];
    const accentClass = {
        primary: 'bg-primary',
        success: 'bg-success',
        error: 'bg-error',
    }[tone];
    const iconClass = {
        primary: 'bg-lightprimary text-primary',
        success: 'bg-lightsuccess text-successemphasis',
        error: 'bg-lighterror text-error',
    }[tone];
    const pillClass = {
        primary: 'bg-lightprimary text-primary',
        success: 'bg-lightsuccess text-successemphasis',
        error: 'bg-lighterror text-error',
    }[tone];
    const progressWidth = typeof progress === 'number' ? Math.min(100, Math.max(0, progress)) : null;

    return (
        <article className={`group relative grid min-h-40 overflow-hidden rounded-md border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg ${featured ? 'border-primary/60 shadow-primary/10' : 'border-ld'}`} style={{ backgroundImage: toneStyle.backgroundImage }}>
            <span className={`absolute inset-x-0 top-0 h-1 ${accentClass}`} aria-hidden="true" />
            <span
                className="pointer-events-none absolute right-5 top-5 h-20 w-20 opacity-25"
                style={{
                    backgroundImage: `linear-gradient(${toneStyle.patternColor} 1px, transparent 1px), linear-gradient(90deg, ${toneStyle.patternColor} 1px, transparent 1px)`,
                    backgroundSize: '14px 14px',
                }}
                aria-hidden="true"
            />
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${pillClass}`}>{label}</span>
                    <span className="mt-1 block text-xs font-semibold text-muted-foreground">{subtitle}</span>
                </div>
                <span className={`relative grid size-11 shrink-0 place-items-center rounded-md ${iconClass} shadow-sm [&_svg]:size-5`}>
                    <NavIcon name={icon} />
                </span>
            </div>
            <div className="relative mt-6">
                <strong className={`block break-words text-[1.75rem] font-semibold leading-9 ${toneClass}`}>{value}</strong>
                <div className="mt-5 flex min-h-10 items-center justify-between gap-3 rounded-md border border-ld bg-background/45 px-3 py-2">
                    <span className="text-xs font-semibold text-muted-foreground">{caption}</span>
                    {progressWidth === null && <span className={`size-2.5 shrink-0 rounded-full ${accentClass}`} aria-hidden="true" />}
                    {progressWidth !== null && <strong className={`shrink-0 text-xs font-bold ${toneClass}`}>{progressWidth}%</strong>}
                </div>
                {progressWidth !== null && (
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                        <span className={`block h-full rounded-full ${accentClass}`} style={{ width: `${progressWidth}%` }} />
                    </div>
                )}
            </div>
        </article>
    );
}

function TopProductsList({ products }: { products: ProductSalesPoint[] }) {
    const maxQty = Math.max(...products.map((product) => product.qty), 1);

    if (!products.length) {
        return <p className="text-sm font-medium text-muted-foreground">Belum ada produk terjual pada periode ini.</p>;
    }

    return (
        <div className="grid gap-3">
            {products.map((product, index) => (
                <div className="grid gap-3 rounded-md border border-ld bg-card px-4 py-3" key={product.name}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <span className="text-xs font-bold uppercase text-primary">#{index + 1}</span>
                            <strong className="mt-1 block truncate text-sm text-foreground">{product.name}</strong>
                        </div>
                        <div className="text-right">
                            <strong className="block text-sm text-foreground">{rupiah(product.total)}</strong>
                            <span className="text-xs font-semibold text-muted-foreground">{product.qty.toLocaleString('id-ID')} terjual</span>
                        </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.max(8, (product.qty / maxQty) * 100)}%` }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

function FinancialTrendChart({ points }: { points: FinancialChartPoint[] }) {
    const safePoints = points.length ? points : [{ label: '-', income: 0, expense: 0, capital: 0, gross_profit: 0, net_profit: 0 }];
    const id = useId().replace(/:/g, '');
    const incomeGradientId = `financial-income-${id}`;
    const profitGradientId = `financial-profit-${id}`;
    const chartSeries: Array<{ key: keyof Omit<FinancialChartPoint, 'label'>; label: string; color: string; dash?: string; muted?: boolean }> = [
        { key: 'income', label: 'Pemasukan', color: '#5d87ff' },
        { key: 'expense', label: 'Pengeluaran', color: '#fa5a5c', dash: '8 8', muted: true },
        { key: 'capital', label: 'Modal', color: '#f6b51e', dash: '4 7', muted: true },
        { key: 'gross_profit', label: 'Laba Kotor', color: '#13deb9' },
        { key: 'net_profit', label: 'Laba Bersih', color: '#38bdf8' },
    ];
    const allValues = chartSeries.flatMap((series) => safePoints.map((point) => Number(point[series.key] ?? 0)));
    const high = Math.max(...allValues, 0, 1);
    const low = Math.min(...allValues, 0);
    const range = Math.max(high - low, 1);
    const width = 760;
    const heightSvg = 330;
    const left = 70;
    const right = 24;
    const top = 34;
    const bottom = 270;
    const height = bottom - top;
    const xFor = (index: number) => safePoints.length === 1 ? left + ((width - left - right) / 2) : left + (index / (safePoints.length - 1)) * (width - left - right);
    const yFor = (value: number) => bottom - ((value - low) / range) * height;
    const coordinatesFor = (key: keyof Omit<FinancialChartPoint, 'label'>) => safePoints.map((point, index) => ({
        label: point.label,
        value: Number(point[key] ?? 0),
        x: xFor(index),
        y: yFor(Number(point[key] ?? 0)),
    }));
    const smoothPath = (coordinates: Array<{ x: number; y: number }>) => coordinates.reduce((path, point, index) => {
        if (index === 0) {
            return `M ${point.x} ${point.y}`;
        }

        const previous = coordinates[index - 1];
        const midpoint = (previous.x + point.x) / 2;

        return `${path} C ${midpoint} ${previous.y}, ${midpoint} ${point.y}, ${point.x} ${point.y}`;
    }, '');
    const baselineY = yFor(0);
    const incomeCoordinates = coordinatesFor('income');
    const netProfitCoordinates = coordinatesFor('net_profit');
    const incomePath = smoothPath(incomeCoordinates);
    const netProfitPath = smoothPath(netProfitCoordinates);
    const incomeArea = `${incomePath} L ${xFor(safePoints.length - 1)} ${baselineY} L ${xFor(0)} ${baselineY} Z`;
    const profitArea = `${netProfitPath} L ${xFor(safePoints.length - 1)} ${baselineY} L ${xFor(0)} ${baselineY} Z`;
    const totals = chartSeries.map((series) => ({
        ...series,
        value: safePoints.reduce((sum, point) => sum + Number(point[series.key] ?? 0), 0),
    }));
    const tickValues = [1, 0.75, 0.5, 0.25, 0].map((ratio) => Math.max(0, high * ratio));
    const axisLabelStep = Math.max(1, Math.ceil(safePoints.length / 7));
    const axisLabels = safePoints
        .map((point, index) => ({ ...point, index }))
        .filter((_, index) => index === 0 || index === safePoints.length - 1 || index % axisLabelStep === 0);
    const activePointIndexes = safePoints
        .map((point, index) => ({ index, hasValue: chartSeries.some((series) => Number(point[series.key] ?? 0) !== 0) }))
        .filter((point) => point.hasValue)
        .map((point) => point.index);

    return (
        <div className="grid gap-5">
            <div className="flex flex-wrap gap-2">
                {chartSeries.map((series) => (
                    <span className="inline-flex h-8 items-center gap-2 rounded-md bg-background/50 px-3 text-xs font-bold text-muted-foreground" key={series.key}>
                        <i className="h-1.5 w-5 rounded-full" style={{ backgroundColor: series.color }} />
                        {series.label}
                    </span>
                ))}
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
                <div className="overflow-hidden rounded-md border border-ld bg-background/35 p-4">
                    <svg className="h-[360px] w-full overflow-visible" viewBox={`0 0 ${width} ${heightSvg}`} preserveAspectRatio="none" aria-hidden="true">
                        <defs>
                            <linearGradient id={incomeGradientId} x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#5d87ff" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#5d87ff" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id={profitGradientId} x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.16" />
                                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <rect x={left} y={top} width={width - left - right} height={height} fill="transparent" />
                        {tickValues.map((value) => {
                            const y = yFor(value);

                            return (
                                <g key={value}>
                                    <line className="stroke-border" x1={left} x2={width - right} y1={y} y2={y} strokeDasharray="5 7" vectorEffect="non-scaling-stroke" />
                                    <text className="fill-muted-foreground text-[11px] font-bold" x={left - 12} y={y + 4} textAnchor="end">{rupiahCompact(Math.round(value))}</text>
                                </g>
                            );
                        })}
                        <line className="stroke-muted-foreground/40" x1={left} x2={width - right} y1={baselineY} y2={baselineY} strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />
                        <path d={incomeArea} fill={`url(#${incomeGradientId})`} />
                        <path d={profitArea} fill={`url(#${profitGradientId})`} />
                        {chartSeries.map((series) => (
                            <path
                                d={smoothPath(coordinatesFor(series.key))}
                                fill="none"
                                key={series.key}
                                opacity={series.muted ? 0.72 : 1}
                                stroke={series.color}
                                strokeDasharray={series.dash}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={series.key === 'income' || series.key === 'net_profit' ? 3.4 : 2.4}
                                vectorEffect="non-scaling-stroke"
                            />
                        ))}
                        {activePointIndexes.map((index) => {
                            const point = netProfitCoordinates[index];

                            return <circle className="fill-card" key={`${point.label}-${index}`} cx={point.x} cy={point.y} r="4.2" stroke="#38bdf8" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />;
                        })}
                        {axisLabels.map((point) => <text className="fill-muted-foreground text-[11px] font-bold" key={point.label} x={xFor(point.index)} y={heightSvg - 15} textAnchor="middle">{point.label}</text>)}
                    </svg>
                </div>

                <div className="rounded-md border border-ld bg-background/35 p-4">
                    <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Total periode</span>
                    <div className="mt-4 grid gap-3">
                        {totals.map((series) => (
                            <div className="flex items-center justify-between gap-3 rounded-md bg-card/50 px-3 py-2" key={series.key}>
                                    <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-muted-foreground">
                                        <i className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: series.color }} />
                                        <span className="truncate">{series.label}</span>
                                    </span>
                                    <strong className="whitespace-nowrap text-sm text-foreground">{rupiah(series.value)}</strong>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StockOpnamePage({ props }: { props: AppProps }) {
    const [showCreate, setShowCreate] = useState(false);
    const [editingRow, setEditingRow] = useState<StockOpnameRow | null>(null);
    const [query, setQuery] = useState('');
    const { sortDirection, sortKey, toggleSort } = useTableSort<'date' | 'user' | 'product' | 'system' | 'actual' | 'difference' | 'reason'>('date', 'desc');
    const rows: StockOpnameRow[] = props.stockOpnames.flatMap((opname) => opname.adjustments.map((adjustment) => ({
        ...adjustment,
        row_id: `${opname.id}-${adjustment.id}`,
        adjustment_id: adjustment.id,
        opname_id: opname.id,
        date: opname.date,
        date_input: opname.date_input,
        update_url: opname.update_url,
        destroy_url: opname.destroy_url,
        user: opname.user,
    })));
    const showForm = showCreate || editingRow !== null;
    const filteredRows = rows.filter((row) => matchesSearchText(`${row.date} ${row.user} ${row.product} ${row.reason ?? ''}`, query));
    const sortedRows = [...filteredRows].sort((first, second) => {
        const value = sortKey === 'user'
            ? compareText(first.user, second.user)
            : sortKey === 'product'
                ? compareText(first.product, second.product)
                : sortKey === 'system'
                    ? compareNumber(first.system_stock, second.system_stock)
                    : sortKey === 'actual'
                        ? compareNumber(first.actual_stock, second.actual_stock)
                        : sortKey === 'difference'
                            ? compareNumber(first.difference, second.difference)
                            : sortKey === 'reason'
                                ? compareText(first.reason, second.reason)
                                : parseDateForSort(first.date) - parseDateForSort(second.date);

        return withSortDirection(value, sortDirection);
    });

    return (
        <section className="grid gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold leading-8 text-foreground">{editingRow ? 'Edit Stok Opname' : showCreate ? 'Tambah Stok Opname' : 'Stok Opname'}</h1>
                    <p className="text-sm text-muted-foreground">{editingRow ? 'Perbarui hasil hitung stok fisik dan alasan penyesuaian.' : showCreate ? 'Catat hasil hitung stok fisik dan alasan penyesuaian.' : 'Sesuaikan stok sistem dengan stok fisik.'}</p>
                </div>
                <Button className="self-start" variant={showForm ? 'soft' : 'primary'} onClick={() => {
                    if (showForm) {
                        setShowCreate(false);
                        setEditingRow(null);
                    } else {
                        setShowCreate(true);
                    }
                }}>{showForm ? 'Kembali' : 'Tambah'}</Button>
            </div>

            {showForm && <Card className="gap-0 overflow-hidden p-0">
                <FormStack key={editingRow?.row_id ?? 'new-opname'} as="form" method="POST" action={editingRow?.update_url ?? props.routes.stockOpnamesStore ?? ''} className="gap-4 px-6 py-6">
                    <input type="hidden" name="_token" value={props.csrf} />
                    {editingRow && <input type="hidden" name="_method" value="PUT" />}
                    {editingRow && <input type="hidden" name="adjustment_id" value={editingRow.adjustment_id} />}
                    <CanvasFormRow label="Tanggal" required>
                        <EditableDateInput name="opname_date" defaultValue={editingRow?.date_input ?? todayInputDate()} label="Tanggal stok opname" required />
                    </CanvasFormRow>
                    <CanvasFormRow label="Produk" required>
                        <select name="product_id" defaultValue={editingRow?.product_id ?? ''} required>
                            <option value="" disabled>Pilih produk</option>
                            {props.products.map((product) => <option key={product.id} value={product.id}>{product.nama_barang} - sistem {product.stok}</option>)}
                        </select>
                    </CanvasFormRow>
                    <CanvasFormRow label="Stok Fisik" required>
                        <input name="actual_stock" type="number" min={0} required defaultValue={editingRow?.actual_stock} placeholder="Masukan stok fisik" />
                    </CanvasFormRow>
                    <CanvasFormRow label="Alasan" required>
                        <input name="reason" required defaultValue={editingRow?.reason ?? ''} placeholder="Masukan alasan penyesuaian" />
                    </CanvasFormRow>
                    <div className="grid gap-3 pt-2 md:grid-cols-[220px_minmax(0,1fr)]">
                        <span className="hidden md:block" />
                        <div className="flex flex-wrap gap-2">
                            <Button variant="primary" type="submit">Simpan</Button>
                            <Button variant="soft" onClick={() => { setShowCreate(false); setEditingRow(null); }}>Batal</Button>
                        </div>
                    </div>
                </FormStack>
            </Card>}

            {!showForm && <Card>
                <div className="mb-5 flex h-10 items-center gap-3 rounded-md border border-ld bg-card px-4 focus-within:border-primary">
                    <svg className="size-5 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
                    <input className="min-h-10 w-full border-0 bg-transparent text-sm text-foreground outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari tanggal, pengguna, produk, atau alasan..." aria-label="Cari stok opname" />
                </div>
                <DataTable className="[&_table]:min-w-[900px] [&_td]:py-5 [&_th]:!text-center [&_th]:text-foreground">
                    <table>
                        <thead><tr><th><SortableHeader column="date" label="Tanggal" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th><th><SortableHeader column="user" label="Pengguna" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th><th><SortableHeader column="product" label="Produk" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th><th><SortableHeader column="system" label="Stok Sistem" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th><th><SortableHeader column="actual" label="Stok Fisik" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th><th><SortableHeader column="difference" label="Selisih" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th><th><SortableHeader column="reason" label="Alasan" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th><th className="w-24">Aksi</th></tr></thead>
                        <tbody>{sortedRows.length ? sortedRows.map((row) => <tr key={row.row_id}><td>{row.date}</td><td>{row.user}</td><td className="!text-left"><strong className="text-foreground">{row.product}</strong></td><td>{row.system_stock}</td><td>{row.actual_stock}</td><td className={row.difference === 0 ? 'text-foreground' : 'font-bold text-error'}>{row.difference}</td><td className="!text-left text-muted-foreground">{row.reason || '-'}</td><td><div className="flex items-center justify-center gap-1">{row.update_url && <button className="grid size-8 place-items-center rounded-full text-primary transition hover:bg-lightprimary [&_svg]:size-4" type="button" title={`Edit stok opname ${row.product}`} aria-label={`Edit stok opname ${row.product}`} onClick={() => setEditingRow(row)}><NavIcon name="edit" /></button>}{row.destroy_url && <button className="grid size-8 place-items-center rounded-full text-error transition hover:bg-lighterror [&_svg]:size-4" type="button" title={`Hapus stok opname ${row.product}`} aria-label={`Hapus stok opname ${row.product}`} onClick={() => { if (window.confirm(`Hapus stok opname ${row.product}? Stok produk akan disesuaikan kembali.`)) postForm(row.destroy_url, props.csrf, { _method: 'DELETE' }); }}><NavIcon name="trash" /></button>}</div></td></tr>) : <tr><td className="text-center text-muted-foreground" colSpan={8}>Belum ada stok opname.</td></tr>}</tbody>
                    </table>
                </DataTable>
                <p className="mt-3 text-sm text-muted-foreground">Menampilkan {filteredRows.length} dari {rows.length} data</p>
            </Card>}
        </section>
    );
}

function auditActionLabel(action: string) {
    const labels: Record<string, string> = {
        'auth.login_failed': 'Login gagal',
        'auth.login_success': 'Login berhasil',
        'user.profile_updated': 'Profil akun diperbarui',
        'user.password_updated': 'Kata sandi diperbarui',
        'user.created': 'Pengguna dibuat',
        'user.updated': 'Pengguna diperbarui',
        'user.password_reset': 'Kata sandi pengguna direset',
        'category.created': 'Kategori dibuat',
        'category.updated': 'Kategori diperbarui',
        'category.deleted': 'Kategori dihapus',
        'product.created': 'Produk dibuat',
        'product.updated': 'Produk diperbarui',
        'product.deleted': 'Produk dihapus',
        'product.inactivated': 'Produk dinonaktifkan',
        'supplier.created': 'Suplier dibuat',
        'supplier.updated': 'Suplier diperbarui',
        'supplier.deleted': 'Suplier dihapus',
        'stock_in.created': 'Pembelian stok dibuat',
        'stock_in.updated': 'Pembelian stok diperbarui',
        'stock_in.deleted': 'Pembelian stok dihapus',
        'stock_opname.updated': 'Stok opname diperbarui',
        'stock_opname.deleted': 'Stok opname dihapus',
        'stock_in.document_viewed': 'Dokumen pembelian dilihat',
        'stock_opname.completed': 'Stok opname disimpan',
        'transaction.created': 'Transaksi dibuat',
        'transaction.updated': 'Transaksi diperbarui',
        'transaction.voided': 'Transaksi dihapus',
        'transaction.settled': 'Transaksi dilunasi',
        'payment_transfer.verified': 'Transfer diverifikasi',
        'expense.created': 'Pengeluaran dibuat',
        'expense.updated': 'Pengeluaran diperbarui',
        'expense.deleted': 'Pengeluaran dihapus',
        'expense.printed': 'Laporan pengeluaran dicetak',
        'expense.attachment_viewed': 'Bukti pengeluaran dilihat',
        'cashier_shift.opened': 'Shift kasir dibuka',
        'cashier_shift.closed': 'Shift kasir ditutup',
    };

    return labels[action] ?? action.replaceAll('_', ' ').replaceAll('.', ' - ');
}

function AuditLoginPage({ props }: { props: AppProps }) {
    const { sortDirection, sortKey, toggleSort } = useTableSort<'time' | 'user' | 'activity'>('time', 'desc');
    const sortedLogs = [...props.auditLogs].sort((first, second) => {
        const value = sortKey === 'user'
            ? compareText(first.user, second.user)
            : sortKey === 'activity'
                ? compareText(auditActionLabel(first.action), auditActionLabel(second.action))
                : parseDateForSort(first.time) - parseDateForSort(second.time);

        return withSortDirection(value, sortDirection);
    });

    return (
        <section className="grid gap-6">
            <div><h1 className="text-2xl font-semibold leading-8 text-foreground">Audit Login</h1><p className="text-sm text-muted-foreground">Riwayat aktivitas pengguna dan perubahan data.</p></div>
            <Card title="Daftar Audit">
                <DataTable className="[&_table]:min-w-[760px] [&_td]:py-5 [&_th]:!text-center [&_th]:text-foreground">
                    <table>
                        <thead><tr><th><SortableHeader column="time" label="Waktu" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th><th><SortableHeader column="user" label="Pengguna" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th><th><SortableHeader column="activity" label="Aktivitas" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th></tr></thead>
                        <tbody>{sortedLogs.length ? sortedLogs.map((log) => <tr key={log.id}><td>{log.time}</td><td className="!text-left"><strong className="text-foreground">{log.user}</strong></td><td className="!text-left text-muted-foreground">{auditActionLabel(log.action)}</td></tr>) : <tr><td className="text-center text-muted-foreground" colSpan={3}>Belum ada aktivitas audit.</td></tr>}</tbody>
                    </table>
                </DataTable>
                <ServerPagination meta={props.pagination.auditLogs} />
            </Card>
        </section>
    );
}

function ReportLineChart({ points }: { points: Array<{ label: string; value: number }> }) {
    const safePoints = points.length ? points : [{ label: '-', value: 0 }];
    const gradientId = `report-area-${useId().replace(/:/g, '')}`;
    const values = safePoints.map((point) => point.value);
    const high = Math.max(...values);
    const low = Math.min(...values);
    const max = Math.max(high, 0, 1);
    const min = Math.min(low, 0);
    const range = Math.max(max - min, 1);
    const baselineY = 48 - ((0 - min) / range) * 38;
    const coordinates = safePoints.map((point, index) => {
        const x = safePoints.length === 1 ? 50 : (index / (safePoints.length - 1)) * 100;
        const y = 48 - ((point.value - min) / range) * 38;

        return { ...point, x, y };
    });
    const pointString = coordinates.map((point) => `${point.x},${point.y}`).join(' ');
    const areaString = `0,${baselineY} ${pointString} 100,${baselineY}`;

    return (
        <div className="relative overflow-hidden rounded-md border border-ld bg-card p-4">
            <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Nilai tertinggi</span>
                    <strong className="mt-1 block text-lg font-semibold text-foreground">{rupiah(high)}</strong>
                </div>
                <span className="rounded-md bg-lightprimary px-3 py-1 text-xs font-bold text-primary">{safePoints.length} titik</span>
            </div>
            <svg className="h-64 w-full overflow-visible" viewBox="0 0 100 52" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                    <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#5d87ff" stopOpacity="0.34" />
                        <stop offset="100%" stopColor="#5d87ff" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {[12, 24, 36, 48].map((y) => <line className="stroke-border" key={y} x1="0" x2="100" y1={y} y2={y} strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />)}
                {min < 0 && max > 0 && <line className="stroke-muted-foreground/40" x1="0" x2="100" y1={baselineY} y2={baselineY} strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />}
                <polygon fill={`url(#${gradientId})`} points={areaString} />
                <polyline className="fill-none stroke-primary" points={pointString} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.7" vectorEffect="non-scaling-stroke" />
                {coordinates.map((point) => <circle className="fill-card stroke-primary" key={`${point.label}-${point.x}`} cx={point.x} cy={point.y} r="1.7" strokeWidth="1.7" vectorEffect="non-scaling-stroke" />)}
            </svg>
            <div className="mt-4 grid grid-flow-col justify-between gap-3 text-xs font-bold text-muted-foreground">{coordinates.map((point) => <span className="truncate" key={point.label}>{point.label}</span>)}</div>
        </div>
    );
}

function PaymentDonut({ rows }: { rows: Array<{ label: string; value: number; color: string }> }) {
    const total = Math.max(rows.reduce((sum, row) => sum + row.value, 0), 1);
    let cursor = 0;
    const stops = rows.map((row) => {
        const start = cursor;
        cursor += (row.value / total) * 360;

        return `${row.color} ${start}deg ${cursor}deg`;
    }).join(', ');

    return (
        <div className="grid gap-5 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center xl:grid-cols-1">
            <div className="mx-auto grid size-40 place-items-center rounded-full" style={{ background: `conic-gradient(${stops})` }}>
                <div className="grid size-24 place-items-center rounded-full bg-card text-center shadow-sm"><strong className="text-xl leading-6 text-foreground">{total}</strong></div>
            </div>
            <div className="grid gap-3">
                {rows.map((row) => <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-ld bg-card px-3 py-2" key={row.label}><span className="size-3 rounded-full" style={{ background: row.color }} /><b className="text-sm text-foreground">{row.label}</b><strong className="text-sm text-muted-foreground">{row.value} ({Math.round((row.value / total) * 100)}%)</strong></div>)}
            </div>
        </div>
    );
}

function ComparisonBars({ expense, expenseLabel = 'Pengeluaran', income, incomeLabel = 'Pendapatan' }: { expense: number; expenseLabel?: string; income: number; incomeLabel?: string }) {
    const max = Math.max(Math.abs(income), Math.abs(expense), 1);

    return (
        <div className="grid gap-4">
            {[{ label: incomeLabel, value: income, color: 'bg-primary' }, { label: expenseLabel, value: expense, color: expense >= 0 ? 'bg-error' : 'bg-warning' }].map((row) => <div className="grid gap-2 md:grid-cols-[140px_minmax(0,1fr)_160px] md:items-center" key={row.label}><span className="text-sm font-bold text-foreground">{row.label}</span><div className="h-4 overflow-hidden rounded-full bg-muted"><i className={`block h-full rounded-full ${row.color}`} style={{ width: `${Math.max(4, (Math.abs(row.value) / max) * 100)}%` }} /></div><strong className="text-sm text-foreground md:text-right">{rupiah(row.value)}</strong></div>)}
        </div>
    );
}

function ExpenseCategoryChart({ expenses }: { expenses: Expense[] }) {
    const grouped = expenses.reduce<Record<string, number>>((carry, expense) => {
        const label = expense.uraian || expense.description;
        carry[label] = (carry[label] ?? 0) + expense.amount;

        return carry;
    }, {});
    const rows = Object.entries(grouped).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
    const max = Math.max(...rows.map((row) => row.value), 1);

    return (
        <div className="grid gap-4">
            {rows.length ? rows.map((row) => <div className="grid gap-2 md:grid-cols-[180px_minmax(0,1fr)_160px] md:items-center" key={row.label}><span className="text-sm font-bold text-foreground">{row.label}</span><div className="h-4 overflow-hidden rounded-full bg-muted"><i className="block h-full rounded-full bg-error" style={{ width: `${Math.max(4, (row.value / max) * 100)}%` }} /></div><strong className="text-sm text-foreground md:text-right">{rupiah(row.value)}</strong></div>) : <p className="text-sm text-muted-foreground">Belum ada pengeluaran pada periode ini.</p>}
        </div>
    );
}

function StoreSettings({ props }: { props: AppProps }) {
    const initialTab = props.settingsTab === 'receipt' || props.settingsTab === 'users' || props.settingsTab === 'data' ? props.settingsTab : 'profile';
    const [tab, setTab] = useState<'profile' | 'receipt' | 'users' | 'data'>(initialTab);
    const [receiptDraft, setReceiptDraft] = useState<ReceiptSettings>(props.receiptSettings);
    const [editingCashier, setEditingCashier] = useState<Cashier | null>(null);
    const { sortDirection: cashierSortDirection, sortKey: cashierSortKey, toggleSort: toggleCashierSort } = useTableSort<'name' | 'username' | 'role' | 'status' | 'sales'>('name');
    const settingsTabs = [
        { id: 'profile' as const, label: 'Profil Toko' },
        { id: 'receipt' as const, label: 'Format Struk' },
        { id: 'users' as const, label: 'Pengguna' },
        { id: 'data' as const, label: 'Keamanan & Data' },
    ];
    const updateReceiptDraft = (key: keyof ReceiptSettings, value: string) => {
        setReceiptDraft((current) => ({ ...current, [key]: value }));
    };
    const sortedCashiers = [...props.cashiers].sort((first, second) => {
        const value = cashierSortKey === 'username'
            ? compareText(first.username, second.username)
            : cashierSortKey === 'role'
                ? compareText(first.role, second.role)
                : cashierSortKey === 'status'
                    ? compareText(first.status, second.status)
                    : cashierSortKey === 'sales'
                        ? compareNumber(first.today_sales, second.today_sales)
                        : compareText(first.name, second.name);

        return withSortDirection(value, cashierSortDirection);
    });

    return (
        <section className="grid gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold leading-8 text-foreground">Pengaturan Toko</h1>
                    <p className="text-sm leading-5 text-muted-foreground">Kelola identitas toko, format struk, pengguna, dan keamanan akun.</p>
                </div>
                <Badge className="rounded-full px-3 py-1" variant="green">Akses Admin</Badge>
            </div>
            <Tabs className="w-full justify-start overflow-x-auto border-b border-ld bg-transparent p-0 pb-3 dark:bg-transparent" active={tab} items={settingsTabs} onChange={setTab} />

                {tab === 'profile' && <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
                    <Card className="bg-background" title="Identitas Toko">
                        <p className="-mt-3 text-sm leading-5 text-muted-foreground">Data ini digunakan sebagai identitas utama pada struk transaksi.</p>
                        <FormStack as="form" method="POST" action={props.routes.receiptSettingsUpdate ?? ''}>
                            <input type="hidden" name="_token" value={props.csrf} />
                            <input type="hidden" name="_method" value="PUT" />
                            <input type="hidden" name="settings_tab" value="profile" />
                            <input type="hidden" name="receipt_footer_line_1" value={receiptDraft.receipt_footer_line_1} />
                            <input type="hidden" name="receipt_footer_line_2" value={receiptDraft.receipt_footer_line_2} />
                            <input type="hidden" name="receipt_footer_line_3" value={receiptDraft.receipt_footer_line_3} />
                            <input type="hidden" name="receipt_paper_width" value={receiptDraft.receipt_paper_width} />
                            <input type="hidden" name="receipt_show_cashier" value={receiptDraft.receipt_show_cashier} />
                            <input type="hidden" name="receipt_show_customer" value={receiptDraft.receipt_show_customer} />
                            <input type="hidden" name="receipt_show_payment" value={receiptDraft.receipt_show_payment} />
                            <Field label="Nama toko"><input name="receipt_store_name" value={receiptDraft.receipt_store_name} onChange={(event) => updateReceiptDraft('receipt_store_name', event.target.value)} required /></Field>
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Alamat baris 1"><input name="receipt_address_line_1" value={receiptDraft.receipt_address_line_1} onChange={(event) => updateReceiptDraft('receipt_address_line_1', event.target.value)} placeholder="Contoh: Tegal - Jawa Tengah" /></Field>
                                <Field label="Alamat baris 2"><input name="receipt_address_line_2" value={receiptDraft.receipt_address_line_2} onChange={(event) => updateReceiptDraft('receipt_address_line_2', event.target.value)} placeholder="Contoh: Jl. Raya Tegalwangi" /></Field>
                            </div>
                            <Field className="md:max-w-md" label="Nomor telepon"><input name="receipt_phone" value={receiptDraft.receipt_phone} onChange={(event) => updateReceiptDraft('receipt_phone', event.target.value)} placeholder="Contoh: 0852-3699-1848" /></Field>
                            <div className="flex justify-end border-t border-ld pt-5">
                                <Button variant="primary" type="submit">Simpan Identitas</Button>
                            </div>
                        </FormStack>
                    </Card>
                    <Card className="bg-background" title="Profil Administrator">
                        <div className="-mt-2 flex items-center gap-3 border-b border-ld pb-5">
                            <span className="grid size-11 shrink-0 place-items-center rounded-md bg-lightprimary text-base font-semibold text-primary">{props.user.name.slice(0, 1).toUpperCase()}</span>
                            <div className="min-w-0">
                                <strong className="block truncate text-sm text-foreground">{props.user.name}</strong>
                                <span className="block truncate text-xs text-muted-foreground">{props.user.username}</span>
                            </div>
                        </div>
                        <FormStack as="form" method="POST" action={props.routes.profileUpdate ?? ''}>
                            <input type="hidden" name="_token" value={props.csrf} />
                            <input type="hidden" name="_method" value="PUT" />
                            <Field label="Nama"><input name="name" defaultValue={props.user.name} required /></Field>
                            <Field label="Nama pengguna"><input name="username" defaultValue={props.user.username} required /></Field>
                            <Field label="Email"><input name="email" type="email" defaultValue={props.user.email} required /></Field>
                            <div className="flex justify-end border-t border-ld pt-5">
                                <Button variant="primary" type="submit">Simpan Profil</Button>
                            </div>
                        </FormStack>
                    </Card>
                </div>}

                {tab === 'receipt' && <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
                    <Card className="bg-background" title="Format Struk Thermal">
                        <FormStack as="form" method="POST" action={props.routes.receiptSettingsUpdate ?? ''}>
                            <input type="hidden" name="_token" value={props.csrf} />
                            <input type="hidden" name="_method" value="PUT" />
                            <input type="hidden" name="settings_tab" value="receipt" />
                            <div className="grid gap-1 border-b border-ld pb-3">
                                <strong className="text-sm text-foreground">Header struk</strong>
                                <span className="text-xs text-muted-foreground">Identitas toko yang dicetak di bagian paling atas.</span>
                            </div>
                            <div className="grid gap-4 lg:grid-cols-2">
                                <Field label="Nama toko"><input name="receipt_store_name" value={receiptDraft.receipt_store_name} onChange={(event) => updateReceiptDraft('receipt_store_name', event.target.value)} required /></Field>
                                <Field label="Nomor telepon"><input name="receipt_phone" value={receiptDraft.receipt_phone} onChange={(event) => updateReceiptDraft('receipt_phone', event.target.value)} placeholder="Contoh: 0852-3699-1848" /></Field>
                            </div>
                            <Field label="Alamat baris 1"><input name="receipt_address_line_1" value={receiptDraft.receipt_address_line_1} onChange={(event) => updateReceiptDraft('receipt_address_line_1', event.target.value)} placeholder="Contoh: Tegal - Jawa Tengah" /></Field>
                            <Field label="Alamat baris 2"><input name="receipt_address_line_2" value={receiptDraft.receipt_address_line_2} onChange={(event) => updateReceiptDraft('receipt_address_line_2', event.target.value)} placeholder="Contoh: Jl. Raya Tegalwangi" /></Field>
                            <div className="mt-2 grid gap-1 border-b border-ld pb-3">
                                <strong className="text-sm text-foreground">Footer struk</strong>
                                <span className="text-xs text-muted-foreground">Pesan penutup yang dicetak setelah ringkasan pembayaran.</span>
                            </div>
                            <div className="grid gap-4 lg:grid-cols-3">
                                <Field label="Footer 1"><input name="receipt_footer_line_1" value={receiptDraft.receipt_footer_line_1} onChange={(event) => updateReceiptDraft('receipt_footer_line_1', event.target.value)} /></Field>
                                <Field label="Footer 2"><input name="receipt_footer_line_2" value={receiptDraft.receipt_footer_line_2} onChange={(event) => updateReceiptDraft('receipt_footer_line_2', event.target.value)} /></Field>
                                <Field label="Footer 3"><input name="receipt_footer_line_3" value={receiptDraft.receipt_footer_line_3} onChange={(event) => updateReceiptDraft('receipt_footer_line_3', event.target.value)} /></Field>
                            </div>
                            <div className="mt-2 grid gap-1 border-b border-ld pb-3">
                                <strong className="text-sm text-foreground">Ukuran dan isi</strong>
                                <span className="text-xs text-muted-foreground">Sesuaikan lebar kertas dan informasi transaksi yang ditampilkan.</span>
                            </div>
                            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                                <Field label="Lebar struk"><select name="receipt_paper_width" value={receiptDraft.receipt_paper_width} onChange={(event) => updateReceiptDraft('receipt_paper_width', event.target.value)}><option value="32">58mm - 32 karakter</option><option value="42">80mm - 42 karakter</option></select></Field>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <SettingsToggle name="receipt_show_cashier" title="Kasir" description="Tampil di struk" checked={receiptDraft.receipt_show_cashier === '1'} onChange={(checked) => updateReceiptDraft('receipt_show_cashier', checked ? '1' : '0')} />
                                    <SettingsToggle name="receipt_show_customer" title="Pembeli" description="Jika diisi" checked={receiptDraft.receipt_show_customer === '1'} onChange={(checked) => updateReceiptDraft('receipt_show_customer', checked ? '1' : '0')} />
                                    <SettingsToggle name="receipt_show_payment" title="Pembayaran" description="Metode dan kembali" checked={receiptDraft.receipt_show_payment === '1'} onChange={(checked) => updateReceiptDraft('receipt_show_payment', checked ? '1' : '0')} />
                                </div>
                            </div>
                            <div className="flex justify-end border-t border-ld pt-5">
                                <Button variant="primary" type="submit">Simpan Format Struk</Button>
                            </div>
                        </FormStack>
                    </Card>
                    <Card className="bg-background xl:sticky xl:top-24" title="Preview Struk">
                        <ReceiptSettingsPreview settings={receiptDraft} cashier={props.user.name} />
                        <div className="mt-5 flex items-center justify-between gap-4 border-t border-ld pt-5">
                            <span className="text-sm font-medium text-muted-foreground">Ukuran aktif</span>
                            <Badge variant="blue">{receiptDraft.receipt_paper_width === '42' ? '80mm' : '58mm'}</Badge>
                        </div>
                    </Card>
                </div>}

                {tab === 'users' && <div className="grid items-start gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
                    <Card className="bg-background xl:sticky xl:top-24" title={editingCashier ? 'Edit Pengguna' : 'Tambah Pengguna'}>
                        <p className="-mt-3 text-sm text-muted-foreground">{editingCashier ? `Perbarui akun ${editingCashier.name}.` : 'Buat akun admin atau kasir baru.'}</p>
                        <FormStack key={editingCashier?.id ?? 'new-user'} as="form" method="POST" action={editingCashier?.update_url ?? props.routes.cashiersStore ?? ''}>
                            <input type="hidden" name="_token" value={props.csrf} />
                            {editingCashier && <input type="hidden" name="_method" value="PUT" />}
                            <Field label="Nama">
                                <input name="name" required defaultValue={editingCashier?.name ?? ''} placeholder="Masukan nama pengguna" />
                            </Field>
                            <Field label="Nama pengguna">
                                <input name="username" required defaultValue={editingCashier?.username ?? ''} placeholder="Masukan nama pengguna untuk login" />
                            </Field>
                            <Field label={editingCashier ? 'Kata sandi baru (opsional)' : 'Kata sandi'}>
                                <input name="password" type="password" required={!editingCashier} minLength={8} placeholder={editingCashier ? 'Kosongkan jika tidak diubah' : 'Minimal 8 karakter'} />
                            </Field>
                            <Field label="Peran">
                                <select name="role" defaultValue={editingCashier?.role ?? 'cashier'}>
                                    <option value="cashier">Kasir</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </Field>
                            <Field label="Status">
                                <select name="status" defaultValue={editingCashier?.status ?? 'active'}>
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Nonaktif</option>
                                </select>
                            </Field>
                            <div className="mt-1 grid gap-2 sm:grid-cols-2">
                                <Button className={editingCashier ? '' : 'sm:col-span-2'} variant="primary" type="submit">{editingCashier ? 'Simpan Perubahan' : 'Tambah Pengguna'}</Button>
                                {editingCashier && <Button variant="ghost" type="button" onClick={() => setEditingCashier(null)}>Batal</Button>}
                            </div>
                        </FormStack>
                    </Card>
                    <Card className="bg-background" title="Daftar Pengguna">
                        <div className="-mt-3 flex flex-wrap items-center justify-between gap-3">
                            <span className="text-sm text-muted-foreground">{props.cashiers.length} akun terdaftar</span>
                            <div className="flex gap-2"><Badge variant="green">{props.cashiers.filter((user) => user.status === 'active').length} aktif</Badge><Badge variant="red">{props.cashiers.filter((user) => user.status !== 'active').length} nonaktif</Badge></div>
                        </div>
                        <p className="text-sm text-muted-foreground">Akun yang sudah memiliki transaksi atau aktivitas operasional hanya dapat dinonaktifkan.</p>
                        <DataTable className="[&_table]:min-w-[960px] [&_td]:py-5 [&_th]:!text-center [&_th]:text-foreground">
                            <table>
                                <thead>
                                    <tr>
                                        <th><SortableHeader column="name" label="Nama" sortDirection={cashierSortDirection} sortKey={cashierSortKey} onSort={toggleCashierSort} /></th>
                                        <th><SortableHeader column="username" label="Nama pengguna" sortDirection={cashierSortDirection} sortKey={cashierSortKey} onSort={toggleCashierSort} /></th>
                                        <th><SortableHeader column="role" label="Peran" sortDirection={cashierSortDirection} sortKey={cashierSortKey} onSort={toggleCashierSort} /></th>
                                        <th><SortableHeader column="status" label="Status" sortDirection={cashierSortDirection} sortKey={cashierSortKey} onSort={toggleCashierSort} /></th>
                                        <th>Riwayat</th>
                                        <th><SortableHeader column="sales" label="Penjualan Hari Ini" sortDirection={cashierSortDirection} sortKey={cashierSortKey} onSort={toggleCashierSort} /></th>
                                        <th className="w-40">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedCashiers.map((cashier) => (
                                        <tr key={cashier.id}>
                                            <td className="!text-left"><strong className="text-foreground">{cashier.name}</strong></td>
                                            <td>{cashier.username}</td>
                                            <td>{cashier.role === 'admin' ? 'Admin' : 'Kasir'}</td>
                                            <td><Badge className="rounded-full px-3 py-1" variant={cashier.status === 'active' ? 'green' : 'red'}>{cashier.status === 'active' ? 'Aktif' : 'Nonaktif'}</Badge></td>
                                            <td>{cashier.has_transactions ? <Badge variant="blue">{cashier.transactions_count} transaksi</Badge> : cashier.has_activity ? <Badge variant="amber">Ada aktivitas</Badge> : <span className="text-sm text-muted-foreground">Belum ada</span>}</td>
                                            <td className="font-bold text-foreground whitespace-nowrap">{rupiah(cashier.today_sales)}</td>
                                            <td>
                                                <div className="flex flex-wrap items-center justify-center gap-1">
                                                    {cashier.update_url && <button className="grid size-8 place-items-center rounded-full text-primary transition hover:bg-lightprimary [&_svg]:size-4" type="button" title={`Edit ${cashier.name}`} aria-label={`Edit ${cashier.name}`} onClick={() => setEditingCashier(cashier)}><NavIcon name="edit" /></button>}
                                                    {cashier.update_url && <button className={`grid size-8 place-items-center rounded-full transition [&_svg]:size-4 ${cashier.status === 'active' ? 'text-warning hover:bg-lightwarning' : 'text-success hover:bg-lightsuccess'}`} type="button" title={`${cashier.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'} ${cashier.name}`} aria-label={`${cashier.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'} ${cashier.name}`} onClick={() => postForm(cashier.update_url, props.csrf, { _method: 'PUT', name: cashier.name, username: cashier.username, role: cashier.role, status: cashier.status === 'active' ? 'inactive' : 'active' })}><NavIcon name="power" /></button>}
                                                    {cashier.reset_password_url && <button className="grid size-8 place-items-center rounded-full text-primary transition hover:bg-lightprimary [&_svg]:size-4" type="button" title={`Reset kata sandi ${cashier.name}`} aria-label={`Reset kata sandi ${cashier.name}`} onClick={() => { const password = window.prompt(`Password baru untuk ${cashier.name}`); if (password) postForm(cashier.reset_password_url, props.csrf, { _method: 'PUT', password }); }}><NavIcon name="key" /></button>}
                                                    {cashier.destroy_url && <button className="grid size-8 place-items-center rounded-full text-error transition hover:bg-lighterror [&_svg]:size-4" type="button" title={`Hapus ${cashier.name}`} aria-label={`Hapus ${cashier.name}`} onClick={() => { if (window.confirm(`Hapus pengguna ${cashier.name}?`)) postForm(cashier.destroy_url, props.csrf, { _method: 'DELETE' }); }}><NavIcon name="trash" /></button>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </DataTable>
                    </Card>
                </div>}

                {tab === 'data' && <div className="grid items-start gap-5 xl:grid-cols-2">
                    <Card className="bg-background" title="Keamanan Akun">
                        <p className="-mt-3 text-sm text-muted-foreground">Gunakan kata sandi yang berbeda dari aplikasi lain.</p>
                        <FormStack as="form" method="POST" action={props.routes.passwordUpdate ?? ''}>
                            <input type="hidden" name="_token" value={props.csrf} />
                            <input type="hidden" name="_method" value="PUT" />
                            <Field label="Kata sandi lama"><input name="current_password" type="password" required /></Field>
                            <Field label="Kata sandi baru"><input name="password" type="password" required /></Field>
                            <Field label="Konfirmasi kata sandi"><input name="password_confirmation" type="password" required /></Field>
                            <div className="flex justify-end border-t border-ld pt-5"><Button variant="primary" type="submit">Ganti Kata Sandi</Button></div>
                        </FormStack>
                    </Card>
                    <Card className="bg-background" title="Ringkasan Data">
                        <p className="-mt-3 text-sm text-muted-foreground">Jumlah data utama yang tersimpan pada periode aktif.</p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <SettingsMetric label="Produk aktif" value={props.activeProducts.length} />
                            <SettingsMetric label="Pengguna" value={props.cashiers.length} />
                            <SettingsMetric label="Transaksi periode" value={props.historyTransactions.length} />
                            <SettingsMetric label="Pengeluaran periode" value={props.expenses.length} />
                        </div>
                    </Card>
                </div>}
        </section>
    );
}

function SettingsMetric({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex min-h-16 items-center justify-between gap-4 border-b border-ld px-1 py-3">
            <span className="text-sm font-semibold text-muted-foreground">{label}</span>
            <strong className="text-xl font-semibold text-foreground">{value.toLocaleString('id-ID')}</strong>
        </div>
    );
}

function ReceiptSettingsPreview({ cashier, settings }: { cashier: string; settings: ReceiptSettings }) {
    const headerLines = [
        settings.receipt_address_line_1,
        settings.receipt_address_line_2,
        settings.receipt_phone,
    ].filter(Boolean);
    const footerLines = [
        settings.receipt_footer_line_1,
        settings.receipt_footer_line_2,
        settings.receipt_footer_line_3,
    ].filter(Boolean);

    return (
        <div className="rounded-md border border-dashed border-ld bg-card px-5 py-4 font-mono text-[12px] leading-5 text-foreground">
            <div className="text-center">
                <strong className="block text-sm">{settings.receipt_store_name || 'NAMA TOKO'}</strong>
                {headerLines.map((line, index) => <span className="block text-muted-foreground" key={`${line}-${index}`}>{line}</span>)}
            </div>
            <div className="my-3 border-t border-dashed border-ld" />
            <div className="grid gap-1">
                <div className="flex justify-between gap-3"><span>No</span><strong>TRX-0001</strong></div>
                <div className="flex justify-between gap-3"><span>Tanggal</span><span>11/10/2026 10:30</span></div>
                {settings.receipt_show_cashier === '1' && <div className="flex justify-between gap-3"><span>Kasir</span><span className="truncate">{cashier}</span></div>}
                {settings.receipt_show_customer === '1' && <div className="flex justify-between gap-3"><span>Pembeli</span><span>Member</span></div>}
            </div>
            <div className="my-3 border-t border-dashed border-ld" />
            <div className="grid gap-1">
                <span>Mawa Snack / Minuman</span>
                <div className="flex justify-between gap-3"><span>1 x 20.000</span><strong>20.000</strong></div>
            </div>
            <div className="my-3 border-t border-dashed border-ld" />
            <div className="flex justify-between gap-3 font-bold"><span>Total</span><span>20.000</span></div>
            {settings.receipt_show_payment === '1' && <>
                <div className="flex justify-between gap-3"><span>Status</span><span>LUNAS</span></div>
                <div className="flex justify-between gap-3"><span>Metode</span><span>Tunai</span></div>
            </>}
            {footerLines.length > 0 && <>
                <div className="my-3 border-t border-dashed border-ld" />
                <div className="text-center text-muted-foreground">
                    {footerLines.map((line, index) => <span className="block" key={`${line}-${index}`}>{line}</span>)}
                </div>
            </>}
        </div>
    );
}

function SettingsToggle({ checked, defaultChecked = true, description, name, onChange, title }: { checked?: boolean; defaultChecked?: boolean; description: string; name?: string; onChange?: (checked: boolean) => void; title: string }) {
    const controlled = checked !== undefined;

    return (
        <label className="flex min-h-16 cursor-pointer items-center justify-between gap-4 rounded-md border border-ld bg-card px-4 py-3 transition hover:border-primary/50">
            <span className="grid gap-1"><strong className="text-sm text-foreground">{title}</strong><small className="text-xs text-muted-foreground">{description}</small></span>
            <span className="relative inline-flex shrink-0">
                <input className="peer sr-only" name={name} value="1" type="checkbox" checked={controlled ? checked : undefined} defaultChecked={controlled ? undefined : defaultChecked} onChange={(event) => onChange?.(event.target.checked)} />
                <span className="h-6 w-11 rounded-full bg-muted transition peer-checked:bg-primary peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-5" />
            </span>
        </label>
    );
}

function Account({ props }: { props: AppProps }) {
    return (
        <section className="grid gap-6">
            <div><h1 className="text-2xl font-semibold leading-8 text-foreground">Akun</h1><p className="text-sm text-muted-foreground">Informasi profil dan penggantian password</p></div>
            <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
                <Card>
                    <div className="flex items-center gap-4">
                        <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-lightprimary text-2xl font-semibold text-primary">{props.user.name.slice(0, 1).toUpperCase()}</span>
                        <div className="min-w-0"><h2 className="truncate text-xl font-semibold leading-7 text-foreground">{props.user.name}</h2><p className="truncate text-sm text-muted-foreground">{props.user.username} - {props.user.role}</p></div>
                    </div>
                    <div className="mt-5 grid gap-3">
                        <div className="rounded-md border border-ld bg-background p-4"><span className="text-sm font-bold text-muted-foreground">Email</span><strong className="mt-1 block break-words text-foreground">{props.user.email}</strong></div>
                        <div className="rounded-md border border-ld bg-background p-4"><span className="text-sm font-bold text-muted-foreground">Status</span><strong className="mt-1 block text-foreground">{props.user.status}</strong></div>
                    </div>
                </Card>
                <Card title="Ganti kata sandi">
                    <FormStack as="form" method="POST" action={props.routes.passwordUpdate ?? ''} className="max-w-[650px]">
                        <input type="hidden" name="_token" value={props.csrf} />
                        <input type="hidden" name="_method" value="PUT" />
                        <Field label="Kata sandi lama"><input name="current_password" type="password" required /></Field>
                        <Field label="Kata sandi baru"><input name="password" type="password" required /></Field>
                        <Field label="Konfirmasi kata sandi"><input name="password_confirmation" type="password" required /></Field>
                        <Button variant="primary" type="submit">Ganti kata sandi</Button>
                    </FormStack>
                </Card>
            </div>
        </section>
    );
}

type ProductSortKey = 'barcode' | 'name' | 'category' | 'unit' | 'minimum' | 'status';
type StockSortKey = 'barcode' | 'name' | 'stock';

function StockTable({ products }: { products: Product[] }) {
    const { sortDirection, sortKey, toggleSort } = useTableSort<StockSortKey>('name');
    const sortedProducts = [...products].sort((first, second) => {
        const value = sortKey === 'stock'
            ? compareNumber(first.stok, second.stok)
            : sortKey === 'barcode'
                ? compareText(first.kode_barang, second.kode_barang)
                : compareText(first.nama_barang, second.nama_barang);

        return withSortDirection(value, sortDirection);
    });

    return (
        <DataTable className="[&_table]:min-w-[760px] [&_td]:py-5 [&_th]:!text-center [&_th]:text-foreground">
            <table>
                <thead>
                    <tr>
                        <th className="w-16 !text-center">No</th>
                        <th className="!text-center"><SortableHeader column="barcode" label="Barcode" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        <th className="!text-center"><SortableHeader column="name" label="Nama" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        <th className="w-28 !text-center"><SortableHeader column="stock" label="Stok" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                    </tr>
                </thead>
                <tbody>
                    {sortedProducts.length ? sortedProducts.map((product, index) => {
                        const status = getStockStatus(product);
                        const badgeVariant = status === 'empty' ? 'red' : status === 'low' ? 'amber' : 'green';
                        const statusLabel = status === 'empty' ? 'Habis' : status === 'low' ? 'Menipis' : 'Aman';
                        const rowClass = status === 'empty'
                            ? 'bg-error/10 hover:bg-error/15'
                            : status === 'low'
                                ? 'bg-warning/10 hover:bg-warning/15'
                                : '';

                        return (
                            <tr className={rowClass} key={product.id}>
                                <td className="!text-center font-medium text-muted-foreground">{index + 1}</td>
                                <td className="!text-center font-medium text-foreground">{product.kode_barang || '-'}</td>
                                <td className="!text-left">
                                    <strong className="text-foreground">{product.nama_barang}</strong>
                                    <div className="mt-1 text-xs font-medium text-muted-foreground">{product.kategori || 'Tanpa kategori'}</div>
                                </td>
                                <td className="!text-center">
                                    <Badge className="min-w-24 gap-1.5 px-3 py-1.5 font-bold" variant={badgeVariant}>
                                        <span>{product.stok.toLocaleString('id-ID')}</span>
                                        <span>{statusLabel}</span>
                                    </Badge>
                                </td>
                            </tr>
                        );
                    }) : <tr><td className="text-center text-muted-foreground" colSpan={4}>Belum ada stok yang cocok.</td></tr>}
                </tbody>
            </table>
        </DataTable>
    );
}

function ProductTable({ products, showActions = false, csrf, onEdit }: { products: Product[]; showActions?: boolean; csrf?: string; onEdit?: (product: Product) => void }) {
    const { sortDirection, sortKey, toggleSort } = useTableSort<ProductSortKey>('name');
    const sortedProducts = [...products].sort((first, second) => {
        const value = sortKey === 'minimum'
            ? compareNumber(first.stok_minimal, second.stok_minimal)
            : sortKey === 'barcode'
                ? compareText(first.kode_barang, second.kode_barang)
                : sortKey === 'category'
                    ? compareText(first.kategori, second.kategori)
                    : sortKey === 'unit'
                        ? compareText(first.satuan, second.satuan)
                        : sortKey === 'status'
                            ? compareText(first.status, second.status)
                            : compareText(first.nama_barang, second.nama_barang);

        return withSortDirection(value, sortDirection);
    });

    return (
        <DataTable className="[&_table]:min-w-[920px] [&_td]:py-5 [&_th]:!text-center [&_th]:text-foreground">
            <table>
                <thead>
                    <tr>
                        <th className="w-16 !text-center">No</th>
                        <th className="!text-center"><SortableHeader column="barcode" label="Barcode" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        <th className="!text-center"><SortableHeader column="name" label="Nama" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        <th className="!text-center"><SortableHeader column="category" label="Kategori" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        <th className="w-28 !text-center"><SortableHeader column="unit" label="Satuan" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        <th className="w-36 !text-center"><SortableHeader column="minimum" label="Stok minimal" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        <th className="w-28 !text-center"><SortableHeader column="status" label="Status" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        {showActions && <th className="w-32 !text-center">Aksi</th>}
                    </tr>
                </thead>
                <tbody>
                    {sortedProducts.length ? sortedProducts.map((product, index) => {
                        return (
                            <tr key={product.id}>
                                <td className="!text-center font-medium text-muted-foreground">{index + 1}</td>
                                <td className="!text-center font-medium text-foreground">{product.kode_barang}</td>
                                <td className="!text-left">
                                    <strong className="text-foreground">{product.nama_barang}</strong>
                                    {product.deskripsi && <div className="mt-1 text-xs text-muted-foreground">{product.deskripsi}</div>}
                                </td>
                                <td className="!text-center text-foreground">{product.kategori || '-'}</td>
                                <td className="!text-center text-foreground">{product.satuan || '-'}</td>
                                <td className="!text-center font-semibold text-foreground">{product.stok_minimal}</td>
                                <td><Badge className="rounded-full px-3 py-1" variant={product.status === 'active' ? 'green' : 'red'}>{product.status === 'active' ? 'Aktif' : 'Nonaktif'}</Badge></td>
                                {showActions && (
                                    <td className="!text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {product.update_url && <button className="grid size-6 place-items-center rounded-full text-primary transition hover:bg-lightprimary [&_svg]:size-3.5" type="button" title="Edit" aria-label={`Edit ${product.nama_barang}`} onClick={() => onEdit?.(product)}>
                                                <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path d="M12 20h9" />
                                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" />
                                                </svg>
                                            </button>}
                                            {product.destroy_url && csrf && (
                                                <button className="grid size-6 place-items-center rounded-full text-error transition hover:bg-lighterror [&_svg]:size-3.5" type="button" title="Hapus" aria-label={`Hapus ${product.nama_barang}`} onClick={() => {
                                                    if (window.confirm(`Hapus ${product.nama_barang}?`)) {
                                                        postForm(product.destroy_url, csrf, { _method: 'DELETE' });
                                                    }
                                                }}>
                                                    <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                                                        <path d="M3 6h18" />
                                                        <path d="M8 6V4h8v2" />
                                                        <path d="M19 6l-1 14H6L5 6" />
                                                        <path d="M10 11v5" />
                                                        <path d="M14 11v5" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        );
                    }) : <tr><td className="text-center text-muted-foreground" colSpan={showActions ? 8 : 7}>Tidak ada produk yang cocok.</td></tr>}
                </tbody>
            </table>
        </DataTable>
    );
}

function ExpenseTable({ expenses, csrf, onEdit, showActions }: { expenses: Expense[]; csrf: string; onEdit: (expense: Expense) => void; showActions: boolean }) {
    const { sortDirection, sortKey, toggleSort } = useTableSort<'date' | 'description' | 'user' | 'volume' | 'unit' | 'price' | 'amount' | 'notes'>('date', 'desc');
    const sortedExpenses = [...expenses].sort((first, second) => {
        const value = sortKey === 'description'
            ? compareText(first.uraian, second.uraian)
            : sortKey === 'user'
                ? compareText(first.user, second.user)
                : sortKey === 'volume'
                ? compareNumber(first.volume, second.volume)
                : sortKey === 'unit'
                    ? compareText(first.unit, second.unit)
                    : sortKey === 'price'
                        ? compareNumber(first.price, second.price)
                        : sortKey === 'amount'
                            ? compareNumber(first.amount, second.amount)
                            : sortKey === 'notes'
                                ? compareText(first.notes, second.notes)
                                : parseDateForSort(first.spent_at) - parseDateForSort(second.spent_at);

        return withSortDirection(value, sortDirection);
    });

    return (
        <DataTable className="[&_table]:min-w-[940px] [&_td]:py-5 [&_th]:!text-center [&_th]:text-foreground">
            <table>
                <thead>
                    <tr>
                        <th className="w-16 !text-center">No</th>
                        <th className="w-32 !text-center"><SortableHeader column="date" label="Tanggal" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        <th className="!text-center"><SortableHeader column="description" label="Uraian" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        <th className="w-36 !text-center"><SortableHeader column="user" label="Dibuat Oleh" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        <th className="w-24 !text-center"><SortableHeader column="volume" label="Vol" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        <th className="w-28 !text-center"><SortableHeader column="unit" label="Satuan" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        <th className="w-40 !text-center"><SortableHeader column="price" label="Harga" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        <th className="w-40 !text-center"><SortableHeader column="amount" label="Jumlah" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        <th className="!text-center"><SortableHeader column="notes" label="Keterangan" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        {showActions && <th className="w-28 !text-center">Aksi</th>}
                    </tr>
                </thead>
                <tbody>
                    {sortedExpenses.length ? sortedExpenses.map((expense, index) => (
                        <tr key={expense.id}>
                            <td className="!text-center font-medium text-muted-foreground">{index + 1}</td>
                            <td className="!text-center">{expense.spent_at}</td>
                            <td className="!text-left"><strong className="text-foreground">{expense.uraian}</strong></td>
                            <td className="!text-center text-foreground">{expense.user}</td>
                            <td className="!text-center">{Number(expense.volume).toLocaleString('id-ID')}</td>
                            <td className="!text-center">{expense.unit ?? '-'}</td>
                            <td className="!text-center whitespace-nowrap font-semibold text-foreground">{rupiah(expense.price)}</td>
                            <td className="!text-center font-bold text-error whitespace-nowrap">{rupiah(expense.amount)}</td>
                            <td className="!text-left text-muted-foreground">{expense.notes || '-'}</td>
                            {showActions && <td>
                                <div className="flex items-center justify-center gap-1">
                                    {expense.update_url && <button className="grid size-7 place-items-center rounded-full text-primary transition hover:bg-lightprimary [&_svg]:size-4" type="button" title="Edit" aria-label={`Edit ${expense.uraian}`} onClick={() => onEdit(expense)}><NavIcon name="edit" /></button>}
                                    {expense.destroy_url && <button className="grid size-7 place-items-center rounded-full text-error transition hover:bg-lighterror [&_svg]:size-4" type="button" title="Hapus" aria-label={`Hapus ${expense.uraian}`} onClick={() => { if (window.confirm(`Hapus pengeluaran ${expense.uraian}?`)) postForm(expense.destroy_url, csrf, { _method: 'DELETE' }); }}><NavIcon name="trash" /></button>}
                                </div>
                            </td>}
                        </tr>
                    )) : <tr><td className="text-center text-muted-foreground" colSpan={showActions ? 10 : 9}>Tidak ada pengeluaran yang cocok.</td></tr>}
                </tbody>
            </table>
        </DataTable>
    );
}

function TransactionTable({ transactions, showCashier, csrf, onEdit }: { transactions: Transaction[]; showCashier: boolean; csrf: string; onEdit?: (transaction: Transaction) => void }) {
    const { sortDirection, sortKey, toggleSort } = useTableSort<'date' | 'cashier' | 'customer' | 'method' | 'status' | 'total'>('date', 'desc');
    const paymentLabel = (transaction: Transaction) => {
        if (transaction.payment_status === 'pending') {
            return 'Belum Bayar';
        }

        return transaction.payment_type === 'transfer' ? 'Transfer' : 'Tunai';
    };
    const splitDateTime = (value: string) => {
        const parts = value.trim().split(/\s+/);

        return {
            date: parts[0] ?? value,
            time: parts.length > 1 ? parts.slice(1).join(' ') : '',
        };
    };
    const deleteTransaction = (transaction: Transaction) => {
        if (!transaction.destroy_url) return;
        postForm(transaction.destroy_url, csrf, { _method: 'DELETE' });
    };
    const sortedTransactions = [...transactions].sort((first, second) => {
        const statusText = (transaction: Transaction) => transaction.status === 'void' ? 'Batal' : transaction.payment_status === 'paid' ? 'Lunas' : 'Belum Bayar';
        const value = sortKey === 'cashier'
            ? compareText(first.cashier, second.cashier)
            : sortKey === 'customer'
                ? compareText(first.customer_name, second.customer_name)
                : sortKey === 'method'
                    ? compareText(paymentLabel(first), paymentLabel(second))
                    : sortKey === 'status'
                        ? compareText(statusText(first), statusText(second))
                        : sortKey === 'total'
                            ? compareNumber(first.total, second.total)
                            : parseDateForSort(first.created_at) - parseDateForSort(second.created_at);

        return withSortDirection(value, sortDirection);
    });

    return (
        <DataTable className="rounded-md border border-ld [&_table]:min-w-[900px] [&_td]:py-4 [&_tbody_tr]:cursor-default [&_tbody_tr]:hover:bg-primary/10 [&_th]:!text-center [&_th]:text-sm [&_th]:font-semibold [&_th]:text-foreground">
            <table>
                <thead>
                    <tr>
                        <th><SortableHeader column="date" label="Tanggal" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        {showCashier && <th><SortableHeader column="cashier" label="Kasir" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>}
                        <th><SortableHeader column="customer" label="Pembeli" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        <th><SortableHeader column="method" label="Metode" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        <th><SortableHeader column="status" label="Status" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        <th className="!text-right"><SortableHeader align="right" column="total" label="Total" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        <th className="w-24 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedTransactions.length ? sortedTransactions.map((transaction) => {
                        const isVoid = transaction.status === 'void';
                        const badgeVariant = isVoid ? 'red' : transaction.payment_status === 'paid' ? 'green' : 'amber';
                        const createdAt = splitDateTime(transaction.created_at);
                        const timeLabel = createdAt.time && !createdAt.time.toLowerCase().includes('wib') ? `${createdAt.time} WIB` : createdAt.time;

                        return (
                            <tr className="group/row" key={transaction.id}>
                                <td>
                                    <div className="grid gap-1 text-center">
                                        <span className="text-sm font-semibold text-foreground">{createdAt.date}</span>
                                        {timeLabel && <span className="text-xs font-medium text-muted-foreground">{timeLabel}</span>}
                                        {isVoid && <span className="text-xs font-medium text-error">Batal: {transaction.void_reason || '-'}</span>}
                                    </div>
                                </td>
                                {showCashier && <td className="text-sm font-semibold text-foreground">{transaction.cashier}</td>}
                                <td className="text-sm font-medium text-muted-foreground">{transaction.customer_name || '-'}</td>
                                <td>
                                    <div className="grid gap-1">
                                        <span className="text-sm font-semibold text-foreground">{paymentLabel(transaction)}</span>
                                        {transaction.payment_type === 'transfer' && (
                                            <span className="text-xs font-medium text-muted-foreground">{transaction.payment_verified_at ? 'Terverifikasi' : 'Belum verifikasi'}</span>
                                        )}
                                    </div>
                                </td>
                                <td><Badge className="rounded-full px-3 py-1" variant={badgeVariant}>{isVoid ? 'Batal' : transaction.payment_status === 'paid' ? 'Lunas' : 'Belum Bayar'}</Badge></td>
                                <td className="!text-right font-bold text-foreground whitespace-nowrap">{rupiah(transaction.total)}</td>
                                <td>
                                    <div className="flex items-center justify-center gap-0.5">
                                        {transaction.update_url && onEdit && !isVoid && <button className="grid size-7 place-items-center rounded-full text-primary transition hover:bg-lightprimary [&_svg]:size-3.5" type="button" title="Edit" aria-label={`Edit ${transaction.kode_transaksi}`} onClick={() => onEdit(transaction)}><NavIcon name="edit" /></button>}
                                        <a className="grid size-7 place-items-center rounded-full text-primary transition hover:bg-lightprimary [&_svg]:size-3.5" href={transaction.receipt_url} target="_blank" rel="noreferrer" title="Preview nota" aria-label={`Preview nota ${transaction.kode_transaksi}`}><NavIcon name="print" /></a>
                                        <a className="grid size-7 place-items-center rounded-full text-success transition hover:bg-lightsuccess [&_svg]:size-3.5" href={transaction.receipt_jpeg_url} title="Download JPEG" aria-label={`Download JPEG ${transaction.kode_transaksi}`}><NavIcon name="download" /></a>
                                        {transaction.settle_url && !isVoid && transaction.payment_status === 'pending' && <button className="rounded-md px-2 py-1 text-xs font-semibold text-primary transition hover:bg-lightprimary" type="button" onClick={() => postForm(transaction.settle_url, csrf, { _method: 'PUT', payment_type: 'cash', uang_diterima: transaction.total })}>Lunasi</button>}
                                    {transaction.verify_transfer_url && !isVoid && transaction.payment_type === 'transfer' && transaction.payment_status === 'paid' && !transaction.payment_verified_at && <button className="rounded-md px-2 py-1 text-xs font-semibold text-primary transition hover:bg-lightprimary" type="button" onClick={() => postForm(transaction.verify_transfer_url, csrf, { _method: 'PUT' })}>Verifikasi</button>}
                                        {transaction.destroy_url && !isVoid && <button className="grid size-7 place-items-center rounded-full text-error transition hover:bg-lighterror [&_svg]:size-3.5" type="button" title="Hapus" aria-label={`Hapus ${transaction.kode_transaksi}`} onClick={() => deleteTransaction(transaction)}><NavIcon name="trash" /></button>}
                                    </div>
                                </td>
                            </tr>
                        );
                    }) : <tr><td className="text-center text-muted-foreground" colSpan={showCashier ? 7 : 6}>Belum ada transaksi.</td></tr>}
                </tbody>
            </table>
        </DataTable>
    );
}

function PurchaseTable({ purchases, csrf, onEdit }: { purchases: StockIn[]; csrf: string; onEdit: (stockIn: StockIn) => void }) {
    const { sortDirection, sortKey, toggleSort } = useTableSort<'date' | 'supplier' | 'product' | 'qty'>('date', 'desc');
    const sortedPurchases = [...purchases].sort((first, second) => {
        const value = sortKey === 'supplier'
            ? compareText(first.supplier, second.supplier)
            : sortKey === 'product'
                ? compareText(first.product, second.product)
                : sortKey === 'qty'
                    ? compareNumber(first.qty, second.qty)
                    : parseDateForSort(first.tanggal) - parseDateForSort(second.tanggal);

        return withSortDirection(value, sortDirection);
    });

    return (
        <DataTable className="[&_table]:min-w-[820px] [&_td]:py-5 [&_th]:!text-center [&_th]:text-foreground">
            <table>
                <thead>
                    <tr>
                        <th className="w-16 !text-center">No</th>
                        <th className="w-36 !text-center"><SortableHeader column="date" label="Tanggal" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        <th className="!text-center"><SortableHeader column="supplier" label="Suplier" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        <th className="!text-center"><SortableHeader column="product" label="Produk" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        <th className="w-36 !text-center"><SortableHeader column="qty" label="Jumlah Produk" sortDirection={sortDirection} sortKey={sortKey} onSort={toggleSort} /></th>
                        <th className="w-28 !text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedPurchases.length ? sortedPurchases.map((stock, index) => (
                        <tr key={stock.id}>
                            <td className="!text-center font-medium text-muted-foreground">{index + 1}</td>
                            <td className="!text-center text-foreground">{stock.tanggal}</td>
                            <td className="!text-center text-foreground">{stock.supplier || '-'}</td>
                            <td className="!text-left">
                                <strong className="text-foreground">{stock.product}</strong>
                                {stock.product_code && <div className="mt-1 text-xs text-muted-foreground">{stock.product_code}</div>}
                            </td>
                            <td className="!text-center font-semibold text-foreground">{stock.qty}</td>
                            <td className="!text-center">
                                <div className="flex items-center justify-center gap-1">
                                    {stock.update_url && (
                                        <button className="grid size-6 place-items-center rounded-full text-primary transition hover:bg-lightprimary [&_svg]:size-3.5" type="button" title="Edit" aria-label={`Edit pembelian ${stock.product}`} onClick={() => onEdit(stock)}>
                                            <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                                                <path d="M12 20h9" />
                                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" />
                                            </svg>
                                        </button>
                                    )}
                                    {stock.destroy_url && (
                                        <button className="grid size-6 place-items-center rounded-full text-error transition hover:bg-lighterror [&_svg]:size-3.5" type="button" title="Hapus" aria-label={`Hapus pembelian ${stock.product}`} onClick={() => {
                                            if (window.confirm(`Hapus pembelian ${stock.product}?`)) {
                                                postForm(stock.destroy_url, csrf, { _method: 'DELETE' });
                                            }
                                        }}>
                                            <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                                                <path d="M3 6h18" />
                                                <path d="M8 6V4h8v2" />
                                                <path d="M19 6l-1 14H6L5 6" />
                                                <path d="M10 11v5" />
                                                <path d="M14 11v5" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    )) : <tr><td className="text-center text-muted-foreground" colSpan={6}>Belum ada pembelian.</td></tr>}
                </tbody>
            </table>
        </DataTable>
    );
}

const root = document.getElementById('dalwa-react-root');
if (root && window.__DALWA_APP__) {
    createRoot(root).render(
        <ErrorBoundary>
            <App props={window.__DALWA_APP__} />
        </ErrorBoundary>,
    );
}

