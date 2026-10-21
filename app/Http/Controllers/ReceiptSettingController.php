<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReceiptSettingController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'receipt_store_name' => ['required', 'string', 'max:80'],
            'receipt_address_line_1' => ['nullable', 'string', 'max:120'],
            'receipt_address_line_2' => ['nullable', 'string', 'max:120'],
            'receipt_phone' => ['nullable', 'string', 'max:40'],
            'receipt_footer_line_1' => ['nullable', 'string', 'max:80'],
            'receipt_footer_line_2' => ['nullable', 'string', 'max:80'],
            'receipt_footer_line_3' => ['nullable', 'string', 'max:80'],
            'receipt_paper_width' => ['required', 'integer', 'min:24', 'max:42'],
            'settings_tab' => ['nullable', 'in:profile,receipt'],
        ]);

        $settingsTab = $data['settings_tab'] ?? 'receipt';
        unset($data['settings_tab']);

        AppSetting::updateReceiptSettings([
            ...$data,
            'receipt_show_cashier' => $request->boolean('receipt_show_cashier') ? '1' : '0',
            'receipt_show_customer' => $request->boolean('receipt_show_customer') ? '1' : '0',
            'receipt_show_payment' => $request->boolean('receipt_show_payment') ? '1' : '0',
        ]);

        return redirect()
            ->route('dashboard', ['page' => 'settings', 'settings_tab' => $settingsTab])
            ->with('success', $settingsTab === 'profile' ? 'Identitas toko berhasil diperbarui.' : 'Format struk berhasil diperbarui.');
    }
}
