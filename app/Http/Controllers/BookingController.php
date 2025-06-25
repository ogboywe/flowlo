<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Service;
use App\Models\Barber;
use App\Enums\BookingStatus;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request)
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
        
        $bookings = $query->orderBy('booking_datetime', 'desc')->paginate(15);
        
        return response()->json($bookings);
    }

    public function store(Request $request)
    {
        $request->validate([
            'barber_id' => 'required|exists:barbers,id',
            'service_id' => 'required|exists:services,id',
            'booking_datetime' => 'required|date|after:now',
            'notes' => 'nullable|string|max:500',
        ]);

        $service = Service::findOrFail($request->service_id);
        $barber = Barber::findOrFail($request->barber_id);

        if ($barber->shop_id !== $service->shop_id) {
            return response()->json(['message' => 'Barber and service must belong to the same shop'], 422);
        }

        $booking = Booking::create([
            'client_id' => $request->user()->id,
            'barber_id' => $request->barber_id,
            'service_id' => $request->service_id,
            'shop_id' => $service->shop_id,
            'booking_datetime' => $request->booking_datetime,
            'total_price' => $service->price,
            'notes' => $request->notes,
            'status' => BookingStatus::PENDING,
        ]);

        $booking->load(['client', 'barber.user', 'service', 'shop']);

        return response()->json($booking, 201);
    }

    public function show(Booking $booking)
    {
        $this->authorize('view', $booking);
        $booking->load(['client', 'barber.user', 'service', 'shop']);
        return response()->json($booking);
    }

    public function update(Request $request, Booking $booking)
    {
        $this->authorize('update', $booking);

        $request->validate([
            'booking_datetime' => 'required|date|after:now',
            'notes' => 'nullable|string|max:500',
        ]);

        $booking->update($request->only(['booking_datetime', 'notes']));
        $booking->load(['client', 'barber.user', 'service', 'shop']);

        return response()->json($booking);
    }

    public function destroy(Booking $booking)
    {
        $this->authorize('delete', $booking);
        $booking->update(['status' => BookingStatus::CANCELLED]);
        return response()->json(['message' => 'Booking cancelled successfully']);
    }

    public function updateStatus(Request $request, Booking $booking)
    {
        $this->authorize('update', $booking);

        $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled,no_show',
        ]);

        $booking->update(['status' => BookingStatus::from($request->status)]);
        $booking->load(['client', 'barber.user', 'service', 'shop']);

        return response()->json($booking);
    }
}
