<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_intent_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_intent_id')->constrained()->cascadeOnDelete();
            $table->foreignId('price_id')->nullable()->constrained()->nullOnDelete();
            $table->string('item_type')->default('lesson');
            $table->date('reservation_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->time('test_time')->nullable();
            $table->string('test_location')->nullable();
            $table->string('package_type')->nullable();
            $table->unsignedInteger('amount_cents');
            $table->json('package_snapshot')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['reservation_date', 'start_time']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_intent_items');
    }
};
