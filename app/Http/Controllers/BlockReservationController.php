<?php

namespace App\Http\Controllers;

use App\Models\BlockReservation;
use Carbon\Carbon;
use Illuminate\Http\Request;

class BlockReservationController extends Controller
{
    public function index()
    {
        $blocks = BlockReservation::all();
        return response()->json([
            'success' => true,
            'data' => $blocks
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after_or_equal:start_date',
            'start_time'  => 'required',
            'end_time'    => 'required',
            'duration'    => 'required|numeric',
            'reason'      => 'nullable|string',
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        $endDate   = Carbon::parse($validated['end_date']);

        // Prevent abuse: cap range at 365 days
        if ($startDate->diffInDays($endDate) > 365) {
            return response()->json([
                'success' => false,
                'message' => 'Date range cannot exceed 365 days.'
            ], 422);
        }

        $created = [];
        $current = $startDate->copy();

        while ($current->lte($endDate)) {
            $created[] = BlockReservation::create([
                'date'       => $current->toDateString(),
                'start_time' => $validated['start_time'],
                'end_time'   => $validated['end_time'],
                'duration'   => $validated['duration'],
                'reason'     => $validated['reason'] ?? 'No reason provided',
            ]);
            $current->addDay();
        }

        return response()->json([
            'success' => true,
            'message' => count($created) . ' day(s) blocked successfully.',
            'data'    => $created
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $block = BlockReservation::findOrFail($id);

        $validated = $request->validate([
            'date'        => 'sometimes|date',
            'start_time'  => 'sometimes',
            'end_time'    => 'sometimes',
            'duration'    => 'sometimes|numeric',
            'reason'      => 'nullable|string',
        ]);

        $block->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Block reservation updated successfully.',
            'data'    => $block
        ]);
    }

    public function destroy($id)
    {
        $block = BlockReservation::findOrFail($id);
        $block->delete();

        return response()->json([
            'success' => true,
            'message' => 'Block reservation deleted successfully.'
        ]);
    }
}