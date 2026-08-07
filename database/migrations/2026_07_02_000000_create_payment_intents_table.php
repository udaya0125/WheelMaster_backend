<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // public function up(): void
    // {
    //     Schema::create('payment_intents', function (Blueprint $table) {
    //         $table->id();
    //         $table->uuid('uuid')->unique();
    //         $table->string('status')->default('created')->index();
    //         $table->unsignedInteger('amount_cents');
    //         $table->string('currency', 3)->default('AUD');
    //         $table->string('merchant_reference')->unique();
    //         $table->string('westpac_checkout_id')->nullable()->index();
    //         $table->text('westpac_checkout_url')->nullable();
    //         $table->string('hold_token', 64)->nullable()->index();
    //         $table->string('customer_name');
    //         $table->string('customer_email')->index();
    //         $table->string('customer_phone')->nullable();
    //         $table->json('customer_snapshot')->nullable();
    //         $table->json('booking_payload');
    //         $table->timestamp('expires_at')->nullable()->index();
    //         $table->timestamp('paid_at')->nullable();
    //         $table->timestamp('failed_at')->nullable();
    //         $table->timestamps();
    //     });
    // }

    public function down(): void
    {
        Schema::dropIfExists('payment_intents');
    }
};
