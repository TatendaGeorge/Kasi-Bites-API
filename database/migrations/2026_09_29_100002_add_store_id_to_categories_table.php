<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->foreignId('store_id')->after('id')->constrained()->cascadeOnDelete();
            $table->unique(['store_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropUnique(['store_id', 'slug']);
            $table->dropConstrainedForeignId('store_id');
            $table->unique('slug');
        });
    }
};
