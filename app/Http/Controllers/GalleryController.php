<?php

namespace App\Http\Controllers;

use App\Models\Gallery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GalleryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $galleries = Gallery::all();
        return response()->json($galleries);
    }

    /**
     * Store a newly uploaded image (one image per record).
     */
    public function store(Request $request)
    {
        $request->validate([
            'images.*' => 'required|image|mimes:jpg,jpeg,png,gif|max:2048', // 2MB max per image
        ]);

        $createdGalleries = [];

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('galleries', 'public'); 

                $gallery = Gallery::create([
                    'image_path' => $path,
                ]);

                $createdGalleries[] = $gallery;

               
            }
        }

        return response()->json([
            'message' => 'Images uploaded successfully!',
            'data' => $createdGalleries,
        ]);
    }

    /**
     * Remove the specified image from storage and database.
     */
    public function destroy(Request $request, $id)
    {
        $gallery = Gallery::findOrFail($id);

        // Store image path for logging before deletion
        $imagePath = $gallery->image_path;

        // Delete image file from storage
        if ($gallery->image_path && Storage::disk('public')->exists($gallery->image_path)) {
            Storage::disk('public')->delete($gallery->image_path);
        }

        $gallery->delete();

       

        return response()->json(['message' => 'Image deleted successfully!']);
    }
}