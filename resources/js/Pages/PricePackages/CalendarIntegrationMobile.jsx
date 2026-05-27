// import React, { useState, useEffect, useCallback, useRef } from "react";
// import {
//     ChevronDown,
//     MapPin,
//     Calendar as CalendarIcon,
//     Clock,
//     User,
//     Mail,
//     Phone,
//     Home,
//     MapPin as MapPinIcon,
//     ChevronLeft,
// } from "lucide-react";
// import axios from "axios";
// import toast, { Toaster } from "react-hot-toast";
// import { Link } from "@inertiajs/react";

// const CalendarIntegrationMobile = ({ price }) => {
//     const [selectedDate, setSelectedDate] = useState("");
//     const [selectedTime, setSelectedTime] = useState("");

//     // Form fields
//     const [formData, setFormData] = useState({
//         user_name: "",
//         email: "",
//         phone: "",
//         address: "",
//         zip_code: "",
//         pickup_location: "",
//         dropoff_location: "",
//     });

//     const [errors, setErrors] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [submitting, setSubmitting] = useState(false);

//     // Time slots state
//     const [timeSlots, setTimeSlots] = useState({});
//     const [showNextAvailability, setShowNextAvailability] = useState(false);
//     const [nextAvailableDates, setNextAvailableDates] = useState([]);
//     const [allDates, setAllDates] = useState([]);
//     const [loadingDates, setLoadingDates] = useState({}); // Track which dates are loading

//     // Format date as YYYY-MM-DD for API calls
//     const formatDateKey = (date) => {
//         if (!date) return "";
//         const d = new Date(date);
//         const year = d.getFullYear();
//         const month = String(d.getMonth() + 1).padStart(2, "0");
//         const day = String(d.getDate()).padStart(2, "0");
//         return `${year}-${month}-${day}`;
//     };

//     // Parse duration from price
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

//     // Calculate end time based on start time and duration
//     const calculateEndTime = (startTime, durationString) => {
//         const durationMinutes = parseDuration(durationString);

//         let cleanStartTime = startTime;
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

//     // Format duration for display
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

//     // Function to set pickup location same as address
//     const setPickupSameAsAddress = () => {
//         if (formData.address) {
//             setFormData((prev) => ({
//                 ...prev,
//                 pickup_location: prev.address,
//             }));
//             if (errors.pickup_location) {
//                 setErrors((prev) => ({
//                     ...prev,
//                     pickup_location: "",
//                 }));
//             }
//             toast.success("Pickup location set to address");
//         } else {
//             toast.error("Please select an address first");
//         }
//     };

//     // Function to set dropoff location same as pickup location
//     const setDropoffSameAsPickup = () => {
//         if (formData.pickup_location) {
//             setFormData((prev) => ({
//                 ...prev,
//                 dropoff_location: prev.pickup_location,
//             }));
//             if (errors.dropoff_location) {
//                 setErrors((prev) => ({
//                     ...prev,
//                     dropoff_location: "",
//                 }));
//             }
//             toast.success("Dropoff location set to pickup location");
//         } else {
//             toast.error("Please enter a pickup location first");
//         }
//     };

//     // The backend already filters slots by package duration, buffer, blocks, and reservations.
//     const getNonOverlappingSlots = (slots) => {
//         if (!slots || slots.length === 0) return [];
//         const durationMinutes = parseDuration(price?.duration);
//         const slotStepMinutes = 20;
//         const bookingStepMinutes = durationMinutes + slotStepMinutes;
//         const workingHoursStart = 7 * 60;
//         const workingHoursEnd = 18 * 60;

//         const timeToMinutes = (timeStr) => {
//             const [h, m] = timeStr.split(":").map(Number);
//             return h * 60 + m;
//         };

//         const minutesToTime = (minutes) => {
//             const hours = Math.floor(minutes / 60);
//             const mins = minutes % 60;
//             return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
//         };

//         const sortedSlotMinutes = [...slots]
//             .map((slot) => {
//                 let startTime =
//                     typeof slot === "string" ? slot : slot?.start_time;
//                 if (startTime?.includes(":")) {
//                     const parts = startTime.split(":");
//                     startTime = `${parts[0]}:${parts[1]}`;
//                 }
//                 return timeToMinutes(startTime);
//             })
//             .sort((a, b) => a - b);

//         const availableStartTimes = new Set(
//             sortedSlotMinutes.map((minutes) => minutesToTime(minutes)),
//         );

//         const isBookableCandidate = (startMinutes) => {
//             const bufferEndMinutes = startMinutes + bookingStepMinutes;
//             if (bufferEndMinutes > workingHoursEnd) return false;

//             const floorSlot =
//                 workingHoursStart +
//                 Math.floor(
//                     (startMinutes - workingHoursStart) / slotStepMinutes,
//                 ) *
//                     slotStepMinutes;
//             const ceilSlot =
//                 workingHoursStart +
//                 Math.ceil(
//                     (startMinutes - workingHoursStart) / slotStepMinutes,
//                 ) *
//                     slotStepMinutes;
//             const latestGridStart = workingHoursEnd - bookingStepMinutes;

//             if (!availableStartTimes.has(minutesToTime(floorSlot))) {
//                 return false;
//             }

//             if (
//                 ceilSlot !== floorSlot &&
//                 ceilSlot <= latestGridStart &&
//                 !availableStartTimes.has(minutesToTime(ceilSlot))
//             ) {
//                 return false;
//             }

//             return true;
//         };

//         const displaySlots = [];
//         let candidateMinutes = sortedSlotMinutes[0];

//         while (candidateMinutes + bookingStepMinutes <= workingHoursEnd) {
//             if (isBookableCandidate(candidateMinutes)) {
//                 displaySlots.push(minutesToTime(candidateMinutes));
//                 candidateMinutes += bookingStepMinutes;
//             } else {
//                 candidateMinutes += slotStepMinutes;
//             }
//         }

//         return displaySlots;
//     };

//     // Format time slot for display
//     const getTimeSlotDisplay = (slot) => {
//         let startTimeStr = typeof slot === "string" ? slot : slot?.start_time;
//         if (startTimeStr?.includes(":")) {
//             const parts = startTimeStr.split(":");
//             startTimeStr = `${parts[0]}:${parts[1]}`;
//         }

//         const endTimeStr = calculateEndTime(startTimeStr, price?.duration);

//         const formatTo12Hour = (time) => {
//             const [hours, minutes] = time.split(":");
//             const h = parseInt(hours);
//             const period = h >= 12 ? "PM" : "AM";
//             const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
//             return `${h12}:${minutes} ${period}`;
//         };

//         return `${formatTo12Hour(startTimeStr)} - ${formatTo12Hour(endTimeStr)}`;
//     };

//     // Check if date is in the past
//     const isPastDate = (dateString) => {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         const compareDate = new Date(dateString);
//         compareDate.setHours(0, 0, 0, 0);

//         return compareDate < today;
//     };

//     // Generate available dates for the next 365 days
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
//                 date: date,
//                 monthYear: monthYear,
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

//     // Fetch time slots for a specific date (lazy loading)
//     const fetchSlotsForDate = useCallback(
//         async (dateKey) => {
//             // Don't fetch if already have slots or currently loading
//             if (timeSlots[dateKey] || loadingDates[dateKey]) return;

//             // Don't fetch past dates
//             if (isPastDate(dateKey)) return;

//             try {
//                 // Mark this date as loading
//                 setLoadingDates((prev) => ({ ...prev, [dateKey]: true }));

//                 const response = await axios.get(route("ourtimeslots.get"), {
//                     params: {
//                         date: dateKey,
//                         price_id: price.id,
//                     },
//                 });

//                 if (response.data.success) {
//                     const availableSlots = response.data.slots
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

//                     setTimeSlots((prev) => ({
//                         ...prev,
//                         [dateKey]: availableSlots,
//                     }));
//                 }
//             } catch (err) {
//                 console.error(`Error fetching slots for ${dateKey}:`, err);
//                 // Set empty slots for this date to avoid retrying
//                 setTimeSlots((prev) => ({
//                     ...prev,
//                     [dateKey]: [],
//                 }));
//             } finally {
//                 setLoadingDates((prev) => ({ ...prev, [dateKey]: false }));
//             }
//         },
//         [price?.id, timeSlots, loadingDates],
//     );

//     // Fetch slots when user scrolls through dropdown (visible dates)
//     const handleDropdownOpen = useCallback(() => {
//         // Fetch slots for the next 30 days when dropdown opens
//         const next30Days = allDates.slice(0, 30);
//         next30Days.forEach((dateObj) => {
//             fetchSlotsForDate(dateObj.value);
//         });
//     }, [allDates, fetchSlotsForDate]);

//     // Fetch time slots for selected date
//     useEffect(() => {
//         const fetchTimeSlotsForSelected = async () => {
//             if (!selectedDate || !price?.id) return;

//             // Fetch slots for this specific date
//             await fetchSlotsForDate(selectedDate, true);
//             setSelectedTime("");
//         };

//         fetchTimeSlotsForSelected();
//     }, [selectedDate, price?.id, fetchSlotsForDate]);

//     // Get time slots for selected date
//     const getTimeSlotsForDate = (date) => {
//         if (!date) return [];
//         return timeSlots[date] || [];
//     };

//     // Find next available dates (optimized with cache)
//     const findNextAvailableDates = async () => {
//         try {
//             const availableDates = [];
//             const today = new Date();

//             for (let i = 1; i <= 30; i++) {
//                 const nextDate = new Date(today);
//                 nextDate.setDate(today.getDate() + i);
//                 const dateKey = formatDateKey(nextDate);

//                 // Check cache first
//                 let availableSlots = timeSlots[dateKey];

//                 if (!availableSlots) {
//                     try {
//                         const response = await axios.get(
//                             route("ourtimeslots.get"),
//                             {
//                                 params: {
//                                     date: dateKey,
//                                     price_id: price.id,
//                                 },
//                             },
//                         );

//                         if (response.data.success) {
//                             availableSlots = response.data.slots
//                                 .filter((slot) => slot.status === "available")
//                                 .map((slot) => {
//                                     const startTime = slot.start_time;
//                                     if (
//                                         typeof startTime === "string" &&
//                                         startTime.includes(":")
//                                     ) {
//                                         const parts = startTime.split(":");
//                                         return `${parts[0]}:${parts[1]}`;
//                                     }
//                                     return startTime;
//                                 });

//                             // Cache the result
//                             setTimeSlots((prev) => ({
//                                 ...prev,
//                                 [dateKey]: availableSlots,
//                             }));
//                         }
//                     } catch (err) {
//                         console.error(
//                             `Error fetching slots for ${dateKey}:`,
//                             err,
//                         );
//                         continue;
//                     }
//                 }

//                 if (availableSlots && availableSlots.length > 0) {
//                     availableDates.push(nextDate);
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

//     // Handle next availability click
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

//     // Handle selecting a next available date
//     const handleSelectNextAvailableDate = (date) => {
//         const formattedDate = date.toLocaleDateString("en-AU", {
//             weekday: "short",
//             day: "2-digit",
//             month: "short",
//             year: "numeric",
//         });
//         setSelectedDate(formatDateKey(date));
//         setSelectedTime("");
//         setShowNextAvailability(false);
//         toast.success(`Selected date: ${formattedDate}`);
//     };

//     // Handle form input changes
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//         if (errors[name]) {
//             setErrors((prev) => ({
//                 ...prev,
//                 [name]: "",
//             }));
//         }
//     };

//     // Validate zip code - allow 6210, 6180, 6175
//     const validateZipCode = (zip) => {
//         const cleanZip = zip.replace(/\D/g, "");
//         return ["6210", "6180", "6175"].includes(cleanZip);
//     };

//     // Handle form submission
//     const handleSubmit = async (e) => {
//         e.preventDefault();

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
//             if (!formData[field]?.trim()) {
//                 newErrors[field] = `${field.replace("_", " ")} is required`;
//             }
//         });

//         if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
//             newErrors.email = "Please enter a valid email address";
//         }

//         if (formData.zip_code && !validateZipCode(formData.zip_code)) {
//             newErrors.zip_code =
//                 "Sorry, we currently only serve areas with zip codes 6210, 6180, or 6175";
//         }

//         if (!selectedDate) {
//             toast.error("Please select a date");
//             return;
//         }

//         if (!selectedTime) {
//             toast.error("Please select a time slot");
//             return;
//         }

//         if (Object.keys(newErrors).length > 0) {
//             setErrors(newErrors);
//             toast.error("Please fill in all required fields correctly");
//             return;
//         }

//         setSubmitting(true);

//         try {
//             const durationMinutes = parseDuration(price.duration);
//             const fullAddress = `${formData.address}, ${formData.zip_code}`;

//             const extractPackageName = (description) => {
//                 if (!description) return "";
//                 if (description.includes(":")) {
//                     return description.split(":").pop().trim();
//                 }
//                 return description.trim();
//             };

//             const packageName = extractPackageName(price.description);

//             const bookingData = {
//                 user_name: formData.user_name,
//                 email: formData.email,
//                 phone: formData.phone,
//                 address: fullAddress,
//                 reservation_date: selectedDate,
//                 price_id: price.id,
//                 duration_minutes: durationMinutes,
//                 start_time: selectedTime,
//                 end_time: calculateEndTime(selectedTime, price.duration),
//                 package_type: packageName,
//                 package_price: price.price,
//                 pickup_location: formData.pickup_location,
//                 dropoff_location: formData.dropoff_location,
//             };

//             const response = await axios.post(
//                 route("ourreservations.store"),
//                 bookingData,
//             );

//             if (response.data.success || response.data.message) {
//                 toast.success(
//                     "Booking confirmed successfully! Please check your Spam email for booking details.",
//                 );

//                 setFormData({
//                     user_name: "",
//                     email: "",
//                     phone: "",
//                     address: "",
//                     zip_code: "",
//                     pickup_location: "",
//                     dropoff_location: "",
//                 });
//                 setSelectedDate("");
//                 setSelectedTime("");

//                 setTimeout(() => {
//                     window.location.reload();
//                 }, 2000);
//             }
//         } catch (error) {
//             console.error("Booking error:", error);

//             if (error.response?.data?.errors) {
//                 setErrors(error.response.data.errors);
//                 toast.error("Please fix the errors in the form");
//             } else if (error.response?.data?.message) {
//                 toast.error(error.response.data.message);
//             } else {
//                 toast.error("Error confirming booking. Please try again.");
//             }
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     const currentTimeSlots = getTimeSlotsForDate(selectedDate);
//     const nonOverlappingSlots = getNonOverlappingSlots(currentTimeSlots);

//     return (
//         <div className="min-h-screen bg-gray-100 py-6 px-4 lg:py-12">
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
//                 }}
//             />

//             <div className="max-w-3xl mx-auto">
//                 <Link
//                     href={"/"}
//                     className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
//                 >
//                     <ChevronLeft size={20} />
//                     <span className="font-medium">Back</span>
//                 </Link>

//                 {/* Page Header */}
//                 <div className="mb-8">
//                     <div className="flex items-center gap-3 mb-1">
//                         <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 ml-6">
//                             Book your lessons
//                         </h1>
//                     </div>
//                     <p className="text-gray-500 text-sm lg:text-base ml-6">
//                         Fill in your details to confirm the booking
//                     </p>
//                 </div>

//                 {/* Main Booking Form */}
//                 <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
//                     {/* Service Details Summary */}
//                     {price && (
//                         <div className="mb-6 p-4 bg-blue-50 rounded-xl">
//                             <h3 className="font-semibold text-gray-900 mb-2">
//                                 {price.category || "Driving Lessons"}
//                             </h3>
//                             <p className="text-sm text-gray-600 mb-2">
//                                 {price.description}
//                             </p>
//                             <div className="flex justify-between text-sm">
//                                 <span className="text-gray-600">Duration:</span>
//                                 <span className="font-medium text-gray-900">
//                                     {formatDurationDisplay(price.duration)}
//                                 </span>
//                             </div>
//                             <div className="flex justify-between text-sm">
//                                 <span className="text-gray-600">Price:</span>
//                                 <span className="font-medium text-gray-900">
//                                     ${price.price}
//                                 </span>
//                             </div>
//                         </div>
//                     )}

//                     <form onSubmit={handleSubmit} className="space-y-6">
//                         {/* Date Selection with Color Indicators - LAZY LOADING */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Available Date *
//                             </label>
//                             <div className="relative">
//                                 <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                                 <select
//                                     value={selectedDate}
//                                     onFocus={handleDropdownOpen}
//                                     onChange={(e) => {
//                                         const newDate = e.target.value;
//                                         setSelectedDate(newDate);
//                                         setSelectedTime("");
//                                         setShowNextAvailability(false);

//                                         // Show warning if date has no slots
//                                         // if (newDate && (!timeSlots[newDate] || timeSlots[newDate].length === 0)) {
//                                         //     toast.error("No available time slots for this date");
//                                         // }
//                                     }}
//                                     className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 pl-10 transition"
//                                     required
//                                 >
//                                     <option value="">Select a date</option>
//                                     {Object.entries(groupedDates).map(
//                                         ([monthYear, dates]) => (
//                                             <optgroup
//                                                 key={monthYear}
//                                                 label={`── ${monthYear} ──`}
//                                                 className="font-semibold text-gray-700"
//                                             >
//                                                 {dates.map((date, i) => {
//                                                     const hasAvailableSlots =
//                                                         timeSlots[date.value]
//                                                             ?.length > 0;
//                                                     const isPast = isPastDate(
//                                                         date.value,
//                                                     );
//                                                     const isLoading =
//                                                         loadingDates[
//                                                             date.value
//                                                         ];

//                                                     let textColorClass =
//                                                         "text-gray-900";
//                                                     let backgroundColor =
//                                                         "transparent";
//                                                     let statusIcon = "";

//                                                     if (isPast) {
//                                                         textColorClass =
//                                                             "text-gray-400";
//                                                         backgroundColor =
//                                                             "#f3f4f6";
//                                                         statusIcon = " (Past)";
//                                                     } else if (isLoading) {
//                                                         textColorClass =
//                                                             "text-gray-500";
//                                                         backgroundColor =
//                                                             "#fef3c7";
//                                                         statusIcon =
//                                                             " (Loading...)";
//                                                     } else if (
//                                                         hasAvailableSlots
//                                                     ) {
//                                                         textColorClass =
//                                                             "text-green-600 font-semibold";
//                                                         backgroundColor =
//                                                             "#f0fdf4";
//                                                         statusIcon = " ✓";
//                                                     } else if (
//                                                         !hasAvailableSlots &&
//                                                         timeSlots[
//                                                             date.value
//                                                         ] !== undefined &&
//                                                         !isPast
//                                                     ) {
//                                                         textColorClass =
//                                                             "text-red-500";
//                                                         backgroundColor =
//                                                             "#fef2f2";
//                                                         statusIcon = " ✗";
//                                                     }

//                                                     return (
//                                                         <option
//                                                             key={i}
//                                                             value={date.value}
//                                                             disabled={isPast}
//                                                             className={`py-1 ${textColorClass}`}
//                                                             style={{
//                                                                 backgroundColor,
//                                                             }}
//                                                         >
//                                                             {date.display}
//                                                             {statusIcon}
//                                                         </option>
//                                                     );
//                                                 })}
//                                             </optgroup>
//                                         ),
//                                     )}
//                                 </select>
//                                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                             </div>

//                             {/* Legend for color indicators */}
//                             <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
//                                 <div className="flex items-center gap-1">
//                                     <span className="text-green-500 text-sm">
//                                         {" "}
//                                         ✓
//                                     </span>
//                                     <span className="text-gray-600">
//                                         Has available slots
//                                     </span>
//                                 </div>

//                                 <div className="flex items-center gap-1">
//                                     <span className="text-red-500 text-sm">
//                                         {" "}
//                                         ✗
//                                     </span>
//                                     <span className="text-gray-600">
//                                         No available slots
//                                     </span>
//                                 </div>
//                             </div>

//                             {/* Info message */}
//                             <p className="mt-2 text-xs text-gray-500 text-center">
//                                 Click on dropdown to load availability for
//                                 upcoming dates
//                             </p>
//                         </div>

//                         {/* Time Selection */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Available Time *
//                             </label>
//                             <div className="relative">
//                                 <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                                 <select
//                                     value={selectedTime}
//                                     onChange={(e) =>
//                                         setSelectedTime(e.target.value)
//                                     }
//                                     disabled={!selectedDate || loading}
//                                     className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 pl-10 transition disabled:opacity-50 disabled:cursor-not-allowed"
//                                     required
//                                 >
//                                     <option value="">
//                                         {loading
//                                             ? "Loading..."
//                                             : !selectedDate
//                                               ? "Select a date first"
//                                               : "Select a time"}
//                                     </option>
//                                     {nonOverlappingSlots.map((time, i) => (
//                                         <option key={i} value={time}>
//                                             {getTimeSlotDisplay(time)}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                             </div>
//                             {selectedDate &&
//                                 nonOverlappingSlots.length === 0 &&
//                                 !loading &&
//                                 timeSlots[selectedDate] !== undefined && (
//                                     <p className="mt-1 text-sm text-red-600">
//                                         No available time slots for this date.
//                                         Please select another date.
//                                     </p>
//                                 )}
//                             {selectedDate && loadingDates[selectedDate] && (
//                                 <p className="mt-1 text-sm text-yellow-600">
//                                     Loading time slots...
//                                 </p>
//                             )}
//                         </div>

//                         {/* Next Availability Button */}
//                         {selectedDate &&
//                             nonOverlappingSlots.length === 0 &&
//                             !loading &&
//                             !showNextAvailability && (
//                                 <button
//                                     type="button"
//                                     onClick={handleNextAvailabilityClick}
//                                     className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors duration-200 text-sm"
//                                 >
//                                     Check Next Availability
//                                 </button>
//                             )}

//                         {/* Next Available Dates */}
//                         {showNextAvailability &&
//                             nextAvailableDates.length > 0 && (
//                                 <div className="p-4 bg-gray-50 rounded-xl">
//                                     <h3 className="text-sm font-semibold text-gray-900 mb-3">
//                                         Next available dates:
//                                     </h3>
//                                     <div className="space-y-2">
//                                         {nextAvailableDates.map(
//                                             (date, index) => (
//                                                 <button
//                                                     key={index}
//                                                     type="button"
//                                                     onClick={() =>
//                                                         handleSelectNextAvailableDate(
//                                                             date,
//                                                         )
//                                                     }
//                                                     className="w-full py-2 px-3 text-left bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors duration-200"
//                                                 >
//                                                     <div className="text-sm font-medium text-gray-900">
//                                                         {date.toLocaleDateString(
//                                                             "en-US",
//                                                             {
//                                                                 weekday:
//                                                                     "short",
//                                                                 month: "short",
//                                                                 day: "numeric",
//                                                             },
//                                                         )}
//                                                     </div>
//                                                     <div className="text-xs text-gray-600">
//                                                         {
//                                                             getTimeSlotsForDate(
//                                                                 formatDateKey(
//                                                                     date,
//                                                                 ),
//                                                             ).length
//                                                         }{" "}
//                                                         time slots available
//                                                     </div>
//                                                 </button>
//                                             ),
//                                         )}
//                                     </div>
//                                 </div>
//                             )}

//                         {/* Full Name */}
//                         <div>
//                             <label
//                                 htmlFor="user_name"
//                                 className="block text-sm font-medium text-gray-700 mb-2"
//                             >
//                                 Full Name *
//                             </label>
//                             <div className="relative">
//                                 <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                                 <input
//                                     type="text"
//                                     id="user_name"
//                                     name="user_name"
//                                     value={formData.user_name}
//                                     onChange={handleChange}
//                                     className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
//                                         errors.user_name
//                                             ? "border-red-500"
//                                             : "border-gray-300"
//                                     }`}
//                                     placeholder="John Doe"
//                                     required
//                                 />
//                             </div>
//                             {errors.user_name && (
//                                 <p className="mt-1 text-sm text-red-600">
//                                     {errors.user_name}
//                                 </p>
//                             )}
//                         </div>

//                         {/* Email */}
//                         <div>
//                             <label
//                                 htmlFor="email"
//                                 className="block text-sm font-medium text-gray-700 mb-2"
//                             >
//                                 Email Address *
//                             </label>
//                             <div className="relative">
//                                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                                 <input
//                                     type="email"
//                                     id="email"
//                                     name="email"
//                                     value={formData.email}
//                                     onChange={handleChange}
//                                     className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
//                                         errors.email
//                                             ? "border-red-500"
//                                             : "border-gray-300"
//                                     }`}
//                                     placeholder="john@example.com"
//                                     required
//                                 />
//                             </div>
//                             {errors.email && (
//                                 <p className="mt-1 text-sm text-red-600">
//                                     {errors.email}
//                                 </p>
//                             )}
//                         </div>

//                         {/* Phone */}
//                         <div>
//                             <label
//                                 htmlFor="phone"
//                                 className="block text-sm font-medium text-gray-700 mb-2"
//                             >
//                                 Phone Number *
//                             </label>
//                             <div className="relative">
//                                 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                                 <input
//                                     type="tel"
//                                     id="phone"
//                                     name="phone"
//                                     value={formData.phone}
//                                     onChange={handleChange}
//                                     className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
//                                         errors.phone
//                                             ? "border-red-500"
//                                             : "border-gray-300"
//                                     }`}
//                                     placeholder="0400 000 000"
//                                     required
//                                 />
//                             </div>
//                             {errors.phone && (
//                                 <p className="mt-1 text-sm text-red-600">
//                                     {errors.phone}
//                                 </p>
//                             )}
//                         </div>

//                         {/* Address - Dropdown */}
//                         <div>
//                             <label
//                                 htmlFor="address"
//                                 className="block text-sm font-medium text-gray-700 mb-2"
//                             >
//                                 Area *
//                             </label>
//                             <div className="relative">
//                                 <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                                 <select
//                                     id="address"
//                                     name="address"
//                                     value={formData.address}
//                                     onChange={handleChange}
//                                     required
//                                     className={`w-full appearance-none pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white ${
//                                         errors.address
//                                             ? "border-red-500"
//                                             : "border-gray-300"
//                                     }`}
//                                 >
//                                     <option value="">Select your Area</option>
//                                     <option value="mandurah">Mandurah</option>
//                                     <option value="meadow-springs">
//                                         Meadow Springs
//                                     </option>
//                                     <option value="silver-sands">
//                                         Silver Sands
//                                     </option>
//                                     <option value="lakelands">Lakelands</option>
//                                     <option value="dudley-park">
//                                         Dudley Park
//                                     </option>
//                                     <option value="halls-head">
//                                         Halls Head
//                                     </option>
//                                     <option value="madora-bay">
//                                         Madora Bay
//                                     </option>
//                                     <option value="greenfields">
//                                         Greenfields
//                                     </option>
//                                     <option value="erskine">Erskine</option>
//                                     <option value="meetpoint-mandurah-dot">
//                                         Meetpoint Mandurah Dot
//                                     </option>
//                                     <option value="singleton">
//                                         Singleton
//                                     </option>
//                                 </select>
//                                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                             </div>
//                             {errors.address && (
//                                 <p className="mt-1 text-sm text-red-600">
//                                     {errors.address}
//                                 </p>
//                             )}
//                         </div>

//                         {/* Zip Code */}
//                         <div>
//                             <label
//                                 htmlFor="zip_code"
//                                 className="block text-sm font-medium text-gray-700 mb-2"
//                             >
//                                 Post Code *
//                             </label>
//                             <div className="relative">
//                                 <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                                 <input
//                                     type="text"
//                                     id="zip_code"
//                                     name="zip_code"
//                                     value={formData.zip_code}
//                                     onChange={handleChange}
//                                     className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
//                                         errors.zip_code
//                                             ? "border-red-500"
//                                             : "border-gray-300"
//                                     }`}
//                                     placeholder="6210, 6180, or 6175"
//                                     maxLength="5"
//                                     required
//                                 />
//                             </div>
//                             {errors.zip_code ? (
//                                 <p className="mt-1 text-sm text-red-600">
//                                     {errors.zip_code}
//                                 </p>
//                             ) : (
//                                 <p className="mt-1 text-sm text-gray-500">
//                                     Currently serving only areas with zip codes
//                                     6210, 6180, or 6175.
//                                     {formData.address !==
//                                         "meetpoint-mandurah-dot" && (
//                                         <span className="block">
//                                             If your address is not available,
//                                             please select "Meetpoint Mandurah
//                                             Dot".
//                                         </span>
//                                     )}
//                                 </p>
//                             )}
//                         </div>

//                         {/* Pickup Location - REMOVED the "Same as address" button */}
//                         <div>
//                             <label
//                                 htmlFor="pickup_location"
//                                 className="block text-sm font-medium text-gray-700 mb-2"
//                             >
//                                 Pickup Location *
//                             </label>
//                             <div className="relative">
//                                 <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                                 <input
//                                     type="text"
//                                     id="pickup_location"
//                                     name="pickup_location"
//                                     value={formData.pickup_location}
//                                     onChange={handleChange}
//                                     className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
//                                         errors.pickup_location
//                                             ? "border-red-500"
//                                             : "border-gray-300"
//                                     }`}
//                                     placeholder="Enter pickup address"
//                                     required
//                                 />
//                             </div>
//                             {errors.pickup_location && (
//                                 <p className="mt-1 text-sm text-red-600">
//                                     {errors.pickup_location}
//                                 </p>
//                             )}
//                         </div>

//                         {/* Dropoff Location - CHANGED button to "Same as Pickup Location" */}
//                         <div>
//                             <div className="flex justify-between items-center mb-2">
//                                 <label
//                                     htmlFor="dropoff_location"
//                                     className="block text-sm font-medium text-gray-700"
//                                 >
//                                     Dropoff Location *
//                                 </label>
//                                 <button
//                                     type="button"
//                                     onClick={setDropoffSameAsPickup}
//                                     className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
//                                 >
//                                     Same as Pickup Location
//                                 </button>
//                             </div>
//                             <div className="relative">
//                                 <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                                 <input
//                                     type="text"
//                                     id="dropoff_location"
//                                     name="dropoff_location"
//                                     value={formData.dropoff_location}
//                                     onChange={handleChange}
//                                     className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
//                                         errors.dropoff_location
//                                             ? "border-red-500"
//                                             : "border-gray-300"
//                                     }`}
//                                     placeholder="Enter dropoff address"
//                                     required
//                                 />
//                             </div>
//                             {errors.dropoff_location && (
//                                 <p className="mt-1 text-sm text-red-600">
//                                     {errors.dropoff_location}
//                                 </p>
//                             )}
//                         </div>

//                         {/* Submit Button */}
//                         <button
//                             type="submit"
//                             disabled={
//                                 submitting || !selectedDate || !selectedTime
//                             }
//                             className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-4 rounded-xl transition duration-200 text-base"
//                         >
//                             {submitting ? (
//                                 <div className="flex items-center justify-center gap-2">
//                                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                                     Processing...
//                                 </div>
//                             ) : (
//                                 "Confirm Booking"
//                             )}
//                         </button>

//                         <p className="text-xs text-center text-gray-500 mt-4">
//                             By clicking Confirm Booking, you agree to our terms
//                             and conditions
//                         </p>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CalendarIntegrationMobile;

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    ChevronDown,
    MapPin,
    Calendar as CalendarIcon,
    Clock,
    User,
    Mail,
    Phone,
    Home,
    MapPin as MapPinIcon,
    ChevronLeft,
} from "lucide-react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "@inertiajs/react";

const CalendarIntegrationMobile = ({ price }) => {
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");

    // Form fields
    const [formData, setFormData] = useState({
        user_name: "",
        email: "",
        phone: "",
        address: "",
        zip_code: "",
        pickup_location: "",
        dropoff_location: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Time slots state
    const [timeSlots, setTimeSlots] = useState({});
    const [showNextAvailability, setShowNextAvailability] = useState(false);
    const [nextAvailableDates, setNextAvailableDates] = useState([]);
    const [allDates, setAllDates] = useState([]);
    const timeSlotsRef = useRef({});
    const loadingDateKeyRef = useRef("");

    useEffect(() => {
        timeSlotsRef.current = timeSlots;
    }, [timeSlots]);

    // Format date as YYYY-MM-DD for API calls
    const formatDateKey = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Parse duration from price
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

    // Calculate end time based on start time and duration
    const calculateEndTime = (startTime, durationString) => {
        const durationMinutes = parseDuration(durationString);

        let cleanStartTime = startTime;
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

    // Format duration for display
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

    // Function to set pickup location same as address
    const setPickupSameAsAddress = () => {
        if (formData.address) {
            setFormData((prev) => ({
                ...prev,
                pickup_location: prev.address,
            }));
            if (errors.pickup_location) {
                setErrors((prev) => ({
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
        if (formData.address) {
            setFormData((prev) => ({
                ...prev,
                dropoff_location: prev.address,
            }));
            if (errors.dropoff_location) {
                setErrors((prev) => ({
                    ...prev,
                    dropoff_location: "",
                }));
            }
            toast.success("Dropoff location set to address");
        } else {
            toast.error("Please select an address first");
        }
    };

    // The backend already filters slots by package duration, buffer, blocks, and reservations.
    const getNonOverlappingSlots = (slots) => {
        if (!slots || slots.length === 0) return [];
        const durationMinutes = parseDuration(price?.duration);
        const slotStepMinutes = 20;
        const bookingStepMinutes = durationMinutes + slotStepMinutes;
        const workingHoursEnd = 18 * 60;

        const timeToMinutes = (timeStr) => {
            const [h, m] = timeStr.split(":").map(Number);
            return h * 60 + m;
        };

        const minutesToTime = (minutes) => {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
        };

        const sortedSlotMinutes = [...slots]
            .map((slot) => {
                let startTime =
                    typeof slot === "string" ? slot : slot?.start_time;
                if (startTime?.includes(":")) {
                    const parts = startTime.split(":");
                    startTime = `${parts[0]}:${parts[1]}`;
                }
                return timeToMinutes(startTime);
            })
            .sort((a, b) => a - b);

        const displaySlots = [];
        let nextAvailableStart = sortedSlotMinutes[0];

        sortedSlotMinutes.forEach((slotMinutes) => {
            if (
                slotMinutes >= nextAvailableStart &&
                slotMinutes + bookingStepMinutes <= workingHoursEnd
            ) {
                displaySlots.push(minutesToTime(slotMinutes));
                nextAvailableStart = slotMinutes + bookingStepMinutes;
            }
        });

        return displaySlots;
    };

    // Format time slot for display
    const getTimeSlotDisplay = (slot) => {
        let startTimeStr = typeof slot === "string" ? slot : slot?.start_time;
        if (startTimeStr?.includes(":")) {
            const parts = startTimeStr.split(":");
            startTimeStr = `${parts[0]}:${parts[1]}`;
        }

        const endTimeStr = calculateEndTime(startTimeStr, price?.duration);

        const formatTo12Hour = (time) => {
            const [hours, minutes] = time.split(":");
            const h = parseInt(hours);
            const period = h >= 12 ? "PM" : "AM";
            const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
            return `${h12}:${minutes} ${period}`;
        };

        return `${formatTo12Hour(startTimeStr)} - ${formatTo12Hour(endTimeStr)}`;
    };

    // Check if date is in the past
    const isPastDate = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const compareDate = new Date(dateString);
        compareDate.setHours(0, 0, 0, 0);

        return compareDate < today;
    };

    // Generate available dates for the next 365 days
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

    // Fetch time slots for a specific date.
    const fetchSlotsForDate = useCallback(
        async (dateKey, force = false) => {
            if (!dateKey || !price?.id || isPastDate(dateKey)) return;

            const alreadyFetched = timeSlotsRef.current[dateKey] !== undefined;
            const alreadyLoading = loadingDateKeyRef.current === dateKey;

            if (!force && (alreadyFetched || alreadyLoading)) return;

            try {
                loadingDateKeyRef.current = dateKey;
                setLoading(true);

                const response = await axios.get(route("ourtimeslots.get"), {
                    params: {
                        date: dateKey,
                        price_id: price.id,
                    },
                });

                const availableSlots = response.data.success
                    ? (response.data.slots || [])
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
                          })
                    : [];

                timeSlotsRef.current = {
                    ...timeSlotsRef.current,
                    [dateKey]: availableSlots,
                };
                setTimeSlots((prev) => ({
                    ...prev,
                    [dateKey]: availableSlots,
                }));
            } catch (err) {
                console.error(`Error fetching slots for ${dateKey}:`, err);
                timeSlotsRef.current = {
                    ...timeSlotsRef.current,
                    [dateKey]: [],
                };
                setTimeSlots((prev) => ({
                    ...prev,
                    [dateKey]: [],
                }));
            } finally {
                if (loadingDateKeyRef.current === dateKey) {
                    loadingDateKeyRef.current = "";
                    setLoading(false);
                }
            }
        },
        [price?.id],
    );

    // Fetch time slots for selected date
    useEffect(() => {
        const fetchTimeSlotsForSelected = async () => {
            if (!selectedDate || !price?.id) return;

            // Fetch slots for this specific date
            await fetchSlotsForDate(selectedDate, true);
            setSelectedTime("");
        };

        fetchTimeSlotsForSelected();
    }, [selectedDate, price?.id, fetchSlotsForDate]);

    // Get time slots for selected date
    const getTimeSlotsForDate = (date) => {
        if (!date) return [];
        return timeSlots[date] || [];
    };

    const getDateAvailabilityStatus = (dateValue) => {
        if (!dateValue) return null;

        if (isPastDate(dateValue)) {
            return {
                label: "Past date",
                className: "border-gray-200 bg-gray-50 text-gray-500",
            };
        }

        if (loading && selectedDate === dateValue) {
            return {
                label: "Checking availability...",
                className: "border-amber-200 bg-amber-50 text-amber-700",
            };
        }

        if (timeSlots[dateValue] === undefined) {
            return {
                label: "Choose a time after selecting a date",
                className: "border-gray-200 bg-gray-50 text-gray-600",
            };
        }

        if (timeSlots[dateValue].length > 0) {
            return {
                label: "Available",
                className: "border-emerald-200 bg-emerald-50 text-emerald-700",
            };
        }

        return {
            label: "Fully booked",
            className: "border-red-200 bg-red-50 text-red-700",
        };
    };

    // Find next available dates (optimized with cache)
    const findNextAvailableDates = async () => {
        try {
            const availableDates = [];
            const today = new Date();

            for (let i = 1; i <= 30; i++) {
                const nextDate = new Date(today);
                nextDate.setDate(today.getDate() + i);
                const dateKey = formatDateKey(nextDate);

                // Check cache first
                let availableSlots = timeSlots[dateKey];

                if (!availableSlots) {
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
                            availableSlots = response.data.slots
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

                            // Cache the result
                            setTimeSlots((prev) => ({
                                ...prev,
                                [dateKey]: availableSlots,
                            }));
                        }
                    } catch (err) {
                        console.error(
                            `Error fetching slots for ${dateKey}:`,
                            err,
                        );
                        continue;
                    }
                }

                if (availableSlots && availableSlots.length > 0) {
                    availableDates.push(nextDate);
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

    // Handle next availability click
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

    // Handle selecting a next available date
    const handleSelectNextAvailableDate = (date) => {
        const formattedDate = date.toLocaleDateString("en-AU", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
        setSelectedDate(formatDateKey(date));
        setSelectedTime("");
        setShowNextAvailability(false);
        toast.success(`Selected date: ${formattedDate}`);
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
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

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

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
            if (!formData[field]?.trim()) {
                newErrors[field] = `${field.replace("_", " ")} is required`;
            }
        });

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (formData.zip_code && !validateZipCode(formData.zip_code)) {
            newErrors.zip_code =
                "Sorry, we currently only serve areas with zip code 6210";
        }

        if (!selectedDate) {
            toast.error("Please select a date");
            return;
        }

        if (!selectedTime) {
            toast.error("Please select a time slot");
            return;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill in all required fields correctly");
            return;
        }

        setSubmitting(true);

        try {
            const durationMinutes = parseDuration(price.duration);
            const fullAddress = `${formData.address}, ${formData.zip_code}`;

            const extractPackageName = (description) => {
                if (!description) return "";
                if (description.includes(":")) {
                    return description.split(":").pop().trim();
                }
                return description.trim();
            };

            const packageName = extractPackageName(price.description);

            const bookingData = {
                user_name: formData.user_name,
                email: formData.email,
                phone: formData.phone,
                address: fullAddress,
                reservation_date: selectedDate,
                price_id: price.id,
                duration_minutes: durationMinutes,
                start_time: selectedTime,
                end_time: calculateEndTime(selectedTime, price.duration),
                package_type: packageName,
                package_price: price.price,
                pickup_location: formData.pickup_location,
                dropoff_location: formData.dropoff_location,
            };

            const response = await axios.post(
                route("ourreservations.store"),
                bookingData,
            );

            if (response.data.success || response.data.message) {
                toast.success(
                    "Booking confirmed successfully! Please check your Spam email for booking details.",
                );

                setFormData({
                    user_name: "",
                    email: "",
                    phone: "",
                    address: "",
                    zip_code: "",
                    pickup_location: "",
                    dropoff_location: "",
                });
                setSelectedDate("");
                setSelectedTime("");

                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        } catch (error) {
            console.error("Booking error:", error);

            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                toast.error("Please fix the errors in the form");
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Error confirming booking. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const currentTimeSlots = getTimeSlotsForDate(selectedDate);
    const nonOverlappingSlots = getNonOverlappingSlots(currentTimeSlots);

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 lg:py-12">
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
                }}
            />

            <div className="max-w-3xl mx-auto">
                <Link
                    href={"/"}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ChevronLeft size={20} />
                    <span className="font-medium">Back</span>
                </Link>

                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 ml-6">
                            Book your lessons
                        </h1>
                    </div>
                    <p className="text-gray-500 text-sm lg:text-base ml-6">
                        Fill in your details to confirm the booking
                    </p>
                </div>

                {/* Main Booking Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
                    {/* Service Details Summary */}
                    {price && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                {price.category || "Driving Lessons"}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                                {price.description}
                            </p>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Duration:</span>
                                <span className="font-medium text-gray-900">
                                    {formatDurationDisplay(price.duration)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Price:</span>
                                <span className="font-medium text-gray-900">
                                    ${price.price}
                                </span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Date Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Available Date *
                            </label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                <select
                                    value={selectedDate}
                                    onChange={(e) => {
                                        const newDate = e.target.value;
                                        setSelectedDate(newDate);
                                        setSelectedTime("");
                                        setShowNextAvailability(false);
                                    }}
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
                                                {dates.map((date, i) => {
                                                    const isPast = isPastDate(
                                                        date.value,
                                                    );

                                                    return (
                                                        <option
                                                            key={i}
                                                            value={date.value}
                                                            disabled={isPast}
                                                            className="py-1 text-gray-900"
                                                        >
                                                            {date.display}
                                                        </option>
                                                    );
                                                })}
                                            </optgroup>
                                        ),
                                    )}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            </div>

                            {selectedDate && (
                                <p
                                    className={`mt-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
                                        getDateAvailabilityStatus(selectedDate)
                                            .className
                                    }`}
                                >
                                    {
                                        getDateAvailabilityStatus(selectedDate)
                                            .label
                                    }
                                </p>
                            )}
                        </div>

                        {/* Time Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Available Time *
                            </label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                <select
                                    value={selectedTime}
                                    onChange={(e) =>
                                        setSelectedTime(e.target.value)
                                    }
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
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            </div>
                            {selectedDate &&
                                nonOverlappingSlots.length === 0 &&
                                !loading &&
                                timeSlots[selectedDate] !== undefined && (
                                    <p className="mt-1 text-sm text-red-600">
                                        No available time slots for this date.
                                        Please select another date.
                                    </p>
                                )}
                        </div>

                        {/* Next Availability Button */}
                        {selectedDate &&
                            nonOverlappingSlots.length === 0 &&
                            !loading &&
                            !showNextAvailability && (
                                <button
                                    type="button"
                                    onClick={handleNextAvailabilityClick}
                                    className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors duration-200 text-sm"
                                >
                                    Check Next Availability
                                </button>
                            )}

                        {/* Next Available Dates */}
                        {showNextAvailability &&
                            nextAvailableDates.length > 0 && (
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                        Next available dates:
                                    </h3>
                                    <div className="space-y-2">
                                        {nextAvailableDates.map(
                                            (date, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
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
                                                                formatDateKey(
                                                                    date,
                                                                ),
                                                            ).length
                                                        }{" "}
                                                        time slots available
                                                    </div>
                                                </button>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Full Name */}
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
                                    value={formData.user_name}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                                        errors.user_name
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            {errors.user_name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.user_name}
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
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                                        errors.email
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.email}
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
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                                        errors.phone
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="0400 000 000"
                                    required
                                />
                            </div>
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        {/* Address - Dropdown */}
                        <div>
                            <label
                                htmlFor="address"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Area *
                            </label>
                            <div className="relative">
                                <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                <select
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    className={`w-full appearance-none pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white ${
                                        errors.address
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                >
                                    <option value="">Select your Area</option>
                                    <option value="mandurah">Mandurah</option>
                                    <option value="meadow-springs">
                                        Meadow Springs
                                    </option>
                                    <option value="silver-sands">
                                        Silver Sands
                                    </option>
                                    <option value="lakelands">Lakelands</option>
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
                                    <option value="erskine">Erskine</option>
                                    <option value="meetpoint-mandurah-dot">
                                        Meetpoint Mandurah Dot
                                    </option>
                                    <option value="singleton">Singleton</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            </div>
                            {errors.address && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.address}
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
                                    value={formData.zip_code}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                                        errors.zip_code
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="6210"
                                    maxLength="5"
                                    required
                                />
                            </div>
                            {errors.zip_code ? (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.zip_code}
                                </p>
                            ) : (
                                <p className="mt-1 text-sm text-gray-500">
                                    Currently serving only areas with zip code
                                    6210.
                                    {formData.address !==
                                        "meetpoint-mandurah-dot" && (
                                        <span className="block">
                                            If your address is not available,
                                            please select "Meetpoint Mandurah
                                            Dot".
                                        </span>
                                    )}
                                </p>
                            )}
                        </div>

                        {/* Pickup Location */}
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
                                    value={formData.pickup_location}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                                        errors.pickup_location
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="Enter pickup address"
                                    required
                                />
                            </div>
                            {errors.pickup_location && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.pickup_location}
                                </p>
                            )}
                        </div>

                        {/* Dropoff Location */}
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
                                    value={formData.dropoff_location}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                                        errors.dropoff_location
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="Enter dropoff address"
                                    required
                                />
                            </div>
                            {errors.dropoff_location && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.dropoff_location}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={
                                submitting || !selectedDate || !selectedTime
                            }
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-4 rounded-xl transition duration-200 text-base"
                        >
                            {submitting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Processing...
                                </div>
                            ) : (
                                "Confirm Booking"
                            )}
                        </button>

                        <p className="text-xs text-center text-gray-500 mt-4">
                            By clicking Confirm Booking, you agree to our terms
                            and conditions
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CalendarIntegrationMobile;

// import React, { useState, useEffect, useCallback, useRef } from "react";
// import {
//     ChevronDown,
//     MapPin,
//     Calendar as CalendarIcon,
//     Clock,
//     User,
//     Mail,
//     Phone,
//     Home,
//     MapPin as MapPinIcon,
//     ChevronLeft,
// } from "lucide-react";
// import axios from "axios";
// import toast, { Toaster } from "react-hot-toast";
// import { Link } from "@inertiajs/react";

// const CalendarIntegrationMobile = ({ price }) => {
//     const [selectedDate, setSelectedDate] = useState("");
//     const [selectedTime, setSelectedTime] = useState("");

//     // Form fields
//     const [formData, setFormData] = useState({
//         user_name: "",
//         email: "",
//         phone: "",
//         address: "",
//         pickup_location: "",
//         dropoff_location: "",
//     });

//     const [errors, setErrors] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [submitting, setSubmitting] = useState(false);

//     // Terms and conditions acceptance
//     const [acceptTerms, setAcceptTerms] = useState(false);

//     // Time slots state
//     const [timeSlots, setTimeSlots] = useState({});
//     const [showNextAvailability, setShowNextAvailability] = useState(false);
//     const [nextAvailableDates, setNextAvailableDates] = useState([]);
//     const [allDates, setAllDates] = useState([]);
//     const [loadingDates, setLoadingDates] = useState({}); // Track which dates are loading

//     // Format date as YYYY-MM-DD for API calls
//     const formatDateKey = (date) => {
//         if (!date) return "";
//         const d = new Date(date);
//         const year = d.getFullYear();
//         const month = String(d.getMonth() + 1).padStart(2, "0");
//         const day = String(d.getDate()).padStart(2, "0");
//         return `${year}-${month}-${day}`;
//     };

//     // Parse duration from price
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

//     // Calculate end time based on start time and duration
//     const calculateEndTime = (startTime, durationString) => {
//         const durationMinutes = parseDuration(durationString);

//         let cleanStartTime = startTime;
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

//     // Format duration for display
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

//     // Function to set pickup location same as address
//     const setPickupSameAsAddress = () => {
//         if (formData.address) {
//             setFormData((prev) => ({
//                 ...prev,
//                 pickup_location: prev.address,
//             }));
//             if (errors.pickup_location) {
//                 setErrors((prev) => ({
//                     ...prev,
//                     pickup_location: "",
//                 }));
//             }
//             toast.success("Pickup location set to address");
//         } else {
//             toast.error("Please select an address first");
//         }
//     };

//     // Function to set dropoff location same as pickup location
//     const setDropoffSameAsPickup = () => {
//         if (formData.pickup_location) {
//             setFormData((prev) => ({
//                 ...prev,
//                 dropoff_location: prev.pickup_location,
//             }));
//             if (errors.dropoff_location) {
//                 setErrors((prev) => ({
//                     ...prev,
//                     dropoff_location: "",
//                 }));
//             }
//             toast.success("Dropoff location set to pickup location");
//         } else {
//             toast.error("Please enter a pickup location first");
//         }
//     };

//     // The backend already filters slots by package duration, buffer, blocks, and reservations.
//     const getNonOverlappingSlots = (slots) => {
//         if (!slots || slots.length === 0) return [];
//         const durationMinutes = parseDuration(price?.duration);
//         const slotStepMinutes = 20;
//         const bookingStepMinutes = durationMinutes + slotStepMinutes;
//         const workingHoursStart = 7 * 60;
//         const workingHoursEnd = 18 * 60;

//         const timeToMinutes = (timeStr) => {
//             const [h, m] = timeStr.split(":").map(Number);
//             return h * 60 + m;
//         };

//         const minutesToTime = (minutes) => {
//             const hours = Math.floor(minutes / 60);
//             const mins = minutes % 60;
//             return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
//         };

//         const sortedSlotMinutes = [...slots]
//             .map((slot) => {
//                 let startTime =
//                     typeof slot === "string" ? slot : slot?.start_time;
//                 if (startTime?.includes(":")) {
//                     const parts = startTime.split(":");
//                     startTime = `${parts[0]}:${parts[1]}`;
//                 }
//                 return timeToMinutes(startTime);
//             })
//             .sort((a, b) => a - b);

//         const availableStartTimes = new Set(
//             sortedSlotMinutes.map((minutes) => minutesToTime(minutes)),
//         );

//         const isBookableCandidate = (startMinutes) => {
//             const bufferEndMinutes = startMinutes + bookingStepMinutes;
//             if (bufferEndMinutes > workingHoursEnd) return false;

//             const floorSlot =
//                 workingHoursStart +
//                 Math.floor(
//                     (startMinutes - workingHoursStart) / slotStepMinutes,
//                 ) *
//                     slotStepMinutes;
//             const ceilSlot =
//                 workingHoursStart +
//                 Math.ceil(
//                     (startMinutes - workingHoursStart) / slotStepMinutes,
//                 ) *
//                     slotStepMinutes;
//             const latestGridStart = workingHoursEnd - bookingStepMinutes;

//             if (!availableStartTimes.has(minutesToTime(floorSlot))) {
//                 return false;
//             }

//             if (
//                 ceilSlot !== floorSlot &&
//                 ceilSlot <= latestGridStart &&
//                 !availableStartTimes.has(minutesToTime(ceilSlot))
//             ) {
//                 return false;
//             }

//             return true;
//         };

//         const displaySlots = [];
//         let candidateMinutes = sortedSlotMinutes[0];

//         while (candidateMinutes + bookingStepMinutes <= workingHoursEnd) {
//             if (isBookableCandidate(candidateMinutes)) {
//                 displaySlots.push(minutesToTime(candidateMinutes));
//                 candidateMinutes += bookingStepMinutes;
//             } else {
//                 candidateMinutes += slotStepMinutes;
//             }
//         }

//         return displaySlots;
//     };

//     // Format time slot for display
//     const getTimeSlotDisplay = (slot) => {
//         let startTimeStr = typeof slot === "string" ? slot : slot?.start_time;
//         if (startTimeStr?.includes(":")) {
//             const parts = startTimeStr.split(":");
//             startTimeStr = `${parts[0]}:${parts[1]}`;
//         }

//         const endTimeStr = calculateEndTime(startTimeStr, price?.duration);

//         const formatTo12Hour = (time) => {
//             const [hours, minutes] = time.split(":");
//             const h = parseInt(hours);
//             const period = h >= 12 ? "PM" : "AM";
//             const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
//             return `${h12}:${minutes} ${period}`;
//         };

//         return `${formatTo12Hour(startTimeStr)} - ${formatTo12Hour(endTimeStr)}`;
//     };

//     // Check if date is in the past
//     const isPastDate = (dateString) => {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         const compareDate = new Date(dateString);
//         compareDate.setHours(0, 0, 0, 0);

//         return compareDate < today;
//     };

//     // Generate available dates for the next 365 days
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
//                 date: date,
//                 monthYear: monthYear,
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

//     // Fetch time slots for a specific date (lazy loading)
//     const fetchSlotsForDate = useCallback(
//         async (dateKey) => {
//             // Don't fetch if already have slots or currently loading
//             if (timeSlots[dateKey] || loadingDates[dateKey]) return;

//             // Don't fetch past dates
//             if (isPastDate(dateKey)) return;

//             try {
//                 // Mark this date as loading
//                 setLoadingDates((prev) => ({ ...prev, [dateKey]: true }));

//                 const response = await axios.get(route("ourtimeslots.get"), {
//                     params: {
//                         date: dateKey,
//                         price_id: price.id,
//                     },
//                 });

//                 if (response.data.success) {
//                     const availableSlots = response.data.slots
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

//                     setTimeSlots((prev) => ({
//                         ...prev,
//                         [dateKey]: availableSlots,
//                     }));
//                 }
//             } catch (err) {
//                 console.error(`Error fetching slots for ${dateKey}:`, err);
//                 // Set empty slots for this date to avoid retrying
//                 setTimeSlots((prev) => ({
//                     ...prev,
//                     [dateKey]: [],
//                 }));
//             } finally {
//                 setLoadingDates((prev) => ({ ...prev, [dateKey]: false }));
//             }
//         },
//         [price?.id, timeSlots, loadingDates],
//     );

//     // Fetch slots when user scrolls through dropdown (visible dates)
//     const handleDropdownOpen = useCallback(() => {
//         // Fetch slots for the next 30 days when dropdown opens
//         const next30Days = allDates.slice(0, 30);
//         next30Days.forEach((dateObj) => {
//             fetchSlotsForDate(dateObj.value);
//         });
//     }, [allDates, fetchSlotsForDate]);

//     // Fetch time slots for selected date
//     useEffect(() => {
//         const fetchTimeSlotsForSelected = async () => {
//             if (!selectedDate || !price?.id) return;

//             // Fetch slots for this specific date
//             await fetchSlotsForDate(selectedDate, true);
//             setSelectedTime("");
//         };

//         fetchTimeSlotsForSelected();
//     }, [selectedDate, price?.id, fetchSlotsForDate]);

//     // Get time slots for selected date
//     const getTimeSlotsForDate = (date) => {
//         if (!date) return [];
//         return timeSlots[date] || [];
//     };

//     // Find next available dates (optimized with cache)
//     const findNextAvailableDates = async () => {
//         try {
//             const availableDates = [];
//             const today = new Date();

//             for (let i = 1; i <= 30; i++) {
//                 const nextDate = new Date(today);
//                 nextDate.setDate(today.getDate() + i);
//                 const dateKey = formatDateKey(nextDate);

//                 // Check cache first
//                 let availableSlots = timeSlots[dateKey];

//                 if (!availableSlots) {
//                     try {
//                         const response = await axios.get(
//                             route("ourtimeslots.get"),
//                             {
//                                 params: {
//                                     date: dateKey,
//                                     price_id: price.id,
//                                 },
//                             },
//                         );

//                         if (response.data.success) {
//                             availableSlots = response.data.slots
//                                 .filter((slot) => slot.status === "available")
//                                 .map((slot) => {
//                                     const startTime = slot.start_time;
//                                     if (
//                                         typeof startTime === "string" &&
//                                         startTime.includes(":")
//                                     ) {
//                                         const parts = startTime.split(":");
//                                         return `${parts[0]}:${parts[1]}`;
//                                     }
//                                     return startTime;
//                                 });

//                             // Cache the result
//                             setTimeSlots((prev) => ({
//                                 ...prev,
//                                 [dateKey]: availableSlots,
//                             }));
//                         }
//                     } catch (err) {
//                         console.error(
//                             `Error fetching slots for ${dateKey}:`,
//                             err,
//                         );
//                         continue;
//                     }
//                 }

//                 if (availableSlots && availableSlots.length > 0) {
//                     availableDates.push(nextDate);
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

//     // Handle next availability click
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

//     // Handle selecting a next available date
//     const handleSelectNextAvailableDate = (date) => {
//         const formattedDate = date.toLocaleDateString("en-AU", {
//             weekday: "short",
//             day: "2-digit",
//             month: "short",
//             year: "numeric",
//         });
//         setSelectedDate(formatDateKey(date));
//         setSelectedTime("");
//         setShowNextAvailability(false);
//         toast.success(`Selected date: ${formattedDate}`);
//     };

//     // Handle form input changes
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//         if (errors[name]) {
//             setErrors((prev) => ({
//                 ...prev,
//                 [name]: "",
//             }));
//         }
//     };

//     // Handle form submission
//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         const requiredFields = [
//             "user_name",
//             "email",
//             "phone",
//             "address",
//             "pickup_location",
//             "dropoff_location",
//         ];
//         const newErrors = {};

//         requiredFields.forEach((field) => {
//             if (!formData[field]?.trim()) {
//                 newErrors[field] = `${field.replace("_", " ")} is required`;
//             }
//         });

//         if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
//             newErrors.email = "Please enter a valid email address";
//         }

//         if (!selectedDate) {
//             toast.error("Please select a date");
//             return;
//         }

//         if (!selectedTime) {
//             toast.error("Please select a time slot");
//             return;
//         }

//         // Check terms and conditions acceptance
//         if (!acceptTerms) {
//             toast.error(
//                 "Please accept the Terms & Conditions and Privacy Policy",
//             );
//             return;
//         }

//         if (Object.keys(newErrors).length > 0) {
//             setErrors(newErrors);
//             toast.error("Please fill in all required fields correctly");
//             return;
//         }

//         setSubmitting(true);

//         try {
//             const durationMinutes = parseDuration(price.duration);
//             const fullAddress = formData.address;

//             const extractPackageName = (description) => {
//                 if (!description) return "";
//                 if (description.includes(":")) {
//                     return description.split(":").pop().trim();
//                 }
//                 return description.trim();
//             };

//             const packageName = extractPackageName(price.description);

//             const bookingData = {
//                 user_name: formData.user_name,
//                 email: formData.email,
//                 phone: formData.phone,
//                 address: fullAddress,
//                 reservation_date: selectedDate,
//                 price_id: price.id,
//                 duration_minutes: durationMinutes,
//                 start_time: selectedTime,
//                 end_time: calculateEndTime(selectedTime, price.duration),
//                 package_type: packageName,
//                 package_price: price.price,
//                 pickup_location: formData.pickup_location,
//                 dropoff_location: formData.dropoff_location,
//                 accepted_terms: acceptTerms,
//             };

//             const response = await axios.post(
//                 route("ourreservations.store"),
//                 bookingData,
//             );

//             if (response.data.success || response.data.message) {
//                 toast.success(
//                     "Booking confirmed successfully! Please check your Spam email for booking details.",
//                 );

//                 setFormData({
//                     user_name: "",
//                     email: "",
//                     phone: "",
//                     address: "",
//                     pickup_location: "",
//                     dropoff_location: "",
//                 });
//                 setSelectedDate("");
//                 setSelectedTime("");
//                 setAcceptTerms(false);

//                 setTimeout(() => {
//                     window.location.reload();
//                 }, 2000);
//             }
//         } catch (error) {
//             console.error("Booking error:", error);

//             if (error.response?.data?.errors) {
//                 setErrors(error.response.data.errors);
//                 toast.error("Please fix the errors in the form");
//             } else if (error.response?.data?.message) {
//                 toast.error(error.response.data.message);
//             } else {
//                 toast.error("Error confirming booking. Please try again.");
//             }
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     const currentTimeSlots = getTimeSlotsForDate(selectedDate);
//     const nonOverlappingSlots = getNonOverlappingSlots(currentTimeSlots);

//     return (
//         <div className="min-h-screen bg-gray-100 py-6 px-4 lg:py-12">
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
//                 }}
//             />

//             <div className="max-w-3xl mx-auto">
//                 <Link
//                     href={"/"}
//                     className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
//                 >
//                     <ChevronLeft size={20} />
//                     <span className="font-medium">Back</span>
//                 </Link>

//                 {/* Page Header */}
//                 <div className="mb-8">
//                     <div className="flex items-center gap-3 mb-1">
//                         <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 ml-6">
//                             Book your lessons
//                         </h1>
//                     </div>
//                     <p className="text-gray-500 text-sm lg:text-base ml-6">
//                         Fill in your details to confirm the booking
//                     </p>
//                 </div>

//                 {/* Main Booking Form */}
//                 <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
//                     {/* Service Details Summary */}
//                     {price && (
//                         <div className="mb-6 p-4 bg-blue-50 rounded-xl">
//                             <h3 className="font-semibold text-gray-900 mb-2">
//                                 {price.category || "Driving Lessons"}
//                             </h3>
//                             <p className="text-sm text-gray-600 mb-2">
//                                 {price.description}
//                             </p>
//                             <div className="flex justify-between text-sm">
//                                 <span className="text-gray-600">Duration:</span>
//                                 <span className="font-medium text-gray-900">
//                                     {formatDurationDisplay(price.duration)}
//                                 </span>
//                             </div>
//                             <div className="flex justify-between text-sm">
//                                 <span className="text-gray-600">Price:</span>
//                                 <span className="font-medium text-gray-900">
//                                     ${price.price}
//                                 </span>
//                             </div>
//                         </div>
//                     )}

//                     <form onSubmit={handleSubmit} className="space-y-6">
//                         {/* Date Selection with Color Indicators - LAZY LOADING */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Available Date *
//                             </label>
//                             <div className="relative">
//                                 <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                                 <select
//                                     value={selectedDate}
//                                     onFocus={handleDropdownOpen}
//                                     onChange={(e) => {
//                                         const newDate = e.target.value;
//                                         setSelectedDate(newDate);
//                                         setSelectedTime("");
//                                         setShowNextAvailability(false);
//                                     }}
//                                     className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 pl-10 transition"
//                                     required
//                                 >
//                                     <option value="">Select a date</option>
//                                     {Object.entries(groupedDates).map(
//                                         ([monthYear, dates]) => (
//                                             <optgroup
//                                                 key={monthYear}
//                                                 label={`── ${monthYear} ──`}
//                                                 className="font-semibold text-gray-700"
//                                             >
//                                                 {dates.map((date, i) => {
//                                                     const hasAvailableSlots =
//                                                         timeSlots[date.value]
//                                                             ?.length > 0;
//                                                     const isPast = isPastDate(
//                                                         date.value,
//                                                     );
//                                                     const isLoading =
//                                                         loadingDates[
//                                                             date.value
//                                                         ];

//                                                     let textColorClass =
//                                                         "text-gray-900";
//                                                     let backgroundColor =
//                                                         "transparent";
//                                                     let statusIcon = "";

//                                                     if (isPast) {
//                                                         textColorClass =
//                                                             "text-gray-400";
//                                                         backgroundColor =
//                                                             "#f3f4f6";
//                                                         statusIcon = " (Past)";
//                                                     } else if (isLoading) {
//                                                         textColorClass =
//                                                             "text-gray-500";
//                                                         backgroundColor =
//                                                             "#fef3c7";
//                                                         statusIcon =
//                                                             " (Loading...)";
//                                                     } else if (
//                                                         hasAvailableSlots
//                                                     ) {
//                                                         textColorClass =
//                                                             "text-green-600 font-semibold";
//                                                         backgroundColor =
//                                                             "#f0fdf4";
//                                                         statusIcon = " ✓";
//                                                     } else if (
//                                                         !hasAvailableSlots &&
//                                                         timeSlots[
//                                                             date.value
//                                                         ] !== undefined &&
//                                                         !isPast
//                                                     ) {
//                                                         textColorClass =
//                                                             "text-red-500";
//                                                         backgroundColor =
//                                                             "#fef2f2";
//                                                         statusIcon = " ✗";
//                                                     }

//                                                     return (
//                                                         <option
//                                                             key={i}
//                                                             value={date.value}
//                                                             disabled={isPast}
//                                                             className={`py-1 ${textColorClass}`}
//                                                             style={{
//                                                                 backgroundColor,
//                                                             }}
//                                                         >
//                                                             {date.display}
//                                                             {statusIcon}
//                                                         </option>
//                                                     );
//                                                 })}
//                                             </optgroup>
//                                         ),
//                                     )}
//                                 </select>
//                                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                             </div>

//                             {/* Legend for color indicators */}
//                             <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
//                                 <div className="flex items-center gap-1">
//                                     <span className="text-green-500 text-sm">
//                                         {" "}
//                                         ✓
//                                     </span>
//                                     <span className="text-gray-600">
//                                         Has available slots
//                                     </span>
//                                 </div>

//                                 <div className="flex items-center gap-1">
//                                     <span className="text-red-500 text-sm">
//                                         {" "}
//                                         ✗
//                                     </span>
//                                     <span className="text-gray-600">
//                                         No available slots
//                                     </span>
//                                 </div>
//                             </div>

//                             {/* Info message */}
//                             <p className="mt-2 text-xs text-gray-500 text-center">
//                                 Click on dropdown to load availability for
//                                 upcoming dates
//                             </p>
//                         </div>

//                         {/* Time Selection */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Available Time *
//                             </label>
//                             <div className="relative">
//                                 <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                                 <select
//                                     value={selectedTime}
//                                     onChange={(e) =>
//                                         setSelectedTime(e.target.value)
//                                     }
//                                     disabled={!selectedDate || loading}
//                                     className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 pl-10 transition disabled:opacity-50 disabled:cursor-not-allowed"
//                                     required
//                                 >
//                                     <option value="">
//                                         {loading
//                                             ? "Loading..."
//                                             : !selectedDate
//                                               ? "Select a date first"
//                                               : "Select a time"}
//                                     </option>
//                                     {nonOverlappingSlots.map((time, i) => (
//                                         <option key={i} value={time}>
//                                             {getTimeSlotDisplay(time)}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                             </div>
//                             {selectedDate &&
//                                 nonOverlappingSlots.length === 0 &&
//                                 !loading &&
//                                 timeSlots[selectedDate] !== undefined && (
//                                     <p className="mt-1 text-sm text-red-600">
//                                         No available time slots for this date.
//                                         Please select another date.
//                                     </p>
//                                 )}
//                             {selectedDate && loadingDates[selectedDate] && (
//                                 <p className="mt-1 text-sm text-yellow-600">
//                                     Loading time slots...
//                                 </p>
//                             )}
//                         </div>

//                         {/* Next Availability Button */}
//                         {selectedDate &&
//                             nonOverlappingSlots.length === 0 &&
//                             !loading &&
//                             !showNextAvailability && (
//                                 <button
//                                     type="button"
//                                     onClick={handleNextAvailabilityClick}
//                                     className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors duration-200 text-sm"
//                                 >
//                                     Check Next Availability
//                                 </button>
//                             )}

//                         {/* Next Available Dates */}
//                         {showNextAvailability &&
//                             nextAvailableDates.length > 0 && (
//                                 <div className="p-4 bg-gray-50 rounded-xl">
//                                     <h3 className="text-sm font-semibold text-gray-900 mb-3">
//                                         Next available dates:
//                                     </h3>
//                                     <div className="space-y-2">
//                                         {nextAvailableDates.map(
//                                             (date, index) => (
//                                                 <button
//                                                     key={index}
//                                                     type="button"
//                                                     onClick={() =>
//                                                         handleSelectNextAvailableDate(
//                                                             date,
//                                                         )
//                                                     }
//                                                     className="w-full py-2 px-3 text-left bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors duration-200"
//                                                 >
//                                                     <div className="text-sm font-medium text-gray-900">
//                                                         {date.toLocaleDateString(
//                                                             "en-US",
//                                                             {
//                                                                 weekday:
//                                                                     "short",
//                                                                 month: "short",
//                                                                 day: "numeric",
//                                                             },
//                                                         )}
//                                                     </div>
//                                                     <div className="text-xs text-gray-600">
//                                                         {
//                                                             getTimeSlotsForDate(
//                                                                 formatDateKey(
//                                                                     date,
//                                                                 ),
//                                                             ).length
//                                                         }{" "}
//                                                         time slots available
//                                                     </div>
//                                                 </button>
//                                             ),
//                                         )}
//                                     </div>
//                                 </div>
//                             )}

//                         {/* Full Name */}
//                         <div>
//                             <label
//                                 htmlFor="user_name"
//                                 className="block text-sm font-medium text-gray-700 mb-2"
//                             >
//                                 Full Name *
//                             </label>
//                             <div className="relative">
//                                 <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                                 <input
//                                     type="text"
//                                     id="user_name"
//                                     name="user_name"
//                                     value={formData.user_name}
//                                     onChange={handleChange}
//                                     className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
//                                         errors.user_name
//                                             ? "border-red-500"
//                                             : "border-gray-300"
//                                     }`}
//                                     placeholder="John Doe"
//                                     required
//                                 />
//                             </div>
//                             {errors.user_name && (
//                                 <p className="mt-1 text-sm text-red-600">
//                                     {errors.user_name}
//                                 </p>
//                             )}
//                         </div>

//                         {/* Email */}
//                         <div>
//                             <label
//                                 htmlFor="email"
//                                 className="block text-sm font-medium text-gray-700 mb-2"
//                             >
//                                 Email Address *
//                             </label>
//                             <div className="relative">
//                                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                                 <input
//                                     type="email"
//                                     id="email"
//                                     name="email"
//                                     value={formData.email}
//                                     onChange={handleChange}
//                                     className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
//                                         errors.email
//                                             ? "border-red-500"
//                                             : "border-gray-300"
//                                     }`}
//                                     placeholder="john@example.com"
//                                     required
//                                 />
//                             </div>
//                             {errors.email && (
//                                 <p className="mt-1 text-sm text-red-600">
//                                     {errors.email}
//                                 </p>
//                             )}
//                         </div>

//                         {/* Phone */}
//                         <div>
//                             <label
//                                 htmlFor="phone"
//                                 className="block text-sm font-medium text-gray-700 mb-2"
//                             >
//                                 Phone Number *
//                             </label>
//                             <div className="relative">
//                                 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                                 <input
//                                     type="tel"
//                                     id="phone"
//                                     name="phone"
//                                     value={formData.phone}
//                                     onChange={handleChange}
//                                     className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
//                                         errors.phone
//                                             ? "border-red-500"
//                                             : "border-gray-300"
//                                     }`}
//                                     placeholder="0400 000 000"
//                                     required
//                                 />
//                             </div>
//                             {errors.phone && (
//                                 <p className="mt-1 text-sm text-red-600">
//                                     {errors.phone}
//                                 </p>
//                             )}
//                         </div>

//                         {/* Address - Dropdown */}
//                         <div>
//                             <label
//                                 htmlFor="address"
//                                 className="block text-sm font-medium text-gray-700 mb-2"
//                             >
//                                 Area *
//                             </label>
//                             <div className="relative">
//                                 <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                                 <select
//                                     id="address"
//                                     name="address"
//                                     value={formData.address}
//                                     onChange={handleChange}
//                                     required
//                                     className={`w-full appearance-none pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white ${
//                                         errors.address
//                                             ? "border-red-500"
//                                             : "border-gray-300"
//                                     }`}
//                                 >
//                                     <option value="">Select your Area</option>
//                                     <option value="mandurah">Mandurah</option>
//                                     <option value="meadow-springs">
//                                         Meadow Springs
//                                     </option>
//                                     <option value="silver-sands">
//                                         Silver Sands
//                                     </option>
//                                     <option value="lakelands">Lakelands</option>
//                                     <option value="dudley-park">
//                                         Dudley Park
//                                     </option>
//                                     <option value="halls-head">
//                                         Halls Head
//                                     </option>
//                                     <option value="madora-bay">
//                                         Madora Bay
//                                     </option>
//                                     <option value="greenfields">
//                                         Greenfields
//                                     </option>
//                                     <option value="erskine">Erskine</option>
//                                     <option value="meetpoint-mandurah-dot">
//                                         Meetpoint Mandurah Dot
//                                     </option>
//                                     <option value="singleton">Singleton</option>
//                                 </select>
//                                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                             </div>
//                             {errors.address && (
//                                 <p className="mt-1 text-sm text-red-600">
//                                     {errors.address}
//                                 </p>
//                             )}
//                         </div>

//                         <p className="mt-1 text-sm text-gray-500">
//                             Currently serving only areas with zip codes 6210,
//                             6180, or 6175.
//                             {formData.address !== "meetpoint-mandurah-dot" && (
//                                 <span className="block">
//                                     If your address is not available, please
//                                     select "Meetpoint Mandurah Dot".
//                                 </span>
//                             )}
//                         </p>

//                         {/* Pickup Location */}
//                         <div>
//                             <label
//                                 htmlFor="pickup_location"
//                                 className="block text-sm font-medium text-gray-700 mb-2"
//                             >
//                                 Pickup Location *
//                             </label>
//                             <div className="relative">
//                                 <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                                 <input
//                                     type="text"
//                                     id="pickup_location"
//                                     name="pickup_location"
//                                     value={formData.pickup_location}
//                                     onChange={handleChange}
//                                     className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
//                                         errors.pickup_location
//                                             ? "border-red-500"
//                                             : "border-gray-300"
//                                     }`}
//                                     placeholder="Enter pickup address"
//                                     required
//                                 />
//                             </div>
//                             {errors.pickup_location && (
//                                 <p className="mt-1 text-sm text-red-600">
//                                     {errors.pickup_location}
//                                 </p>
//                             )}
//                         </div>

//                         {/* Dropoff Location */}
//                         <div>
//                             <div className="flex justify-between items-center mb-2">
//                                 <label
//                                     htmlFor="dropoff_location"
//                                     className="block text-sm font-medium text-gray-700"
//                                 >
//                                     Dropoff Location *
//                                 </label>
//                                 <button
//                                     type="button"
//                                     onClick={setDropoffSameAsPickup}
//                                     className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
//                                 >
//                                     Same as Pickup Location
//                                 </button>
//                             </div>
//                             <div className="relative">
//                                 <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                                 <input
//                                     type="text"
//                                     id="dropoff_location"
//                                     name="dropoff_location"
//                                     value={formData.dropoff_location}
//                                     onChange={handleChange}
//                                     className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
//                                         errors.dropoff_location
//                                             ? "border-red-500"
//                                             : "border-gray-300"
//                                     }`}
//                                     placeholder="Enter dropoff address"
//                                     required
//                                 />
//                             </div>
//                             {errors.dropoff_location && (
//                                 <p className="mt-1 text-sm text-red-600">
//                                     {errors.dropoff_location}
//                                 </p>
//                             )}
//                         </div>

//                         {/* Terms and Conditions Checkbox */}
//                         <div className="border-t border-gray-200 pt-6">
//                             <div className="flex items-start gap-3">
//                                 <input
//                                     type="checkbox"
//                                     id="acceptTerms"
//                                     checked={acceptTerms}
//                                     onChange={(e) =>
//                                         setAcceptTerms(e.target.checked)
//                                     }
//                                     className="mt-1 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//                                     required
//                                 />
//                                 <label
//                                     htmlFor="acceptTerms"
//                                     className="text-sm text-gray-700"
//                                 >
//                                     I agree to the{" "}
//                                     <a
//                                         href="https://wheelmasterdriving.com.au/terms"
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         className="text-indigo-600 hover:text-indigo-800 underline font-medium"
//                                     >
//                                         Terms & Conditions
//                                     </a>{" "}
//                                     and{" "}
//                                     <a
//                                         href="https://wheelmasterdriving.com.au/policy"
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         className="text-indigo-600 hover:text-indigo-800 underline font-medium"
//                                     >
//                                         Privacy Policy
//                                     </a>{" "}
//                                     *
//                                 </label>
//                             </div>
//                         </div>

//                         {/* Submit Button */}
//                         <button
//                             type="submit"
//                             disabled={
//                                 submitting ||
//                                 !selectedDate ||
//                                 !selectedTime ||
//                                 !acceptTerms
//                             }
//                             className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-4 rounded-xl transition duration-200 text-base"
//                         >
//                             {submitting ? (
//                                 <div className="flex items-center justify-center gap-2">
//                                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                                     Processing...
//                                 </div>
//                             ) : (
//                                 "Confirm Booking"
//                             )}
//                         </button>

//                         <p className="text-xs text-center text-gray-500 mt-4">
//                             By clicking Confirm Booking, you agree to our terms
//                             and conditions and privacy policy
//                         </p>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CalendarIntegrationMobile;
