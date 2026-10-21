<?php

namespace App\Http\Requests;

use App\Models\Transaction;
use Illuminate\Foundation\Http\FormRequest;

class SettleTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $transaction = $this->route('transaction');

        return $transaction instanceof Transaction
            && $this->user()?->can('settle', $transaction);
    }

    public function rules(): array
    {
        return [
            'payment_type' => ['required', 'in:cash,transfer'],
            'uang_diterima' => ['nullable', 'integer', 'min:0'],
            'bank_name' => ['nullable', 'string', 'max:100'],
            'reference_number' => ['nullable', 'string', 'max:150'],
        ];
    }
}
