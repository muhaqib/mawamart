<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StockInRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isActive() === true
            && (! $this->route('stockIn') || $this->user()->can('update', $this->route('stockIn')));
    }

    public function rules(): array
    {
        return [
            'invoice_number' => ['nullable', 'string', 'max:100'],
            'tanggal' => ['required', 'date'],
            'product_id' => ['required', 'exists:products,id'],
            'qty' => ['required', 'integer', 'min:1'],
            'supplier' => ['nullable', 'string', 'max:150'],
            'keterangan' => ['nullable', 'string', 'max:1000'],
            'harga_modal' => ['nullable', 'integer', 'min:0'],
            'harga_beli' => ['nullable', 'integer', 'min:0'],
            'harga_jual' => ['nullable', 'integer', 'min:0'],
            'discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'discount_amount' => ['nullable', 'integer', 'min:0'],
            'subtotal' => ['nullable', 'integer', 'min:0'],
            'kode_barang' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('products', 'kode_barang')->ignore($this->input('product_id')),
            ],
            'barcode' => ['nullable', 'string', 'max:50'],
            'stock_unlimited' => ['nullable', Rule::in(['yes', 'no'])],
            'expired_at' => ['nullable', 'date'],
            'nota_pembelian' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
            'surat_jalan' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $qty = max(0, (int) $this->input('qty', 0));
            $price = max(0, (int) ($this->input('harga_beli') ?? $this->input('harga_modal', 0)));
            $discount = max(0, (int) $this->input('discount_amount', 0));

            if ($discount > ($qty * $price)) {
                $validator->errors()->add('discount_amount', 'Diskon tidak boleh melebihi nilai pembelian.');
            }
        }];
    }

    public function stockData(): array
    {
        $data = $this->validated();
        $data['harga_beli'] = (int) ($data['harga_beli'] ?? $data['harga_modal'] ?? 0);
        $data['harga_modal'] = (int) ($data['harga_modal'] ?? $data['harga_beli']);
        $data['harga_jual'] = (int) ($data['harga_jual'] ?? 0);
        $data['discount_percent'] = (float) ($data['discount_percent'] ?? 0);
        $data['discount_amount'] = (int) ($data['discount_amount'] ?? 0);
        $data['subtotal'] = max(0, ($data['harga_beli'] * (int) $data['qty']) - $data['discount_amount']);
        $data['barcode'] = $data['barcode'] ?? $data['kode_barang'] ?? null;

        return $data;
    }
}
