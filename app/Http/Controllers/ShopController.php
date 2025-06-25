<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->isAdmin()) {
            $shops = Shop::with(['owner', 'subscription'])->paginate(15);
        } elseif ($user->isShopOwner()) {
            $shops = $user->ownedShops()->with(['subscription'])->paginate(15);
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($shops);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:50',
            'zip_code' => 'required|string|max:10',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
        ]);

        $shop = Shop::create([
            'owner_id' => $request->user()->id,
            'name' => $request->name,
            'description' => $request->description,
            'address' => $request->address,
            'city' => $request->city,
            'state' => $request->state,
            'zip_code' => $request->zip_code,
            'phone' => $request->phone,
            'email' => $request->email,
            'website' => $request->website,
        ]);

        return response()->json($shop, 201);
    }

    public function show(Shop $shop)
    {
        $shop->load(['owner', 'services', 'barbers.user', 'subscription']);
        return response()->json($shop);
    }

    public function update(Request $request, Shop $shop)
    {
        $this->authorize('update', $shop);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:50',
            'zip_code' => 'required|string|max:10',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
        ]);

        $shop->update($request->only([
            'name', 'description', 'address', 'city', 'state', 
            'zip_code', 'phone', 'email', 'website'
        ]));

        return response()->json($shop);
    }

    public function destroy(Shop $shop)
    {
        $this->authorize('delete', $shop);
        $shop->delete();
        return response()->json(['message' => 'Shop deleted successfully']);
    }

    public function publicIndex(Request $request)
    {
        $shops = Shop::where('subscription_status', 'active')
            ->with(['services', 'barbers.user'])
            ->when($request->search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%")
                           ->orWhere('city', 'like', "%{$search}%");
            })
            ->paginate(12);

        return response()->json($shops);
    }

    public function publicShow(Shop $shop)
    {
        if (!$shop->isActive()) {
            return response()->json(['message' => 'Shop not found'], 404);
        }

        $shop->load(['services' => function ($query) {
            $query->where('is_active', true);
        }, 'barbers' => function ($query) {
            $query->where('is_active', true)->with('user');
        }]);

        return response()->json($shop);
    }
}
