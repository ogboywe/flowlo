<?php

namespace App\Providers;

use App\Models\Shop;
use App\Models\Booking;
use App\Policies\ShopPolicy;
use App\Policies\BookingPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Shop::class => ShopPolicy::class,
        Booking::class => BookingPolicy::class,
    ];

    public function boot(): void
    {
        //
    }
}
