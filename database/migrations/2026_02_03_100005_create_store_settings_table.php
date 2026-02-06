<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, number, boolean, json
            $table->timestamps();
        });

        // Insert default settings
        $defaults = [
            ['key' => 'store_name', 'value' => 'Kasi Bites', 'type' => 'string'],
            ['key' => 'store_address', 'value' => null, 'type' => 'string'],
            ['key' => 'store_phone', 'value' => null, 'type' => 'string'],
            ['key' => 'store_email', 'value' => null, 'type' => 'string'],
            ['key' => 'delivery_fee', 'value' => '30', 'type' => 'number'],
            ['key' => 'minimum_order_amount', 'value' => '50', 'type' => 'number'],
            ['key' => 'delivery_radius_km', 'value' => '10', 'type' => 'number'],
            ['key' => 'operating_hours', 'value' => json_encode([
                'monday' => ['open' => '09:00', 'close' => '21:00', 'is_open' => true],
                'tuesday' => ['open' => '09:00', 'close' => '21:00', 'is_open' => true],
                'wednesday' => ['open' => '09:00', 'close' => '21:00', 'is_open' => true],
                'thursday' => ['open' => '09:00', 'close' => '21:00', 'is_open' => true],
                'friday' => ['open' => '09:00', 'close' => '22:00', 'is_open' => true],
                'saturday' => ['open' => '10:00', 'close' => '22:00', 'is_open' => true],
                'sunday' => ['open' => '10:00', 'close' => '20:00', 'is_open' => true],
            ]), 'type' => 'json'],
            ['key' => 'is_store_open', 'value' => 'true', 'type' => 'boolean'],
        ];

        foreach ($defaults as $setting) {
            DB::table('store_settings')->insert([
                'key' => $setting['key'],
                'value' => $setting['value'],
                'type' => $setting['type'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('store_settings');
    }
};
