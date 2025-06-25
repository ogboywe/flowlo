<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shops', function (Blueprint $table) {
            if (!Schema::hasColumn('shops', 'stripe_account_charges_enabled')) {
                $table->boolean('stripe_account_charges_enabled')->default(false);
            }
            if (!Schema::hasColumn('shops', 'stripe_account_payouts_enabled')) {
                $table->boolean('stripe_account_payouts_enabled')->default(false);
            }
            if (!Schema::hasColumn('shops', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('shops', function (Blueprint $table) {
            $table->dropColumn(['stripe_account_charges_enabled', 'stripe_account_payouts_enabled', 'rejection_reason']);
        });
    }
};
