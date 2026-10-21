<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExpenseRequest;
use App\Models\AuditLog;
use App\Models\Expense;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ExpenseController extends Controller
{
    public function store(ExpenseRequest $request): RedirectResponse
    {
        $data = $request->expenseData();

        if ($request->hasFile('attachment')) {
            $data['attachment'] = $request->file('attachment')->store('expenses');
        }

        $expense = Expense::create([
            ...$data,
            'user_id' => $request->user()->id,
        ]);

        AuditLog::record('expense.created', $expense, [
            'uraian' => $expense->uraian,
            'amount' => $expense->amount,
        ]);

        $spentAt = $expense->spent_at->toDateString();

        return redirect()->route('dashboard', [
            'page' => 'operations',
            'start_date' => $spentAt,
            'end_date' => $spentAt,
        ])->with('success', 'Pengeluaran berhasil ditambahkan.');
    }

    public function update(ExpenseRequest $request, Expense $expense): RedirectResponse
    {
        $this->authorize('update', $expense);

        $data = $request->expenseData();

        if ($request->hasFile('attachment')) {
            $this->deleteAttachment($expense);
            $data['attachment'] = $request->file('attachment')->store('expenses');
        } else {
            unset($data['attachment']);
        }

        $expense->update($data);

        AuditLog::record('expense.updated', $expense, [
            'uraian' => $expense->uraian,
            'amount' => $expense->amount,
        ]);

        return redirect()->route('dashboard', ['page' => 'operations'])->with('success', 'Pengeluaran berhasil diperbarui.');
    }

    public function destroy(Request $request, Expense $expense): RedirectResponse
    {
        $this->authorize('delete', $expense);

        $this->deleteAttachment($expense);

        AuditLog::record('expense.deleted', $expense, [
            'uraian' => $expense->uraian ?? $expense->description,
            'amount' => $expense->amount,
        ]);

        $expense->delete();

        return redirect()->route('dashboard', ['page' => 'operations'])->with('success', 'Pengeluaran berhasil dihapus.');
    }

    public function print(Request $request): View
    {
        $filters = $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);
        $startDate = $filters['start_date'] ?? now()->toDateString();
        $endDate = $filters['end_date'] ?? now()->toDateString();
        $expenses = Expense::with('user')
            ->whereDate('spent_at', '>=', $startDate)
            ->whereDate('spent_at', '<=', $endDate)
            ->orderByDesc('spent_at')
            ->orderByDesc('id')
            ->get();

        AuditLog::record('expense.printed', null, [
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);

        return view('expenses.print', [
            'expenses' => $expenses,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);
    }

    public function attachment(Expense $expense): BinaryFileResponse
    {
        abort_unless($expense->attachment, 404);

        $disk = Storage::disk('local');
        abort_unless($disk->exists($expense->attachment), 404);

        AuditLog::record('expense.attachment_viewed', $expense);

        return response()->file($disk->path($expense->attachment));
    }

    private function deleteAttachment(Expense $expense): void
    {
        if ($expense->attachment && Storage::disk('local')->exists($expense->attachment)) {
            Storage::disk('local')->delete($expense->attachment);
        }
    }
}
