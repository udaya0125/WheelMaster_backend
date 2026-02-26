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

//     useEffect(() => {
//         const fetchReservation = async () => {
//             try {
//                 setLoading(true);
//                 const response = await axios.get(
//                     route("ourreservations.timeslots")
//                 );
                
//                 if (response.data.success) {
//                     setTimeSlots(response.data.data);             
//                 } else {
//                     console.error("Error fetching reservations:", response.data.message);
//                 }
//             } catch (err) {
//                 console.error("Error fetching reservations:", err);
//                 toast.error("Error loading time slots. Please try again.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchReservation();
//     }, []);

//     // Function to check if a date is in the past
//     const isPastDate = (date) => {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         return date < today;
//     };

//     // Function to get time slots for a specific date
//     const getTimeSlotsForDate = (date) => {
//         if (!date) return [];
//         const dateKey = formatDateKey(date);
//         return timeSlots[dateKey] || [];
//     };

//     // Format date as YYYY-MM-DD for consistent key matching
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

//     // Check if date has available time slots
//     const hasTimeSlots = (date) => {
//         const slots = getTimeSlotsForDate(date);
//         return slots.length > 0;
//     };

//     // Find next available dates with time slots
//     const findNextAvailableDates = () => {
//         const availableDates = [];
//         const today = new Date();

//         for (let i = 1; i <= 30; i++) {
//             const nextDate = new Date(today);
//             nextDate.setDate(today.getDate() + i);

//             if (hasTimeSlots(nextDate)) {
//                 availableDates.push(new Date(nextDate));

//                 if (availableDates.length >= 3) {
//                     break;
//                 }
//             }
//         }

//         return availableDates;
//     };

//     // Enhanced duration parsing function
//     const parseDuration = (durationString) => {
//         if (!durationString) return 60;
        
//         const cleanString = durationString.trim().toLowerCase();
        
//         // Extract hours and minutes using regex
//         const hourMatch = cleanString.match(/(\d+(?:\.\d+)?)\s*(?:hrs|hr|hour|hours)/);
//         const minuteMatch = cleanString.match(/(\d+)\s*(?:min|mins|minute|minutes)/);
        
//         let totalMinutes = 0;
        
//         if (hourMatch) {
//             totalMinutes += parseFloat(hourMatch[1]) * 60;
//         }
//         if (minuteMatch) {
//             totalMinutes += parseInt(minuteMatch[1]);
//         }
        
//         // If no explicit hour/minute found, try to parse as just a number
//         if (totalMinutes === 0) {
//             const numberMatch = cleanString.match(/(\d+(?:\.\d+)?)/);
//             if (numberMatch) {
//                 const num = parseFloat(numberMatch[1]);
//                 totalMinutes = num < 10 ? Math.round(num * 60) : Math.round(num);
//             }
//         }
        
//         return totalMinutes || 60;
//     };

//     // Calculate end time based on start time and duration
//     const calculateEndTime = (startTime, durationString) => {
//         const durationMinutes = parseDuration(durationString);
        
//         const [hours, minutes] = startTime.split(':').map(Number);
        
//         const totalMinutes = hours * 60 + minutes + durationMinutes;
//         const endHours = Math.floor(totalMinutes / 60);
//         const endMinutes = totalMinutes % 60;
        
//         return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
//     };

//     // Format duration for display
//     const formatDurationDisplay = (durationString) => {
//         const minutes = parseDuration(durationString);
        
//         const hours = Math.floor(minutes / 60);
//         const mins = minutes % 60;
        
//         if (hours > 0 && mins > 0) {
//             return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${mins} minutes`;
//         } else if (hours > 0) {
//             return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
//         } else {
//             return `${mins} minutes`;
//         }
//     };

//     // Handle next availability button click
//     const handleNextAvailabilityClick = () => {
//         setShowNextAvailability(true);
//         toast.success("Showing next available dates");
//     };

//     // Handle selecting a date from next availability
//     const handleSelectNextAvailableDate = (date) => {
//         setSelectedDate(date);
//         setSelectedTime(null);
//         setShowNextAvailability(false);
//         toast.success(`Selected date: ${date.toLocaleDateString()}`);
//     };

//     // Handle booking confirmation button click
//     const handleConfirmBookingClick = () => {
//         if (selectedTime && price?.duration) {
//             const endTime = calculateEndTime(selectedTime, price.duration);
//             console.log('Booking details:', { 
//                 start: selectedTime, 
//                 end: endTime, 
//                 duration: price.duration,
//                 formattedDuration: formatDurationDisplay(price.duration)
//             });
            
            
//             // Small delay before showing form
//             setTimeout(() => {
//                 setShowBookingForm(true);
//             }, 500);
//         } else {
//             toast.error("Please select a time slot first");
//         }
//     };

//     // Handle successful booking (to be called from BookingForm)
//     const handleBookingSuccess = async () => {
//         const loadingToast = toast.loading("Refreshing available time slots...");
        
//         try {
//             setLoading(true);
//             const refreshResponse = await axios.get(route("ourreservations.timeslots"));
//             if (refreshResponse.data.success) {
//                 setTimeSlots(refreshResponse.data.data);
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

//     // Handle time selection
//     const handleTimeSelect = (time) => {
//         setSelectedTime(time);
//     };

//     // Handle date selection
//     const handleDateSelect = (date) => {
//         if (date && !isPastDate(date)) {
//             setSelectedDate(date);
//             setSelectedTime(null);
//             setShowNextAvailability(false);
//         } else if (date && isPastDate(date)) {
//             toast.error("Cannot select past dates", {
//                 icon: '⚠️'
//             });
//         }
//     };

//     // Get time slots for the currently selected date
//     const currentTimeSlots = getTimeSlotsForDate(selectedDate);
//     const nextAvailableDates = findNextAvailableDates();

//     // Custom day cell content to show availability indicator
//     const renderDayContent = (date) => {
//         const hasSlots = hasTimeSlots(date);
//         const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
//         const isPast = isPastDate(date);
        
//         return (
//             <div className="relative">
//                 <span className={isPast ? "text-gray-400" : ""}>{date.getDate()}</span>
//                 {hasSlots && !isSelected && !isPast && (
//                     <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full"></div>
//                 )}
//             </div>
//         );
//     };

//     return (
//         <div className="min-h-screen bg-gray-50">
//             {/* Add Toaster component for notifications */}
//             <Toaster
//                 position="top-right"
//                 toastOptions={{
//                     duration: 4000,
//                     style: {
//                         background: '#363636',
//                         color: '#fff',
//                     },
//                     success: {
//                         duration: 3000,
//                         style: {
//                             background: '#10b981',
//                             color: '#fff',
//                         },
//                     },
//                     error: {
//                         duration: 4000,
//                         style: {
//                             background: '#ef4444',
//                             color: '#fff',
//                         },
//                     },
//                     loading: {
//                         style: {
//                             background: '#3b82f6',
//                             color: '#fff',
//                         },
//                     },
//                 }}
//             />
            
//             <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

//                 <Link href={'/'} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
//                     <ChevronLeft size={20} />
//                     <span className="font-medium">Back</span>
//                 </Link>
                
//                 {/* Header */}
//                 <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6">
//                     <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
//                         Schedule Your Service
//                     </h1>
//                     <p className="text-gray-600 text-sm sm:text-base">
//                         Check out our availability and book the date and time that works for you
//                     </p>
//                 </div>

//                 {/* Loading State */}
//                 {loading && (
//                     <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
//                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
//                         <p className="text-gray-600 mt-4">Loading available time slots...</p>
//                     </div>
//                 )}

//                 {/* Main Content */}
//                 {!loading && (
//                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
//                         {/* Calendar Section */}
//                         <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-1">
//                             <div className="mb-4">
//                                 <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
//                                     Select a Date
//                                 </h2>
//                                 <p className="text-xs sm:text-sm text-gray-500">
//                                     Time zone: Australian Western Standard Time (GMT+8)
//                                 </p>
//                                 <div className="flex items-center mt-2 text-xs text-gray-500">
//                                     <div className="flex items-center mr-4">
//                                         <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></div>
//                                         <span>Available</span>
//                                     </div>
//                                 </div>
//                             </div>
//                             <Calendar
//                                 mode="single"
//                                 selected={selectedDate}
//                                 onSelect={handleDateSelect}
//                                 disabled={isPastDate}
//                                 className="rounded-md border [&_.rdp-day_selected]:bg-emerald-600 [&_.rdp-day_selected]:text-white [&_.rdp-day_selected:hover]:bg-emerald-700 [&_.rdp-button:hover]:bg-emerald-50 [&_.rdp-day_today]:bg-gray-100 [&_.rdp-day_disabled]:text-gray-400 [&_.rdp-day_disabled]:cursor-not-allowed"
//                                 components={{
//                                     DayContent: ({ date }) => renderDayContent(date)
//                                 }}
//                             />
//                         </div>

//                         {/* Time Slots Section */}
//                         <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-1">
//                             <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
//                                 Available Times
//                             </h2>
//                             <p className="text-xs sm:text-sm text-gray-500 mb-4">
//                                 {formatDisplayDate(selectedDate)}
//                             </p>

//                             {currentTimeSlots.length > 0 ? (
//                                 <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
//                                     {currentTimeSlots.map((time) => (
//                                         <button
//                                             key={time}
//                                             onClick={() => handleTimeSelect(time)}
//                                             className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg border-2 transition-all duration-200 font-medium text-sm sm:text-base ${
//                                                 selectedTime === time
//                                                     ? "border-emerald-600 bg-emerald-600 text-white shadow-md"
//                                                     : "border-gray-200 hover:border-emerald-300 text-gray-700 hover:bg-emerald-50"
//                                             }`}
//                                         >
//                                             {time}
//                                         </button>
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <div className="text-center py-4">
//                                     <div className="text-gray-400 mb-3">
//                                         <svg
//                                             className="w-12 h-12 mx-auto"
//                                             fill="none"
//                                             stroke="currentColor"
//                                             viewBox="0 0 24 24"
//                                         >
//                                             <path
//                                                 strokeLinecap="round"
//                                                 strokeLinejoin="round"
//                                                 strokeWidth={1}
//                                                 d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
//                                             />
//                                         </svg>
//                                     </div>
//                                     <p className="text-gray-500 font-medium mb-2">
//                                         {isPastDate(selectedDate) ? "Cannot select past dates" : "No available time slots"}
//                                     </p>
//                                     <p className="text-gray-400 text-sm mb-4">
//                                         {isPastDate(selectedDate) ? "Please select a current or future date" : "Please select another date"}
//                                     </p>

//                                     {!showNextAvailability ? (
//                                         <button
//                                             onClick={handleNextAvailabilityClick}
//                                             className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
//                                         >
//                                             Check Next Availability
//                                         </button>
//                                     ) : (
//                                         <div className="mt-4">
//                                             <h3 className="text-sm font-semibold text-gray-900 mb-3 text-left">
//                                                 Next available dates:
//                                             </h3>
//                                             <div className="space-y-2">
//                                                 {nextAvailableDates.map((date, index) => (
//                                                     <button
//                                                         key={index}
//                                                         onClick={() => handleSelectNextAvailableDate(date)}
//                                                         className="w-full py-2 px-3 text-left bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors duration-200"
//                                                     >
//                                                         <div className="text-sm font-medium text-gray-900">
//                                                             {date.toLocaleDateString("en-US", {
//                                                                 weekday: "short",
//                                                                 month: "short",
//                                                                 day: "numeric",
//                                                             })}
//                                                         </div>
//                                                         <div className="text-xs text-gray-600">
//                                                             {getTimeSlotsForDate(date).length} time slots available
//                                                         </div>
//                                                     </button>
//                                                 ))}
//                                             </div>
//                                             {nextAvailableDates.length === 0 && (
//                                                 <p className="text-gray-500 text-sm py-2">
//                                                     No available dates found in the next 30 days.
//                                                 </p>
//                                             )}
//                                         </div>
//                                     )}
//                                 </div>
//                             )}
//                         </div>

//                         {/* Service Details Section */}
//                         <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-1">
//                             <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
//                                 Service Details
//                             </h2>

//                             <div className="space-y-4 mb-6">
//                                 <div>
//                                     <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
//                                         Driving Lessons
//                                     </h3>
//                                     <p className="text-xs sm:text-sm text-gray-600">
//                                         Professional driving instruction with certified instructors
//                                     </p>
//                                 </div>

//                                 <div className="border-t pt-4">
//                                     <div className="flex justify-between text-xs sm:text-sm mb-2">
//                                         <span className="text-gray-600">Package:</span>
//                                         <span className="font-medium text-gray-900">{price.description}</span>
//                                     </div>
//                                     <div className="flex justify-between text-xs sm:text-sm mb-2">
//                                         <span className="text-gray-600">Duration:</span>
//                                         <span className="font-medium text-gray-900">{formatDurationDisplay(price.duration)}</span>
//                                     </div>
//                                     <div className="flex justify-between text-xs sm:text-sm mb-2">
//                                         <span className="text-gray-600">Price:</span>
//                                         <span className="font-medium text-gray-900">${price.price}</span>
//                                     </div>
//                                     {selectedDate && selectedTime && (
//                                         <>
//                                             <div className="flex justify-between text-xs sm:text-sm">
//                                                 <span className="text-gray-600">Selected:</span>
//                                                 <span className="font-medium text-gray-900 text-right">
//                                                     {selectedDate.toLocaleDateString()} at {selectedTime}
//                                                 </span>
//                                             </div>
//                                             <div className="flex justify-between text-xs sm:text-sm mt-1">
//                                                 <span className="text-gray-600">End Time:</span>
//                                                 <span className="font-medium text-emerald-600 text-right">
//                                                     {calculateEndTime(selectedTime, price.duration)}
//                                                 </span>
//                                             </div>
//                                         </>
//                                     )}
//                                 </div>
//                             </div>

//                             <button
//                                 onClick={handleConfirmBookingClick}
//                                 disabled={!selectedTime || isPastDate(selectedDate)}
//                                 className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
//                                     selectedTime && !isPastDate(selectedDate)
//                                         ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transform hover:scale-105"
//                                         : "bg-gray-200 text-gray-400 cursor-not-allowed"
//                                 }`}
//                             >
//                                 {selectedTime ? "Confirm Booking" : "Select a Time"}
//                             </button>

//                             {selectedTime && (
//                                 <p className="text-xs text-center text-gray-500 mt-3">
//                                     You'll be asked to complete your details in the next step
//                                 </p>
//                             )}
//                         </div>
//                     </div>
//                 )}

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

    useEffect(() => {
        const fetchReservation = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    route("ourreservations.timeslots"),
                    {
                        params: {
                            price_id: price.id, // Pass price ID
                            days: 30
                        }
                    }
                );
                
                if (response.data.success) {
                    setTimeSlots(response.data.data);             
                } else {
                    console.error("Error fetching reservations:", response.data.message);
                }
            } catch (err) {
                console.error("Error fetching reservations:", err);
                toast.error("Error loading time slots. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchReservation();
    }, [price.id]); // Add price.id to dependency array

    // Function to check if a date is in the past
    const isPastDate = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    // Function to get time slots for a specific date
    const getTimeSlotsForDate = (date) => {
        if (!date) return [];
        const dateKey = formatDateKey(date);
        
        // Check if we have slots for this date
        if (!timeSlots[dateKey]) return [];
        
        // Return slots (they might be objects or strings depending on backend response)
        return Array.isArray(timeSlots[dateKey]) ? timeSlots[dateKey] : [];
    };

    // Format date as YYYY-MM-DD for consistent key matching
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

    // Check if date has available time slots
    const hasTimeSlots = (date) => {
        const slots = getTimeSlotsForDate(date);
        return slots.length > 0;
    };

    // Find next available dates with time slots
    const findNextAvailableDates = () => {
        const availableDates = [];
        const today = new Date();

        for (let i = 1; i <= 30; i++) {
            const nextDate = new Date(today);
            nextDate.setDate(today.getDate() + i);

            if (hasTimeSlots(nextDate)) {
                availableDates.push(new Date(nextDate));

                if (availableDates.length >= 3) {
                    break;
                }
            }
        }

        return availableDates;
    };

    // Enhanced duration parsing function
    const parseDuration = (durationString) => {
        if (!durationString) return 60;
        
        const cleanString = durationString.trim().toLowerCase();
        
        // Extract hours and minutes using regex
        const hourMatch = cleanString.match(/(\d+(?:\.\d+)?)\s*(?:hrs|hr|hour|hours)/);
        const minuteMatch = cleanString.match(/(\d+)\s*(?:min|mins|minute|minutes)/);
        
        let totalMinutes = 0;
        
        if (hourMatch) {
            totalMinutes += parseFloat(hourMatch[1]) * 60;
        }
        if (minuteMatch) {
            totalMinutes += parseInt(minuteMatch[1]);
        }
        
        // If no explicit hour/minute found, try to parse as just a number
        if (totalMinutes === 0) {
            const numberMatch = cleanString.match(/(\d+(?:\.\d+)?)/);
            if (numberMatch) {
                const num = parseFloat(numberMatch[1]);
                totalMinutes = num < 10 ? Math.round(num * 60) : Math.round(num);
            }
        }
        
        return totalMinutes || 60;
    };

    // Calculate end time based on start time and duration
    const calculateEndTime = (startTime, durationString) => {
        const durationMinutes = parseDuration(durationString);
        
        // Handle if startTime is an object (from backend) or string
        const startTimeStr = typeof startTime === 'object' ? startTime.start_time : startTime;
        const [hours, minutes] = startTimeStr.split(':').map(Number);
        
        const totalMinutes = hours * 60 + minutes + durationMinutes;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        
        return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    };

    // Format duration for display
    const formatDurationDisplay = (durationString) => {
        const minutes = parseDuration(durationString);
        
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0 && mins > 0) {
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${mins} minutes`;
        } else if (hours > 0) {
            return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
        } else {
            return `${mins} minutes`;
        }
    };

    // Handle next availability button click
    const handleNextAvailabilityClick = () => {
        setShowNextAvailability(true);
        toast.success("Showing next available dates");
    };

    // Handle selecting a date from next availability
    const handleSelectNextAvailableDate = (date) => {
        setSelectedDate(date);
        setSelectedTime(null);
        setShowNextAvailability(false);
        toast.success(`Selected date: ${date.toLocaleDateString()}`);
    };

    // Handle booking confirmation button click
    const handleConfirmBookingClick = () => {
        if (selectedTime && price?.duration) {
            const endTime = calculateEndTime(selectedTime, price.duration);
            console.log('Booking details:', { 
                start: selectedTime, 
                end: endTime, 
                duration: price.duration,
                formattedDuration: formatDurationDisplay(price.duration)
            });
            
            // Small delay before showing form
            setTimeout(() => {
                setShowBookingForm(true);
            }, 500);
        } else {
            toast.error("Please select a time slot first");
        }
    };

    // Handle successful booking (to be called from BookingForm)
    const handleBookingSuccess = async () => {
        const loadingToast = toast.loading("Refreshing available time slots...");
        
        try {
            setLoading(true);
            const refreshResponse = await axios.get(
                route("ourreservations.timeslots"),
                {
                    params: {
                        price_id: price.id,
                        days: 30
                    }
                }
            );
            if (refreshResponse.data.success) {
                setTimeSlots(refreshResponse.data.data);
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

    // Handle time selection
    const handleTimeSelect = (time) => {
        // Time might be an object or string from backend
        setSelectedTime(time);
    };

    // Handle date selection
    const handleDateSelect = (date) => {
        if (date && !isPastDate(date)) {
            setSelectedDate(date);
            setSelectedTime(null);
            setShowNextAvailability(false);
        } else if (date && isPastDate(date)) {
            toast.error("Cannot select past dates", {
                icon: '⚠️'
            });
        }
    };

    // Get time slots for the currently selected date
    const currentTimeSlots = getTimeSlotsForDate(selectedDate);
    const nextAvailableDates = findNextAvailableDates();

    // Get time slot display text
    const getTimeSlotDisplay = (slot) => {
        if (typeof slot === 'string') return slot;
        if (typeof slot === 'object' && slot.start_time) return slot.start_time;
        return 'Invalid time slot';
    };

    // Custom day cell content to show availability indicator
    const renderDayContent = (date) => {
        const hasSlots = hasTimeSlots(date);
        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
        const isPast = isPastDate(date);
        
        return (
            <div className="relative">
                <span className={isPast ? "text-gray-400" : ""}>{date.getDate()}</span>
                {hasSlots && !isSelected && !isPast && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full"></div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Add Toaster component for notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        style: {
                            background: '#10b981',
                            color: '#fff',
                        },
                    },
                    error: {
                        duration: 4000,
                        style: {
                            background: '#ef4444',
                            color: '#fff',
                        },
                    },
                    loading: {
                        style: {
                            background: '#3b82f6',
                            color: '#fff',
                        },
                    },
                }}
            />
            
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

                <Link href={'/'} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
                    <ChevronLeft size={20} />
                    <span className="font-medium">Back</span>
                </Link>
                
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        Schedule Your Service
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Check out our availability and book the date and time that works for you
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading available time slots...</p>
                    </div>
                )}

                {/* Main Content */}
                {!loading && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Calendar Section */}
                        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-1">
                            <div className="mb-4">
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                                    Select a Date
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    Time zone: Australian Western Standard Time (GMT+8)
                                </p>
                                <div className="flex items-center mt-2 text-xs text-gray-500">
                                    <div className="flex items-center mr-4">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></div>
                                        <span>Available</span>
                                    </div>
                                </div>
                            </div>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                disabled={isPastDate}
                                className="rounded-md border [&_.rdp-day_selected]:bg-emerald-600 [&_.rdp-day_selected]:text-white [&_.rdp-day_selected:hover]:bg-emerald-700 [&_.rdp-button:hover]:bg-emerald-50 [&_.rdp-day_today]:bg-gray-100 [&_.rdp-day_disabled]:text-gray-400 [&_.rdp-day_disabled]:cursor-not-allowed"
                                components={{
                                    DayContent: ({ date }) => renderDayContent(date)
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

                            {currentTimeSlots.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
                                    {currentTimeSlots.map((time, index) => {
                                        const timeDisplay = getTimeSlotDisplay(time);
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleTimeSelect(time)}
                                                className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg border-2 transition-all duration-200 font-medium text-sm sm:text-base ${
                                                    selectedTime === time
                                                        ? "border-emerald-600 bg-emerald-600 text-white shadow-md"
                                                        : "border-gray-200 hover:border-emerald-300 text-gray-700 hover:bg-emerald-50"
                                                }`}
                                            >
                                                {timeDisplay}
                                            </button>
                                        );
                                    })}
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
                                        {isPastDate(selectedDate) ? "Cannot select past dates" : "No available time slots"}
                                    </p>
                                    <p className="text-gray-400 text-sm mb-4">
                                        {isPastDate(selectedDate) ? "Please select a current or future date" : "Please select another date"}
                                    </p>

                                    {!showNextAvailability ? (
                                        <button
                                            onClick={handleNextAvailabilityClick}
                                            className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
                                        >
                                            Check Next Availability
                                        </button>
                                    ) : (
                                        <div className="mt-4">
                                            <h3 className="text-sm font-semibold text-gray-900 mb-3 text-left">
                                                Next available dates:
                                            </h3>
                                            <div className="space-y-2">
                                                {nextAvailableDates.map((date, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleSelectNextAvailableDate(date)}
                                                        className="w-full py-2 px-3 text-left bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors duration-200"
                                                    >
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {date.toLocaleDateString("en-US", {
                                                                weekday: "short",
                                                                month: "short",
                                                                day: "numeric",
                                                            })}
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            {getTimeSlotsForDate(date).length} time slots available
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                            {nextAvailableDates.length === 0 && (
                                                <p className="text-gray-500 text-sm py-2">
                                                    No available dates found in the next 30 days.
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
                                        {price.category || 'Driving Lessons'}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        {price.description || 'Professional driving instruction with certified instructors'}
                                    </p>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex justify-between text-xs sm:text-sm mb-2">
                                        <span className="text-gray-600">Package:</span>
                                        <span className="font-medium text-gray-900">{price.description}</span>
                                    </div>
                                    <div className="flex justify-between text-xs sm:text-sm mb-2">
                                        <span className="text-gray-600">Duration:</span>
                                        <span className="font-medium text-gray-900">{formatDurationDisplay(price.duration)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs sm:text-sm mb-2">
                                        <span className="text-gray-600">Price:</span>
                                        <span className="font-medium text-gray-900">${price.price}</span>
                                    </div>
                                    {selectedDate && selectedTime && (
                                        <>
                                            <div className="flex justify-between text-xs sm:text-sm">
                                                <span className="text-gray-600">Selected:</span>
                                                <span className="font-medium text-gray-900 text-right">
                                                    {selectedDate.toLocaleDateString()} at {getTimeSlotDisplay(selectedTime)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs sm:text-sm mt-1">
                                                <span className="text-gray-600">End Time:</span>
                                                <span className="font-medium text-emerald-600 text-right">
                                                    {calculateEndTime(selectedTime, price.duration)}
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
                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transform hover:scale-105"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                            >
                                {selectedTime ? "Confirm Booking" : "Select a Time"}
                            </button>

                            {selectedTime && (
                                <p className="text-xs text-center text-gray-500 mt-3">
                                    You'll be asked to complete your details in the next step
                                </p>
                            )}
                        </div>
                    </div>
                )}

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