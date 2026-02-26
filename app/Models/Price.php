<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Price extends Model
{
    protected $fillable = [
        'description', 'price', 'features', 'duration', 'discount', 'category', 'slug',
    ];

    // One price package can be used in many reservations
    public function reservations()
    {
        return $this->hasMany(UserReservation::class);
    }

    // Add this method to your Price model
    public function isTestPackage()
    {
        return stripos($this->category, 'test') !== false ||
               stripos($this->description, 'test') !== false;
    }

    protected static function boot()
    {
        parent::boot();

        // Before creating: generate temporary slug (without ID)
        static::creating(function ($price) {
            if (! empty($price->description)) {
                $price->slug = static::generateSlug($price->description);
            }
        });

        // After created: append ID to ensure final uniqueness
        static::created(function ($price) {
            $price->slug = $price->slug.'-'.$price->id;
            $price->saveQuietly(); // Prevent infinite loops
        });

        // When updating description: regenerate slug (with ID included)
        static::updating(function ($price) {
            if ($price->isDirty('description')) {
                $newSlug = static::generateSlug($price->description).'-'.$price->id;
                $price->slug = $newSlug;
            }
        });
    }

    // ----------------------------------------------------
    //  Generate Slug from description + random 6-digit number
    // ----------------------------------------------------
    protected static function generateSlug($description)
    {
        // Convert to slug form
        $slugBase = Str::slug($description);

        // Add unique 6-digit random number
        $random = rand(100000, 999999);

        // Final slug format: description-123456
        $slug = "{$slugBase}-{$random}";

        // Ensure no duplicates
        $count = static::where('slug', 'LIKE', $slug.'%')->count();
        if ($count > 0) {
            $slug .= '-'.($count + 1);
        }

        return $slug;
    }
}
