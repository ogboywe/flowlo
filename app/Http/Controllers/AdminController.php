<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use App\Models\User;
use App\Enums\SubscriptionStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (!$request->user()->isAdmin()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            return $next($request);
        });
    }

    public function pendingShops(Request $request)
    {
        $shops = Shop::where('subscription_status', SubscriptionStatus::INACTIVE)
            ->with(['owner', 'services', 'barbers'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($shops);
    }

    public function approveShop(Request $request, Shop $shop)
    {
        if ($shop->subscription_status !== SubscriptionStatus::INACTIVE) {
            return response()->json(['message' => 'Shop is not pending approval'], 400);
        }

        $shop->update(['subscription_status' => SubscriptionStatus::ACTIVE]);

        try {
            Mail::to($shop->owner->email)->send(new \App\Mail\ShopApproved($shop));
        } catch (\Exception $e) {
        }

        return response()->json([
            'message' => 'Shop approved successfully',
            'shop' => $shop->load(['owner', 'subscription'])
        ]);
    }

    public function rejectShop(Request $request, Shop $shop)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        if ($shop->subscription_status !== SubscriptionStatus::INACTIVE) {
            return response()->json(['message' => 'Shop is not pending approval'], 400);
        }

        $shop->update([
            'subscription_status' => SubscriptionStatus::CANCELLED,
            'rejection_reason' => $request->reason,
        ]);

        try {
            Mail::to($shop->owner->email)->send(new \App\Mail\ShopRejected($shop, $request->reason));
        } catch (\Exception $e) {
        }

        return response()->json([
            'message' => 'Shop rejected successfully',
            'shop' => $shop->load(['owner'])
        ]);
    }

    public function allShops(Request $request)
    {
        $query = Shop::with(['owner', 'subscription']);

        if ($request->status) {
            $query->where('subscription_status', $request->status);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhereHas('owner', function ($ownerQuery) use ($request) {
                      $ownerQuery->where('name', 'like', "%{$request->search}%")
                                 ->orWhere('email', 'like', "%{$request->search}%");
                  });
            });
        }

        $shops = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($shops);
    }

    public function allUsers(Request $request)
    {
        $query = User::with(['ownedShops', 'barberProfile.shop']);

        if ($request->role) {
            $query->where('role', $request->role);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($users);
    }

    public function platformStats()
    {
        $totalShops = Shop::count();
        $activeShops = Shop::where('subscription_status', SubscriptionStatus::ACTIVE)->count();
        $pendingShops = Shop::where('subscription_status', SubscriptionStatus::INACTIVE)->count();
        $totalUsers = User::count();
        $totalBarbers = User::where('role', 'barber')->count();
        $totalShopOwners = User::where('role', 'shop_owner')->count();

        $monthlyRevenue = \App\Models\Booking::where('status', 'completed')
            ->whereMonth('created_at', now()->month)
            ->sum('total_price');

        return response()->json([
            'total_shops' => $totalShops,
            'active_shops' => $activeShops,
            'pending_shops' => $pendingShops,
            'total_users' => $totalUsers,
            'total_barbers' => $totalBarbers,
            'total_shop_owners' => $totalShopOwners,
            'monthly_revenue' => $monthlyRevenue,
            'approval_rate' => $totalShops > 0 ? round(($activeShops / $totalShops) * 100, 1) : 0,
        ]);
    }
}
