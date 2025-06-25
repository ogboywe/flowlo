<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Shop;
use App\Models\Service;
use App\Models\Barber;
use App\Enums\UserRole;
use App\Enums\SubscriptionStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@flowlo.com',
            'password' => Hash::make('password'),
            'role' => UserRole::ADMIN,
        ]);

        $shopOwner = User::create([
            'name' => 'John Smith',
            'email' => 'owner@barbershop.com',
            'password' => Hash::make('password'),
            'role' => UserRole::SHOP_OWNER,
            'phone' => '+1234567890',
        ]);

        $barberUser = User::create([
            'name' => 'Mike Johnson',
            'email' => 'mike@barbershop.com',
            'password' => Hash::make('password'),
            'role' => UserRole::BARBER,
            'phone' => '+1234567891',
        ]);

        $client = User::create([
            'name' => 'David Wilson',
            'email' => 'client@example.com',
            'password' => Hash::make('password'),
            'role' => UserRole::CLIENT,
            'phone' => '+1234567892',
        ]);

        $shop = Shop::create([
            'owner_id' => $shopOwner->id,
            'name' => 'Elite Barbershop',
            'description' => 'Premium barbershop services in downtown',
            'address' => '123 Main Street',
            'city' => 'New York',
            'state' => 'NY',
            'zip_code' => '10001',
            'phone' => '+1234567890',
            'email' => 'info@elitebarbershop.com',
            'website' => 'https://elitebarbershop.com',
            'subscription_status' => SubscriptionStatus::ACTIVE,
        ]);

        $barber = Barber::create([
            'user_id' => $barberUser->id,
            'shop_id' => $shop->id,
            'bio' => 'Professional barber with 10+ years experience',
            'specialties' => ['Haircuts', 'Beard Trimming', 'Hot Towel Shaves'],
            'commission_rate' => 60.00,
        ]);

        Service::create([
            'shop_id' => $shop->id,
            'name' => 'Classic Haircut',
            'description' => 'Traditional haircut with styling',
            'price' => 35.00,
            'duration' => 45,
        ]);

        Service::create([
            'shop_id' => $shop->id,
            'name' => 'Beard Trim',
            'description' => 'Professional beard trimming and shaping',
            'price' => 25.00,
            'duration' => 30,
        ]);

        Service::create([
            'shop_id' => $shop->id,
            'name' => 'Hot Towel Shave',
            'description' => 'Luxury hot towel shave experience',
            'price' => 45.00,
            'duration' => 60,
        ]);
    }
}
