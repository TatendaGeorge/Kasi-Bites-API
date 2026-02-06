<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('default_address_latitude', 10, 8)->nullable()->after('default_address');
            $table->decimal('default_address_longitude', 11, 8)->nullable()->after('default_address_latitude');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['default_address_latitude', 'default_address_longitude']);
        });
    }
};
