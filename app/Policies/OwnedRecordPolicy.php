<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class OwnedRecordPolicy
{
    public function update(User $user, Model $record): bool
    {
        return $user->isActive()
            && ($user->isAdmin() || ($record->user_id !== null && (int) $record->user_id === (int) $user->id));
    }

    public function delete(User $user, Model $record): bool
    {
        return $this->update($user, $record);
    }
}
