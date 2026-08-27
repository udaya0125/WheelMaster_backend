<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Price extends Model
{
    public const FIVE_HOUR_BUNDLE_SESSION_MINUTES = 60;

    public const FIVE_HOUR_BUNDLE_TOTAL_MINUTES = 300;

    public const FIVE_HOUR_BUNDLE_ALLOWED_SESSION_MINUTES = [60, 120];

    public const FIVE_HOUR_BUNDLE_HOURS = 5;

    public const TEN_HOUR_BUNDLE_SESSION_MINUTES = 60;

    public const TEN_HOUR_BUNDLE_TOTAL_MINUTES = 600;

    public const TEN_HOUR_BUNDLE_ALLOWED_SESSION_MINUTES = [60, 120];

    public const TEN_HOUR_BUNDLE_HOURS = 10;

    // Generic allowed session lengths shared by every lesson bundle size.
    public const LESSON_BUNDLE_ALLOWED_SESSION_MINUTES = [60, 120];

    // Every recognised lesson bundle size, in hours. Add new sizes here.
    private const LESSON_BUNDLE_HOUR_OPTIONS = [
        self::FIVE_HOUR_BUNDLE_HOURS,
        self::TEN_HOUR_BUNDLE_HOURS,
    ];

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

    /**
     * Returns the matched lesson-bundle size in hours (5, 10, ...) or null
     * if this price is not a recognised lesson bundle. This is the single
     * source of truth for bundle detection — mirrors getLessonBundleHours()
     * in the frontend packageRules.js.
     */
    public function getLessonBundleHours(): ?int
    {
        $category = strtolower($this->category ?? '');
        $description = strtolower($this->description ?? '');

        if ($this->isTestPackage() || ! str_contains($category, 'package bundles')) {
            return null;
        }

        foreach (self::LESSON_BUNDLE_HOUR_OPTIONS as $hours) {
            if (preg_match('/\b'.$hours.'\s*-?\s*hour\b/', $description)) {
                return $hours;
            }
        }

        return null;
    }

    public function isLessonBundle(): bool
    {
        return $this->getLessonBundleHours() !== null;
    }

    public function isFiveHourLessonBundle(): bool
    {
        return $this->getLessonBundleHours() === self::FIVE_HOUR_BUNDLE_HOURS;
    }

    public function isTenHourLessonBundle(): bool
    {
        return $this->getLessonBundleHours() === self::TEN_HOUR_BUNDLE_HOURS;
    }

    /**
     * Total minutes required to complete this lesson bundle, or null if
     * this price is not a bundle.
     */
    public function lessonBundleTotalMinutes(): ?int
    {
        $hours = $this->getLessonBundleHours();

        return $hours ? $hours * 60 : null;
    }

    public function isCartBookableLessonPackage(): bool
    {
        $category = strtolower($this->category ?? '');
        $description = strtolower($this->description ?? '');

        if ($this->isLessonBundle()) {
            return true;
        }

        return ! str_contains($category, 'test')
            && ! str_contains($category, 'bundle')
            && ! str_contains($description, 'test only');
    }

    public function lessonBookingDurationMinutes(?int $requestedDurationMinutes = null): int
    {
        if (! $this->isLessonBundle()) {
            return $this->durationMinutes();
        }

        $durationMinutes = $requestedDurationMinutes ?? self::FIVE_HOUR_BUNDLE_SESSION_MINUTES;

        if (! in_array($durationMinutes, self::LESSON_BUNDLE_ALLOWED_SESSION_MINUTES, true)) {
            $bundleHours = $this->getLessonBundleHours();
            throw new \InvalidArgumentException("The {$bundleHours} hour lesson bundle only supports 1-hour or 2-hour lessons.");
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