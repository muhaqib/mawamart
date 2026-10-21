<?php

namespace App\Policies;

use App\Models\Transaction;
use App\Models\User;

class TransactionPolicy extends OwnedRecordPolicy
{
    public function view(User $user, Transaction $transaction): bool
    {
        return $user->isActive();
    }

    public function settle(User $user, Transaction $transaction): bool
    {
        return $this->update($user, $transaction);
    }

    public function verifyTransfer(User $user, Transaction $transaction): bool
    {
        return $user->isAdmin();
    }
}
