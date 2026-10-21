<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class LoginUserSeeder extends Seeder
{
    public function run(): void
    {
        $this->createFromEnvironment('admin');
        $this->createFromEnvironment('cashier');
    }

    private function createFromEnvironment(string $role): void
    {
        $prefix = strtoupper($role);
        $username = env("SEED_{$prefix}_USERNAME");
        $password = env("SEED_{$prefix}_PASSWORD");

        if (! is_string($username) || $username === '' || ! is_string($password) || $password === '') {
            $this->command?->warn("Akun {$role} tidak dibuat karena kredensial SEED_{$prefix}_* tidak diisi.");

            return;
        }

        User::firstOrCreate(
            ['username' => $username],
            [
                'name' => env("SEED_{$prefix}_NAME", ucfirst($role).' Dalwa'),
                'email' => env("SEED_{$prefix}_EMAIL", $username.'@dalwa-water.local'),
                'password' => Hash::make($password),
                'role' => $role,
                'status' => 'active',
            ]
        );
    }
}
