<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
use Throwable;

class AppSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
    ];

    public static function receiptDefaults(): array
    {
        return [
            'receipt_store_name' => 'DALWA WATER TEGAL',
            'receipt_address_line_1' => 'Tegal - Jawa Tengah',
            'receipt_address_line_2' => '',
            'receipt_phone' => '0852-3699-1848',
            'receipt_footer_line_1' => 'Terima kasih',
            'receipt_footer_line_2' => 'Barang yang sudah dibeli',
            'receipt_footer_line_3' => 'tidak dapat ditukar kembali',
            'receipt_paper_width' => (string) config('thermal.width', 32),
            'receipt_show_cashier' => '1',
            'receipt_show_customer' => '1',
            'receipt_show_payment' => '1',
        ];
    }

    public static function receiptSettings(): array
    {
        return array_merge(self::receiptDefaults(), self::storedSettings(array_keys(self::receiptDefaults())));
    }

    public static function updateReceiptSettings(array $settings): void
    {
        foreach (array_intersect_key($settings, self::receiptDefaults()) as $key => $value) {
            self::updateOrCreate(['key' => $key], ['value' => (string) $value]);
        }
    }

    public static function enabled(array $settings, string $key): bool
    {
        return (string) ($settings[$key] ?? '0') === '1';
    }

    private static function storedSettings(array $keys): array
    {
        try {
            if (! Schema::hasTable('app_settings')) {
                return [];
            }

            return self::query()
                ->whereIn('key', $keys)
                ->pluck('value', 'key')
                ->all();
        } catch (Throwable) {
            return [];
        }
    }
}
