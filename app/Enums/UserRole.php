<?php

namespace App\Enums;

enum UserRole: string
{
    case CLIENT = 'client';
    case BARBER = 'barber';
    case SHOP_OWNER = 'shop_owner';
    case ADMIN = 'admin';

    public function label(): string
    {
        return match($this) {
            self::CLIENT => 'Client',
            self::BARBER => 'Barber',
            self::SHOP_OWNER => 'Shop Owner',
            self::ADMIN => 'Admin',
        };
    }
}
