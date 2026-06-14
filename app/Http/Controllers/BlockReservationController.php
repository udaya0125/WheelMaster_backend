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
            'data' => $blocks,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'start_time' => 'required',
            'end_time' => 'required',
            'duration' => 'required|numeric',
            'reason' => 'nullable|string',
            'block_action' => 'nullable|in:block_time,open_window',
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);

        // Prevent abuse: cap range at 365 days
        if ($startDate->diffInDays($endDate) > 365) {
            return response()->json([
                'success' => false,
                'message' => 'Date range cannot exceed 365 days.',
            ], 422);
        }

        $created = [];
        $current = $startDate->copy();
        $blockAction = $validated['block_action'] ?? 'block_time';

        while ($current->lte($endDate)) {
            if ($blockAction === 'open_window') {
                BlockReservation::where('date', $current->toDateString())->delete();

                $created = array_merge($created, $this->createOpenWindowBlocks(
                    $current->toDateString(),
                    $validated['start_time'],
                    $validated['end_time'],
                    $validated['reason'] ?? 'Open window'
                ));
            } else {
                $created[] = BlockReservation::create([
                    'date' => $current->toDateString(),
                    'start_time' => Carbon::parse($validated['start_time'])->format('H:i:s'),
                    'end_time' => Carbon::parse($validated['end_time'])->format('H:i:s'),
                    'duration' => $validated['duration'],
                    'reason' => $validated['reason'] ?? 'No reason provided',
                ]);
            }
            $current->addDay();
        }

        return response()->json([
            'success' => true,
            'message' => count($created).' day(s) blocked successfully.',
            'data' => $created,
        ], 201);
    }

    private function createOpenWindowBlocks($date, $openStartTime, $openEndTime, $reason)
    {
        $workingStart = Carbon::createFromTime(7, 0, 0);
        $workingEnd = Carbon::createFromTime(18, 0, 0);
        $openStart = Carbon::parse($openStartTime);
        $openEnd = Carbon::parse($openEndTime);
        $blocks = [];

        $ranges = [
            [$workingStart, $openStart],
            [$openEnd, $workingEnd],
        ];

        foreach ($ranges as [$start, $end]) {
            if ($start >= $end) {
                continue;
            }

            $blocks[] = BlockReservation::create([
                'date' => $date,
                'start_time' => $start->format('H:i:s'),
                'end_time' => $end->format('H:i:s'),
                'duration' => round($start->diffInMinutes($end) / 60, 1),
                'reason' => $reason,
            ]);
        }

        return $blocks;
    }

    public function update(Request $request, $id)
    {
        $block = BlockReservation::findOrFail($id);

        $validated = $request->validate([
            'date' => 'sometimes|date',
            'start_time' => 'sometimes',
            'end_time' => 'sometimes',
            'duration' => 'sometimes|numeric',
            'reason' => 'nullable|string',
            'block_action' => 'nullable|in:block_time,open_window',
        ]);

        if (($validated['block_action'] ?? 'block_time') === 'open_window') {
            $date = $validated['date'] ?? $block->date;
            $startTime = $validated['start_time'] ?? $block->start_time;
            $endTime = $validated['end_time'] ?? $block->end_time;
            $reason = $validated['reason'] ?? $block->reason ?? 'Open window';

            BlockReservation::where('date', $date)->delete();
            $created = $this->createOpenWindowBlocks($date, $startTime, $endTime, $reason);

            return response()->json([
                'success' => true,
                'message' => 'Availability window updated successfully.',
                'data' => $created,
            ]);
        }

        unset($validated['block_action']);

        if (isset($validated['start_time'])) {
            $validated['start_time'] = Carbon::parse($validated['start_time'])->format('H:i:s');
        }

        if (isset($validated['end_time'])) {
            $validated['end_time'] = Carbon::parse($validated['end_time'])->format('H:i:s');
        }

        $block->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Block reservation updated successfully.',
            'data' => $block,
        ]);
    }

    public function destroy($id)
    {
        $block = BlockReservation::findOrFail($id);
        $block->delete();

        return response()->json([
            'success' => true,
            'message' => 'Block reservation deleted successfully.',
        ]);
    }
}
