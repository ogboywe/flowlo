<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('bookings', 'payout_processed')) {
                $table->boolean('payout_processed')->default(false);
            }
            if (!Schema::hasColumn('bookings', 'payout_processed_at')) {
                $table->timestamp('payout_processed_at')->nullable();
            }
            if (!Schema::hasColumn('bookings', 'refund_amount')) {
                $table->decimal('refund_amount', 8, 2)->nullable();
            }
            if (!Schema::hasColumn('bookings', 'refund_reason')) {
                $table->text('refund_reason')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['payout_processed', 'payout_processed_at', 'refund_amount', 'refund_reason']);
        });
    }
};
