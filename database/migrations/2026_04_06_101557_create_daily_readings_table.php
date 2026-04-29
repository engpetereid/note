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
        Schema::create('daily_readings', function (Blueprint $table) {
            $table->id();
            $table->integer('day_number')->comment('1 to 366');
            $table->string('ot_passage_year_1')->nullable()->comment('العهد القديم السنة الأولي');
            $table->string('ot_passage_year_2')->nullable()->comment('العهد القديم السنة الثانية');
            $table->string('nt_passage')->nullable()->comment('العهد الجديد في سنة واحدة');
            $table->text('explanation')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_readings');
    }
};
