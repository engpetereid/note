<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tracking_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('activity_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->boolean('status')->default(true); // True if completed
            $table->timestamps();

            // Composite Index for ultra-fast daily dashboard queries
            $table->index(['user_id', 'date']);
            // Ensure a user can only log an activity once per day
            $table->unique(['user_id', 'activity_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tracking_logs');
    }
};
