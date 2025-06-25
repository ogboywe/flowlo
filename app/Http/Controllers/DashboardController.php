<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Shop;
use App\Models\User;
use App\Enums\BookingStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();
        
        if ($user->isAdmin()) {
            return $this->adminStats();
        } elseif ($user->isShopOwner()) {
            return $this->shopOwnerStats($user);
        } elseif ($user->isBarber()) {
            return $this->barberStats($user);
        } else {
            return $this->clientStats($user);
        }
    }

    private function adminStats()
    {
        $totalShops = Shop::count();
        $activeShops = Shop::where('subscription_status', 'active')->count();
        $totalUsers = User::count();
        $totalBookings = Booking::count();
        $monthlyRevenue = Booking::where('status', BookingStatus::COMPLETED)
            ->whereMonth('created_at', now()->month)
            ->sum('total_price');

        return response()->json([
            'total_shops' => $totalShops,
            'active_shops' => $activeShops,
            'total_users' => $totalUsers,
            'total_bookings' => $totalBookings,
            'monthly_revenue' => $monthlyRevenue,
        ]);
    }

    private function shopOwnerStats($user)
    {
        $shopIds = $user->ownedShops->pluck('id');
        
        $totalBookings = Booking::whereIn('shop_id', $shopIds)->count();
        $pendingBookings = Booking::whereIn('shop_id', $shopIds)
            ->where('status', BookingStatus::PENDING)->count();
        $monthlyRevenue = Booking::whereIn('shop_id', $shopIds)
            ->where('status', BookingStatus::COMPLETED)
            ->whereMonth('created_at', now()->month)
            ->sum('total_price');
        $totalBarbers = DB::table('barbers')
            ->whereIn('shop_id', $shopIds)
            ->where('is_active', true)
            ->count();

        return response()->json([
            'total_bookings' => $totalBookings,
            'pending_bookings' => $pendingBookings,
            'monthly_revenue' => $monthlyRevenue,
            'total_barbers' => $totalBarbers,
        ]);
    }

    private function barberStats($user)
    {
        $barber = $user->barberProfile;
        if (!$barber) {
            return response()->json(['message' => 'Barber profile not found'], 404);
        }

        $totalBookings = $barber->bookings()->count();
        $pendingBookings = $barber->bookings()
            ->where('status', BookingStatus::PENDING)->count();
        $monthlyEarnings = $barber->bookings()
            ->where('status', BookingStatus::COMPLETED)
            ->whereMonth('created_at', now()->month)
            ->sum(DB::raw('total_price * commission_rate / 100'));

        return response()->json([
            'total_bookings' => $totalBookings,
            'pending_bookings' => $pendingBookings,
            'monthly_earnings' => $monthlyEarnings,
        ]);
    }

    private function clientStats($user)
    {
        $totalBookings = $user->clientBookings()->count();
        $upcomingBookings = $user->clientBookings()
            ->where('booking_datetime', '>', now())
            ->where('status', '!=', BookingStatus::CANCELLED)
            ->count();

        return response()->json([
            'total_bookings' => $totalBookings,
            'upcoming_bookings' => $upcomingBookings,
        ]);
    }

    public function recentBookings(Request $request)
    {
        $user = $request->user();
        
        $query = Booking::with(['client', 'barber.user', 'service', 'shop']);
        
        if ($user->isClient()) {
            $query->where('client_id', $user->id);
        } elseif ($user->isBarber()) {
            $barber = $user->barberProfile;
            if ($barber) {
                $query->where('barber_id', $barber->id);
            }
        } elseif ($user->isShopOwner()) {
            $shopIds = $user->ownedShops->pluck('id');
            $query->whereIn('shop_id', $shopIds);
        }
        
        $bookings = $query->orderBy('booking_datetime', 'desc')->limit(10)->get();
        
        return response()->json($bookings);
    }
}
