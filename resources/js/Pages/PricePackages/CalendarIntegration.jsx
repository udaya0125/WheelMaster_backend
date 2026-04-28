// import { Calendar } from "@/components/ui/calendar";
// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import BookingForm from "./BookingForm";
// import { Link } from "@inertiajs/react";
// import { ChevronLeft } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";

// const CalendarIntegration = ({ price }) => {
//     const [timeSlots, setTimeSlots] = useState({});
//     const [selectedDate, setSelectedDate] = useState(new Date());
//     const [selectedTime, setSelectedTime] = useState(null);
//     const [showNextAvailability, setShowNextAvailability] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [showBookingForm, setShowBookingForm] = useState(false);
//     const [nextAvailableDates, setNextAvailableDates] = useState([]);
//     const [bookedSlots, setBookedSlots] = useState([]);
//     const [allSlotsData, setAllSlotsData] = useState({});

//     useEffect(() => {
//         const fetchTimeSlots = async () => {
//             try {
//                 setLoading(true);
//                 const dateKey = formatDateKey(selectedDate);
//                 // console.log(
//                 //     "Fetching slots for date:",
//                 //     dateKey,
//                 //     "price_id:",
//                 //     price?.id,
//                 // );

//                 const response = await axios.get(route("ourtimeslots.get"), {
//                     params: {
//                         date: dateKey,
//                         price_id: price.id,
//                     },
//                 });

//                 // console.log("API Response:", response.data);

//                 if (response.data.success) {
//                     // Store all slots data for debugging
//                     setAllSlotsData((prev) => ({
//                         ...prev,
//                         [dateKey]: response.data.slots,
//                     }));

//                     // Get all slots with their status
//                     const allSlots = response.data.slots || [];

//                     // Track booked slots (reserved or blocked)
//                     const booked = allSlots
//                         .filter(
//                             (slot) =>
//                                 slot.status === "reserved" ||
//                                 slot.status === "blocked",
//                         )
//                         .map((slot) => {
//                             const startTime = slot.start_time;
//                             if (
//                                 typeof startTime === "string" &&
//                                 startTime.includes(":")
//                             ) {
//                                 const parts = startTime.split(":");
//                                 return `${parts[0]}:${parts[1]}`;
//                             }
//                             return startTime;
//                         });

//                     // console.log("Booked slots for this date:", booked);
//                     setBookedSlots(booked);

//                     // Get available slots
//                     const available = allSlots
//                         .filter((slot) => slot.status === "available")
//                         .map((slot) => {
//                             const startTime = slot.start_time;
//                             if (
//                                 typeof startTime === "string" &&
//                                 startTime.includes(":")
//                             ) {
//                                 const parts = startTime.split(":");
//                                 return `${parts[0]}:${parts[1]}`;
//                             }
//                             return startTime;
//                         });

//                     // console.log("Available slots from API:", available);

//                     setTimeSlots((prev) => ({
//                         ...prev,
//                         [dateKey]: available,
//                     }));
//                 } else {
//                     console.error(
//                         "Error fetching time slots:",
//                         response.data.message,
//                     );
//                     toast.error("Error loading time slots. Please try again.");
//                 }
//             } catch (err) {
//                 console.error("Error fetching time slots:", err);
//                 toast.error("Error loading time slots. Please try again.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (selectedDate && price?.id) {
//             fetchTimeSlots();
//         }
//     }, [price?.id, selectedDate]);

//     const isPastDate = (date) => {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         const compareDate = new Date(date);
//         compareDate.setHours(0, 0, 0, 0);
//         return compareDate < today;
//     };

//     const getTimeSlotsForDate = (date) => {
//         if (!date) return [];
//         const dateKey = formatDateKey(date);
//         return timeSlots[dateKey] || [];
//     };

//     const formatDateKey = (date) => {
//         if (!date) return "";
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, "0");
//         const day = String(date.getDate()).padStart(2, "0");
//         return `${year}-${month}-${day}`;
//     };

//     const formatDisplayDate = (date) => {
//         if (!date) return "Select a date";
//         return date.toLocaleDateString("en-US", {
//             weekday: "long",
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//         });
//     };

//     const hasTimeSlots = (date) => {
//         const slots = getTimeSlotsForDate(date);
//         return slots.length > 0;
//     };

//     const findNextAvailableDates = async () => {
//         try {
//             const availableDates = [];
//             const today = new Date();

//             for (let i = 1; i <= 30; i++) {
//                 const nextDate = new Date(today);
//                 nextDate.setDate(today.getDate() + i);
//                 const dateKey = formatDateKey(nextDate);

//                 try {
//                     const response = await axios.get(
//                         route("ourtimeslots.get"),
//                         {
//                             params: {
//                                 date: dateKey,
//                                 price_id: price.id,
//                             },
//                         },
//                     );

//                     if (response.data.success) {
//                         const availableSlots = response.data.slots
//                             .filter((slot) => slot.status === "available")
//                             .map((slot) => {
//                                 const startTime = slot.start_time;
//                                 if (
//                                     typeof startTime === "string" &&
//                                     startTime.includes(":")
//                                 ) {
//                                     const parts = startTime.split(":");
//                                     return `${parts[0]}:${parts[1]}`;
//                                 }
//                                 return startTime;
//                             });

//                         setTimeSlots((prev) => ({
//                             ...prev,
//                             [dateKey]: availableSlots,
//                         }));

//                         if (availableSlots.length > 0) {
//                             availableDates.push(new Date(nextDate));
//                         }
//                     }
//                 } catch (err) {
//                     console.error(`Error fetching slots for ${dateKey}:`, err);
//                 }

//                 if (availableDates.length >= 3) {
//                     break;
//                 }
//             }

//             return availableDates;
//         } catch (error) {
//             console.error("Error finding next available dates:", error);
//             return [];
//         }
//     };

//     const parseDuration = (durationString) => {
//         if (!durationString) return 60;

//         const cleanString = durationString.trim().toLowerCase();
//         const hourMatch = cleanString.match(
//             /(\d+(?:\.\d+)?)\s*(?:hrs|hr|hour|hours)/,
//         );
//         const minuteMatch = cleanString.match(
//             /(\d+)\s*(?:min|mins|minute|minutes)/,
//         );

//         let totalMinutes = 0;

//         if (hourMatch) {
//             totalMinutes += parseFloat(hourMatch[1]) * 60;
//         }
//         if (minuteMatch) {
//             totalMinutes += parseInt(minuteMatch[1]);
//         }

//         if (totalMinutes === 0) {
//             const numberMatch = cleanString.match(/(\d+(?:\.\d+)?)/);
//             if (numberMatch) {
//                 const num = parseFloat(numberMatch[1]);
//                 totalMinutes =
//                     num < 10 ? Math.round(num * 60) : Math.round(num);
//             }
//         }

//         return totalMinutes || 60;
//     };

//     const calculateEndTime = (startTime, durationString) => {
//         const durationMinutes = parseDuration(durationString);
//         const startTimeStr =
//             typeof startTime === "object" ? startTime.start_time : startTime;

//         let cleanStartTime = startTimeStr;
//         if (
//             typeof cleanStartTime === "string" &&
//             cleanStartTime.includes(":")
//         ) {
//             const parts = cleanStartTime.split(":");
//             if (parts.length >= 2) {
//                 cleanStartTime = `${parts[0]}:${parts[1]}`;
//             }
//         }

//         const [hours, minutes] = cleanStartTime.split(":").map(Number);
//         const totalMinutes = hours * 60 + minutes + durationMinutes;
//         const endHours = Math.floor(totalMinutes / 60);
//         const endMinutes = totalMinutes % 60;

//         return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
//     };

//     const formatDurationDisplay = (durationString) => {
//         const minutes = parseDuration(durationString);
//         const hours = Math.floor(minutes / 60);
//         const mins = minutes % 60;

//         if (hours > 0 && mins > 0) {
//             return `${hours} ${hours === 1 ? "hour" : "hours"} ${mins} minutes`;
//         } else if (hours > 0) {
//             return `${hours} ${hours === 1 ? "hour" : "hours"}`;
//         } else {
//             return `${mins} minutes`;
//         }
//     };

//     // FIXED: Get non-overlapping slots with 30-minute buffer after booked slots
//     // const getNonOverlappingSlots = (slots) => {
//     //     if (!slots || slots.length === 0) return [];

//     //     const durationMinutes = parseDuration(price.duration);
//     //     const result = [];

//     //     const timeToMinutes = (timeStr) => {
//     //         const [h, m] = timeStr.split(":").map(Number);
//     //         return h * 60 + m;
//     //     };

//     //     // Sort slots by time
//     //     const sortedSlots = [...slots].sort((a, b) => {
//     //         const timeA = timeToMinutes(typeof a === "string" ? a : a.start_time);
//     //         const timeB = timeToMinutes(typeof b === "string" ? b : b.start_time);
//     //         return timeA - timeB;
//     //     });

//     //     console.log("Booked slots to check against:", bookedSlots);

//     //     // Create a set of booked start times and also track their end times
//     //     const bookedPeriods = [];
//     //     for (const bookedTime of bookedSlots) {
//     //         const bookedMinutes = timeToMinutes(bookedTime);
//     //         // Each booked slot is 30 minutes
//     //         bookedPeriods.push({
//     //             start: bookedMinutes,
//     //             end: bookedMinutes + 30
//     //         });
//     //     }

//     //     // Merge overlapping booked periods to create continuous blocked periods
//     //     const mergedBookedPeriods = [];
//     //     if (bookedPeriods.length > 0) {
//     //         // Sort by start time
//     //         bookedPeriods.sort((a, b) => a.start - b.start);

//     //         let current = bookedPeriods[0];
//     //         for (let i = 1; i < bookedPeriods.length; i++) {
//     //             if (bookedPeriods[i].start <= current.end) {
//     //                 // Overlapping, merge
//     //                 current.end = Math.max(current.end, bookedPeriods[i].end);
//     //             } else {
//     //                 // Non-overlapping, push current and start new
//     //                 mergedBookedPeriods.push(current);
//     //                 current = bookedPeriods[i];
//     //             }
//     //         }
//     //         mergedBookedPeriods.push(current);
//     //     }

//     //     console.log("Merged booked periods:", mergedBookedPeriods);

//     //     let nextAllowedStart = -1;

//     //     for (const slot of sortedSlots) {
//     //         let startTimeStr = typeof slot === "string" ? slot : slot?.start_time;
//     //         if (startTimeStr?.includes(":")) {
//     //             const parts = startTimeStr.split(":");
//     //             startTimeStr = `${parts[0]}:${parts[1]}`;
//     //         }

//     //         const startMinutes = timeToMinutes(startTimeStr);
//     //         const slotEndMinutes = startMinutes + durationMinutes;

//     //         // Check if this slot overlaps with any booked period OR starts too close to a booked period
//     //         let isBlocked = false;
//     //         for (const period of mergedBookedPeriods) {
//     //             // Check if slot overlaps with booked period
//     //             if (startMinutes < period.end && slotEndMinutes > period.start) {
//     //                 console.log(`Slot ${startTimeStr} overlaps with booked period ${period.start}-${period.end}`);
//     //                 isBlocked = true;
//     //                 break;
//     //             }

//     //             // Check if slot starts less than 30 minutes after a booked period ends
//     //             // This ensures a 30-minute buffer
//     //             if (startMinutes >= period.end && startMinutes < period.end + 30) {
//     //                 console.log(`Slot ${startTimeStr} starts too soon after booked period ends at ${period.end}`);
//     //                 isBlocked = true;
//     //                 break;
//     //             }
//     //         }

//     //         if (isBlocked) {
//     //             continue;
//     //         }

//     //         // Check non-overlap with previous selected slots
//     //         if (nextAllowedStart === -1 || startMinutes >= nextAllowedStart) {
//     //             console.log(`Adding slot ${startTimeStr} to results`);
//     //             result.push(slot);
//     //             nextAllowedStart = startMinutes + durationMinutes;
//     //         }
//     //     }

//     //     console.log("Final filtered slots:", result.map(s => typeof s === "string" ? s : s.start_time));
//     //     return result;
//     // };

//     // FIXED: Get non-overlapping slots with 20-minute buffer after booked slots
//     const getNonOverlappingSlots = (slots) => {
//         if (!slots || slots.length === 0) return [];

//         const durationMinutes = parseDuration(price.duration);
//         const result = [];

//         const timeToMinutes = (timeStr) => {
//             const [h, m] = timeStr.split(":").map(Number);
//             return h * 60 + m;
//         };

//         // Sort slots by time
//         const sortedSlots = [...slots].sort((a, b) => {
//             const timeA = timeToMinutes(
//                 typeof a === "string" ? a : a.start_time,
//             );
//             const timeB = timeToMinutes(
//                 typeof b === "string" ? b : b.start_time,
//             );
//             return timeA - timeB;
//         });

//         // console.log("Booked slots to check against:", bookedSlots);

//         // Create a set of booked start times and also track their end times
//         const bookedPeriods = [];
//         for (const bookedTime of bookedSlots) {
//             const bookedMinutes = timeToMinutes(bookedTime);
//             // Each booked slot is 20 minutes (changed from 30)
//             bookedPeriods.push({
//                 start: bookedMinutes,
//                 end: bookedMinutes + 20, // Changed from 30 to 20
//             });
//         }

//         // Merge overlapping booked periods to create continuous blocked periods
//         const mergedBookedPeriods = [];
//         if (bookedPeriods.length > 0) {
//             // Sort by start time
//             bookedPeriods.sort((a, b) => a.start - b.start);

//             let current = bookedPeriods[0];
//             for (let i = 1; i < bookedPeriods.length; i++) {
//                 if (bookedPeriods[i].start <= current.end) {
//                     // Overlapping, merge
//                     current.end = Math.max(current.end, bookedPeriods[i].end);
//                 } else {
//                     // Non-overlapping, push current and start new
//                     mergedBookedPeriods.push(current);
//                     current = bookedPeriods[i];
//                 }
//             }
//             mergedBookedPeriods.push(current);
//         }

//         // console.log("Merged booked periods:", mergedBookedPeriods);

//         let nextAllowedStart = -1;

//         for (const slot of sortedSlots) {
//             let startTimeStr =
//                 typeof slot === "string" ? slot : slot?.start_time;
//             if (startTimeStr?.includes(":")) {
//                 const parts = startTimeStr.split(":");
//                 startTimeStr = `${parts[0]}:${parts[1]}`;
//             }

//             const startMinutes = timeToMinutes(startTimeStr);
//             const slotEndMinutes = startMinutes + durationMinutes;

//             // Check if this slot overlaps with any booked period OR starts too close to a booked period
//             let isBlocked = false;
//             for (const period of mergedBookedPeriods) {
//                 // Check if slot overlaps with booked period
//                 if (
//                     startMinutes < period.end &&
//                     slotEndMinutes > period.start
//                 ) {
//                     console.log(
//                         `Slot ${startTimeStr} overlaps with booked period ${period.start}-${period.end}`,
//                     );
//                     isBlocked = true;
//                     break;
//                 }

//                 // Check if slot starts less than 20 minutes after a booked period ends (changed from 30 to 20)
//                 // This ensures a 20-minute buffer
//                 if (
//                     startMinutes >= period.end &&
//                     startMinutes < period.end + 20
//                 ) {
//                     // Changed from 30 to 20
//                     console.log(
//                         `Slot ${startTimeStr} starts too soon after booked period ends at ${period.end}`,
//                     );
//                     isBlocked = true;
//                     break;
//                 }
//             }

//             if (isBlocked) {
//                 continue;
//             }

//             // Check non-overlap with previous selected slots
//             if (nextAllowedStart === -1 || startMinutes >= nextAllowedStart) {
//                 console.log(`Adding slot ${startTimeStr} to results`);
//                 result.push(slot);
//                 nextAllowedStart = startMinutes + durationMinutes;
//             }
//         }

//         // console.log(
//         //     "Final filtered slots:",
//         //     result.map((s) => (typeof s === "string" ? s : s.start_time)),
//         // );
//         return result;
//     };

//     const handleNextAvailabilityClick = async () => {
//         setShowNextAvailability(true);
//         const loadingToast = toast.loading("Checking next available dates...");
//         const availableDates = await findNextAvailableDates();
//         setNextAvailableDates(availableDates);
//         toast.dismiss(loadingToast);

//         if (availableDates.length === 0) {
//             toast.error("No available dates found in the next 30 days.");
//         } else {
//             toast.success(`Found ${availableDates.length} available dates`);
//         }
//     };

//     const handleSelectNextAvailableDate = (date) => {
//         setSelectedDate(date);
//         setSelectedTime(null);
//         setShowNextAvailability(false);
//         toast.success(`Selected date: ${date.toLocaleDateString()}`);
//     };

//     const handleConfirmBookingClick = () => {
//         if (selectedTime && price?.duration) {
//             setTimeout(() => {
//                 setShowBookingForm(true);
//             }, 500);
//         } else {
//             toast.error("Please select a time slot first");
//         }
//     };

//     const handleBookingSuccess = async () => {
//         const loadingToast = toast.loading(
//             "Refreshing available time slots...",
//         );

//         try {
//             setLoading(true);
//             const dateKey = formatDateKey(selectedDate);
//             const response = await axios.get(route("ourtimeslots.get"), {
//                 params: {
//                     date: dateKey,
//                     price_id: price.id,
//                 },
//             });

//             if (response.data.success) {
//                 const allSlots = response.data.slots || [];

//                 // Update booked slots
//                 const booked = allSlots
//                     .filter(
//                         (slot) =>
//                             slot.status === "reserved" ||
//                             slot.status === "blocked",
//                     )
//                     .map((slot) => {
//                         const startTime = slot.start_time;
//                         if (
//                             typeof startTime === "string" &&
//                             startTime.includes(":")
//                         ) {
//                             const parts = startTime.split(":");
//                             return `${parts[0]}:${parts[1]}`;
//                         }
//                         return startTime;
//                     });

//                 setBookedSlots(booked);

//                 const available = allSlots
//                     .filter((slot) => slot.status === "available")
//                     .map((slot) => {
//                         const startTime = slot.start_time;
//                         if (
//                             typeof startTime === "string" &&
//                             startTime.includes(":")
//                         ) {
//                             const parts = startTime.split(":");
//                             return `${parts[0]}:${parts[1]}`;
//                         }
//                         return startTime;
//                     });

//                 setTimeSlots((prev) => ({
//                     ...prev,
//                     [dateKey]: available,
//                 }));

//                 setAllSlotsData((prev) => ({
//                     ...prev,
//                     [dateKey]: allSlots,
//                 }));

//                 toast.dismiss(loadingToast);
//                 toast.success("Booking confirmed! Time slots refreshed.");
//             }
//         } catch (error) {
//             console.error("Error refreshing time slots:", error);
//             toast.dismiss(loadingToast);
//             toast.error("Booking confirmed, but failed to refresh time slots");
//         } finally {
//             setLoading(false);
//             setSelectedTime(null);
//             setShowBookingForm(false);
//         }
//     };

//     const handleTimeSelect = (time) => {
//         setSelectedTime(time);
//     };

//     const handleDateSelect = (date) => {
//         if (date && !isPastDate(date)) {
//             setSelectedDate(date);
//             setSelectedTime(null);
//             setShowNextAvailability(false);
//         } else if (date && isPastDate(date)) {
//             toast.error("Cannot select past dates", {
//                 icon: "⚠️",
//             });
//         }
//     };

//     const currentTimeSlots = getTimeSlotsForDate(selectedDate);

//     const getTimeSlotDisplay = (slot) => {
//         let startTimeStr = typeof slot === "string" ? slot : slot?.start_time;
//         if (startTimeStr?.includes(":")) {
//             const parts = startTimeStr.split(":");
//             startTimeStr = `${parts[0]}:${parts[1]}`;
//         }
//         const endTimeStr = calculateEndTime(startTimeStr, price.duration);
//         return `${startTimeStr} - ${endTimeStr}`;
//     };

//     const renderDayContent = (date) => {
//         const hasSlots = hasTimeSlots(date);
//         const isSelected =
//             selectedDate && date.toDateString() === selectedDate.toDateString();
//         const isPast = isPastDate(date);

//         return (
//             <div className="relative">
//                 <span className={isPast ? "text-gray-400" : ""}>
//                     {date.getDate()}
//                 </span>
//                 {hasSlots && !isSelected && !isPast && (
//                     <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full"></div>
//                 )}
//             </div>
//         );
//     };

//     return (
//         <div className="min-h-screen bg-gray-50">
//             <Toaster
//                 position="top-right"
//                 toastOptions={{
//                     duration: 4000,
//                     style: {
//                         background: "#363636",
//                         color: "#fff",
//                     },
//                     success: {
//                         duration: 3000,
//                         style: {
//                             background: "#10b981",
//                             color: "#fff",
//                         },
//                     },
//                     error: {
//                         duration: 4000,
//                         style: {
//                             background: "#ef4444",
//                             color: "#fff",
//                         },
//                     },
//                     loading: {
//                         style: {
//                             background: "#3b82f6",
//                             color: "#fff",
//                         },
//                     },
//                 }}
//             />

//             <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
//                 <Link
//                     href={"/"}
//                     className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
//                 >
//                     <ChevronLeft size={20} />
//                     <span className="font-medium">Back</span>
//                 </Link>

//                 <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6">
//                     <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
//                         Schedule Your Service
//                     </h1>
//                     <p className="text-gray-600 text-sm sm:text-base">
//                         Check out our availability and book the date and time
//                         that works for you
//                     </p>
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
//                     {/* Calendar Section */}
//                     <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-1">
//                         <div className="mb-4">
//                             <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
//                                 Select a Date
//                             </h2>
//                             <p className="text-xs sm:text-sm text-gray-500">
//                                 Time zone: Australian Western Standard Time
//                                 (GMT+8)
//                             </p>
//                             <div className="flex items-center mt-2 text-xs text-gray-500">
//                                 <div className="flex items-center mr-4">
//                                     <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></div>
//                                     <span>Available</span>
//                                 </div>
//                             </div>
//                         </div>
//                         <Calendar
//                             mode="single"
//                             selected={selectedDate}
//                             onSelect={handleDateSelect}
//                             disabled={isPastDate}
//                             className="rounded-md border [&_.rdp-day_selected]:bg-emerald-600 [&_.rdp-day_selected]:text-white [&_.rdp-day_selected:hover]:bg-emerald-700 [&_.rdp-button:hover]:bg-emerald-50 [&_.rdp-day_today]:bg-gray-100 [&_.rdp-day_disabled]:text-gray-400 [&_.rdp-day_disabled]:cursor-not-allowed"
//                             components={{
//                                 DayContent: ({ date }) =>
//                                     renderDayContent(date),
//                             }}
//                         />
//                     </div>

//                     {/* Time Slots Section */}
//                     <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-1">
//                         <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
//                             Available Times
//                         </h2>
//                         <p className="text-xs sm:text-sm text-gray-500 mb-4">
//                             {formatDisplayDate(selectedDate)}
//                         </p>

//                         {loading ? (
//                             <div className="flex flex-col items-center justify-center py-8">
//                                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
//                                 <p className="text-gray-500 text-sm mt-3">
//                                     Loading time slots...
//                                 </p>
//                             </div>
//                         ) : currentTimeSlots.length > 0 ? (
//                             <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
//                                 {getNonOverlappingSlots(currentTimeSlots).map(
//                                     (time, index) => {
//                                         const timeDisplay =
//                                             getTimeSlotDisplay(time);
//                                         return (
//                                             <button
//                                                 key={index}
//                                                 onClick={() =>
//                                                     handleTimeSelect(time)
//                                                 }
//                                                 className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg border-2 transition-all duration-200 font-medium text-sm sm:text-base ${
//                                                     selectedTime === time
//                                                         ? "border-indigo-600 bg-indigo-600 text-white shadow-md"
//                                                         : "border-gray-200 hover:border-indigo-300 text-gray-700 hover:bg-indigo-50"
//                                                 }`}
//                                             >
//                                                 {timeDisplay}
//                                             </button>
//                                         );
//                                     },
//                                 )}
//                             </div>
//                         ) : (
//                             <div className="text-center py-4">
//                                 <div className="text-gray-400 mb-3">
//                                     <svg
//                                         className="w-12 h-12 mx-auto"
//                                         fill="none"
//                                         stroke="currentColor"
//                                         viewBox="0 0 24 24"
//                                     >
//                                         <path
//                                             strokeLinecap="round"
//                                             strokeLinejoin="round"
//                                             strokeWidth={1}
//                                             d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
//                                         />
//                                     </svg>
//                                 </div>
//                                 <p className="text-gray-500 font-medium mb-2">
//                                     {isPastDate(selectedDate)
//                                         ? "Cannot select past dates"
//                                         : "No available time slots"}
//                                 </p>
//                                 <p className="text-gray-400 text-sm mb-4">
//                                     {isPastDate(selectedDate)
//                                         ? "Please select a current or future date"
//                                         : "Please select another date"}
//                                 </p>

//                                 {!showNextAvailability ? (
//                                     <button
//                                         onClick={handleNextAvailabilityClick}
//                                         className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
//                                     >
//                                         Check Next Availability
//                                     </button>
//                                 ) : (
//                                     <div className="mt-4">
//                                         <h3 className="text-sm font-semibold text-gray-900 mb-3 text-left">
//                                             Next available dates:
//                                         </h3>
//                                         <div className="space-y-2">
//                                             {nextAvailableDates.map(
//                                                 (date, index) => (
//                                                     <button
//                                                         key={index}
//                                                         onClick={() =>
//                                                             handleSelectNextAvailableDate(
//                                                                 date,
//                                                             )
//                                                         }
//                                                         className="w-full py-2 px-3 text-left bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors duration-200"
//                                                     >
//                                                         <div className="text-sm font-medium text-gray-900">
//                                                             {date.toLocaleDateString(
//                                                                 "en-US",
//                                                                 {
//                                                                     weekday:
//                                                                         "short",
//                                                                     month: "short",
//                                                                     day: "numeric",
//                                                                 },
//                                                             )}
//                                                         </div>
//                                                         <div className="text-xs text-gray-600">
//                                                             {
//                                                                 getTimeSlotsForDate(
//                                                                     date,
//                                                                 ).length
//                                                             }{" "}
//                                                             time slots available
//                                                         </div>
//                                                     </button>
//                                                 ),
//                                             )}
//                                         </div>
//                                         {nextAvailableDates.length === 0 && (
//                                             <p className="text-gray-500 text-sm py-2">
//                                                 No available dates found in the
//                                                 next 30 days.
//                                             </p>
//                                         )}
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                     </div>

//                     {/* Service Details Section */}
//                     <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-1">
//                         <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
//                             Service Details
//                         </h2>

//                         <div className="space-y-4 mb-6">
//                             <div>
//                                 <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
//                                     {price.category || "Driving Lessons"}
//                                 </h3>
//                                 <p className="text-xs sm:text-sm text-gray-600">
//                                     {price.description ||
//                                         "Professional driving instruction with certified instructors"}
//                                 </p>
//                             </div>

//                             <div className="border-t pt-4">
//                                 <div className="flex justify-between text-xs sm:text-sm mb-2">
//                                     <span className="text-gray-600">
//                                         Package:
//                                     </span>
//                                     <span className="font-medium text-gray-900">
//                                         {price.description}
//                                     </span>
//                                 </div>
//                                 <div className="flex justify-between text-xs sm:text-sm mb-2">
//                                     <span className="text-gray-600">
//                                         Duration:
//                                     </span>
//                                     <span className="font-medium text-gray-900">
//                                         {formatDurationDisplay(price.duration)}
//                                     </span>
//                                 </div>
//                                 <div className="flex justify-between text-xs sm:text-sm mb-2">
//                                     <span className="text-gray-600">
//                                         Price:
//                                     </span>
//                                     <span className="font-medium text-gray-900">
//                                         ${price.price}
//                                     </span>
//                                 </div>
//                                 {selectedDate && selectedTime && (
//                                     <>
//                                         <div className="flex justify-between text-xs sm:text-sm">
//                                             <span className="text-gray-600">
//                                                 Selected:
//                                             </span>
//                                             <span className="font-medium text-gray-900 text-right">
//                                                 {selectedDate.toLocaleDateString()}{" "}
//                                                 at{" "}
//                                                 {getTimeSlotDisplay(
//                                                     selectedTime,
//                                                 )}
//                                             </span>
//                                         </div>
//                                         <div className="flex justify-between text-xs sm:text-sm mt-1">
//                                             <span className="text-gray-600">
//                                                 End Time:
//                                             </span>
//                                             <span className="font-medium text-indigo-600 text-right">
//                                                 {calculateEndTime(
//                                                     selectedTime,
//                                                     price.duration,
//                                                 )}
//                                             </span>
//                                         </div>
//                                     </>
//                                 )}
//                             </div>
//                         </div>

//                         <button
//                             onClick={handleConfirmBookingClick}
//                             disabled={!selectedTime || isPastDate(selectedDate)}
//                             className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
//                                 selectedTime && !isPastDate(selectedDate)
//                                     ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transform hover:scale-105"
//                                     : "bg-gray-200 text-gray-400 cursor-not-allowed"
//                             }`}
//                         >
//                             {selectedTime ? "Confirm Booking" : "Select a Time"}
//                         </button>

//                         {selectedTime && (
//                             <p className="text-xs text-center text-gray-500 mt-3">
//                                 You'll be asked to complete your details in the
//                                 next step
//                             </p>
//                         )}
//                     </div>
//                 </div>

//                 {/* Booking Form Modal */}
//                 {showBookingForm && (
//                     <BookingForm
//                         selectedDate={selectedDate}
//                         selectedTime={selectedTime}
//                         priceId={price.id}
//                         price={price}
//                         onClose={() => setShowBookingForm(false)}
//                         onBookingSuccess={handleBookingSuccess}
//                     />
//                 )}
//             </div>
//         </div>
//     );
// };

// export default CalendarIntegration;


import { Calendar } from "@/components/ui/calendar";
import axios from "axios";
import React, { useEffect, useState } from "react";
import BookingForm from "./BookingForm";
import { Link } from "@inertiajs/react";
import { ChevronLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const CalendarIntegration = ({ price }) => {
    const [timeSlots, setTimeSlots] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(null);
    const [showNextAvailability, setShowNextAvailability] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [nextAvailableDates, setNextAvailableDates] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [allSlotsData, setAllSlotsData] = useState({});
    const [dateStatus, setDateStatus] = useState(new Map()); // Map to store status of each date: 'available' or 'no-slots'

    // Pre-fetch next few dates to show indicators
    useEffect(() => {
        const preFetchDates = async () => {
            const today = new Date();
            const datesToFetch = [];
            
            // Fetch next 30 days to show proper indicators
            for (let i = 1; i <= 30; i++) {
                const nextDate = new Date(today);
                nextDate.setDate(today.getDate() + i);
                datesToFetch.push(nextDate);
            }
            
            for (const date of datesToFetch) {
                const dateKey = formatDateKey(date);
                if (!allSlotsData[dateKey]) {
                    try {
                        const response = await axios.get(route("ourtimeslots.get"), {
                            params: {
                                date: dateKey,
                                price_id: price.id,
                            },
                        });
                        
                        if (response.data.success) {
                            const allSlots = response.data.slots || [];
                            setAllSlotsData((prev) => ({
                                ...prev,
                                [dateKey]: allSlots,
                            }));
                            
                            // Check if date has any AVAILABLE slots
                            const hasAvailableSlots = allSlots.some(slot => slot.status === "available");
                            
                            setDateStatus(prev => {
                                const newMap = new Map(prev);
                                if (hasAvailableSlots) {
                                    newMap.set(dateKey, 'has-slots');
                                } else {
                                    newMap.set(dateKey, 'no-slots');
                                }
                                return newMap;
                            });
                        }
                    } catch (err) {
                        console.error(`Error pre-fetching slots for ${dateKey}:`, err);
                    }
                }
            }
        };
        
        if (price?.id) {
            preFetchDates();
        }
    }, [price?.id]);

    useEffect(() => {
        const fetchTimeSlots = async () => {
            try {
                setLoading(true);
                const dateKey = formatDateKey(selectedDate);

                const response = await axios.get(route("ourtimeslots.get"), {
                    params: {
                        date: dateKey,
                        price_id: price.id,
                    },
                });

                if (response.data.success) {
                    // Store all slots data
                    setAllSlotsData((prev) => ({
                        ...prev,
                        [dateKey]: response.data.slots,
                    }));

                    // Get all slots with their status
                    const allSlots = response.data.slots || [];

                    // Track booked slots (reserved or blocked)
                    const booked = allSlots
                        .filter(
                            (slot) =>
                                slot.status === "reserved" ||
                                slot.status === "blocked",
                        )
                        .map((slot) => {
                            const startTime = slot.start_time;
                            if (
                                typeof startTime === "string" &&
                                startTime.includes(":")
                            ) {
                                const parts = startTime.split(":");
                                return `${parts[0]}:${parts[1]}`;
                            }
                            return startTime;
                        });

                    setBookedSlots(booked);

                    // Get available slots
                    const available = allSlots
                        .filter((slot) => slot.status === "available")
                        .map((slot) => {
                            const startTime = slot.start_time;
                            if (
                                typeof startTime === "string" &&
                                startTime.includes(":")
                            ) {
                                const parts = startTime.split(":");
                                return `${parts[0]}:${parts[1]}`;
                            }
                            return startTime;
                        });

                    setTimeSlots((prev) => ({
                        ...prev,
                        [dateKey]: available,
                    }));
                    
                    // Update date status based on whether there are available slots
                    const hasAvailableSlots = available.length > 0;
                    setDateStatus(prev => {
                        const newMap = new Map(prev);
                        if (hasAvailableSlots) {
                            newMap.set(dateKey, 'has-slots');
                        } else {
                            newMap.set(dateKey, 'no-slots');
                        }
                        return newMap;
                    });
                } else {
                    console.error(
                        "Error fetching time slots:",
                        response.data.message,
                    );
                    toast.error("Error loading time slots. Please try again.");
                }
            } catch (err) {
                console.error("Error fetching time slots:", err);
                toast.error("Error loading time slots. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (selectedDate && price?.id) {
            fetchTimeSlots();
        }
    }, [price?.id, selectedDate]);

    const isPastDate = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        return compareDate < today;
    };

    const getTimeSlotsForDate = (date) => {
        if (!date) return [];
        const dateKey = formatDateKey(date);
        return timeSlots[dateKey] || [];
    };

    const getAllSlotsForDate = (date) => {
        if (!date) return [];
        const dateKey = formatDateKey(date);
        return allSlotsData[dateKey] || [];
    };

    const formatDateKey = (date) => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const formatDisplayDate = (date) => {
        if (!date) return "Select a date";
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getDateStatus = (date) => {
        if (!date) return 'unknown';
        const dateKey = formatDateKey(date);
        const status = dateStatus.get(dateKey);
        
        if (status === 'has-slots') {
            return 'has-slots';
        } else if (status === 'no-slots') {
            return 'no-slots';
        }
        return 'unknown';
    };

    const findNextAvailableDates = async () => {
        try {
            const availableDates = [];
            const today = new Date();

            for (let i = 1; i <= 30; i++) {
                const nextDate = new Date(today);
                nextDate.setDate(today.getDate() + i);
                const dateKey = formatDateKey(nextDate);

                try {
                    const response = await axios.get(
                        route("ourtimeslots.get"),
                        {
                            params: {
                                date: dateKey,
                                price_id: price.id,
                            },
                        },
                    );

                    if (response.data.success) {
                        const allSlots = response.data.slots || [];
                        
                        setAllSlotsData((prev) => ({
                            ...prev,
                            [dateKey]: allSlots,
                        }));
                        
                        const availableSlots = allSlots
                            .filter((slot) => slot.status === "available")
                            .map((slot) => {
                                const startTime = slot.start_time;
                                if (
                                    typeof startTime === "string" &&
                                    startTime.includes(":")
                                ) {
                                    const parts = startTime.split(":");
                                    return `${parts[0]}:${parts[1]}`;
                                }
                                return startTime;
                            });

                        setTimeSlots((prev) => ({
                            ...prev,
                            [dateKey]: availableSlots,
                        }));

                        // Update date status
                        const hasAvailableSlots = availableSlots.length > 0;
                        setDateStatus(prev => {
                            const newMap = new Map(prev);
                            if (hasAvailableSlots) {
                                newMap.set(dateKey, 'has-slots');
                            } else {
                                newMap.set(dateKey, 'no-slots');
                            }
                            return newMap;
                        });

                        if (availableSlots.length > 0) {
                            availableDates.push(new Date(nextDate));
                        }
                    }
                } catch (err) {
                    console.error(`Error fetching slots for ${dateKey}:`, err);
                }

                if (availableDates.length >= 3) {
                    break;
                }
            }
            
            return availableDates;
        } catch (error) {
            console.error("Error finding next available dates:", error);
            return [];
        }
    };

    const parseDuration = (durationString) => {
        if (!durationString) return 60;

        const cleanString = durationString.trim().toLowerCase();
        const hourMatch = cleanString.match(
            /(\d+(?:\.\d+)?)\s*(?:hrs|hr|hour|hours)/,
        );
        const minuteMatch = cleanString.match(
            /(\d+)\s*(?:min|mins|minute|minutes)/,
        );

        let totalMinutes = 0;

        if (hourMatch) {
            totalMinutes += parseFloat(hourMatch[1]) * 60;
        }
        if (minuteMatch) {
            totalMinutes += parseInt(minuteMatch[1]);
        }

        if (totalMinutes === 0) {
            const numberMatch = cleanString.match(/(\d+(?:\.\d+)?)/);
            if (numberMatch) {
                const num = parseFloat(numberMatch[1]);
                totalMinutes =
                    num < 10 ? Math.round(num * 60) : Math.round(num);
            }
        }

        return totalMinutes || 60;
    };

    const calculateEndTime = (startTime, durationString) => {
        const durationMinutes = parseDuration(durationString);
        const startTimeStr =
            typeof startTime === "object" ? startTime.start_time : startTime;

        let cleanStartTime = startTimeStr;
        if (
            typeof cleanStartTime === "string" &&
            cleanStartTime.includes(":")
        ) {
            const parts = cleanStartTime.split(":");
            if (parts.length >= 2) {
                cleanStartTime = `${parts[0]}:${parts[1]}`;
            }
        }

        const [hours, minutes] = cleanStartTime.split(":").map(Number);
        const totalMinutes = hours * 60 + minutes + durationMinutes;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;

        return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
    };

    const formatDurationDisplay = (durationString) => {
        const minutes = parseDuration(durationString);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0 && mins > 0) {
            return `${hours} ${hours === 1 ? "hour" : "hours"} ${mins} minutes`;
        } else if (hours > 0) {
            return `${hours} ${hours === 1 ? "hour" : "hours"}`;
        } else {
            return `${mins} minutes`;
        }
    };

    // Get non-overlapping slots with 20-minute buffer after booked slots
    const getNonOverlappingSlots = (slots) => {
        if (!slots || slots.length === 0) return [];

        const durationMinutes = parseDuration(price.duration);
        const result = [];

        const timeToMinutes = (timeStr) => {
            const [h, m] = timeStr.split(":").map(Number);
            return h * 60 + m;
        };

        // Sort slots by time
        const sortedSlots = [...slots].sort((a, b) => {
            const timeA = timeToMinutes(
                typeof a === "string" ? a : a.start_time,
            );
            const timeB = timeToMinutes(
                typeof b === "string" ? b : b.start_time,
            );
            return timeA - timeB;
        });

        // Create a set of booked start times and also track their end times
        const bookedPeriods = [];
        for (const bookedTime of bookedSlots) {
            const bookedMinutes = timeToMinutes(bookedTime);
            bookedPeriods.push({
                start: bookedMinutes,
                end: bookedMinutes + 20,
            });
        }

        // Merge overlapping booked periods to create continuous blocked periods
        const mergedBookedPeriods = [];
        if (bookedPeriods.length > 0) {
            bookedPeriods.sort((a, b) => a.start - b.start);

            let current = bookedPeriods[0];
            for (let i = 1; i < bookedPeriods.length; i++) {
                if (bookedPeriods[i].start <= current.end) {
                    current.end = Math.max(current.end, bookedPeriods[i].end);
                } else {
                    mergedBookedPeriods.push(current);
                    current = bookedPeriods[i];
                }
            }
            mergedBookedPeriods.push(current);
        }

        let nextAllowedStart = -1;

        for (const slot of sortedSlots) {
            let startTimeStr =
                typeof slot === "string" ? slot : slot?.start_time;
            if (startTimeStr?.includes(":")) {
                const parts = startTimeStr.split(":");
                startTimeStr = `${parts[0]}:${parts[1]}`;
            }

            const startMinutes = timeToMinutes(startTimeStr);
            const slotEndMinutes = startMinutes + durationMinutes;

            // Check if this slot overlaps with any booked period OR starts too close to a booked period
            let isBlocked = false;
            for (const period of mergedBookedPeriods) {
                if (
                    startMinutes < period.end &&
                    slotEndMinutes > period.start
                ) {
                    isBlocked = true;
                    break;
                }

                if (
                    startMinutes >= period.end &&
                    startMinutes < period.end + 20
                ) {
                    isBlocked = true;
                    break;
                }
            }

            if (isBlocked) {
                continue;
            }

            if (nextAllowedStart === -1 || startMinutes >= nextAllowedStart) {
                result.push(slot);
                nextAllowedStart = startMinutes + durationMinutes;
            }
        }

        return result;
    };

    const handleNextAvailabilityClick = async () => {
        setShowNextAvailability(true);
        const loadingToast = toast.loading("Checking next available dates...");
        const availableDates = await findNextAvailableDates();
        setNextAvailableDates(availableDates);
        toast.dismiss(loadingToast);

        if (availableDates.length === 0) {
            toast.error("No available dates found in the next 30 days.");
        } else {
            toast.success(`Found ${availableDates.length} available dates`);
        }
    };

    const handleSelectNextAvailableDate = (date) => {
        setSelectedDate(date);
        setSelectedTime(null);
        setShowNextAvailability(false);
        toast.success(`Selected date: ${date.toLocaleDateString()}`);
    };

    const handleConfirmBookingClick = () => {
        if (selectedTime && price?.duration) {
            setTimeout(() => {
                setShowBookingForm(true);
            }, 500);
        } else {
            toast.error("Please select a time slot first");
        }
    };

    const handleBookingSuccess = async () => {
        const loadingToast = toast.loading(
            "Refreshing available time slots...",
        );

        try {
            setLoading(true);
            const dateKey = formatDateKey(selectedDate);
            const response = await axios.get(route("ourtimeslots.get"), {
                params: {
                    date: dateKey,
                    price_id: price.id,
                },
            });

            if (response.data.success) {
                const allSlots = response.data.slots || [];

                const booked = allSlots
                    .filter(
                        (slot) =>
                            slot.status === "reserved" ||
                            slot.status === "blocked",
                    )
                    .map((slot) => {
                        const startTime = slot.start_time;
                        if (
                            typeof startTime === "string" &&
                            startTime.includes(":")
                        ) {
                            const parts = startTime.split(":");
                            return `${parts[0]}:${parts[1]}`;
                        }
                        return startTime;
                    });

                setBookedSlots(booked);

                const available = allSlots
                    .filter((slot) => slot.status === "available")
                    .map((slot) => {
                        const startTime = slot.start_time;
                        if (
                            typeof startTime === "string" &&
                            startTime.includes(":")
                        ) {
                            const parts = startTime.split(":");
                            return `${parts[0]}:${parts[1]}`;
                        }
                        return startTime;
                    });

                setTimeSlots((prev) => ({
                    ...prev,
                    [dateKey]: available,
                }));

                setAllSlotsData((prev) => ({
                    ...prev,
                    [dateKey]: allSlots,
                }));
                
                // Update date status
                const hasAvailableSlots = available.length > 0;
                setDateStatus(prev => {
                    const newMap = new Map(prev);
                    if (hasAvailableSlots) {
                        newMap.set(dateKey, 'has-slots');
                    } else {
                        newMap.set(dateKey, 'no-slots');
                    }
                    return newMap;
                });

                toast.dismiss(loadingToast);
                toast.success("Booking confirmed! Time slots refreshed.");
            }
        } catch (error) {
            console.error("Error refreshing time slots:", error);
            toast.dismiss(loadingToast);
            toast.error("Booking confirmed, but failed to refresh time slots");
        } finally {
            setLoading(false);
            setSelectedTime(null);
            setShowBookingForm(false);
        }
    };

    const handleTimeSelect = (time) => {
        setSelectedTime(time);
    };

    const handleDateSelect = (date) => {
        if (date && !isPastDate(date)) {
            setSelectedDate(date);
            setSelectedTime(null);
            setShowNextAvailability(false);
        } else if (date && isPastDate(date)) {
            toast.error("Cannot select past dates", {
                icon: "⚠️",
            });
        }
    };

    const currentTimeSlots = getTimeSlotsForDate(selectedDate);

    const getTimeSlotDisplay = (slot) => {
        let startTimeStr = typeof slot === "string" ? slot : slot?.start_time;
        if (startTimeStr?.includes(":")) {
            const parts = startTimeStr.split(":");
            startTimeStr = `${parts[0]}:${parts[1]}`;
        }
        const endTimeStr = calculateEndTime(startTimeStr, price.duration);
        return `${startTimeStr} - ${endTimeStr}`;
    };

    const renderDayContent = (date) => {
        const isSelected =
            selectedDate && date.toDateString() === selectedDate.toDateString();
        const isPast = isPastDate(date);
        const dateStatusType = getDateStatus(date);
        
        // Don't show colors for past dates or selected date
        if (isPast) {
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">
                        {date.getDate()}
                    </span>
                </div>
            );
        }

        if (isSelected) {
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <span className="text-white">
                        {date.getDate()}
                    </span>
                </div>
            );
        }

        // Apply different styles based on status
        let bgColor = "";
        let textColor = "text-gray-700";
        let dotColor = "";
        
        if (dateStatusType === 'has-slots') {
            bgColor = "bg-green-100 hover:bg-green-200";
            textColor = "text-green-800 font-semibold";
            dotColor = "bg-green-500";
        } else if (dateStatusType === 'no-slots') {
            bgColor = "bg-red-100 hover:bg-red-200";
            textColor = "text-red-800";
            dotColor = "bg-red-500";
        } else {
            bgColor = "hover:bg-gray-100";
        }

        return (
            <div className={`relative w-full h-full flex items-center justify-center rounded-full ${bgColor}`}>
                <span className={textColor}>
                    {date.getDate()}
                </span>
                {dotColor && (
                    <div className={`absolute -top-1 -right-1 w-2 h-2 ${dotColor} rounded-full`}></div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: "#363636",
                        color: "#fff",
                    },
                    success: {
                        duration: 3000,
                        style: {
                            background: "#10b981",
                            color: "#fff",
                        },
                    },
                    error: {
                        duration: 4000,
                        style: {
                            background: "#ef4444",
                            color: "#fff",
                        },
                    },
                    loading: {
                        style: {
                            background: "#3b82f6",
                            color: "#fff",
                        },
                    },
                }}
            />

            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <Link
                    href={"/"}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ChevronLeft size={20} />
                    <span className="font-medium">Back</span>
                </Link>

                <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        Schedule Your Service
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Check out our availability and book the date and time
                        that works for you
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Calendar Section */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-1">
                        <div className="mb-4">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                                Select a Date
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500">
                                Time zone: Australian Western Standard Time
                                (GMT+8)
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                    <span>Has Available Slots</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                                    <span>No Available Slots</span>
                                </div>
                            </div>
                        </div>
                        <style jsx global>{`
                            .rdp-day {
                                width: 40px !important;
                                height: 40px !important;
                            }
                            .rdp-day button {
                                width: 100% !important;
                                height: 100% !important;
                            }
                        `}</style>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            disabled={isPastDate}
                            className="rounded-md border [&_.rdp-day_selected]:bg-emerald-600 [&_.rdp-day_selected]:text-white [&_.rdp-day_selected:hover]:bg-emerald-700 [&_.rdp-button:hover]:bg-emerald-50 [&_.rdp-day_today]:bg-gray-100 [&_.rdp-day_disabled]:text-gray-400 [&_.rdp-day_disabled]:cursor-not-allowed"
                            components={{
                                DayContent: ({ date }) =>
                                    renderDayContent(date),
                            }}
                        />
                    </div>

                    {/* Time Slots Section */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-1">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                            Available Times
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 mb-4">
                            {formatDisplayDate(selectedDate)}
                        </p>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                <p className="text-gray-500 text-sm mt-3">
                                    Loading time slots...
                                </p>
                            </div>
                        ) : currentTimeSlots.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
                                {getNonOverlappingSlots(currentTimeSlots).map(
                                    (time, index) => {
                                        const timeDisplay =
                                            getTimeSlotDisplay(time);
                                        return (
                                            <button
                                                key={index}
                                                onClick={() =>
                                                    handleTimeSelect(time)
                                                }
                                                className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg border-2 transition-all duration-200 font-medium text-sm sm:text-base ${
                                                    selectedTime === time
                                                        ? "border-indigo-600 bg-indigo-600 text-white shadow-md"
                                                        : "border-gray-200 hover:border-indigo-300 text-gray-700 hover:bg-indigo-50"
                                                }`}
                                            >
                                                {timeDisplay}
                                            </button>
                                        );
                                    },
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <div className="text-gray-400 mb-3">
                                    <svg
                                        className="w-12 h-12 mx-auto"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <p className="text-gray-500 font-medium mb-2">
                                    {isPastDate(selectedDate)
                                        ? "Cannot select past dates"
                                        : "No available time slots"}
                                </p>
                                <p className="text-gray-400 text-sm mb-4">
                                    {isPastDate(selectedDate)
                                        ? "Please select a current or future date"
                                        : "Please select another date"}
                                </p>

                                {!showNextAvailability ? (
                                    <button
                                        onClick={handleNextAvailabilityClick}
                                        className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
                                    >
                                        Check Next Availability
                                    </button>
                                ) : (
                                    <div className="mt-4">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-3 text-left">
                                            Next available dates:
                                        </h3>
                                        <div className="space-y-2">
                                            {nextAvailableDates.map(
                                                (date, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() =>
                                                            handleSelectNextAvailableDate(
                                                                date,
                                                            )
                                                        }
                                                        className="w-full py-2 px-3 text-left bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors duration-200"
                                                    >
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {date.toLocaleDateString(
                                                                "en-US",
                                                                {
                                                                    weekday:
                                                                        "short",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                },
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            {
                                                                getTimeSlotsForDate(
                                                                    date,
                                                                ).length
                                                            }{" "}
                                                            time slots available
                                                        </div>
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                        {nextAvailableDates.length === 0 && (
                                            <p className="text-gray-500 text-sm py-2">
                                                No available dates found in the
                                                next 30 days.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Service Details Section */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-1">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                            Service Details
                        </h2>

                        <div className="space-y-4 mb-6">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                                    {price.category || "Driving Lessons"}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600">
                                    {price.description ||
                                        "Professional driving instruction with certified instructors"}
                                </p>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between text-xs sm:text-sm mb-2">
                                    <span className="text-gray-600">
                                        Package:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {price.description}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs sm:text-sm mb-2">
                                    <span className="text-gray-600">
                                        Duration:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {formatDurationDisplay(price.duration)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs sm:text-sm mb-2">
                                    <span className="text-gray-600">
                                        Price:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        ${price.price}
                                    </span>
                                </div>
                                {selectedDate && selectedTime && (
                                    <>
                                        <div className="flex justify-between text-xs sm:text-sm">
                                            <span className="text-gray-600">
                                                Selected:
                                            </span>
                                            <span className="font-medium text-gray-900 text-right">
                                                {selectedDate.toLocaleDateString()}{" "}
                                                at{" "}
                                                {getTimeSlotDisplay(
                                                    selectedTime,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs sm:text-sm mt-1">
                                            <span className="text-gray-600">
                                                End Time:
                                            </span>
                                            <span className="font-medium text-indigo-600 text-right">
                                                {calculateEndTime(
                                                    selectedTime,
                                                    price.duration,
                                                )}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmBookingClick}
                            disabled={!selectedTime || isPastDate(selectedDate)}
                            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
                                selectedTime && !isPastDate(selectedDate)
                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transform hover:scale-105"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                            {selectedTime ? "Confirm Booking" : "Select a Time"}
                        </button>

                        {selectedTime && (
                            <p className="text-xs text-center text-gray-500 mt-3">
                                You'll be asked to complete your details in the
                                next step
                            </p>
                        )}
                    </div>
                </div>

                {/* Booking Form Modal */}
                {showBookingForm && (
                    <BookingForm
                        selectedDate={selectedDate}
                        selectedTime={selectedTime}
                        priceId={price.id}
                        price={price}
                        onClose={() => setShowBookingForm(false)}
                        onBookingSuccess={handleBookingSuccess}
                    />
                )}
            </div>
        </div>
    );
};

export default CalendarIntegration;