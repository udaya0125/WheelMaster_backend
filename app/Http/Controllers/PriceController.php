<?php

namespace App\Http\Controllers;

use App\Models\Price;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PriceController extends Controller
{
    /**
     * Display all price records.
     */
    public function index()
    {
        $prices = Price::all();

        return response()->json([
            'success' => true,
            'data' => $prices,
        ], 200);
    }

    public function indexShowPriceSlug($slug)
    {
        $price = Price::where('slug', $slug)->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $price,
        ]);
    }

    public function indexBySlug($slug)
    {
        try {
            $price = Price::where('slug', $slug)->firstOrFail();

            return Inertia::render('PricePackages/CalendarIntegrationWrapper', [
                'price' => $price,
                'packageOptions' => $this->bookablePackageOptions(),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Price package not found.',
            ], 404);
        }
    }

    /**
     * Handle test package calendar view
     */
    public function testCalendar($slug)
    {
        try {
            $price = Price::where('slug', $slug)->firstOrFail();

            return Inertia::render('PricePackages/TestCalendarIntegrationWrapper', [
                'price' => $price,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Price package not found.',
            ], 404);
        }
    }

    public function blockTimeBySlug($slug)
{
    try {
        $price = Price::where('slug', $slug)->firstOrFail();

        return Inertia::render('BlockTime', [
            'price' => $price,
            'packageOptions' => $this->bookablePackageOptions(),
        ]);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Price package not found.',
        ], 404);
    }
}

    public function timeManagement()
    {
        return Inertia::render('TimeManagement', [
            'packageOptions' => $this->bookablePackageOptions(),
        ]);
    }

    /**
     * Store a new price package.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'price' => 'required|numeric',
            'features' => 'nullable|string',
            'duration' => 'required|string|max:255',
            'discount' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
        ]);

        $price = Price::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Price package created successfully.',
            'data' => $price->fresh(),
        ], 201);
    }

    /**
     * Update an existing price package.
     */
    public function update(Request $request, $id)
    {
        $price = Price::findOrFail($id);

        $validated = $request->validate([
            'description' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric',
            'features' => 'nullable|string',
            'duration' => 'sometimes|required|string|max:255',
            'discount' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
        ]);

        $price->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Price package updated successfully.',
            'data' => $price->fresh(),
        ], 200);
    }

    /**
     * Delete a price package.
     */
    public function destroy($id)
    {
        $price = Price::findOrFail($id);

        $price->delete();

        return response()->json([
            'success' => true,
            'message' => 'Price package deleted successfully.',
        ], 200);
    }

    private function bookablePackageOptions()
    {
        return Price::all(['id', 'description', 'price', 'duration', 'category', 'slug'])
            ->filter(function ($price) {
                $category = strtolower($price->category ?? '');
                $description = strtolower($price->description ?? '');

                return ! str_contains($category, 'test')
                    && ! str_contains($category, 'package bundles')
                    && ! str_contains($description, 'test only');
            })
            ->values();
    }
}
