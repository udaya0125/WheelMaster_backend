// import React, { useState, useEffect } from 'react'
// import { ChevronDown, MapPin, Calendar as CalendarIcon, Clock, BookOpen, CheckCircle } from 'lucide-react'
// import axios from 'axios'
// import toast, { Toaster } from 'react-hot-toast'
// import BookingForm from './BookingForm' 

// const CalendarIntegrationMobile = ({ price }) => {
//   const [selectedDate, setSelectedDate] = useState('')
//   const [selectedTime, setSelectedTime] = useState('')
//   const [showOrderSummary, setShowOrderSummary] = useState(false)
//   const [saved, setSaved] = useState(false)
  
//   // New state from CalendarIntegration
//   const [timeSlots, setTimeSlots] = useState({})
//   const [loading, setLoading] = useState(false)
//   const [showNextAvailability, setShowNextAvailability] = useState(false)
//   const [nextAvailableDates, setNextAvailableDates] = useState([])
//   const [availableDates, setAvailableDates] = useState([])
//   const [showBookingForm, setShowBookingForm] = useState(false)

//   // Format date as YYYY-MM-DD for API calls
//   const formatDateKey = (date) => {
//     if (!date) return ""
//     const d = new Date(date)
//     const year = d.getFullYear()
//     const month = String(d.getMonth() + 1).padStart(2, "0")
//     const day = String(d.getDate()).padStart(2, "0")
//     return `${year}-${month}-${day}`
//   }

//   // Parse duration from price
//   const parseDuration = (durationString) => {
//     if (!durationString) return 60

//     const cleanString = durationString.trim().toLowerCase()

//     const hourMatch = cleanString.match(
//       /(\d+(?:\.\d+)?)\s*(?:hrs|hr|hour|hours)/
//     )
//     const minuteMatch = cleanString.match(
//       /(\d+)\s*(?:min|mins|minute|minutes)/
//     )

//     let totalMinutes = 0

//     if (hourMatch) {
//       totalMinutes += parseFloat(hourMatch[1]) * 60
//     }
//     if (minuteMatch) {
//       totalMinutes += parseInt(minuteMatch[1])
//     }

//     if (totalMinutes === 0) {
//       const numberMatch = cleanString.match(/(\d+(?:\.\d+)?)/)
//       if (numberMatch) {
//         const num = parseFloat(numberMatch[1])
//         totalMinutes = num < 10 ? Math.round(num * 60) : Math.round(num)
//       }
//     }

//     return totalMinutes || 60
//   }

//   // Calculate end time based on start time and duration
//   const calculateEndTime = (startTime, durationString) => {
//     const durationMinutes = parseDuration(durationString)

//     let cleanStartTime = startTime
//     if (typeof cleanStartTime === "string" && cleanStartTime.includes(":")) {
//       const parts = cleanStartTime.split(":")
//       if (parts.length >= 2) {
//         cleanStartTime = `${parts[0]}:${parts[1]}`
//       }
//     }

//     const [hours, minutes] = cleanStartTime.split(":").map(Number)

//     const totalMinutes = hours * 60 + minutes + durationMinutes
//     const endHours = Math.floor(totalMinutes / 60)
//     const endMinutes = totalMinutes % 60

//     return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`
//   }

//   // Format duration for display
//   const formatDurationDisplay = (durationString) => {
//     const minutes = parseDuration(durationString)

//     const hours = Math.floor(minutes / 60)
//     const mins = minutes % 60

//     if (hours > 0 && mins > 0) {
//       return `${hours} ${hours === 1 ? "hour" : "hours"} ${mins} minutes`
//     } else if (hours > 0) {
//       return `${hours} ${hours === 1 ? "hour" : "hours"}`
//     } else {
//       return `${mins} minutes`
//     }
//   }

//   // Get non-overlapping slots
//   const getNonOverlappingSlots = (slots) => {
//     if (!slots || slots.length === 0) return []

//     const durationMinutes = parseDuration(price?.duration)
//     const result = []

//     const timeToMinutes = (timeStr) => {
//       const [h, m] = timeStr.split(":").map(Number)
//       return h * 60 + m
//     }

//     let nextAllowedStart = -1

//     for (const slot of slots) {
//       let startTimeStr = typeof slot === "string" ? slot : slot?.start_time
//       if (startTimeStr?.includes(":")) {
//         const parts = startTimeStr.split(":")
//         startTimeStr = `${parts[0]}:${parts[1]}`
//       }

//       const startMinutes = timeToMinutes(startTimeStr)

//       if (nextAllowedStart === -1 || startMinutes >= nextAllowedStart) {
//         result.push(slot)
//         nextAllowedStart = startMinutes + durationMinutes
//       }
//     }

//     return result
//   }

//   // Format time slot for display
//   const getTimeSlotDisplay = (slot) => {
//     let startTimeStr = typeof slot === "string" ? slot : slot?.start_time
//     if (startTimeStr?.includes(":")) {
//       const parts = startTimeStr.split(":")
//       startTimeStr = `${parts[0]}:${parts[1]}`
//     }

//     const endTimeStr = calculateEndTime(startTimeStr, price?.duration)

//     // Convert to 12-hour format for display
//     const formatTo12Hour = (time) => {
//       const [hours, minutes] = time.split(':')
//       const h = parseInt(hours)
//       const period = h >= 12 ? 'PM' : 'AM'
//       const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
//       return `${h12}:${minutes} ${period}`
//     }

//     return `${formatTo12Hour(startTimeStr)} - ${formatTo12Hour(endTimeStr)}`
//   }

//   // Check if date is in the past
//   const isPastDate = (dateString) => {
//     const today = new Date()
//     today.setHours(0, 0, 0, 0)
    
//     const compareDate = new Date(dateString)
//     compareDate.setHours(0, 0, 0, 0)
    
//     return compareDate < today
//   }

//   // Generate available dates for the next 30 days
//   const generateAvailableDates = () => {
//     const dates = []
//     const today = new Date()
//     for (let i = 0; i < 30; i++) {
//       const date = new Date(today)
//       date.setDate(today.getDate() + i)
//       const formatted = date.toLocaleDateString('en-AU', {
//         weekday: 'short',
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric'
//       })
//       dates.push({
//         display: formatted,
//         value: date.toISOString().split('T')[0],
//         date: date
//       })
//     }
//     return dates
//   }

//   // Fetch time slots for selected date
//   useEffect(() => {
//     const fetchTimeSlots = async () => {
//       if (!selectedDate || !price?.id) return

//       try {
//         setLoading(true)
//         const response = await axios.get(route("ourtimeslots.get"), {
//           params: {
//             date: selectedDate,
//             price_id: price.id,
//           },
//         })

//         if (response.data.success) {
//           const slotsByDate = {}
//           slotsByDate[selectedDate] = response.data.slots
//             .filter((slot) => slot.status === "available")
//             .map((slot) => {
//               const startTime = slot.start_time
//               if (typeof startTime === "string" && startTime.includes(":")) {
//                 const parts = startTime.split(":")
//                 if (parts.length >= 2) {
//                   return `${parts[0]}:${parts[1]}`
//                 }
//               }
//               return startTime
//             })

//           setTimeSlots(slotsByDate)
//         }
//       } catch (err) {
//         console.error("Error fetching time slots:", err)
//         toast.error("Error loading time slots. Please try again.")
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchTimeSlots()
//   }, [selectedDate, price?.id])

//   // Get time slots for selected date
//   const getTimeSlotsForDate = (date) => {
//     if (!date) return []
//     return timeSlots[date] || []
//   }

//   // Find next available dates
//   const findNextAvailableDates = async () => {
//     try {
//       const availableDates = []
//       const today = new Date()

//       for (let i = 1; i <= 30; i++) {
//         const nextDate = new Date(today)
//         nextDate.setDate(today.getDate() + i)
//         const dateKey = formatDateKey(nextDate)

//         try {
//           const response = await axios.get(route("ourtimeslots.get"), {
//             params: {
//               date: dateKey,
//               price_id: price.id,
//             },
//           })

//           if (response.data.success) {
//             const availableSlots = response.data.slots
//               .filter((slot) => slot.status === "available")
//               .map((slot) => {
//                 const startTime = slot.start_time
//                 if (typeof startTime === "string" && startTime.includes(":")) {
//                   const parts = startTime.split(":")
//                   if (parts.length >= 2) {
//                     return `${parts[0]}:${parts[1]}`
//                   }
//                 }
//                 return startTime
//               })

//             setTimeSlots((prev) => ({
//               ...prev,
//               [dateKey]: availableSlots,
//             }))

//             if (availableSlots.length > 0) {
//               availableDates.push(nextDate)
//             }
//           }
//         } catch (err) {
//           console.error(`Error fetching slots for ${dateKey}:`, err)
//         }

//         if (availableDates.length >= 3) {
//           break
//         }
//       }

//       return availableDates
//     } catch (error) {
//       console.error("Error finding next available dates:", error)
//       return []
//     }
//   }

//   // Handle next availability click
//   const handleNextAvailabilityClick = async () => {
//     setShowNextAvailability(true)
//     const loadingToast = toast.loading("Checking next available dates...")

//     const availableDates = await findNextAvailableDates()
//     setNextAvailableDates(availableDates)

//     toast.dismiss(loadingToast)

//     if (availableDates.length === 0) {
//       toast.error("No available dates found in the next 30 days.")
//     } else {
//       toast.success(`Found ${availableDates.length} available dates`)
//     }
//   }

//   // Handle selecting a next available date
//   const handleSelectNextAvailableDate = (date) => {
//     const formattedDate = date.toLocaleDateString('en-AU', {
//       weekday: 'short',
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     })
//     setSelectedDate(formatDateKey(date))
//     setSelectedTime('')
//     setShowNextAvailability(false)
//     toast.success(`Selected date: ${formattedDate}`)
//   }

//   // Handle confirm booking button click
//   const handleConfirmBookingClick = () => {
//     if (selectedDate && selectedTime && price?.duration) {
//       const endTime = calculateEndTime(selectedTime, price.duration)
//       console.log("Booking details:", {
//         start: selectedTime,
//         end: endTime,
//         duration: price.duration,
//         formattedDuration: formatDurationDisplay(price.duration),
//       })

//       // Show booking form
//       setTimeout(() => {
//         setShowBookingForm(true)
//       }, 500)
//     } else {
//       toast.error("Please select a date and time slot first")
//     }
//   }

//   // Handle successful booking
//   const handleBookingSuccess = async () => {
//     const loadingToast = toast.loading("Refreshing available time slots...")

//     try {
//       setLoading(true)
//       // Refresh slots for the selected date
//       const response = await axios.get(route("ourtimeslots.get"), {
//         params: {
//           date: selectedDate,
//           price_id: price.id,
//         },
//       })

//       if (response.data.success) {
//         const slotsByDate = {}
//         slotsByDate[selectedDate] = response.data.slots
//           .filter((slot) => slot.status === "available")
//           .map((slot) => {
//             const startTime = slot.start_time
//             if (typeof startTime === "string" && startTime.includes(":")) {
//               const parts = startTime.split(":")
//               if (parts.length >= 2) {
//                 return `${parts[0]}:${parts[1]}`
//               }
//             }
//             return startTime
//           })

//         setTimeSlots((prev) => ({
//           ...prev,
//           ...slotsByDate,
//         }))

//         toast.dismiss(loadingToast)
//         toast.success("Booking confirmed! Time slots refreshed.")
//       }
//     } catch (error) {
//       console.error("Error refreshing time slots:", error)
//       toast.dismiss(loadingToast)
//       toast.error("Booking confirmed, but failed to refresh time slots")
//     } finally {
//       setLoading(false)
//       setSelectedTime('')
//       setShowBookingForm(false)
//     }
//   }

//   const allDates = generateAvailableDates()
//   const currentTimeSlots = getTimeSlotsForDate(selectedDate)
//   const nonOverlappingSlots = getNonOverlappingSlots(currentTimeSlots)

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-start justify-center py-6 px-4 lg:py-12">
//       <Toaster
//         position="top-right"
//         toastOptions={{
//           duration: 4000,
//           style: {
//             background: "#363636",
//             color: "#fff",
//           },
//           success: {
//             duration: 3000,
//             style: {
//               background: "#10b981",
//               color: "#fff",
//             },
//           },
//           error: {
//             duration: 4000,
//             style: {
//               background: "#ef4444",
//               color: "#fff",
//             },
//           },
//           loading: {
//             style: {
//               background: "#3b82f6",
//               color: "#fff",
//             },
//           },
//         }}
//       />

//       <div className="w-full max-w-screen-lg">

//         {/* Page Header */}
//         <div className="mb-8">
//           <div className="flex items-center gap-3 mb-1">
//             <BookOpen className="h-7 w-7 text-blue-600" />
//             <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Book your lessons</h1>
//           </div>
//           <p className="text-gray-500 text-sm lg:text-base ml-10">
//             Book now or later from your dashboard.
//           </p>
//         </div>

//         {/* Main Layout — stacks on mobile, side-by-side on lg */}
//         <div className="flex flex-col lg:flex-row gap-6">

//           {/* LEFT — Booking Form */}
//           <div className="flex-1">
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
//               <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-6">New Booking</h2>

//               {/* Service Details Summary */}
//               {price && (
//                 <div className="mb-6 p-4 bg-blue-50 rounded-xl">
//                   <h3 className="font-semibold text-gray-900 mb-2">{price.category || "Driving Lessons"}</h3>
//                   <p className="text-sm text-gray-600 mb-2">{price.description}</p>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Duration:</span>
//                     <span className="font-medium text-gray-900">{formatDurationDisplay(price.duration)}</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Price:</span>
//                     <span className="font-medium text-gray-900">${price.price}</span>
//                   </div>
//                 </div>
//               )}

//               {/* Date + Time — side-by-side on md+ */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

//                 {/* Available Dates */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Available Dates
//                   </label>
//                   <div className="relative">
//                 <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                     <select
//                       value={selectedDate}
//                       onChange={(e) => { 
//                         setSelectedDate(e.target.value)
//                         setSelectedTime('')
//                         setShowNextAvailability(false)
//                       }}
//                       className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 pl-10 transition"
//                     >
//                       <option value="">Select a date</option>
//                       {allDates.map((date, i) => (
//                         <option 
//                           key={i} 
//                           value={date.value}
//                           disabled={isPastDate(date.value)}
//                         >
//                           {date.display} {isPastDate(date.value) ? '(Past)' : ''}
//                         </option>
//                       ))}
//                     </select>
                   
//                   </div>
//                 </div>

//                 {/* Available Times */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Available Times
//                   </label>
//                   <div className="relative">
//                       <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                     <select
//                       value={selectedTime}
//                       onChange={(e) => setSelectedTime(e.target.value)}
//                       disabled={!selectedDate || loading}
//                       className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 pl-10 transition disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       <option value="">
//                         {loading ? 'Loading...' : !selectedDate ? 'Select a date first' : 'Select a time'}
//                       </option>
//                       {nonOverlappingSlots.map((time, i) => (
//                         <option key={i} value={time}>
//                           {getTimeSlotDisplay(time)}
//                         </option>
//                       ))}
//                     </select>
                   
//                   </div>
//                 </div>
//               </div>

//               {/* Next Availability Button */}
//               {selectedDate && currentTimeSlots.length === 0 && !loading && !showNextAvailability && (
//                 <button
//                   onClick={handleNextAvailabilityClick}
//                   className="w-full mb-4 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors duration-200 text-sm"
//                 >
//                   Check Next Availability
//                 </button>
//               )}

//               {/* Next Available Dates */}
//               {showNextAvailability && nextAvailableDates.length > 0 && (
//                 <div className="mb-4 p-4 bg-gray-50 rounded-xl">
//                   <h3 className="text-sm font-semibold text-gray-900 mb-3">
//                     Next available dates:
//                   </h3>
//                   <div className="space-y-2">
//                     {nextAvailableDates.map((date, index) => (
//                       <button
//                         key={index}
//                         onClick={() => handleSelectNextAvailableDate(date)}
//                         className="w-full py-2 px-3 text-left bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors duration-200"
//                       >
//                         <div className="text-sm font-medium text-gray-900">
//                           {date.toLocaleDateString("en-US", {
//                             weekday: "short",
//                             month: "short",
//                             day: "numeric",
//                           })}
//                         </div>
//                         <div className="text-xs text-gray-600">
//                           {getTimeSlotsForDate(formatDateKey(date)).length} time slots available
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Confirm Booking Button - Replaces Save Button */}
//               <button
//                 onClick={handleConfirmBookingClick}
//                 disabled={!selectedDate || !selectedTime || loading}
//                 className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition duration-200 text-sm lg:text-base"
//               >
//                 {loading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                     Loading...
//                   </>
//                 ) : (
//                   'Confirm Booking'
//                 )}
//               </button>

//               {selectedTime && (
//                 <p className="text-xs text-center text-gray-500 mt-3">
//                   You'll be asked to complete your details in the next step
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* RIGHT — Order Summary */}
//           {/* <div className="w-full lg:w-80 xl:w-96">
//             <div
//               onClick={() => setShowOrderSummary(!showOrderSummary)}
//               className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 lg:p-6 cursor-pointer hover:bg-gray-50 transition duration-200 select-none"
//             >
//               <div className="flex items-center justify-between">
//                 <span className="text-gray-900 font-semibold text-base lg:text-lg">Order Summary</span>
//                 <div className="flex items-center gap-3">
//                   <span className="text-blue-600 font-bold text-base lg:text-lg">
//                     ${price?.price }
//                   </span>
//                   <ChevronDown
//                     className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${showOrderSummary ? 'rotate-180' : ''}`}
//                   />
//                 </div>
//               </div>

//               {showOrderSummary && (
//                 <div className="mt-5 pt-5 border-t border-gray-200 space-y-3">

                
//                   {(selectedDate || selectedTime) && (
//                     <div className="bg-blue-50 rounded-xl p-3 mb-4 space-y-1">
//                       {selectedDate && (
//                         <div className="flex items-center gap-2 text-xs text-blue-700">
//                           <CalendarIcon className="h-3.5 w-3.5 flex-shrink-0" />
//                           <span>
//                             {allDates.find(d => d.value === selectedDate)?.display || selectedDate}
//                           </span>
//                         </div>
//                       )}
//                       {selectedTime && (
//                         <div className="flex items-center gap-2 text-xs text-blue-700">
//                           <Clock className="h-3.5 w-3.5 flex-shrink-0" />
//                           <span>{getTimeSlotDisplay(selectedTime)}</span>
//                         </div>
//                       )}
//                     </div>
//                   )}

//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-500">{price?.description || '1-Hour Lesson'}</span>
//                     <span className="text-gray-900 font-medium">
//                       ${price?.price}
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-500">Booking Fee</span>
//                     <span className="text-gray-900 font-medium">$2.40</span>
//                   </div>
//                   <div className="flex justify-between text-sm font-bold pt-3 border-t border-gray-200">
//                     <span className="text-gray-900">Total</span>
//                     <span className="text-blue-600">
//                       ${price?.price }
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </div>

           
//             <div className="hidden lg:block mt-4 bg-blue-600 rounded-2xl p-5 text-white">
//               <h3 className="font-semibold text-base mb-2">Need help booking?</h3>
//               <p className="text-blue-100 text-sm leading-relaxed">
//                 Choose a date and time slot, confirm your pickup location, then hit{' '}
//                 <span className="font-semibold text-white">Confirm Booking</span>.
//               </p>
//             </div>
//           </div> */}

//         </div>
//       </div>

//       {/* Booking Form Modal */}
//       {showBookingForm && (
//         <BookingForm
//           selectedDate={new Date(selectedDate)}
//           selectedTime={selectedTime}
//           priceId={price?.id}
//           price={price}
//           onClose={() => setShowBookingForm(false)}
//           onBookingSuccess={handleBookingSuccess}
//         />
//       )}
//     </div>
//   )
// }

// export default CalendarIntegrationMobile



import React, { useState, useEffect } from 'react'
import { ChevronDown, MapPin, Calendar as CalendarIcon, Clock, BookOpen, CheckCircle, User, Mail, Phone, Home, MapPin as MapPinIcon } from 'lucide-react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'

const CalendarIntegrationMobile = ({ price }) => {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  
  // Form fields
  const [formData, setFormData] = useState({
    user_name: '',
    email: '',
    phone: '',
    address: '',
    zip_code: '',
    pickup_location: '',
    dropoff_location: ''
  })
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Time slots state
  const [timeSlots, setTimeSlots] = useState({})
  const [showNextAvailability, setShowNextAvailability] = useState(false)
  const [nextAvailableDates, setNextAvailableDates] = useState([])

  // Format date as YYYY-MM-DD for API calls
  const formatDateKey = (date) => {
    if (!date) return ""
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Parse duration from price
  const parseDuration = (durationString) => {
    if (!durationString) return 60

    const cleanString = durationString.trim().toLowerCase()

    const hourMatch = cleanString.match(
      /(\d+(?:\.\d+)?)\s*(?:hrs|hr|hour|hours)/
    )
    const minuteMatch = cleanString.match(
      /(\d+)\s*(?:min|mins|minute|minutes)/
    )

    let totalMinutes = 0

    if (hourMatch) {
      totalMinutes += parseFloat(hourMatch[1]) * 60
    }
    if (minuteMatch) {
      totalMinutes += parseInt(minuteMatch[1])
    }

    if (totalMinutes === 0) {
      const numberMatch = cleanString.match(/(\d+(?:\.\d+)?)/)
      if (numberMatch) {
        const num = parseFloat(numberMatch[1])
        totalMinutes = num < 10 ? Math.round(num * 60) : Math.round(num)
      }
    }

    return totalMinutes || 60
  }

  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime, durationString) => {
    const durationMinutes = parseDuration(durationString)

    let cleanStartTime = startTime
    if (typeof cleanStartTime === "string" && cleanStartTime.includes(":")) {
      const parts = cleanStartTime.split(":")
      if (parts.length >= 2) {
        cleanStartTime = `${parts[0]}:${parts[1]}`
      }
    }

    const [hours, minutes] = cleanStartTime.split(":").map(Number)

    const totalMinutes = hours * 60 + minutes + durationMinutes
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60

    return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`
  }

  // Format duration for display
  const formatDurationDisplay = (durationString) => {
    const minutes = parseDuration(durationString)

    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0 && mins > 0) {
      return `${hours} ${hours === 1 ? "hour" : "hours"} ${mins} minutes`
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? "hour" : "hours"}`
    } else {
      return `${mins} minutes`
    }
  }

  // Get non-overlapping slots
  const getNonOverlappingSlots = (slots) => {
    if (!slots || slots.length === 0) return []

    const durationMinutes = parseDuration(price?.duration)
    const result = []

    const timeToMinutes = (timeStr) => {
      const [h, m] = timeStr.split(":").map(Number)
      return h * 60 + m
    }

    let nextAllowedStart = -1

    for (const slot of slots) {
      let startTimeStr = typeof slot === "string" ? slot : slot?.start_time
      if (startTimeStr?.includes(":")) {
        const parts = startTimeStr.split(":")
        startTimeStr = `${parts[0]}:${parts[1]}`
      }

      const startMinutes = timeToMinutes(startTimeStr)

      if (nextAllowedStart === -1 || startMinutes >= nextAllowedStart) {
        result.push(slot)
        nextAllowedStart = startMinutes + durationMinutes
      }
    }

    return result
  }

  // Format time slot for display
  const getTimeSlotDisplay = (slot) => {
    let startTimeStr = typeof slot === "string" ? slot : slot?.start_time
    if (startTimeStr?.includes(":")) {
      const parts = startTimeStr.split(":")
      startTimeStr = `${parts[0]}:${parts[1]}`
    }

    const endTimeStr = calculateEndTime(startTimeStr, price?.duration)

    // Convert to 12-hour format for display
    const formatTo12Hour = (time) => {
      const [hours, minutes] = time.split(':')
      const h = parseInt(hours)
      const period = h >= 12 ? 'PM' : 'AM'
      const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
      return `${h12}:${minutes} ${period}`
    }

    return `${formatTo12Hour(startTimeStr)} - ${formatTo12Hour(endTimeStr)}`
  }

  // Check if date is in the past
  const isPastDate = (dateString) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const compareDate = new Date(dateString)
    compareDate.setHours(0, 0, 0, 0)
    
    return compareDate < today
  }

  // Generate available dates for the next 30 days
  const generateAvailableDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const formatted = date.toLocaleDateString('en-AU', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
      dates.push({
        display: formatted,
        value: date.toISOString().split('T')[0],
        date: date
      })
    }
    return dates
  }

  // Fetch time slots for selected date
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDate || !price?.id) return

      try {
        setLoading(true)
        const response = await axios.get(route("ourtimeslots.get"), {
          params: {
            date: selectedDate,
            price_id: price.id,
          },
        })

        if (response.data.success) {
          const slotsByDate = {}
          slotsByDate[selectedDate] = response.data.slots
            .filter((slot) => slot.status === "available")
            .map((slot) => {
              const startTime = slot.start_time
              if (typeof startTime === "string" && startTime.includes(":")) {
                const parts = startTime.split(":")
                if (parts.length >= 2) {
                  return `${parts[0]}:${parts[1]}`
                }
              }
              return startTime
            })

          setTimeSlots(slotsByDate)
        }
      } catch (err) {
        console.error("Error fetching time slots:", err)
        toast.error("Error loading time slots. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchTimeSlots()
  }, [selectedDate, price?.id])

  // Get time slots for selected date
  const getTimeSlotsForDate = (date) => {
    if (!date) return []
    return timeSlots[date] || []
  }

  // Find next available dates
  const findNextAvailableDates = async () => {
    try {
      const availableDates = []
      const today = new Date()

      for (let i = 1; i <= 30; i++) {
        const nextDate = new Date(today)
        nextDate.setDate(today.getDate() + i)
        const dateKey = formatDateKey(nextDate)

        try {
          const response = await axios.get(route("ourtimeslots.get"), {
            params: {
              date: dateKey,
              price_id: price.id,
            },
          })

          if (response.data.success) {
            const availableSlots = response.data.slots
              .filter((slot) => slot.status === "available")
              .map((slot) => {
                const startTime = slot.start_time
                if (typeof startTime === "string" && startTime.includes(":")) {
                  const parts = startTime.split(":")
                  if (parts.length >= 2) {
                    return `${parts[0]}:${parts[1]}`
                  }
                }
                return startTime
              })

            setTimeSlots((prev) => ({
              ...prev,
              [dateKey]: availableSlots,
            }))

            if (availableSlots.length > 0) {
              availableDates.push(nextDate)
            }
          }
        } catch (err) {
          console.error(`Error fetching slots for ${dateKey}:`, err)
        }

        if (availableDates.length >= 3) {
          break
        }
      }

      return availableDates
    } catch (error) {
      console.error("Error finding next available dates:", error)
      return []
    }
  }

  // Handle next availability click
  const handleNextAvailabilityClick = async () => {
    setShowNextAvailability(true)
    const loadingToast = toast.loading("Checking next available dates...")

    const availableDates = await findNextAvailableDates()
    setNextAvailableDates(availableDates)

    toast.dismiss(loadingToast)

    if (availableDates.length === 0) {
      toast.error("No available dates found in the next 30 days.")
    } else {
      toast.success(`Found ${availableDates.length} available dates`)
    }
  }

  // Handle selecting a next available date
  const handleSelectNextAvailableDate = (date) => {
    const formattedDate = date.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
    setSelectedDate(formatDateKey(date))
    setSelectedTime('')
    setShowNextAvailability(false)
    toast.success(`Selected date: ${formattedDate}`)
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Validate zip code - only allow 6210
  const validateZipCode = (zip) => {
    const cleanZip = zip.replace(/\D/g, "")
    return cleanZip === "6210"
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate all fields are filled
    const requiredFields = ['user_name', 'email', 'phone', 'address', 'zip_code', 'pickup_location', 'dropoff_location']
    const newErrors = {}
    
    requiredFields.forEach(field => {
      if (!formData[field]?.trim()) {
        newErrors[field] = `${field.replace('_', ' ')} is required`
      }
    })
    
    // Validate email format
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    // Validate zip code
    if (formData.zip_code && !validateZipCode(formData.zip_code)) {
      newErrors.zip_code = 'Sorry, we currently only serve areas with zip code 6210'
    }
    
    // Validate date and time
    if (!selectedDate) {
      toast.error('Please select a date')
      return
    }
    
    if (!selectedTime) {
      toast.error('Please select a time slot')
      return
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fill in all required fields correctly')
      return
    }
    
    setSubmitting(true)
    
    try {
      const durationMinutes = parseDuration(price.duration)
      const fullAddress = `${formData.address}, ${formData.zip_code}`
      
      // Extract package name from price description
      const extractPackageName = (description) => {
        if (!description) return ""
        if (description.includes(":")) {
          return description.split(":").pop().trim()
        }
        return description.trim()
      }
      
      const packageName = extractPackageName(price.description)
      
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
        dropoff_location: formData.dropoff_location
      }
      
      console.log("Submitting booking:", bookingData)
      
      const response = await axios.post(route("ourreservations.store"), bookingData)
      
      if (response.data.success || response.data.message) {
        toast.success('Booking confirmed successfully!')
        
        // Reset form
        setFormData({
          user_name: '',
          email: '',
          phone: '',
          address: '',
          zip_code: '',
          pickup_location: '',
          dropoff_location: ''
        })
        setSelectedDate('')
        setSelectedTime('')
        
        // Refresh time slots
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (error) {
      console.error("Booking error:", error)
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
        toast.error('Please fix the errors in the form')
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Error confirming booking. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const allDates = generateAvailableDates()
  const currentTimeSlots = getTimeSlotsForDate(selectedDate)
  const nonOverlappingSlots = getNonOverlappingSlots(currentTimeSlots)

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
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <BookOpen className="h-7 w-7 text-blue-600" />
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Book your lessons</h1>
          </div>
          <p className="text-gray-500 text-sm lg:text-base ml-10">
            Fill in your details to confirm the booking
          </p>
        </div>

        {/* Main Booking Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
          {/* Service Details Summary */}
          {price && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">{price.category || "Driving Lessons"}</h3>
              <p className="text-sm text-gray-600 mb-2">{price.description}</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium text-gray-900">{formatDurationDisplay(price.duration)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price:</span>
                <span className="font-medium text-gray-900">${price.price}</span>
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
                    setSelectedDate(e.target.value)
                    setSelectedTime('')
                    setShowNextAvailability(false)
                  }}
                  className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 pl-10 transition"
                  required
                >
                  <option value="">Select a date</option>
                  {allDates.map((date, i) => (
                    <option 
                      key={i} 
                      value={date.value}
                      disabled={isPastDate(date.value)}
                    >
                      {date.display} {isPastDate(date.value) ? '(Past)' : ''}
                    </option>
                  ))}
                </select>
              </div>
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
                  onChange={(e) => setSelectedTime(e.target.value)}
                  disabled={!selectedDate || loading}
                  className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 pl-10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">
                    {loading ? 'Loading...' : !selectedDate ? 'Select a date first' : 'Select a time'}
                  </option>
                  {nonOverlappingSlots.map((time, i) => (
                    <option key={i} value={time}>
                      {getTimeSlotDisplay(time)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Next Availability Button */}
            {selectedDate && currentTimeSlots.length === 0 && !loading && !showNextAvailability && (
              <button
                type="button"
                onClick={handleNextAvailabilityClick}
                className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors duration-200 text-sm"
              >
                Check Next Availability
              </button>
            )}

            {/* Next Available Dates */}
            {showNextAvailability && nextAvailableDates.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Next available dates:
                </h3>
                <div className="space-y-2">
                  {nextAvailableDates.map((date, index) => (
                    <button
                      key={index}
                      type="button"
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
                        {getTimeSlotsForDate(formatDateKey(date)).length} time slots available
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label htmlFor="user_name" className="block text-sm font-medium text-gray-700 mb-2">
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
                    errors.user_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                  required
                />
              </div>
              {errors.user_name && (
                <p className="mt-1 text-sm text-red-600">{errors.user_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="john@example.com"
                  required
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
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
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0400 000 000"
                  required
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123 Main Street"
                  required
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            {/* Zip Code */}
            <div>
              <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-2">
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
                    errors.zip_code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="6210"
                  maxLength="5"
                  required
                />
              </div>
              {errors.zip_code ? (
                <p className="mt-1 text-sm text-red-600">{errors.zip_code}</p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">Currently serving only areas with zip code 6210</p>
              )}
            </div>

            {/* Pickup Location */}
            <div>
              <label htmlFor="pickup_location" className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Location *
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="pickup_location"
                  name="pickup_location"
                  value={formData.pickup_location}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                    errors.pickup_location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter pickup address"
                  required
                />
              </div>
              {errors.pickup_location && (
                <p className="mt-1 text-sm text-red-600">{errors.pickup_location}</p>
              )}
            </div>

            {/* Dropoff Location */}
            <div>
              <label htmlFor="dropoff_location" className="block text-sm font-medium text-gray-700 mb-2">
                Dropoff Location *
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="dropoff_location"
                  name="dropoff_location"
                  value={formData.dropoff_location}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                    errors.dropoff_location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter dropoff address"
                  required
                />
              </div>
              {errors.dropoff_location && (
                <p className="mt-1 text-sm text-red-600">{errors.dropoff_location}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !selectedDate || !selectedTime}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-4 rounded-xl transition duration-200 text-base"
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                'Confirm Booking'
              )}
            </button>

            <p className="text-xs text-center text-gray-500 mt-4">
              By clicking Confirm Booking, you agree to our terms and conditions
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CalendarIntegrationMobile