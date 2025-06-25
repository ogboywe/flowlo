<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'role' => UserRole::class,
    ];

    public function ownedShops()
    {
        return $this->hasMany(Shop::class, 'owner_id');
    }

    public function barberProfile()
    {
        return $this->hasOne(Barber::class);
    }

    public function clientBookings()
    {
        return $this->hasMany(Booking::class, 'client_id');
    }

    public function isClient(): bool
    {
        return $this->role === UserRole::CLIENT;
    }

    public function isBarber(): bool
    {
        return $this->role === UserRole::BARBER;
    }

    public function isShopOwner(): bool
    {
        return $this->role === UserRole::SHOP_OWNER;
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::ADMIN;
    }
}
