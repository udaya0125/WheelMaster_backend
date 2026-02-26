<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    //
    protected $fillable = [
        'title',
        'short_description',
        'long_description',
        'image',
        'slug',
        'category',
        'duration'
    ];
    
    protected static function boot()
{
    parent::boot();

    // Before creating the blog (ID not available yet)
    static::creating(function ($blog) {
        $baseSlug = \Str::slug($blog->title);

        // Temporary slug until ID is available
        $blog->slug = $baseSlug . '-' . rand(100000, 999999);
    });

    // After blog is created (ID becomes available)
    static::created(function ($blog) {
        $baseSlug = \Str::slug($blog->title);

        // Create final slug with ID + unique 6 digits
        $finalSlug = $baseSlug .  '-' . rand(100000, 999999);

        // Ensure uniqueness
        while (static::where('slug', $finalSlug)->exists()) {
            $finalSlug = $baseSlug . '-' . rand(100000, 999999);
        }

        // Update slug once more
        $blog->slug = $finalSlug;
        $blog->save();
    });
}



}