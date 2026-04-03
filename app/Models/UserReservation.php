<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserReservation extends Model
{
    //
    protected $fillable = [
        'user_name', 'email', 'phone', 'address', 'pickup_location', 'dropoff_location', 'package_type', 'reservation_date', 'start_time', 'end_time', 'status', 'price_id', 'test_time', 'test_location',
    ];

    // Each reservation uses one price package
    public function price()
    {
        return $this->belongsTo(Price::class);
    }
}
