// import React, { useState } from 'react'
// import { ChevronDown, MapPin, Calendar, Clock, BookOpen, CheckCircle, CalendarIcon } from 'lucide-react'

// const TestCalendarIntegrationMobile = () => {
//   const [selectedDate, setSelectedDate] = useState('')
//   const [selectedTime, setSelectedTime] = useState('')
//   const [showOrderSummary, setShowOrderSummary] = useState(false)
//   const [saved, setSaved] = useState(false)

//   // Generate real available dates — next 30 days
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
//       dates.push(formatted)
//     }
//     return dates
//   }

//   const availableDates = generateAvailableDates()

//   const handleSave = () => {
//     if (selectedDate && selectedTime) {
//       setSaved(true)
//       setTimeout(() => setSaved(false), 2500)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-start justify-center py-6 px-4 lg:py-12">
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

//               {/* Date + Time — side-by-side on md+ */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

//                 {/* Available Dates */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Available Dates
//                   </label>
//                   <div className="relative">
//                     <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                     <select
//                       value={selectedDate}
//                       onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime('') }}
//                       className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 pl-10 pr-10 transition"
//                     >
//                       <option value="">Select a date</option>
//                       {availableDates.map((date, i) => (
//                         <option key={i} value={date}>{date}</option>
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
//                     <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
//                     <input
//                       type="time"
//                       value={selectedTime}
//                       onChange={(e) => setSelectedTime(e.target.value)}
//                       disabled={!selectedDate}
//                       min="07:00"
//                       max="18:00"
//                       className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 pl-10 pr-3 transition disabled:opacity-50 disabled:cursor-not-allowed"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Save Button */}
//               <button
//                 onClick={handleSave}
//                 disabled={!selectedDate || !selectedTime}
//                 className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition duration-200 text-sm lg:text-base"
//               >
//                 {saved ? (
//                   <>
//                     <CheckCircle className="h-5 w-5" />
//                     Saved!
//                   </>
//                 ) : (
//                   'Save Booking'
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* RIGHT — Order Summary */}
//           <div className="w-full lg:w-80 xl:w-96">
//             <div
//               onClick={() => setShowOrderSummary(!showOrderSummary)}
//               className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 lg:p-6 cursor-pointer hover:bg-gray-50 transition duration-200 select-none"
//             >
//               <div className="flex items-center justify-between">
//                 <span className="text-gray-900 font-semibold text-base lg:text-lg">Order Summary</span>
//                 <div className="flex items-center gap-3">
//                   <span className="text-blue-600 font-bold text-base lg:text-lg">$82.40</span>
//                   <ChevronDown
//                     className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${showOrderSummary ? 'rotate-180' : ''}`}
//                   />
//                 </div>
//               </div>

//               {showOrderSummary && (
//                 <div className="mt-5 pt-5 border-t border-gray-200 space-y-3">

//                   {/* Selected booking recap */}
//                   {(selectedDate || selectedTime) && (
//                     <div className="bg-blue-50 rounded-xl p-3 mb-4 space-y-1">
//                       {selectedDate && (
//                         <div className="flex items-center gap-2 text-xs text-blue-700">
//                           <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
//                           <span>{selectedDate}</span>
//                         </div>
//                       )}
//                       {selectedTime && (
//                         <div className="flex items-center gap-2 text-xs text-blue-700">
//                           <Clock className="h-3.5 w-3.5 flex-shrink-0" />
//                           <span>{selectedTime}</span>
//                         </div>
//                       )}
//                     </div>
//                   )}

//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-500">1-Hour Lesson</span>
//                     <span className="text-gray-900 font-medium">$80.00</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-500">Booking Fee</span>
//                     <span className="text-gray-900 font-medium">$2.40</span>
//                   </div>
//                   <div className="flex justify-between text-sm font-bold pt-3 border-t border-gray-200">
//                     <span className="text-gray-900">Total</span>
//                     <span className="text-blue-600">$82.40</span>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Help card — only shown on lg+ */}
//             <div className="hidden lg:block mt-4 bg-blue-600 rounded-2xl p-5 text-white">
//               <h3 className="font-semibold text-base mb-2">Need help booking?</h3>
//               <p className="text-blue-100 text-sm leading-relaxed">
//                 Choose a date and time slot, confirm your pickup location, then hit{' '}
//                 <span className="font-semibold text-white">Save Booking</span>.
//               </p>
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   )
// }

// export default TestCalendarIntegrationMobile



import React, { useState, useEffect } from 'react'
import { ChevronDown, MapPin, Calendar, Clock, BookOpen, CheckCircle, CalendarIcon, ChevronLeft } from 'lucide-react'
import { Calendar as CalendarUI } from "@/components/ui/calendar"
import axios from "axios"
import { Link } from "@inertiajs/react"
import BookingForm from "./BookingForm"

const TestCalendarIntegrationMobile = ({ price }) => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState("")
  const [loading, setLoading] = useState(false)
  const [availabilityMessage, setAvailabilityMessage] = useState("")
  const [isAvailable, setIsAvailable] = useState(false)
  const [alternativeTimes, setAlternativeTimes] = useState([])
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingDetails, setBookingDetails] = useState(null)
  const [timeError, setTimeError] = useState("")
  const [availableTimeSlots, setAvailableTimeSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [showOrderSummary, setShowOrderSummary] = useState(false)
  const [saved, setSaved] = useState(false)

  // Function to check if a date is in the past
  const isPastDate = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const formatDateKey = (date) => {
    if (!date) return ""
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const formatDisplayDate = (date) => {
    if (!date) return "Select a date"
    return date.toLocaleDateString("en-AU", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  // Parse duration to minutes
  const parseDuration = (durationString) => {
    if (!durationString) return 60

    const cleanString = durationString.trim().toLowerCase()

    // Extract hours and minutes using regex
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

  // Format time for display (convert 24h to 12h format)
  const formatTimeForDisplay = (time24) => {
    if (!time24) return ""
    const [hours, minutes] = time24.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  // Validate time format (H:i)
  const validateTimeFormat = (time) => {
    if (!time) return false
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(time)
  }

  // Format time to ensure H:i format
  const formatTimeForApi = (time) => {
    if (!time) return ""
    // Ensure we have exactly HH:mm format
    const [hours, minutes] = time.split(":").map(Number)
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`
  }

  // Fetch available time slots when date changes
  useEffect(() => {
    if (selectedDate && !isPastDate(selectedDate) && price) {
      fetchAvailableTimeSlots()
    } else {
      setAvailableTimeSlots([])
    }
  }, [selectedDate, price])

  const fetchAvailableTimeSlots = async () => {
    if (!price) return
    
    setLoadingSlots(true)
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
      )

      if (response.data.success) {
        setAvailableTimeSlots(response.data.available_slots)
      } else {
        setAvailableTimeSlots([])
      }
    } catch (error) {
      console.error("Error fetching available slots:", error)
      setAvailableTimeSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  // Check availability for test time
  const checkTestAvailability = async () => {
    if (!price) {
      setAvailabilityMessage("Price information not available")
      setIsAvailable(false)
      return
    }

    if (!selectedDate || !selectedTime) {
      setAvailabilityMessage("Please select both date and time")
      setIsAvailable(false)
      return
    }

    // Validate time format
    if (!validateTimeFormat(selectedTime)) {
      setTimeError("Please enter a valid time in HH:MM format")
      setIsAvailable(false)
      return
    }

    setLoading(true)
    setAvailabilityMessage("")
    setAlternativeTimes([])
    setTimeError("")

    try {
      const formattedTime = formatTimeForApi(selectedTime)

      const response = await axios.post(
        route("test-packages.check-availability"),
        {
          date: formatDateKey(selectedDate),
          test_time: formattedTime,
          duration_minutes: parseDuration(price.duration),
          price_id: price.id,
        }
      )

      if (response.data.available) {
        setIsAvailable(true)
        setBookingDetails({
          start_time: response.data.start_time,
          end_time: response.data.end_time,
          buffer_start: response.data.start_time,
          buffer_end: response.data.end_time,
        })
        setAvailabilityMessage(
          "✓ This time slot is available! You can proceed to book."
        )
      } else {
        setIsAvailable(false)
        let message = response.data.message || "Time slot not available"

        // If there are alternative times, show them
        if (
          response.data.alternative_times &&
          response.data.alternative_times.length > 0
        ) {
          setAlternativeTimes(response.data.alternative_times)
        } else {
          message += "\n\nNo alternative times available for this duration."
        }

        message += "\n\nPlease contact us for assistance."
        setAvailabilityMessage(message)
      }
    } catch (error) {
      console.error("Error checking availability:", error)
      setIsAvailable(false)

      // Check if it's a validation error
      if (error.response && error.response.status === 422) {
        const errors = error.response.data.errors
        if (errors && errors.test_time) {
          setAvailabilityMessage(`Validation error: ${errors.test_time[0]}`)
          setTimeError(errors.test_time[0])
        } else if (errors && errors.price_id) {
          setAvailabilityMessage(`Validation error: ${errors.price_id[0]}`)
        } else {
          setAvailabilityMessage(
            "Please check the time format (HH:MM) and try again."
          )
        }
      } else {
        setAvailabilityMessage(
          "Error checking availability. Please try again."
        )
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle time selection from dropdown
  const handleTimeSelect = (time24) => {
    setSelectedTime(time24)
    setAvailabilityMessage("")
    setIsAvailable(false)
    setAlternativeTimes([])
    setTimeError("")
  }

  // Handle manual time input
  const handleTimeChange = (e) => {
    const value = e.target.value
    setSelectedTime(value)
    setAvailabilityMessage("")
    setIsAvailable(false)
    setAlternativeTimes([])
    setTimeError("")
  }

  // Handle booking confirmation
  const handleConfirmBookingClick = () => {
    if (isAvailable && bookingDetails) {
      setShowBookingForm(true)
    }
  }

  // Handle successful booking
  const handleBookingSuccess = async () => {
    setSelectedDate(new Date())
    setSelectedTime("")
    setAvailabilityMessage("")
    setIsAvailable(false)
    setAlternativeTimes([])
    setShowBookingForm(false)
    setBookingDetails(null)
    setTimeError("")
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    // Refresh available slots after booking
    if (price) {
      fetchAvailableTimeSlots()
    }
  }

  // Custom day cell content
  const renderDayContent = (date) => {
    const isSelected =
      selectedDate && date.toDateString() === selectedDate.toDateString()
    const isPast = isPastDate(date)

    return (
      <div className="relative">
        <span className={isPast ? "text-gray-400" : ""}>
          {date.getDate()}
        </span>
        {!isSelected && !isPast && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-100 rounded-full"></div>
        )}
      </div>
    )
  }

  // Set min and max times for the time input - with null check for price
  const getMinTime = () => {
    return "07:00" // 7:00 AM (working hours start)
  }

  const getMaxTime = () => {
    // Return default max time if price is not available
    if (!price) {
      return "17:00" // Default to 5:00 PM
    }

    // Calculate max time based on duration
    const durationMinutes = parseDuration(price.duration)

    // Working hours end at 18:00
    // Test must end by 18:00
    // Test ends at: test_start_time + duration_minutes
    // So test_start_time + duration_minutes <= 18:00
    // Therefore test_start_time <= 18:00 - duration_minutes

    const workingEnd = 18 // 6:00 PM

    // Calculate max test start time (test must end by 18:00)
    const maxTestStartTime = new Date()
    maxTestStartTime.setHours(workingEnd, 0 - durationMinutes, 0, 0)

    // If the calculation goes below working hours, set to working hours start
    if (maxTestStartTime.getHours() < 7) {
      return "07:00"
    }

    return (
      maxTestStartTime.getHours().toString().padStart(2, "0") +
      ":" +
      maxTestStartTime.getMinutes().toString().padStart(2, "0")
    )
  }

  // Show loading state if price is not available
  if (!price) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading price information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
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
            <BookOpen className="h-7 w-7 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Schedule Your Test Package</h1>
          </div>
          <p className="text-gray-500 text-sm ml-10">
            Choose your test date and time. Operating hours: 7:00 AM - 6:00 PM
          </p>
        </div>

        {/* Main Layout - Stacked on Mobile */}
        <div className="flex flex-col gap-6">
          {/* Calendar Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Test Date</h2>
            <p className="text-xs text-gray-500 mb-4">
              Time zone: Australian Western Standard Time (GMT+8)
            </p>
            <CalendarUI
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date && !isPastDate(date)) {
                  setSelectedDate(date)
                  setSelectedTime("")
                  setAvailabilityMessage("")
                  setIsAvailable(false)
                  setAlternativeTimes([])
                  setTimeError("")
                }
              }}
              disabled={isPastDate}
              className="rounded-md border [&_.rdp-day_selected]:bg-blue-600 [&_.rdp-day_selected]:text-white [&_.rdp-day_selected:hover]:bg-blue-700 [&_.rdp-button:hover]:bg-blue-50 [&_.rdp-day_today]:bg-gray-100 [&_.rdp-day_disabled]:text-gray-400 [&_.rdp-day_disabled]:cursor-not-allowed"
              components={{
                DayContent: ({ date }) => renderDayContent(date),
              }}
            />
          </div>

          {/* Time Selection Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Select Test Time</h2>
            <p className="text-sm text-gray-500 mb-4">
              {formatDisplayDate(selectedDate)}
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
                    onChange={(e) => handleTimeSelect(e.target.value)}
                    value={selectedTime}
                    className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 pl-10 pr-10 transition"
                  >
                    <option value="">Choose a time...</option>
                    {availableTimeSlots.map((slot, index) => (
                      <option key={index} value={slot.time}>
                        {slot.formatted}
                      </option>
                    ))}
                  </select>
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
                    disabled={!selectedDate || isPastDate(selectedDate)}
                    min={getMinTime()}
                    max={getMaxTime()}
                    step="1800"
                    className={`w-full bg-gray-50 border ${timeError ? "border-red-300" : "border-gray-300"} text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 pl-10 pr-3 transition disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                </div>
                {timeError && (
                  <p className="text-red-600 text-xs mt-1">{timeError}</p>
                )}
              </div>

              <button
                onClick={checkTestAvailability}
                disabled={!selectedTime || loading}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 text-sm ${
                  selectedTime && !loading
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
                      onClick={() => handleTimeSelect(slot.time || slot)}
                      className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm transition-colors"
                    >
                      {slot.formatted || formatTimeForDisplay(slot)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Click on a suggested time to select it, then check availability again.
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
                      isAvailable ? "text-green-600" : "text-red-600"
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
                      isAvailable ? "text-green-800" : "text-red-800"
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

          {/* Order Summary Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div
              onClick={() => setShowOrderSummary(!showOrderSummary)}
              className="cursor-pointer select-none"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-900 font-semibold text-lg">Order Summary</span>
                <div className="flex items-center gap-3">
                  <span className="text-blue-600 font-bold text-lg">${price.price}</span>
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
                          <span>{formatDisplayDate(selectedDate)}</span>
                        </div>
                      )}
                      {selectedTime && (
                        <div className="flex items-center gap-2 text-xs text-blue-700">
                          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>{formatTimeForDisplay(selectedTime)}</span>
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
                        Professional driving test preparation with certified instructors
                      </p>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Operating Hours:</span>
                        <span className="font-medium text-gray-900">7:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Test Duration:</span>
                        <span className="font-medium text-gray-900">{price.duration}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium text-gray-900">${price.price}</span>
                      </div>
                      
                      {selectedDate && selectedTime && isAvailable && bookingDetails && (
                        <>
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600">Total Booking Duration:</span>
                              <span className="font-medium text-gray-900 text-right">
                                {formatTimeForDisplay(bookingDetails.start_time)} to{" "}
                                {formatTimeForDisplay(bookingDetails.end_time)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Actual Test Time:</span>
                              <span className="font-medium text-blue-600 text-right">
                                {formatTimeForDisplay(selectedTime)} ({price.duration})
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

            <button
              onClick={handleConfirmBookingClick}
              disabled={!isAvailable}
              className={`w-full mt-5 py-3 px-4 rounded-xl font-semibold transition-all duration-200 text-sm ${
                isAvailable
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isAvailable ? "Proceed to Booking" : "Select Available Time"}
            </button>
          </div>

          {/* Help Card */}
          <div className="bg-blue-600 rounded-2xl p-5 text-white">
            <h3 className="font-semibold text-base mb-2">Need help booking?</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Choose a date and time slot, check availability, then proceed to booking.
            </p>
          </div>
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && bookingDetails && price && (
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
  )
}

export default TestCalendarIntegrationMobile