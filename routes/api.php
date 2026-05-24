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


    // ############################################################################
    // Web routes duplicated in API for access
    // ############################################################################


    // ############################################################################
    // API routes for the Gallery Controller, Testimonial Controller, Price Controller and Blog Controller
    // ############################################################################

    Route::get('/ourgallery', [GalleryController::class, 'index']);

    // ############################################################################
    // API routes for the  Testimonial Controller
    // ############################################################################
    Route::get('/testimonials', [TestimonialController::class, 'index']);
    // ############################################################################
    // API routes for the  Price Controller 
    // ############################################################################

    Route::get('/ourprice', [PriceController::class, 'index']);

    // ############################################################################
    // API routes for the  Blog Controller
    // ############################################################################
    Route::get('/ourblog', [BlogController::class, 'index']);

    // ############################################################################
    // API routes for the  Blog Controller slug
    // ############################################################################
    Route::get('/blog/{slug}', [BlogController::class, 'indexShowBlogSlug']);

    // ############################################################################
    // API routes for the Price Controller slug
    // ############################################################################
    Route::get('/ourprice/{slug}', [PriceController::class, 'indexShowPriceSlug']);
