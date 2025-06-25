<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(Shop $shop)
    {
        $services = $shop->services()->where('is_active', true)->get();
        return response()->json($services);
    }

    public function store(Request $request, Shop $shop)
    {
        $this->authorize('update', $shop);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration' => 'required|integer|min:15',
        ]);

        $service = $shop->services()->create([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'duration' => $request->duration,
        ]);

        return response()->json($service, 201);
    }

    public function update(Request $request, Service $service)
    {
        $this->authorize('update', $service->shop);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration' => 'required|integer|min:15',
            'is_active' => 'boolean',
        ]);

        $service->update($request->only([
            'name', 'description', 'price', 'duration', 'is_active'
        ]));

        return response()->json($service);
    }

    public function destroy(Service $service)
    {
        $this->authorize('update', $service->shop);
        $service->delete();
        return response()->json(['message' => 'Service deleted successfully']);
    }
}
