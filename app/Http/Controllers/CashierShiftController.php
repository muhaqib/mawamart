<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\CashierShift;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CashierShiftController extends Controller
{
    public function open(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'opening_cash' => ['required', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $user = $request->user();

        if ($user->cashierShifts()->open()->exists()) {
            return back()->withErrors(['shift' => 'Masih ada shift yang aktif. Tutup shift terlebih dahulu.']);
        }

        $shift = CashierShift::create([
            'user_id' => $user->id,
            'opened_at' => now(),
            'opening_cash' => $data['opening_cash'],
            'notes' => $data['notes'] ?? null,
        ]);

        AuditLog::record('cashier_shift.opened', $shift, [
            'opening_cash' => $shift->opening_cash,
        ]);

        return redirect()->route('dashboard')->with('success', 'Shift kasir berhasil dibuka.');
    }

    public function close(Request $request, CashierShift $cashierShift): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user->isAdmin() || $cashierShift->user_id === $user->id, 403);

        $data = $request->validate([
            'closing_cash' => ['required', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        if (! $cashierShift->isOpen()) {
            return back()->withErrors(['shift' => 'Shift ini sudah ditutup.']);
        }

        $cashSales = $cashierShift->transactions()
            ->where('status', '!=', 'void')
            ->where('payment_type', 'cash')
            ->where('payment_status', 'paid')
            ->sum('total');
        $transferSales = $cashierShift->transactions()
            ->where('status', '!=', 'void')
            ->where('payment_type', 'transfer')
            ->where('payment_status', 'paid')
            ->sum('total');
        $pendingSales = $cashierShift->transactions()
            ->where('status', '!=', 'void')
            ->where('payment_status', 'pending')
            ->sum('total');
        $voidTotal = $cashierShift->transactions()
            ->where('status', 'void')
            ->sum('total');
        $expectedCash = $cashierShift->opening_cash + $cashSales;

        $cashierShift->update([
            'closed_at' => now(),
            'closing_cash' => $data['closing_cash'],
            'expected_cash' => $expectedCash,
            'cash_sales' => $cashSales,
            'transfer_sales' => $transferSales,
            'pending_sales' => $pendingSales,
            'void_total' => $voidTotal,
            'difference' => $data['closing_cash'] - $expectedCash,
            'notes' => trim(($cashierShift->notes ? $cashierShift->notes."\n" : '').($data['notes'] ?? '')) ?: null,
        ]);

        AuditLog::record('cashier_shift.closed', $cashierShift, [
            'closing_cash' => $cashierShift->closing_cash,
            'expected_cash' => $cashierShift->expected_cash,
            'difference' => $cashierShift->difference,
        ]);

        return redirect()->route('dashboard')->with('success', 'Shift kasir berhasil ditutup.');
    }
}
