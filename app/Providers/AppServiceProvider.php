<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\Expense;
use App\Models\Product;
use App\Models\StockIn;
use App\Models\StockOpname;
use App\Models\Supplier;
use App\Policies\OwnedRecordPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        foreach ([Product::class, Category::class, Supplier::class, StockIn::class, Expense::class, StockOpname::class] as $model) {
            Gate::policy($model, OwnedRecordPolicy::class);
        }

        if ($this->app->isProduction()) {
            URL::forceScheme('https');
        }
    }
}
