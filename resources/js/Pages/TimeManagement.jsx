// import Wrapper from "@/AdminWrapper/Wrapper";
// import { Calendar } from "@/components/ui/calendar";
// import {
//     Clock,
//     ChevronLeft,
//     ChevronRight,
//     RefreshCw,
//     Save,
//     Info,
// } from "lucide-react";
// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import toast, { Toaster } from "react-hot-toast";

// const TimeManagement = () => {
//     const [selectedDate, setSelectedDate] = useState(new Date());
//     const [timeSlots, setTimeSlots] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [customStartTime, setCustomStartTime] = useState("07:00");
//     const [defaultStartTime] = useState("07:00");
//     const [customStartInfo, setCustomStartInfo] = useState(null);
//     const [editingIndex, setEditingIndex] = useState(null);
//     const [stats, setStats] = useState({
//         total: 0,
//         available: 0,
//         reserved: 0,
//         blocked: 0,
//         default: 0,
//         custom: 0,
//     });

//     const inputRefs = useRef({});

//     useEffect(() => {
//         fetchTimeSlots();
//     }, [selectedDate]);

//     const fetchTimeSlots = async () => {
//         try {
//             setLoading(true);
//             const formattedDate = formatDateKey(selectedDate);

//             const response = await axios.get(route("ourtimeslots.get"), {
//                 params: {
//                     date: formattedDate,
//                 },
//             });

//             if (response.data.success) {
//                 // Add isEditing property to each slot
//                 const slotsWithEdit = response.data.slots.map((slot) => ({
//                     ...slot,
//                     isEditing: false,
//                 }));

//                 setTimeSlots(slotsWithEdit);
//                 setCustomStartTime(response.data.current_start);
//                 setCustomStartInfo(response.data.custom_start_info);

//                 // Calculate stats
//                 const total = slotsWithEdit.length;
//                 const available = slotsWithEdit.filter(
//                     (slot) => slot.status === "available",
//                 ).length;
//                 const reserved = slotsWithEdit.filter(
//                     (slot) => slot.status === "reserved",
//                 ).length;
//                 const blocked = slotsWithEdit.filter(
//                     (slot) => slot.status === "blocked",
//                 ).length;
//                 const default_count = slotsWithEdit.filter(
//                     (slot) => slot.is_default_time,
//                 ).length;
//                 const custom_count = total - default_count;

//                 setStats({
//                     total,
//                     available,
//                     reserved,
//                     blocked,
//                     default: default_count,
//                     custom: custom_count,
//                 });
//             }
//         } catch (error) {
//             console.error("Error fetching time slots:", error);
//             toast.error("Failed to load time slots");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const formatDateKey = (date) => {
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, "0");
//         const day = String(date.getDate()).padStart(2, "0");
//         return `${year}-${month}-${day}`;
//     };

//     const formatDisplayDate = (date) => {
//         return date.toLocaleDateString("en-US", {
//             weekday: "long",
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//         });
//     };

//     // Check if a date is in the past
//     const isPastDate = (date) => {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         return date < today;
//     };

//     const handlePreviousDay = () => {
//         const newDate = new Date(selectedDate);
//         newDate.setDate(selectedDate.getDate() - 1);
//         setSelectedDate(newDate);
//     };

//     const handleNextDay = () => {
//         const newDate = new Date(selectedDate);
//         newDate.setDate(selectedDate.getDate() + 1);
//         setSelectedDate(newDate);
//     };

//     const handleToday = () => {
//         setSelectedDate(new Date());
//     };

//     const handleDateSelect = (date) => {
//         if (date) {
//             setSelectedDate(date);
//         }
//     };

//     const handleTimeChange = (e) => {
//         setCustomStartTime(e.target.value);
//     };

//     const handleUpdateAvailability = async () => {
//         // Find which slots will be affected (from the selected time onwards)
//         const targetTimeIndex = timeSlots.findIndex(
//             (slot) => slot.start_time >= customStartTime,
//         );

//         if (targetTimeIndex === -1) {
//             toast.error("No slots found at or after the selected time");
//             return;
//         }

//         const slotsToUpdate = timeSlots.length - targetTimeIndex;

//         const confirmMessage = `This will update ${slotsToUpdate} slot(s) from ${customStartTime} onwards to follow 20-minute intervals.\n\nExisting custom edits before this time will be preserved.\n\nDo you want to continue?`;

//         if (!window.confirm(confirmMessage)) {
//             return;
//         }

//         try {
//             setLoading(true);
//             const formattedDate = formatDateKey(selectedDate);

//             const response = await axios.post(route("ourtimeslots.update"), {
//                 date: formattedDate,
//                 start_time: customStartTime,
//                 preserve_custom: true, // This tells backend to preserve existing custom slots before this time
//             });

//             if (response.data.success) {
//                 toast.success(
//                     `Updated ${slotsToUpdate} slot(s) from ${customStartTime} onwards`,
//                 );
//                 fetchTimeSlots();
//             }
//         } catch (error) {
//             console.error("Error updating time slots:", error);
//             toast.error(
//                 error.response?.data?.message || "Failed to update time slots",
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleResetToDefault = async () => {
//         if (
//             !confirm(
//                 "Are you sure you want to reset to default 7:00 AM start time? This will reset ALL slots for this date.",
//             )
//         ) {
//             return;
//         }

//         try {
//             setLoading(true);
//             const formattedDate = formatDateKey(selectedDate);

//             const response = await axios.post(route("ourtimeslots.reset"), {
//                 date: formattedDate,
//             });

//             if (response.data.success) {
//                 setCustomStartTime(defaultStartTime);
//                 toast.success("Reset to default schedule");
//                 fetchTimeSlots();
//             }
//         } catch (error) {
//             console.error("Error resetting time slots:", error);
//             toast.error("Failed to reset time slots");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleSlotClick = (slot, index) => {
//         // Only allow editing available slots
//         if (slot.status === "available") {
//             const updatedSlots = [...timeSlots];
//             updatedSlots[index] = { ...slot, isEditing: true };
//             setTimeSlots(updatedSlots);
//             setEditingIndex(index);

//             // Focus the input after render
//             setTimeout(() => {
//                 if (inputRefs.current[index]) {
//                     inputRefs.current[index].focus();
//                 }
//             }, 100);
//         } else {
//             toast.error("Cannot edit reserved or blocked slots");
//         }
//     };

//     const handleTimeEditBlur = (e, slot, index) => {
//         handleTimeEditSubmit(e, slot, index);
//     };

//     const handleTimeEditKeyPress = (e, slot, index) => {
//         if (e.key === "Enter") {
//             handleTimeEditSubmit(e, slot, index);
//         } else if (e.key === "Escape") {
//             cancelEditing(index);
//         }
//     };

//     const handleTimeEditSubmit = async (e, slot, index) => {
//         const newTime = e.target.value;

//         if (!newTime) {
//             cancelEditing(index);
//             return;
//         }

//         // Validate time format
//         const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
//         if (!timeRegex.test(newTime)) {
//             toast.error("Please enter a valid time (HH:MM)");
//             cancelEditing(index);
//             return;
//         }

//         // Validate time range (7:00 AM to 6:00 PM)
//         const timeValue = parseInt(newTime.replace(":", ""));
//         if (timeValue < 700 || timeValue > 1800) {
//             toast.error("Time must be between 7:00 AM and 6:00 PM");
//             cancelEditing(index);
//             return;
//         }

//         // Calculate how many slots will be affected (current slot and all subsequent slots)
//         const affectedSlotsCount = timeSlots.length - index;

//         // Show confirmation message about subsequent slots being updated
//         const confirmMessage = `Changing this slot to ${newTime} will automatically adjust all ${affectedSlotsCount - 1} following slots to maintain 20-minute intervals.\n\nDo you want to continue?`;

//         if (!window.confirm(confirmMessage)) {
//             cancelEditing(index);
//             return;
//         }

//         try {
//             setLoading(true);

//             const formattedDate = formatDateKey(selectedDate);

//             // NEW APPROACH: Send the edited time and let backend handle all subsequent slots
//             const response = await axios.post(
//                 route("ourtimeslots.update-single-with-subsequent"),
//                 {
//                     date: formattedDate,
//                     start_index: index,
//                     new_start_time: newTime,
//                 },
//             );

//             if (response.data.success) {
//                 toast.success(`Time slots updated from ${newTime} onwards`);

//                 // Update the time slots with new times
//                 const updatedSlots = response.data.slots.map((slot) => ({
//                     ...slot,
//                     isEditing: false,
//                 }));

//                 setTimeSlots(updatedSlots);

//                 // Update custom start info if needed
//                 if (response.data.custom_start_info) {
//                     setCustomStartInfo(response.data.custom_start_info);
//                 }

//                 // Recalculate stats
//                 const total = updatedSlots.length;
//                 const available = updatedSlots.filter(
//                     (slot) => slot.status === "available",
//                 ).length;
//                 const reserved = updatedSlots.filter(
//                     (slot) => slot.status === "reserved",
//                 ).length;
//                 const blocked = updatedSlots.filter(
//                     (slot) => slot.status === "blocked",
//                 ).length;
//                 const default_count = updatedSlots.filter(
//                     (slot) => slot.is_default_time,
//                 ).length;
//                 const custom_count = total - default_count;

//                 setStats({
//                     total,
//                     available,
//                     reserved,
//                     blocked,
//                     default: default_count,
//                     custom: custom_count,
//                 });
//             }
//         } catch (error) {
//             console.error("Error updating time slots:", error);
//             toast.error(
//                 error.response?.data?.message || "Failed to update time slots",
//             );
//             cancelEditing(index);
//         } finally {
//             setLoading(false);
//             setEditingIndex(null);
//         }
//     };

//     const cancelEditing = (index) => {
//         const updatedSlots = [...timeSlots];
//         updatedSlots[index] = { ...updatedSlots[index], isEditing: false };
//         setTimeSlots(updatedSlots);
//         setEditingIndex(null);
//     };

//     // Custom day cell content to show availability indicator
//     const renderDayContent = (date) => {
//         const isSelected =
//             selectedDate && date.toDateString() === selectedDate.toDateString();
//         const isPast = isPastDate(date);

//         return (
//             <div className="relative">
//                 <span className={isPast ? "text-gray-400" : ""}>
//                     {date.getDate()}
//                 </span>
//                 {!isPast && (
//                     <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full"></div>
//                 )}
//             </div>
//         );
//     };

//     const getStatusBadge = (status) => {
//         switch (status) {
//             case "available":
//                 return (
//                     <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
//                         Available
//                     </span>
//                 );
//             case "reserved":
//                 return (
//                     <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
//                         Reserved
//                     </span>
//                 );
//             case "blocked":
//                 return (
//                     <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
//                         Blocked
//                     </span>
//                 );
//             default:
//                 return (
//                     <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
//                         {status}
//                     </span>
//                 );
//         }
//     };

//     return (
//         <>
//             <Wrapper>
//                 <Toaster
//                     position="top-right"
//                     toastOptions={{
//                         duration: 4000,
//                         style: {
//                             background: "#363636",
//                             color: "#fff",
//                         },
//                         success: {
//                             duration: 3000,
//                             style: {
//                                 background: "#10b981",
//                                 color: "#fff",
//                             },
//                         },
//                         error: {
//                             duration: 4000,
//                             style: {
//                                 background: "#ef4444",
//                                 color: "#fff",
//                             },
//                         },
//                     }}
//                 />
//                 <div className="px-2 sm:px-6 lg:px-8">
//                     {/* Header */}
//                     <div className="p-6 sm:p-8 mb-6">
//                         <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
//                             Time Management
//                         </h1>
//                     </div>

//                     {/* Stats Cards */}
//                     {/* <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-6">
//                         <div className="bg-white rounded-lg shadow-sm p-4">
//                             <div className="text-sm text-gray-500 mb-1">
//                                 Total
//                             </div>
//                             <div className="text-2xl font-bold text-gray-900">
//                                 {stats.total}
//                             </div>
//                         </div>
//                         <div className="bg-white rounded-lg shadow-sm p-4">
//                             <div className="text-sm text-gray-500 mb-1">
//                                 Available
//                             </div>
//                             <div className="text-2xl font-bold text-green-600">
//                                 {stats.available}
//                             </div>
//                         </div>
//                         <div className="bg-white rounded-lg shadow-sm p-4">
//                             <div className="text-sm text-gray-500 mb-1">
//                                 Reserved
//                             </div>
//                             <div className="text-2xl font-bold text-blue-600">
//                                 {stats.reserved}
//                             </div>
//                         </div>
//                         <div className="bg-white rounded-lg shadow-sm p-4">
//                             <div className="text-sm text-gray-500 mb-1">
//                                 Blocked
//                             </div>
//                             <div className="text-2xl font-bold text-red-600">
//                                 {stats.blocked}
//                             </div>
//                         </div>
//                         <div className="bg-white rounded-lg shadow-sm p-4">
//                             <div className="text-sm text-gray-500 mb-1">
//                                 Default
//                             </div>
//                             <div className="text-2xl font-bold text-purple-600">
//                                 {stats.default}
//                             </div>
//                         </div>
//                         <div className="bg-white rounded-lg shadow-sm p-4">
//                             <div className="text-sm text-gray-500 mb-1">
//                                 Custom
//                             </div>
//                             <div className="text-2xl font-bold text-orange-600">
//                                 {stats.custom}
//                             </div>
//                         </div>
//                     </div> */}

//                     {/* Main Content - Calendar and Controls */}
//                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                         {/* Calendar Section */}
//                         <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-1 ">
//                             <div className="mb-4">
//                                 <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
//                                     Select a Date
//                                 </h2>
//                                 <p className="text-xs sm:text-sm text-gray-500">
//                                     Click on a date to manage its time slots
//                                 </p>
//                             </div>
//                             {/* <Calendar
//                                 mode="single"
//                                 selected={selectedDate}
//                                 onSelect={handleDateSelect}
//                                 disabled={(date) => isPastDate(date)}
//                                 className="rounded-md border [&_.rdp-day_selected]:bg-emerald-600 [&_.rdp-day_selected]:text-white [&_.rdp-day_selected:hover]:bg-emerald-700 [&_.rdp-button:hover]:bg-emerald-50 [&_.rdp-day_today]:bg-gray-100"
//                                 components={{
//                                     DayContent: ({ date }) =>
//                                         renderDayContent(date),
//                                 }}
//                             /> */}
//                             <Calendar
//                                 mode="single"
//                                 selected={selectedDate}
//                                 onSelect={handleDateSelect}
//                                 disabled={(date) => isPastDate(date)}
//                                 captionLayout="dropdown"
//                                 className="rounded-md border [&_.rdp-day_selected]:bg-emerald-600 [&_.rdp-day_selected]:text-white [&_.rdp-day_selected:hover]:bg-emerald-700 [&_.rdp-button:hover]:bg-emerald-50 [&_.rdp-day_today]:bg-gray-100"
//                                 components={{
//                                     DayContent: ({ date }) =>
//                                         renderDayContent(date),
//                                 }}
//                                 fromYear={new Date().getFullYear()} // Current year only
//                                 toYear={new Date().getFullYear() + 8} // Current year + 8 years
//                                 formatters={{
//                                     formatMonthCaption: (date) => {
//                                         return date.toLocaleString("default", {
//                                             month: "long",
//                                         });
//                                     },
//                                     formatYearCaption: (date) => {
//                                         return date.getFullYear().toString();
//                                     },
//                                 }}
//                             />
//                             {/* Date Navigation */}
//                             {/* <div className="flex items-center justify-between mt-4">
//                                 <button
//                                     onClick={handlePreviousDay}
//                                     className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                                 >
//                                     <ChevronLeft size={20} />
//                                 </button>
//                                 <button
//                                     onClick={handleToday}
//                                     className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
//                                 >
//                                     Today
//                                 </button>
//                                 <button
//                                     onClick={handleNextDay}
//                                     className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                                 >
//                                     <ChevronRight size={20} />
//                                 </button>
//                             </div> */}
//                         </div>

//                         {/* Time Slot Configuration and Grid */}
//                         <div className="lg:col-span-2 space-y-6">
//                             {/* Availability Control */}
//                             {/* <div className="bg-white rounded-lg shadow-sm p-6">
//                                 <h2 className="text-lg font-semibold text-gray-800 mb-4">
//                                     Time Slot Configuration
//                                 </h2>
                                
//                                 <div className="flex flex-col sm:flex-row items-end gap-4">
//                                     <div className="flex-1">
//                                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                                             Custom Start Time
//                                         </label>
//                                         <input
//                                             type="time"
//                                             value={customStartTime}
//                                             onChange={handleTimeChange}
//                                             min="07:00"
//                                             max="17:30"
//                                             step="300"
//                                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                                         />
//                                         <p className="text-xs text-gray-500 mt-1">
//                                             Select a time to update all slots from this point onwards
//                                         </p>
//                                     </div>
                                    
//                                     <div className="flex gap-2">
//                                         <button
//                                             onClick={handleUpdateAvailability}
//                                             disabled={loading || customStartTime === defaultStartTime}
//                                             className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-emerald-300 disabled:cursor-not-allowed"
//                                         >
//                                             <Save size={18} />
//                                             <span>Apply From {customStartTime} Onwards</span>
//                                         </button>
                                        
//                                         <button
//                                             onClick={handleResetToDefault}
//                                             disabled={loading}
//                                             className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
//                                         >
//                                             Reset to 7:00 AM
//                                         </button>
                                        
//                                         <button
//                                             onClick={fetchTimeSlots}
//                                             className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                                             disabled={loading}
//                                             title="Refresh slots"
//                                         >
//                                             <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div> */}

//                             {/* Time Slots Grid */}
//                             <div className="bg-white rounded-lg shadow-sm p-6">
//                                 <div className="flex items-center justify-between mb-4">
//                                     <h2 className="text-lg font-semibold text-gray-800">
//                                         Time Slots for{" "}
//                                         {formatDisplayDate(selectedDate)}
//                                     </h2>
//                                     <button
//                                         onClick={handleResetToDefault}
//                                         disabled={loading}
//                                         className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
//                                     >
//                                         Reset to 7:00 AM
//                                     </button>
//                                 </div>

//                                 {loading ? (
//                                     <div className="text-center py-12">
//                                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
//                                         <p className="text-gray-600 mt-4">
//                                             Loading time slots...
//                                         </p>
//                                     </div>
//                                 ) : (
//                                     <>
//                                         {timeSlots.length > 0 ? (
//                                             <div>
//                                                 {/* Visual divider for custom start */}
//                                                 {customStartInfo && (
//                                                     <div className="relative mb-4">
//                                                         <div className="absolute inset-0 flex items-center">
//                                                             <div className="w-full border-t-2 border-dashed border-blue-300"></div>
//                                                         </div>
//                                                         <div className="relative flex justify-center">
//                                                             <span className="bg-white px-3 py-1 text-xs font-medium text-blue-600 rounded-full border border-blue-300">
//                                                                 Custom schedule
//                                                                 starts here ↓
//                                                             </span>
//                                                         </div>
//                                                     </div>
//                                                 )}

//                                                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
//                                                     {timeSlots
//                                                         .filter(
//                                                             (slot) =>
//                                                                 slot.status !==
//                                                                     "blocked" &&
//                                                                 slot.status !==
//                                                                     "reserved",
//                                                         )
//                                                         .map((slot, index) => (
//                                                             <div
//                                                                 key={index}
//                                                                 className={`p-3 rounded-lg border-2 relative cursor-pointer transition-all hover:shadow-md ${
//                                                                     slot.status ===
//                                                                     "available"
//                                                                         ? "border-green-200 bg-green-50 hover:border-green-400"
//                                                                         : slot.status ===
//                                                                             "reserved"
//                                                                           ? "border-blue-200 bg-blue-50 hover:border-blue-400 cursor-not-allowed opacity-75"
//                                                                           : slot.status ===
//                                                                               "blocked"
//                                                                             ? "border-red-200 bg-red-50 hover:border-red-400 cursor-not-allowed opacity-75"
//                                                                             : "border-gray-200 bg-gray-50 hover:border-gray-400"
//                                                                 } ${!slot.is_default_time ? "ring-2 ring-purple-200" : ""}`}
//                                                                 onClick={() =>
//                                                                     slot.status ===
//                                                                         "available" &&
//                                                                     handleSlotClick(
//                                                                         slot,
//                                                                         index,
//                                                                     )
//                                                                 }
//                                                             >
//                                                                 {customStartInfo &&
//                                                                     index ===
//                                                                         customStartInfo.index && (
//                                                                         <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
//                                                                             <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                                                                         </div>
//                                                                     )}

//                                                                 {slot.isEditing ? (
//                                                                     <div
//                                                                         onClick={(
//                                                                             e,
//                                                                         ) =>
//                                                                             e.stopPropagation()
//                                                                         }
//                                                                     >
//                                                                         <input
//                                                                             type="time"
//                                                                             defaultValue={slot.start_time.substring(
//                                                                                 0,
//                                                                                 5,
//                                                                             )}
//                                                                             step="300"
//                                                                             className="w-full px-1 py-0.5 text-sm border border-emerald-500 rounded focus:outline-none focus:ring-2 focus:ring-emerald-300"
//                                                                             ref={(
//                                                                                 el,
//                                                                             ) =>
//                                                                                 (inputRefs.current[
//                                                                                     index
//                                                                                 ] =
//                                                                                     el)
//                                                                             }
//                                                                             onBlur={(
//                                                                                 e,
//                                                                             ) =>
//                                                                                 handleTimeEditBlur(
//                                                                                     e,
//                                                                                     slot,
//                                                                                     index,
//                                                                                 )
//                                                                             }
//                                                                             onKeyDown={(
//                                                                                 e,
//                                                                             ) =>
//                                                                                 handleTimeEditKeyPress(
//                                                                                     e,
//                                                                                     slot,
//                                                                                     index,
//                                                                                 )
//                                                                             }
//                                                                         />
//                                                                         <div className="mt-1 text-[10px] text-emerald-600 font-medium">
//                                                                             Enter
//                                                                             to
//                                                                             save,
//                                                                             Esc
//                                                                             to
//                                                                             cancel
//                                                                         </div>
//                                                                     </div>
//                                                                 ) : (
//                                                                     <>
//                                                                         <div className="text-sm font-medium text-gray-900 mb-1">
//                                                                             {
//                                                                                 slot.formatted_start
//                                                                             }
//                                                                         </div>
//                                                                         <div>
//                                                                             {getStatusBadge(
//                                                                                 slot.status,
//                                                                             )}
//                                                                         </div>
//                                                                         {/* {!slot.is_default_time && (
//                                                                             <div className="mt-1 text-[10px] text-purple-600 font-medium">
//                                                                                 Custom
//                                                                             </div>
//                                                                         )} */}
//                                                                     </>
//                                                                 )}
//                                                             </div>
//                                                         ))}
//                                                 </div>
//                                             </div>
//                                         ) : (
//                                             <div className="text-center py-12">
//                                                 <Clock
//                                                     size={48}
//                                                     className="mx-auto text-gray-400 mb-4"
//                                                 />
//                                                 <p className="text-gray-500 text-lg">
//                                                     No time slots available for
//                                                     this date
//                                                 </p>
//                                                 <p className="text-gray-400 text-sm mt-2">
//                                                     Try selecting a different
//                                                     date or configure the start
//                                                     time above
//                                                 </p>
//                                             </div>
//                                         )}
//                                     </>
//                                 )}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Legend */}
//                     {/* <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
//                         <h3 className="text-sm font-medium text-gray-700 mb-3">Status Legend</h3>
//                         <div className="flex flex-wrap gap-4">
//                             <div className="flex items-center gap-2">
//                                 <div className="w-4 h-4 bg-green-50 border-2 border-green-200 rounded"></div>
//                                 <span className="text-sm text-gray-600">Available (click to edit individually)</span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <div className="w-4 h-4 bg-blue-50 border-2 border-blue-200 rounded"></div>
//                                 <span className="text-sm text-gray-600">Reserved (cannot edit)</span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <div className="w-4 h-4 bg-red-50 border-2 border-red-200 rounded"></div>
//                                 <span className="text-sm text-gray-600">Blocked (cannot edit)</span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <div className="w-4 h-4 bg-white border-2 border-gray-200 rounded ring-2 ring-purple-200"></div>
//                                 <span className="text-sm text-gray-600">Custom schedule slot</span>
//                             </div>
//                         </div>
//                     </div> */}

//                     {/* How it works */}
//                     {/* <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
//                         <h3 className="text-sm font-medium text-gray-700 mb-2">How it works</h3>
//                         <div className="text-sm text-gray-600 space-y-1">
//                             <p>• <span className="font-medium">Individual editing:</span> Click on any available (green) slot to edit its time</p>
//                             <p>• <span className="font-medium">Smart cascading updates:</span> When you change a single time, all following slots automatically adjust to maintain 30-minute intervals</p>
//                             <p>• <span className="font-medium">Example:</span> If you change 10:00 AM to 10:45 AM, following slots become: 11:15 AM, 11:45 AM, etc.</p>
//                             <p>• <span className="font-medium">Bulk update:</span> Use the "Apply From [time] Onwards" button to update all slots from a specific time</p>
//                             <p>• <span className="font-medium">Reserved or blocked slots</span> cannot be edited</p>
//                             <p className="mt-2 text-xs text-gray-500">Press Enter to save your changes or Escape to cancel when editing individual slots.</p>
//                         </div>
//                     </div> */}
//                 </div>
//             </Wrapper>
//         </>
//     );
// };

// export default TimeManagement;



import Wrapper from "@/AdminWrapper/Wrapper";
import { Calendar } from "@/components/ui/calendar";
import {
    Clock,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Save,
    Info,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const TimeManagement = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [customStartTime, setCustomStartTime] = useState("07:00");
    const [defaultStartTime] = useState("07:00");
    const [customStartInfo, setCustomStartInfo] = useState(null);
    const [editingIndex, setEditingIndex] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        reserved: 0,
        blocked: 0,
        default: 0,
        custom: 0,
    });

    const inputRefs = useRef({});

    useEffect(() => {
        fetchTimeSlots();
    }, [selectedDate]);

    const fetchTimeSlots = async () => {
        try {
            setLoading(true);
            const formattedDate = formatDateKey(selectedDate);

            const response = await axios.get(route("ourtimeslots.get"), {
                params: {
                    date: formattedDate,
                },
            });

            if (response.data.success) {
                // Add isEditing property to each slot and ensure formatted_start exists
                const slotsWithEdit = response.data.slots.map((slot) => ({
                    ...slot,
                    isEditing: false,
                    // Ensure formatted_start is set, if not, format it
                    formatted_start: slot.formatted_start || formatTime(slot.start_time),
                }));

                setTimeSlots(slotsWithEdit);
                setCustomStartTime(response.data.current_start);
                setCustomStartInfo(response.data.custom_start_info);

                // Calculate stats
                calculateStats(slotsWithEdit);
            }
        } catch (error) {
            console.error("Error fetching time slots:", error);
            toast.error("Failed to load time slots");
        } finally {
            setLoading(false);
        }
    };

    // Helper function to format time
    const formatTime = (timeString) => {
        if (!timeString) return "";
        // Convert "07:00:00" or "07:00" to "7:00 AM"
        const [hours, minutes] = timeString.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const calculateStats = (slots) => {
        const total = slots.length;
        const available = slots.filter(
            (slot) => slot.status === "available",
        ).length;
        const reserved = slots.filter(
            (slot) => slot.status === "reserved",
        ).length;
        const blocked = slots.filter(
            (slot) => slot.status === "blocked",
        ).length;
        const default_count = slots.filter(
            (slot) => slot.is_default_time,
        ).length;
        const custom_count = total - default_count;

        setStats({
            total,
            available,
            reserved,
            blocked,
            default: default_count,
            custom: custom_count,
        });
    };

    const formatDateKey = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const formatDisplayDate = (date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Check if a date is in the past
    const isPastDate = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const handlePreviousDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() - 1);
        setSelectedDate(newDate);
    };

    const handleNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + 1);
        setSelectedDate(newDate);
    };

    const handleToday = () => {
        setSelectedDate(new Date());
    };

    const handleDateSelect = (date) => {
        if (date) {
            setSelectedDate(date);
        }
    };

    const handleResetToDefault = async () => {
        if (
            !confirm(
                "Are you sure you want to reset to default 7:00 AM start time? This will reset ALL slots for this date.",
            )
        ) {
            return;
        }

        try {
            setLoading(true);
            const formattedDate = formatDateKey(selectedDate);

            const response = await axios.post(route("ourtimeslots.reset"), {
                date: formattedDate,
            });

            if (response.data.success) {
                setCustomStartTime(defaultStartTime);
                toast.success("Reset to default schedule");
                await fetchTimeSlots(); // Refresh the slots
            }
        } catch (error) {
            console.error("Error resetting time slots:", error);
            toast.error("Failed to reset time slots");
        } finally {
            setLoading(false);
        }
    };

    const handleSlotClick = (slot, index) => {
        // Only allow editing available slots
        if (slot.status === "available") {
            // First, reset any existing editing states
            const updatedSlots = timeSlots.map(s => ({ ...s, isEditing: false }));
            updatedSlots[index] = { ...slot, isEditing: true };
            setTimeSlots(updatedSlots);
            setEditingIndex(index);

            // Focus the input after render
            setTimeout(() => {
                if (inputRefs.current[index]) {
                    inputRefs.current[index].focus();
                }
            }, 100);
        } else {
            toast.error("Cannot edit reserved or blocked slots");
        }
    };

    const handleTimeEditBlur = (e, slot, index) => {
        handleTimeEditSubmit(e, slot, index);
    };

    const handleTimeEditKeyPress = (e, slot, index) => {
        if (e.key === "Enter") {
            handleTimeEditSubmit(e, slot, index);
        } else if (e.key === "Escape") {
            cancelEditing(index);
        }
    };

    const handleTimeEditSubmit = async (e, slot, index) => {
        const newTime = e.target.value;

        if (!newTime) {
            cancelEditing(index);
            return;
        }

        // Validate time format
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(newTime)) {
            toast.error("Please enter a valid time (HH:MM)");
            cancelEditing(index);
            return;
        }

        // Validate time range (7:00 AM to 6:00 PM)
        const timeValue = parseInt(newTime.replace(":", ""));
        if (timeValue < 700 || timeValue > 1800) {
            toast.error("Time must be between 7:00 AM and 6:00 PM");
            cancelEditing(index);
            return;
        }

        // Calculate how many slots will be affected
        const affectedSlotsCount = timeSlots.length - index;

        // Show confirmation message
        const confirmMessage = `Changing this slot to ${newTime} will automatically adjust all ${affectedSlotsCount - 1} following slots to maintain 20-minute intervals.\n\nDo you want to continue?`;

        if (!window.confirm(confirmMessage)) {
            cancelEditing(index);
            return;
        }

        try {
            setLoading(true);

            const formattedDate = formatDateKey(selectedDate);

            const response = await axios.post(
                route("ourtimeslots.update-single-with-subsequent"),
                {
                    date: formattedDate,
                    start_index: index,
                    new_start_time: newTime,
                },
            );

            if (response.data.success) {
                toast.success(`Time slots updated from ${newTime} onwards`);

                // CRITICAL FIX: Properly update the state with the new data
                const updatedSlots = response.data.slots.map((slot, idx) => ({
                    ...slot,
                    isEditing: false, // Make sure editing mode is disabled for all slots
                    // Ensure formatted_start exists
                    formatted_start: slot.formatted_start || formatTime(slot.start_time),
                }));

                // Force a state update with the new slots
                setTimeSlots(updatedSlots);
                
                // Update custom start info if provided
                if (response.data.custom_start_info) {
                    setCustomStartInfo(response.data.custom_start_info);
                }
                
                // Update custom start time if needed
                if (response.data.current_start) {
                    setCustomStartTime(response.data.current_start);
                }

                // Recalculate stats with the new data
                calculateStats(updatedSlots);
                
                // Clear editing index
                setEditingIndex(null);
            } else {
                throw new Error(response.data.message || "Failed to update slots");
            }
        } catch (error) {
            console.error("Error updating time slots:", error);
            toast.error(
                error.response?.data?.message || error.message || "Failed to update time slots",
            );
            cancelEditing(index);
        } finally {
            setLoading(false);
        }
    };

    const cancelEditing = (index) => {
        const updatedSlots = [...timeSlots];
        if (updatedSlots[index]) {
            updatedSlots[index] = { ...updatedSlots[index], isEditing: false };
            setTimeSlots(updatedSlots);
        }
        setEditingIndex(null);
    };

    // Custom day cell content to show availability indicator
    const renderDayContent = (date) => {
        const isPast = isPastDate(date);

        return (
            <div className="relative">
                <span className={isPast ? "text-gray-400" : ""}>
                    {date.getDate()}
                </span>
                {!isPast && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full"></div>
                )}
            </div>
        );
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "available":
                return (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Available
                    </span>
                );
            case "reserved":
                return (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        Reserved
                    </span>
                );
            case "blocked":
                return (
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        Blocked
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {status}
                    </span>
                );
        }
    };

    return (
        <>
            <Wrapper>
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
                <div className="px-2 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="p-6 sm:p-8 mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                            Time Management
                        </h1>
                    </div>

                    {/* Main Content - Calendar and Controls */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Calendar Section */}
                        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-1">
                            <div className="mb-4">
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                                    Select a Date
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    Click on a date to manage its time slots
                                </p>
                            </div>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                disabled={(date) => isPastDate(date)}
                                captionLayout="dropdown"
                                className="rounded-md border [&_.rdp-day_selected]:bg-emerald-600 [&_.rdp-day_selected]:text-white [&_.rdp-day_selected:hover]:bg-emerald-700 [&_.rdp-button:hover]:bg-emerald-50 [&_.rdp-day_today]:bg-gray-100"
                                components={{
                                    DayContent: ({ date }) =>
                                        renderDayContent(date),
                                }}
                                fromYear={new Date().getFullYear()}
                                toYear={new Date().getFullYear() + 8}
                                formatters={{
                                    formatMonthCaption: (date) => {
                                        return date.toLocaleString("default", {
                                            month: "long",
                                        });
                                    },
                                    formatYearCaption: (date) => {
                                        return date.getFullYear().toString();
                                    },
                                }}
                            />
                        </div>

                        {/* Time Slot Grid */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        Time Slots for{" "}
                                        {formatDisplayDate(selectedDate)}
                                    </h2>
                                    <button
                                        onClick={handleResetToDefault}
                                        disabled={loading}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        Reset to 7:00 AM
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                                        <p className="text-gray-600 mt-4">
                                            Loading time slots...
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {timeSlots.length > 0 ? (
                                            <div>
                                                {/* Visual divider for custom start */}
                                                {customStartInfo && customStartInfo.index !== undefined && (
                                                    <div className="relative mb-4">
                                                        <div className="absolute inset-0 flex items-center">
                                                            <div className="w-full border-t-2 border-dashed border-blue-300"></div>
                                                        </div>
                                                        <div className="relative flex justify-center">
                                                            <span className="bg-white px-3 py-1 text-xs font-medium text-blue-600 rounded-full border border-blue-300">
                                                                Custom schedule starts here ↓
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                    {timeSlots.map((slot, index) => {
                                                        // Display time based on editing state
                                                        const displayTime = slot.isEditing ? null : (
                                                            <div className="text-sm font-medium text-gray-900 mb-1">
                                                                {slot.formatted_start || formatTime(slot.start_time)}
                                                            </div>
                                                        );
                                                        
                                                        return (
                                                            <div
                                                                key={`${selectedDate}-${index}-${slot.start_time}`}
                                                                className={`p-3 rounded-lg border-2 relative transition-all hover:shadow-md ${
                                                                    slot.status === "available"
                                                                        ? "border-green-200 bg-green-50 hover:border-green-400 cursor-pointer"
                                                                        : slot.status === "reserved"
                                                                        ? "border-blue-200 bg-blue-50 cursor-not-allowed opacity-75"
                                                                        : slot.status === "blocked"
                                                                        ? "border-red-200 bg-red-50 cursor-not-allowed opacity-75"
                                                                        : "border-gray-200 bg-gray-50"
                                                                } ${!slot.is_default_time ? "ring-2 ring-purple-200" : ""}`}
                                                                onClick={() =>
                                                                    slot.status === "available" &&
                                                                    !slot.isEditing &&
                                                                    handleSlotClick(slot, index)
                                                                }
                                                            >
                                                                {customStartInfo && 
                                                                 customStartInfo.index === index && (
                                                                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                    </div>
                                                                )}

                                                                {slot.isEditing ? (
                                                                    <div
                                                                        onClick={(e) =>
                                                                            e.stopPropagation()
                                                                        }
                                                                        className="w-full"
                                                                    >
                                                                        <input
                                                                            type="time"
                                                                            defaultValue={slot.start_time.substring(0, 5)}
                                                                            step="300"
                                                                            className="w-full px-2 py-1 text-sm border border-emerald-500 rounded focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                                                            ref={(el) =>
                                                                                (inputRefs.current[index] = el)
                                                                            }
                                                                            onBlur={(e) =>
                                                                                handleTimeEditBlur(
                                                                                    e,
                                                                                    slot,
                                                                                    index,
                                                                                )
                                                                            }
                                                                            onKeyDown={(e) =>
                                                                                handleTimeEditKeyPress(
                                                                                    e,
                                                                                    slot,
                                                                                    index,
                                                                                )
                                                                            }
                                                                        />
                                                                        <div className="mt-1 text-[10px] text-emerald-600 font-medium">
                                                                            Enter to save, Esc to cancel
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        {displayTime}
                                                                        <div>
                                                                            {getStatusBadge(slot.status)}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <Clock
                                                    size={48}
                                                    className="mx-auto text-gray-400 mb-4"
                                                />
                                                <p className="text-gray-500 text-lg">
                                                    No time slots available for this date
                                                </p>
                                                <p className="text-gray-400 text-sm mt-2">
                                                    Try selecting a different date
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Wrapper>
        </>
    );
};

export default TimeManagement;