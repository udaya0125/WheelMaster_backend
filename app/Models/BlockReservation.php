<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlockReservation extends Model
{
    //
    protected $fillable =[
        'date','start_time','end_time','duration','reason'
    ];
}
