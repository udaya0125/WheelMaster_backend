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
        Schema::create('slot_holds', function (Blueprint $table) {
            $table->id();
            $table->string('hold_token', 64)->index();
            $table->date('reservation_date')->index();
            $table->string('segment_start');
            $table->timestamp('expires_at')->index();
            $table->timestamps();

            $table->unique(['reservation_date', 'segment_start']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('slot_holds');
    }
};
