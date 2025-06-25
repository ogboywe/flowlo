<?php

namespace App\Models;

use App\Enums\SubscriptionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'stripe_subscription_id',
        'status',
        'plan_name',
        'plan_price',
        'billing_cycle',
        'current_period_start',
        'current_period_end',
        'trial_ends_at',
    ];

    protected $casts = [
        'status' => SubscriptionStatus::class,
        'plan_price' => 'decimal:2',
        'current_period_start' => 'datetime',
        'current_period_end' => 'datetime',
        'trial_ends_at' => 'datetime',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function isActive(): bool
    {
        return $this->status === SubscriptionStatus::ACTIVE;
    }
}
