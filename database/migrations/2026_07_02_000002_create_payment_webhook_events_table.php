<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // public function up(): void
    // {
    //     Schema::create('payment_webhook_events', function (Blueprint $table) {
    //         $table->id();
    //         $table->foreignId('payment_intent_id')->nullable()->constrained()->nullOnDelete();
    //         $table->string('event_id')->nullable()->unique();
    //         $table->string('event_type')->nullable()->index();
    //         $table->string('westpac_checkout_id')->nullable()->index();
    //         $table->string('status')->default('received')->index();
    //         $table->json('payload');
    //         $table->timestamp('processed_at')->nullable();
    //         $table->timestamps();
    //     });
    // }

    public function down(): void
    {
        Schema::dropIfExists('payment_webhook_events');
    }
};
