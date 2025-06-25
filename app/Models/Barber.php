<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Barber extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'shop_id',
        'bio',
        'specialties',
        'commission_rate',
        'is_active',
        'stripe_subscription_id',
        'subscription_status',
        'last_payment_date',
    ];

    protected $casts = [
        'specialties' => 'array',
        'commission_rate' => 'decimal:2',
        'is_active' => 'boolean',
        'last_payment_date' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function availability()
    {
        return $this->hasMany(Availability::class);
    }

    public function hasActiveSubscription(): bool
    {
        return $this->subscription_status === 'active';
    }

    public function canAcceptBookings(): bool
    {
        return $this->is_active && $this->hasActiveSubscription();
    }
}
