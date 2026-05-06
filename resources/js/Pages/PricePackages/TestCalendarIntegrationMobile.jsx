// import React, { useState, useEffect } from "react";
// import {
//     ChevronDown,
//     MapPin,
//     Calendar,
//     Clock,
//     BookOpen,
//     CheckCircle,
//     CalendarIcon,
//     ChevronLeft,
//     X,
// } from "lucide-react";
// import axios from "axios";
// import toast, { Toaster } from "react-hot-toast";
// import { Link } from "@inertiajs/react";

// const TestCalendarIntegrationMobile = ({ price }) => {
//     const [selectedDate, setSelectedDate] = useState("");
//     const [selectedTime, setSelectedTime] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [availabilityMessage, setAvailabilityMessage] = useState("");
//     const [isAvailable, setIsAvailable] = useState(false);
//     const [alternativeTimes, setAlternativeTimes] = useState([]);
//     const [bookingDetails, setBookingDetails] = useState(null);
//     const [timeError, setTimeError] = useState("");
//     const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
//     const [loadingSlots, setLoadingSlots] = useState(false);
//     const [showOrderSummary, setShowOrderSummary] = useState(false);
//     const [saved, setSaved] = useState(false);
//     const [allDates, setAllDates] = useState([]);

//     // Booking form state
//     const [bookingForm, setBookingForm] = useState({
//         user_name: "",
//         email: "",
//         phone: "",
//         address: "",
//         zip_code: "",
//         test_location: "Mandurah licensing center",
//         pickup_location: "",
//         dropoff_location: "",
//     });
//     const [formErrors, setFormErrors] = useState({});
//     const [submitting, setSubmitting] = useState(false);

//     // Function to set pickup location same as address
//     const setPickupSameAsAddress = () => {
//         if (bookingForm.address) {
//             setBookingForm((prev) => ({
//                 ...prev,
//                 pickup_location: prev.address,
//             }));
//             if (formErrors.pickup_location) {
//                 setFormErrors((prev) => ({
//                     ...prev,
//                     pickup_location: "",
//                 }));
//             }
//             toast.success("Pickup location set to address");
//         } else {
//             toast.error("Please enter an address first");
//         }
//     };

//     // Function to set dropoff location same as address
//     const setDropoffSameAsAddress = () => {
//         if (bookingForm.address) {
//             setBookingForm((prev) => ({
//                 ...prev,
//                 dropoff_location: prev.address,
//             }));
//             if (formErrors.dropoff_location) {
//                 setFormErrors((prev) => ({
//                     ...prev,
//                     dropoff_location: "",
//                 }));
//             }
//             toast.success("Dropoff location set to address");
//         } else {
//             toast.error("Please enter an address first");
//         }
//     };

//     // Generate available dates for the next 365 days (1 year) with month grouping
//     useEffect(() => {
//         const dates = [];
//         const today = new Date();

//         for (let i = 0; i < 365; i++) {
//             const date = new Date(today);
//             date.setDate(today.getDate() + i);

//             // Get month and year for grouping
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
//                 date: date,
//                 monthYear: monthYear, // Add month/year for grouping
//             });
//         }
//         setAllDates(dates);
//     }, []);

//     // Group dates by monthYear
//     const groupedDates = allDates.reduce((groups, date) => {
//         const key = date.monthYear;
//         if (!groups[key]) {
//             groups[key] = [];
//         }
//         groups[key].push(date);
//         return groups;
//     }, {});

//     // Function to check if a date is in the past
//     const isPastDate = (dateString) => {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         const compareDate = new Date(dateString);
//         compareDate.setHours(0, 0, 0, 0);

//         return compareDate < today;
//     };

//     const formatDateKey = (date) => {
//         if (!date) return "";
//         return date;
//     };

//     const formatDisplayDate = (dateString) => {
//         if (!dateString) return "Select a date";
//         const date = new Date(dateString);
//         return date.toLocaleDateString("en-AU", {
//             weekday: "short",
//             day: "2-digit",
//             month: "short",
//             year: "numeric",
//         });
//     };

//     // Parse duration to minutes
//     const parseDuration = (durationString) => {
//         if (!durationString) return 60;

//         const cleanString = durationString.trim().toLowerCase();

//         // Extract hours and minutes using regex
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

//     // Format time for display (convert 24h to 12h format)
//     const formatTimeForDisplay = (time24) => {
//         if (!time24) return "";
//         const [hours, minutes] = time24.split(":").map(Number);
//         const period = hours >= 12 ? "PM" : "AM";
//         const displayHours = hours % 12 || 12;
//         return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
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

//     // Fetch available time slots when date changes
//     useEffect(() => {
//         if (selectedDate && !isPastDate(selectedDate) && price) {
//             fetchAvailableTimeSlots();
//         } else {
//             setAvailableTimeSlots([]);
//         }
//     }, [selectedDate, price]);

//     const fetchAvailableTimeSlots = async () => {
//         if (!price) return;

//         setLoadingSlots(true);
//         try {
//             const response = await axios.get(
//                 route("test-packages.available-slots"),
//                 {
//                     params: {
//                         date: selectedDate,
//                         price_id: price.id,
//                         duration_minutes: parseDuration(price.duration),
//                     },
//                 },
//             );

//             if (response.data.success) {
//                 setAvailableTimeSlots(response.data.available_slots);
//                 toast.success(`Found ${response.data.available_slots.length} available slots`, {
//                     duration: 3000,
//                 });
//             } else {
//                 setAvailableTimeSlots([]);
//                 toast.error("No available slots found for this date");
//             }
//         } catch (error) {
//             console.error("Error fetching available slots:", error);
//             setAvailableTimeSlots([]);

//         } finally {
//             setLoadingSlots(false);
//         }
//     };

//     // Check availability for test time
//     const checkTestAvailability = async () => {
//         if (!price) {
//             setAvailabilityMessage("Price information not available");
//             setIsAvailable(false);
//             toast.error("Price information not available");
//             return;
//         }

//         if (!selectedDate || !selectedTime) {
//             setAvailabilityMessage("Please select both date and time");
//             setIsAvailable(false);
//             toast.error("Please select both date and time");
//             return;
//         }

//         // Validate time format
//         if (!validateTimeFormat(selectedTime)) {
//             setTimeError("Please enter a valid time in HH:MM format");
//             setIsAvailable(false);
//             toast.error("Please enter a valid time in HH:MM format");
//             return;
//         }

//         setLoading(true);
//         setAvailabilityMessage("");
//         setAlternativeTimes([]);
//         setTimeError("");

//         const loadingToast = toast.loading("Checking availability...");

//         try {
//             const formattedTime = formatTimeForApi(selectedTime);

//             const response = await axios.post(
//                 route("test-packages.check-availability"),
//                 {
//                     date: selectedDate,
//                     test_time: formattedTime,
//                     duration_minutes: parseDuration(price.duration),
//                     price_id: price.id,
//                 },
//             );

//             toast.dismiss(loadingToast);

//             if (response.data.available) {
//                 setIsAvailable(true);
//                 setBookingDetails({
//                     start_time: response.data.start_time,
//                     end_time: response.data.end_time,
//                     buffer_start: response.data.start_time,
//                     buffer_end: response.data.end_time,
//                 });
//                 setAvailabilityMessage(
//                     "✓ This time slot is available! You can proceed to book.",
//                 );
//                 toast.success("Time slot is available! You can proceed to book.");
//             } else {
//                 setIsAvailable(false);
//                 let message =
//                     response.data.message || "Time slot not available";

//                 // If there are alternative times, show them
//                 if (
//                     response.data.alternative_times &&
//                     response.data.alternative_times.length > 0
//                 ) {
//                     setAlternativeTimes(response.data.alternative_times);
//                     toast.error("Selected time not available. Check suggested times below.", {
//                         duration: 5000,
//                     });
//                 } else {
//                     message +=
//                         "\n\nNo alternative times available for this duration.";
//                     toast.error("Time slot not available. Please contact us for assistance.", {
//                         duration: 5000,
//                     });
//                 }

//                 message += "\n\nPlease contact us for assistance.";
//                 setAvailabilityMessage(message);
//             }
//         } catch (error) {
//             console.error("Error checking availability:", error);
//             toast.dismiss(loadingToast);
//             setIsAvailable(false);

//             // Check if it's a validation error
//             if (error.response && error.response.status === 422) {
//                 const errors = error.response.data.errors;
//                 if (errors && errors.test_time) {
//                     setAvailabilityMessage(
//                         `Validation error: ${errors.test_time[0]}`,
//                     );
//                     setTimeError(errors.test_time[0]);
//                     toast.error(errors.test_time[0]);
//                 } else if (errors && errors.price_id) {
//                     setAvailabilityMessage(
//                         `Validation error: ${errors.price_id[0]}`,
//                     );
//                     toast.error(errors.price_id[0]);
//                 } else {
//                     setAvailabilityMessage(
//                         "Please check the time format (HH:MM) and try again.",
//                     );
//                     toast.error("Please check the time format (HH:MM) and try again.");
//                 }
//             } else {
//                 setAvailabilityMessage(
//                     "Error checking availability. Please try again.",
//                 );
//                 toast.error("Error checking availability. Please try again.");
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Handle time selection from dropdown
//     const handleTimeSelect = (time24) => {
//         setSelectedTime(time24);
//         setAvailabilityMessage("");
//         setIsAvailable(false);
//         setAlternativeTimes([]);
//         setTimeError("");
//         toast.success(`Selected time: ${formatTimeForDisplay(time24)}`, {
//             duration: 2000,
//         });
//     };

//     // Handle manual time input
//     const handleTimeChange = (e) => {
//         const value = e.target.value;
//         setSelectedTime(value);
//         setAvailabilityMessage("");
//         setIsAvailable(false);
//         setAlternativeTimes([]);
//         setTimeError("");
//     };

//     // Handle form input changes
//     const handleFormChange = (e) => {
//         const { name, value } = e.target;
//         setBookingForm((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//         if (formErrors[name]) {
//             setFormErrors((prev) => ({
//                 ...prev,
//                 [name]: "",
//             }));
//         }
//     };

//     // Validate zip code - only allow 6210
//     const validateZipCode = (zip) => {
//         const cleanZip = zip.replace(/\D/g, "");
//         return cleanZip === "6210";
//     };

//     // Extract package name from price description
//     const extractPackageName = (description) => {
//         if (!description) return "";
//         if (description.includes(":")) {
//             return description.split(":").pop().trim();
//         }
//         return description.trim();
//     };

//     // Calculate end time
//     const calculateEndTime = (startTime, durationString) => {
//         const durationMinutes = parseDuration(durationString);
//         const [hours, minutes] = startTime.split(":").map(Number);
//         const totalMinutes = hours * 60 + minutes + durationMinutes;
//         const endHours = Math.floor(totalMinutes / 60);
//         const endMinutes = totalMinutes % 60;
//         return `${String(endHours).padStart(2, "0")}:${String(
//             endMinutes,
//         ).padStart(2, "0")}`;
//     };

//     // Handle booking submission
//     const handleBookingSubmit = async (e) => {
//         e.preventDefault();

//         if (!isAvailable || !bookingDetails) {
//             toast.error("Please check availability first");
//             return;
//         }

//         // Validate required fields
//         const requiredFields = [
//             "user_name",
//             "email",
//             "phone",
//             "address",
//             "zip_code",
//             "pickup_location",
//             "dropoff_location",
//         ];
//         const newErrors = {};

//         requiredFields.forEach((field) => {
//             if (!bookingForm[field]?.trim()) {
//                 newErrors[field] = `${field.replace("_", " ")} is required`;
//             }
//         });

//         // Validate email format
//         if (bookingForm.email && !/\S+@\S+\.\S+/.test(bookingForm.email)) {
//             newErrors.email = "Please enter a valid email address";
//         }

//         // Validate zip code
//         if (bookingForm.zip_code && !validateZipCode(bookingForm.zip_code)) {
//             newErrors.zip_code =
//                 "Sorry, we currently only serve areas with zip code 6210";
//         }

//         if (Object.keys(newErrors).length > 0) {
//             setFormErrors(newErrors);
//             toast.error("Please fill in all required fields correctly");
//             return;
//         }

//         setSubmitting(true);
//         setFormErrors({});

//         const submittingToast = toast.loading("Processing your booking...");

//         try {
//             const durationMinutes = parseDuration(price.duration);
//             const fullAddress = `${bookingForm.address}, ${bookingForm.zip_code}`;
//             const packageName = extractPackageName(price.description);

//             const bookingData = {
//                 user_name: bookingForm.user_name,
//                 email: bookingForm.email,
//                 phone: bookingForm.phone,
//                 address: fullAddress,
//                 reservation_date: selectedDate,
//                 price_id: price.id,
//                 duration_minutes: durationMinutes,
//                 start_time: bookingDetails.start_time,
//                 end_time: bookingDetails.end_time,
//                 test_time: selectedTime,
//                 test_location: bookingForm.test_location,
//                 pickup_location: bookingForm.pickup_location,
//                 dropoff_location: bookingForm.dropoff_location,
//                 test_type: packageName,
//             };

//             const response = await axios.post(
//                 route("test-packages.store"),
//                 bookingData,
//             );

//             toast.dismiss(submittingToast);

//             if (response.data.success || response.data.message) {
//                 toast.success("Test package booked successfully!", {
//                     duration: 5000,
//                 });

//                 // Reset form
//                 setSelectedDate("");
//                 setSelectedTime("");
//                 setAvailabilityMessage("");
//                 setIsAvailable(false);
//                 setAlternativeTimes([]);
//                 setBookingDetails(null);
//                 setTimeError("");
//                 setBookingForm({
//                     user_name: "",
//                     email: "",
//                     phone: "",
//                     address: "",
//                     zip_code: "",
//                     test_location: "Mandurah licensing center",
//                     pickup_location: "",
//                     dropoff_location: "",
//                 });

//                 setSaved(true);
//                 setTimeout(() => setSaved(false), 2500);

//                 // Refresh available slots
//                 if (price) {
//                     fetchAvailableTimeSlots();
//                 }
//             } else {
//                 toast.error("Error confirming booking: " + response.data.message);
//             }
//         } catch (error) {
//             console.error("Booking error:", error);
//             toast.dismiss(submittingToast);

//             if (error.response?.data?.errors) {
//                 setFormErrors(error.response.data.errors);
//                 toast.error("Please fix the errors in the form.");
//             } else if (error.response?.data?.message) {
//                 toast.error(error.response.data.message);
//             } else {
//                 toast.error("Error confirming booking. Please try again.");
//             }
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     // Set min and max times for the time input - with null check for price
//     const getMinTime = () => {
//         return "07:00"; // 7:00 AM (working hours start)
//     };

//     const getMaxTime = () => {
//         if (!price) {
//             return "17:00"; // Default to 5:00 PM
//         }

//         const durationMinutes = parseDuration(price.duration);
//         const workingEnd = 18; // 6:00 PM

//         const maxTestStartTime = new Date();
//         maxTestStartTime.setHours(workingEnd, 0 - durationMinutes, 0, 0);

//         if (maxTestStartTime.getHours() < 7) {
//             return "07:00";
//         }

//         return (
//             maxTestStartTime.getHours().toString().padStart(2, "0") +
//             ":" +
//             maxTestStartTime.getMinutes().toString().padStart(2, "0")
//         );
//     };

//     // Show loading state if price is not available
//     if (!price) {
//         return (
//             <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//                 <div className="text-center">
//                     <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
//                     <p className="text-gray-600">
//                         Loading price information...
//                     </p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-100">
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
//                         iconTheme: {
//                             primary: "#fff",
//                             secondary: "#10b981",
//                         },
//                     },
//                     error: {
//                         duration: 4000,
//                         style: {
//                             background: "#ef4444",
//                             color: "#fff",
//                         },
//                         iconTheme: {
//                             primary: "#fff",
//                             secondary: "#ef4444",
//                         },
//                     },
//                     loading: {
//                         duration: 5000,
//                         style: {
//                             background: "#3b82f6",
//                             color: "#fff",
//                         },
//                     },
//                 }}
//             />

//             <div className="max-w-screen-lg mx-auto px-4 py-6">
//                 {/* Back Button */}
//                 <Link
//                     href={"/"}
//                     className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
//                 >
//                     <ChevronLeft size={20} />
//                     <span className="font-medium">Back</span>
//                 </Link>

//                 {/* Page Header */}
//                 <div className="mb-6">
//                     <div className="flex items-center gap-3 mb-1">
//                         {/* <BookOpen className="h-7 w-7 text-blue-600" /> */}
//                         <h1 className="text-2xl font-bold text-gray-900 ml-6">
//                             Schedule Your Test Package
//                         </h1>
//                     </div>
//                     <p className="text-gray-500 text-sm ml-6">
//                         Choose your date and time. Operating hours: 7:00 AM
//                         - 6:00 PM
//                     </p>
//                 </div>

//                 {/* Main Layout - Stacked on Mobile */}
//                 <div className="flex flex-col gap-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//                     {/* Date Selection Section */}
//                     <div>
//                         <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                             Select Test Date
//                         </h2>
//                         <p className="text-xs text-gray-500 mb-4">
//                             Time zone: Australian Western Standard Time (GMT+8)
//                         </p>

//                         {/* Date Dropdown with Month Groups */}
//                         <div className="relative">
//                             <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
//                             <select
//                                 value={selectedDate}
//                                 onChange={(e) => {
//                                     setSelectedDate(e.target.value);
//                                     setSelectedTime("");
//                                     setAvailabilityMessage("");
//                                     setIsAvailable(false);
//                                     setAlternativeTimes([]);
//                                     setTimeError("");
//                                 }}
//                                 className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 pl-10 pr-10 transition"
//                             >
//                                 <option value="">Select a date</option>
//                                 {Object.entries(groupedDates).map(([monthYear, dates]) => (
//                                     <optgroup key={monthYear} label={`── ${monthYear} ──`} className="font-semibold text-gray-700">
//                                         {dates.map((date, i) => (
//                                             <option
//                                                 key={i}
//                                                 value={date.value}
//                                                 disabled={isPastDate(date.value)}
//                                                 className="py-1"
//                                             >
//                                                 {date.display} {isPastDate(date.value) ? "(Past)" : ""}
//                                             </option>
//                                         ))}
//                                     </optgroup>
//                                 ))}
//                             </select>
//                             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                         </div>

//                         {selectedDate && (
//                             <p className="text-sm text-gray-600 mt-3">
//                                 Selected: {formatDisplayDate(selectedDate)}
//                             </p>
//                         )}
//                     </div>

//                     {/* Time Selection Section */}
//                     <div>
//                         <h2 className="text-lg font-semibold text-gray-900 mb-2">
//                             Select Test Time
//                         </h2>
//                         <p className="text-sm text-gray-500 mb-4">
//                             {selectedDate
//                                 ? formatDisplayDate(selectedDate)
//                                 : "Please select a date first"}
//                         </p>

//                         {/* Available Time Slots Dropdown */}
//                         {availableTimeSlots.length > 0 && (
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Quick Select Available Times
//                                 </label>
//                                 <div className="relative">
//                                     <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
//                                     <select
//                                         onChange={(e) =>
//                                             handleTimeSelect(e.target.value)
//                                         }
//                                         value={selectedTime}
//                                         className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 pl-10 pr-10 transition"
//                                     >
//                                         <option value="">
//                                             Choose a time...
//                                         </option>
//                                         {availableTimeSlots.map(
//                                             (slot, index) => (
//                                                 <option
//                                                     key={index}
//                                                     value={slot.time}
//                                                 >
//                                                     {slot.formatted}
//                                                 </option>
//                                             ),
//                                         )}
//                                     </select>
//                                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                                 </div>
//                                 <p className="text-xs text-gray-500 mt-1">
//                                     {availableTimeSlots.length} available slots
//                                 </p>
//                             </div>
//                         )}

//                         {loadingSlots && (
//                             <div className="text-center py-2 mb-4">
//                                 <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
//                                 <span className="text-sm text-gray-600 ml-2">
//                                     Loading available slots...
//                                 </span>
//                             </div>
//                         )}

//                         <div className="space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Test Start Time (24-hour format) *
//                                 </label>
//                                 <p className="text-xs text-gray-500 mb-2">
//                                     Operating hours: 7:00 AM - 6:00 PM
//                                 </p>
//                                 <div className="relative">
//                                     <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
//                                     <input
//                                         type="time"
//                                         value={selectedTime}
//                                         onChange={handleTimeChange}
//                                         disabled={
//                                             !selectedDate ||
//                                             isPastDate(selectedDate)
//                                         }
//                                         min={getMinTime()}
//                                         max={getMaxTime()}
//                                         step="1800"
//                                         className={`w-full bg-gray-50 border ${timeError ? "border-red-300" : "border-gray-300"} text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 pl-10 pr-3 transition disabled:opacity-50 disabled:cursor-not-allowed`}
//                                     />
//                                 </div>
//                                 {timeError && (
//                                     <p className="text-red-600 text-xs mt-1">
//                                         {timeError}
//                                     </p>
//                                 )}
//                             </div>

//                             <button
//                                 onClick={checkTestAvailability}
//                                 disabled={
//                                     !selectedTime || loading || !selectedDate
//                                 }
//                                 className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 text-sm ${
//                                     selectedTime && !loading && selectedDate
//                                         ? "bg-blue-600 hover:bg-blue-700 text-white"
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
//                             <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
//                                 <h4 className="font-medium text-blue-800 mb-2">
//                                     Suggested Available Times:
//                                 </h4>
//                                 <div className="flex flex-wrap gap-2">
//                                     {alternativeTimes.map((slot, index) => (
//                                         <button
//                                             key={index}
//                                             onClick={() =>
//                                                 handleTimeSelect(
//                                                     slot.time || slot,
//                                                 )
//                                             }
//                                             className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm transition-colors"
//                                         >
//                                             {slot.formatted ||
//                                                 formatTimeForDisplay(slot)}
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
//                                 className={`mt-6 p-4 rounded-xl ${
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
//                                             <CheckCircle className="h-5 w-5" />
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
//                                     <div
//                                         className={`ml-3 text-sm ${
//                                             isAvailable
//                                                 ? "text-green-800"
//                                                 : "text-red-800"
//                                         } whitespace-pre-line`}
//                                     >
//                                         <p>{availabilityMessage}</p>

//                                         {!isAvailable && (
//                                             <div className="mt-2">
//                                                 <p>
//                                                     Phone:{" "}
//                                                     <a
//                                                         href="tel:0481488216"
//                                                         className="text-blue-600 underline hover:text-blue-800"
//                                                     >
//                                                         0481488216
//                                                     </a>
//                                                 </p>
//                                                 <p>
//                                                     Email:{" "}
//                                                     <a
//                                                         href="mailto:Wheelmaster@outlook.com.au"
//                                                         className="text-blue-600 underline hover:text-blue-800"
//                                                     >
//                                                         Wheelmaster@outlook.com.au
//                                                     </a>
//                                                 </p>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     {/* Booking Form Section - Only shown when time is available */}
//                     {isAvailable && bookingDetails && (
//                         <div className="mt-6 ">
//                             <h2 className="text-lg font-semibold text-gray-900 mb-6">
//                                 Complete Your Booking
//                             </h2>

//                             <form
//                                 onSubmit={handleBookingSubmit}
//                                 className="space-y-6"
//                             >
//                                 {/* User Name */}
//                                 <div>
//                                     <label
//                                         htmlFor="user_name"
//                                         className="block text-sm font-medium text-gray-700 mb-2"
//                                     >
//                                         Full Name *
//                                     </label>
//                                     <input
//                                         type="text"
//                                         id="user_name"
//                                         name="user_name"
//                                         value={bookingForm.user_name}
//                                         onChange={handleFormChange}
//                                         required
//                                         className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
//                                             formErrors.user_name
//                                                 ? "border-red-500"
//                                                 : "border-gray-300"
//                                         }`}
//                                         placeholder="John Doe"
//                                     />
//                                     {formErrors.user_name && (
//                                         <p className="mt-1 text-sm text-red-600">
//                                             {formErrors.user_name}
//                                         </p>
//                                     )}
//                                 </div>

//                                 {/* Email */}
//                                 <div>
//                                     <label
//                                         htmlFor="email"
//                                         className="block text-sm font-medium text-gray-700 mb-2"
//                                     >
//                                         Email Address *
//                                     </label>
//                                     <input
//                                         type="email"
//                                         id="email"
//                                         name="email"
//                                         value={bookingForm.email}
//                                         onChange={handleFormChange}
//                                         required
//                                         className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
//                                             formErrors.email
//                                                 ? "border-red-500"
//                                                 : "border-gray-300"
//                                         }`}
//                                         placeholder="john@example.com"
//                                     />
//                                     {formErrors.email && (
//                                         <p className="mt-1 text-sm text-red-600">
//                                             {formErrors.email}
//                                         </p>
//                                     )}
//                                 </div>

//                                 {/* Phone */}
//                                 <div>
//                                     <label
//                                         htmlFor="phone"
//                                         className="block text-sm font-medium text-gray-700 mb-2"
//                                     >
//                                         Phone Number *
//                                     </label>
//                                     <input
//                                         type="tel"
//                                         id="phone"
//                                         name="phone"
//                                         value={bookingForm.phone}
//                                         onChange={handleFormChange}
//                                         required
//                                         className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
//                                             formErrors.phone
//                                                 ? "border-red-500"
//                                                 : "border-gray-300"
//                                         }`}
//                                         placeholder="+61 4XX XXX XXX"
//                                     />
//                                     {formErrors.phone && (
//                                         <p className="mt-1 text-sm text-red-600">
//                                             {formErrors.phone}
//                                         </p>
//                                     )}
//                                 </div>

//                                 {/* Address */}
//                                 <div>
//                                     <label
//                                         htmlFor="address"
//                                         className="block text-sm font-medium text-gray-700 mb-2"
//                                     >
//                                         Address *
//                                     </label>
//                                     <textarea
//                                         id="address"
//                                         name="address"
//                                         value={bookingForm.address}
//                                         onChange={handleFormChange}
//                                         required
//                                         rows="3"
//                                         className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none ${
//                                             formErrors.address
//                                                 ? "border-red-500"
//                                                 : "border-gray-300"
//                                         }`}
//                                         placeholder="123 Main Street, City, State"
//                                     />
//                                     {formErrors.address && (
//                                         <p className="mt-1 text-sm text-red-600">
//                                             {formErrors.address}
//                                         </p>
//                                     )}
//                                 </div>

//                                 {/* Zip Code */}
//                                 <div>
//                                     <label
//                                         htmlFor="zip_code"
//                                         className="block text-sm font-medium text-gray-700 mb-2"
//                                     >
//                                         Zip Code *
//                                     </label>
//                                     <input
//                                         type="text"
//                                         id="zip_code"
//                                         name="zip_code"
//                                         value={bookingForm.zip_code}
//                                         onChange={handleFormChange}
//                                         required
//                                         className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
//                                             formErrors.zip_code
//                                                 ? "border-red-500"
//                                                 : "border-gray-300"
//                                         }`}
//                                         placeholder="6210"
//                                         maxLength="5"
//                                     />
//                                     {formErrors.zip_code ? (
//                                         <p className="mt-1 text-sm text-red-600">
//                                             {formErrors.zip_code}
//                                         </p>
//                                     ) : (
//                                         <p className="mt-1 text-sm text-gray-500">
//                                             Currently serving only areas with
//                                             zip code 6210
//                                         </p>
//                                     )}
//                                 </div>

//                                 {/* Test Location */}
//                                 <div>
//                                     <label
//                                         htmlFor="test_location"
//                                         className="block text-sm font-medium text-gray-700 mb-2"
//                                     >
//                                         Test Location *
//                                     </label>
//                                     <input
//                                         type="text"
//                                         id="test_location"
//                                         name="test_location"
//                                         value={bookingForm.test_location}
//                                         onChange={handleFormChange}
//                                         required
//                                         className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
//                                             formErrors.test_location
//                                                 ? "border-red-500"
//                                                 : "border-gray-300"
//                                         }`}
//                                         placeholder="Enter test location"
//                                     />
//                                     {formErrors.test_location && (
//                                         <p className="mt-1 text-sm text-red-600">
//                                             {formErrors.test_location}
//                                         </p>
//                                     )}
//                                 </div>

//                                 {/* Pickup Location with Same as Address button */}
//                                 <div>
//                                     <div className="flex justify-between items-center mb-2">
//                                         <label
//                                             htmlFor="pickup_location"
//                                             className="block text-sm font-medium text-gray-700"
//                                         >
//                                             Pickup Location *
//                                         </label>
//                                         <button
//                                             type="button"
//                                             onClick={setPickupSameAsAddress}
//                                             className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
//                                         >
//                                             Same as address
//                                         </button>
//                                     </div>
//                                     <input
//                                         type="text"
//                                         id="pickup_location"
//                                         name="pickup_location"
//                                         value={bookingForm.pickup_location}
//                                         onChange={handleFormChange}
//                                         required
//                                         className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
//                                             formErrors.pickup_location
//                                                 ? "border-red-500"
//                                                 : "border-gray-300"
//                                         }`}
//                                         placeholder="Enter pickup location"
//                                     />
//                                     {formErrors.pickup_location && (
//                                         <p className="mt-1 text-sm text-red-600">
//                                             {formErrors.pickup_location}
//                                         </p>
//                                     )}
//                                 </div>

//                                 {/* Dropoff Location with Same as Address button */}
//                                 <div>
//                                     <div className="flex justify-between items-center mb-2">
//                                         <label
//                                             htmlFor="dropoff_location"
//                                             className="block text-sm font-medium text-gray-700"
//                                         >
//                                             Dropoff Location *
//                                         </label>
//                                         <button
//                                             type="button"
//                                             onClick={setDropoffSameAsAddress}
//                                             className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
//                                         >
//                                             Same as address
//                                         </button>
//                                     </div>
//                                     <input
//                                         type="text"
//                                         id="dropoff_location"
//                                         name="dropoff_location"
//                                         value={bookingForm.dropoff_location}
//                                         onChange={handleFormChange}
//                                         required
//                                         className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
//                                             formErrors.dropoff_location
//                                                 ? "border-red-500"
//                                                 : "border-gray-300"
//                                         }`}
//                                         placeholder="Enter dropoff location"
//                                     />
//                                     {formErrors.dropoff_location && (
//                                         <p className="mt-1 text-sm text-red-600">
//                                             {formErrors.dropoff_location}
//                                         </p>
//                                     )}
//                                 </div>

//                                 {/* Submit Button */}
//                                 <div className="pt-4">
//                                     <button
//                                         type="submit"
//                                         disabled={submitting}
//                                         className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//                                     >
//                                         {submitting ? (
//                                             <div className="flex items-center justify-center">
//                                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                                                 Processing...
//                                             </div>
//                                         ) : (
//                                             "Confirm Booking"
//                                         )}
//                                     </button>
//                                 </div>
//                             </form>
//                         </div>
//                     )}

//                     {/* Order Summary Section */}
//                     <div>
//                         <div
//                             onClick={() =>
//                                 setShowOrderSummary(!showOrderSummary)
//                             }
//                             className="cursor-pointer select-none"
//                         >
//                             <div className="flex items-center justify-between">
//                                 <span className="text-gray-900 font-semibold text-lg">
//                                     Order Summary
//                                 </span>
//                                 <div className="flex items-center gap-3">
//                                     <span className="text-blue-600 font-bold text-lg">
//                                         ${price.price}
//                                     </span>
//                                     <ChevronDown
//                                         className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
//                                             showOrderSummary ? "rotate-180" : ""
//                                         }`}
//                                     />
//                                 </div>
//                             </div>

//                             {showOrderSummary && (
//                                 <div className="mt-5 pt-5 border-t border-gray-200 space-y-3">
//                                     {/* Selected booking recap */}
//                                     {(selectedDate || selectedTime) && (
//                                         <div className="bg-blue-50 rounded-xl p-3 mb-4 space-y-1">
//                                             {selectedDate && (
//                                                 <div className="flex items-center gap-2 text-xs text-blue-700">
//                                                     <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
//                                                     <span>
//                                                         {formatDisplayDate(
//                                                             selectedDate,
//                                                         )}
//                                                     </span>
//                                                 </div>
//                                             )}
//                                             {selectedTime && (
//                                                 <div className="flex items-center gap-2 text-xs text-blue-700">
//                                                     <Clock className="h-3.5 w-3.5 flex-shrink-0" />
//                                                     <span>
//                                                         {formatTimeForDisplay(
//                                                             selectedTime,
//                                                         )}
//                                                     </span>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     )}

//                                     <div className="space-y-4">
//                                         <div>
//                                             <h3 className="font-semibold text-gray-900 mb-1 text-base">
//                                                 {price.description}
//                                             </h3>
//                                             <p className="text-sm text-gray-600">
//                                                 Professional driving test
//                                                 preparation with certified
//                                                 instructors
//                                             </p>
//                                         </div>

//                                         <div className="border-t pt-4">
//                                             <div className="flex justify-between text-sm mb-2">
//                                                 <span className="text-gray-600">
//                                                     Operating Hours:
//                                                 </span>
//                                                 <span className="font-medium text-gray-900">
//                                                     7:00 AM - 6:00 PM
//                                                 </span>
//                                             </div>
//                                             <div className="flex justify-between text-sm mb-2">
//                                                 <span className="text-gray-600">
//                                                     Test Duration:
//                                                 </span>
//                                                 <span className="font-medium text-gray-900">
//                                                     {price.duration}
//                                                 </span>
//                                             </div>
//                                             <div className="flex justify-between text-sm mb-2">
//                                                 <span className="text-gray-600">
//                                                     Price:
//                                                 </span>
//                                                 <span className="font-medium text-gray-900">
//                                                     ${price.price}
//                                                 </span>
//                                             </div>

//                                             {selectedDate &&
//                                                 selectedTime &&
//                                                 isAvailable &&
//                                                 bookingDetails && (
//                                                     <>
//                                                         <div className="mt-4 pt-4 border-t">
//                                                             <div className="flex justify-between text-sm mb-2">
//                                                                 <span className="text-gray-600">
//                                                                     Total
//                                                                     Booking
//                                                                     Duration:
//                                                                 </span>
//                                                                 <span className="font-medium text-gray-900 text-right">
//                                                                     {formatTimeForDisplay(
//                                                                         bookingDetails.start_time,
//                                                                     )}{" "}
//                                                                     to{" "}
//                                                                     {formatTimeForDisplay(
//                                                                         bookingDetails.end_time,
//                                                                     )}
//                                                                 </span>
//                                                             </div>
//                                                             <div className="flex justify-between text-sm">
//                                                                 <span className="text-gray-600">
//                                                                     Actual Test
//                                                                     Time:
//                                                                 </span>
//                                                                 <span className="font-medium text-blue-600 text-right">
//                                                                     {formatTimeForDisplay(
//                                                                         selectedTime,
//                                                                     )}{" "}
//                                                                     (
//                                                                     {
//                                                                         price.duration
//                                                                     }
//                                                                     )
//                                                                 </span>
//                                                             </div>
//                                                         </div>
//                                                     </>
//                                                 )}
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Help Card */}
//                     {/* <div className="bg-blue-600 rounded-2xl p-5 text-white mt-4">
//             <h3 className="font-semibold text-base mb-2">Need help booking?</h3>
//             <p className="text-blue-100 text-sm leading-relaxed">
//               Choose a date and time slot, check availability, then complete the booking form below.
//             </p>
//           </div> */}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default TestCalendarIntegrationMobile;

import React, { useState, useEffect } from "react";
import {
    ChevronDown,
    MapPin,
    Calendar,
    Clock,
    BookOpen,
    CheckCircle,
    CalendarIcon,
    ChevronLeft,
    X,
    User,
    Mail,
    Phone,
    Home,
    MapPin as MapPinIcon,
} from "lucide-react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "@inertiajs/react";

const TestCalendarIntegrationMobile = ({ price }) => {
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [loading, setLoading] = useState(false);
    const [availabilityMessage, setAvailabilityMessage] = useState("");
    const [isAvailable, setIsAvailable] = useState(false);
    const [alternativeTimes, setAlternativeTimes] = useState([]);
    const [bookingDetails, setBookingDetails] = useState(null);
    const [timeError, setTimeError] = useState("");
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [showOrderSummary, setShowOrderSummary] = useState(false);
    const [saved, setSaved] = useState(false);
    const [allDates, setAllDates] = useState([]);

    // Booking form state
    const [bookingForm, setBookingForm] = useState({
        user_name: "",
        email: "",
        phone: "",
        address: "",
        zip_code: "",
        test_location: "Mandurah licensing center",
        pickup_location: "",
        dropoff_location: "",
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Function to set pickup location same as address
    const setPickupSameAsAddress = () => {
        if (bookingForm.address) {
            setBookingForm((prev) => ({
                ...prev,
                pickup_location: prev.address,
            }));
            if (formErrors.pickup_location) {
                setFormErrors((prev) => ({
                    ...prev,
                    pickup_location: "",
                }));
            }
            toast.success("Pickup location set to address");
        } else {
            toast.error("Please select an address first");
        }
    };

    // Function to set dropoff location same as address
    const setDropoffSameAsAddress = () => {
        if (bookingForm.address) {
            setBookingForm((prev) => ({
                ...prev,
                dropoff_location: prev.address,
            }));
            if (formErrors.dropoff_location) {
                setFormErrors((prev) => ({
                    ...prev,
                    dropoff_location: "",
                }));
            }
            toast.success("Dropoff location set to address");
        } else {
            toast.error("Please select an address first");
        }
    };

    // Generate available dates for the next 365 days (1 year) with month grouping
    useEffect(() => {
        const dates = [];
        const today = new Date();

        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            // Get month and year for grouping
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
                date: date,
                monthYear: monthYear,
            });
        }
        setAllDates(dates);
    }, []);

    // Group dates by monthYear
    const groupedDates = allDates.reduce((groups, date) => {
        const key = date.monthYear;
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(date);
        return groups;
    }, {});

    // Function to check if a date is in the past
    const isPastDate = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const compareDate = new Date(dateString);
        compareDate.setHours(0, 0, 0, 0);

        return compareDate < today;
    };

    const formatDateKey = (date) => {
        if (!date) return "";
        return date;
    };

    const formatDisplayDate = (dateString) => {
        if (!dateString) return "Select a date";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-AU", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Parse duration to minutes
    const parseDuration = (durationString) => {
        if (!durationString) return 60;

        const cleanString = durationString.trim().toLowerCase();

        // Extract hours and minutes using regex
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

    // Format time for display (convert 24h to 12h format)
    const formatTimeForDisplay = (time24) => {
        if (!time24) return "";
        const [hours, minutes] = time24.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
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
        if (selectedDate && !isPastDate(selectedDate) && price) {
            fetchAvailableTimeSlots();
        } else {
            setAvailableTimeSlots([]);
        }
    }, [selectedDate, price]);

    const fetchAvailableTimeSlots = async () => {
        if (!price) return;

        setLoadingSlots(true);
        try {
            const response = await axios.get(
                route("test-packages.available-slots"),
                {
                    params: {
                        date: selectedDate,
                        price_id: price.id,
                        duration_minutes: parseDuration(price.duration),
                    },
                },
            );

            if (response.data.success) {
                setAvailableTimeSlots(response.data.available_slots);
                toast.success(
                    `Found ${response.data.available_slots.length} available slots`,
                    {
                        duration: 3000,
                    },
                );
            } else {
                setAvailableTimeSlots([]);
                toast.error("No available slots found for this date");
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
        if (!price) {
            setAvailabilityMessage("Price information not available");
            setIsAvailable(false);
            toast.error("Price information not available");
            return;
        }

        if (!selectedDate || !selectedTime) {
            setAvailabilityMessage("Please select both date and time");
            setIsAvailable(false);
            toast.error("Please select both date and time");
            return;
        }

        // Validate time format
        if (!validateTimeFormat(selectedTime)) {
            setTimeError("Please enter a valid time in HH:MM format");
            setIsAvailable(false);
            toast.error("Please enter a valid time in HH:MM format");
            return;
        }

        setLoading(true);
        setAvailabilityMessage("");
        setAlternativeTimes([]);
        setTimeError("");

        const loadingToast = toast.loading("Checking availability...");

        try {
            const formattedTime = formatTimeForApi(selectedTime);

            const response = await axios.post(
                route("test-packages.check-availability"),
                {
                    date: selectedDate,
                    test_time: formattedTime,
                    duration_minutes: parseDuration(price.duration),
                    price_id: price.id,
                },
            );

            toast.dismiss(loadingToast);

            if (response.data.available) {
                setIsAvailable(true);
                setBookingDetails({
                    start_time: response.data.start_time,
                    end_time: response.data.end_time,
                    buffer_start: response.data.start_time,
                    buffer_end: response.data.end_time,
                });
                setAvailabilityMessage(
                    "✓ This time slot is available! You can proceed to book.",
                );
                toast.success(
                    "Time slot is available! You can proceed to book.",
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
                    toast.error(
                        "Selected time not available. Check suggested times below.",
                        {
                            duration: 5000,
                        },
                    );
                } else {
                    message +=
                        "\n\nNo alternative times available for this duration.";
                    toast.error(
                        "Time slot not available. Please contact us for assistance.",
                        {
                            duration: 5000,
                        },
                    );
                }

                message += "\n\nPlease contact us for assistance.";
                setAvailabilityMessage(message);
            }
        } catch (error) {
            console.error("Error checking availability:", error);
            toast.dismiss(loadingToast);
            setIsAvailable(false);

            // Check if it's a validation error
            if (error.response && error.response.status === 422) {
                const errors = error.response.data.errors;
                if (errors && errors.test_time) {
                    setAvailabilityMessage(
                        `Validation error: ${errors.test_time[0]}`,
                    );
                    setTimeError(errors.test_time[0]);
                    toast.error(errors.test_time[0]);
                } else if (errors && errors.price_id) {
                    setAvailabilityMessage(
                        `Validation error: ${errors.price_id[0]}`,
                    );
                    toast.error(errors.price_id[0]);
                } else {
                    setAvailabilityMessage(
                        "Please check the time format (HH:MM) and try again.",
                    );
                    toast.error(
                        "Please check the time format (HH:MM) and try again.",
                    );
                }
            } else {
                setAvailabilityMessage(
                    "Error checking availability. Please try again.",
                );
                toast.error("Error checking availability. Please try again.");
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
        toast.success(`Selected time: ${formatTimeForDisplay(time24)}`, {
            duration: 2000,
        });
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

    // Handle form input changes
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setBookingForm((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    // Validate zip code - only allow 6210
    const validateZipCode = (zip) => {
        const cleanZip = zip.replace(/\D/g, "");
        return cleanZip === "6210";
    };

    // Extract package name from price description
    const extractPackageName = (description) => {
        if (!description) return "";
        if (description.includes(":")) {
            return description.split(":").pop().trim();
        }
        return description.trim();
    };

    // Calculate end time
    const calculateEndTime = (startTime, durationString) => {
        const durationMinutes = parseDuration(durationString);
        const [hours, minutes] = startTime.split(":").map(Number);
        const totalMinutes = hours * 60 + minutes + durationMinutes;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${String(endHours).padStart(2, "0")}:${String(
            endMinutes,
        ).padStart(2, "0")}`;
    };

    // Handle booking submission
    const handleBookingSubmit = async (e) => {
        e.preventDefault();

        if (!isAvailable || !bookingDetails) {
            toast.error("Please check availability first");
            return;
        }

        // Validate required fields
        const requiredFields = [
            "user_name",
            "email",
            "phone",
            "address",
            "zip_code",
            "pickup_location",
            "dropoff_location",
        ];
        const newErrors = {};

        requiredFields.forEach((field) => {
            if (!bookingForm[field]?.trim()) {
                newErrors[field] = `${field.replace("_", " ")} is required`;
            }
        });

        // Validate email format
        if (bookingForm.email && !/\S+@\S+\.\S+/.test(bookingForm.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Validate zip code
        if (bookingForm.zip_code && !validateZipCode(bookingForm.zip_code)) {
            newErrors.zip_code =
                "Sorry, we currently only serve areas with zip code 6210";
        }

        if (Object.keys(newErrors).length > 0) {
            setFormErrors(newErrors);
            toast.error("Please fill in all required fields correctly");
            return;
        }

        setSubmitting(true);
        setFormErrors({});

        const submittingToast = toast.loading("Processing your booking...");

        try {
            const durationMinutes = parseDuration(price.duration);
            const fullAddress = `${bookingForm.address}, ${bookingForm.zip_code}`;
            const packageName = extractPackageName(price.description);

            const bookingData = {
                user_name: bookingForm.user_name,
                email: bookingForm.email,
                phone: bookingForm.phone,
                address: fullAddress,
                reservation_date: selectedDate,
                price_id: price.id,
                duration_minutes: durationMinutes,
                start_time: bookingDetails.start_time,
                end_time: bookingDetails.end_time,
                test_time: selectedTime,
                test_location: bookingForm.test_location,
                pickup_location: bookingForm.pickup_location,
                dropoff_location: bookingForm.dropoff_location,
                test_type: packageName,
            };

            const response = await axios.post(
                route("test-packages.store"),
                bookingData,
            );

            toast.dismiss(submittingToast);

            if (response.data.success || response.data.message) {
                toast.success("Test package booked successfully! Please check your Spam email for booking details.", {
                    duration: 5000,
                });

                // Reset form
                setSelectedDate("");
                setSelectedTime("");
                setAvailabilityMessage("");
                setIsAvailable(false);
                setAlternativeTimes([]);
                setBookingDetails(null);
                setTimeError("");
                setBookingForm({
                    user_name: "",
                    email: "",
                    phone: "",
                    address: "",
                    zip_code: "",
                    test_location: "Mandurah licensing center",
                    pickup_location: "",
                    dropoff_location: "",
                });

                setSaved(true);
                setTimeout(() => setSaved(false), 2500);

                // Refresh available slots
                if (price) {
                    fetchAvailableTimeSlots();
                }
            } else {
                toast.error(
                    "Error confirming booking: " + response.data.message,
                );
            }
        } catch (error) {
            console.error("Booking error:", error);
            toast.dismiss(submittingToast);

            if (error.response?.data?.errors) {
                setFormErrors(error.response.data.errors);
                toast.error("Please fix the errors in the form.");
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Error confirming booking. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Set min and max times for the time input - with null check for price
    const getMinTime = () => {
        return "07:00"; // 7:00 AM (working hours start)
    };

    const getMaxTime = () => {
        if (!price) {
            return "17:00"; // Default to 5:00 PM
        }

        const durationMinutes = parseDuration(price.duration);
        const workingEnd = 18; // 6:00 PM

        const maxTestStartTime = new Date();
        maxTestStartTime.setHours(workingEnd, 0 - durationMinutes, 0, 0);

        if (maxTestStartTime.getHours() < 7) {
            return "07:00";
        }

        return (
            maxTestStartTime.getHours().toString().padStart(2, "0") +
            ":" +
            maxTestStartTime.getMinutes().toString().padStart(2, "0")
        );
    };

    // Show loading state if price is not available
    if (!price) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">
                        Loading price information...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
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
                        iconTheme: {
                            primary: "#fff",
                            secondary: "#10b981",
                        },
                    },
                    error: {
                        duration: 4000,
                        style: {
                            background: "#ef4444",
                            color: "#fff",
                        },
                        iconTheme: {
                            primary: "#fff",
                            secondary: "#ef4444",
                        },
                    },
                    loading: {
                        duration: 5000,
                        style: {
                            background: "#3b82f6",
                            color: "#fff",
                        },
                    },
                }}
            />

            <div className="max-w-screen-lg mx-auto px-4 py-6">
                {/* Back Button */}
                <Link
                    href={"/"}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ChevronLeft size={20} />
                    <span className="font-medium">Back</span>
                </Link>

                {/* Page Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-gray-900 ml-6">
                            Schedule Your Test Package
                        </h1>
                    </div>
                    <p className="text-gray-500 text-sm ml-6">
                        Choose your date and time. Operating hours: 7:00 AM -
                        6:00 PM
                    </p>
                </div>

                {/* Main Layout - Stacked on Mobile */}
                <div className="flex flex-col gap-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    {/* Date Selection Section */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Select Test Date
                        </h2>
                        <p className="text-xs text-gray-500 mb-4">
                            Time zone: Australian Western Standard Time (GMT+8)
                        </p>

                        {/* Date Dropdown with Month Groups */}
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                            <select
                                value={selectedDate}
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    setSelectedTime("");
                                    setAvailabilityMessage("");
                                    setIsAvailable(false);
                                    setAlternativeTimes([]);
                                    setTimeError("");
                                }}
                                className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 pl-10 pr-10 transition"
                            >
                                <option value="">Select a date</option>
                                {Object.entries(groupedDates).map(
                                    ([monthYear, dates]) => (
                                        <optgroup
                                            key={monthYear}
                                            label={`── ${monthYear} ──`}
                                            className="font-semibold text-gray-700"
                                        >
                                            {dates.map((date, i) => (
                                                <option
                                                    key={i}
                                                    value={date.value}
                                                    disabled={isPastDate(
                                                        date.value,
                                                    )}
                                                    className="py-1"
                                                >
                                                    {date.display}{" "}
                                                    {isPastDate(date.value)
                                                        ? "(Past)"
                                                        : ""}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ),
                                )}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        </div>

                        {selectedDate && (
                            <p className="text-sm text-gray-600 mt-3">
                                Selected: {formatDisplayDate(selectedDate)}
                            </p>
                        )}
                    </div>

                    {/* Time Selection Section */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Select Test Time
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                            {selectedDate
                                ? formatDisplayDate(selectedDate)
                                : "Please select a date first"}
                        </p>

                        {/* Available Time Slots Dropdown */}
                        {availableTimeSlots.length > 0 && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quick Select Available Times
                                </label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                                    <select
                                        onChange={(e) =>
                                            handleTimeSelect(e.target.value)
                                        }
                                        value={selectedTime}
                                        className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 pl-10 pr-10 transition"
                                    >
                                        <option value="">
                                            Choose a time...
                                        </option>
                                        {availableTimeSlots.map(
                                            (slot, index) => (
                                                <option
                                                    key={index}
                                                    value={slot.time}
                                                >
                                                    {slot.formatted}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {availableTimeSlots.length} available slots
                                </p>
                            </div>
                        )}

                        {loadingSlots && (
                            <div className="text-center py-2 mb-4">
                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-sm text-gray-600 ml-2">
                                    Loading available slots...
                                </span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Test Start Time (24-hour format) *
                                </label>
                                <p className="text-xs text-gray-500 mb-2">
                                    Operating hours: 7:00 AM - 6:00 PM
                                </p>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                                    <input
                                        type="time"
                                        value={selectedTime}
                                        onChange={handleTimeChange}
                                        disabled={
                                            !selectedDate ||
                                            isPastDate(selectedDate)
                                        }
                                        min={getMinTime()}
                                        max={getMaxTime()}
                                        step="1800"
                                        className={`w-full bg-gray-50 border ${timeError ? "border-red-300" : "border-gray-300"} text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 pl-10 pr-3 transition disabled:opacity-50 disabled:cursor-not-allowed`}
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
                                disabled={
                                    !selectedTime || loading || !selectedDate
                                }
                                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 text-sm ${
                                    selectedTime && !loading && selectedDate
                                        ? "bg-blue-600 hover:bg-blue-700 text-white"
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
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                <h4 className="font-medium text-blue-800 mb-2">
                                    Suggested Available Times:
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {alternativeTimes.map((slot, index) => (
                                        <button
                                            key={index}
                                            onClick={() =>
                                                handleTimeSelect(
                                                    slot.time || slot,
                                                )
                                            }
                                            className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm transition-colors"
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
                                className={`mt-6 p-4 rounded-xl ${
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
                                            <CheckCircle className="h-5 w-5" />
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
                                    <div
                                        className={`ml-3 text-sm ${
                                            isAvailable
                                                ? "text-green-800"
                                                : "text-red-800"
                                        } whitespace-pre-line`}
                                    >
                                        <p>{availabilityMessage}</p>

                                        {!isAvailable && (
                                            <div className="mt-2">
                                                <p>
                                                    Phone:{" "}
                                                    <a
                                                        href="tel:0481488216"
                                                        className="text-blue-600 underline hover:text-blue-800"
                                                    >
                                                        0481488216
                                                    </a>
                                                </p>
                                                <p>
                                                    Email:{" "}
                                                    <a
                                                        href="mailto:Wheelmaster@outlook.com.au"
                                                        className="text-blue-600 underline hover:text-blue-800"
                                                    >
                                                        Wheelmaster@outlook.com.au
                                                    </a>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Booking Form Section - Only shown when time is available */}
                    {isAvailable && bookingDetails && (
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                Complete Your Booking
                            </h2>

                            <form
                                onSubmit={handleBookingSubmit}
                                className="space-y-6"
                            >
                                {/* User Name */}
                                <div>
                                    <label
                                        htmlFor="user_name"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Full Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            id="user_name"
                                            name="user_name"
                                            value={bookingForm.user_name}
                                            onChange={handleFormChange}
                                            required
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                                formErrors.user_name
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    {formErrors.user_name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {formErrors.user_name}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={bookingForm.email}
                                            onChange={handleFormChange}
                                            required
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                                formErrors.email
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    {formErrors.email && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {formErrors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Phone Number *
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={bookingForm.phone}
                                            onChange={handleFormChange}
                                            required
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                                formErrors.phone
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                            placeholder="+61 4XX XXX XXX"
                                        />
                                    </div>
                                    {formErrors.phone && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {formErrors.phone}
                                        </p>
                                    )}
                                </div>

                                {/* Address - Dropdown */}
                                <div>
                                    <label
                                        htmlFor="address"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Address *
                                    </label>
                                    <div className="relative">
                                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                        <select
                                            id="address"
                                            name="address"
                                            value={bookingForm.address}
                                            onChange={handleFormChange}
                                            required
                                            className={`w-full appearance-none pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white ${
                                                formErrors.address
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            <option value="">
                                                Select your Address
                                            </option>
                                            <option value="mandurah">
                                                Mandurah
                                            </option>
                                            <option value="meadow-springs">
                                                Meadow Springs
                                            </option>
                                            <option value="silver-sands">
                                                Silver Sands
                                            </option>
                                            <option value="lakelands">
                                                Lakelands
                                            </option>
                                            <option value="dudley-park">
                                                Dudley Park
                                            </option>
                                            <option value="halls-head">
                                                Halls Head
                                            </option>
                                            <option value="madora-bay">
                                                Madora Bay
                                            </option>
                                            <option value="greenfields">
                                                Greenfields
                                            </option>
                                            <option value="erskine">
                                                Erskine
                                            </option>
                                            <option value="midpoint-mandurah-dot">
                                                Midpoint Mandurah Dot
                                            </option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                    </div>
                                    {formErrors.address && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {formErrors.address}
                                        </p>
                                    )}
                                </div>

                                {/* Zip Code */}
                                <div>
                                    <label
                                        htmlFor="zip_code"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Zip Code *
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            id="zip_code"
                                            name="zip_code"
                                            value={bookingForm.zip_code}
                                            onChange={handleFormChange}
                                            required
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                                formErrors.zip_code
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                            placeholder="6210"
                                            maxLength="5"
                                        />
                                    </div>
                                    {formErrors.zip_code ? (
                                        <p className="mt-1 text-sm text-red-600">
                                            {formErrors.zip_code}
                                        </p>
                                    ) : (
                                        // <p className="mt-1 text-sm text-gray-500">
                                        //     Currently serving only areas with
                                        //     zip code 6210
                                        // </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Currently serving only areas with
                                            zip code 6210.
                                            {bookingForm.address !==
                                                "midpoint-mandurah-dot" && (
                                                <span className="block">
                                                    If your address is not
                                                    available, please select
                                                    "Midpoint Mandurah Dot".
                                                </span>
                                            )}
                                        </p>
                                    )}
                                </div>

                                {/* Test Location */}
                                <div>
                                    <label
                                        htmlFor="test_location"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Test Location *
                                    </label>
                                    <div className="relative">
                                        <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            id="test_location"
                                            name="test_location"
                                            value={bookingForm.test_location}
                                            onChange={handleFormChange}
                                            required
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                                formErrors.test_location
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                            placeholder="Enter test location"
                                        />
                                    </div>
                                    {formErrors.test_location && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {formErrors.test_location}
                                        </p>
                                    )}
                                </div>

                                {/* Pickup Location with Same as Address button */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label
                                            htmlFor="pickup_location"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Pickup Location *
                                        </label>
                                        <button
                                            type="button"
                                            onClick={setPickupSameAsAddress}
                                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                                        >
                                            Same as address
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            id="pickup_location"
                                            name="pickup_location"
                                            value={bookingForm.pickup_location}
                                            onChange={handleFormChange}
                                            required
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                                formErrors.pickup_location
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                            placeholder="Enter pickup location"
                                        />
                                    </div>
                                    {formErrors.pickup_location && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {formErrors.pickup_location}
                                        </p>
                                    )}
                                </div>

                                {/* Dropoff Location with Same as Address button */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label
                                            htmlFor="dropoff_location"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Dropoff Location *
                                        </label>
                                        <button
                                            type="button"
                                            onClick={setDropoffSameAsAddress}
                                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                                        >
                                            Same as address
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            id="dropoff_location"
                                            name="dropoff_location"
                                            value={bookingForm.dropoff_location}
                                            onChange={handleFormChange}
                                            required
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                                formErrors.dropoff_location
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                            placeholder="Enter dropoff location"
                                        />
                                    </div>
                                    {formErrors.dropoff_location && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {formErrors.dropoff_location}
                                        </p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Processing...
                                            </div>
                                        ) : (
                                            "Confirm Booking"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Order Summary Section */}
                    <div>
                        <div
                            onClick={() =>
                                setShowOrderSummary(!showOrderSummary)
                            }
                            className="cursor-pointer select-none"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-gray-900 font-semibold text-lg">
                                    Order Summary
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className="text-blue-600 font-bold text-lg">
                                        ${price.price}
                                    </span>
                                    <ChevronDown
                                        className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                                            showOrderSummary ? "rotate-180" : ""
                                        }`}
                                    />
                                </div>
                            </div>

                            {showOrderSummary && (
                                <div className="mt-5 pt-5 border-t border-gray-200 space-y-3">
                                    {/* Selected booking recap */}
                                    {(selectedDate || selectedTime) && (
                                        <div className="bg-blue-50 rounded-xl p-3 mb-4 space-y-1">
                                            {selectedDate && (
                                                <div className="flex items-center gap-2 text-xs text-blue-700">
                                                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                                    <span>
                                                        {formatDisplayDate(
                                                            selectedDate,
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            {selectedTime && (
                                                <div className="flex items-center gap-2 text-xs text-blue-700">
                                                    <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                                                    <span>
                                                        {formatTimeForDisplay(
                                                            selectedTime,
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1 text-base">
                                                {price.description}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Professional driving test
                                                preparation with certified
                                                instructors
                                            </p>
                                        </div>

                                        <div className="border-t pt-4">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-600">
                                                    Operating Hours:
                                                </span>
                                                <span className="font-medium text-gray-900">
                                                    7:00 AM - 6:00 PM
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-600">
                                                    Test Duration:
                                                </span>
                                                <span className="font-medium text-gray-900">
                                                    {price.duration}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm mb-2">
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
                                                            <div className="flex justify-between text-sm mb-2">
                                                                <span className="text-gray-600">
                                                                    Total
                                                                    Booking
                                                                    Duration:
                                                                </span>
                                                                <span className="font-medium text-gray-900 text-right">
                                                                    {formatTimeForDisplay(
                                                                        bookingDetails.start_time,
                                                                    )}{" "}
                                                                    to{" "}
                                                                    {formatTimeForDisplay(
                                                                        bookingDetails.end_time,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">
                                                                    Actual Test
                                                                    Time:
                                                                </span>
                                                                <span className="font-medium text-blue-600 text-right">
                                                                    {formatTimeForDisplay(
                                                                        selectedTime,
                                                                    )}{" "}
                                                                    (
                                                                    {
                                                                        price.duration
                                                                    }
                                                                    )
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestCalendarIntegrationMobile;
