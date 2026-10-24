<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CashierController;
use App\Http\Controllers\CashierShiftController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReceiptSettingController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StockInController;
use App\Http\Controllers\StockOpnameController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

Route::get('/', DashboardController::class)->name('dashboard');

Route::get('/login', function () {
    return view('auth.login');
})->name('login.form');

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1')
    ->name('login');

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth')
    ->name('logout');

Route::middleware(['auth', 'active'])->group(function (): void {

    Route::post('/transactions', [TransactionController::class, 'store'])
        ->name('transactions.store');

    Route::put('/transactions/{transaction}', [TransactionController::class, 'update'])
        ->name('transactions.update');

    Route::get('/transactions/{transaction}/receipt', [TransactionController::class, 'receipt'])
        ->name('transactions.receipt');

    Route::get('/transactions/{transaction}/receipt-pdf', [TransactionController::class, 'receiptPdf'])
        ->name('transactions.receipt-pdf');

    Route::get('/transactions/{transaction}/receipt-jpeg', [TransactionController::class, 'receiptJpeg'])
        ->name('transactions.receipt-jpeg');

    Route::get('/transactions/{transaction}/thermal-payload', [TransactionController::class, 'thermalPayload'])
        ->name('transactions.thermal-payload');

    Route::post('/transactions/{transaction}/thermal-receipt', [TransactionController::class, 'printThermal'])
        ->name('transactions.thermal-receipt');

    Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy'])
        ->name('transactions.destroy');

    Route::put('/transactions/{transaction}/settle', [TransactionController::class, 'settle'])
        ->name('transactions.settle');

    Route::put('/transactions/{transaction}/verify-transfer', [TransactionController::class, 'verifyTransfer'])
        ->name('transactions.verify-transfer');

    Route::post('/cashier-shifts', [CashierShiftController::class, 'open'])
        ->name('cashier-shifts.open');

    Route::put('/cashier-shifts/{cashierShift}/close', [CashierShiftController::class, 'close'])
        ->name('cashier-shifts.close');

    Route::put('/profile', [AuthController::class, 'updateProfile'])
        ->name('profile.update');

    Route::put('/password', [AuthController::class, 'updatePassword'])
        ->name('password.update');

    Route::post('/products', [ProductController::class, 'store'])
        ->name('products.store');

    Route::put('/products/{product}', [ProductController::class, 'update'])
        ->name('products.update');

    Route::delete('/products/{product}', [ProductController::class, 'destroy'])
        ->name('products.destroy');

    Route::resource('departments', \App\Http\Controllers\DepartmentController::class)->only(['store', 'update', 'destroy']);
    Route::resource('subcategories', \App\Http\Controllers\SubcategoryController::class)->only(['store', 'update', 'destroy']);

    Route::post('/categories', [CategoryController::class, 'store'])
        ->name('categories.store');

    Route::put('/categories/{category}', [CategoryController::class, 'update'])
        ->name('categories.update');

    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])
        ->name('categories.destroy');

    Route::post('/suppliers', [SupplierController::class, 'store'])
        ->name('suppliers.store');

    Route::put('/suppliers/{supplier}', [SupplierController::class, 'update'])
        ->name('suppliers.update');

    Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])
        ->name('suppliers.destroy');

    Route::post('/stock-ins', [StockInController::class, 'store'])
        ->name('stock-ins.store');

    Route::put('/stock-ins/{stockIn}', [StockInController::class, 'update'])
        ->name('stock-ins.update');

    Route::delete('/stock-ins/{stockIn}', [StockInController::class, 'destroy'])
        ->name('stock-ins.destroy');

    Route::post('/stock-opnames', [StockOpnameController::class, 'store'])
        ->name('stock-opnames.store');

    Route::put('/stock-opnames/{stockOpname}/date', [StockOpnameController::class, 'updateDate'])
        ->name('stock-opnames.update-date');

    Route::put('/stock-opnames/{stockOpname}', [StockOpnameController::class, 'update'])
        ->name('stock-opnames.update');

    Route::delete('/stock-opnames/{stockOpname}', [StockOpnameController::class, 'destroy'])
        ->name('stock-opnames.destroy');

    Route::post('/expenses', [ExpenseController::class, 'store'])
        ->name('expenses.store');

    Route::get('/expenses/print', [ExpenseController::class, 'print'])
        ->name('expenses.print');

    Route::put('/expenses/{expense}', [ExpenseController::class, 'update'])
        ->name('expenses.update');

    Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy'])
        ->name('expenses.destroy');

    Route::get('/expenses/{expense}/attachment', [ExpenseController::class, 'attachment'])
        ->name('expenses.attachment');

    Route::get('/stock-ins/{stockIn}/documents/{document}', [StockInController::class, 'document'])
        ->whereIn('document', ['nota_pembelian', 'surat_jalan'])
        ->name('stock-ins.document');

    Route::get('/reports/export-csv', [ReportController::class, 'exportCsv'])
        ->name('reports.export-csv');

    Route::get('/transactions/export-excel', [TransactionController::class, 'exportExcel'])
        ->name('transactions.export-excel');

    Route::get('/transactions/export-pdf', [TransactionController::class, 'exportPdf'])
        ->name('transactions.export-pdf');

    Route::middleware('role:admin')->group(function (): void {

        Route::post('/cashiers', [CashierController::class, 'store'])
            ->name('cashiers.store');

        Route::put('/cashiers/{cashier}', [CashierController::class, 'update'])
            ->name('cashiers.update');

        Route::delete('/cashiers/{cashier}', [CashierController::class, 'destroy'])
            ->name('cashiers.destroy');

        Route::put('/cashiers/{cashier}/reset-password', [CashierController::class, 'resetPassword'])
            ->name('cashiers.reset-password');

        Route::put('/settings/receipt', [ReceiptSettingController::class, 'update'])
            ->name('settings.receipt.update');
    });
});
