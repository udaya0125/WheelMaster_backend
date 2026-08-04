<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    //
    protected $fillable = [
        'user_id',
        'area',
        'dropoff_address',
        'pickup_address',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
