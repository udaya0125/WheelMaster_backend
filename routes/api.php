<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\TestimonialController;
use App\Http\Controllers\PriceController;
use App\Http\Controllers\BlogController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


//-----------------------------------------------------------------------
// Web routes duplicated in API for access
//-----------------------------------------------------------------------
Route::get('/ourgallery', [GalleryController::class, 'index']);


Route::get('/testimonials', [TestimonialController::class, 'index']);


Route::get('/ourprice', [PriceController::class, 'index']);


Route::get('/ourblog', [BlogController::class, 'index']);


Route::get('/blog/{slug}', [BlogController::class, 'indexShowBlogSlug']);


Route::get('/ourprice/{slug}', [PriceController::class, 'indexShowPriceSlug']);


