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
    // Initialize form with all required fields
    const [bookingForm, setBookingForm] = useState({
        user_name: "",
        email: "",
        phone: "",
        address: "",
        zip_code: "",
        test_location: "",
        test_type: "",
        license_number: "",
        pickup_location: "", 
        dropoff_location: "", 
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Initialize form data based on booking type
    useEffect(() => {
        // Always set pickup and dropoff locations from bookingDetails if available
        // For test packages, use test location if available
        if (bookingDetails) {
            setBookingForm((prev) => ({
                ...prev,
                pickup_location: bookingDetails.pickup_location || bookingDetails.test_location || "",
                dropoff_location: bookingDetails.dropoff_location || bookingDetails.test_location || "",
                test_location: bookingDetails.test_location || bookingDetails.pickup_location || "",
            }));
        }
    }, [bookingDetails]);

    // Parse duration to minutes
    const parseDuration = (durationString) => {
        if (!durationString) return 60;

        const cleanString = durationString.trim().toLowerCase();
        const hourMatch = cleanString.match(
            /(\d+(?:\.\d+)?)\s*(?:hrs|hr|hour|hours)/
        );
        const minuteMatch = cleanString.match(
            /(\d+)\s*(?:min|mins|minute|minutes)/
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

    // Extract package name from price description
    const extractPackageName = (description) => {
        if (!description) return "";
        
        // If description contains colon, extract the category/package name
        if (description.includes(":")) {
            // Remove "Test Package: " or similar prefixes
            // Takes the part after the colon and trims whitespace
            return description.split(":").pop().trim();
        }
        
        // If no colon, return the description as is
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

    // Validate zip code - only allow 6210
    const validateZipCode = (zip) => {
        // Remove any non-digit characters
        const cleanZip = zip.replace(/\D/g, '');
        return cleanZip === '6210';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        // Validate zip code
        if (!validateZipCode(bookingForm.zip_code)) {
            setErrors({
                zip_code: "Sorry, we currently only serve areas with zip code 6210. Please enter a valid zip code.",
            });
            setLoading(false);
            return;
        }

        try {
            const durationMinutes = parseDuration(price.duration);
            const routeName = isTestPackage
                ? "test-packages.store"
                : "ourreservations.store";

            // Combine address and zip code
            const fullAddress = `${bookingForm.address}, ${bookingForm.zip_code}`;

            // Extract package name from price description
            const packageName = extractPackageName(price.description);

            // Common data for both booking types
            const bookingData = {
                ...bookingForm,
                address: fullAddress,
                reservation_date: formatDateKey(selectedDate),
                price_id: priceId,
                duration_minutes: durationMinutes,
                // For test packages, use pickup_location for test_location as well
                test_location: bookingForm.pickup_location,
                // Remove zip_code from the final data as it's now part of address
            };

            // Add type-specific fields
            if (isTestPackage) {
                // For test packages, use the same structure as normal bookings
                Object.assign(bookingData, {
                    start_time: bookingDetails?.start_time || selectedTime,
                    end_time: bookingDetails?.end_time || calculateEndTime(selectedTime, price.duration),
                    test_time: testTime || selectedTime,
                    pickup_location: bookingForm.pickup_location,
                    dropoff_location: bookingForm.dropoff_location,
                    test_type: packageName, // Use extracted package name
                });
            } else {
                Object.assign(bookingData, {
                    start_time: selectedTime,
                    end_time: calculateEndTime(selectedTime, price.duration),
                    package_type: packageName, // Use extracted package name
                    package_price: price.price,
                    pickup_location: bookingForm.pickup_location,
                    dropoff_location: bookingForm.dropoff_location,
                });
            }

            // Remove zip_code from the final data
            delete bookingData.zip_code;

            console.log("Submitting booking data:", bookingData);

            const response = await axios.post(route(routeName), bookingData);

            if (response.data.success || response.data.message) {
                alert(
                    isTestPackage
                        ? "Test package booked successfully!"
                        : "Booking confirmed successfully!"
                );
                await onBookingSuccess();
                onClose();
            } else {
                alert("Error confirming booking: " + response.data.message);
            }
        } catch (error) {
            console.error("Booking error:", error);
            console.error("Error response:", error.response);

            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                alert("Please fix the errors in the form.");
            } else if (error.response?.data?.message) {
                alert("Booking error: " + error.response.data.message);
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
            endMinutes
        ).padStart(2, "0")}`;
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

    // Determine the time to display based on booking type
    const displayTime = isTestPackage ? testTime || selectedTime : selectedTime;
    const displayEndTime = calculateEndTime(displayTime, price.duration);
    
    // Extract display package name
    const displayPackageName = extractPackageName(price.description);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div
                    className={`p-6 rounded-t-lg ${
                        isTestPackage ? "bg-blue-600" : "bg-emerald-600"
                    } text-white`}
                >
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
                    {/* User Name */}
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

                    {/* Address */}
                    <div>
                        <label
                            htmlFor="address"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Address *
                        </label>
                        <textarea
                            id="address"
                            name="address"
                            value={bookingForm.address}
                            onChange={handleChange}
                            required
                            rows="3"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none ${
                                errors.address
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                            placeholder="123 Main Street, City, State"
                        />
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
                            <p className="mt-1 text-sm text-gray-500">
                                Currently serving only areas with zip code 6210
                            </p>
                        )}
                    </div>

                    {/* Pickup Location */}
                    <div>
                        <label
                            htmlFor="pickup_location"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            {isTestPackage ? "Test Location (Pickup)" : "Pickup Location"} *
                        </label>
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
                        <label
                            htmlFor="dropoff_location"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            {isTestPackage ? "Test Location (Dropoff)" : "Dropoff Location"} *
                        </label>
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

                    {/* Summary */}
                    {/* <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            Booking Summary
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-gray-600">Package:</div>
                            <div className="font-medium text-right">
                                {displayPackageName}
                            </div>

                            <div className="text-gray-600">Duration:</div>
                            <div className="font-medium text-right">
                                {formatDurationDisplay(price.duration)}
                            </div>

                            <div className="text-gray-600">Date:</div>
                            <div className="font-medium text-right">
                                {selectedDate.toLocaleDateString()}
                            </div>

                            <div className="text-gray-600">
                                Start Time:
                            </div>
                            <div className="font-medium text-right">
                                {displayTime}
                            </div>

                            <div className="text-gray-600">
                                End Time:
                            </div>
                            <div className="font-medium text-emerald-600 text-right">
                                {displayEndTime}
                            </div>

                            <div className="text-gray-600">
                                {isTestPackage ? "Test Location:" : "Pickup Location:"}
                            </div>
                            <div className="font-medium text-right">
                                {bookingForm.pickup_location || "Not specified"}
                            </div>

                            <div className="text-gray-600">
                                {isTestPackage ? "Test Location:" : "Dropoff Location:"}
                            </div>
                            <div className="font-medium text-right">
                                {bookingForm.dropoff_location || "Not specified"}
                            </div>

                            <div className="text-gray-600">Total Price:</div>
                            <div className="font-bold text-emerald-600 text-right">
                                ${price.price}
                            </div>
                        </div>
                    </div> */}

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
                            className={`flex-1 ${
                                isTestPackage
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-emerald-600 hover:bg-emerald-700"
                            } text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
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