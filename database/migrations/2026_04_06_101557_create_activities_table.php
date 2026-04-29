<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // database/migrations/xxxx_xx_xx_xxxxxx_create_activities_table.php
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->string('name_ar');
            $table->enum('category', ['agpeya', 'bible', 'general', 'church']);
            $table->enum('type', ['daily', 'weekly', 'custom'])->default('daily');
            $table->string('icon')->default('Circle'); // Matches our React Lucide icons
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
