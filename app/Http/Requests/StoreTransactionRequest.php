<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'created_at' => ['sometimes', 'required', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'distinct:strict', 'exists:products,id'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'items.*.discount_type' => ['nullable', 'in:amount,percent'],
            'items.*.discount_value' => ['nullable', 'integer', 'min:0'],
            'payment_type' => ['nullable', 'required_unless:payment_status,pending', 'in:cash,transfer'],
            'discount_per_product' => ['nullable', 'integer', 'min:0'],
            'uang_diterima' => ['nullable', 'integer', 'min:0'],
            'bank_name' => ['nullable', 'string', 'max:100'],
            'reference_number' => ['nullable', 'string', 'max:150'],
            'payment_status' => ['required', 'in:paid,pending'],
            'customer_name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
