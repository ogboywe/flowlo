<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->onDelete('cascade');
            $table->string('stripe_subscription_id')->unique();
            $table->enum('status', ['active', 'inactive', 'cancelled', 'past_due'])->default('inactive');
            $table->string('plan_name');
            $table->decimal('plan_price', 8, 2);
            $table->string('billing_cycle')->default('monthly');
            $table->datetime('current_period_start');
            $table->datetime('current_period_end');
            $table->datetime('trial_ends_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
