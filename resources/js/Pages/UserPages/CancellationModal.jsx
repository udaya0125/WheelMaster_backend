import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { X, AlertTriangle, Loader2 } from "lucide-react";

/**
 * CancellationModal
 *
 * Shown instead of RescheduleModal once a booking is inside the
 * 48-hour reschedule cutoff (see UserDashboard's canCancel/
 * isPastRescheduleCutoff). Requires the user to explicitly accept the
 * cancellation policy before the Confirm button is enabled, then
 * submits a status-only PUT so it hits updateStatus() in
 * UserReservationController — that path sets status straight to
 * "Rejected" with no overlap/conflict checks and fires the existing
 * status-update emails.
 *
 * IMPORTANT: the route is registered as
 *   Route::put('/ouruserreservations/{id}', [UserReservationController::class, 'update'])
 *       ->name('ouruserreservations.update');
 * so this must use axios.put (not .patch) against
 * route('ouruserreservations.update', booking.id) — a mismatched verb
 * or route name fails silently client-side (Ziggy throws on an unknown
 * route name, or Laravel 405s on a verb mismatch) and the status never
 * actually changes.
 *
 * Props:
 *  - booking: the reservation object from UserDashboard
 *      (must include: id, reservation_date, start_time, end_time)
 *  - onClose: () => void
 *  - onCancelled: (updatedBooking) => void
 */
const CancellationModal = ({ booking, onClose, onCancelled }) => {
    const [accepted, setAccepted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // ── lock background scroll while modal is mounted ───────────────────
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        const previousPaddingRight = document.body.style.paddingRight;

        const scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth;

        document.body.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.style.paddingRight = previousPaddingRight;
        };
    }, []);

    const formatTo12Hour = (time) => {
        if (!time) return "";
        const [hours, minutes] = time.slice(0, 5).split(":");
        const h = parseInt(hours);
        const period = h >= 12 ? "PM" : "AM";
        const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
        return `${h12}:${minutes} ${period}`;
    };

    const handleConfirm = async () => {
        if (!accepted) {
            toast.error("Please accept the cancellation policy to continue");
            return;
        }

        setSubmitting(true);
        try {
            const response = await axios.put(
                route("ouruserreservations.update", booking.id),
                { status: "Rejected" },
            );

            if (response.data.success) {
                toast.success("Booking cancelled successfully");
                onCancelled?.(response.data.data);
                onClose();
            } else {
                toast.error(response.data.message || "Could not cancel booking");
            }
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Error cancelling booking. Please try again.";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center backdrop-blur-sm justify-center bg-black/50 px-4"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Cancel Booking
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>
                <p className="text-sm text-gray-500 mb-5">
                    {new Date(booking.reservation_date).toLocaleDateString(
                        "en-AU",
                        { weekday: "short", day: "numeric", month: "short" },
                    )}
                    , {formatTo12Hour(booking.start_time)} -{" "}
                    {formatTo12Hour(booking.end_time)}
                </p>

                {/* <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 mb-4">
                    <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 leading-snug">
                        This booking starts within 48 hours, so it can no longer be
                        rescheduled — it can only be cancelled.
                    </p>
                </div> */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 mb-4 max-h-40 overflow-y-auto">
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                        Cancellation Policy
                    </p>
                   <p className="text-xs text-gray-600 leading-relaxed">
    This lesson is within 48 hours of the scheduled start time and cannot
    be rescheduled. It can only be cancelled, and no refund will be provided
    for cancellations made within this period.
</p>
                </div>

                <label className="flex items-start gap-2 mb-6 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">
                        I accept the cancellation policy
                    </span>
                </label>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!accepted || submitting}
                        className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Cancelling...
                            </>
                        ) : (
                            "Confirm Cancellation"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancellationModal;