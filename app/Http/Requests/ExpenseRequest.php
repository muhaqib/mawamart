<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isActive() === true
            && (! $this->route('expense') || $this->user()->can('update', $this->route('expense')));
    }

    public function rules(): array
    {
        return [
            'spent_at' => ['required', 'date'],
            'uraian' => ['required', 'string', 'max:255'],
            'volume' => ['required', 'numeric', 'min:0'],
            'unit' => ['required', 'string', 'max:50'],
            'price' => ['required', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'attachment' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
        ];
    }

    public function expenseData(): array
    {
        $data = $this->validated();
        $data['category'] = 'Operasional';
        $data['description'] = $data['uraian'];
        $data['volume'] = (float) $data['volume'];
        $data['price'] = (int) $data['price'];
        $data['amount'] = (int) round($data['volume'] * $data['price']);

        return $data;
    }
}
