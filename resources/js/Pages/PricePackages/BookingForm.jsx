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
//     // Initialize form with all required fields
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

//     // Initialize form data based on booking type
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

//     // Lock body scroll when form mounts
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

//     // Parse duration to minutes
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

//     // Extract package name from price description
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

//     // Function to set pickup location same as address
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
//             alert("Please enter an address first");
//         }
//     };

//     // Function to set dropoff location same as address
//     const setDropoffSameAsAddress = () => {
//         if (bookingForm.address) {
//             setBookingForm((prev) => ({
//                 ...prev,
//                 dropoff_location: prev.address,
//             }));
//             if (errors.dropoff_location) {
//                 setErrors((prev) => ({
//                     ...prev,
//                     dropoff_location: "",
//                 }));
//             }
//         } else {
//             alert("Please enter an address first");
//         }
//     };

//     // Validate zip code - only allow 6210
//     const validateZipCode = (zip) => {
//         const cleanZip = zip.replace(/\D/g, "");
//         return cleanZip === "6210";
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setErrors({});

//         if (!validateZipCode(bookingForm.zip_code)) {
//             setErrors({
//                 zip_code:
//                     "Sorry, we currently only serve areas with zip code 6210. Please enter a valid zip code.",
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
//                 <div className={`p-6 rounded-t-lg bg-indigo-600 text-white`}>
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
//                     {/* User Name */}
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

//                     {/* Address */}
//                     <div>
//                         <label
//                             htmlFor="address"
//                             className="block text-sm font-medium text-gray-700 mb-2"
//                         >
//                             Address *
//                         </label>
//                         <textarea
//                             id="address"
//                             name="address"
//                             value={bookingForm.address}
//                             onChange={handleChange}
//                             required
//                             rows="3"
//                             className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none ${
//                                 errors.address
//                                     ? "border-red-500"
//                                     : "border-gray-300"
//                             }`}
//                             placeholder="123 Main Street, City, State"
//                         />
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
//                             Zip Code *
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
//                             placeholder="6210"
//                             maxLength="5"
//                         />
//                         {errors.zip_code ? (
//                             <p className="mt-1 text-sm text-red-600">
//                                 {errors.zip_code}
//                             </p>
//                         ) : (
//                             <p className="mt-1 text-sm text-gray-500">
//                                 Currently serving only areas with zip code 6210
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

//                     {/* Pickup Location with Same as Address button */}
//                     <div>
//                         <div className="flex justify-between items-center mb-2">
//                             <label
//                                 htmlFor="pickup_location"
//                                 className="block text-sm font-medium text-gray-700"
//                             >
//                                 {isTestPackage
//                                     ? "Pickup Location"
//                                     : "Pickup Location"}{" "}
//                                 *
//                             </label>
//                             <button
//                                 type="button"
//                                 onClick={setPickupSameAsAddress}
//                                 className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
//                             >
//                                 Same as address
//                             </button>
//                         </div>
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

//                     {/* Dropoff Location with Same as Address button */}
//                     <div>
//                         <div className="flex justify-between items-center mb-2">
//                             <label
//                                 htmlFor="dropoff_location"
//                                 className="block text-sm font-medium text-gray-700"
//                             >
//                                 {isTestPackage
//                                     ? "Dropoff Location"
//                                     : "Dropoff Location"}{" "}
//                                 *
//                             </label>
//                             <button
//                                 type="button"
//                                 onClick={setDropoffSameAsAddress}
//                                 className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
//                             >
//                                 Same as address
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
//                             className={`flex-1 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
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
import React, { useState, useEffect } from "react";
import axios from "axios";

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
        zip_code: "",
        test_location: isTestPackage ? "Mandurah licensing center" : "",
        test_type: "",
        pickup_location: "",
        dropoff_location: "",
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (bookingDetails) {
            setBookingForm((prev) => ({
                ...prev,
                pickup_location:
                    bookingDetails.pickup_location ||
                    bookingDetails.test_location ||
                    "",
                dropoff_location:
                    bookingDetails.dropoff_location ||
                    bookingDetails.test_location ||
                    "",
                test_location:
                    bookingDetails.test_location ||
                    (isTestPackage ? "Mandurah licensing center" : "") ||
                    "",
            }));
        } else if (isTestPackage) {
            setBookingForm((prev) => ({
                ...prev,
                test_location: "Mandurah licensing center",
            }));
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

        const cleanString = durationString.trim().toLowerCase();
        const hourMatch = cleanString.match(
            /(\d+(?:\.\d+)?)\s*(?:hrs|hr|hour|hours)/,
        );
        const minuteMatch = cleanString.match(
            /(\d+)\s*(?:min|mins|minute|minutes)/,
        );

        let totalMinutes = 0;
        if (hourMatch) totalMinutes += parseFloat(hourMatch[1]) * 60;
        if (minuteMatch) totalMinutes += parseInt(minuteMatch[1]);

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

    const extractPackageName = (description) => {
        if (!description) return "";

        if (description.includes(":")) {
            return description.split(":").pop().trim();
        }

        return description.trim();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBookingForm((prev) => ({
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

    const setPickupSameAsAddress = () => {
        if (bookingForm.address) {
            setBookingForm((prev) => ({
                ...prev,
                pickup_location: prev.address,
            }));
            if (errors.pickup_location) {
                setErrors((prev) => ({
                    ...prev,
                    pickup_location: "",
                }));
            }
        } else {
            alert("Please select an address first");
        }
    };

    const setDropoffSameAsAddress = () => {
        if (bookingForm.address) {
            setBookingForm((prev) => ({
                ...prev,
                dropoff_location: prev.address,
            }));
            if (errors.dropoff_location) {
                setErrors((prev) => ({
                    ...prev,
                    dropoff_location: "",
                }));
            }
        } else {
            alert("Please select an address first");
        }
    };

    const validateZipCode = (zip) => {
        const cleanZip = zip.replace(/\D/g, "");
        return cleanZip === "6210";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        if (!validateZipCode(bookingForm.zip_code)) {
            setErrors({
                zip_code:
                    "Sorry, we currently only serve areas with zip code 6210. Please enter a valid zip code.",
            });
            setLoading(false);
            return;
        }

        try {
            const durationMinutes = parseDuration(price.duration);
            const routeName = isTestPackage
                ? "test-packages.store"
                : "ourreservations.store";

            const fullAddress = `${bookingForm.address}, ${bookingForm.zip_code}`;
            const packageName = extractPackageName(price.description);

            const bookingData = {
                ...bookingForm,
                address: fullAddress,
                reservation_date: formatDateKey(selectedDate),
                price_id: priceId,
                duration_minutes: durationMinutes,
            };

            if (isTestPackage) {
                Object.assign(bookingData, {
                    start_time: bookingDetails?.start_time || selectedTime,
                    end_time:
                        bookingDetails?.end_time ||
                        calculateEndTime(selectedTime, price.duration),
                    test_time: testTime || selectedTime,
                    test_location: bookingForm.test_location,
                    pickup_location: bookingForm.pickup_location,
                    dropoff_location: bookingForm.dropoff_location,
                    test_type: packageName,
                });
            } else {
                Object.assign(bookingData, {
                    start_time: selectedTime,
                    end_time: calculateEndTime(selectedTime, price.duration),
                    package_type: packageName,
                    package_price: price.price,
                    pickup_location: bookingForm.pickup_location,
                    dropoff_location: bookingForm.dropoff_location,
                });
            }

            delete bookingData.zip_code;

            console.log("Submitting booking data:", bookingData);

            const response = await axios.post(route(routeName), bookingData);

            if (response.data.success || response.data.message) {
                alert(
                    isTestPackage
                        ? "Test package booked successfully!"
                        : "Booking confirmed successfully!",
                );
                await onBookingSuccess();
                onClose();
            } else {
                alert("Error confirming booking: " + response.data.message);
            }
        } catch (error) {
            console.error("Booking error:", error);
            console.error("Error response:", error.response);

            if (error.response?.data?.message) {
                const errorMsg = error.response.data.message;

                if (errorMsg.includes("already reserved for this service")) {
                    alert(
                        "This time slot has just been booked by someone else. Please select another time.",
                    );
                    if (onBookingSuccess) {
                        await onBookingSuccess();
                    }
                } else {
                    alert("Booking error: " + errorMsg);
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
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const formatDisplayDate = (date) => {
        if (!date) return "";
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

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
                            {isTestPackage
                                ? "Complete Your Test Booking"
                                : "Complete Your Booking"}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-white hover:opacity-80 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <div className="mt-2">
                        <p className="opacity-90">
                            {formatDisplayDate(selectedDate)}
                        </p>
                        <p className="opacity-90 mt-1">
                            Time: {displayTime} to {displayEndTime}
                        </p>
                        <p className="opacity-90 mt-1">
                            Package: {displayPackageName} - ${price.price}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Full Name */}
                    <div>
                        <label
                            htmlFor="user_name"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Full Name *
                        </label>
                        <input
                            type="text"
                            id="user_name"
                            name="user_name"
                            value={bookingForm.user_name}
                            onChange={handleChange}
                            required
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                errors.user_name
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                            placeholder="John Doe"
                        />
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
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={bookingForm.email}
                            onChange={handleChange}
                            required
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                errors.email
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                            placeholder="john@example.com"
                        />
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
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={bookingForm.phone}
                            onChange={handleChange}
                            required
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                errors.phone
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                            placeholder="+1 (555) 000-0000"
                        />
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
                            Address *
                        </label>
                        <select
                            id="address"
                            name="address"
                            value={bookingForm.address}
                            onChange={handleChange}
                            required
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white ${
                                errors.address
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                        >
                            <option value="">Select your Address</option>
                            <option value="mandurah">Mandurah</option>
                            <option value="meadow-springs">
                                Meadow Springs
                            </option>
                            <option value="silver-sands">Silver Sands</option>
                            <option value="lakelands">Lakelands</option>
                            <option value="dudley-park">Dudley Park</option>
                            <option value="halls-head">Halls Head</option>
                            <option value="madora-bay">Madora Bay</option>
                            <option value="greenfields">Greenfields</option>
                            <option value="erskine">Erskine</option>
                            <option value="midpoint-mandurah-dot">
                                Midpoint Mandurah Dot
                            </option>
                        </select>
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
                        <input
                            type="text"
                            id="zip_code"
                            name="zip_code"
                            value={bookingForm.zip_code}
                            onChange={handleChange}
                            required
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                errors.zip_code
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                            placeholder="6210"
                            maxLength="5"
                        />
                        {errors.zip_code ? (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.zip_code}
                            </p>
                        ) : (
                            // <p className="mt-1 text-sm text-gray-500">
                            //     Currently serving only areas with zip code 6210.
                            // </p>
                            <p className="mt-1 text-sm text-gray-500">
                                Currently serving only areas with zip code 6210.
                                {bookingForm.address !==
                                    "midpoint-mandurah-dot" && (
                                    <span className="block">
                                        If your address is not available, please
                                        select "Midpoint Mandurah Dot".
                                    </span>
                                )}
                            </p>
                        )}
                    </div>

                    {/* Test Location - Only shown for test packages */}
                    {isTestPackage && (
                        <div>
                            <label
                                htmlFor="test_location"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Test Location *
                            </label>
                            <input
                                type="text"
                                id="test_location"
                                name="test_location"
                                value={bookingForm.test_location}
                                onChange={handleChange}
                                required={isTestPackage}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                    errors.test_location
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                                placeholder="Enter test location (street address)"
                            />
                            {errors.test_location && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.test_location}
                                </p>
                            )}
                        </div>
                    )}

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
                        <input
                            type="text"
                            id="pickup_location"
                            name="pickup_location"
                            value={bookingForm.pickup_location}
                            onChange={handleChange}
                            required
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                errors.pickup_location
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                            placeholder="Enter pickup location (street address)"
                        />
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
                        <input
                            type="text"
                            id="dropoff_location"
                            name="dropoff_location"
                            value={bookingForm.dropoff_location}
                            onChange={handleChange}
                            required
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                errors.dropoff_location
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                            placeholder="Enter dropoff location (street address)"
                        />
                        {errors.dropoff_location && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.dropoff_location}
                            </p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
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
        </div>
    );
};

export default BookingForm;
