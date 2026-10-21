<?php

namespace Database\Seeders;

use App\Models\AppSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class LoginUserSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedUser('admin', 'admin', 'admin123', 'Admin Mawa Mart');
        $this->seedUser('cashier', 'kasir', 'kasir123', 'Kasir Mawa Mart');

        $this->seedSettings();
    }

    private function seedUser(string $role, string $defaultUsername, string $defaultPassword, string $defaultName): void
    {
        $prefix = strtoupper($role);
        $username = (string) (env("SEED_{$prefix}_USERNAME") ?: $defaultUsername);
        $password = (string) (env("SEED_{$prefix}_PASSWORD") ?: $defaultPassword);
        $name = (string) (env("SEED_{$prefix}_NAME") ?: $defaultName);
        $email = (string) (env("SEED_{$prefix}_EMAIL") ?: "{$username}@mawamart.local");

        $user = User::firstOrCreate(
            ['username' => $username],
            [
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'role' => $role,
                'status' => 'active',
            ]
        );

        if ($user->wasRecentlyCreated) {
            $this->command?->info("✓ Akun {$role} berhasil dibuat -> Username: {$username} | Password: {$password}");
        } else {
            $this->command?->info("- Akun {$role} [{$username}] sudah tersedia di database.");
        }
    }

    private function seedSettings(): void
    {
        try {
            if (Schema::hasTable('app_settings')) {
                AppSetting::updateReceiptSettings(AppSetting::receiptDefaults());
                $this->command?->info('✓ Pengaturan toko Mawa Mart berhasil diinisialisasi.');
            }
        } catch (\Throwable $e) {
            // Abaikan jika migrasi belum dijalankan
        }
    }
}

