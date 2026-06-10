// import { X } from "lucide-react";
// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const BookingForm = ({
//     selectedDate,
//     selectedTime,
//     testTime,
//     priceId,
//     price,
//     isTestPackage = false,
//     bookingDetails = null,
//     onClose,
//     onBookingSuccess,
// }) => {
//     const [bookingForm, setBookingForm] = useState({
//         user_name: "",
//         email: "",
//         phone: "",
//         address: "",
//         zip_code: "",
//         test_location: isTestPackage ? "Mandurah licensing center" : "",
//         test_type: "",
//         pickup_location: "",
//         dropoff_location: "",
//     });

//     const [loading, setLoading] = useState(false);
//     const [errors, setErrors] = useState({});

//     useEffect(() => {
//         if (bookingDetails) {
//             setBookingForm((prev) => ({
//                 ...prev,
//                 pickup_location:
//                     bookingDetails.pickup_location ||
//                     bookingDetails.test_location ||
//                     "",
//                 dropoff_location:
//                     bookingDetails.dropoff_location ||
//                     bookingDetails.test_location ||
//                     "",
//                 test_location:
//                     bookingDetails.test_location ||
//                     (isTestPackage ? "Mandurah licensing center" : "") ||
//                     "",
//             }));
//         } else if (isTestPackage) {
//             setBookingForm((prev) => ({
//                 ...prev,
//                 test_location: "Mandurah licensing center",
//             }));
//         }
//     }, [bookingDetails, isTestPackage]);

//     useEffect(() => {
//         document.body.style.overflow = "hidden";
//         document.body.style.position = "fixed";
//         document.body.style.width = "100%";

//         return () => {
//             document.body.style.overflow = "unset";
//             document.body.style.position = "static";
//             document.body.style.width = "auto";
//         };
//     }, []);

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
//         if (hourMatch) totalMinutes += parseFloat(hourMatch[1]) * 60;
//         if (minuteMatch) totalMinutes += parseInt(minuteMatch[1]);

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

//     const extractPackageName = (description) => {
//         if (!description) return "";

//         if (description.includes(":")) {
//             return description.split(":").pop().trim();
//         }

//         return description.trim();
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setBookingForm((prev) => ({
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

//     const setPickupSameAsAddress = () => {
//         if (bookingForm.address) {
//             setBookingForm((prev) => ({
//                 ...prev,
//                 pickup_location: prev.address,
//             }));
//             if (errors.pickup_location) {
//                 setErrors((prev) => ({
//                     ...prev,
//                     pickup_location: "",
//                 }));
//             }
//         } else {
//             alert("Please select an address first");
//         }
//     };

//     const setDropoffSameAsPickup = () => {
//         if (bookingForm.pickup_location) {
//             setBookingForm((prev) => ({
//                 ...prev,
//                 dropoff_location: prev.pickup_location,
//             }));
//             if (errors.dropoff_location) {
//                 setErrors((prev) => ({
//                     ...prev,
//                     dropoff_location: "",
//                 }));
//             }
//         } else {
//             alert("Please enter a pickup location first");
//         }
//     };

//    const validateZipCode = (zip) => {
//     const cleanZip = zip.replace(/\D/g, "");

//     return ["6210", "6180", "6175"].includes(cleanZip);
// };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setErrors({});

//         if (!validateZipCode(bookingForm.zip_code)) {
//             setErrors({
//                 zip_code:
//                     "Sorry, we currently only serve areas with zip codes 6210, 6180, or 6175. Please enter a valid zip code.",
//             });
//             setLoading(false);
//             return;
//         }

//         try {
//             const durationMinutes = parseDuration(price.duration);
//             const routeName = isTestPackage
//                 ? "test-packages.store"
//                 : "ourreservations.store";

//             const fullAddress = `${bookingForm.address}, ${bookingForm.zip_code}`;
//             const packageName = extractPackageName(price.description);

//             const bookingData = {
//                 ...bookingForm,
//                 address: fullAddress,
//                 reservation_date: formatDateKey(selectedDate),
//                 price_id: priceId,
//                 duration_minutes: durationMinutes,
//             };

//             if (isTestPackage) {
//                 Object.assign(bookingData, {
//                     start_time: bookingDetails?.start_time || selectedTime,
//                     end_time:
//                         bookingDetails?.end_time ||
//                         calculateEndTime(selectedTime, price.duration),
//                     test_time: testTime || selectedTime,
//                     test_location: bookingForm.test_location,
//                     pickup_location: bookingForm.pickup_location,
//                     dropoff_location: bookingForm.dropoff_location,
//                     test_type: packageName,
//                 });
//             } else {
//                 Object.assign(bookingData, {
//                     start_time: selectedTime,
//                     end_time: calculateEndTime(selectedTime, price.duration),
//                     package_type: packageName,
//                     package_price: price.price,
//                     pickup_location: bookingForm.pickup_location,
//                     dropoff_location: bookingForm.dropoff_location,
//                 });
//             }

//             delete bookingData.zip_code;

//             console.log("Submitting booking data:", bookingData);

//             const response = await axios.post(route(routeName), bookingData);

//             if (response.data.success || response.data.message) {
//                 alert(
//                     isTestPackage
//                         ? "Test package booked successfully!"
//                         : "Booking confirmed successfully!",
//                 );
//                 await onBookingSuccess();
//                 onClose();
//             } else {
//                 alert("Error confirming booking: " + response.data.message);
//             }
//         } catch (error) {
//             console.error("Booking error:", error);
//             console.error("Error response:", error.response);

//             if (error.response?.data?.message) {
//                 const errorMsg = error.response.data.message;

//                 if (errorMsg.includes("already reserved for this service")) {
//                     alert(
//                         "This time slot has just been booked by someone else. Please select another time.",
//                     );
//                     if (onBookingSuccess) {
//                         await onBookingSuccess();
//                     }
//                 } else {
//                     alert("Booking error: " + errorMsg);
//                 }
//             } else if (error.response?.data?.errors) {
//                 setErrors(error.response.data.errors);
//                 alert("Please fix the errors in the form.");
//             } else if (error.response?.data?.error) {
//                 alert("Booking error: " + error.response.data.error);
//             } else {
//                 alert("Error confirming booking. Please try again.");
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const formatDateKey = (date) => {
//         if (!date) return "";
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, "0");
//         const day = String(date.getDate()).padStart(2, "0");
//         return `${year}-${month}-${day}`;
//     };

//     const formatDisplayDate = (date) => {
//         if (!date) return "";
//         return date.toLocaleDateString("en-US", {
//             weekday: "long",
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//         });
//     };

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

//     const displayTime = isTestPackage ? testTime || selectedTime : selectedTime;
//     const displayEndTime = calculateEndTime(displayTime, price.duration);
//     const displayPackageName = extractPackageName(price.description);

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//                 {/* Header */}
//                 <div className="p-6 rounded-t-lg bg-indigo-600 text-white">
//                     <div className="flex justify-between items-center">
//                         <h2 className="text-2xl font-bold">
//                             {isTestPackage
//                                 ? "Complete Your Test Booking"
//                                 : "Complete Your Booking"}
//                         </h2>
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             className="text-white hover:opacity-80 transition-colors"
//                         >
//                             <X size={24} />
//                         </button>
//                     </div>
//                     <div className="mt-2">
//                         <p className="opacity-90">
//                             {formatDisplayDate(selectedDate)}
//                         </p>
//                         <p className="opacity-90 mt-1">
//                             Time: {displayTime} to {displayEndTime}
//                         </p>
//                         <p className="opacity-90 mt-1">
//                             Package: {displayPackageName} - ${price.price}
//                         </p>
//                     </div>
//                 </div>

//                 {/* Form */}
//                 <form onSubmit={handleSubmit} className="p-6 space-y-6">
//                     {/* Full Name */}
//                     <div>
//                         <label
//                             htmlFor="user_name"
//                             className="block text-sm font-medium text-gray-700 mb-2"
//                         >
//                             Full Name *
//                         </label>
//                         <input
//                             type="text"
//                             id="user_name"
//                             name="user_name"
//                             value={bookingForm.user_name}
//                             onChange={handleChange}
//                             required
//                             className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
//                                 errors.user_name
//                                     ? "border-red-500"
//                                     : "border-gray-300"
//                             }`}
//                             placeholder="John Doe"
//                         />
//                         {errors.user_name && (
//                             <p className="mt-1 text-sm text-red-600">
//                                 {errors.user_name}
//                             </p>
//                         )}
//                     </div>

//                     {/* Email */}
//                     <div>
//                         <label
//                             htmlFor="email"
//                             className="block text-sm font-medium text-gray-700 mb-2"
//                         >
//                             Email Address *
//                         </label>
//                         <input
//                             type="email"
//                             id="email"
//                             name="email"
//                             value={bookingForm.email}
//                             onChange={handleChange}
//                             required
//                             className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
//                                 errors.email
//                                     ? "border-red-500"
//                                     : "border-gray-300"
//                             }`}
//                             placeholder="john@example.com"
//                         />
//                         {errors.email && (
//                             <p className="mt-1 text-sm text-red-600">
//                                 {errors.email}
//                             </p>
//                         )}
//                     </div>

//                     {/* Phone */}
//                     <div>
//                         <label
//                             htmlFor="phone"
//                             className="block text-sm font-medium text-gray-700 mb-2"
//                         >
//                             Phone Number *
//                         </label>
//                         <input
//                             type="tel"
//                             id="phone"
//                             name="phone"
//                             value={bookingForm.phone}
//                             onChange={handleChange}
//                             required
//                             className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
//                                 errors.phone
//                                     ? "border-red-500"
//                                     : "border-gray-300"
//                             }`}
//                             placeholder="+1 (555) 000-0000"
//                         />
//                         {errors.phone && (
//                             <p className="mt-1 text-sm text-red-600">
//                                 {errors.phone}
//                             </p>
//                         )}
//                     </div>

//                     {/* Address - Dropdown */}
//                     <div>
//                         <label
//                             htmlFor="address"
//                             className="block text-sm font-medium text-gray-700 mb-2"
//                         >
//                             Area *
//                         </label>
//                         <select
//                             id="address"
//                             name="address"
//                             value={bookingForm.address}
//                             onChange={handleChange}
//                             required
//                             className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white ${
//                                 errors.address
//                                     ? "border-red-500"
//                                     : "border-gray-300"
//                             }`}
//                         >
//                             <option value="">Select your Area</option>
//                             <option value="mandurah">Mandurah</option>
//                             <option value="meadow-springs">
//                                 Meadow Springs
//                             </option>
//                             <option value="silver-sands">Silver Sands</option>
//                             <option value="lakelands">Lakelands</option>
//                             <option value="dudley-park">Dudley Park</option>
//                             <option value="halls-head">Halls Head</option>
//                             <option value="madora-bay">Madora Bay</option>
//                             <option value="greenfields">Greenfields</option>
//                             <option value="erskine">Erskine</option>
//                             <option value="meetpoint-mandurah-dot">
//                                 Meetpoint Mandurah Dot
//                             </option>
//                             <option value="singleton">Singleton </option>

//                         </select>
//                         {errors.address && (
//                             <p className="mt-1 text-sm text-red-600">
//                                 {errors.address}
//                             </p>
//                         )}
//                     </div>

//                     {/* Zip Code */}
//                     <div>
//                         <label
//                             htmlFor="zip_code"
//                             className="block text-sm font-medium text-gray-700 mb-2"
//                         >
//                             Post Code *
//                         </label>
//                         <input
//                             type="text"
//                             id="zip_code"
//                             name="zip_code"
//                             value={bookingForm.zip_code}
//                             onChange={handleChange}
//                             required
//                             className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
//                                 errors.zip_code
//                                     ? "border-red-500"
//                                     : "border-gray-300"
//                             }`}
//                             placeholder="6210 or 6180 or 6175"
//                             maxLength="5"
//                         />
//                         {errors.zip_code ? (
//                             <p className="mt-1 text-sm text-red-600">
//                                 {errors.zip_code}
//                             </p>
//                         ) : (
//                             <p className="mt-1 text-sm text-gray-500">
//                                 Currently serving only areas with zip codes 6210, 6180, or 6175.
//                                 {bookingForm.address !==
//                                     "meetpoint-mandurah-dot" && (
//                                     <span className="block">
//                                         If your address is not available, please
//                                         select "Meetpoint Mandurah Dot".
//                                     </span>
//                                 )}
//                             </p>
//                         )}
//                     </div>

//                     {/* Test Location - Only shown for test packages */}
//                     {isTestPackage && (
//                         <div>
//                             <label
//                                 htmlFor="test_location"
//                                 className="block text-sm font-medium text-gray-700 mb-2"
//                             >
//                                 Test Location *
//                             </label>
//                             <input
//                                 type="text"
//                                 id="test_location"
//                                 name="test_location"
//                                 value={bookingForm.test_location}
//                                 onChange={handleChange}
//                                 required={isTestPackage}
//                                 className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
//                                     errors.test_location
//                                         ? "border-red-500"
//                                         : "border-gray-300"
//                                 }`}
//                                 placeholder="Enter test location (street address)"
//                             />
//                             {errors.test_location && (
//                                 <p className="mt-1 text-sm text-red-600">
//                                     {errors.test_location}
//                                 </p>
//                             )}
//                         </div>
//                     )}

//                     {/* Pickup Location - Removed the "Same as address" button */}
//                     <div>
//                         <label
//                             htmlFor="pickup_location"
//                             className="block text-sm font-medium text-gray-700 mb-2"
//                         >
//                             Pickup Location *
//                         </label>
//                         <input
//                             type="text"
//                             id="pickup_location"
//                             name="pickup_location"
//                             value={bookingForm.pickup_location}
//                             onChange={handleChange}
//                             required
//                             className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
//                                 errors.pickup_location
//                                     ? "border-red-500"
//                                     : "border-gray-300"
//                             }`}
//                             placeholder="Enter pickup location (street address)"
//                         />
//                         {errors.pickup_location && (
//                             <p className="mt-1 text-sm text-red-600">
//                                 {errors.pickup_location}
//                             </p>
//                         )}
//                     </div>

//                     {/* Dropoff Location - Changed button to "Same as Pickup Location" */}
//                     <div>
//                         <div className="flex justify-between items-center mb-2">
//                             <label
//                                 htmlFor="dropoff_location"
//                                 className="block text-sm font-medium text-gray-700"
//                             >
//                                 Dropoff Location *
//                             </label>
//                             <button
//                                 type="button"
//                                 onClick={setDropoffSameAsPickup}
//                                 className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
//                             >
//                                 Same as Pickup Location
//                             </button>
//                         </div>
//                         <input
//                             type="text"
//                             id="dropoff_location"
//                             name="dropoff_location"
//                             value={bookingForm.dropoff_location}
//                             onChange={handleChange}
//                             required
//                             className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
//                                 errors.dropoff_location
//                                     ? "border-red-500"
//                                     : "border-gray-300"
//                             }`}
//                             placeholder="Enter dropoff location (street address)"
//                         />
//                         {errors.dropoff_location && (
//                             <p className="mt-1 text-sm text-red-600">
//                                 {errors.dropoff_location}
//                             </p>
//                         )}
//                     </div>

//                     {/* Buttons */}
//                     <div className="flex gap-4 pt-4">
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             disabled={loading}
//                             className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="flex-1 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             {loading ? (
//                                 <div className="flex items-center justify-center">
//                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                                     Processing...
//                                 </div>
//                             ) : (
//                                 "Confirm Booking"
//                             )}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default BookingForm;


import { X } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const MEETPOINT_AREA = "meetpoint-mandurah-dot";

// Home address shown in the left "Home Address" field
const MEETPOINT_HOME_ADDRESS = "Ranceby Avenue";

// Suburb/area shown in the right "Location" autocomplete field
const MEETPOINT_LOCATION_LABEL = "Mandurah, Western Australia 6210";

// Full location object used for selectedLocations (source:"fixed" marks it as meetpoint)
const MEETPOINT_LOCATION = {
    label: MEETPOINT_LOCATION_LABEL,
    name: "Mandurah",
    street: "Ranceby Avenue",
    housenumber: null,
    postcode: "6210",
    city: "Mandurah",
    district: null,
    state: "Western Australia",
    source: "fixed",
};

const normaliseAddressText = (text = "") => {
    const ordinals = {
        "1st": "first", "2nd": "second", "3rd": "third", "4th": "fourth",
        "5th": "fifth", "6th": "sixth", "7th": "seventh", "8th": "eighth",
        "9th": "ninth", "10th": "tenth", "11th": "eleventh", "12th": "twelfth",
        "13th": "thirteenth", "14th": "fourteenth", "15th": "fifteenth",
        "16th": "sixteenth", "17th": "seventeenth", "18th": "eighteenth",
        "19th": "nineteenth", "20th": "twentieth",
    };

    return text
        .toLowerCase()
        .replace(/\b([0-9]{1,2}(?:st|nd|rd|th))\b/g, (match) => ordinals[match] || match)
        .replace(/\bav\b|\bave\b/g, "avenue")
        .replace(/\brd\b/g, "road")
        .replace(/\bst\b/g, "street")
        .replace(/\bdr\b/g, "drive")
        .replace(/\bct\b/g, "court")
        .replace(/\bpde\b/g, "parade")
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};

const locationMatchesTypedAddress = (location, typedAddress) => {
    if (!location || !typedAddress?.trim()) return false;

    const typed = normaliseAddressText(typedAddress);
    const streetAnchor = normaliseAddressText(location.street || location.name || "");
    const suburbAnchors = [location.city, location.district, location.postcode]
        .filter(Boolean)
        .map(normaliseAddressText);

    if (streetAnchor && typed.includes(streetAnchor)) return true;
    return suburbAnchors.some((anchor) => anchor && typed.includes(anchor));
};

const LocationAutocomplete = ({
    id,
    name,
    label,
    value,
    error,
    selectedLocation,
    placeholder,
    onInputChange,
    onLocationSelect,
    action,
    showHomeAddress,
    homeAddress,
    homeAddressError,
    onHomeAddressChange,
    locked,
}) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchError, setSearchError] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const blurTimeout = useRef(null);

    useEffect(() => {
        // Don't search when locked (meetpoint selected)
        if (locked) {
            setSuggestions([]);
            setSearchError("");
            setLoading(false);
            return undefined;
        }

        const query = value.trim();
        if (query.length < 3 || locationMatchesTypedAddress(selectedLocation, query)) {
            setSuggestions([]);
            setSearchError("");
            setLoading(false);
            return undefined;
        }

        const controller = new AbortController();
        const timeout = setTimeout(async () => {
            try {
                setLoading(true);
                setSearchError("");
                const response = await axios.get(route("locations.search"), {
                    params: { q: query },
                    signal: controller.signal,
                });
                setSuggestions(response.data.suggestions || []);
                setIsOpen(true);
            } catch (err) {
                if (err.code !== "ERR_CANCELED") {
                    setSuggestions([]);
                    setSearchError("Address search is unavailable. Please try again.");
                }
            } finally {
                setLoading(false);
            }
        }, 350);

        return () => { clearTimeout(timeout); controller.abort(); };
    }, [value, selectedLocation, locked]);

    useEffect(() => () => { if (blurTimeout.current) clearTimeout(blurTimeout.current); }, []);

    const handleBlur = () => {
        blurTimeout.current = setTimeout(() => setIsOpen(false), 150);
    };

    const shouldShowSuggestions =
        !locked &&
        isOpen &&
        value.trim().length >= 3 &&
        !locationMatchesTypedAddress(selectedLocation, value);

    const lockedInputClass =
        "w-full px-4 py-2 border rounded-lg outline-none transition bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed select-none";

    return (
        <div>
            {showHomeAddress ? (
                /* ── Two-column layout ── */
                <div className="flex gap-4 items-start">

                    {/* Left: Home Address */}
                    <div className="flex-1">
                        <label
                            htmlFor={`${id}_home_address`}
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Home Address *
                        </label>
                        <input
                            type="text"
                            id={`${id}_home_address`}
                            value={homeAddress}
                            onChange={(e) => !locked && onHomeAddressChange(name, e.target.value)}
                            required
                            readOnly={locked}
                            autoComplete="street-address"
                            className={
                                locked
                                    ? lockedInputClass
                                    : `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                          homeAddressError ? "border-red-500" : "border-gray-300"
                                      }`
                            }
                            placeholder="e.g. 12 Oak Street, Unit 3"
                        />
                        {!locked && homeAddressError ? (
                            <p className="mt-1 text-sm text-red-600">{homeAddressError}</p>
                        ) : !locked ? (
                            <p className="mt-1 text-xs text-gray-500">House/unit number and street name.</p>
                        ) : (
                            <p className="mt-1 text-xs text-gray-400">Set by meetpoint selection.</p>
                        )}
                    </div>

                    {/* Right: Location Autocomplete */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center gap-3 mb-2">
                            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                                {label}
                            </label>
                            {!locked && action}
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                id={id}
                                name={name}
                                value={value}
                                onChange={(e) => !locked && onInputChange(name, e.target.value)}
                                onFocus={() => !locked && setIsOpen(true)}
                                onBlur={handleBlur}
                                required
                                readOnly={locked}
                                autoComplete="off"
                                className={
                                    locked
                                        ? lockedInputClass
                                        : `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                              error ? "border-red-500" : "border-gray-300"
                                          }`
                                }
                                placeholder={placeholder}
                            />

                            {shouldShowSuggestions && (
                                <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                                    {loading && (
                                        <div className="px-4 py-3 text-sm text-gray-500">
                                            Searching service area...
                                        </div>
                                    )}
                                    {!loading && suggestions.map((suggestion) => (
                                        <button
                                            key={`${suggestion.source}-${suggestion.label}`}
                                            type="button"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                onLocationSelect(name, suggestion);
                                                setIsOpen(false);
                                            }}
                                            className="block w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none"
                                        >
                                            <span className="block font-medium">{suggestion.label}</span>
                                            {suggestion.postcode && (
                                                <span className="block text-xs text-gray-500">
                                                    Postcode {suggestion.postcode}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                    {!loading && suggestions.length === 0 && !searchError && (
                                        <div className="px-4 py-3 text-sm text-gray-500">
                                            No service-area address found.
                                        </div>
                                    )}
                                    {!loading && searchError && (
                                        <div className="px-4 py-3 text-sm text-red-600">{searchError}</div>
                                    )}
                                </div>
                            )}
                        </div>
                        {!locked && error ? (
                            <p className="mt-1 text-sm text-red-600">{error}</p>
                        ) : !locked ? (
                            <p className="mt-1 text-xs text-gray-500">
                                Choose a service-area suggestion, then add house number, unit, or pickup notes if needed.
                            </p>
                        ) : (
                            <p className="mt-1 text-xs text-gray-400">Set by meetpoint selection.</p>
                        )}
                    </div>
                    {/* end right column */}
                </div>
            ) : (
                /* single-column layout — no home address yet */
                <div>
                    <div className="flex justify-between items-center gap-3 mb-2">
                        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                            {label}
                        </label>
                        {!locked && action}
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            id={id}
                            name={name}
                            value={value}
                            onChange={(e) => !locked && onInputChange(name, e.target.value)}
                            onFocus={() => !locked && setIsOpen(true)}
                            onBlur={handleBlur}
                            required
                            readOnly={locked}
                            autoComplete="off"
                            className={
                                locked
                                    ? lockedInputClass
                                    : `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                          error ? "border-red-500" : "border-gray-300"
                                      }`
                            }
                            placeholder={placeholder}
                        />
                        {shouldShowSuggestions && (
                            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                                {loading && (
                                    <div className="px-4 py-3 text-sm text-gray-500">Searching service area...</div>
                                )}
                                {!loading && suggestions.map((suggestion) => (
                                    <button
                                        key={`${suggestion.source}-${suggestion.label}`}
                                        type="button"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            onLocationSelect(name, suggestion);
                                            setIsOpen(false);
                                        }}
                                        className="block w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none"
                                    >
                                        <span className="block font-medium">{suggestion.label}</span>
                                        {suggestion.postcode && (
                                            <span className="block text-xs text-gray-500">Postcode {suggestion.postcode}</span>
                                        )}
                                    </button>
                                ))}
                                {!loading && suggestions.length === 0 && !searchError && (
                                    <div className="px-4 py-3 text-sm text-gray-500">No service-area address found.</div>
                                )}
                                {!loading && searchError && (
                                    <div className="px-4 py-3 text-sm text-red-600">{searchError}</div>
                                )}
                            </div>
                        )}
                    </div>
                    {!locked && error ? (
                        <p className="mt-1 text-sm text-red-600">{error}</p>
                    ) : !locked ? (
                        <p className="mt-1 text-xs text-gray-500">
                            Choose a service-area suggestion, then add house number, unit, or pickup notes if needed.
                        </p>
                    ) : (
                        <p className="mt-1 text-xs text-gray-400">Set by meetpoint selection.</p>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── BookingForm ─────────────────────────────────────────────────────────────
const BookingForm = ({
    selectedDate,
    selectedTime,
    testTime,
    priceId,
    price,
    isTestPackage = false,
    bookingDetails = null,
    onClose,
    onBookingSuccess,
}) => {
    const [bookingForm, setBookingForm] = useState({
        user_name: "",
        email: "",
        phone: "",
        address: "",
        test_location: isTestPackage ? "Mandurah licensing center" : "",
        test_type: "",
        pickup_location: "",
        dropoff_location: "",
        pickup_home_address: "",
        dropoff_home_address: "",
        comment: "",
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [selectedLocations, setSelectedLocations] = useState({
        pickup_location: null,
        dropoff_location: null,
    });

    // Whether the meetpoint area is currently selected
    const isMeetpoint = bookingForm.address === MEETPOINT_AREA;

    // True only when a valid autocomplete suggestion is confirmed for each field
    const pickupConfirmed =
        !!selectedLocations.pickup_location &&
        locationMatchesTypedAddress(selectedLocations.pickup_location, bookingForm.pickup_location);

    const dropoffConfirmed =
        !!selectedLocations.dropoff_location &&
        locationMatchesTypedAddress(selectedLocations.dropoff_location, bookingForm.dropoff_location);

    // For meetpoint, always show the two-column layout (home address + location)
    const showPickupHomeAddress = isMeetpoint || pickupConfirmed;
    const showDropoffHomeAddress = isMeetpoint || dropoffConfirmed;

    useEffect(() => {
        if (bookingDetails) {
            setBookingForm((prev) => ({
                ...prev,
                pickup_location: bookingDetails.pickup_location || bookingDetails.test_location || "",
                dropoff_location: bookingDetails.dropoff_location || bookingDetails.test_location || "",
                test_location: bookingDetails.test_location || (isTestPackage ? "Mandurah licensing center" : "") || "",
            }));
        } else if (isTestPackage) {
            setBookingForm((prev) => ({ ...prev, test_location: "Mandurah licensing center" }));
        }
    }, [bookingDetails, isTestPackage]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
        return () => {
            document.body.style.overflow = "unset";
            document.body.style.position = "static";
            document.body.style.width = "auto";
        };
    }, []);

    const parseDuration = (durationString) => {
        if (!durationString) return 60;
        const s = durationString.trim().toLowerCase();
        const hourMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:hrs|hr|hour|hours)/);
        const minuteMatch = s.match(/(\d+)\s*(?:min|mins|minute|minutes)/);
        let total = 0;
        if (hourMatch) total += parseFloat(hourMatch[1]) * 60;
        if (minuteMatch) total += parseInt(minuteMatch[1]);
        if (total === 0) {
            const n = s.match(/(\d+(?:\.\d+)?)/);
            if (n) { const v = parseFloat(n[1]); total = v < 10 ? Math.round(v * 60) : Math.round(v); }
        }
        return total || 60;
    };

    const extractPackageName = (description) => {
        if (!description) return "";
        return description.includes(":") ? description.split(":").pop().trim() : description.trim();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "address") {
            if (value === MEETPOINT_AREA) {
                // Auto-fill with split meetpoint values
                setBookingForm((prev) => ({
                    ...prev,
                    address: value,
                    pickup_location: MEETPOINT_LOCATION_LABEL,
                    dropoff_location: MEETPOINT_LOCATION_LABEL,
                    pickup_home_address: MEETPOINT_HOME_ADDRESS,
                    dropoff_home_address: MEETPOINT_HOME_ADDRESS,
                }));
                setSelectedLocations({
                    pickup_location: MEETPOINT_LOCATION,
                    dropoff_location: MEETPOINT_LOCATION,
                });
            } else {
                // Switching away from meetpoint: clear the auto-filled location fields
                setBookingForm((prev) => {
                    const wasMeetpoint =
                        prev.pickup_location === MEETPOINT_LOCATION_LABEL ||
                        prev.dropoff_location === MEETPOINT_LOCATION_LABEL;
                    return {
                        ...prev,
                        address: value,
                        pickup_location: wasMeetpoint ? "" : prev.pickup_location,
                        dropoff_location: wasMeetpoint ? "" : prev.dropoff_location,
                        pickup_home_address: wasMeetpoint ? "" : prev.pickup_home_address,
                        dropoff_home_address: wasMeetpoint ? "" : prev.dropoff_home_address,
                    };
                });
                setSelectedLocations((prev) => {
                    const pickupWasMeetpoint = prev.pickup_location?.source === "fixed";
                    const dropoffWasMeetpoint = prev.dropoff_location?.source === "fixed";
                    return {
                        pickup_location: pickupWasMeetpoint ? null : prev.pickup_location,
                        dropoff_location: dropoffWasMeetpoint ? null : prev.dropoff_location,
                    };
                });
            }

            setErrors((prev) => ({
                ...prev,
                address: "",
                pickup_location: "",
                dropoff_location: "",
                pickup_home_address: "",
                dropoff_home_address: "",
            }));
            return;
        }

        setBookingForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleLocationInputChange = (name, value) => {
        setBookingForm((prev) => ({ ...prev, [name]: value }));
        setSelectedLocations((prev) => ({
            ...prev,
            [name]: locationMatchesTypedAddress(prev[name], value) ? prev[name] : null,
        }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleLocationSelect = (name, location) => {
        setBookingForm((prev) => ({ ...prev, [name]: location.label }));
        setSelectedLocations((prev) => ({ ...prev, [name]: location }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleHomeAddressChange = (locationField, value) => {
        const key = locationField === "pickup_location" ? "pickup_home_address" : "dropoff_home_address";
        setBookingForm((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
    };

    const validateSelectedLocations = () => {
        const errs = {};

        [["pickup_location", "pickup location"], ["dropoff_location", "dropoff location"]].forEach(([field, label]) => {
            if (!bookingForm[field]?.trim()) {
                errs[field] = `Please enter a ${label}.`;
                return;
            }
            if (!selectedLocations[field] || !locationMatchesTypedAddress(selectedLocations[field], bookingForm[field])) {
                errs[field] = `Please choose a service-area suggestion for the ${label}, then add house/unit details if needed.`;
            }
        });

        // For meetpoint, home address fields are pre-filled — skip validation
        if (!isMeetpoint) {
            if (pickupConfirmed && !bookingForm.pickup_home_address?.trim()) {
                errs.pickup_home_address = "Please enter your home address for pickup.";
            }
            if (dropoffConfirmed && !bookingForm.dropoff_home_address?.trim()) {
                errs.dropoff_home_address = "Please enter your home address for dropoff.";
            }
        }

        return errs;
    };

    const setDropoffSameAsPickup = () => {
        if (bookingForm.pickup_location && locationMatchesTypedAddress(selectedLocations.pickup_location, bookingForm.pickup_location)) {
            setBookingForm((prev) => ({
                ...prev,
                dropoff_location: prev.pickup_location,
                dropoff_home_address: prev.pickup_home_address,
            }));
            setSelectedLocations((prev) => ({ ...prev, dropoff_location: prev.pickup_location }));
            setErrors((prev) => ({ ...prev, dropoff_location: "", dropoff_home_address: "" }));
        } else {
            alert("Please select a pickup location from the suggestions first");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        if (!acceptTerms) {
            setErrors({ terms: "Please accept the Terms & Conditions and Privacy Policy" });
            setLoading(false);
            return;
        }

        const locationErrors = validateSelectedLocations();
        if (Object.keys(locationErrors).length > 0) {
            setErrors(locationErrors);
            setLoading(false);
            return;
        }

        try {
            const durationMinutes = parseDuration(price.duration);
            const routeName = isTestPackage ? "test-packages.store" : "ourreservations.store";
            const packageName = extractPackageName(price.description);

            // Combine home address + suburb location into a single saved string
            const pickupFull = bookingForm.pickup_home_address
                ? `${bookingForm.pickup_home_address}, ${bookingForm.pickup_location}`
                : bookingForm.pickup_location;

            const dropoffFull = bookingForm.dropoff_home_address
                ? `${bookingForm.dropoff_home_address}, ${bookingForm.dropoff_location}`
                : bookingForm.dropoff_location;

            const bookingData = {
                ...bookingForm,
                reservation_date: formatDateKey(selectedDate),
                price_id: priceId,
                duration_minutes: durationMinutes,
                accepted_terms: acceptTerms,
            };

            if (isTestPackage) {
                Object.assign(bookingData, {
                    start_time: bookingDetails?.start_time || selectedTime,
                    end_time: bookingDetails?.end_time || calculateEndTime(selectedTime, price.duration),
                    test_time: testTime || selectedTime,
                    test_location: bookingForm.test_location,
                    pickup_location: pickupFull,
                    dropoff_location: dropoffFull,
                    test_type: packageName,
                });
            } else {
                Object.assign(bookingData, {
                    start_time: selectedTime,
                    end_time: calculateEndTime(selectedTime, price.duration),
                    package_type: packageName,
                    package_price: price.price,
                    pickup_location: pickupFull,
                    dropoff_location: dropoffFull,
                });
            }

            const response = await axios.post(route(routeName), bookingData);

            if (response.data.success || response.data.message) {
                alert(isTestPackage ? "Test package booked successfully!" : "Booking confirmed successfully!");
                await onBookingSuccess();
                onClose();
            } else {
                alert("Error confirming booking: " + response.data.message);
            }
        } catch (error) {
            if (error.response?.data?.message) {
                const msg = error.response.data.message;
                if (msg.includes("already reserved for this service")) {
                    alert("This time slot has just been booked by someone else. Please select another time.");
                    if (onBookingSuccess) await onBookingSuccess();
                } else {
                    alert("Booking error: " + msg);
                }
            } else if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                alert("Please fix the errors in the form.");
            } else if (error.response?.data?.error) {
                alert("Booking error: " + error.response.data.error);
            } else {
                alert("Error confirming booking. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDateKey = (date) => {
        if (!date) return "";
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };

    const formatDisplayDate = (date) => {
        if (!date) return "";
        return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    };

    const calculateEndTime = (startTime, durationString) => {
        const mins = parseDuration(durationString);
        const [h, m] = startTime.split(":").map(Number);
        const total = h * 60 + m + mins;
        return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
    };

    const displayTime = isTestPackage ? testTime || selectedTime : selectedTime;
    const displayEndTime = calculateEndTime(displayTime, price.duration);
    const displayPackageName = extractPackageName(price.description);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 rounded-t-lg bg-indigo-600 text-white">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">
                            {isTestPackage ? "Complete Your Test Booking" : "Complete Your Booking"}
                        </h2>
                        <button type="button" onClick={onClose} className="text-white hover:opacity-80 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="mt-2">
                        <p className="opacity-90">{formatDisplayDate(selectedDate)}</p>
                        <p className="opacity-90 mt-1">Time: {displayTime} to {displayEndTime}</p>
                        <p className="opacity-90 mt-1">Package: {displayPackageName} - ${price.price}</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Full Name */}
                    <div>
                        <label htmlFor="user_name" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                        </label>
                        <input
                            type="text" id="user_name" name="user_name"
                            value={bookingForm.user_name} onChange={handleChange} required
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.user_name ? "border-red-500" : "border-gray-300"}`}
                            placeholder="John Doe"
                        />
                        {errors.user_name && <p className="mt-1 text-sm text-red-600">{errors.user_name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                        </label>
                        <input
                            type="email" id="email" name="email"
                            value={bookingForm.email} onChange={handleChange} required
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.email ? "border-red-500" : "border-gray-300"}`}
                            placeholder="john@example.com"
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                        </label>
                        <input
                            type="tel" id="phone" name="phone"
                            value={bookingForm.phone} onChange={handleChange} required
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                            placeholder="+1 (555) 000-0000"
                        />
                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                    </div>

                    {/* Area */}
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                            Area *
                        </label>
                        <select
                            id="address" name="address"
                            value={bookingForm.address} onChange={handleChange} required
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white ${errors.address ? "border-red-500" : "border-gray-300"}`}
                        >
                            <option value="">Select your Area</option>
                            <option value="mandurah">Mandurah</option>
                            <option value="meadow-springs">Meadow Springs</option>
                            <option value="silver-sands">Silver Sands</option>
                            <option value="lakelands">Lakelands</option>
                            <option value="dudley-park">Dudley Park</option>
                            <option value="halls-head">Halls Head</option>
                            <option value="madora-bay">Madora Bay</option>
                            <option value="greenfields">Greenfields</option>
                            <option value="erskine">Erskine</option>
                            <option value="singleton">Singleton</option>
                            <option value="parklands">Parklands</option>
                            <option value="stake-hill">Stake Hill</option>
                            <option value="san-remo">San Remo</option>
                            <option value="meetpoint-mandurah-dot">Meetpoint Mandurah Dot</option>
                        </select>
                        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                        <p className="mt-1 text-sm text-gray-500">
                            Currently serving only these areas with postcode 6210, 6180, or 6175.{" "}
                            <span className="block">
                                If your address is not available, please select "Meetpoint Mandurah Dot" where you will be meeting the instructor.
                            </span>
                        </p>
                    </div>

                    {/* Test Location */}
                    {isTestPackage && (
                        <div>
                            <label htmlFor="test_location" className="block text-sm font-medium text-gray-700 mb-2">
                                Test Location *
                            </label>
                            <input
                                type="text" id="test_location" name="test_location"
                                value={bookingForm.test_location} onChange={handleChange} required={isTestPackage}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.test_location ? "border-red-500" : "border-gray-300"}`}
                                placeholder="Enter test location"
                            />
                            {errors.test_location && <p className="mt-1 text-sm text-red-600">{errors.test_location}</p>}
                        </div>
                    )}

                    {/* Pickup: Home Address (left) + Autocomplete (right) */}
                    <LocationAutocomplete
                        id="pickup_location"
                        name="pickup_location"
                        label="Pickup Location *"
                        value={bookingForm.pickup_location}
                        selectedLocation={selectedLocations.pickup_location}
                        error={errors.pickup_location}
                        placeholder="Start typing pickup address"
                        onInputChange={handleLocationInputChange}
                        onLocationSelect={handleLocationSelect}
                        showHomeAddress={showPickupHomeAddress}
                        homeAddress={bookingForm.pickup_home_address}
                        homeAddressError={errors.pickup_home_address}
                        onHomeAddressChange={handleHomeAddressChange}
                        locked={isMeetpoint}
                    />

                    {/* Dropoff: Home Address (left) + Autocomplete (right) */}
                    <LocationAutocomplete
                        id="dropoff_location"
                        name="dropoff_location"
                        label="Dropoff Location *"
                        value={bookingForm.dropoff_location}
                        selectedLocation={selectedLocations.dropoff_location}
                        error={errors.dropoff_location}
                        placeholder="Start typing dropoff address"
                        onInputChange={handleLocationInputChange}
                        onLocationSelect={handleLocationSelect}
                        showHomeAddress={showDropoffHomeAddress}
                        homeAddress={bookingForm.dropoff_home_address}
                        homeAddressError={errors.dropoff_home_address}
                        onHomeAddressChange={handleHomeAddressChange}
                        locked={isMeetpoint}
                        action={
                            <button
                                type="button"
                                onClick={setDropoffSameAsPickup}
                                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors whitespace-nowrap"
                            >
                                Same as Pickup Location
                            </button>
                        }
                    />

                    {/* Comment */}
                    <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                            Comment
                        </label>
                        <textarea
                            id="comment" name="comment"
                            value={bookingForm.comment} onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                            placeholder="Any special requests, notes for your instructor, etc."
                        />
                    </div>

                    {/* Terms */}
                    <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox" id="acceptTerms" checked={acceptTerms}
                                onChange={(e) => {
                                    setAcceptTerms(e.target.checked);
                                    if (errors.terms) setErrors((prev) => ({ ...prev, terms: "" }));
                                }}
                                className="mt-1 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                required
                            />
                            <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                                I agree to the{" "}
                                <a href="https://wheelmasterdriving.com.au/terms" target="_blank" rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-800 underline font-medium">
                                    Terms & Conditions
                                </a>{" "}
                                and{" "}
                                <a href="https://wheelmasterdriving.com.au/policy" target="_blank" rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-800 underline font-medium">
                                    Privacy Policy
                                </a>{" "}*
                            </label>
                        </div>
                        {errors.terms && <p className="mt-1 text-sm text-red-600">{errors.terms}</p>}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button" onClick={onClose} disabled={loading}
                            className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit" disabled={loading || !acceptTerms}
                            className="flex-1 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Processing...
                                </div>
                            ) : "Confirm Booking"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingForm;


// import { X } from "lucide-react";
// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";

// const MEETPOINT_AREA = "meetpoint-mandurah-dot";
// const MEETPOINT_LOCATION = {
//     label: "Ranceby Avenue, Mandurah, Western Australia 6210",
//     name: "Ranceby Avenue",
//     street: "Ranceby Avenue",
//     housenumber: null,
//     postcode: "6210",
//     city: "Mandurah",
//     district: null,
//     state: "Western Australia",
//     source: "fixed",
// };

// const normaliseAddressText = (text = "") => {
//     const ordinals = {
//         "1st": "first",
//         "2nd": "second",
//         "3rd": "third",
//         "4th": "fourth",
//         "5th": "fifth",
//         "6th": "sixth",
//         "7th": "seventh",
//         "8th": "eighth",
//         "9th": "ninth",
//         "10th": "tenth",
//         "11th": "eleventh",
//         "12th": "twelfth",
//         "13th": "thirteenth",
//         "14th": "fourteenth",
//         "15th": "fifteenth",
//         "16th": "sixteenth",
//         "17th": "seventeenth",
//         "18th": "eighteenth",
//         "19th": "nineteenth",
//         "20th": "twentieth",
//     };

//     return text
//         .toLowerCase()
//         .replace(/\b([0-9]{1,2}(?:st|nd|rd|th))\b/g, (match) => {
//             return ordinals[match] || match;
//         })
//         .replace(/\bav\b|\bave\b/g, "avenue")
//         .replace(/\brd\b/g, "road")
//         .replace(/\bst\b/g, "street")
//         .replace(/\bdr\b/g, "drive")
//         .replace(/\bct\b/g, "court")
//         .replace(/\bpde\b/g, "parade")
//         .replace(/[^a-z0-9]+/g, " ")
//         .replace(/\s+/g, " ")
//         .trim();
// };

// const locationMatchesTypedAddress = (location, typedAddress) => {
//     if (!location || !typedAddress?.trim()) return false;

//     const typed = normaliseAddressText(typedAddress);
//     const streetAnchor = normaliseAddressText(
//         location.street || location.name || "",
//     );
//     const suburbAnchors = [location.city, location.district, location.postcode]
//         .filter(Boolean)
//         .map(normaliseAddressText);

//     if (streetAnchor && typed.includes(streetAnchor)) {
//         return true;
//     }

//     return suburbAnchors.some((anchor) => anchor && typed.includes(anchor));
// };

// const LocationAutocomplete = ({
//     id,
//     name,
//     label,
//     value,
//     error,
//     selectedLocation,
//     placeholder,
//     onInputChange,
//     onLocationSelect,
//     action,
// }) => {
//     const [suggestions, setSuggestions] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [searchError, setSearchError] = useState("");
//     const [isOpen, setIsOpen] = useState(false);
//     const blurTimeout = useRef(null);

//     useEffect(() => {
//         const query = value.trim();

//         if (
//             query.length < 3 ||
//             locationMatchesTypedAddress(selectedLocation, query)
//         ) {
//             setSuggestions([]);
//             setSearchError("");
//             setLoading(false);
//             return undefined;
//         }

//         const controller = new AbortController();
//         const timeout = setTimeout(async () => {
//             try {
//                 setLoading(true);
//                 setSearchError("");

//                 const response = await axios.get(route("locations.search"), {
//                     params: { q: query },
//                     signal: controller.signal,
//                 });

//                 setSuggestions(response.data.suggestions || []);
//                 setIsOpen(true);
//             } catch (error) {
//                 if (error.code !== "ERR_CANCELED") {
//                     setSuggestions([]);
//                     setSearchError(
//                         "Address search is unavailable. Please try again.",
//                     );
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         }, 350);

//         return () => {
//             clearTimeout(timeout);
//             controller.abort();
//         };
//     }, [value, selectedLocation]);

//     useEffect(() => {
//         return () => {
//             if (blurTimeout.current) {
//                 clearTimeout(blurTimeout.current);
//             }
//         };
//     }, []);

//     const handleBlur = () => {
//         blurTimeout.current = setTimeout(() => setIsOpen(false), 150);
//     };

//     const shouldShowSuggestions =
//         isOpen &&
//         value.trim().length >= 3 &&
//         !locationMatchesTypedAddress(selectedLocation, value);

//     return (
//         <div>
//             <div className="flex justify-between items-center mb-2 gap-3">
//                 <label
//                     htmlFor={id}
//                     className="block text-sm font-medium text-gray-700"
//                 >
//                     {label}
//                 </label>
//                 {action}
//             </div>
//             <div className="relative">
//                 <input
//                     type="text"
//                     id={id}
//                     name={name}
//                     value={value}
//                     onChange={(event) =>
//                         onInputChange(name, event.target.value)
//                     }
//                     onFocus={() => setIsOpen(true)}
//                     onBlur={handleBlur}
//                     required
//                     autoComplete="off"
//                     className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
//                         error ? "border-red-500" : "border-gray-300"
//                     }`}
//                     placeholder={placeholder}
//                 />

//                 {shouldShowSuggestions && (
//                     <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
//                         {loading && (
//                             <div className="px-4 py-3 text-sm text-gray-500">
//                                 Searching service area...
//                             </div>
//                         )}

//                         {!loading &&
//                             suggestions.map((suggestion) => (
//                                 <button
//                                     key={`${suggestion.source}-${suggestion.label}`}
//                                     type="button"
//                                     onMouseDown={(event) => {
//                                         event.preventDefault();
//                                         onLocationSelect(name, suggestion);
//                                         setIsOpen(false);
//                                     }}
//                                     className="block w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none"
//                                 >
//                                     <span className="block font-medium">
//                                         {suggestion.label}
//                                     </span>
//                                     {suggestion.postcode && (
//                                         <span className="block text-xs text-gray-500">
//                                             Postcode {suggestion.postcode}
//                                         </span>
//                                     )}
//                                 </button>
//                             ))}

//                         {!loading &&
//                             suggestions.length === 0 &&
//                             !searchError && (
//                                 <div className="px-4 py-3 text-sm text-gray-500">
//                                     No service-area address found.
//                                 </div>
//                             )}

//                         {!loading && searchError && (
//                             <div className="px-4 py-3 text-sm text-red-600">
//                                 {searchError}
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </div>
//             {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
//             {!error && (
//                 <p className="mt-1 text-xs text-gray-500">
//                     Choose a service-area suggestion, then add house number,
//                     unit, or pickup notes if needed.
//                 </p>
//             )}
//         </div>
//     );
// };

// const BookingForm = ({
//     selectedDate,
//     selectedTime,
//     testTime,
//     priceId,
//     price,
//     isTestPackage = false,
//     bookingDetails = null,
//     onClose,
//     onBookingSuccess,
// }) => {
//     const [bookingForm, setBookingForm] = useState({
//         user_name: "",
//         email: "",
//         phone: "",
//         address: "",
//         test_location: isTestPackage ? "Mandurah licensing center" : "",
//         test_type: "",
//         pickup_location: "",
//         dropoff_location: "",
//         comment: "",
//     });

//     const [loading, setLoading] = useState(false);
//     const [errors, setErrors] = useState({});
//     const [acceptTerms, setAcceptTerms] = useState(false);
//     const [selectedLocations, setSelectedLocations] = useState({
//         pickup_location: null,
//         dropoff_location: null,
//     });

//     useEffect(() => {
//         if (bookingDetails) {
//             setBookingForm((prev) => ({
//                 ...prev,
//                 pickup_location:
//                     bookingDetails.pickup_location ||
//                     bookingDetails.test_location ||
//                     "",
//                 dropoff_location:
//                     bookingDetails.dropoff_location ||
//                     bookingDetails.test_location ||
//                     "",
//                 test_location:
//                     bookingDetails.test_location ||
//                     (isTestPackage ? "Mandurah licensing center" : "") ||
//                     "",
//             }));
//         } else if (isTestPackage) {
//             setBookingForm((prev) => ({
//                 ...prev,
//                 test_location: "Mandurah licensing center",
//             }));
//         }
//     }, [bookingDetails, isTestPackage]);

//     useEffect(() => {
//         document.body.style.overflow = "hidden";
//         document.body.style.position = "fixed";
//         document.body.style.width = "100%";

//         return () => {
//             document.body.style.overflow = "unset";
//             document.body.style.position = "static";
//             document.body.style.width = "auto";
//         };
//     }, []);

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
//         if (hourMatch) totalMinutes += parseFloat(hourMatch[1]) * 60;
//         if (minuteMatch) totalMinutes += parseInt(minuteMatch[1]);

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

//     const extractPackageName = (description) => {
//         if (!description) return "";

//         if (description.includes(":")) {
//             return description.split(":").pop().trim();
//         }

//         return description.trim();
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setBookingForm((prev) => ({
//             ...prev,
//             [name]: value,
//             ...(name === "address" && value === MEETPOINT_AREA
//                 ? {
//                       pickup_location: MEETPOINT_LOCATION.label,
//                       dropoff_location: MEETPOINT_LOCATION.label,
//                   }
//                 : {}),
//         }));
//         if (name === "address" && value === MEETPOINT_AREA) {
//             setSelectedLocations({
//                 pickup_location: MEETPOINT_LOCATION,
//                 dropoff_location: MEETPOINT_LOCATION,
//             });
//         }
//         if (
//             errors[name] ||
//             (name === "address" &&
//                 value === MEETPOINT_AREA &&
//                 (errors.pickup_location || errors.dropoff_location))
//         ) {
//             setErrors((prev) => ({
//                 ...prev,
//                 [name]: "",
//                 ...(name === "address" && value === MEETPOINT_AREA
//                     ? {
//                           pickup_location: "",
//                           dropoff_location: "",
//                       }
//                     : {}),
//             }));
//         }
//     };

//     const handleLocationInputChange = (name, value) => {
//         setBookingForm((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//         setSelectedLocations((prev) => ({
//             ...prev,
//             [name]: locationMatchesTypedAddress(prev[name], value)
//                 ? prev[name]
//                 : null,
//         }));
//         if (errors[name]) {
//             setErrors((prev) => ({
//                 ...prev,
//                 [name]: "",
//             }));
//         }
//     };

//     const handleLocationSelect = (name, location) => {
//         setBookingForm((prev) => ({
//             ...prev,
//             [name]: location.label,
//         }));
//         setSelectedLocations((prev) => ({
//             ...prev,
//             [name]: location,
//         }));
//         if (errors[name]) {
//             setErrors((prev) => ({
//                 ...prev,
//                 [name]: "",
//             }));
//         }
//     };

//     const validateSelectedLocations = () => {
//         const locationErrors = {};

//         [
//             ["pickup_location", "pickup location"],
//             ["dropoff_location", "dropoff location"],
//         ].forEach(([field, label]) => {
//             if (!bookingForm[field]?.trim()) {
//                 locationErrors[field] = `Please enter a ${label}.`;
//                 return;
//             }

//             if (
//                 !selectedLocations[field] ||
//                 !locationMatchesTypedAddress(
//                     selectedLocations[field],
//                     bookingForm[field],
//                 )
//             ) {
//                 locationErrors[field] =
//                     `Please choose a service-area suggestion for the ${label}, then add house/unit details if needed.`;
//             }
//         });

//         return locationErrors;
//     };

//     const setPickupSameAsAddress = () => {
//         if (bookingForm.address) {
//             setBookingForm((prev) => ({
//                 ...prev,
//                 pickup_location: prev.address,
//             }));
//             if (errors.pickup_location) {
//                 setErrors((prev) => ({
//                     ...prev,
//                     pickup_location: "",
//                 }));
//             }
//         } else {
//             alert("Please select an address first");
//         }
//     };

//     const setDropoffSameAsPickup = () => {
//         if (
//             bookingForm.pickup_location &&
//             locationMatchesTypedAddress(
//                 selectedLocations.pickup_location,
//                 bookingForm.pickup_location,
//             )
//         ) {
//             setBookingForm((prev) => ({
//                 ...prev,
//                 dropoff_location: prev.pickup_location,
//             }));
//             setSelectedLocations((prev) => ({
//                 ...prev,
//                 dropoff_location: prev.pickup_location,
//             }));
//             if (errors.dropoff_location) {
//                 setErrors((prev) => ({
//                     ...prev,
//                     dropoff_location: "",
//                 }));
//             }
//         } else {
//             alert("Please select a pickup location from the suggestions first");
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setErrors({});

//         // Check terms and conditions acceptance
//         if (!acceptTerms) {
//             setErrors({
//                 terms: "Please accept the Terms & Conditions and Privacy Policy",
//             });
//             setLoading(false);
//             return;
//         }

//         const locationErrors = validateSelectedLocations();
//         if (Object.keys(locationErrors).length > 0) {
//             setErrors(locationErrors);
//             setLoading(false);
//             return;
//         }

//         try {
//             const durationMinutes = parseDuration(price.duration);
//             const routeName = isTestPackage
//                 ? "test-packages.store"
//                 : "ourreservations.store";

//             const fullAddress = bookingForm.address;
//             const packageName = extractPackageName(price.description);

//             const bookingData = {
//                 ...bookingForm,
//                 address: fullAddress,
//                 reservation_date: formatDateKey(selectedDate),
//                 price_id: priceId,
//                 duration_minutes: durationMinutes,
//                 accepted_terms: acceptTerms,
//             };

//             if (isTestPackage) {
//                 Object.assign(bookingData, {
//                     start_time: bookingDetails?.start_time || selectedTime,
//                     end_time:
//                         bookingDetails?.end_time ||
//                         calculateEndTime(selectedTime, price.duration),
//                     test_time: testTime || selectedTime,
//                     test_location: bookingForm.test_location,
//                     pickup_location: bookingForm.pickup_location,
//                     dropoff_location: bookingForm.dropoff_location,
//                     test_type: packageName,
//                 });
//             } else {
//                 Object.assign(bookingData, {
//                     start_time: selectedTime,
//                     end_time: calculateEndTime(selectedTime, price.duration),
//                     package_type: packageName,
//                     package_price: price.price,
//                     pickup_location: bookingForm.pickup_location,
//                     dropoff_location: bookingForm.dropoff_location,
//                 });
//             }

//             console.log("Submitting booking data:", bookingData);

//             const response = await axios.post(route(routeName), bookingData);

//             if (response.data.success || response.data.message) {
//                 alert(
//                     isTestPackage
//                         ? "Test package booked successfully!"
//                         : "Booking confirmed successfully!",
//                 );
//                 await onBookingSuccess();
//                 onClose();
//             } else {
//                 alert("Error confirming booking: " + response.data.message);
//             }
//         } catch (error) {
//             console.error("Booking error:", error);
//             console.error("Error response:", error.response);

//             if (error.response?.data?.message) {
//                 const errorMsg = error.response.data.message;

//                 if (errorMsg.includes("already reserved for this service")) {
//                     alert(
//                         "This time slot has just been booked by someone else. Please select another time.",
//                     );
//                     if (onBookingSuccess) {
//                         await onBookingSuccess();
//                     }
//                 } else {
//                     alert("Booking error: " + errorMsg);
//                 }
//             } else if (error.response?.data?.errors) {
//                 setErrors(error.response.data.errors);
//                 alert("Please fix the errors in the form.");
//             } else if (error.response?.data?.error) {
//                 alert("Booking error: " + error.response.data.error);
//             } else {
//                 alert("Error confirming booking. Please try again.");
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const formatDateKey = (date) => {
//         if (!date) return "";
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, "0");
//         const day = String(date.getDate()).padStart(2, "0");
//         return `${year}-${month}-${day}`;
//     };

//     const formatDisplayDate = (date) => {
//         if (!date) return "";
//         return date.toLocaleDateString("en-US", {
//             weekday: "long",
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//         });
//     };

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

//     const displayTime = isTestPackage ? testTime || selectedTime : selectedTime;
//     const displayEndTime = calculateEndTime(displayTime, price.duration);
//     const displayPackageName = extractPackageName(price.description);

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//                 {/* Header */}
//                 <div className="p-6 rounded-t-lg bg-indigo-600 text-white">
//                     <div className="flex justify-between items-center">
//                         <h2 className="text-2xl font-bold">
//                             {isTestPackage
//                                 ? "Complete Your Test Booking"
//                                 : "Complete Your Booking"}
//                         </h2>
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             className="text-white hover:opacity-80 transition-colors"
//                         >
//                             <X size={24} />
//                         </button>
//                     </div>
//                     <div className="mt-2">
//                         <p className="opacity-90">
//                             {formatDisplayDate(selectedDate)}
//                         </p>
//                         <p className="opacity-90 mt-1">
//                             Time: {displayTime} to {displayEndTime}
//                         </p>
//                         <p className="opacity-90 mt-1">
//                             Package: {displayPackageName} - ${price.price}
//                         </p>
//                     </div>
//                 </div>

//                 {/* Form */}
//                 <form onSubmit={handleSubmit} className="p-6 space-y-6">
//                     {/* Full Name */}
//                     <div>
//                         <label
//                             htmlFor="user_name"
//                             className="block text-sm font-medium text-gray-700 mb-2"
//                         >
//                             Full Name *
//                         </label>
//                         <input
//                             type="text"
//                             id="user_name"
//                             name="user_name"
//                             value={bookingForm.user_name}
//                             onChange={handleChange}
//                             required
//                             className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
//                                 errors.user_name
//                                     ? "border-red-500"
//                                     : "border-gray-300"
//                             }`}
//                             placeholder="John Doe"
//                         />
//                         {errors.user_name && (
//                             <p className="mt-1 text-sm text-red-600">
//                                 {errors.user_name}
//                             </p>
//                         )}
//                     </div>

//                     {/* Email */}
//                     <div>
//                         <label
//                             htmlFor="email"
//                             className="block text-sm font-medium text-gray-700 mb-2"
//                         >
//                             Email Address *
//                         </label>
//                         <input
//                             type="email"
//                             id="email"
//                             name="email"
//                             value={bookingForm.email}
//                             onChange={handleChange}
//                             required
//                             className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
//                                 errors.email
//                                     ? "border-red-500"
//                                     : "border-gray-300"
//                             }`}
//                             placeholder="john@example.com"
//                         />
//                         {errors.email && (
//                             <p className="mt-1 text-sm text-red-600">
//                                 {errors.email}
//                             </p>
//                         )}
//                     </div>

//                     {/* Phone */}
//                     <div>
//                         <label
//                             htmlFor="phone"
//                             className="block text-sm font-medium text-gray-700 mb-2"
//                         >
//                             Phone Number *
//                         </label>
//                         <input
//                             type="tel"
//                             id="phone"
//                             name="phone"
//                             value={bookingForm.phone}
//                             onChange={handleChange}
//                             required
//                             className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
//                                 errors.phone
//                                     ? "border-red-500"
//                                     : "border-gray-300"
//                             }`}
//                             placeholder="+1 (555) 000-0000"
//                         />
//                         {errors.phone && (
//                             <p className="mt-1 text-sm text-red-600">
//                                 {errors.phone}
//                             </p>
//                         )}
//                     </div>

//                     {/* Address - Dropdown */}
//                     <div>
//                         <label
//                             htmlFor="address"
//                             className="block text-sm font-medium text-gray-700 mb-2"
//                         >
//                             Area *
//                         </label>
//                         <select
//                             id="address"
//                             name="address"
//                             value={bookingForm.address}
//                             onChange={handleChange}
//                             required
//                             className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white ${
//                                 errors.address
//                                     ? "border-red-500"
//                                     : "border-gray-300"
//                             }`}
//                         >
//                             <option value="">Select your Area</option>
//                             <option value="mandurah">Mandurah</option>
//                             <option value="meadow-springs">
//                                 Meadow Springs
//                             </option>
//                             <option value="silver-sands">Silver Sands</option>
//                             <option value="lakelands">Lakelands</option>
//                             <option value="dudley-park">Dudley Park</option>
//                             <option value="halls-head">Halls Head</option>
//                             <option value="madora-bay">Madora Bay</option>
//                             <option value="greenfields">Greenfields</option>
//                             <option value="erskine">Erskine</option>
//                             <option value="singleton">Singleton </option>
//                             <option value="parklands">Parklands</option>
//                             <option value="stake-hill">Stake Hill</option>
//                             <option value="san-remo">San Remo</option>
//                             <option value="meetpoint-mandurah-dot">
//                                 Meetpoint Mandurah Dot
//                             </option>
//                         </select>
//                         {errors.address && (
//                             <p className="mt-1 text-sm text-red-600">
//                                 {errors.address}
//                             </p>
//                         )}
//                     </div>

//                     <p className="mt-1 text-sm text-gray-500">
//                         Currently serving only these areas with postcode 6210,
//                         6180, or 6175.
//                         <span className="block">
//                             If your address is not available, please select
//                             "Meetpoint Mandurah Dot" where you will be meeting
//                             instructor.
//                         </span>
//                     </p>

//                     {/* Test Location - Only shown for test packages */}
//                     {isTestPackage && (
//                         <div>
//                             <label
//                                 htmlFor="test_location"
//                                 className="block text-sm font-medium text-gray-700 mb-2"
//                             >
//                                 Test Location *
//                             </label>
//                             <input
//                                 type="text"
//                                 id="test_location"
//                                 name="test_location"
//                                 value={bookingForm.test_location}
//                                 onChange={handleChange}
//                                 required={isTestPackage}
//                                 className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
//                                     errors.test_location
//                                         ? "border-red-500"
//                                         : "border-gray-300"
//                                 }`}
//                                 placeholder="Enter test location"
//                             />
//                             {errors.test_location && (
//                                 <p className="mt-1 text-sm text-red-600">
//                                     {errors.test_location}
//                                 </p>
//                             )}
//                         </div>
//                     )}

//                     {/* Pickup Location */}
//                     <LocationAutocomplete
//                         id="pickup_location"
//                         name="pickup_location"
//                         label="Pickup Location *"
//                         value={bookingForm.pickup_location}
//                         selectedLocation={selectedLocations.pickup_location}
//                         error={errors.pickup_location}
//                         placeholder="Start typing pickup address"
//                         onInputChange={handleLocationInputChange}
//                         onLocationSelect={handleLocationSelect}
//                     />

//                     {/* Dropoff Location */}
//                     <LocationAutocomplete
//                         id="dropoff_location"
//                         name="dropoff_location"
//                         label="Dropoff Location *"
//                         value={bookingForm.dropoff_location}
//                         selectedLocation={selectedLocations.dropoff_location}
//                         error={errors.dropoff_location}
//                         placeholder="Start typing dropoff address"
//                         onInputChange={handleLocationInputChange}
//                         onLocationSelect={handleLocationSelect}
//                         action={
//                             <button
//                                 type="button"
//                                 onClick={setDropoffSameAsPickup}
//                                 className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
//                             >
//                                 Same as Pickup Location
//                             </button>
//                         }
//                     />

//                     {/* Comment */}
//                     <div>
//                         <label
//                             htmlFor="comment"
//                             className="block text-sm font-medium text-gray-700 mb-2"
//                         >
//                             Comment
                            
//                         </label>
//                         <textarea
//                             id="comment"
//                             name="comment"
//                             value={bookingForm.comment}
//                             onChange={handleChange}
//                             rows={6}
//                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
//                             placeholder="Any special requests, notes for your instructor, etc."
//                         />
//                     </div>

//                     {/* Terms and Conditions Checkbox */}
//                     <div className="border-t border-gray-200 pt-4">
//                         <div className="flex items-start gap-3">
//                             <input
//                                 type="checkbox"
//                                 id="acceptTerms"
//                                 checked={acceptTerms}
//                                 onChange={(e) => {
//                                     setAcceptTerms(e.target.checked);
//                                     if (errors.terms) {
//                                         setErrors((prev) => ({
//                                             ...prev,
//                                             terms: "",
//                                         }));
//                                     }
//                                 }}
//                                 className="mt-1 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//                                 required
//                             />
//                             <label
//                                 htmlFor="acceptTerms"
//                                 className="text-sm text-gray-700"
//                             >
//                                 I agree to the{" "}
//                                 <a
//                                     href="https://wheelmasterdriving.com.au/terms"
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="text-indigo-600 hover:text-indigo-800 underline font-medium"
//                                 >
//                                     Terms & Conditions
//                                 </a>{" "}
//                                 and{" "}
//                                 <a
//                                     href="https://wheelmasterdriving.com.au/policy"
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="text-indigo-600 hover:text-indigo-800 underline font-medium"
//                                 >
//                                     Privacy Policy
//                                 </a>{" "}
//                                 *
//                             </label>
//                         </div>
//                         {errors.terms && (
//                             <p className="mt-1 text-sm text-red-600">
//                                 {errors.terms}
//                             </p>
//                         )}
//                     </div>

//                     {/* Buttons */}
//                     <div className="flex gap-4 pt-4">
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             disabled={loading}
//                             className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={loading || !acceptTerms}
//                             className="flex-1 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             {loading ? (
//                                 <div className="flex items-center justify-center">
//                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                                     Processing...
//                                 </div>
//                             ) : (
//                                 "Confirm Booking"
//                             )}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default BookingForm;
