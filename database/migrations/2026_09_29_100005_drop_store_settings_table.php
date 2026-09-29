<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('store_settings');
    }

    public function down(): void
    {
        // Intentionally not recreated — superseded by the stores table.
    }
};
