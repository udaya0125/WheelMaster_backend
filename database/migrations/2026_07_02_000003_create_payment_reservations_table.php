<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_intent_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_reservation_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['payment_intent_id', 'user_reservation_id'], 'pay_res_intent_res_unique');
            $table->unique('user_reservation_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_reservations');
    }
};
