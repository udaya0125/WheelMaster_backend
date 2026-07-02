<?php

use App\Http\Controllers\BlockReservationController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\LocationSearchController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PriceController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\TestimonialController;
use App\Http\Controllers\TestPackageController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserReservationController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Spatie\Analytics\Facades\Analytics;
use Spatie\Analytics\Period;
use Illuminate\Support\Facades\Artisan;
use App\Http\Controllers\DashboardController;
use Illuminate\Http\Request;
use App\Http\Controllers\TimeSlotController;


Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

    // Route::get('/dashboard', function () {
    //     return Inertia::render('Dashboard');
    // })->middleware(['auth', 'verified'])->name('dashboard');


    // --------------------------------------------------------------------------
    // Authenticated routes
    // --------------------------------------------------------------------------

Route::middleware('auth')->group(function () {

    // --------------------------------------------------------------------------
    // Testimonial route for Dashboard
    // --------------------------------------------------------------------------

    Route::get('/testimonial', function () {
        return Inertia::render('Testimonial');
    });

    // Route::get('/dashboard', [DashboardController::class, 'index']);
    // Route::get('/dashboard/chart-data', [DashboardController::class, 'getChartData']);


    // --------------------------------------------------------------------------
    // Dashboard Controller routes
    // --------------------------------------------------------------------------

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/chart-data', [DashboardController::class, 'getChartData']);
    Route::get('/dashboard/realtime-data', [DashboardController::class, 'getRealtimeData']);
    Route::get('/dashboard/top-pages', [DashboardController::class, 'getTopPages']);

    // --------------------------------------------------------------------------
    // Gallery Controller routes
    // --------------------------------------------------------------------------


    Route::get('/ourgallery', [GalleryController::class, 'index'])->name('ourgallery.index');
    Route::post('/ourgallery', [GalleryController::class, 'store'])->name('ourgallery.store');
    Route::delete('/ourgallery/{id}', [GalleryController::class, 'destroy'])->name('ourgallery.destroy');


    // --------------------------------------------------------------------------
    // Testimonial Controller routes
    // --------------------------------------------------------------------------

    Route::post('/testimonials', [TestimonialController::class, 'store'])->name('testimonials.store');
    Route::put('/testimonials/{id}', [TestimonialController::class, 'update'])->name('testimonials.update');
    Route::delete('/testimonials/{id}', [TestimonialController::class, 'destroy'])->name('testimonials.destroy');


    // --------------------------------------------------------------------------
    // Price Controller routes
    // --------------------------------------------------------------------------

    Route::post('/ourprice', [PriceController::class, 'store'])->name('ourprice.store');
    Route::put('/ourprice/{id}', [PriceController::class, 'update'])->name('ourprice.update');
    Route::delete('/ourprice/{id}', [PriceController::class, 'destroy'])->name('ourprice.destroy');


    // --------------------------------------------------------------------------
    // Blog Controller routes
    // --------------------------------------------------------------------------

    Route::get('/ourblog', [BlogController::class, 'index'])->name('ourblog.index');
    Route::post('/ourblog', [BlogController::class, 'store'])->name('ourblog.store');
    Route::put('/ourblog/{id}', [BlogController::class, 'update'])->name('ourblog.update');
    Route::delete('/ourblog/{id}', [BlogController::class, 'destroy'])->name('ourblog.destroy');


    // --------------------------------------------------------------------------
    //User Reservation Controller routes
    // --------------------------------------------------------------------------

    Route::get('/ouruserreservations', [UserReservationController::class, 'index'])->name('ouruserreservations.index');
    Route::post('/ouruserreservations', [UserReservationController::class, 'store'])->name('ouruserreservations.store');
    Route::put('/ouruserreservations/{id}', [UserReservationController::class, 'update'])->name('ouruserreservations.update');
    Route::delete('/ouruserreservations/{id}', [UserReservationController::class, 'destroy'])->name('ouruserreservations.destroy');
    Route::post('/ouruserreservations/check-availability', [UserReservationController::class, 'checkAvailability'])->name('ouruserreservations.check-availability');


    // --------------------------------------------------------------------------
    // Block Reservation Controller routes
    // --------------------------------------------------------------------------

    Route::get('/ourblockreservations', [BlockReservationController::class, 'index'])->name('ourblockreservations.index');
    Route::post('/ourblockreservations', [BlockReservationController::class, 'store'])->name('ourblockreservations.store');
    Route::put('/ourblockreservations/{id}', [BlockReservationController::class, 'update'])->name('ourblockreservations.update');
    Route::delete('/ourblockreservations/{id}', [BlockReservationController::class, 'destroy'])->name('ourblockreservations.destroy');


    // --------------------------------------------------------------------------
    // User Controller routes
    // --------------------------------------------------------------------------
    Route::get('/ouruser', [UserController::class, 'index'])->name('ouruser.index');
    Route::post('/ouruser', [UserController::class, 'store'])->name('ouruser.store');
    Route::put('/ouruser/{id}', [UserController::class, 'update'])->name('ouruser.update');
    Route::delete('/ouruser/{id}', [UserController::class, 'destroy'])->name('ouruser.destroy');


    // --------------------------------------------------------------------------
    // User Reservation routes for Dashboard
    // --------------------------------------------------------------------------

    Route::get('/user-reservation', function () {
        return Inertia::render('UserReservation');
    });


    // --------------------------------------------------------------------------
    // Block Reservation routes for Dashboard
    // --------------------------------------------------------------------------

    Route::get('/block-reservation', function () {
        return Inertia::render('BlockReservation');
    });


    // --------------------------------------------------------------------------
    // Gallery routes for Dashboard
    // --------------------------------------------------------------------------

    Route::get('/gallery', function () {
        return Inertia::render('Gallery');
    });


    // --------------------------------------------------------------------------
    // Price routes for public access
    // --------------------------------------------------------------------------

    Route::get('/price-package', function () {
        return Inertia::render('PricePackages');
    });


    // --------------------------------------------------------------------------
    // Blog routes for public access
    // --------------------------------------------------------------------------

    Route::get('/blog', function () {
        return Inertia::render('Blog');
    });


    // --------------------------------------------------------------------------
    // User Management routes for Dashboard
    // --------------------------------------------------------------------------

    Route::get('/time-management', [PriceController::class, 'timeManagement']);


    // --------------------------------------------------------------------------
    // User Management routes for Dashboard
    // --------------------------------------------------------------------------

    Route::get('/user-management', function () {
        return Inertia::render('UserManagement');
    });


    // --------------------------------------------------------------------------
    // Calendar Booking routes for Dashboard
    // --------------------------------------------------------------------------

    Route::get('/calendar-booking', function () {
        return Inertia::render('CalendarBooking/CalendarBooking');
    });

    // --------------------------------------------------------------------------
    // Notification routes for Dashboard
    // --------------------------------------------------------------------------

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.markAsRead');
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.markAllAsRead');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::delete('/notifications', [NotificationController::class, 'clearAll'])->name('notifications.clearAll');

    Route::get('/test', function () {
        $data = Analytics::fetchMostVisitedPages(Period::days(30));
        return response()->json($data);
    });

    // Route::get('/block-time', function () {
    //     return Inertia::render('BlockTime');
    // });

        // --------------------------------------------------------------------------
    // Block Time routes — redirect bare /block-time to first available slug
    // --------------------------------------------------------------------------

    Route::get('/block-time', function () {
        $first = \App\Models\Price::whereNotNull('slug')->first();
        if ($first) {
            return redirect()->route('block-time.show', $first->slug);
        }
        return abort(404);
    });

    Route::get('/block-time/{slug}', [PriceController::class, 'blockTimeBySlug'])->name('block-time.show');

        
    
});


    // --------------------------------------------------------------------------
    // Profile routes
    // --------------------------------------------------------------------------


    // --------------------------------------------------------------------------
    // Price Controller routes for public access
    // --------------------------------------------------------------------------

    Route::get('/ourprice', [PriceController::class, 'index'])->name('ourprice.index');


    // --------------------------------------------------------------------------
    // Testimonial Controller routes for public access
    // --------------------------------------------------------------------------
    Route::get('/testimonials', [TestimonialController::class, 'index'])->name('testimonials.index');

    
    // --------------------------------------------------------------------------
    // Calendar routes by slug
    // --------------------------------------------------------------------------

    // Route::get('/calendar/{slug}', [PriceController::class, 'indexBySlug']);
     Route::get('/calendar/{slug}', [PriceController::class, 'indexBySlug'])->name('calendar.show');


    // --------------------------------------------------------------------------
    // Reservation routes for public access
    // --------------------------------------------------------------------------

    Route::get('/ourreservations/timeslots', [ReservationController::class, 'getTimeSlotsForCalendar'])->name('ourreservations.timeslots');
    Route::get('/ourreservations/availability', [ReservationController::class, 'checkAvailability'])->name('ourreservations.availability');
    Route::post('/ourreservations/cart', [ReservationController::class, 'storeCart'])->name('ourreservations.cart');
    Route::post('/ourreservations', [ReservationController::class, 'store'])->name('ourreservations.store');
    Route::get('/location-search', [LocationSearchController::class, 'search'])->name('locations.search');


    // --------------------------------------------------------------------------
    // Test Package routes for public access
    // --------------------------------------------------------------------------

    Route::post('/test-packages/check-availability', [TestPackageController::class, 'checkAvailability'])->name('test-packages.check-availability');
    Route::post('/test-packages/book', [TestPackageController::class, 'storeTestReservation'])->name('test-packages.store');


    // --------------------------------------------------------------------------
    // Test Calendar route for testing
    // --------------------------------------------------------------------------

    Route::get('/calendar/test/{slug}', [PriceController::class, 'testCalendar'])->name('test.calendar');
   


    // --------------------------------------------------------------------------
    // Analytics Test Route
    // --------------------------------------------------------------------------

    // Route::get('/test', fn() => Analytics::fetchMostVisitedPages(Period::days(7)));

    Route::get('/ourtimeslots', [TimeSlotController::class, 'index'])->name('ourtimeslots.index');
    Route::get('/ourtimeslots/get', [TimeSlotController::class, 'getSlotsForDate'])->name('ourtimeslots.get');
    Route::get('/ourtimeslots/block-summary', [TimeSlotController::class, 'getBlockSummary'])->name('ourtimeslots.block-summary');
    Route::get('/ourtimeslots/availability-summary', [TimeSlotController::class, 'getAvailabilitySummary'])->name('ourtimeslots.availability-summary');
    Route::post('/ourtimeslots/update', [TimeSlotController::class, 'updateAvailability'])->name('ourtimeslots.update');
    Route::post('/ourtimeslots/update-end', [TimeSlotController::class, 'updateEndTime'])->name('ourtimeslots.update-end');
    Route::post('/ourtimeslots/update-range', [TimeSlotController::class, 'updateDateRange'])->name('ourtimeslots.update-range');
    Route::post('/ourtimeslots/reset', [TimeSlotController::class, 'resetToDefault'])->name('ourtimeslots.reset');
    Route::post('/ourtimeslots/update-single', [TimeSlotController::class, 'updateSingleSlot'])->name('ourtimeslots.update-single');
    Route::post('/ourtimeslots/update-single-with-subsequent', [TimeSlotController::class, 'updateSingleSlotWithSubsequent'])->name('ourtimeslots.update-single-with-subsequent');

    
    // Route::get('/calendar', function () {
    //     return Inertia::render('PricePackages/CalendarIntegrationMobile');
    // });


    // Route::get('/test-calendar', function () {
    //     return Inertia::render('PricePackages/TestCalendarIntegrationMobile');
    // });

require __DIR__.'/auth.php';
