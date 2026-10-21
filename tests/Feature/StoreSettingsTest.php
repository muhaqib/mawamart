<?php

namespace Tests\Feature;

use App\Models\AppSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoreSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_update_store_identity_and_return_to_profile_tab(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => 'active',
        ]);

        $this->actingAs($admin)
            ->put(route('settings.receipt.update'), [
                'settings_tab' => 'profile',
                'receipt_store_name' => 'Dalwa Water Tegal',
                'receipt_address_line_1' => 'Jl. Raya Tegalwangi',
                'receipt_address_line_2' => 'Talang, Kabupaten Tegal',
                'receipt_phone' => '0852-3699-1848',
                'receipt_footer_line_1' => 'Terima kasih',
                'receipt_footer_line_2' => 'Barang yang sudah dibeli',
                'receipt_footer_line_3' => 'tidak dapat ditukar kembali',
                'receipt_paper_width' => 32,
                'receipt_show_cashier' => '1',
                'receipt_show_customer' => '1',
                'receipt_show_payment' => '1',
            ])
            ->assertRedirect(route('dashboard', [
                'page' => 'settings',
                'settings_tab' => 'profile',
            ]));

        $settings = AppSetting::receiptSettings();
        $this->assertSame('Dalwa Water Tegal', $settings['receipt_store_name']);
        $this->assertSame('Jl. Raya Tegalwangi', $settings['receipt_address_line_1']);
        $this->assertSame('Talang, Kabupaten Tegal', $settings['receipt_address_line_2']);
        $this->assertSame('0852-3699-1848', $settings['receipt_phone']);
    }
}
