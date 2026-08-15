// import React, { useEffect, useState, useCallback, useRef } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { X, Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";

// /**
//  * RescheduleModal
//  *
//  * Lets a logged-in user move an existing UserReservation to a new
//  * date/time. Reuses the same slot-availability endpoints and the same
//  * date/time display conventions as CalendarIntegrationMobile:
//  *   - dates grouped by month, with "✓ Available" / "✗ Fully booked" suffix
//  *   - a colored status banner under the date select
//  *   - times shown as "9:00 AM - 10:00 AM"
//  *
//  * IMPORTANT: every fetch here is keyed off exclude_reservation_id
//  * (= booking.id), NOT price_id. price_id is sent along if present
//  * (booking.price_id or booking.price?.id) as a nice-to-have, but the
//  * flow does not depend on it — duration is derived from the booking's
//  * own start/end time, and the backend derives it the same way when
//  * exclude_reservation_id is present. This means reschedule works even
//  * if whatever endpoint populated `booking` didn't include price_id.
//  *
//  * Props:
//  *  - booking: the reservation object from UserDashboard
//  *      (must include: id, reservation_date, start_time, end_time;
//  *       price_id / price.id is optional)
//  *  - onClose: () => void
//  *  - onRescheduled: (updatedBooking) => void
//  */
// const RescheduleModal = ({ booking, onClose, onRescheduled }) => {
//     const priceId = booking.price_id || booking.price?.id || null;

//     // Duration is derived from the existing booking's own start/end,
//     // so it always matches whatever package/duration was originally booked.
//     const durationMinutes = (() => {
//         const [sh, sm] = booking.start_time.slice(0, 5).split(":").map(Number);
//         const [eh, em] = booking.end_time.slice(0, 5).split(":").map(Number);
//         return eh * 60 + em - (sh * 60 + sm);
//     })();
//     const bookingStepMinutes = durationMinutes + 20; // 20-min driving buffer

//     const [allDates, setAllDates] = useState([]);
//     const [selectedDate, setSelectedDate] = useState("");
//     const [selectedTime, setSelectedTime] = useState("");
//     const [timeSlots, setTimeSlots] = useState({});
//     const [scheduleEnds, setScheduleEnds] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [availabilityLoading, setAvailabilityLoading] = useState(false);
//     const [submitting, setSubmitting] = useState(false);

//     const timeSlotsRef = useRef({});
//     const loadingDateKeyRef = useRef("");
//     const availabilityLoadingRef = useRef(false);

//     useEffect(() => {
//         timeSlotsRef.current = timeSlots;
//     }, [timeSlots]);

//     // ── helpers (mirrors CalendarIntegrationMobile) ──────────────────────

//     const formatDateKey = (date) => {
//         if (!date) return "";
//         const d = new Date(date);
//         const year = d.getFullYear();
//         const month = String(d.getMonth() + 1).padStart(2, "0");
//         const day = String(d.getDate()).padStart(2, "0");
//         return `${year}-${month}-${day}`;
//     };

//     const isPastDate = (dateString) => {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         const compareDate = new Date(dateString);
//         compareDate.setHours(0, 0, 0, 0);
//         return compareDate < today;
//     };

//     const calculateEndTime = (startTime) => {
//         let cleanStartTime = startTime;
//         if (cleanStartTime.includes(":")) {
//             const parts = cleanStartTime.split(":");
//             cleanStartTime = `${parts[0]}:${parts[1]}`;
//         }
//         const [hours, minutes] = cleanStartTime.split(":").map(Number);
//         const totalMinutes = hours * 60 + minutes + durationMinutes;
//         const endHours = Math.floor(totalMinutes / 60);
//         const endMinutes = totalMinutes % 60;
//         return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
//     };

//     const formatTo12Hour = (time) => {
//         const [hours, minutes] = time.split(":");
//         const h = parseInt(hours);
//         const period = h >= 12 ? "PM" : "AM";
//         const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
//         return `${h12}:${minutes} ${period}`;
//     };

//     const getTimeSlotDisplay = (startTime) => {
//         const endTime = calculateEndTime(startTime);
//         return `${formatTo12Hour(startTime)} - ${formatTo12Hour(endTime)}`;
//     };

//     // ── generate 365 days, grouped by month (same as booking page) ──────

//     useEffect(() => {
//         const dates = [];
//         const today = new Date();
//         for (let i = 0; i < 365; i++) {
//             const date = new Date(today);
//             date.setDate(today.getDate() + i);
//             const monthYear = date.toLocaleDateString("en-AU", {
//                 month: "long",
//                 year: "numeric",
//             });
//             const formatted = date.toLocaleDateString("en-AU", {
//                 weekday: "short",
//                 day: "2-digit",
//                 month: "short",
//                 year: "numeric",
//             });
//             dates.push({
//                 display: formatted,
//                 value: date.toISOString().split("T")[0],
//                 monthYear,
//             });
//         }
//         setAllDates(dates);
//     }, []);

//     const groupedDates = allDates.reduce((groups, date) => {
//         const key = date.monthYear;
//         if (!groups[key]) groups[key] = [];
//         groups[key].push(date);
//         return groups;
//     }, {});

//     // ── availability summary (powers the ✓/✗ labels in the dropdown) ────
//     // Keyed off exclude_reservation_id (always present), NOT price_id.

//     const applyAvailabilitySummary = useCallback((summary = {}) => {
//         const nextSlots = {};
//         const nextEnds = {};
//         Object.entries(summary).forEach(([dateKey, day]) => {
//             nextSlots[dateKey] = day.available_slots || [];
//             if (day.current_end) nextEnds[dateKey] = day.current_end;
//         });
//         timeSlotsRef.current = { ...timeSlotsRef.current, ...nextSlots };
//         setTimeSlots((prev) => ({ ...prev, ...nextSlots }));
//         setScheduleEnds((prev) => ({ ...prev, ...nextEnds }));
//     }, []);

//     const fetchAvailabilitySummary = useCallback(
//         async (startDate, endDate) => {
//             if (!startDate || !endDate) return {};

//             const response = await axios.get(
//                 route("ourtimeslots.availability-summary"),
//                 {
//                     params: {
//                         start_date: formatDateKey(startDate),
//                         end_date: formatDateKey(endDate),
//                         ...(priceId ? { price_id: priceId } : {}),
//                         exclude_reservation_id: booking.id,
//                     },
//                 },
//             );

//             if (!response.data.success) return {};

//             const summary = response.data.data || {};
//             applyAvailabilitySummary(summary);
//             return summary;
//         },
//         [priceId, booking.id, applyAvailabilitySummary],
//     );

//     const fetchDropdownAvailability = useCallback(async () => {
//         if (allDates.length === 0 || availabilityLoadingRef.current) return;
//         const datesToFetch = allDates
//             .slice(0, 60)
//             .filter(
//                 (date) =>
//                     !isPastDate(date.value) &&
//                     timeSlotsRef.current[date.value] === undefined,
//             );
//         if (datesToFetch.length === 0) return;
//         availabilityLoadingRef.current = true;
//         setAvailabilityLoading(true);
//         try {
//             await fetchAvailabilitySummary(
//                 datesToFetch[0].value,
//                 datesToFetch[datesToFetch.length - 1].value,
//             );
//         } finally {
//             availabilityLoadingRef.current = false;
//             setAvailabilityLoading(false);
//         }
//     }, [allDates, fetchAvailabilitySummary]);

//     useEffect(() => {
//         fetchDropdownAvailability();
//     }, [fetchDropdownAvailability]);

//     // ── slots for the selected date ──────────────────────────────────────
//     // Also keyed off exclude_reservation_id, NOT price_id.

//     const fetchSlotsForDate = useCallback(
//         async (dateKey) => {
//             if (!dateKey || isPastDate(dateKey)) return;
//             try {
//                 loadingDateKeyRef.current = dateKey;
//                 setLoading(true);
//                 const response = await axios.get(route("ourtimeslots.get"), {
//                     params: {
//                         date: dateKey,
//                         ...(priceId ? { price_id: priceId } : {}),
//                         exclude_reservation_id: booking.id,
//                     },
//                 });
//                 const available = response.data.success
//                     ? response.data.slots
//                           .filter((s) => s.status === "available")
//                           .map((s) => s.start_time)
//                     : [];
//                 timeSlotsRef.current = {
//                     ...timeSlotsRef.current,
//                     [dateKey]: available,
//                 };
//                 setTimeSlots((prev) => ({ ...prev, [dateKey]: available }));
//                 if (response.data.success) {
//                     setScheduleEnds((prev) => ({
//                         ...prev,
//                         [dateKey]: response.data.current_end,
//                     }));
//                 }
//             } catch (err) {
//                 console.error(`Error fetching slots for ${dateKey}:`, err);
//                 timeSlotsRef.current = { ...timeSlotsRef.current, [dateKey]: [] };
//                 setTimeSlots((prev) => ({ ...prev, [dateKey]: [] }));
//             } finally {
//                 if (loadingDateKeyRef.current === dateKey) {
//                     loadingDateKeyRef.current = "";
//                     setLoading(false);
//                 }
//             }
//         },
//         [priceId, booking.id],
//     );

//     useEffect(() => {
//         if (selectedDate) {
//             setSelectedTime("");
//             fetchSlotsForDate(selectedDate);
//         }
//     }, [selectedDate, fetchSlotsForDate]);

//     // ── bookable start times, respecting duration + 20-min driving buffer ──
//     // (Needed client-side: when price_id isn't sent, the backend's own
//     // duration-fit filtering is skipped, so this windowing is what keeps
//     // suggested times from overlapping the lesson + buffer.)

//     const getNonOverlappingSlots = (dateKey) => {
//         const slots = timeSlots[dateKey];
//         if (!slots || slots.length === 0) return [];

//         const timeToMinutes = (t) => {
//             const [h, m] = t.split(":").map(Number);
//             return h * 60 + m;
//         };
//         const minutesToTime = (mins) => {
//             const h = Math.floor(mins / 60);
//             const m = mins % 60;
//             return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
//         };

//         const sortedSlotMinutes = [...slots]
//             .map((slot) => {
//                 let startTime = slot;
//                 if (startTime.includes(":")) {
//                     const parts = startTime.split(":");
//                     startTime = `${parts[0]}:${parts[1]}`;
//                 }
//                 return timeToMinutes(startTime);
//             })
//             .filter(Number.isFinite)
//             .sort((a, b) => a - b);

//         if (sortedSlotMinutes.length === 0) return [];

//         const scheduleEndMinutes = scheduleEnds[dateKey]
//             ? timeToMinutes(scheduleEnds[dateKey])
//             : sortedSlotMinutes[sortedSlotMinutes.length - 1] + bookingStepMinutes;
//         const latestStartMinutes = scheduleEndMinutes - bookingStepMinutes;

//         const displaySlots = [];
//         let candidateMinutes = sortedSlotMinutes[0];
//         while (candidateMinutes <= latestStartMinutes) {
//             displaySlots.push(minutesToTime(candidateMinutes));
//             candidateMinutes += bookingStepMinutes;
//             const hasNearbyAvailableSlot = sortedSlotMinutes.some(
//                 (slotMinutes) =>
//                     slotMinutes >= candidateMinutes &&
//                     slotMinutes < candidateMinutes + 20,
//             );
//             if (!hasNearbyAvailableSlot) {
//                 const nextAvailableSlot = sortedSlotMinutes.find(
//                     (slotMinutes) => slotMinutes >= candidateMinutes,
//                 );
//                 if (nextAvailableSlot === undefined) break;
//                 candidateMinutes = nextAvailableSlot;
//             }
//         }
//         return displaySlots;
//     };

//     // ── same date-dropdown label/status helpers as CalendarIntegrationMobile ──

//     const getDateAvailabilityStatus = (dateValue) => {
//         if (!dateValue) return null;
//         if (isPastDate(dateValue))
//             return {
//                 label: "Past date",
//                 className: "border-gray-200 bg-gray-50 text-gray-500",
//             };
//         if (loading && selectedDate === dateValue)
//             return {
//                 label: "Checking availability...",
//                 className: "border-amber-200 bg-amber-50 text-amber-700",
//             };
//         if (timeSlots[dateValue] === undefined)
//             return {
//                 label: availabilityLoading
//                     ? "Checking availability..."
//                     : "Choose a time after selecting a date",
//                 className: availabilityLoading
//                     ? "border-amber-200 bg-amber-50 text-amber-700"
//                     : "border-gray-200 bg-gray-50 text-gray-600",
//             };
//         if (timeSlots[dateValue].length > 0)
//             return {
//                 label: "Available",
//                 className: "border-emerald-200 bg-emerald-50 text-emerald-700",
//             };
//         return {
//             label: "Fully booked",
//             className: "border-red-200 bg-red-50 text-red-700",
//         };
//     };

//     const getDateOptionLabel = (date) => {
//         if (isPastDate(date.value)) return `${date.display} (Past date)`;
//         const slots = timeSlots[date.value];
//         if (slots === undefined)
//             return availabilityLoading
//                 ? `${date.display} (Checking...)`
//                 : date.display;
//         return slots.length > 0
//             ? `${date.display} \u2713 Available`
//             : `${date.display} \u2715 Fully booked`;
//     };

//     const getDateOptionClassName = (dateValue) => {
//         if (isPastDate(dateValue)) return "py-1 text-gray-400";
//         if (timeSlots[dateValue] === undefined) return "py-1 text-gray-900";
//         return timeSlots[dateValue].length > 0
//             ? "py-1 text-emerald-700"
//             : "py-1 text-red-600";
//     };

//     // ── submit ────────────────────────────────────────────────────────────

//     const handleConfirm = async () => {
//         if (!selectedDate || !selectedTime) {
//             toast.error("Please select a date and time");
//             return;
//         }

//         setSubmitting(true);
//         try {
//             const response = await axios.patch(
//                 route("ourreservations.reschedule", booking.id),
//                 {
//                     reservation_date: selectedDate,
//                     start_time: selectedTime,
//                     end_time: calculateEndTime(selectedTime),
//                 },
//             );

//             if (response.data.success) {
//                 toast.success("Booking rescheduled successfully");
//                 onRescheduled?.(response.data.data);
//                 onClose();
//             } else {
//                 toast.error(response.data.message || "Could not reschedule");
//             }
//         } catch (error) {
//             const message =
//                 error.response?.data?.message ||
//                 "Error rescheduling booking. Please try again.";
//             toast.error(message);
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     const nonOverlappingSlots = getNonOverlappingSlots(selectedDate);

//     return (
//         <div
//             className="fixed inset-0 z-50 flex items-center backdrop-blur-sm justify-center bg-black/50 px-4"
//             role="dialog"
//             aria-modal="true"
//             onClick={onClose}
//         >
//             <div
//                 className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
//                 onClick={(e) => e.stopPropagation()}
//             >
//                 <div className="flex items-start justify-between mb-1">
//                     <h3 className="text-lg font-semibold text-gray-900">
//                         Reschedule Booking
//                     </h3>
//                     <button
//                         type="button"
//                         onClick={onClose}
//                         className="text-gray-400 hover:text-gray-600"
//                         aria-label="Close"
//                     >
//                         <X size={20} />
//                     </button>
//                 </div>
//                 <p className="text-sm text-gray-500 mb-5">
//                     Currently{" "}
//                     {new Date(booking.reservation_date).toLocaleDateString(
//                         "en-AU",
//                         { weekday: "short", day: "numeric", month: "short" },
//                     )}
//                     , {booking.start_time?.slice(0, 5)} -{" "}
//                     {booking.end_time?.slice(0, 5)}
//                 </p>

//                 {/* ── Date Selection ───────────────────────────────── */}
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Available Date <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative">
//                         <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                         <select
//                             value={selectedDate}
//                             onFocus={fetchDropdownAvailability}
//                             onMouseDown={fetchDropdownAvailability}
//                             onTouchStart={fetchDropdownAvailability}
//                             onChange={(e) => setSelectedDate(e.target.value)}
//                             className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 pl-10 transition"
//                             required
//                         >
//                             <option value="">Select a date</option>
//                             {Object.entries(groupedDates).map(
//                                 ([monthYear, dates]) => (
//                                     <optgroup
//                                         key={monthYear}
//                                         label={`-- ${monthYear} --`}
//                                         className="font-semibold text-gray-700"
//                                     >
//                                         {dates.map((date, i) => (
//                                             <option
//                                                 key={i}
//                                                 value={date.value}
//                                                 disabled={isPastDate(date.value)}
//                                                 className={getDateOptionClassName(
//                                                     date.value,
//                                                 )}
//                                             >
//                                                 {getDateOptionLabel(date)}
//                                             </option>
//                                         ))}
//                                     </optgroup>
//                                 ),
//                             )}
//                         </select>
//                     </div>
//                     {selectedDate && (
//                         <p
//                             className={`mt-2 rounded-lg border px-3 py-2 text-xs font-semibold ${getDateAvailabilityStatus(selectedDate).className}`}
//                         >
//                             {getDateAvailabilityStatus(selectedDate).label}
//                         </p>
//                     )}
//                 </div>

//                 {/* Legend */}
//                 <div className="mt-2 mb-4 flex flex-wrap items-center gap-3 text-xs">
//                     <div className="flex items-center gap-1">
//                         <span className="text-green-500 text-sm"> ✓</span>
//                         <span className="text-gray-600">Has available slots</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                         <span className="text-red-500 text-sm"> ✗</span>
//                         <span className="text-gray-600">No available slots</span>
//                     </div>
//                 </div>

//                 {/* ── Time Selection ───────────────────────────────── */}
//                 <div className="mb-6">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Available Time <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative">
//                         <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                         <select
//                             value={selectedTime}
//                             onChange={(e) => setSelectedTime(e.target.value)}
//                             disabled={!selectedDate || loading}
//                             className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 pl-10 transition disabled:opacity-50 disabled:cursor-not-allowed"
//                             required
//                         >
//                             <option value="">
//                                 {loading
//                                     ? "Loading..."
//                                     : !selectedDate
//                                       ? "Select a date first"
//                                       : "Select a time"}
//                             </option>
//                             {nonOverlappingSlots.map((time, i) => (
//                                 <option key={i} value={time}>
//                                     {getTimeSlotDisplay(time)}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                     {selectedDate &&
//                         nonOverlappingSlots.length === 0 &&
//                         !loading &&
//                         timeSlots[selectedDate] !== undefined && (
//                             <p className="mt-1 text-sm text-red-600">
//                                 No available time slots for this date. Please
//                                 select another date.
//                             </p>
//                         )}
//                 </div>

//                 <div className="flex gap-3">
//                     <button
//                         type="button"
//                         onClick={onClose}
//                         className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         type="button"
//                         onClick={handleConfirm}
//                         disabled={!selectedDate || !selectedTime || submitting}
//                         className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                     >
//                         {submitting ? (
//                             <>
//                                 <Loader2 size={16} className="animate-spin" />
//                                 Rescheduling...
//                             </>
//                         ) : (
//                             "Confirm Reschedule"
//                         )}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default RescheduleModal;


import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { X, Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";

/**
 * RescheduleModal
 *
 * Lets a logged-in user move an existing UserReservation to a new
 * date/time. Reuses the same slot-availability endpoints and the same
 * date/time display conventions as CalendarIntegrationMobile:
 * 
 *   - dates grouped by month, with "✓ Available" / "✗ Fully booked" suffix
 *   - a colored status banner under the date select
 *   - times shown as "9:00 AM - 10:00 AM"
 *
 * IMPORTANT: every fetch here is keyed off exclude_reservation_id
 * (= booking.id), NOT price_id. price_id is sent along if present
 * (booking.price_id or booking.price?.id) as a nice-to-have, but the
 * flow does not depend on it — duration is derived from the booking's
 * own start/end time, and the backend derives it the same way when
 * exclude_reservation_id is present. This means reschedule works even
 * if whatever endpoint populated `booking` didn't include price_id.
 *
 * Props:
 *  - booking: the reservation object from UserDashboard
 *      (must include: id, reservation_date, start_time, end_time;
 *       price_id / price.id is optional)
 *  - onClose: () => void
 *  - onRescheduled: (updatedBooking) => void
 */
const RescheduleModal = ({ booking, onClose, onRescheduled }) => {
    const priceId = booking.price_id || booking.price?.id || null;

    // Duration is derived from the existing booking's own start/end,
    // so it always matches whatever package/duration was originally booked.
    const durationMinutes = (() => {
        const [sh, sm] = booking.start_time.slice(0, 5).split(":").map(Number);
        const [eh, em] = booking.end_time.slice(0, 5).split(":").map(Number);
        return eh * 60 + em - (sh * 60 + sm);
    })();
    const bookingStepMinutes = durationMinutes + 20; // 20-min driving buffer

    const [allDates, setAllDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [timeSlots, setTimeSlots] = useState({});
    const [scheduleEnds, setScheduleEnds] = useState({});
    const [loading, setLoading] = useState(false);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const timeSlotsRef = useRef({});
    const loadingDateKeyRef = useRef("");
    const availabilityLoadingRef = useRef(false);

    useEffect(() => {
        timeSlotsRef.current = timeSlots;
    }, [timeSlots]);

    // ── lock background scroll while modal is mounted ───────────────────
    // Preserves whatever overflow value was already on <body> (in case
    // something else set it) and restores it on unmount, instead of
    // blindly forcing back to "auto"/"".
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        const previousPaddingRight = document.body.style.paddingRight;

        // Prevent the layout shift caused by the scrollbar disappearing.
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

    // ── helpers (mirrors CalendarIntegrationMobile) ──────────────────────

    const formatDateKey = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const isPastDate = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const compareDate = new Date(dateString);
        compareDate.setHours(0, 0, 0, 0);
        return compareDate < today;
    };

    const calculateEndTime = (startTime) => {
        let cleanStartTime = startTime;
        if (cleanStartTime.includes(":")) {
            const parts = cleanStartTime.split(":");
            cleanStartTime = `${parts[0]}:${parts[1]}`;
        }
        const [hours, minutes] = cleanStartTime.split(":").map(Number);
        const totalMinutes = hours * 60 + minutes + durationMinutes;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
    };

    const formatTo12Hour = (time) => {
        const [hours, minutes] = time.split(":");
        const h = parseInt(hours);
        const period = h >= 12 ? "PM" : "AM";
        const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
        return `${h12}:${minutes} ${period}`;
    };

    const getTimeSlotDisplay = (startTime) => {
        const endTime = calculateEndTime(startTime);
        return `${formatTo12Hour(startTime)} - ${formatTo12Hour(endTime)}`;
    };

    // ── generate 365 days, grouped by month (same as booking page) ──────

    useEffect(() => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const monthYear = date.toLocaleDateString("en-AU", {
                month: "long",
                year: "numeric",
            });
            const formatted = date.toLocaleDateString("en-AU", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
            dates.push({
                display: formatted,
                value: date.toISOString().split("T")[0],
                monthYear,
            });
        }
        setAllDates(dates);
    }, []);

    const groupedDates = allDates.reduce((groups, date) => {
        const key = date.monthYear;
        if (!groups[key]) groups[key] = [];
        groups[key].push(date);
        return groups;
    }, {});

    // ── availability summary (powers the ✓/✗ labels in the dropdown) ────
    // Keyed off exclude_reservation_id (always present), NOT price_id.

    const applyAvailabilitySummary = useCallback((summary = {}) => {
        const nextSlots = {};
        const nextEnds = {};
        Object.entries(summary).forEach(([dateKey, day]) => {
            nextSlots[dateKey] = day.available_slots || [];
            if (day.current_end) nextEnds[dateKey] = day.current_end;
        });
        timeSlotsRef.current = { ...timeSlotsRef.current, ...nextSlots };
        setTimeSlots((prev) => ({ ...prev, ...nextSlots }));
        setScheduleEnds((prev) => ({ ...prev, ...nextEnds }));
    }, []);

    const fetchAvailabilitySummary = useCallback(
        async (startDate, endDate) => {
            if (!startDate || !endDate) return {};

            const response = await axios.get(
                route("ourtimeslots.availability-summary"),
                {
                    params: {
                        start_date: formatDateKey(startDate),
                        end_date: formatDateKey(endDate),
                        ...(priceId ? { price_id: priceId } : {}),
                        exclude_reservation_id: booking.id,
                    },
                },
            );

            if (!response.data.success) return {};

            const summary = response.data.data || {};
            applyAvailabilitySummary(summary);
            return summary;
        },
        [priceId, booking.id, applyAvailabilitySummary],
    );

    const fetchDropdownAvailability = useCallback(async () => {
        if (allDates.length === 0 || availabilityLoadingRef.current) return;
        const datesToFetch = allDates
            .slice(0, 60)
            .filter(
                (date) =>
                    !isPastDate(date.value) &&
                    timeSlotsRef.current[date.value] === undefined,
            );
        if (datesToFetch.length === 0) return;
        availabilityLoadingRef.current = true;
        setAvailabilityLoading(true);
        try {
            await fetchAvailabilitySummary(
                datesToFetch[0].value,
                datesToFetch[datesToFetch.length - 1].value,
            );
        } finally {
            availabilityLoadingRef.current = false;
            setAvailabilityLoading(false);
        }
    }, [allDates, fetchAvailabilitySummary]);

    useEffect(() => {
        fetchDropdownAvailability();
    }, [fetchDropdownAvailability]);

    // ── slots for the selected date ──────────────────────────────────────
    // Also keyed off exclude_reservation_id, NOT price_id.

    const fetchSlotsForDate = useCallback(
        async (dateKey) => {
            if (!dateKey || isPastDate(dateKey)) return;
            try {
                loadingDateKeyRef.current = dateKey;
                setLoading(true);
                const response = await axios.get(route("ourtimeslots.get"), {
                    params: {
                        date: dateKey,
                        ...(priceId ? { price_id: priceId } : {}),
                        exclude_reservation_id: booking.id,
                    },
                });
                const available = response.data.success
                    ? response.data.slots
                          .filter((s) => s.status === "available")
                          .map((s) => s.start_time)
                    : [];
                timeSlotsRef.current = {
                    ...timeSlotsRef.current,
                    [dateKey]: available,
                };
                setTimeSlots((prev) => ({ ...prev, [dateKey]: available }));
                if (response.data.success) {
                    setScheduleEnds((prev) => ({
                        ...prev,
                        [dateKey]: response.data.current_end,
                    }));
                }
            } catch (err) {
                console.error(`Error fetching slots for ${dateKey}:`, err);
                timeSlotsRef.current = { ...timeSlotsRef.current, [dateKey]: [] };
                setTimeSlots((prev) => ({ ...prev, [dateKey]: [] }));
            } finally {
                if (loadingDateKeyRef.current === dateKey) {
                    loadingDateKeyRef.current = "";
                    setLoading(false);
                }
            }
        },
        [priceId, booking.id],
    );

    useEffect(() => {
        if (selectedDate) {
            setSelectedTime("");
            fetchSlotsForDate(selectedDate);
        }
    }, [selectedDate, fetchSlotsForDate]);

    // ── bookable start times, respecting duration + 20-min driving buffer ──
    // (Needed client-side: when price_id isn't sent, the backend's own
    // duration-fit filtering is skipped, so this windowing is what keeps
    // suggested times from overlapping the lesson + buffer.)

    const getNonOverlappingSlots = (dateKey) => {
        const slots = timeSlots[dateKey];
        if (!slots || slots.length === 0) return [];

        const timeToMinutes = (t) => {
            const [h, m] = t.split(":").map(Number);
            return h * 60 + m;
        };
        const minutesToTime = (mins) => {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        };

        const sortedSlotMinutes = [...slots]
            .map((slot) => {
                let startTime = slot;
                if (startTime.includes(":")) {
                    const parts = startTime.split(":");
                    startTime = `${parts[0]}:${parts[1]}`;
                }
                return timeToMinutes(startTime);
            })
            .filter(Number.isFinite)
            .sort((a, b) => a - b);

        if (sortedSlotMinutes.length === 0) return [];

        const scheduleEndMinutes = scheduleEnds[dateKey]
            ? timeToMinutes(scheduleEnds[dateKey])
            : sortedSlotMinutes[sortedSlotMinutes.length - 1] + bookingStepMinutes;
        const latestStartMinutes = scheduleEndMinutes - bookingStepMinutes;

        const displaySlots = [];
        let candidateMinutes = sortedSlotMinutes[0];
        while (candidateMinutes <= latestStartMinutes) {
            displaySlots.push(minutesToTime(candidateMinutes));
            candidateMinutes += bookingStepMinutes;
            const hasNearbyAvailableSlot = sortedSlotMinutes.some(
                (slotMinutes) =>
                    slotMinutes >= candidateMinutes &&
                    slotMinutes < candidateMinutes + 20,
            );
            if (!hasNearbyAvailableSlot) {
                const nextAvailableSlot = sortedSlotMinutes.find(
                    (slotMinutes) => slotMinutes >= candidateMinutes,
                );
                if (nextAvailableSlot === undefined) break;
                candidateMinutes = nextAvailableSlot;
            }
        }
        return displaySlots;
    };

    // ── same date-dropdown label/status helpers as CalendarIntegrationMobile ──

    const getDateAvailabilityStatus = (dateValue) => {
        if (!dateValue) return null;
        if (isPastDate(dateValue))
            return {
                label: "Past date",
                className: "border-gray-200 bg-gray-50 text-gray-500",
            };
        if (loading && selectedDate === dateValue)
            return {
                label: "Checking availability...",
                className: "border-amber-200 bg-amber-50 text-amber-700",
            };
        if (timeSlots[dateValue] === undefined)
            return {
                label: availabilityLoading
                    ? "Checking availability..."
                    : "Choose a time after selecting a date",
                className: availabilityLoading
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-gray-200 bg-gray-50 text-gray-600",
            };
        if (timeSlots[dateValue].length > 0)
            return {
                label: "Available",
                className: "border-emerald-200 bg-emerald-50 text-emerald-700",
            };
        return {
            label: "Fully booked",
            className: "border-red-200 bg-red-50 text-red-700",
        };
    };

    const getDateOptionLabel = (date) => {
        if (isPastDate(date.value)) return `${date.display} (Past date)`;
        const slots = timeSlots[date.value];
        if (slots === undefined)
            return availabilityLoading
                ? `${date.display} (Checking...)`
                : date.display;
        return slots.length > 0
            ? `${date.display} \u2713 Available`
            : `${date.display} \u2715 Fully booked`;
    };

    const getDateOptionClassName = (dateValue) => {
        if (isPastDate(dateValue)) return "py-1 text-gray-400";
        if (timeSlots[dateValue] === undefined) return "py-1 text-gray-900";
        return timeSlots[dateValue].length > 0
            ? "py-1 text-emerald-700"
            : "py-1 text-red-600";
    };

    // ── submit ────────────────────────────────────────────────────────────

    const handleConfirm = async () => {
        if (!selectedDate || !selectedTime) {
            toast.error("Please select a date and time");
            return;
        }

        setSubmitting(true);
        try {
            const response = await axios.patch(
                route("ourreservations.reschedule", booking.id),
                {
                    reservation_date: selectedDate,
                    start_time: selectedTime,
                    end_time: calculateEndTime(selectedTime),
                },
            );

            if (response.data.success) {
                toast.success("Booking rescheduled successfully");
                onRescheduled?.(response.data.data);
                onClose();
            } else {
                toast.error(response.data.message || "Could not reschedule");
            }
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Error rescheduling booking. Please try again.";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const nonOverlappingSlots = getNonOverlappingSlots(selectedDate);

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
                        Reschedule Booking
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
                    Currently{" "}
                    {new Date(booking.reservation_date).toLocaleDateString(
                        "en-AU",
                        { weekday: "short", day: "numeric", month: "short" },
                    )}
                    , {booking.start_time?.slice(0, 5)} -{" "}
                    {booking.end_time?.slice(0, 5)}
                </p>

                {/* ── Date Selection ───────────────────────────────── */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        <select
                            value={selectedDate}
                            onFocus={fetchDropdownAvailability}
                            onMouseDown={fetchDropdownAvailability}
                            onTouchStart={fetchDropdownAvailability}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 pl-10 transition"
                            required
                        >
                            <option value="">Select a date</option>
                            {Object.entries(groupedDates).map(
                                ([monthYear, dates]) => (
                                    <optgroup
                                        key={monthYear}
                                        label={`-- ${monthYear} --`}
                                        className="font-semibold text-gray-700"
                                    >
                                        {dates.map((date, i) => (
                                            <option
                                                key={i}
                                                value={date.value}
                                                disabled={isPastDate(date.value)}
                                                className={getDateOptionClassName(
                                                    date.value,
                                                )}
                                            >
                                                {getDateOptionLabel(date)}
                                            </option>
                                        ))}
                                    </optgroup>
                                ),
                            )}
                        </select>
                    </div>
                    {selectedDate && (
                        <p
                            className={`mt-2 rounded-lg border px-3 py-2 text-xs font-semibold ${getDateAvailabilityStatus(selectedDate).className}`}
                        >
                            {getDateAvailabilityStatus(selectedDate).label}
                        </p>
                    )}
                </div>

                {/* Legend */}
                <div className="mt-2 mb-4 flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                        <span className="text-green-500 text-sm"> ✓</span>
                        <span className="text-gray-600">Has available slots</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-red-500 text-sm"> ✗</span>
                        <span className="text-gray-600">No available slots</span>
                    </div>
                </div>

                {/* ── Time Selection ───────────────────────────────── */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Time <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        <select
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            disabled={!selectedDate || loading}
                            className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 pl-10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            required
                        >
                            <option value="">
                                {loading
                                    ? "Loading..."
                                    : !selectedDate
                                      ? "Select a date first"
                                      : "Select a time"}
                            </option>
                            {nonOverlappingSlots.map((time, i) => (
                                <option key={i} value={time}>
                                    {getTimeSlotDisplay(time)}
                                </option>
                            ))}
                        </select>
                    </div>
                    {selectedDate &&
                        nonOverlappingSlots.length === 0 &&
                        !loading &&
                        timeSlots[selectedDate] !== undefined && (
                            <p className="mt-1 text-sm text-red-600">
                                No available time slots for this date. Please
                                select another date.
                            </p>
                        )}
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!selectedDate || !selectedTime || submitting}
                        className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Rescheduling...
                            </>
                        ) : (
                            "Confirm Reschedule"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RescheduleModal;
