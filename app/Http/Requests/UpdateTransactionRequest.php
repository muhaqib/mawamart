<?php

namespace App\Http\Requests;

use App\Models\Transaction;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $transaction = $this->route('transaction');

        return $transaction instanceof Transaction
            && $this->user()?->can('update', $transaction);
    }

    public function rules(): array
    {
        return [
            'created_at' => ['required', 'date'],
            'paid_at' => ['sometimes', 'nullable', 'date'],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'payment_type' => ['required', 'in:cash,transfer'],
            'uang_diterima' => ['nullable', 'integer', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'distinct:strict', 'exists:products,id'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'items.*.discount_value' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
