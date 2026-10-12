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
        Schema::table('user_reservations', function (Blueprint $table) {
            //
            $table->foreignId('voucher_id')->nullable()->after('user_name')->constrained()->nullOnDelete();
            $table->decimal('discount_amount', 10, 2)->default(0)->after('voucher_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_reservations', function (Blueprint $table) {
            //
            $table->dropColumn('voucher_id');
            $table->dropColumn('discount_amount');
        });
    }
};
