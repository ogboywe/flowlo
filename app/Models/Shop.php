<?php

namespace App\Models;

use App\Enums\SubscriptionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shop extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'name',
        'description',
        'address',
        'city',
        'state',
        'zip_code',
        'phone',
        'email',
        'website',
        'logo',
        'subscription_status',
        'stripe_account_id',
        'stripe_account_charges_enabled',
        'stripe_account_payouts_enabled',
        'rejection_reason',
    ];

    protected $casts = [
        'subscription_status' => SubscriptionStatus::class,
        'stripe_account_charges_enabled' => 'boolean',
        'stripe_account_payouts_enabled' => 'boolean',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function barbers()
    {
        return $this->hasMany(Barber::class);
    }

    public function services()
    {
        return $this->hasMany(Service::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function subscription()
    {
        return $this->hasOne(Subscription::class);
    }

    public function isActive(): bool
    {
        return $this->subscription_status === SubscriptionStatus::ACTIVE;
    }

    public function isPending(): bool
    {
        return $this->subscription_status === SubscriptionStatus::INACTIVE;
    }

    public function canAcceptPayments(): bool
    {
        return $this->isActive() && $this->stripe_account_charges_enabled;
    }
}
