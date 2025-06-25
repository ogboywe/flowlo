<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    public function view(User $user, Booking $booking): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isClient() && $user->id === $booking->client_id) {
            return true;
        }

        if ($user->isBarber() && $user->barberProfile && $user->barberProfile->id === $booking->barber_id) {
            return true;
        }

        if ($user->isShopOwner() && $user->ownedShops->contains($booking->shop_id)) {
            return true;
        }

        return false;
    }

    public function update(User $user, Booking $booking): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isClient() && $user->id === $booking->client_id) {
            return true;
        }

        if ($user->isBarber() && $user->barberProfile && $user->barberProfile->id === $booking->barber_id) {
            return true;
        }

        if ($user->isShopOwner() && $user->ownedShops->contains($booking->shop_id)) {
            return true;
        }

        return false;
    }

    public function delete(User $user, Booking $booking): bool
    {
        return $this->update($user, $booking);
    }
}
