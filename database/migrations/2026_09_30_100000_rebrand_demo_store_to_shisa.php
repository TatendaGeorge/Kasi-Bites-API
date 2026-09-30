<?php

use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Data-only migration: the demo store/owner seeded by DemoStoreSeeder before the
     * Shisa rebrand is live data, not just UI copy — update it in place rather than
     * re-seeding, so it doesn't disturb any other data created since.
     */
    public function up(): void
    {
        $owner = User::where('email', 'demo-owner@kasibites.test')->first();

        if ($owner) {
            $owner->update([
                'name' => 'Thandi Mokoena',
                'email' => 'demo-owner@shisa.test',
            ]);

            Store::where('owner_id', $owner->id)
                ->where('name', 'Kasi Bites')
                ->update([
                    'name' => "Mam' Thandi's Kotas",
                    'description' => 'Our signature kotas, combos, and drinks.',
                    'email' => 'demo-owner@shisa.test',
                ]);
        }
    }

    public function down(): void
    {
        // Not reversible: the pre-rebrand values aren't worth restoring.
    }
};
