<?php

namespace App\Http\Controllers;

use App\Mail\ReservationCreated;
use App\Mail\ReservationStatusUpdated;
use App\Models\BlockReservation;
use App\Models\UserReservation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class UserReservationController extends Controller
{
    // ---------------------------------------
    // Helper: Extract number of lessons from package description
    // ---------------------------------------
    // private function extractLessonCount($packageDescription)
    // {
    //     if (preg_match('/^(\d+)\s*x\s*/', $packageDescription, $matches)) {
    //         return (int) $matches[1];
    //     }
    //     return 1;
    // }

    private function extractLessonCount($packageDescription)
    {
        // Pattern 1: "10 x Driving Lessons" or "5x Lessons" with multiplication symbol
        if (preg_match('/^(\d+)\s*[x×]\s*/', $packageDescription, $matches)) {
            return (int) $matches[1];
        }

        // Pattern 2: "10-Hour Express Test Prep" or "5-Hour Package" with hyphen
        if (preg_match('/^(\d+)-Hour/i', $packageDescription, $matches)) {
            return (int) $matches[1];
        }

        // Pattern 3: "10 Hours Package" or "5 hours training" (optional, for consistency with frontend)
        if (preg_match('/^(\d+)\s+hours?/i', $packageDescription, $matches)) {
            return (int) $matches[1];
        }

        return 1;
    }

    // ---------------------------------------
    // Helper: Check if package is a bundle
    // ---------------------------------------
    // private function isBundlePackage($packageDescription)
    // {
    //     return preg_match('/^(\d+)\s*x\s*/', $packageDescription) === 1;
    // }

    private function isBundlePackage($packageDescription)
    {
        // Check for multiplication pattern OR hyphen pattern OR hours pattern
        return preg_match('/^(\d+)\s*[x×]\s*/', $packageDescription) === 1 ||
               preg_match('/^(\d+)-Hour/i', $packageDescription) === 1 ||
               preg_match('/^(\d+)\s+hours?/i', $packageDescription) === 1;
    }

    // ---------------------------------------
    // Helper: Parse duration string to minutes
    // ---------------------------------------
    private function parseDurationToMinutes($duration)
    {
        if (! $duration) {
            return null;
        }

        $durationStr = strtolower($duration);

        if (preg_match('/(\d+(?:\.\d+)?)\s*hours?/', $durationStr, $matches)) {
            return (float) $matches[1] * 60;
        }

        if (preg_match('/(\d+)\s*minutes?/', $durationStr, $matches)) {
            return (int) $matches[1];
        }

        return null;
    }

    // ---------------------------------------
    // Helper: Check if a single session is available
    // ---------------------------------------
    private function isSessionAvailable($date, $startTime, $endTime, $priceId, $excludeId = null)
    {
        $dateFormatted = Carbon::parse($date)->format('Y-m-d');
        $startFormatted = Carbon::parse($startTime)->format('H:i:s');
        $endFormatted = Carbon::parse($endTime)->format('H:i:s');

        // Check blocked slots
        $blocked = BlockReservation::where('date', $dateFormatted)
            ->where(function ($query) use ($startFormatted, $endFormatted) {
                $query->where(function ($q) use ($startFormatted, $endFormatted) {
                    $q->where('start_time', '<', $endFormatted)
                        ->where('end_time', '>', $startFormatted);
                });
            })
            ->exists();

        if ($blocked) {
            return false;
        }

        // Check existing reservations
        $query = UserReservation::where('reservation_date', $dateFormatted)
            ->where('price_id', $priceId)
            ->where('status', '!=', 'Rejected')
            ->where(function ($query) use ($startFormatted, $endFormatted) {
                $query->where(function ($q) use ($startFormatted, $endFormatted) {
                    $q->where('start_time', '<', $endFormatted)
                        ->where('end_time', '>', $startFormatted);
                });
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return ! $query->exists();
    }

    // ---------------------------------------
    // INDEX - list all reservations
    // ---------------------------------------
    public function index()
    {
        $reservations = UserReservation::with('price')->get();

        return response()->json([
            'success' => true,
            'data' => $reservations,
        ], 200);
    }

    // ---------------------------------------
    // STORE - create new reservation (handles bundles)
    // ---------------------------------------
    public function store(Request $request)
    {
        // Check if this is a bundle request
        $isBundle = $request->has('bundle_sessions') && is_array($request->bundle_sessions) && count($request->bundle_sessions) > 0;

        if ($isBundle) {
            return $this->storeBundle($request);
        }

        return $this->storeSingle($request);
    }

    // ---------------------------------------
    // Store single reservation
    // ---------------------------------------
    private function storeSingle(Request $request)
    {
        $request->validate([
            'user_name' => 'required',
            'email' => 'required|email',
            'phone' => 'required',
            'address' => 'required',
            'pickup_location' => 'required',
            'dropoff_location' => 'required',
            'reservation_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'price_id' => 'required|exists:prices,id',
            'package_type' => 'required|string',
            'test_time' => 'nullable',
            'test_location' => 'nullable|string',
        ]);

        $requestStart = Carbon::parse($request->start_time);
        $requestEnd = Carbon::parse($request->end_time);
        $reservationDate = Carbon::parse($request->reservation_date)->format('Y-m-d');
        $priceId = $request->price_id;

        // Check for blocked slots
        $existingBlock = BlockReservation::where('date', $reservationDate)
            ->where(function ($query) use ($requestStart, $requestEnd) {
                $query->where(function ($q) use ($requestStart, $requestEnd) {
                    $q->where('start_time', '<', $requestEnd->format('H:i:s'))
                        ->where('end_time', '>', $requestStart->format('H:i:s'));
                });
            })
            ->exists();

        if ($existingBlock) {
            return response()->json([
                'success' => false,
                'message' => 'This time slot is already BLOCKED',
            ], 409);
        }

        // Check for existing reservations
        $existingReservation = UserReservation::where('reservation_date', $reservationDate)
            ->where('price_id', $priceId)
            ->where('status', '!=', 'Rejected')
            ->where(function ($query) use ($requestStart, $requestEnd) {
                $query->where(function ($q) use ($requestStart, $requestEnd) {
                    $q->where('start_time', '<', $requestEnd->format('H:i:s'))
                        ->where('end_time', '>', $requestStart->format('H:i:s'));
                });
            })
            ->exists();

        if ($existingReservation) {
            return response()->json([
                'success' => false,
                'message' => 'This time slot is already BOOKED',
            ], 409);
        }

        $reservation = UserReservation::create([
            'user_name' => $request->user_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'pickup_location' => $request->pickup_location,
            'dropoff_location' => $request->dropoff_location,
            'reservation_date' => $reservationDate,
            'start_time' => $requestStart->format('H:i:s'),
            'end_time' => $requestEnd->format('H:i:s'),
            'price_id' => $request->price_id,
            'status' => 'Pending',
            'package_type' => $request->package_type ?? 'Standard',
            'test_time' => $request->test_time,
            'test_location' => $request->test_location,
        ]);

        $this->sendReservationEmails($reservation);

        return response()->json([
            'success' => true,
            'message' => 'Reservation created successfully',
            'data' => $reservation,
        ], 201);
    }

    // ---------------------------------------
    // Store bundle reservation - creates multiple records
    // ---------------------------------------
    private function storeBundle(Request $request)
    {
        // Validate bundle-specific data (no single reservation fields required)
        $request->validate([
            'user_name' => 'required',
            'email' => 'required|email',
            'phone' => 'required',
            'address' => 'required',
            'pickup_location' => 'required',
            'dropoff_location' => 'required',
            'price_id' => 'required|exists:prices,id',
            'package_type' => 'required|string',
            'bundle_sessions' => 'required|array|min:1',
            'bundle_sessions.*.reservation_date' => 'required|date',
            'bundle_sessions.*.start_time' => 'required',
            'bundle_sessions.*.end_time' => 'required',
        ]);

        $sessions = $request->bundle_sessions;
        $totalSessions = count($sessions);
        $priceId = $request->price_id;

        // Get the package to check expected session count
        $price = \App\Models\Price::find($priceId);
        $expectedCount = $this->extractLessonCount($price->description);

        if ($totalSessions != $expectedCount) {
            return response()->json([
                'success' => false,
                'message' => "This package requires {$expectedCount} sessions. You provided {$totalSessions} sessions.",
            ], 422);
        }

        $createdReservations = [];
        $errors = [];

        // Validate all sessions first
        foreach ($sessions as $index => $session) {
            $isAvailable = $this->isSessionAvailable(
                $session['reservation_date'],
                $session['start_time'],
                $session['end_time'],
                $priceId
            );

            if (! $isAvailable) {
                $errors[] = 'Session '.($index + 1)." on {$session['reservation_date']} from {$session['start_time']} to {$session['end_time']} is not available";
            }
        }

        if (! empty($errors)) {
            return response()->json([
                'success' => false,
                'message' => 'Some sessions are not available',
                'errors' => $errors,
            ], 409);
        }

        // Create all reservation records
        foreach ($sessions as $index => $session) {
            $reservationDate = Carbon::parse($session['reservation_date'])->format('Y-m-d');
            $startTime = Carbon::parse($session['start_time'])->format('H:i:s');
            $endTime = Carbon::parse($session['end_time'])->format('H:i:s');

            $reservation = UserReservation::create([
                'user_name' => $request->user_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'address' => $request->address,
                'pickup_location' => $request->pickup_location,
                'dropoff_location' => $request->dropoff_location,
                'reservation_date' => $reservationDate,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'price_id' => $priceId,
                'status' => 'Pending',
                'package_type' => $request->package_type,
                'test_time' => $session['test_time'] ?? null,
                'test_location' => $session['test_location'] ?? $request->test_location,
            ]);

            $createdReservations[] = $reservation;
        }

        // Send bundle email summary
        $this->sendBundleReservationEmails($createdReservations, $totalSessions);

        return response()->json([
            'success' => true,
            'message' => "Bundle reservation created successfully with {$totalSessions} sessions",
            'data' => $createdReservations,
        ], 201);
    }

    // ---------------------------------------
    // UPDATE - update existing reservation
    // ---------------------------------------
    public function update(Request $request, $id)
    {
        $reservation = UserReservation::find($id);

        if (! $reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Reservation not found',
            ], 404);
        }

        // Check if this is a status-only update
        $isStatusOnly = $request->has('status') && count($request->all()) === 1;

        if ($isStatusOnly) {
            return $this->updateStatus($request, $reservation);
        }

        return $this->updateSingle($request, $reservation);
    }

    // ---------------------------------------
    // Update single reservation
    // ---------------------------------------
    private function updateSingle(Request $request, $reservation)
    {
        $request->validate([
            'user_name' => 'required',
            'email' => 'required|email',
            'phone' => 'required',
            'address' => 'required',
            'pickup_location' => 'required',
            'dropoff_location' => 'required',
            'reservation_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'price_id' => 'required|exists:prices,id',
            'package_type' => 'required|string',
            'test_time' => 'nullable',
            'test_location' => 'nullable|string',
        ]);

        $requestStart = Carbon::parse($request->start_time);
        $requestEnd = Carbon::parse($request->end_time);
        $reservationDate = Carbon::parse($request->reservation_date)->format('Y-m-d');
        $priceId = $request->price_id;

        // Check for blocked slots
        $existingBlock = BlockReservation::where('date', $reservationDate)
            ->where(function ($query) use ($requestStart, $requestEnd) {
                $query->where(function ($q) use ($requestStart, $requestEnd) {
                    $q->where('start_time', '<', $requestEnd->format('H:i:s'))
                        ->where('end_time', '>', $requestStart->format('H:i:s'));
                });
            })
            ->exists();

        if ($existingBlock) {
            return response()->json([
                'success' => false,
                'message' => 'Selected time slot is blocked',
            ], 403);
        }

        // Check for overlapping reservations
        $overlappingReservation = UserReservation::where('reservation_date', $reservationDate)
            ->where('price_id', $priceId)
            ->where('id', '!=', $reservation->id)
            ->where('status', '!=', 'Rejected')
            ->where(function ($query) use ($requestStart, $requestEnd) {
                $query->where(function ($q) use ($requestStart, $requestEnd) {
                    $q->where('start_time', '<', $requestEnd->format('H:i:s'))
                        ->where('end_time', '>', $requestStart->format('H:i:s'));
                });
            })
            ->exists();

        if ($overlappingReservation) {
            return response()->json([
                'success' => false,
                'message' => 'Selected time slot is already reserved for this service',
            ], 409);
        }

        $oldStatus = $reservation->status;

        $reservation->update([
            'user_name' => $request->user_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'pickup_location' => $request->pickup_location,
            'dropoff_location' => $request->dropoff_location,
            'reservation_date' => $reservationDate,
            'start_time' => $requestStart->format('H:i:s'),
            'end_time' => $requestEnd->format('H:i:s'),
            'price_id' => $priceId,
            'package_type' => $request->package_type,
            'test_time' => $request->test_time,
            'test_location' => $request->test_location,
        ]);

        if ($oldStatus !== $reservation->status) {
            $this->sendStatusUpdateEmails($reservation, $oldStatus);
        }

        return response()->json([
            'success' => true,
            'message' => 'Reservation updated successfully',
            'data' => $reservation,
        ], 200);
    }

    // ---------------------------------------
    // Update status only
    // ---------------------------------------
    private function updateStatus(Request $request, $reservation)
    {
        $validated = $request->validate([
            'status' => 'required|in:Pending,Accepted,Rejected',
        ]);

        $oldStatus = $reservation->status;
        $newStatus = $validated['status'];

        if ($newStatus === 'Rejected') {
            $reservation->status = $newStatus;
            $reservation->save();
            $this->sendStatusUpdateEmails($reservation, $oldStatus);

            return response()->json([
                'success' => true,
                'message' => 'Reservation rejected successfully',
                'data' => $reservation,
            ], 200);
        }

        // For Accepting or Resetting to Pending, check for conflicts
        if ($newStatus === 'Accepted' || $newStatus === 'Pending') {
            $overlappingReservation = UserReservation::where('reservation_date', $reservation->reservation_date)
                ->where('price_id', $reservation->price_id)
                ->where('id', '!=', $reservation->id)
                ->where('status', '!=', 'Rejected')
                ->where(function ($query) use ($reservation) {
                    $query->where(function ($q) use ($reservation) {
                        $q->where('start_time', '<', $reservation->end_time)
                            ->where('end_time', '>', $reservation->start_time);
                    });
                })
                ->first();

            if ($overlappingReservation) {
                return response()->json([
                    'success' => false,
                    'message' => 'This time slot conflicts with another reservation for the same service',
                ], 409);
            }

            $blockedSlot = BlockReservation::where('date', $reservation->reservation_date)
                ->where(function ($query) use ($reservation) {
                    $query->where(function ($q) use ($reservation) {
                        $q->where('start_time', '<', $reservation->end_time)
                            ->where('end_time', '>', $reservation->start_time);
                    });
                })
                ->exists();

            if ($blockedSlot) {
                return response()->json([
                    'success' => false,
                    'message' => 'This time slot is blocked',
                ], 409);
            }
        }

        $reservation->status = $newStatus;
        $reservation->save();

        if ($oldStatus !== $newStatus) {
            $this->sendStatusUpdateEmails($reservation, $oldStatus);
        }

        return response()->json([
            'success' => true,
            'message' => 'Reservation status updated successfully',
            'data' => $reservation,
        ], 200);
    }

    // ---------------------------------------
    // DELETE - delete a reservation
    // ---------------------------------------
    public function destroy($id)
    {
        $reservation = UserReservation::find($id);

        if (! $reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Reservation not found',
            ], 404);
        }

        $reservation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Reservation deleted successfully',
        ], 200);
    }

    // ---------------------------------------
    // Helper: Send reservation emails
    // ---------------------------------------
    private function sendReservationEmails($reservation)
    {
        try {
            Mail::to($reservation->email)->send(new ReservationCreated($reservation, false));
        } catch (\Exception $e) {
            Log::error('Failed to send customer email: '.$e->getMessage());
        }

        try {
             $adminEmail = env('ADMIN_EMAIL', 'adhikariudaya736@gmail.com');
            // $adminEmail = env('ADMIN_EMAIL', 'wheelmaster@outlook.com.au');
            Mail::to($adminEmail)->send(new ReservationCreated($reservation, true));
        } catch (\Exception $e) {
            Log::error('Failed to send admin email: '.$e->getMessage());
        }
    }

    // ---------------------------------------
    // Helper: Send bundle reservation emails
    // ---------------------------------------
    private function sendBundleReservationEmails($reservations, $sessionCount)
    {
        if (empty($reservations)) {
            return;
        }

        $firstReservation = $reservations[0];

        try {
            Mail::to($firstReservation->email)->send(new ReservationCreated($firstReservation, false, $sessionCount));
        } catch (\Exception $e) {
            Log::error('Failed to send customer bundle email: '.$e->getMessage());
        }

        try {
             $adminEmail = env('ADMIN_EMAIL', 'adhikariudaya736@gmail.com');
           // $adminEmail = env('ADMIN_EMAIL', 'wheelmaster@outlook.com.au');
            Mail::to($adminEmail)->send(new ReservationCreated($firstReservation, true, $sessionCount));
        } catch (\Exception $e) {
            Log::error('Failed to send admin bundle email: '.$e->getMessage());
        }
    }

    // ---------------------------------------
    // Helper: Send status update emails
    // ---------------------------------------
    private function sendStatusUpdateEmails($reservation, $oldStatus)
    {
        if ($oldStatus === $reservation->status) {
            return;
        }

        try {
            Mail::to($reservation->email)->send(new ReservationStatusUpdated($reservation, false));
        } catch (\Exception $e) {
            Log::error('Failed to send customer status update email: '.$e->getMessage());
        }

        try {
             $adminEmail = env('ADMIN_EMAIL', 'adhikariudaya736@gmail.com');
           // $adminEmail = env('ADMIN_EMAIL', 'wheelmaster@outlook.com.au');
            Mail::to($adminEmail)->send(new ReservationStatusUpdated($reservation, true));
        } catch (\Exception $e) {
            Log::error('Failed to send admin status update email: '.$e->getMessage());
        }
    }
}
