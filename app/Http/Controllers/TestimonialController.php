<?php

namespace App\Http\Controllers;

use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TestimonialController extends Controller
{
    /**
     * Display a listing of testimonials.
     */
    public function index()
    {
        $testimonials = Testimonial::all();

        return response()->json([
            'status' => 'success',
            'message' => 'Testimonials fetched successfully',
            'data' => $testimonials,
        ], 200);
    }

    /**
     * Store a newly created testimonial in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'author_name' => 'required|string|max:255',
            'comment' => 'required|string',
            'author_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'author_role' => 'nullable|string|max:255',
        ]);

        // Handle Image Upload
        if ($request->hasFile('author_image')) {
            $validated['author_image'] = $request->file('author_image')->store('testimonials', 'public');
        }

        $testimonial = Testimonial::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Testimonial created successfully',
            'data' => $testimonial,
        ], 201);
    }

    /**
     * Update the specified testimonial.
     */
    public function update(Request $request, $id)
    {
        $testimonial = Testimonial::findOrFail($id);

        $validated = $request->validate([
            'author_name' => 'sometimes|required|string|max:255',
            'comment' => 'sometimes|required|string',
            'author_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'author_role' => 'nullable|string|max:255',
        ]);

        // Handle image replacement only if new image is provided
        if ($request->hasFile('author_image')) {
            // Delete old image if exists
            if ($testimonial->author_image) {
                Storage::disk('public')->delete($testimonial->author_image);
            }

            $validated['author_image'] = $request->file('author_image')->store('testimonials', 'public');
        } else {
            // If no new image is provided, keep the existing one
            unset($validated['author_image']);
        }

        $testimonial->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Testimonial updated successfully',
            'data' => $testimonial,
        ], 200);
    }

    /**
     * Remove the specified testimonial from storage.
     */
    public function destroy($id)
    {
        $testimonial = Testimonial::findOrFail($id);

        // Delete image if exists
        if ($testimonial->author_image) {
            Storage::disk('public')->delete($testimonial->author_image);
        }

        $testimonial->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Testimonial deleted successfully',
        ], 200);
    }
}
