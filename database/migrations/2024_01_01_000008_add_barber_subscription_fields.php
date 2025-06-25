<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barbers', function (Blueprint $table) {
            if (!Schema::hasColumn('barbers', 'stripe_subscription_id')) {
                $table->string('stripe_subscription_id')->nullable();
            }
            if (!Schema::hasColumn('barbers', 'subscription_status')) {
                $table->enum('subscription_status', ['active', 'inactive', 'past_due', 'cancelled', 'incomplete'])->default('inactive');
            }
            if (!Schema::hasColumn('barbers', 'last_payment_date')) {
                $table->timestamp('last_payment_date')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('barbers', function (Blueprint $table) {
            $table->dropColumn(['stripe_subscription_id', 'subscription_status', 'last_payment_date']);
        });
    }
};
