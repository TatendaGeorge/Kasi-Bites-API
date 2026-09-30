<?php

namespace Database\Seeders;

use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoStoreSeeder extends Seeder
{
    /**
     * Seeds one approved, open demo store owned by a dedicated (non-platform-admin)
     * user, so the PWA has something real to browse right after a fresh seed.
     */
    public function run(): void
    {
        $owner = User::firstOrCreate(
            ['email' => 'demo-owner@shisa.test'],
            [
                'name' => 'Thandi Mokoena',
                'password' => Hash::make(str()->random(32)),
                'is_admin' => false,
            ]
        );

        Store::firstOrCreate(
            ['owner_id' => $owner->id],
            [
                'name' => "Mam' Thandi's Kotas",
                'description' => 'Our signature kotas, combos, and drinks.',
                'address' => 'Mthatha, Eastern Cape',
                'phone' => '+27600000000',
                'email' => 'demo-owner@shisa.test',
                'latitude' => -33.011664,
                'longitude' => 27.866664,
                'delivery_fee' => 30.00,
                'delivery_radius_km' => 5.00,
                'minimum_order_amount' => 0,
                'is_open' => true,
                'is_active' => true,
            ]
        );
    }
}
