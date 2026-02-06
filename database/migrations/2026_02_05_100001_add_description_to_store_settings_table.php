<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('store_settings', function (Blueprint $table) {
            $table->string('description')->nullable()->after('type');
        });

        // Add descriptions to existing settings
        $descriptions = [
            'store_name' => 'The name of your store displayed to customers',
            'store_address' => 'Physical address of your store',
            'store_phone' => 'Contact phone number for customers',
            'store_email' => 'Contact email address',
            'delivery_fee' => 'Standard delivery fee in Rands',
            'minimum_order_amount' => 'Minimum order amount required for delivery',
            'delivery_radius_km' => 'Maximum delivery distance in kilometers',
            'operating_hours' => 'Store operating hours for each day',
            'is_store_open' => 'Toggle to temporarily close the store',
        ];

        foreach ($descriptions as $key => $description) {
            DB::table('store_settings')
                ->where('key', $key)
                ->update(['description' => $description]);
        }
    }

    public function down(): void
    {
        Schema::table('store_settings', function (Blueprint $table) {
            $table->dropColumn('description');
        });
    }
};
