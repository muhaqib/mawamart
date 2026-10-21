<?php

namespace Tests\Feature;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_edit_a_user(): void
    {
        $admin = $this->user('admin', 'admin-editor');
        $cashier = $this->user('cashier', 'cashier-lama');

        $this->actingAs($admin)->put(route('cashiers.update', $cashier), [
            'name' => 'Kasir Baru',
            'username' => 'cashier-baru',
            'password' => 'password-baru',
            'role' => 'admin',
            'status' => 'inactive',
        ])->assertSessionHasNoErrors()
            ->assertRedirect(route('dashboard', ['page' => 'settings', 'settings_tab' => 'users']));

        $cashier->refresh();

        $this->assertSame('Kasir Baru', $cashier->name);
        $this->assertSame('cashier-baru', $cashier->username);
        $this->assertSame('admin', $cashier->role);
        $this->assertSame('inactive', $cashier->status);
        $this->assertTrue(Hash::check('password-baru', $cashier->password));
    }

    public function test_admin_can_delete_a_user_without_operational_history(): void
    {
        $admin = $this->user('admin', 'admin-delete');
        $cashier = $this->user('cashier', 'cashier-kosong');

        $this->actingAs($admin)
            ->delete(route('cashiers.destroy', $cashier))
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('dashboard', ['page' => 'settings', 'settings_tab' => 'users']));

        $this->assertDatabaseMissing('users', ['id' => $cashier->id]);
    }

    public function test_user_with_transactions_cannot_be_deleted_and_can_be_deactivated(): void
    {
        $admin = $this->user('admin', 'admin-history');
        $cashier = $this->user('cashier', 'cashier-history');

        Transaction::create([
            'kode_transaksi' => 'TRX-HISTORY-001',
            'user_id' => $cashier->id,
            'total' => 10000,
            'payment_type' => 'cash',
            'uang_diterima' => 10000,
            'kembalian' => 0,
            'payment_status' => 'paid',
            'status' => 'completed',
        ]);

        $this->actingAs($admin)
            ->delete(route('cashiers.destroy', $cashier))
            ->assertSessionHasErrors('user');

        $this->assertDatabaseHas('users', ['id' => $cashier->id, 'status' => 'active']);

        $this->actingAs($admin)->put(route('cashiers.update', $cashier), [
            'name' => $cashier->name,
            'username' => $cashier->username,
            'role' => $cashier->role,
            'status' => 'inactive',
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('users', ['id' => $cashier->id, 'status' => 'inactive']);
    }

    public function test_cashier_cannot_delete_users(): void
    {
        $cashier = $this->user('cashier', 'cashier-actor');
        $otherCashier = $this->user('cashier', 'cashier-target');

        $this->actingAs($cashier)
            ->delete(route('cashiers.destroy', $otherCashier))
            ->assertForbidden();

        $this->assertDatabaseHas('users', ['id' => $otherCashier->id]);
    }

    public function test_admin_cannot_delete_the_account_currently_in_use(): void
    {
        $admin = $this->user('admin', 'admin-current');

        $this->actingAs($admin)
            ->delete(route('cashiers.destroy', $admin))
            ->assertSessionHasErrors('user');

        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_user_list_only_exposes_delete_for_accounts_without_history(): void
    {
        $admin = $this->user('admin', 'admin-list');
        $emptyCashier = $this->user('cashier', 'cashier-empty-list');
        $historyCashier = $this->user('cashier', 'cashier-history-list');

        Transaction::create([
            'kode_transaksi' => 'TRX-HISTORY-UI',
            'user_id' => $historyCashier->id,
            'total' => 12000,
            'payment_type' => 'cash',
            'uang_diterima' => 12000,
            'kembalian' => 0,
            'payment_status' => 'paid',
            'status' => 'completed',
        ]);

        $props = $this->reactProps(
            $this->actingAs($admin)->get(route('dashboard', [
                'page' => 'settings',
                'settings_tab' => 'users',
            ]))->assertOk()
        );
        $users = collect($props['cashiers'])->keyBy('id');

        $this->assertNotNull($users[$emptyCashier->id]['destroy_url']);
        $this->assertFalse($users[$emptyCashier->id]['has_transactions']);
        $this->assertNull($users[$historyCashier->id]['destroy_url']);
        $this->assertTrue($users[$historyCashier->id]['has_transactions']);
        $this->assertSame(1, $users[$historyCashier->id]['transactions_count']);
        $this->assertNull($users[$admin->id]['destroy_url']);
    }

    private function user(string $role, string $username): User
    {
        return User::factory()->create([
            'username' => $username,
            'role' => $role,
            'status' => 'active',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function reactProps(TestResponse $response): array
    {
        preg_match("/window\\.__DALWA_APP__ = JSON\\.parse\\('(.+)'\\);/s", $response->getContent(), $matches);

        $this->assertNotEmpty($matches, 'React props were not rendered.');

        $json = json_decode('"'.$matches[1].'"', true, flags: JSON_THROW_ON_ERROR);

        return json_decode($json, true, flags: JSON_THROW_ON_ERROR);
    }
}
