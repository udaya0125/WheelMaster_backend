<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    //
    protected $fillable = [
        'author_name',
        'comment',
        'author_image',
        'author_role',
    ];
}