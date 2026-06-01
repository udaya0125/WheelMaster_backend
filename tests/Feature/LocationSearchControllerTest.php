<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class LocationSearchControllerTest extends TestCase
{
    public function test_location_suggestions_must_match_an_allowed_postcode_and_locality(): void
    {
        Http::fake([
            '*' => Http::response([
                'features' => [
                    $this->photonFeature('5', 'Lakes Close', 'Mandurah', '6208'),
                    $this->photonFeature('7', 'Lakes Close', 'Mandurah', '6210'),
                    $this->photonFeature('9', 'Lakes Close', 'Falcon', '6210', 'Mandurah'),
                ],
            ]),
        ]);

        $response = $this->getJson(route('locations.search', [
            'q' => 'Lakes Close',
        ]));

        $response
            ->assertOk()
            ->assertJsonCount(1, 'suggestions')
            ->assertJsonPath('suggestions.0.label', '7 Lakes Close, Mandurah, Western Australia 6210')
            ->assertJsonPath('suggestions.0.postcode', '6210')
            ->assertJsonPath('suggestions.0.city', 'Mandurah');
    }

    private function photonFeature(
        string $houseNumber,
        string $street,
        string $city,
        string $postcode,
        ?string $county = null,
    ): array {
        return [
            'geometry' => [
                'coordinates' => [115.742, -32.536],
            ],
            'properties' => [
                'countrycode' => 'AU',
                'housenumber' => $houseNumber,
                'street' => $street,
                'city' => $city,
                'county' => $county,
                'state' => 'Western Australia',
                'postcode' => $postcode,
            ],
        ];
    }
}
