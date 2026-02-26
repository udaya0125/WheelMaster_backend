<?php

namespace App\Http\Controllers;

use App\Models\BlockReservation;
use Illuminate\Http\Request;

class BlockReservationController extends Controller
{
    /**
     * Display all block reservations
     */
    public function index()
    {
        $blocks = BlockReservation::all();
        return response()->json([
            'success' => true,
            'data' => $blocks
        ]);
    }

    /**
     * Store a new block reservation
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date'        => 'required|date',
            'start_time'  => 'required',
            'end_time'    => 'required',
            'duration'    => 'required|numeric',
            'reason'      => 'nullable|string',
        ]);

        $block = BlockReservation::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Block reservation created successfully.',
            'data'    => $block
        ], 201);
    }

    /**
     * Update an existing block reservation
     */
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

    /**
     * Delete an existing block reservation
     */
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
