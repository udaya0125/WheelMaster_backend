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
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_intent_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('price_id')->nullable()->constrained()->nullOnDelete();
            $table->string('buyer_name');
            $table->string('buyer_email');
            $table->string('code')->unique();
            $table->decimal('amount', 10, 2);
            $table->decimal('balance', 10, 2);
            $table->enum('status', ['active', 'used', 'expired', 'cancelled'])->default('active');
            $table->string('recipient_email')->nullable();
            $table->text('message')->nullable();
            $table->string('redeemed_by')->nullable();
            $table->timestamp('redeemed_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
