<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed the application's admin user.
     *
     * Idempotent: safe to run on every deploy. Updates the password only
     * when ADMIN_PASSWORD is explicitly provided.
     */
    public function run(): void
    {
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');
        $exists = $email && User::where('email', $email)->exists();

        if (!$email || (!$password && !$exists)) {
            return;
        }

        $attributes = [
            'name' => env('ADMIN_NAME', 'Admin'),
            'is_admin' => true,
        ];

        if ($password) {
            $attributes['password'] = Hash::make($password);
        }

        User::updateOrCreate(['email' => $email], $attributes);
    }
}
