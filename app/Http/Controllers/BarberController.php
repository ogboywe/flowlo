<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use App\Models\Barber;
use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Http\Request;

class BarberController extends Controller
{
    public function index(Shop $shop)
    {
        $barbers = $shop->barbers()->with('user')->where('is_active', true)->get();
        return response()->json($barbers);
    }

    public function store(Request $request, Shop $shop)
    {
        $this->authorize('update', $shop);

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'bio' => 'nullable|string',
            'specialties' => 'nullable|array',
            'commission_rate' => 'required|numeric|min:0|max:100',
        ]);

        $user = User::find($request->user_id);
        if ($user->role !== UserRole::BARBER) {
            return response()->json(['message' => 'User must have barber role'], 422);
        }

        $barber = $shop->barbers()->create([
            'user_id' => $request->user_id,
            'bio' => $request->bio,
            'specialties' => $request->specialties,
            'commission_rate' => $request->commission_rate,
        ]);

        $barber->load('user');
        return response()->json($barber, 201);
    }

    public function show(Barber $barber)
    {
        $barber->load(['user', 'shop', 'availability']);
        return response()->json($barber);
    }

    public function update(Request $request, Barber $barber)
    {
        $this->authorize('update', $barber->shop);

        $request->validate([
            'bio' => 'nullable|string',
            'specialties' => 'nullable|array',
            'commission_rate' => 'required|numeric|min:0|max:100',
            'is_active' => 'boolean',
        ]);

        $barber->update($request->only([
            'bio', 'specialties', 'commission_rate', 'is_active'
        ]));

        return response()->json($barber);
    }

    public function availability(Barber $barber)
    {
        $availability = $barber->availability()->get();
        return response()->json($availability);
    }
}
