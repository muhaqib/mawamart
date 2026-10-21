<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StockOpnameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isActive() === true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'exists:products,id'],
            'actual_stock' => ['required', 'integer', 'min:0'],
            'reason' => ['required', 'string', 'max:1000'],
            'opname_date' => [$this->isMethod('post') ? 'nullable' : 'required', 'date'],
            'adjustment_id' => ['nullable', 'integer', 'exists:stock_adjustments,id'],
        ];
    }
}
