<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DashboardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'page' => ['nullable', 'string', 'max:80'],
            'data_page' => ['nullable', 'integer', 'min:1'],
            'period_month' => ['nullable', 'date_format:Y-m'],
            'report_scope' => ['nullable', 'in:month,year,all'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'payment_status' => ['nullable', 'in:paid,pending'],
            'payment_type' => ['nullable', 'in:cash,transfer'],
        ];
    }
}
