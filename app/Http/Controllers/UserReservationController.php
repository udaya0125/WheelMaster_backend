<?php

namespace App\Http\Controllers;

use App\Mail\ReservationCreated;
use App\Mail\ReservationStatusUpdated;
use App\Models\BlockReservation;
use App\Models\Notification;
use App\Models\Testimonial;
use App\Models\UserReservation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class UserReservationController extends Controller
{
    // ---------------------------------------
    // INDEX  - list all reservations
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
    // STORE - create new reservation
    // ---------------------------------------
    public function store(Request $request)
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

        // Check if selected slot overlaps with any blocked reservation
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

        // Check if selected slot overlaps with any existing NON-REJECTED reservation
        $existingReservation = UserReservation::where('reservation_date', $reservationDate)
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
                'message' => 'Selected time slot is already reserved',
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

        // $testinomials = Testimonial::create([
        //     'author_name' => 'Udaya Adhikari',
        //     'comment' => 'Great service!',
        //     'author_role' => 'Customer',
        // ]);

        // // Create notification for new reservation
        // // Create notification for new reservation
        // $notification = Notification::create([
        //     'message' => "New reservation from {$reservation->user_name} for {$reservationDate} ({$requestStart->format('h:i A')} - {$requestEnd->format('h:i A')})",
        //     'is_read' => false,
        // ]);

        // // Debug log
        // Log::debug('Notification created:', [
        //     'id' => $notification->id,
        //     'message' => $notification->message,
        //     'is_read' => $notification->is_read,
        // ]);

        // Send email to customer
        // try {
        //     Mail::to($reservation->email)->send(new ReservationCreated($reservation, false));
        // } catch (\Exception $e) {
        //     Log::error('Failed to send customer email: '.$e->getMessage());
        // }

        // // Send email to admin
        // try {
        //     $adminEmail = env('ADMIN_EMAIL', 'Wheelmaster@outlook.com.au');
        //     Mail::to($adminEmail)->send(new ReservationCreated($reservation, true));
        // } catch (\Exception $e) {
        //     Log::error('Failed to send admin email: '.$e->getMessage());
        // }

        return response()->json([
            'success' => true,
            'message' => 'Reservation created successfully',
            'data' => $reservation,
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

        // Validate only status when it's provided
        $validated = $request->validate([
            'status' => 'sometimes|in:Pending,Accepted,Rejected',
        ]);

        // If no status is provided, return error
        if (! isset($validated['status'])) {
            return response()->json([
                'success' => false,
                'message' => 'Status is required for update',
            ], 400);
        }

        // Store old status to check if it changed
        $oldStatus = $reservation->status;
        $newStatus = $validated['status'];

        // If status is being updated to "Rejected", no need to check for conflicts
        if ($newStatus === 'Rejected') {
            $reservation->status = $newStatus;
            $reservation->save();

            // Send status update emails
            $this->sendStatusUpdateEmails($reservation, $oldStatus);

            return response()->json([
                'success' => true,
                'message' => 'Reservation rejected successfully',
                'data' => $reservation,
            ], 200);
        }

        // For Accepting or Resetting to Pending, check for conflicts
        if ($newStatus === 'Accepted' || $newStatus === 'Pending') {
            // Check for overlapping reservations (excluding rejected ones)
            $overlappingReservation = UserReservation::where('reservation_date', $reservation->reservation_date)
                ->where('id', '!=', $id)
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
                    'message' => 'This time slot conflicts with another reservation (ID: '.$overlappingReservation->id.')',
                ], 409);
            }

            // Check for blocked slots
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

        // Update the status
        $reservation->status = $newStatus;
        $reservation->save();

        // Send status update emails if status changed
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
    // SHOW - show single reservation
    // ---------------------------------------
    public function show($id)
    {
        $reservation = UserReservation::with('price')->find($id);

        if (! $reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Reservation not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
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
    // PRIVATE HELPER - Send status update emails
    // ---------------------------------------
    private function sendStatusUpdateEmails($reservation, $oldStatus)
    {
        // Only send emails if status actually changed
        if ($oldStatus === $reservation->status) {
            return;
        }

        // Send email to customer
        try {
            Mail::to($reservation->email)->send(new ReservationStatusUpdated($reservation, false));
        } catch (\Exception $e) {
            Log::error('Failed to send customer status update email: '.$e->getMessage());
        }

        // Send email to admin
        try {
            $adminEmail = env('ADMIN_EMAIL', 'Wheelmaster@outlook.com.au');
            Mail::to($adminEmail)->send(new ReservationStatusUpdated($reservation, true));
        } catch (\Exception $e) {
            Log::error('Failed to send admin status update email: '.$e->getMessage());
        }
    }
}
