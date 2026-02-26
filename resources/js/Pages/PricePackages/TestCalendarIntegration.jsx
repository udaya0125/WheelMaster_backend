// import { Calendar } from "@/components/ui/calendar";
// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import BookingForm from "./BookingForm";
// import { Link } from "@inertiajs/react";
// import { ChevronLeft } from "lucide-react";

// const TestCalendarIntegration = ({ price }) => {
//     const [selectedDate, setSelectedDate] = useState(new Date());
//     const [selectedTime, setSelectedTime] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [availabilityMessage, setAvailabilityMessage] = useState("");
//     const [isAvailable, setIsAvailable] = useState(false);
//     const [alternativeTimes, setAlternativeTimes] = useState([]);
//     const [showBookingForm, setShowBookingForm] = useState(false);
//     const [bookingDetails, setBookingDetails] = useState(null);
//     const [timeError, setTimeError] = useState("");

//     // Function to check if a date is in the past
//     const isPastDate = (date) => {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         return date < today;
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

//     // Parse duration to minutes
//     const parseDuration = (durationString) => {
//         if (!durationString) return 60;

//         const cleanString = durationString.trim().toLowerCase();

//         // Extract hours and minutes using regex
//         const hourMatch = cleanString.match(
//             /(\d+(?:\.\d+)?)\s*(?:hrs|hr|hour|hours)/
//         );
//         const minuteMatch = cleanString.match(
//             /(\d+)\s*(?:min|mins|minute|minutes)/
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

//     // Format time for display (convert 24h to 12h format)
//     const formatTimeForDisplay = (time24) => {
//         if (!time24) return "";
//         const [hours, minutes] = time24.split(":").map(Number);
//         const period = hours >= 12 ? "PM" : "AM";
//         const displayHours = hours % 12 || 12;
//         return `${displayHours}:${minutes
//             .toString()
//             .padStart(2, "0")} ${period}`;
//     };

//     // Validate time format (H:i)
//     const validateTimeFormat = (time) => {
//         if (!time) return false;
//         const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
//         return timeRegex.test(time);
//     };

//     // Format time to ensure H:i format
//     const formatTimeForApi = (time) => {
//         if (!time) return "";
//         // Ensure we have exactly HH:mm format
//         const [hours, minutes] = time.split(":").map(Number);
//         return `${hours.toString().padStart(2, "0")}:${minutes
//             .toString()
//             .padStart(2, "0")}`;
//     };

//     // Check availability for test time
//     const checkTestAvailability = async () => {
//         if (!selectedDate || !selectedTime) {
//             setAvailabilityMessage("Please select both date and time");
//             setIsAvailable(false);
//             return;
//         }

//         // Validate time format
//         if (!validateTimeFormat(selectedTime)) {
//             setTimeError("Please enter a valid time in HH:MM format");
//             setIsAvailable(false);
//             return;
//         }

//         setLoading(true);
//         setAvailabilityMessage("");
//         setAlternativeTimes([]);
//         setTimeError("");

//         try {
//             const formattedTime = formatTimeForApi(selectedTime);

//             const response = await axios.post(
//                 route("test-packages.check-availability"),
//                 {
//                     date: formatDateKey(selectedDate),
//                     test_time: formattedTime, // Ensure H:i format
//                     duration_minutes: parseDuration(price.duration),
//                 }
//             );

//             if (response.data.available) {
//                 setIsAvailable(true);
//                 setBookingDetails({
//                     start_time: response.data.start_time,
//                     end_time: response.data.end_time,
//                     buffer_start: response.data.buffer_start,
//                     buffer_end: response.data.buffer_end,
//                 });
//                 setAvailabilityMessage(
//                     "✓ This time slot is available! You can proceed to book."
//                 );
//             } else {
//                 setIsAvailable(false);
//                 let message =
//                     "No test packages are available for the selected time slot. ";
//                 message +=
//                     "If you need help or wish to book manually, please contact our support team.\n\n";

//                 // if (response.data.alternative_times && response.data.alternative_times.length > 0) {
//                 //     message += "Available alternative times:\n";
//                 //     message += response.data.alternative_times.map(t => formatTimeForDisplay(t)).join(", ");
//                 //     message += "\n\n";
//                 //     setAlternativeTimes(response.data.alternative_times);
//                 // } else {
//                 //     message += "No alternative times available for this duration.\n\n";
//                 // }

//                 message += "Please contact us at:\n";
//                 message += "Phone: 0481488216\n";
//                 message += "Email: Wheelmaster@outlook.com.au";

//                 setAvailabilityMessage(message);
//             }
//         } catch (error) {
//             console.error("Error checking availability:", error);
//             setIsAvailable(false);

//             // Check if it's a validation error
//             if (error.response && error.response.status === 422) {
//                 const errors = error.response.data.errors;
//                 if (errors && errors.test_time) {
//                     setAvailabilityMessage(
//                         `Validation error: ${errors.test_time[0]}`
//                     );
//                     setTimeError(errors.test_time[0]);
//                 } else {
//                     setAvailabilityMessage(
//                         "Please check the time format (HH:MM) and try again."
//                     );
//                 }
//             } else {
//                 setAvailabilityMessage(
//                     "Error checking availability. Please try again."
//                 );
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Handle time selection
//     const handleTimeChange = (e) => {
//         const value = e.target.value;
//         setSelectedTime(value);
//         setAvailabilityMessage("");
//         setIsAvailable(false);
//         setAlternativeTimes([]);
//         setTimeError("");
//     };

//     // Handle booking confirmation
//     const handleConfirmBookingClick = () => {
//         if (isAvailable && bookingDetails) {
//             setShowBookingForm(true);
//         }
//     };

//     // Handle successful booking
//     const handleBookingSuccess = async () => {
//         setSelectedDate(new Date());
//         setSelectedTime("");
//         setAvailabilityMessage("");
//         setIsAvailable(false);
//         setAlternativeTimes([]);
//         setShowBookingForm(false);
//         setBookingDetails(null);
//         setTimeError("");
//     };

//     // Custom day cell content
//     const renderDayContent = (date) => {
//         const isSelected =
//             selectedDate && date.toDateString() === selectedDate.toDateString();
//         const isPast = isPastDate(date);

//         return (
//             <div className="relative">
//                 <span className={isPast ? "text-gray-400" : ""}>
//                     {date.getDate()}
//                 </span>
//                 {!isSelected && !isPast && (
//                     <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-100 rounded-full"></div>
//                 )}
//             </div>
//         );
//     };

//     // Set min and max times for the time input
//     const getMinTime = () => {
//         return "08:00"; // 8:00 AM
//     };

//     const getMaxTime = () => {
//         return "16:30"; // 4:30 PM (to allow for test duration + buffer)
//     };

//     return (
//         <div className="min-h-screen bg-gray-50">
//             <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
//                 <Link href={'/'} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
//                     <ChevronLeft size={20} />
//                     <span className="font-medium">Back</span>
//                 </Link>
//                 {/* Header */}
//                 <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6">
//                     <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
//                         Schedule Your Test Package
//                     </h1>
//                     <p className="text-gray-600 text-sm sm:text-base">
//                         Choose your test date and time.
//                     </p>
//                 </div>

//                 {/* Main Content */}
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
//                     {/* Calendar Section */}
//                     <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-1">
//                         <div className="mb-4">
//                             <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
//                                 Select Test Date
//                             </h2>
//                             <p className="text-xs sm:text-sm text-gray-500">
//                                 Time zone: Australian Western Standard Time
//                                 (GMT+8)
//                             </p>
//                         </div>
//                         <Calendar
//                             mode="single"
//                             selected={selectedDate}
//                             onSelect={(date) => {
//                                 if (date && !isPastDate(date)) {
//                                     setSelectedDate(date);
//                                     setSelectedTime("");
//                                     setAvailabilityMessage("");
//                                     setIsAvailable(false);
//                                     setAlternativeTimes([]);
//                                     setTimeError("");
//                                 }
//                             }}
//                             disabled={isPastDate}
//                             className="rounded-md border [&_.rdp-day_selected]:bg-blue-600 [&_.rdp-day_selected]:text-white [&_.rdp-day_selected:hover]:bg-blue-700 [&_.rdp-button:hover]:bg-blue-50 [&_.rdp-day_today]:bg-gray-100 [&_.rdp-day_disabled]:text-gray-400 [&_.rdp-day_disabled]:cursor-not-allowed"
//                             components={{
//                                 DayContent: ({ date }) =>
//                                     renderDayContent(date),
//                             }}
//                         />
//                     </div>

//                     {/* Time Selection Section */}
//                     <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-1">
//                         <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
//                             Select Test Time
//                         </h2>
//                         <p className="text-xs sm:text-sm text-gray-500 mb-4">
//                             {formatDisplayDate(selectedDate)}
//                         </p>

//                         <div className="space-y-4">
//                             <div>
//                                 <label
//                                     htmlFor="test-time"
//                                     className="block text-sm font-medium text-gray-700 mb-2"
//                                 >
//                                     Test Start Time (24-hour format) *
//                                 </label>
//                                 <div className="relative">
//                                     <input
//                                         id="test-time"
//                                         type="time"
//                                         value={selectedTime}
//                                         onChange={handleTimeChange}
//                                         disabled={
//                                             !selectedDate ||
//                                             isPastDate(selectedDate)
//                                         }
//                                         min={getMinTime()}
//                                         max={getMaxTime()}
//                                         step="1800" // 30 minutes in seconds
//                                         className={`w-full px-4 py-3 border ${
//                                             timeError
//                                                 ? "border-red-300"
//                                                 : "border-gray-300"
//                                         } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none`}
//                                         placeholder="HH:MM"
//                                     />
//                                     {/* {selectedTime && !timeError && (
//                                         <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
//                                             {formatTimeForDisplay(selectedTime)}
//                                         </span>
//                                     )} */}
//                                 </div>
//                                 {timeError && (
//                                     <p className="text-red-600 text-xs mt-1">
//                                         {timeError}
//                                     </p>
//                                 )}
//                             </div>

//                             <button
//                                 onClick={checkTestAvailability}
//                                 disabled={!selectedTime || loading}
//                                 className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
//                                     selectedTime && !loading
//                                         ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
//                                         : "bg-gray-200 text-gray-400 cursor-not-allowed"
//                                 }`}
//                             >
//                                 {loading ? (
//                                     <div className="flex items-center justify-center">
//                                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                                         Checking...
//                                     </div>
//                                 ) : (
//                                     "Check Availability"
//                                 )}
//                             </button>
//                         </div>

//                         {/* Alternative Times Suggestion */}
//                         {alternativeTimes.length > 0 && (
//                             <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                                 <h4 className="font-medium text-blue-800 mb-2">
//                                     Suggested Available Times:
//                                 </h4>
//                                 <div className="flex flex-wrap gap-2">
//                                     {alternativeTimes.map((time, index) => (
//                                         <button
//                                             key={index}
//                                             onClick={() =>
//                                                 setSelectedTime(time)
//                                             }
//                                             className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm transition-colors"
//                                         >
//                                             {formatTimeForDisplay(time)} ({time}
//                                             )
//                                         </button>
//                                     ))}
//                                 </div>
//                                 <p className="text-xs text-blue-600 mt-2">
//                                     Click on a suggested time to select it, then
//                                     check availability again.
//                                 </p>
//                             </div>
//                         )}

//                         {/* Availability Message */}
//                         {availabilityMessage && (
//                             <div
//                                 className={`mt-6 p-4 rounded-lg ${
//                                     isAvailable
//                                         ? "bg-green-50 border border-green-200"
//                                         : "bg-red-50 border border-red-200"
//                                 }`}
//                             >
//                                 <div className="flex items-start">
//                                     <div
//                                         className={`flex-shrink-0 ${
//                                             isAvailable
//                                                 ? "text-green-600"
//                                                 : "text-red-600"
//                                         }`}
//                                     >
//                                         {isAvailable ? (
//                                             <svg
//                                                 className="h-5 w-5"
//                                                 fill="currentColor"
//                                                 viewBox="0 0 20 20"
//                                             >
//                                                 <path
//                                                     fillRule="evenodd"
//                                                     d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                                                     clipRule="evenodd"
//                                                 />
//                                             </svg>
//                                         ) : (
//                                             <svg
//                                                 className="h-5 w-5"
//                                                 fill="currentColor"
//                                                 viewBox="0 0 20 20"
//                                             >
//                                                 <path
//                                                     fillRule="evenodd"
//                                                     d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                                                     clipRule="evenodd"
//                                                 />
//                                             </svg>
//                                         )}
//                                     </div>
//                                     <div className="ml-3">
//                                         <p
//                                             className={`text-sm ${
//                                                 isAvailable
//                                                     ? "text-green-800"
//                                                     : "text-red-800"
//                                             } whitespace-pre-line`}
//                                         >
//                                             {availabilityMessage}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     {/* Service Details Section */}
//                     <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-1">
//                         <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
//                             Test Package Details
//                         </h2>

//                         <div className="space-y-4 mb-6">
//                             <div>
//                                 <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
//                                     {price.description}
//                                 </h3>
//                                 <p className="text-xs sm:text-sm text-gray-600">
//                                     Professional driving test preparation with
//                                     certified instructors
//                                 </p>
//                             </div>

//                             <div className="border-t pt-4">
//                                 <div className="flex justify-between text-xs sm:text-sm mb-2">
//                                     <span className="text-gray-600">
//                                         Test Duration:
//                                     </span>
//                                     <span className="font-medium text-gray-900">
//                                         {price.duration}
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

//                                 {selectedDate &&
//                                     selectedTime &&
//                                     isAvailable &&
//                                     bookingDetails && (
//                                         <>
//                                             <div className="flex justify-between text-xs sm:text-sm mt-4">
//                                                 <span className="text-gray-600">
//                                                     Total Booking:
//                                                 </span>
//                                                 <span className="font-medium text-gray-900 text-right">
//                                                     {formatTimeForDisplay(
//                                                         bookingDetails.buffer_start
//                                                     )}{" "}
//                                                     to{" "}
//                                                     {formatTimeForDisplay(
//                                                         bookingDetails.buffer_end
//                                                     )}
//                                                 </span>
//                                             </div>
//                                             <div className="flex justify-between text-xs sm:text-sm">
//                                                 <span className="text-gray-600">
//                                                     Actual Test:
//                                                 </span>
//                                                 <span className="font-medium text-blue-600 text-right">
//                                                     {formatTimeForDisplay(
//                                                         selectedTime
//                                                     )}{" "}
//                                                     ({price.duration})
//                                                 </span>
//                                             </div>
//                                         </>
//                                     )}
//                             </div>
//                         </div>

//                         <button
//                             onClick={handleConfirmBookingClick}
//                             disabled={!isAvailable}
//                             className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
//                                 isAvailable
//                                     ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105"
//                                     : "bg-gray-200 text-gray-400 cursor-not-allowed"
//                             }`}
//                         >
//                             {isAvailable
//                                 ? "Proceed to Booking"
//                                 : "Select Available Time"}
//                         </button>

//                         {isAvailable && (
//                             <p className="text-xs text-center text-gray-500 mt-3">
//                                 You'll be asked to complete your details in the
//                                 next step
//                             </p>
//                         )}
//                     </div>
//                 </div>

//                 {/* Booking Form Modal */}
//                 {showBookingForm && bookingDetails && (
//                     <BookingForm
//                         selectedDate={selectedDate}
//                         selectedTime={bookingDetails.start_time}
//                         testTime={selectedTime}
//                         priceId={price.id}
//                         price={price}
//                         isTestPackage={true}
//                         bookingDetails={bookingDetails}
//                         onClose={() => setShowBookingForm(false)}
//                         onBookingSuccess={handleBookingSuccess}
//                     />
//                 )}
//             </div>
//         </div>
//     );
// };

// export default TestCalendarIntegration;

import { Calendar } from "@/components/ui/calendar";
import axios from "axios";
import React, { useEffect, useState } from "react";
import BookingForm from "./BookingForm";
import { Link } from "@inertiajs/react";
import { ChevronLeft } from "lucide-react";

const TestCalendarIntegration = ({ price }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState("");
    const [loading, setLoading] = useState(false);
    const [availabilityMessage, setAvailabilityMessage] = useState("");
    const [isAvailable, setIsAvailable] = useState(false);
    const [alternativeTimes, setAlternativeTimes] = useState([]);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [bookingDetails, setBookingDetails] = useState(null);
    const [timeError, setTimeError] = useState("");
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Function to check if a date is in the past
    const isPastDate = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
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

    // Parse duration to minutes
    const parseDuration = (durationString) => {
        if (!durationString) return 60;

        const cleanString = durationString.trim().toLowerCase();

        // Extract hours and minutes using regex
        const hourMatch = cleanString.match(
            /(\d+(?:\.\d+)?)\s*(?:hrs|hr|hour|hours)/
        );
        const minuteMatch = cleanString.match(
            /(\d+)\s*(?:min|mins|minute|minutes)/
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

    // Format time for display (convert 24h to 12h format)
    const formatTimeForDisplay = (time24) => {
        if (!time24) return "";
        const [hours, minutes] = time24.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes
            .toString()
            .padStart(2, "0")} ${period}`;
    };

    // Validate time format (H:i)
    const validateTimeFormat = (time) => {
        if (!time) return false;
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    };

    // Format time to ensure H:i format
    const formatTimeForApi = (time) => {
        if (!time) return "";
        // Ensure we have exactly HH:mm format
        const [hours, minutes] = time.split(":").map(Number);
        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`;
    };

    // Fetch available time slots when date changes
    useEffect(() => {
        if (selectedDate && !isPastDate(selectedDate)) {
            fetchAvailableTimeSlots();
        } else {
            setAvailableTimeSlots([]);
        }
    }, [selectedDate]);

    const fetchAvailableTimeSlots = async () => {
        setLoadingSlots(true);
        try {
            const response = await axios.get(
                route("test-packages.available-slots"),
                {
                    params: {
                        date: formatDateKey(selectedDate),
                        price_id: price.id,
                        duration_minutes: parseDuration(price.duration),
                    },
                }
            );

            if (response.data.success) {
                setAvailableTimeSlots(response.data.available_slots);
            } else {
                setAvailableTimeSlots([]);
            }
        } catch (error) {
            console.error("Error fetching available slots:", error);
            setAvailableTimeSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    // Check availability for test time
    const checkTestAvailability = async () => {
        if (!selectedDate || !selectedTime) {
            setAvailabilityMessage("Please select both date and time");
            setIsAvailable(false);
            return;
        }

        // Validate time format
        if (!validateTimeFormat(selectedTime)) {
            setTimeError("Please enter a valid time in HH:MM format");
            setIsAvailable(false);
            return;
        }

        setLoading(true);
        setAvailabilityMessage("");
        setAlternativeTimes([]);
        setTimeError("");

        try {
            const formattedTime = formatTimeForApi(selectedTime);

            const response = await axios.post(
                route("test-packages.check-availability"),
                {
                    date: formatDateKey(selectedDate),
                    test_time: formattedTime,
                    duration_minutes: parseDuration(price.duration),
                    price_id: price.id, // ADD THIS LINE - pass price_id
                }
            );

            if (response.data.available) {
                setIsAvailable(true);
                setBookingDetails({
                    start_time: response.data.start_time,
                    end_time: response.data.end_time,
                    buffer_start: response.data.start_time, // This is the buffer start
                    buffer_end: response.data.end_time, // This is the buffer end
                });
                setAvailabilityMessage(
                    "✓ This time slot is available! You can proceed to book."
                );
            } else {
                setIsAvailable(false);
                let message =
                    response.data.message || "Time slot not available";

                // If there are alternative times, show them
                if (
                    response.data.alternative_times &&
                    response.data.alternative_times.length > 0
                ) {
                    setAlternativeTimes(response.data.alternative_times);
                    message += "\n\nAlternative times available:";
                } else {
                    message +=
                        "\n\nNo alternative times available for this duration.";
                }

                // Add contact information
                message += "\n\nPlease contact us at:\n";
                message += "Phone: 0481488216\n";
                message += "Email: Wheelmaster@outlook.com.au";

                setAvailabilityMessage(message);
            }
        } catch (error) {
            console.error("Error checking availability:", error);
            setIsAvailable(false);

            // Check if it's a validation error
            if (error.response && error.response.status === 422) {
                const errors = error.response.data.errors;
                if (errors && errors.test_time) {
                    setAvailabilityMessage(
                        `Validation error: ${errors.test_time[0]}`
                    );
                    setTimeError(errors.test_time[0]);
                } else if (errors && errors.price_id) {
                    setAvailabilityMessage(
                        `Validation error: ${errors.price_id[0]}`
                    );
                } else {
                    setAvailabilityMessage(
                        "Please check the time format (HH:MM) and try again."
                    );
                }
            } else {
                setAvailabilityMessage(
                    "Error checking availability. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle time selection from dropdown
    const handleTimeSelect = (time24) => {
        setSelectedTime(time24);
        setAvailabilityMessage("");
        setIsAvailable(false);
        setAlternativeTimes([]);
        setTimeError("");
    };

    // Handle manual time input
    const handleTimeChange = (e) => {
        const value = e.target.value;
        setSelectedTime(value);
        setAvailabilityMessage("");
        setIsAvailable(false);
        setAlternativeTimes([]);
        setTimeError("");
    };

    // Handle booking confirmation
    const handleConfirmBookingClick = () => {
        if (isAvailable && bookingDetails) {
            setShowBookingForm(true);
        }
    };

    // Handle successful booking
    const handleBookingSuccess = async () => {
        setSelectedDate(new Date());
        setSelectedTime("");
        setAvailabilityMessage("");
        setIsAvailable(false);
        setAlternativeTimes([]);
        setShowBookingForm(false);
        setBookingDetails(null);
        setTimeError("");
        // Refresh available slots after booking
        fetchAvailableTimeSlots();
    };

    // Custom day cell content
    const renderDayContent = (date) => {
        const isSelected =
            selectedDate && date.toDateString() === selectedDate.toDateString();
        const isPast = isPastDate(date);

        return (
            <div className="relative">
                <span className={isPast ? "text-gray-400" : ""}>
                    {date.getDate()}
                </span>
                {!isSelected && !isPast && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-100 rounded-full"></div>
                )}
            </div>
        );
    };

    // Set min and max times for the time input
    const getMinTime = () => {
        return "10:00"; // 10:00 AM (working hours start)
    };

    const getMaxTime = () => {
        // Calculate max time based on duration
        const durationMinutes = parseDuration(price.duration);
        const maxTestTime = "16:00"; // Latest test start time to finish by 17:00

        // Account for buffer hour
        const [hours, minutes] = maxTestTime.split(":").map(Number);
        const maxInputTime = new Date();
        maxInputTime.setHours(hours, minutes - 60, 0, 0); // Subtract buffer hour

        return (
            maxInputTime.getHours().toString().padStart(2, "0") +
            ":" +
            maxInputTime.getMinutes().toString().padStart(2, "0")
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <Link
                    href={"/"}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ChevronLeft size={20} />
                    <span className="font-medium">Back</span>
                </Link>
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        Schedule Your Test Package
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Choose your test date and time.
                    </p>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Calendar Section */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-1">
                        <div className="mb-4">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                                Select Test Date
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500">
                                Time zone: Australian Western Standard Time
                                (GMT+8)
                            </p>
                        </div>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                                if (date && !isPastDate(date)) {
                                    setSelectedDate(date);
                                    setSelectedTime("");
                                    setAvailabilityMessage("");
                                    setIsAvailable(false);
                                    setAlternativeTimes([]);
                                    setTimeError("");
                                }
                            }}
                            disabled={isPastDate}
                            className="rounded-md border [&_.rdp-day_selected]:bg-blue-600 [&_.rdp-day_selected]:text-white [&_.rdp-day_selected:hover]:bg-blue-700 [&_.rdp-button:hover]:bg-blue-50 [&_.rdp-day_today]:bg-gray-100 [&_.rdp-day_disabled]:text-gray-400 [&_.rdp-day_disabled]:cursor-not-allowed"
                            components={{
                                DayContent: ({ date }) =>
                                    renderDayContent(date),
                            }}
                        />
                    </div>

                    {/* Time Selection Section */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-1">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                            Select Test Time
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 mb-4">
                            {formatDisplayDate(selectedDate)}
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="test-time"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Test Start Time (24-hour format) *
                                </label>
                                <div className="relative">
                                    <input
                                        id="test-time"
                                        type="time"
                                        value={selectedTime}
                                        onChange={handleTimeChange}
                                        disabled={
                                            !selectedDate ||
                                            isPastDate(selectedDate)
                                        }
                                        min={getMinTime()}
                                        max={getMaxTime()}
                                        step="1800" // 30 minutes in seconds
                                        className={`w-full px-4 py-3 border ${
                                            timeError
                                                ? "border-red-300"
                                                : "border-gray-300"
                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none`}
                                        placeholder="HH:MM"
                                    />
                                </div>
                                {timeError && (
                                    <p className="text-red-600 text-xs mt-1">
                                        {timeError}
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={checkTestAvailability}
                                disabled={!selectedTime || loading}
                                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
                                    selectedTime && !loading
                                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Checking...
                                    </div>
                                ) : (
                                    "Check Availability"
                                )}
                            </button>
                        </div>

                        {/* Alternative Times Suggestion */}
                        {alternativeTimes.length > 0 && (
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="font-medium text-blue-800 mb-2">
                                    Suggested Available Times:
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {alternativeTimes.map((slot, index) => (
                                        <button
                                            key={index}
                                            onClick={() =>
                                                handleTimeSelect(
                                                    slot.time || slot
                                                )
                                            }
                                            className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm transition-colors"
                                        >
                                            {slot.formatted ||
                                                formatTimeForDisplay(slot)}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-blue-600 mt-2">
                                    Click on a suggested time to select it, then
                                    check availability again.
                                </p>
                            </div>
                        )}

                        {/* Availability Message */}
                        {availabilityMessage && (
                            <div
                                className={`mt-6 p-4 rounded-lg ${
                                    isAvailable
                                        ? "bg-green-50 border border-green-200"
                                        : "bg-red-50 border border-red-200"
                                }`}
                            >
                                <div className="flex items-start">
                                    <div
                                        className={`flex-shrink-0 ${
                                            isAvailable
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {isAvailable ? (
                                            <svg
                                                className="h-5 w-5"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="h-5 w-5"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <p
                                            className={`text-sm ${
                                                isAvailable
                                                    ? "text-green-800"
                                                    : "text-red-800"
                                            } whitespace-pre-line`}
                                        >
                                            {availabilityMessage}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Service Details Section */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-1">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                            Test Package Details
                        </h2>

                        <div className="space-y-4 mb-6">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                                    {price.description}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600">
                                    Professional driving test preparation with
                                    certified instructors
                                </p>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between text-xs sm:text-sm mb-2">
                                    <span className="text-gray-600">
                                        Test Duration:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {price.duration}
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
                                {selectedDate &&
                                    selectedTime &&
                                    isAvailable &&
                                    bookingDetails && (
                                        <>
                                            <div className="mt-4 pt-4 border-t">
                                                <div className="flex justify-between text-xs sm:text-sm mb-2">
                                                    <span className="text-gray-600">
                                                        Total Booking Duration:
                                                    </span>
                                                    <span className="font-medium text-gray-900 text-right">
                                                        {formatTimeForDisplay(
                                                            bookingDetails.start_time
                                                        )}{" "}
                                                        to{" "}
                                                        {formatTimeForDisplay(
                                                            bookingDetails.end_time
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-xs sm:text-sm">
                                                    <span className="text-gray-600">
                                                        Actual Test Time:
                                                    </span>
                                                    <span className="font-medium text-blue-600 text-right">
                                                        {formatTimeForDisplay(
                                                            selectedTime
                                                        )}{" "}
                                                        ({price.duration})
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmBookingClick}
                            disabled={!isAvailable}
                            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
                                isAvailable
                                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                            {isAvailable
                                ? "Proceed to Booking"
                                : "Select Available Time"}
                        </button>
                    </div>
                </div>

                {/* Booking Form Modal */}
                {showBookingForm && bookingDetails && (
                    <BookingForm
                        selectedDate={selectedDate}
                        selectedTime={bookingDetails.start_time}
                        testTime={selectedTime}
                        priceId={price.id}
                        price={price}
                        isTestPackage={true}
                        bookingDetails={bookingDetails}
                        onClose={() => setShowBookingForm(false)}
                        onBookingSuccess={handleBookingSuccess}
                    />
                )}
            </div>
        </div>
    );
};

export default TestCalendarIntegration;
