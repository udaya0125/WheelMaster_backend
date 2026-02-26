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
        Schema::create('user_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('price_id')->constrained()->onDelete('cascade');
            $table->string('user_name');
            $table->string('email');
            $table->string('phone');
            $table->string('address');
            $table->string('pickup_location')->nullable();
            $table->string('dropoff_location')->nullable();
            $table->string('package_type');
            $table->date('reservation_date');
            $table->string('start_time');
            $table->string('end_time');
            $table->string('test_time')->nullable();
            $table->string('status')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_reservations');
    }
};
