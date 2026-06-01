<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LocationSearchController extends Controller
{
    private const PHOTON_URL = 'https://photon.komoot.io/api/';

    private const ALLOWED_POSTCODES = ['6210', '6180', '6175'];

    private const ALLOWED_LOCALITIES = [
        'mandurah',
        'meadow springs',
        'silver sands',
        'lakelands',
        'dudley park',
        'halls head',
        'madora bay',
        'greenfields',
        'erskine',
        'singleton',
        'stake hill',
        'parklands',
        'san remo',
    ];

    private const SERVICE_BBOX = [
        'min_lon' => 115.60,
        'min_lat' => -32.72,
        'max_lon' => 115.92,
        'max_lat' => -32.34,
    ];

    public function search(Request $request)
    {
        $validated = $request->validate([
            'q' => 'required|string|min:3|max:120',
        ]);

        $query = trim($validated['q']);
        $fixedSuggestions = $this->fixedSuggestions($query);

        try {
            $cacheKey = 'location-search:v6:'.sha1(strtolower($query));

            $suggestions = Cache::remember($cacheKey, now()->addDay(), function () use ($query) {
                $houseNumber = $this->extractLeadingHouseNumber($query);
                $targetStreet = $houseNumber ? $this->targetStreetName($query) : null;

                return collect($this->queryVariants($query))
                    ->flatMap(fn ($variant) => $this->photonSuggestions($variant, $houseNumber, $targetStreet))
                    ->unique('label')
                    ->take(5)
                    ->values()
                    ->all();
            });

            return response()->json([
                'success' => true,
                'suggestions' => collect($suggestions)
                    ->merge($fixedSuggestions)
                    ->unique('label')
                    ->take(6)
                    ->values()
                    ->all(),
                'allowed_postcodes' => self::ALLOWED_POSTCODES,
            ]);
        } catch (\Throwable $e) {
            Log::error('Location search error: '.$e->getMessage(), [
                'query' => $query,
            ]);

            return response()->json([
                'success' => true,
                'suggestions' => $fixedSuggestions,
                'allowed_postcodes' => self::ALLOWED_POSTCODES,
            ]);
        }
    }

    private function photonSuggestions(string $query, ?string $houseNumber = null, ?string $targetStreet = null): array
    {
        $response = Http::timeout(5)
            ->acceptJson()
            ->withOptions([
                'verify' => filter_var(env('PHOTON_VERIFY_SSL', false), FILTER_VALIDATE_BOOLEAN),
            ])
            ->withHeaders([
                'User-Agent' => config('app.name', 'Driving Dashboard').'/1.0',
            ])
            ->get(self::PHOTON_URL, [
                'q' => $query,
                'limit' => 8,
                'lang' => 'en',
                'countrycode' => 'AU',
                'bbox' => implode(',', [
                    self::SERVICE_BBOX['min_lon'],
                    self::SERVICE_BBOX['min_lat'],
                    self::SERVICE_BBOX['max_lon'],
                    self::SERVICE_BBOX['max_lat'],
                ]),
            ]);

        if (! $response->successful()) {
            Log::warning('Photon location search failed', [
                'status' => $response->status(),
                'query' => $query,
            ]);

            return [];
        }

        return collect($response->json('features', []))
            ->map(fn ($feature) => $this->normalisePhotonFeature($feature, $houseNumber, $targetStreet))
            ->filter()
            ->values()
            ->all();
    }

    private function normalisePhotonFeature(array $feature, ?string $houseNumber = null, ?string $targetStreet = null): ?array
    {
        $properties = $feature['properties'] ?? [];
        $coordinates = $feature['geometry']['coordinates'] ?? [];

        $lon = isset($coordinates[0]) ? (float) $coordinates[0] : null;
        $lat = isset($coordinates[1]) ? (float) $coordinates[1] : null;

        if (! $this->isServiceable($properties, $lat, $lon)) {
            return null;
        }

        if ($targetStreet && ! $this->matchesTargetStreet($properties, $targetStreet)) {
            return null;
        }

        $postcode = $this->normalisePostcode($properties['postcode'] ?? null);
        $labelHouseNumber = $this->shouldApplyTypedHouseNumber($properties, $targetStreet)
            ? $houseNumber
            : null;
        $label = $this->buildLabel($properties, $postcode, $labelHouseNumber);

        if (! $label) {
            return null;
        }

        return [
            'label' => $label,
            'name' => $properties['name'] ?? null,
            'street' => $properties['street'] ?? null,
            'housenumber' => $properties['housenumber'] ?? $labelHouseNumber,
            'postcode' => $postcode,
            'city' => $properties['city'] ?? null,
            'district' => $properties['district'] ?? null,
            'state' => $properties['state'] ?? null,
            'lat' => $lat,
            'lon' => $lon,
            'source' => 'photon',
        ];
    }

    private function isServiceable(array $properties, ?float $lat, ?float $lon): bool
    {
        if (strtoupper((string) ($properties['countrycode'] ?? '')) !== 'AU') {
            return false;
        }

        if (! $this->isInsideServiceBox($lat, $lon)) {
            return false;
        }

        $postcode = $this->normalisePostcode($properties['postcode'] ?? null);
        if (! $postcode || ! in_array($postcode, self::ALLOWED_POSTCODES, true)) {
            return false;
        }

        $localityParts = [
            $properties['name'] ?? '',
            $properties['city'] ?? '',
            $properties['district'] ?? '',
            $properties['locality'] ?? '',
        ];

        return collect($localityParts)
            ->map(fn ($locality) => $this->normaliseText((string) $locality))
            ->contains(fn ($locality) => in_array($locality, self::ALLOWED_LOCALITIES, true));
    }

    private function isInsideServiceBox(?float $lat, ?float $lon): bool
    {
        if ($lat === null || $lon === null) {
            return false;
        }

        return $lon >= self::SERVICE_BBOX['min_lon']
            && $lon <= self::SERVICE_BBOX['max_lon']
            && $lat >= self::SERVICE_BBOX['min_lat']
            && $lat <= self::SERVICE_BBOX['max_lat'];
    }

    private function buildLabel(array $properties, ?string $postcode, ?string $houseNumber = null): string
    {
        $streetName = $properties['street'] ?? null;
        if (! $streetName && ($properties['type'] ?? null) === 'street') {
            $streetName = $properties['name'] ?? null;
        }

        $streetLine = trim(implode(' ', array_filter([
            $properties['housenumber'] ?? $houseNumber,
            $streetName,
        ])));

        $primary = $streetLine ?: ($properties['name'] ?? '');
        $locality = $properties['city']
            ?? $properties['district']
            ?? $properties['county']
            ?? null;
        $statePostcode = trim(implode(' ', array_filter([
            $properties['state'] ?? 'WA',
            $postcode,
        ])));

        return collect([$primary, $locality, $statePostcode])
            ->filter()
            ->unique()
            ->implode(', ');
    }

    private function normalisePostcode($postcode): ?string
    {
        if (is_array($postcode)) {
            $postcode = reset($postcode);
        }

        $postcode = preg_replace('/\D/', '', (string) $postcode);

        return $postcode ?: null;
    }

    private function shouldApplyTypedHouseNumber(array $properties, ?string $targetStreet = null): bool
    {
        $resultStreet = strtolower((string) ($properties['name'] ?? $properties['street'] ?? ''));

        return empty($properties['housenumber'])
            && ($properties['type'] ?? null) === 'street'
            && ! empty($properties['name'])
            && (! $targetStreet || $resultStreet === $targetStreet);
    }

    private function matchesTargetStreet(array $properties, string $targetStreet): bool
    {
        return collect([
            $properties['name'] ?? '',
            $properties['street'] ?? '',
        ])
            ->map(fn ($value) => strtolower(trim((string) $value)))
            ->contains($targetStreet);
    }

    private function queryVariants(string $query): array
    {
        $expanded = $this->expandOrdinalStreetNames($query);

        return collect([
            $query,
            $expanded,
            $this->stripLeadingHouseNumber($expanded),
        ])
            ->map(fn ($value) => trim((string) $value))
            ->filter(fn ($value) => strlen($value) >= 3)
            ->unique()
            ->values()
            ->all();
    }

    private function extractLeadingHouseNumber(string $query): ?string
    {
        if (preg_match('/^\s*([0-9]+[A-Za-z]?(?:\s*\/\s*[0-9]+[A-Za-z]?)?)\b/', $query, $matches)) {
            return preg_replace('/\s+/', '', $matches[1]);
        }

        return null;
    }

    private function stripLeadingHouseNumber(string $query): string
    {
        return preg_replace('/^\s*[0-9]+[A-Za-z]?(?:\s*\/\s*[0-9]+[A-Za-z]?)?\s+/', '', $query) ?? $query;
    }

    private function expandOrdinalStreetNames(string $query): string
    {
        $ordinals = [
            '1st' => 'First',
            '2nd' => 'Second',
            '3rd' => 'Third',
            '4th' => 'Fourth',
            '5th' => 'Fifth',
            '6th' => 'Sixth',
            '7th' => 'Seventh',
            '8th' => 'Eighth',
            '9th' => 'Ninth',
            '10th' => 'Tenth',
            '11th' => 'Eleventh',
            '12th' => 'Twelfth',
            '13th' => 'Thirteenth',
            '14th' => 'Fourteenth',
            '15th' => 'Fifteenth',
            '16th' => 'Sixteenth',
            '17th' => 'Seventeenth',
            '18th' => 'Eighteenth',
            '19th' => 'Nineteenth',
            '20th' => 'Twentieth',
        ];

        return preg_replace_callback(
            '/\b([0-9]{1,2}(?:st|nd|rd|th))\b/i',
            fn ($matches) => $ordinals[strtolower($matches[1])] ?? $matches[1],
            $query,
        ) ?? $query;
    }

    private function targetStreetName(string $query): ?string
    {
        $query = $this->stripLeadingHouseNumber($this->expandOrdinalStreetNames($query));
        $query = preg_replace('/\b(?:mandurah|western australia|wa|australia|'.implode('|', self::ALLOWED_POSTCODES).')\b/i', '', $query) ?? $query;
        $query = trim(preg_replace('/[^a-z0-9 ]+/i', ' ', $query) ?? $query);
        $query = strtolower(preg_replace('/\s+/', ' ', $query) ?? $query);

        return $query ?: null;
    }

    private function fixedSuggestions(string $query): array
    {
        $normalisedQuery = $this->normaliseText($query);
        $fixed = collect($this->fixedServiceLocations())
            ->filter(function ($location) use ($normalisedQuery) {
                return collect([
                    $location['name'],
                    $location['city'],
                    $location['district'],
                    $location['postcode'],
                    $location['label'],
                ])
                    ->filter()
                    ->map(fn ($value) => $this->normaliseText((string) $value))
                    ->contains(fn ($value) => $value && str_contains($normalisedQuery, $value));
            });

        $matchesMeetpoint = collect([
            'meetpoint',
            'meet point',
            'mandurah dot',
            'licensing',
            'licence',
            'department of transport',
            ' dot ',
        ])->contains(fn ($needle) => str_contains(" {$normalisedQuery} ", $this->normaliseText($needle)));

        if ($matchesMeetpoint) {
            $fixed = $fixed->prepend([
                'label' => 'Mandurah Licensing Centre, Mandurah WA 6210',
                'name' => 'Mandurah Licensing Centre',
                'street' => null,
                'housenumber' => null,
                'postcode' => '6210',
                'city' => 'Mandurah',
                'district' => null,
                'state' => 'Western Australia',
                'lat' => -32.536,
                'lon' => 115.742,
                'source' => 'fixed',
            ]);
        }

        return $fixed->unique('label')->values()->all();
    }

    private function fixedServiceLocations(): array
    {
        return [
            $this->fixedLocality('Mandurah', '6210', -32.536, 115.742),
            $this->fixedLocality('Meadow Springs', '6210', -32.502, 115.753),
            $this->fixedLocality('Silver Sands', '6210', -32.516, 115.728),
            $this->fixedLocality('Lakelands', '6180', -32.472, 115.762),
            $this->fixedLocality('Dudley Park', '6210', -32.552, 115.738),
            $this->fixedLocality('Halls Head', '6210', -32.552, 115.695),
            $this->fixedLocality('Madora Bay', '6210', -32.470, 115.747),
            $this->fixedLocality('Greenfields', '6210', -32.524, 115.755),
            $this->fixedLocality('Erskine', '6210', -32.563, 115.705),
            $this->fixedLocality('Singleton', '6175', -32.444, 115.757),
        ];
    }

    private function fixedLocality(string $name, string $postcode, float $lat, float $lon): array
    {
        return [
            'label' => "{$name}, WA {$postcode}",
            'name' => $name,
            'street' => null,
            'housenumber' => null,
            'postcode' => $postcode,
            'city' => $name,
            'district' => null,
            'state' => 'Western Australia',
            'lat' => $lat,
            'lon' => $lon,
            'source' => 'fixed',
        ];
    }

    private function normaliseText(string $value): string
    {
        $value = strtolower($value);
        $value = preg_replace('/[^a-z0-9]+/', ' ', $value) ?? $value;

        return trim(preg_replace('/\s+/', ' ', $value) ?? $value);
    }
}
