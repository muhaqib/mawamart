<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DashboardMetrics
{
    public function transactionProfit(Builder $transactionsQuery): int
    {
        return (int) DB::table('transaction_details')
            ->whereIn('transaction_details.transaction_id', (clone $transactionsQuery)->select('transactions.id'))
            ->sum(DB::raw($this->grossProfitExpression()));
    }

    public function transactionCapital(Builder $transactionsQuery): int
    {
        return (int) DB::table('transaction_details')
            ->whereIn('transaction_details.transaction_id', (clone $transactionsQuery)->select('transactions.id'))
            ->sum(DB::raw('transaction_details.harga_modal * transaction_details.qty'));
    }

    public function purchaseTotal(Builder $stockInQuery): int
    {
        return (int) $stockInQuery
            ->selectRaw('COALESCE(SUM(CASE WHEN subtotal > 0 THEN subtotal ELSE harga_beli * qty END), 0) as total_purchase')
            ->value('total_purchase');
    }

    public function financialChart(User $user, Carbon $periodStart, Carbon $periodEnd, string $groupBy = 'day'): Collection
    {
        $groupBy = $groupBy === 'month' ? 'month' : 'day';
        $transactionPeriodExpression = $this->periodExpression('created_at', $groupBy);
        $detailPeriodExpression = $this->periodExpression('transactions.created_at', $groupBy);
        $expensePeriodExpression = $this->periodExpression('spent_at', $groupBy);

        $baseTransactions = Transaction::visibleTo($user)
            ->whereBetween('created_at', [$periodStart->copy()->startOfDay(), $periodEnd->copy()->endOfDay()])
            ->where('status', '!=', 'void')
            ->where('payment_status', 'paid');

        $incomeByDate = (clone $baseTransactions)
            ->selectRaw($transactionPeriodExpression.' as date_key, COALESCE(SUM(total), 0) as income')
            ->groupBy('date_key')
            ->pluck('income', 'date_key')
            ->map(fn ($value): int => (int) $value);

        $detailByDate = DB::table('transaction_details')
            ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
            ->whereIn('transactions.id', (clone $baseTransactions)->select('transactions.id'))
            ->selectRaw($detailPeriodExpression.' as date_key')
            ->selectRaw('COALESCE(SUM(transaction_details.harga_modal * transaction_details.qty), 0) as capital')
            ->selectRaw('COALESCE(SUM('.$this->grossProfitExpression().'), 0) as gross_profit')
            ->groupBy('date_key')
            ->get()
            ->keyBy('date_key');

        $expenseByDate = Expense::query()
            ->whereDate('spent_at', '>=', $periodStart->toDateString())
            ->whereDate('spent_at', '<=', $periodEnd->toDateString())
            ->selectRaw($expensePeriodExpression.' as date_key, COALESCE(SUM(amount), 0) as expense')
            ->groupBy('date_key')
            ->pluck('expense', 'date_key')
            ->map(fn ($value): int => (int) $value);

        $periods = $this->chartPeriods($periodStart, $periodEnd, $groupBy);

        return $periods
            ->map(function (Carbon $period) use ($groupBy, $incomeByDate, $detailByDate, $expenseByDate): array {
                $dateKey = $groupBy === 'month' ? $period->format('Y-m') : $period->toDateString();
                $detail = $detailByDate->get($dateKey);
                $income = (int) ($incomeByDate[$dateKey] ?? 0);
                $expense = (int) ($expenseByDate[$dateKey] ?? 0);
                $capital = (int) ($detail?->capital ?? 0);
                $grossProfit = (int) ($detail?->gross_profit ?? 0);

                return [
                    'label' => $groupBy === 'month' ? $period->translatedFormat('M y') : $period->translatedFormat('d M'),
                    'income' => $income,
                    'expense' => $expense,
                    'capital' => $capital,
                    'gross_profit' => $grossProfit,
                    'net_profit' => $grossProfit - $expense,
                ];
            });
    }

    private function periodExpression(string $column, string $groupBy): string
    {
        if ($groupBy === 'day') {
            return 'DATE('.$column.')';
        }

        return DB::connection()->getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', ".$column.')'
            : 'DATE_FORMAT('.$column.", '%Y-%m')";
    }

    /**
     * @return Collection<int, Carbon>
     */
    private function chartPeriods(Carbon $periodStart, Carbon $periodEnd, string $groupBy): Collection
    {
        $periods = collect();
        $cursor = $groupBy === 'month' ? $periodStart->copy()->startOfMonth() : $periodStart->copy()->startOfDay();
        $last = $groupBy === 'month' ? $periodEnd->copy()->startOfMonth() : $periodEnd->copy()->startOfDay();

        while ($cursor->lte($last)) {
            $periods->push($cursor->copy());
            $groupBy === 'month' ? $cursor->addMonth() : $cursor->addDay();
        }

        return $periods;
    }

    private function grossProfitExpression(): string
    {
        return 'CAST(transaction_details.subtotal AS SIGNED) - (CAST(transaction_details.harga_modal AS SIGNED) * CAST(transaction_details.qty AS SIGNED))';
    }
}
