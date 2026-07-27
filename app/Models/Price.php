<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Price extends Model
{
    public const FIVE_HOUR_BUNDLE_SESSION_MINUTES = 60;

    public const FIVE_HOUR_BUNDLE_TOTAL_MINUTES = 300;

    public const FIVE_HOUR_BUNDLE_ALLOWED_SESSION_MINUTES = [60, 120];

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
        return stripos($this->category ?? '', 'test') !== false ||
               stripos($this->description ?? '', 'test') !== false;
    }

    public function isFiveHourLessonBundle(): bool
    {
        $category = strtolower($this->category ?? '');
        $description = strtolower($this->description ?? '');

        return ! $this->isTestPackage()
            && str_contains($category, 'package bundles')
            && (bool) preg_match('/\b5\s*-?\s*hour\b/', $description);
    }

    public function isCartBookableLessonPackage(): bool
    {
        $category = strtolower($this->category ?? '');
        $description = strtolower($this->description ?? '');

        if ($this->isFiveHourLessonBundle()) {
            return true;
        }

        return ! str_contains($category, 'test')
            && ! str_contains($category, 'bundle')
            && ! str_contains($description, 'test only');
    }

    public function lessonBookingDurationMinutes(?int $requestedDurationMinutes = null): int
    {
        if (! $this->isFiveHourLessonBundle()) {
            return $this->durationMinutes();
        }

        $durationMinutes = $requestedDurationMinutes ?? self::FIVE_HOUR_BUNDLE_SESSION_MINUTES;

        if (! in_array($durationMinutes, self::FIVE_HOUR_BUNDLE_ALLOWED_SESSION_MINUTES, true)) {
            throw new \InvalidArgumentException('The 5 hour lesson bundle only supports 1-hour or 2-hour lessons.');
        }

        return $durationMinutes;
    }

    public function durationMinutes(): int
    {
        if (! $this->duration) {
            return 60;
        }

        $duration = strtolower(trim((string) $this->duration));
        $totalMinutes = 0;

        if (preg_match('/(\d+(?:\.\d+)?)\s*(?:hrs|hr|hour|hours)/', $duration, $matches)) {
            $totalMinutes += (float) $matches[1] * 60;
        }

        if (preg_match('/(\d+)\s*(?:min|mins|minute|minutes)/', $duration, $matches)) {
            $totalMinutes += (int) $matches[1];
        }

        if ($totalMinutes === 0 && preg_match('/(\d+(?:\.\d+)?)/', $duration, $matches)) {
            $number = (float) $matches[1];
            $totalMinutes = $number < 10 ? $number * 60 : $number;
        }

        return (int) round($totalMinutes ?: 60);
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
