<?php

namespace App\Services;

use App\Models\AppSetting;
use App\Models\Transaction;

class ThermalReceiptText
{
    /**
     * @return array<int, string>
     */
    public function lines(Transaction $transaction, ?int $width = null): array
    {
        $transaction->loadMissing(['user', 'details.product']);

        $settings = AppSetting::receiptSettings();
        $width = $width ?? $this->widthFromSettings($settings);
        $lines = [];

        $this->appendCentered($lines, (string) $settings['receipt_store_name'], $width);
        $this->appendCentered($lines, (string) ($settings['receipt_address_line_1'] ?? ''), $width);
        $this->appendCentered($lines, (string) ($settings['receipt_address_line_2'] ?? ''), $width);
        $this->appendCentered($lines, (string) ($settings['receipt_phone'] ?? ''), $width);

        $lines[] = '';
        $lines[] = $this->divider($width);
        $lines[] = $this->row('No', $transaction->kode_transaksi, $width);
        $lines[] = $this->row('Tanggal', $transaction->created_at->format('d/m/Y H:i'), $width);

        if (AppSetting::enabled($settings, 'receipt_show_cashier')) {
            $lines[] = $this->row('Kasir', $transaction->user?->name ?? '-', $width);
        }

        if (AppSetting::enabled($settings, 'receipt_show_customer')) {
            $lines[] = $this->row('Pembeli', $transaction->customer_name ?: 'Member', $width);
        }

        if ($transaction->isVoid()) {
            $lines[] = $this->row('Status Transaksi', 'VOID', $width);
            $this->appendWrapped($lines, $transaction->void_reason ?: '-', $width);
        }

        $lines[] = $this->divider($width);

        foreach ($transaction->details as $detail) {
            $this->appendWrapped($lines, $detail->product?->nama_barang ?? 'Produk dihapus', $width);
            $lines[] = $this->row($detail->qty.' x '.$this->money((int) $detail->harga), $this->money((int) $detail->subtotal), $width);
        }

        $lines[] = $this->divider($width);
        $lines[] = $this->row('Total', $this->money((int) $transaction->total), $width);

        if (AppSetting::enabled($settings, 'receipt_show_payment')) {
            $lines[] = $this->row('Status', $transaction->payment_status === 'paid' ? 'LUNAS' : 'BELUM BAYAR', $width);
            $lines[] = $this->row('Metode', $this->paymentType($transaction->payment_type), $width);

            if ($transaction->payment_status === 'paid') {
                $lines[] = $this->row('Diterima', $this->money((int) $transaction->uang_diterima), $width);
                $lines[] = $this->row('Kembali', $this->money((int) $transaction->kembalian), $width);
            }
        }

        $lines[] = $this->divider($width);
        $lines[] = '';

        foreach ([
            $settings['receipt_footer_line_1'] ?? '',
            $settings['receipt_footer_line_2'] ?? '',
            $settings['receipt_footer_line_3'] ?? '',
        ] as $line) {
            $this->appendCentered($lines, (string) $line, $width);
        }

        return $lines;
    }

    public function text(Transaction $transaction, ?int $width = null, int $feedLines = 0): string
    {
        $lines = $this->lines($transaction, $width);

        if ($feedLines > 0) {
            $lines = array_merge($lines, array_fill(0, $feedLines, ''));
        }

        return implode("\n", $lines);
    }

    /**
     * @param  array<string, string>  $settings
     */
    private function widthFromSettings(array $settings): int
    {
        return max(24, min(42, (int) ($settings['receipt_paper_width'] ?? config('thermal.width', 32))));
    }

    /**
     * @param  array<int, string>  $lines
     */
    private function appendCentered(array &$lines, string $value, int $width): void
    {
        foreach ($this->wrap($value, $this->centerWrapWidth($width)) as $line) {
            if ($line !== '') {
                $lines[] = $this->center($line, $width);
            }
        }
    }

    /**
     * @param  array<int, string>  $lines
     */
    private function appendWrapped(array &$lines, string $value, int $width): void
    {
        foreach ($this->wrap($value, $width) as $line) {
            if ($line !== '') {
                $lines[] = $line;
            }
        }
    }

    private function row(string $left, string $right, int $width): string
    {
        $left = $this->plain($left);
        $right = $this->plain($right);

        if (strlen($left) + strlen($right) >= $width) {
            return $left."\n".str_pad($right, $width, ' ', STR_PAD_LEFT);
        }

        return $left.str_repeat(' ', max(1, $width - strlen($left) - strlen($right))).$right;
    }

    private function divider(int $width): string
    {
        return str_repeat('-', $width);
    }

    private function center(string $value, int $width): string
    {
        $value = $this->plain($value);

        return str_repeat(' ', max(0, intdiv($width - strlen($value), 2))).$value;
    }

    private function centerWrapWidth(int $width): int
    {
        return max(20, $width - 4);
    }

    /**
     * @return array<int, string>
     */
    private function wrap(string $value, int $width): array
    {
        return explode("\n", wordwrap($this->plain($value), $width, "\n", true));
    }

    private function plain(string $value): string
    {
        $value = str_replace(['–', '—'], '-', $value);
        $value = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value);

        return trim((string) $value);
    }

    private function money(int $value): string
    {
        return number_format($value, 0, ',', '.');
    }

    private function paymentType(?string $type): string
    {
        return match ($type) {
            'cash' => 'Tunai',
            'transfer' => 'Transfer',
            default => '-',
        };
    }
}
