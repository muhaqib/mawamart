<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CashierController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $data['email'] = $data['username'].'@dalwa-water.local';
        $data['password'] = Hash::make($data['password']);

        $cashier = User::create($data);

        AuditLog::record('user.created', $cashier);

        return $this->redirectToUsers()->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function update(Request $request, User $cashier): RedirectResponse
    {
        $data = $this->validated($request, $cashier);
        $data['email'] = $data['username'].'@dalwa-water.local';

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        DB::transaction(function () use ($cashier, $data): void {
            $lockedUser = User::lockForUpdate()->findOrFail($cashier->id);
            $removesActiveAdmin = $lockedUser->role === 'admin'
                && $lockedUser->status === 'active'
                && ($data['role'] !== 'admin' || $data['status'] !== 'active');

            if ($removesActiveAdmin) {
                $otherActiveAdmins = User::query()
                    ->whereKeyNot($lockedUser->id)
                    ->where('role', 'admin')
                    ->where('status', 'active')
                    ->lockForUpdate()
                    ->count();

                if ($otherActiveAdmins === 0) {
                    throw ValidationException::withMessages([
                        'role' => 'Admin aktif terakhir tidak dapat dinonaktifkan atau diubah menjadi kasir.',
                    ]);
                }
            }

            $lockedUser->update($data);
            AuditLog::record('user.updated', $lockedUser);
        });

        return $this->redirectToUsers()->with('success', 'Pengguna berhasil diperbarui.');
    }

    public function resetPassword(Request $request, User $cashier): RedirectResponse
    {
        $data = $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        $cashier->update(['password' => Hash::make($data['password'])]);

        AuditLog::record('user.password_reset', $cashier);

        return $this->redirectToUsers()->with('success', 'Kata sandi berhasil direset.');
    }

    public function destroy(Request $request, User $cashier): RedirectResponse
    {
        DB::transaction(function () use ($request, $cashier): void {
            $lockedUser = User::lockForUpdate()->findOrFail($cashier->id);

            if ($request->user()->is($lockedUser)) {
                throw ValidationException::withMessages([
                    'user' => 'Akun yang sedang digunakan tidak dapat dihapus.',
                ]);
            }

            if ($lockedUser->hasOperationalHistory()) {
                throw ValidationException::withMessages([
                    'user' => 'Pengguna sudah memiliki riwayat transaksi atau aktivitas operasional. Nonaktifkan akun ini sebagai gantinya.',
                ]);
            }

            if ($lockedUser->role === 'admin' && $lockedUser->status === 'active') {
                $otherActiveAdmins = User::query()
                    ->whereKeyNot($lockedUser->id)
                    ->where('role', 'admin')
                    ->where('status', 'active')
                    ->lockForUpdate()
                    ->count();

                if ($otherActiveAdmins === 0) {
                    throw ValidationException::withMessages([
                        'user' => 'Admin aktif terakhir tidak dapat dihapus.',
                    ]);
                }
            }

            AuditLog::record('user.deleted', $lockedUser, [
                'name' => $lockedUser->name,
                'username' => $lockedUser->username,
                'role' => $lockedUser->role,
            ]);
            $lockedUser->delete();
        });

        return $this->redirectToUsers()->with('success', 'Pengguna berhasil dihapus.');
    }

    private function validated(Request $request, ?User $user = null): array
    {
        $passwordRule = $user ? ['nullable', 'string', 'min:8'] : ['required', 'string', 'min:8'];

        return $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'username' => ['required', 'string', 'max:80', Rule::unique('users', 'username')->ignore($user)],
            'password' => $passwordRule,
            'role' => ['required', Rule::in(['admin', 'cashier'])],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);
    }

    private function redirectToUsers(): RedirectResponse
    {
        return redirect()->route('dashboard', [
            'page' => 'settings',
            'settings_tab' => 'users',
        ]);
    }
}
