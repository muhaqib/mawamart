<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt([
            'username' => $credentials['username'],
            'password' => $credentials['password'],
            'status' => 'active',
        ], $request->boolean('remember'))) {
            AuditLog::record('auth.login_failed', null, [
                'username' => $credentials['username'],
            ]);

            return back()
                ->withErrors(['username' => 'Username atau password tidak sesuai.'])
                ->onlyInput('username');
        }

        $request->session()->regenerate();

        AuditLog::record('auth.login_success', $request->user());

        return redirect()->route('dashboard');
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user->isAdmin(), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'max:255',
                Rule::unique('users', 'username')->ignore($user->id),
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
        ]);

        $user->update($validated);

        AuditLog::record('user.profile_updated', $user);

        return redirect()
            ->route('dashboard', ['page' => 'settings', 'settings_tab' => 'profile'])
            ->with('success', 'Profil berhasil diperbarui.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            return back()
                ->withErrors(['current_password' => 'Password lama tidak sesuai.'])
                ->withInput(['page' => 'settings-password']);
        }

        $user->update([
            'password' => $validated['password'],
        ]);

        AuditLog::record('user.password_updated', $user);

        return redirect()
            ->route('dashboard', $user->isAdmin()
                ? ['page' => 'settings', 'settings_tab' => 'data']
                : ['page' => 'account'])
            ->with('success', 'Password berhasil diganti.');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('dashboard');
    }
}
