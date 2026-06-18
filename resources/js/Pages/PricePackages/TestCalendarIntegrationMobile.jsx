import React, { useState, useEffect, useRef } from "react";
import {
    ChevronDown,
    MapPin,
    Calendar,
    Clock,
    CheckCircle,
    CalendarIcon,
    ChevronLeft,
    User,
    Mail,
    Phone,
    Home,
    MapPin as MapPinIcon,
} from "lucide-react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "@inertiajs/react";

// ─── Constants ───────────────────────────────────────────────────────────────

const MEETPOINT_AREA = "meetpoint-mandurah-dot";
const MEETPOINT_LOCATION = {
    label: "Ranceby Avenue, Mandurah, Western Australia 6210",
    name: "Mandurah",
    housenumber: null,
    postcode: "6210",
    city: "Mandurah",
    district: null,
    state: "Western Australia",
    source: "fixed",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const normaliseAddressText = (text = "") => {
    const ordinals = {
        "1st": "first",
        "2nd": "second",
        "3rd": "third",
        "4th": "fourth",
        "5th": "fifth",
        "6th": "sixth",
        "7th": "seventh",
        "8th": "eighth",
        "9th": "ninth",
        "10th": "tenth",
        "11th": "eleventh",
        "12th": "twelfth",
        "13th": "thirteenth",
        "14th": "fourteenth",
        "15th": "fifteenth",
        "16th": "sixteenth",
        "17th": "seventeenth",
        "18th": "eighteenth",
        "19th": "nineteenth",
        "20th": "twentieth",
    };

    return text
        .toLowerCase()
        .replace(
            /\b([0-9]{1,2}(?:st|nd|rd|th))\b/g,
            (match) => ordinals[match] || match,
        )
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
    const streetAnchor = normaliseAddressText(
        location.street || location.name || "",
    );
    const suburbAnchors = [location.city, location.district, location.postcode]
        .filter(Boolean)
        .map(normaliseAddressText);

    if (streetAnchor && typed.includes(streetAnchor)) return true;
    return suburbAnchors.some((anchor) => anchor && typed.includes(anchor));
};

// ─── LocationAutocomplete ────────────────────────────────────────────────────

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
    disabled = false,
}) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchError, setSearchError] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const blurTimeout = useRef(null);

    useEffect(() => {
        const query = value.trim();

        if (
            query.length < 3 ||
            locationMatchesTypedAddress(selectedLocation, query)
        ) {
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
            } catch (error) {
                if (error.code !== "ERR_CANCELED") {
                    setSuggestions([]);
                    setSearchError(
                        "Address search is unavailable. Please try again.",
                    );
                }
            } finally {
                setLoading(false);
            }
        }, 350);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [value, selectedLocation]);

    useEffect(() => {
        return () => {
            if (blurTimeout.current) clearTimeout(blurTimeout.current);
        };
    }, []);

    const handleBlur = () => {
        blurTimeout.current = setTimeout(() => setIsOpen(false), 150);
    };

    const shouldShowSuggestions =
        !disabled &&
        isOpen &&
        value.trim().length >= 3 &&
        !locationMatchesTypedAddress(selectedLocation, value);

    return (
        <div>
            <div className="flex justify-between items-center mb-2 gap-3">
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-gray-700"
                >
                    {label}
                </label>
                {!disabled && action}
            </div>
            <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    id={id}
                    name={name}
                    value={value}
                    onChange={(e) =>
                        !disabled && onInputChange(name, e.target.value)
                    }
                    onFocus={() => !disabled && setIsOpen(true)}
                    onBlur={handleBlur}
                    required
                    autoComplete="off"
                    readOnly={disabled}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                        error ? "border-red-500" : "border-gray-300"
                    } ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                    placeholder={placeholder}
                />

                {shouldShowSuggestions && (
                    <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                        {loading && (
                            <div className="px-4 py-3 text-sm text-gray-500">
                                Searching service area...
                            </div>
                        )}

                        {!loading &&
                            suggestions.map((suggestion) => (
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
                                    <span className="block font-medium">
                                        {suggestion.label}
                                    </span>
                                    {suggestion.postcode && (
                                        <span className="block text-xs text-gray-500">
                                            Postcode {suggestion.postcode}
                                        </span>
                                    )}
                                </button>
                            ))}

                        {!loading &&
                            suggestions.length === 0 &&
                            !searchError && (
                                <div className="px-4 py-3 text-sm text-gray-500">
                                    No service-area address found.
                                </div>
                            )}

                        {!loading && searchError && (
                            <div className="px-4 py-3 text-sm text-red-600">
                                {searchError}
                            </div>
                        )}
                    </div>
                )}
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            {!error && !disabled && (
                <p className="mt-1 text-xs text-gray-500">
                    Choose a service-area suggestion.
                </p>
            )}
            {!error && disabled && (
                <p className="mt-1 text-xs text-gray-500">
                    Auto-filled for Meetpoint Mandurah Dot.
                </p>
            )}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

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
    const [acceptTerms, setAcceptTerms] = useState(false);

    const [bookingForm, setBookingForm] = useState({
        user_name: "",
        email: "",
        phone: "",
        address: "",
        test_location: "Mandurah licensing center",
        pickup_location: "",
        dropoff_location: "",
        comment: "",
    });

    // Selected location objects for validation
    const [selectedLocations, setSelectedLocations] = useState({
        pickup_location: null,
        dropoff_location: null,
    });

    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // ── Derived: meetpoint lock ─────────────────────────────────────────────
    const isMeetpoint = bookingForm.address === MEETPOINT_AREA;

    // ── Location helpers ────────────────────────────────────────────────────

    const handleLocationInputChange = (name, value) => {
        setBookingForm((prev) => ({ ...prev, [name]: value }));
        setSelectedLocations((prev) => ({
            ...prev,
            [name]: locationMatchesTypedAddress(prev[name], value)
                ? prev[name]
                : null,
        }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleLocationSelect = (name, location) => {
        setBookingForm((prev) => ({ ...prev, [name]: location.label }));
        setSelectedLocations((prev) => ({ ...prev, [name]: location }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateSelectedLocations = () => {
        const locationErrors = {};
        [
            ["pickup_location", "pickup location"],
            ["dropoff_location", "dropoff location"],
        ].forEach(([field, label]) => {
            if (!bookingForm[field]?.trim()) {
                locationErrors[field] = `Please enter a ${label}.`;
                return;
            }
            if (
                !selectedLocations[field] ||
                !locationMatchesTypedAddress(
                    selectedLocations[field],
                    bookingForm[field],
                )
            ) {
                locationErrors[field] =
                    `Please choose a service-area suggestion for the ${label}.`;
            }
        });
        return locationErrors;
    };

    const setPickupSameAsAddress = () => {
        if (bookingForm.address) {
            setBookingForm((prev) => ({
                ...prev,
                pickup_location: prev.address,
            }));
            if (formErrors.pickup_location) {
                setFormErrors((prev) => ({ ...prev, pickup_location: "" }));
            }
            toast.success("Pickup location set to address");
        } else {
            toast.error("Please select an address first");
        }
    };

    const setDropoffSameAsPickup = () => {
        if (
            bookingForm.pickup_location &&
            locationMatchesTypedAddress(
                selectedLocations.pickup_location,
                bookingForm.pickup_location,
            )
        ) {
            setBookingForm((prev) => ({
                ...prev,
                dropoff_location: prev.pickup_location,
            }));
            setSelectedLocations((prev) => ({
                ...prev,
                dropoff_location: prev.pickup_location,
            }));
            if (formErrors.dropoff_location) {
                setFormErrors((prev) => ({
                    ...prev,
                    dropoff_location: "",
                }));
            }
            toast.success("Dropoff location set to pickup location");
        } else {
            toast.error(
                "Please select a pickup location from the suggestions first",
            );
        }
    };

    // ── Dates ───────────────────────────────────────────────────────────────

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
                date,
                monthYear,
            });
        }
        setAllDates(dates);
    }, []);

    const groupedDates = allDates.reduce((groups, date) => {
        const key = date.monthYear;
        if (!groups[key]) groups[key] = [];
        groups[key].push(date);
        return groups;
    }, {});

    const isPastDate = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const compareDate = new Date(dateString);
        compareDate.setHours(0, 0, 0, 0);
        return compareDate < today;
    };

    const formatDisplayDate = (dateString) => {
        if (!dateString) return "Select a date";
        return new Date(dateString).toLocaleDateString("en-AU", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // ── Duration / Time helpers ─────────────────────────────────────────────

    const parseDuration = (durationString) => {
        if (!durationString) return 60;
        const clean = durationString.trim().toLowerCase();
        const hourMatch = clean.match(
            /(\d+(?:\.\d+)?)\s*(?:hrs|hr|hour|hours)/,
        );
        const minuteMatch = clean.match(/(\d+)\s*(?:min|mins|minute|minutes)/);
        let total = 0;
        if (hourMatch) total += parseFloat(hourMatch[1]) * 60;
        if (minuteMatch) total += parseInt(minuteMatch[1]);
        if (total === 0) {
            const num = parseFloat(
                (clean.match(/(\d+(?:\.\d+)?)/) || [])[1] || 0,
            );
            total = num < 10 ? Math.round(num * 60) : Math.round(num);
        }
        return total || 60;
    };

    const formatTimeForDisplay = (time24) => {
        if (!time24) return "";
        const [hours, minutes] = time24.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        const h = hours % 12 || 12;
        return `${h}:${minutes.toString().padStart(2, "0")} ${period}`;
    };

    const validateTimeFormat = (time) => {
        if (!time) return false;
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
    };

    const formatTimeForApi = (time) => {
        if (!time) return "";
        const [h, m] = time.split(":").map(Number);
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    };

    // ── Fetch time slots ────────────────────────────────────────────────────

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
            setAvailableTimeSlots(
                response.data.success ? response.data.available_slots : [],
            );
        } catch (error) {
            console.error("Error fetching available slots:", error);
            setAvailableTimeSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    // ── Check availability ──────────────────────────────────────────────────

    const checkTestAvailability = async () => {
        if (!price) {
            toast.error("Price information not available");
            return;
        }
        if (!selectedDate || !selectedTime) {
            toast.error("Please select both date and time");
            return;
        }
        if (!validateTimeFormat(selectedTime)) {
            setTimeError("Please enter a valid time in HH:MM format");
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
                if (response.data.alternative_times?.length > 0) {
                    setAlternativeTimes(response.data.alternative_times);
                    toast.error(
                        "Selected time not available. Check suggested times below.",
                        { duration: 5000 },
                    );
                } else {
                    message +=
                        "\n\nNo alternative times available for this duration.";
                    toast.error(
                        "Time slot not available. Please contact us for assistance.",
                        { duration: 5000 },
                    );
                }
                message += "\n\nPlease contact us for assistance.";
                setAvailabilityMessage(message);
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            setIsAvailable(false);
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                const msg =
                    errors?.test_time?.[0] ||
                    errors?.price_id?.[0] ||
                    "Please check the time format (HH:MM) and try again.";
                if (errors?.test_time) setTimeError(errors.test_time[0]);
                setAvailabilityMessage(`Validation error: ${msg}`);
                toast.error(msg);
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

    const handleTimeChange = (e) => {
        setSelectedTime(e.target.value);
        setAvailabilityMessage("");
        setIsAvailable(false);
        setAlternativeTimes([]);
        setTimeError("");
    };

    // ── Form input ──────────────────────────────────────────────────────────

    const handleFormChange = (e) => {
        const { name, value } = e.target;

        if (name === "address") {
            if (value === MEETPOINT_AREA) {
                // Selecting Meetpoint: auto-fill pickup + dropoff with locked values
                setBookingForm((prev) => ({
                    ...prev,
                    address: value,
                    pickup_location: MEETPOINT_LOCATION.label,
                    dropoff_location: MEETPOINT_LOCATION.label,
                }));
                setSelectedLocations({
                    pickup_location: MEETPOINT_LOCATION,
                    dropoff_location: MEETPOINT_LOCATION,
                });
                setFormErrors((prev) => ({
                    ...prev,
                    address: "",
                    pickup_location: "",
                    dropoff_location: "",
                }));
            } else {
                // Switching away from Meetpoint (or any area change): clear pickup/dropoff
                setBookingForm((prev) => ({
                    ...prev,
                    address: value,
                    pickup_location: "",
                    dropoff_location: "",
                }));
                setSelectedLocations({
                    pickup_location: null,
                    dropoff_location: null,
                });
                setFormErrors((prev) => ({
                    ...prev,
                    address: "",
                    pickup_location: "",
                    dropoff_location: "",
                }));
            }
            return;
        }

        setBookingForm((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const extractPackageName = (description) => {
        if (!description) return "";
        return description.includes(":")
            ? description.split(":").pop().trim()
            : description.trim();
    };

    // ── Submit ──────────────────────────────────────────────────────────────

    const handleBookingSubmit = async (e) => {
        e.preventDefault();

        if (!isAvailable || !bookingDetails) {
            toast.error("Please check availability first");
            return;
        }
        if (!acceptTerms) {
            setFormErrors({
                terms: "Please accept the Terms & Conditions and Privacy Policy",
            });
            toast.error(
                "Please accept the Terms & Conditions and Privacy Policy",
            );
            return;
        }

        const requiredFields = [
            "user_name",
            "email",
            "phone",
            "address",
            "pickup_location",
            "dropoff_location",
        ];
        const newErrors = {};
        requiredFields.forEach((field) => {
            if (!bookingForm[field]?.trim()) {
                newErrors[field] = `${field.replace("_", " ")} is required`;
            }
        });
        if (bookingForm.email && !/\S+@\S+\.\S+/.test(bookingForm.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Validate location suggestions
        const locationErrors = validateSelectedLocations();
        Object.assign(newErrors, locationErrors);

        if (Object.keys(newErrors).length > 0) {
            setFormErrors(newErrors);
            toast.error("Please fill in all required fields correctly");
            return;
        }

        setSubmitting(true);
        setFormErrors({});
        const submittingToast = toast.loading("Processing your booking...");

        try {
            const bookingData = {
                user_name: bookingForm.user_name,
                email: bookingForm.email,
                phone: bookingForm.phone,
                address: bookingForm.address,
                reservation_date: selectedDate,
                price_id: price.id,
                duration_minutes: parseDuration(price.duration),
                start_time: bookingDetails.start_time,
                end_time: bookingDetails.end_time,
                test_time: selectedTime,
                test_location: bookingForm.test_location,
                pickup_location: bookingForm.pickup_location,
                dropoff_location: bookingForm.dropoff_location,
                test_type: extractPackageName(price.description),
                accepted_terms: acceptTerms,
                comment: bookingForm.comment,
            };

            const response = await axios.post(
                route("test-packages.store"),
                bookingData,
            );
            toast.dismiss(submittingToast);

            if (response.data.success || response.data.message) {
                toast.success(
                    "Test package booked successfully! Please check your Spam email for booking details.",
                    { duration: 5000 },
                );

                setSelectedDate("");
                setSelectedTime("");
                setAvailabilityMessage("");
                setIsAvailable(false);
                setAlternativeTimes([]);
                setBookingDetails(null);
                setTimeError("");
                setAcceptTerms(false);
                setSelectedLocations({
                    pickup_location: null,
                    dropoff_location: null,
                });
                setBookingForm({
                    user_name: "",
                    email: "",
                    phone: "",
                    address: "",
                    test_location: "Mandurah licensing center",
                    pickup_location: "",
                    dropoff_location: "",
                    comment: "",
                });

                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
                if (price) fetchAvailableTimeSlots();
            } else {
                toast.error(
                    "Error confirming booking: " + response.data.message,
                );
            }
        } catch (error) {
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

    const getMinTime = () => "07:00";
    const getMaxTime = () => {
        if (!price) return "17:00";
        const durationMinutes = parseDuration(price.duration);
        const maxStart = new Date();
        maxStart.setHours(18, 0 - durationMinutes, 0, 0);
        if (maxStart.getHours() < 7) return "07:00";
        return `${maxStart.getHours().toString().padStart(2, "0")}:${maxStart.getMinutes().toString().padStart(2, "0")}`;
    };

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
                    style: { background: "#363636", color: "#fff" },
                    success: {
                        duration: 3000,
                        style: { background: "#10b981", color: "#fff" },
                        iconTheme: { primary: "#fff", secondary: "#10b981" },
                    },
                    error: {
                        duration: 4000,
                        style: { background: "#ef4444", color: "#fff" },
                        iconTheme: { primary: "#fff", secondary: "#ef4444" },
                    },
                    loading: {
                        duration: 5000,
                        style: { background: "#3b82f6", color: "#fff" },
                    },
                }}
            />

            <div className="max-w-screen-lg mx-auto px-4 py-6">
                <Link
                    href={"/"}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ChevronLeft size={20} />
                    <span className="font-medium">Back</span>
                </Link>

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

                <div className="flex flex-col gap-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    {/* ── Date Selection ─────────────────────────────────── */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Select Test Date
                        </h2>
                        <p className="text-xs text-gray-500 mb-4">
                            Time zone: Australian Western Standard Time (GMT+8)
                        </p>
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

                    {/* ── Time Selection ─────────────────────────────────── */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Select Test Time
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                            {selectedDate
                                ? formatDisplayDate(selectedDate)
                                : "Please select a date first"}
                        </p>

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

                        {availabilityMessage && (
                            <div
                                className={`mt-6 p-4 rounded-xl ${isAvailable ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
                            >
                                <div className="flex items-start">
                                    <div
                                        className={`flex-shrink-0 ${isAvailable ? "text-green-600" : "text-red-600"}`}
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
                                        className={`ml-3 text-sm ${isAvailable ? "text-green-800" : "text-red-800"} whitespace-pre-line`}
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

                    {/* ── Booking Form ───────────────────────────────────── */}
                    {isAvailable && bookingDetails && (
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                Complete Your Booking
                            </h2>

                            <form
                                onSubmit={handleBookingSubmit}
                                className="space-y-6"
                            >
                                {/* Full Name */}
                                <div>
                                    <label
                                        htmlFor="user_name"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Full Name <span className="text-red-500">*</span>
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
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${formErrors.user_name ? "border-red-500" : "border-gray-300"}`}
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
                                        Email Address <span className="text-red-500">*</span>
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
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${formErrors.email ? "border-red-500" : "border-gray-300"}`}
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
                                        Phone Number <span className="text-red-500">*</span>
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
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${formErrors.phone ? "border-red-500" : "border-gray-300"}`}
                                            placeholder="+61 4XX XXX XXX"
                                        />
                                    </div>
                                    {formErrors.phone && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {formErrors.phone}
                                        </p>
                                    )}
                                </div>

                                {/* Area */}
                                <div>
                                    <label
                                        htmlFor="address"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Area <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                        <select
                                            id="address"
                                            name="address"
                                            value={bookingForm.address}
                                            onChange={handleFormChange}
                                            required
                                            className={`w-full appearance-none pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white ${formErrors.address ? "border-red-500" : "border-gray-300"}`}
                                        >
                                            <option value="">
                                                Select your Area
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
                                            <option value="meetpoint-mandurah-dot">
                                                Meetpoint Mandurah Dot
                                            </option>
                                            <option value="singleton">
                                                Singleton
                                            </option>
                                            <option value="parklands">
                                                Parklands
                                            </option>
                                            <option value="stake-hill">
                                                Stake Hill
                                            </option>
                                            <option value="san-remo">
                                                San Remo
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

                                {/* Test Location */}
                                <div>
                                    <label
                                        htmlFor="test_location"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Test Location <span className="text-red-500">*</span>
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
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${formErrors.test_location ? "border-red-500" : "border-gray-300"}`}
                                            placeholder="Enter test location"
                                        />
                                    </div>
                                    {formErrors.test_location && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {formErrors.test_location}
                                        </p>
                                    )}
                                </div>

                                <p className="mt-1 text-sm text-gray-500">
                                    Currently serving only these areas with
                                    postcode 6210, 6180, or 6175.
                                    <span className="block">
                                        If your address is not available, please
                                        select "Meetpoint Mandurah Dot" where
                                        you will be meeting instructor.
                                    </span>
                                </p>

                                {/* ── Pickup Location ──────── */}
                                <LocationAutocomplete
                                    id="pickup_location"
                                    name="pickup_location"
                                    label={
                                        <>
                                            Pickup Location <span className="text-red-500">*</span>
                                        </>
                                    }
                                    value={bookingForm.pickup_location}
                                    selectedLocation={
                                        selectedLocations.pickup_location
                                    }
                                    error={formErrors.pickup_location}
                                    placeholder="Start typing pickup address"
                                    onInputChange={
                                        isMeetpoint
                                            ? () => {}
                                            : handleLocationInputChange
                                    }
                                    onLocationSelect={
                                        isMeetpoint
                                            ? () => {}
                                            : handleLocationSelect
                                    }
                                    disabled={isMeetpoint}
                                />

                                {/* ── Dropoff Location ─────── */}
                                <LocationAutocomplete
                                    id="dropoff_location"
                                    name="dropoff_location"
                                    label={
                                        <>
                                            Dropoff Location <span className="text-red-500">*</span>
                                        </>
                                    }
                                    value={bookingForm.dropoff_location}
                                    selectedLocation={
                                        selectedLocations.dropoff_location
                                    }
                                    error={formErrors.dropoff_location}
                                    placeholder="Start typing dropoff address"
                                    onInputChange={
                                        isMeetpoint
                                            ? () => {}
                                            : handleLocationInputChange
                                    }
                                    onLocationSelect={
                                        isMeetpoint
                                            ? () => {}
                                            : handleLocationSelect
                                    }
                                    disabled={isMeetpoint}
                                    action={
                                        <button
                                            type="button"
                                            onClick={setDropoffSameAsPickup}
                                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                                        >
                                            Same as Pickup Location
                                        </button>
                                    }
                                />

                                {/* Comment */}
                                <div>
                                    <label
                                        htmlFor="comment"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Comment
                                    </label>
                                    <textarea
                                        id="comment"
                                        name="comment"
                                        value={bookingForm.comment}
                                        onChange={handleFormChange}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                                        placeholder="Any special requests, notes for your instructor, etc."
                                    />
                                </div>

                                {/* Terms */}
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="acceptTerms"
                                            checked={acceptTerms}
                                            onChange={(e) => {
                                                setAcceptTerms(
                                                    e.target.checked,
                                                );
                                                if (formErrors.terms)
                                                    setFormErrors((prev) => ({
                                                        ...prev,
                                                        terms: "",
                                                    }));
                                            }}
                                            className="mt-1 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            required
                                        />
                                        <label
                                            htmlFor="acceptTerms"
                                            className="text-sm text-gray-700"
                                        >
                                            I agree to the{" "}
                                            <a
                                                href="https://wheelmasterdriving.com.au/terms"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 hover:text-indigo-800 underline font-medium"
                                            >
                                                Terms & Conditions
                                            </a>{" "}
                                            and{" "}
                                            <a
                                                href="https://wheelmasterdriving.com.au/policy"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 hover:text-indigo-800 underline font-medium"
                                            >
                                                Privacy Policy
                                            </a>{" "}
                                            <span className="text-red-500">*</span>
                                        </label>
                                    </div>
                                    {formErrors.terms && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {formErrors.terms}
                                        </p>
                                    )}
                                </div>

                                {/* Submit */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={submitting || !acceptTerms}
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

                    {/* ── Order Summary ──────────────────────────────────── */}
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
                                        className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${showOrderSummary ? "rotate-180" : ""}`}
                                    />
                                </div>
                            </div>

                            {showOrderSummary && (
                                <div className="mt-5 pt-5 border-t border-gray-200 space-y-3">
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
                                                    <div className="mt-4 pt-4 border-t">
                                                        <div className="flex justify-between text-sm mb-2">
                                                            <span className="text-gray-600">
                                                                Total Booking
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
                                                                {price.duration}
                                                                )
                                                            </span>
                                                        </div>
                                                    </div>
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



// import React, { useState, useEffect, useRef } from "react";
// import {
//     ChevronDown,
//     MapPin,
//     Calendar,
//     Clock,
//     CheckCircle,
//     CalendarIcon,
//     ChevronLeft,
//     User,
//     Mail,
//     Phone,
//     Home,
//     MapPin as MapPinIcon,
// } from "lucide-react";
// import axios from "axios";
// import toast, { Toaster } from "react-hot-toast";
// import { Link } from "@inertiajs/react";

// // ─── Constants ───────────────────────────────────────────────────────────────

// const MEETPOINT_AREA = "meetpoint-mandurah-dot";
// const MEETPOINT_HOME_ADDRESS = "Ranceby Avenue";
// const MEETPOINT_LOCATION = {
//     label: "Mandurah, Western Australia 6210",
//     name: "Mandurah",
//     street: "Mandurah",
//     housenumber: null,
//     postcode: "6210",
//     city: "Mandurah",
//     district: null,
//     state: "Western Australia",
//     source: "fixed",
// };

// // ─── Helpers ─────────────────────────────────────────────────────────────────

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
//         .replace(
//             /\b([0-9]{1,2}(?:st|nd|rd|th))\b/g,
//             (match) => ordinals[match] || match,
//         )
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

//     if (streetAnchor && typed.includes(streetAnchor)) return true;
//     return suburbAnchors.some((anchor) => anchor && typed.includes(anchor));
// };

// // ─── LocationAutocomplete ────────────────────────────────────────────────────

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
//     disabled = false,
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
//             if (blurTimeout.current) clearTimeout(blurTimeout.current);
//         };
//     }, []);

//     const handleBlur = () => {
//         blurTimeout.current = setTimeout(() => setIsOpen(false), 150);
//     };

//     const shouldShowSuggestions =
//         !disabled &&
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
//                 {!disabled && action}
//             </div>
//             <div className="relative">
//                 <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                     type="text"
//                     id={id}
//                     name={name}
//                     value={value}
//                     onChange={(e) =>
//                         !disabled && onInputChange(name, e.target.value)
//                     }
//                     onFocus={() => !disabled && setIsOpen(true)}
//                     onBlur={handleBlur}
//                     required
//                     autoComplete="off"
//                     readOnly={disabled}
//                     className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
//                         error ? "border-red-500" : "border-gray-300"
//                     } ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
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
//                                     onMouseDown={(e) => {
//                                         e.preventDefault();
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
//             {!error && !disabled && (
//                 <p className="mt-1 text-xs text-gray-500">
//                     Choose a service-area suggestion, then add house number,
//                     unit.
//                 </p>
//             )}
//             {!error && disabled && (
//                 <p className="mt-1 text-xs text-gray-500">
//                     Auto-filled for Meetpoint Mandurah Dot.
//                 </p>
//             )}
//         </div>
//     );
// };

// // ─── Main Component ───────────────────────────────────────────────────────────

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
//     const [acceptTerms, setAcceptTerms] = useState(false);

//     const [bookingForm, setBookingForm] = useState({
//         user_name: "",
//         email: "",
//         phone: "",
//         address: "",
//         test_location: "Mandurah licensing center",
//         pickup_location: "",
//         pickup_home_address: "",
//         dropoff_location: "",
//         dropoff_home_address: "",
//         comment: "",
//     });

//     // Selected location objects for validation
//     const [selectedLocations, setSelectedLocations] = useState({
//         pickup_location: null,
//         dropoff_location: null,
//     });

//     const [formErrors, setFormErrors] = useState({});
//     const [submitting, setSubmitting] = useState(false);

//     // ── Derived: meetpoint lock ─────────────────────────────────────────────
//     const isMeetpoint = bookingForm.address === MEETPOINT_AREA;

//     // ── Location helpers ────────────────────────────────────────────────────

//     const handleLocationInputChange = (name, value) => {
//         setBookingForm((prev) => ({ ...prev, [name]: value }));
//         setSelectedLocations((prev) => ({
//             ...prev,
//             [name]: locationMatchesTypedAddress(prev[name], value)
//                 ? prev[name]
//                 : null,
//         }));
//         if (formErrors[name]) {
//             setFormErrors((prev) => ({ ...prev, [name]: "" }));
//         }
//     };

//     const handleLocationSelect = (name, location) => {
//         setBookingForm((prev) => ({ ...prev, [name]: location.label }));
//         setSelectedLocations((prev) => ({ ...prev, [name]: location }));
//         if (formErrors[name]) {
//             setFormErrors((prev) => ({ ...prev, [name]: "" }));
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

//         // Validate home address fields
//         if (
//             bookingForm.pickup_location?.trim() &&
//             selectedLocations.pickup_location
//         ) {
//             if (!bookingForm.pickup_home_address?.trim()) {
//                 locationErrors.pickup_home_address =
//                     "Please enter your home address for pickup.";
//             }
//         }
//         if (
//             bookingForm.dropoff_location?.trim() &&
//             selectedLocations.dropoff_location
//         ) {
//             if (!bookingForm.dropoff_home_address?.trim()) {
//                 locationErrors.dropoff_home_address =
//                     "Please enter your home address for dropoff.";
//             }
//         }

//         return locationErrors;
//     };

//     // Build the full combined address string
//     const buildFullAddress = (homeAddress, locationLabel) => {
//         if (!homeAddress?.trim()) return locationLabel || "";
//         if (!locationLabel?.trim()) return homeAddress.trim();
//         return `${homeAddress.trim()}, ${locationLabel.trim()}`;
//     };

//     const setPickupSameAsAddress = () => {
//         if (bookingForm.address) {
//             setBookingForm((prev) => ({
//                 ...prev,
//                 pickup_location: prev.address,
//             }));
//             if (formErrors.pickup_location) {
//                 setFormErrors((prev) => ({ ...prev, pickup_location: "" }));
//             }
//             toast.success("Pickup location set to address");
//         } else {
//             toast.error("Please select an address first");
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
//                 dropoff_home_address: prev.pickup_home_address,
//             }));
//             setSelectedLocations((prev) => ({
//                 ...prev,
//                 dropoff_location: prev.pickup_location,
//             }));
//             if (formErrors.dropoff_location) {
//                 setFormErrors((prev) => ({
//                     ...prev,
//                     dropoff_location: "",
//                     dropoff_home_address: "",
//                 }));
//             }
//             toast.success("Dropoff location set to pickup location");
//         } else {
//             toast.error(
//                 "Please select a pickup location from the suggestions first",
//             );
//         }
//     };

//     // ── Dates ───────────────────────────────────────────────────────────────

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
//                 date,
//                 monthYear,
//             });
//         }
//         setAllDates(dates);
//     }, []);

//     const groupedDates = allDates.reduce((groups, date) => {
//         const key = date.monthYear;
//         if (!groups[key]) groups[key] = [];
//         groups[key].push(date);
//         return groups;
//     }, {});

//     const isPastDate = (dateString) => {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         const compareDate = new Date(dateString);
//         compareDate.setHours(0, 0, 0, 0);
//         return compareDate < today;
//     };

//     const formatDisplayDate = (dateString) => {
//         if (!dateString) return "Select a date";
//         return new Date(dateString).toLocaleDateString("en-AU", {
//             weekday: "short",
//             day: "2-digit",
//             month: "short",
//             year: "numeric",
//         });
//     };

//     // ── Duration / Time helpers ─────────────────────────────────────────────

//     const parseDuration = (durationString) => {
//         if (!durationString) return 60;
//         const clean = durationString.trim().toLowerCase();
//         const hourMatch = clean.match(
//             /(\d+(?:\.\d+)?)\s*(?:hrs|hr|hour|hours)/,
//         );
//         const minuteMatch = clean.match(/(\d+)\s*(?:min|mins|minute|minutes)/);
//         let total = 0;
//         if (hourMatch) total += parseFloat(hourMatch[1]) * 60;
//         if (minuteMatch) total += parseInt(minuteMatch[1]);
//         if (total === 0) {
//             const num = parseFloat(
//                 (clean.match(/(\d+(?:\.\d+)?)/) || [])[1] || 0,
//             );
//             total = num < 10 ? Math.round(num * 60) : Math.round(num);
//         }
//         return total || 60;
//     };

//     const formatTimeForDisplay = (time24) => {
//         if (!time24) return "";
//         const [hours, minutes] = time24.split(":").map(Number);
//         const period = hours >= 12 ? "PM" : "AM";
//         const h = hours % 12 || 12;
//         return `${h}:${minutes.toString().padStart(2, "0")} ${period}`;
//     };

//     const validateTimeFormat = (time) => {
//         if (!time) return false;
//         return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
//     };

//     const formatTimeForApi = (time) => {
//         if (!time) return "";
//         const [h, m] = time.split(":").map(Number);
//         return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
//     };

//     // ── Fetch time slots ────────────────────────────────────────────────────

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
//             setAvailableTimeSlots(
//                 response.data.success ? response.data.available_slots : [],
//             );
//         } catch (error) {
//             console.error("Error fetching available slots:", error);
//             setAvailableTimeSlots([]);
//         } finally {
//             setLoadingSlots(false);
//         }
//     };

//     // ── Check availability ──────────────────────────────────────────────────

//     const checkTestAvailability = async () => {
//         if (!price) {
//             toast.error("Price information not available");
//             return;
//         }
//         if (!selectedDate || !selectedTime) {
//             toast.error("Please select both date and time");
//             return;
//         }
//         if (!validateTimeFormat(selectedTime)) {
//             setTimeError("Please enter a valid time in HH:MM format");
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
//                 });
//                 setAvailabilityMessage(
//                     "✓ This time slot is available! You can proceed to book.",
//                 );
//                 toast.success(
//                     "Time slot is available! You can proceed to book.",
//                 );
//             } else {
//                 setIsAvailable(false);
//                 let message =
//                     response.data.message || "Time slot not available";
//                 if (response.data.alternative_times?.length > 0) {
//                     setAlternativeTimes(response.data.alternative_times);
//                     toast.error(
//                         "Selected time not available. Check suggested times below.",
//                         { duration: 5000 },
//                     );
//                 } else {
//                     message +=
//                         "\n\nNo alternative times available for this duration.";
//                     toast.error(
//                         "Time slot not available. Please contact us for assistance.",
//                         { duration: 5000 },
//                     );
//                 }
//                 message += "\n\nPlease contact us for assistance.";
//                 setAvailabilityMessage(message);
//             }
//         } catch (error) {
//             toast.dismiss(loadingToast);
//             setIsAvailable(false);
//             if (error.response?.status === 422) {
//                 const errors = error.response.data.errors;
//                 const msg =
//                     errors?.test_time?.[0] ||
//                     errors?.price_id?.[0] ||
//                     "Please check the time format (HH:MM) and try again.";
//                 if (errors?.test_time) setTimeError(errors.test_time[0]);
//                 setAvailabilityMessage(`Validation error: ${msg}`);
//                 toast.error(msg);
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

//     const handleTimeChange = (e) => {
//         setSelectedTime(e.target.value);
//         setAvailabilityMessage("");
//         setIsAvailable(false);
//         setAlternativeTimes([]);
//         setTimeError("");
//     };

//     // ── Form input ──────────────────────────────────────────────────────────

//     const handleFormChange = (e) => {
//         const { name, value } = e.target;

//         if (name === "address") {
//             if (value === MEETPOINT_AREA) {
//                 // Selecting Meetpoint: auto-fill pickup + dropoff with locked values
//                 setBookingForm((prev) => ({
//                     ...prev,
//                     address: value,
//                     pickup_location: MEETPOINT_LOCATION.label,
//                     pickup_home_address: MEETPOINT_HOME_ADDRESS,
//                     dropoff_location: MEETPOINT_LOCATION.label,
//                     dropoff_home_address: MEETPOINT_HOME_ADDRESS,
//                 }));
//                 setSelectedLocations({
//                     pickup_location: MEETPOINT_LOCATION,
//                     dropoff_location: MEETPOINT_LOCATION,
//                 });
//                 setFormErrors((prev) => ({
//                     ...prev,
//                     address: "",
//                     pickup_location: "",
//                     pickup_home_address: "",
//                     dropoff_location: "",
//                     dropoff_home_address: "",
//                 }));
//             } else {
//                 // Switching away from Meetpoint (or any area change): clear pickup/dropoff
//                 setBookingForm((prev) => ({
//                     ...prev,
//                     address: value,
//                     pickup_location: "",
//                     pickup_home_address: "",
//                     dropoff_location: "",
//                     dropoff_home_address: "",
//                 }));
//                 setSelectedLocations({
//                     pickup_location: null,
//                     dropoff_location: null,
//                 });
//                 setFormErrors((prev) => ({
//                     ...prev,
//                     address: "",
//                     pickup_location: "",
//                     pickup_home_address: "",
//                     dropoff_location: "",
//                     dropoff_home_address: "",
//                 }));
//             }
//             return;
//         }

//         // Block edits to home address fields when Meetpoint is active
//         if (
//             isMeetpoint &&
//             (name === "pickup_home_address" || name === "dropoff_home_address")
//         ) {
//             return;
//         }

//         setBookingForm((prev) => ({ ...prev, [name]: value }));
//         if (formErrors[name]) {
//             setFormErrors((prev) => ({ ...prev, [name]: "" }));
//         }
//     };

//     const extractPackageName = (description) => {
//         if (!description) return "";
//         return description.includes(":")
//             ? description.split(":").pop().trim()
//             : description.trim();
//     };

//     // ── Derived: show home address fields ──────────────────────────────────
//     // Show pickup home address input once a valid pickup location is selected
//     const showPickupHomeAddress =
//         !!bookingForm.pickup_location?.trim() &&
//         !!selectedLocations.pickup_location &&
//         locationMatchesTypedAddress(
//             selectedLocations.pickup_location,
//             bookingForm.pickup_location,
//         );

//     // Show dropoff home address input once a valid dropoff location is selected
//     const showDropoffHomeAddress =
//         !!bookingForm.dropoff_location?.trim() &&
//         !!selectedLocations.dropoff_location &&
//         locationMatchesTypedAddress(
//             selectedLocations.dropoff_location,
//             bookingForm.dropoff_location,
//         );

//     // ── Submit ──────────────────────────────────────────────────────────────

//     const handleBookingSubmit = async (e) => {
//         e.preventDefault();

//         if (!isAvailable || !bookingDetails) {
//             toast.error("Please check availability first");
//             return;
//         }
//         if (!acceptTerms) {
//             setFormErrors({
//                 terms: "Please accept the Terms & Conditions and Privacy Policy",
//             });
//             toast.error(
//                 "Please accept the Terms & Conditions and Privacy Policy",
//             );
//             return;
//         }

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
//             if (!bookingForm[field]?.trim()) {
//                 newErrors[field] = `${field.replace("_", " ")} is required`;
//             }
//         });
//         if (bookingForm.email && !/\S+@\S+\.\S+/.test(bookingForm.email)) {
//             newErrors.email = "Please enter a valid email address";
//         }

//         // Validate location suggestions + home address fields
//         const locationErrors = validateSelectedLocations();
//         Object.assign(newErrors, locationErrors);

//         if (Object.keys(newErrors).length > 0) {
//             setFormErrors(newErrors);
//             toast.error("Please fill in all required fields correctly");
//             return;
//         }

//         setSubmitting(true);
//         setFormErrors({});
//         const submittingToast = toast.loading("Processing your booking...");

//         try {
//             // Build full combined address strings
//             const fullPickupAddress = buildFullAddress(
//                 bookingForm.pickup_home_address,
//                 bookingForm.pickup_location,
//             );
//             const fullDropoffAddress = buildFullAddress(
//                 bookingForm.dropoff_home_address,
//                 bookingForm.dropoff_location,
//             );

//             const bookingData = {
//                 user_name: bookingForm.user_name,
//                 email: bookingForm.email,
//                 phone: bookingForm.phone,
//                 address: bookingForm.address,
//                 reservation_date: selectedDate,
//                 price_id: price.id,
//                 duration_minutes: parseDuration(price.duration),
//                 start_time: bookingDetails.start_time,
//                 end_time: bookingDetails.end_time,
//                 test_time: selectedTime,
//                 test_location: bookingForm.test_location,
//                 pickup_location: fullPickupAddress,
//                 dropoff_location: fullDropoffAddress,
//                 test_type: extractPackageName(price.description),
//                 accepted_terms: acceptTerms,
//                 comment: bookingForm.comment,
//             };

//             const response = await axios.post(
//                 route("test-packages.store"),
//                 bookingData,
//             );
//             toast.dismiss(submittingToast);

//             if (response.data.success || response.data.message) {
//                 toast.success(
//                     "Test package booked successfully! Please check your Spam email for booking details.",
//                     { duration: 5000 },
//                 );

//                 setSelectedDate("");
//                 setSelectedTime("");
//                 setAvailabilityMessage("");
//                 setIsAvailable(false);
//                 setAlternativeTimes([]);
//                 setBookingDetails(null);
//                 setTimeError("");
//                 setAcceptTerms(false);
//                 setSelectedLocations({
//                     pickup_location: null,
//                     dropoff_location: null,
//                 });
//                 setBookingForm({
//                     user_name: "",
//                     email: "",
//                     phone: "",
//                     address: "",
//                     test_location: "Mandurah licensing center",
//                     pickup_location: "",
//                     pickup_home_address: "",
//                     dropoff_location: "",
//                     dropoff_home_address: "",
//                     comment: "",
//                 });

//                 setSaved(true);
//                 setTimeout(() => setSaved(false), 2500);
//                 if (price) fetchAvailableTimeSlots();
//             } else {
//                 toast.error(
//                     "Error confirming booking: " + response.data.message,
//                 );
//             }
//         } catch (error) {
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

//     const getMinTime = () => "07:00";
//     const getMaxTime = () => {
//         if (!price) return "17:00";
//         const durationMinutes = parseDuration(price.duration);
//         const maxStart = new Date();
//         maxStart.setHours(18, 0 - durationMinutes, 0, 0);
//         if (maxStart.getHours() < 7) return "07:00";
//         return `${maxStart.getHours().toString().padStart(2, "0")}:${maxStart.getMinutes().toString().padStart(2, "0")}`;
//     };

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
//                     style: { background: "#363636", color: "#fff" },
//                     success: {
//                         duration: 3000,
//                         style: { background: "#10b981", color: "#fff" },
//                         iconTheme: { primary: "#fff", secondary: "#10b981" },
//                     },
//                     error: {
//                         duration: 4000,
//                         style: { background: "#ef4444", color: "#fff" },
//                         iconTheme: { primary: "#fff", secondary: "#ef4444" },
//                     },
//                     loading: {
//                         duration: 5000,
//                         style: { background: "#3b82f6", color: "#fff" },
//                     },
//                 }}
//             />

//             <div className="max-w-screen-lg mx-auto px-4 py-6">
//                 <Link
//                     href={"/"}
//                     className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
//                 >
//                     <ChevronLeft size={20} />
//                     <span className="font-medium">Back</span>
//                 </Link>

//                 <div className="mb-6">
//                     <div className="flex items-center gap-3 mb-1">
//                         <h1 className="text-2xl font-bold text-gray-900 ml-6">
//                             Schedule Your Test Package
//                         </h1>
//                     </div>
//                     <p className="text-gray-500 text-sm ml-6">
//                         Choose your date and time. Operating hours: 7:00 AM -
//                         6:00 PM
//                     </p>
//                 </div>

//                 <div className="flex flex-col gap-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//                     {/* ── Date Selection ─────────────────────────────────── */}
//                     <div>
//                         <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                             Select Test Date
//                         </h2>
//                         <p className="text-xs text-gray-500 mb-4">
//                             Time zone: Australian Western Standard Time (GMT+8)
//                         </p>
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
//                                 {Object.entries(groupedDates).map(
//                                     ([monthYear, dates]) => (
//                                         <optgroup
//                                             key={monthYear}
//                                             label={`── ${monthYear} ──`}
//                                             className="font-semibold text-gray-700"
//                                         >
//                                             {dates.map((date, i) => (
//                                                 <option
//                                                     key={i}
//                                                     value={date.value}
//                                                     disabled={isPastDate(
//                                                         date.value,
//                                                     )}
//                                                     className="py-1"
//                                                 >
//                                                     {date.display}{" "}
//                                                     {isPastDate(date.value)
//                                                         ? "(Past)"
//                                                         : ""}
//                                                 </option>
//                                             ))}
//                                         </optgroup>
//                                     ),
//                                 )}
//                             </select>
//                             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                         </div>
//                         {selectedDate && (
//                             <p className="text-sm text-gray-600 mt-3">
//                                 Selected: {formatDisplayDate(selectedDate)}
//                             </p>
//                         )}
//                     </div>

//                     {/* ── Time Selection ─────────────────────────────────── */}
//                     <div>
//                         <h2 className="text-lg font-semibold text-gray-900 mb-2">
//                             Select Test Time
//                         </h2>
//                         <p className="text-sm text-gray-500 mb-4">
//                             {selectedDate
//                                 ? formatDisplayDate(selectedDate)
//                                 : "Please select a date first"}
//                         </p>

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

//                         {availabilityMessage && (
//                             <div
//                                 className={`mt-6 p-4 rounded-xl ${isAvailable ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
//                             >
//                                 <div className="flex items-start">
//                                     <div
//                                         className={`flex-shrink-0 ${isAvailable ? "text-green-600" : "text-red-600"}`}
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
//                                         className={`ml-3 text-sm ${isAvailable ? "text-green-800" : "text-red-800"} whitespace-pre-line`}
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

//                     {/* ── Booking Form ───────────────────────────────────── */}
//                     {isAvailable && bookingDetails && (
//                         <div className="mt-6">
//                             <h2 className="text-lg font-semibold text-gray-900 mb-6">
//                                 Complete Your Booking
//                             </h2>

//                             <form
//                                 onSubmit={handleBookingSubmit}
//                                 className="space-y-6"
//                             >
//                                 {/* Full Name */}
//                                 <div>
//                                     <label
//                                         htmlFor="user_name"
//                                         className="block text-sm font-medium text-gray-700 mb-2"
//                                     >
//                                         Full Name <span className="text-red-500">*</span>
//                                     </label>
//                                     <div className="relative">
//                                         <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                                         <input
//                                             type="text"
//                                             id="user_name"
//                                             name="user_name"
//                                             value={bookingForm.user_name}
//                                             onChange={handleFormChange}
//                                             required
//                                             className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${formErrors.user_name ? "border-red-500" : "border-gray-300"}`}
//                                             placeholder="John Doe"
//                                         />
//                                     </div>
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
//                                         Email Address <span className="text-red-500">*</span>
//                                     </label>
//                                     <div className="relative">
//                                         <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                                         <input
//                                             type="email"
//                                             id="email"
//                                             name="email"
//                                             value={bookingForm.email}
//                                             onChange={handleFormChange}
//                                             required
//                                             className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${formErrors.email ? "border-red-500" : "border-gray-300"}`}
//                                             placeholder="john@example.com"
//                                         />
//                                     </div>
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
//                                         Phone Number <span className="text-red-500">*</span>
//                                     </label>
//                                     <div className="relative">
//                                         <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                                         <input
//                                             type="tel"
//                                             id="phone"
//                                             name="phone"
//                                             value={bookingForm.phone}
//                                             onChange={handleFormChange}
//                                             required
//                                             className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${formErrors.phone ? "border-red-500" : "border-gray-300"}`}
//                                             placeholder="+61 4XX XXX XXX"
//                                         />
//                                     </div>
//                                     {formErrors.phone && (
//                                         <p className="mt-1 text-sm text-red-600">
//                                             {formErrors.phone}
//                                         </p>
//                                     )}
//                                 </div>

//                                 {/* Area */}
//                                 <div>
//                                     <label
//                                         htmlFor="address"
//                                         className="block text-sm font-medium text-gray-700 mb-2"
//                                     >
//                                         Area <span className="text-red-500">*</span>
//                                     </label>
//                                     <div className="relative">
//                                         <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                                         <select
//                                             id="address"
//                                             name="address"
//                                             value={bookingForm.address}
//                                             onChange={handleFormChange}
//                                             required
//                                             className={`w-full appearance-none pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white ${formErrors.address ? "border-red-500" : "border-gray-300"}`}
//                                         >
//                                             <option value="">
//                                                 Select your Area
//                                             </option>
//                                             <option value="mandurah">
//                                                 Mandurah
//                                             </option>
//                                             <option value="meadow-springs">
//                                                 Meadow Springs
//                                             </option>
//                                             <option value="silver-sands">
//                                                 Silver Sands
//                                             </option>
//                                             <option value="lakelands">
//                                                 Lakelands
//                                             </option>
//                                             <option value="dudley-park">
//                                                 Dudley Park
//                                             </option>
//                                             <option value="halls-head">
//                                                 Halls Head
//                                             </option>
//                                             <option value="madora-bay">
//                                                 Madora Bay
//                                             </option>
//                                             <option value="greenfields">
//                                                 Greenfields
//                                             </option>
//                                             <option value="erskine">
//                                                 Erskine
//                                             </option>
//                                             <option value="meetpoint-mandurah-dot">
//                                                 Meetpoint Mandurah Dot
//                                             </option>
//                                             <option value="singleton">
//                                                 Singleton
//                                             </option>
//                                             <option value="parklands">
//                                                 Parklands
//                                             </option>
//                                             <option value="stake-hill">
//                                                 Stake Hill
//                                             </option>
//                                             <option value="san-remo">
//                                                 San Remo
//                                             </option>
//                                         </select>
//                                         <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                                     </div>
//                                     {formErrors.address && (
//                                         <p className="mt-1 text-sm text-red-600">
//                                             {formErrors.address}
//                                         </p>
//                                     )}
//                                 </div>

//                                 {/* Test Location */}
//                                 <div>
//                                     <label
//                                         htmlFor="test_location"
//                                         className="block text-sm font-medium text-gray-700 mb-2"
//                                     >
//                                         Test Location <span className="text-red-500">*</span>
//                                     </label>
//                                     <div className="relative">
//                                         <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                                         <input
//                                             type="text"
//                                             id="test_location"
//                                             name="test_location"
//                                             value={bookingForm.test_location}
//                                             onChange={handleFormChange}
//                                             required
//                                             className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${formErrors.test_location ? "border-red-500" : "border-gray-300"}`}
//                                             placeholder="Enter test location"
//                                         />
//                                     </div>
//                                     {formErrors.test_location && (
//                                         <p className="mt-1 text-sm text-red-600">
//                                             {formErrors.test_location}
//                                         </p>
//                                     )}
//                                 </div>

//                                 <p className="mt-1 text-sm text-gray-500">
//                                     Currently serving only these areas with
//                                     postcode 6210, 6180, or 6175.
//                                     <span className="block">
//                                         If your address is not available, please
//                                         select "Meetpoint Mandurah Dot" where
//                                         you will be meeting instructor.
//                                     </span>
//                                 </p>

//                                 {/* Pickup Home Address — shown inline once pickup is selected */}
//                                 {showPickupHomeAddress && (
//                                     <div className="flex gap-3 items-start">
//                                         <div className="flex-1">
//                                             <label
//                                                 htmlFor="pickup_home_address"
//                                                 className="block text-sm font-medium text-gray-700 mb-2"
//                                             >
//                                                 Home Address <span className="text-red-500">*</span>
//                                             </label>
//                                             <div className="relative">
//                                                 <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                                                 <input
//                                                     type="text"
//                                                     id="pickup_home_address"
//                                                     name="pickup_home_address"
//                                                     value={
//                                                         bookingForm.pickup_home_address
//                                                     }
//                                                     onChange={handleFormChange}
//                                                     required
//                                                     readOnly={isMeetpoint}
//                                                     className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${formErrors.pickup_home_address ? "border-red-500" : "border-gray-300"} ${isMeetpoint ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
//                                                     placeholder="e.g. 12 Oak Street, Unit 4"
//                                                 />
//                                             </div>
//                                             {formErrors.pickup_home_address && (
//                                                 <p className="mt-1 text-sm text-red-600">
//                                                     {
//                                                         formErrors.pickup_home_address
//                                                     }
//                                                 </p>
//                                             )}
//                                             <p className="mt-1 text-xs text-gray-500">
//                                                 {isMeetpoint
//                                                     ? "Auto-filled for Meetpoint Mandurah Dot."
//                                                     : <>
//                                                         Enter your house/unit number and
//                                                         street. It will be saved as:{" "}
//                                                         <span className="font-medium text-gray-700">
//                                                             {bookingForm.pickup_home_address
//                                                                 ? buildFullAddress(
//                                                                       bookingForm.pickup_home_address,
//                                                                       bookingForm.pickup_location,
//                                                                   )
//                                                                 : "your address, " +
//                                                                   bookingForm.pickup_location}
//                                                         </span>
//                                                     </>
//                                                 }
//                                             </p>
//                                         </div>
//                                     </div>
//                                 )}

//                                 {/* ── Pickup Location ──────── */}
//                                 <LocationAutocomplete
//                                     id="pickup_location"
//                                     name="pickup_location"
//                                     label={
//   <>
//     Pickup Location <span className="text-red-500">*</span>
//   </>
// }
//                                     value={bookingForm.pickup_location}
//                                     selectedLocation={
//                                         selectedLocations.pickup_location
//                                     }
//                                     error={formErrors.pickup_location}
//                                     placeholder="Start typing pickup address"
//                                     onInputChange={
//                                         isMeetpoint
//                                             ? () => {}
//                                             : handleLocationInputChange
//                                     }
//                                     onLocationSelect={
//                                         isMeetpoint
//                                             ? () => {}
//                                             : handleLocationSelect
//                                     }
//                                     disabled={isMeetpoint}
//                                 />

//                                 {/* Dropoff Home Address — shown inline once dropoff is selected */}
//                                 {showDropoffHomeAddress && (
//                                     <div className="flex gap-3 items-start">
//                                         <div className="flex-1">
//                                             <label
//                                                 htmlFor="dropoff_home_address"
//                                                 className="block text-sm font-medium text-gray-700 mb-2"
//                                             >
//                                                 Home Address  <span className="text-red-500">*</span>
//                                             </label>
//                                             <div className="relative">
//                                                 <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                                                 <input
//                                                     type="text"
//                                                     id="dropoff_home_address"
//                                                     name="dropoff_home_address"
//                                                     value={
//                                                         bookingForm.dropoff_home_address
//                                                     }
//                                                     onChange={handleFormChange}
//                                                     required
//                                                     readOnly={isMeetpoint}
//                                                     className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${formErrors.dropoff_home_address ? "border-red-500" : "border-gray-300"} ${isMeetpoint ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
//                                                     placeholder="e.g. 12 Ocean Drive, Mandurah"
//                                                 />
//                                             </div>
//                                             {formErrors.dropoff_home_address && (
//                                                 <p className="mt-1 text-sm text-red-600">
//                                                     {
//                                                         formErrors.dropoff_home_address
//                                                     }
//                                                 </p>
//                                             )}
//                                             <p className="mt-1 text-xs text-gray-500">
//                                                 {isMeetpoint
//                                                     ? "Auto-filled for Meetpoint Mandurah Dot."
//                                                     : <>
//                                                         Enter your house/unit number and
//                                                         street. It will be saved as:{" "}
//                                                         <span className="font-medium text-gray-700">
//                                                             {bookingForm.dropoff_home_address
//                                                                 ? buildFullAddress(
//                                                                       bookingForm.dropoff_home_address,
//                                                                       bookingForm.dropoff_location,
//                                                                   )
//                                                                 : "your address, " +
//                                                                   bookingForm.dropoff_location}
//                                                         </span>
//                                                     </>
//                                                 }
//                                             </p>
//                                         </div>
//                                     </div>
//                                 )}

//                                 {/* ── Dropoff Location ─────── */}
//                                 <LocationAutocomplete
//                                     id="dropoff_location"
//                                     name="dropoff_location"
//                                     label={
//     <>

//         Dropoff Location <span className="text-red-500">*</span>
//     </>
// }
//                                     value={bookingForm.dropoff_location}
//                                     selectedLocation={
//                                         selectedLocations.dropoff_location
//                                     }
//                                     error={formErrors.dropoff_location}
//                                     placeholder="Start typing dropoff address"
//                                     onInputChange={
//                                         isMeetpoint
//                                             ? () => {}
//                                             : handleLocationInputChange
//                                     }
//                                     onLocationSelect={
//                                         isMeetpoint
//                                             ? () => {}
//                                             : handleLocationSelect
//                                     }
//                                     disabled={isMeetpoint}
//                                     action={
//                                         <button
//                                             type="button"
//                                             onClick={setDropoffSameAsPickup}
//                                             className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
//                                         >
//                                             Same as Pickup Location
//                                         </button>
//                                     }
//                                 />

//                                 {/* Comment */}
//                                 <div>
//                                     <label
//                                         htmlFor="comment"
//                                         className="block text-sm font-medium text-gray-700 mb-2"
//                                     >
//                                         Comment
//                                     </label>
//                                     <textarea
//                                         id="comment"
//                                         name="comment"
//                                         value={bookingForm.comment}
//                                         onChange={handleFormChange}
//                                         rows={3}
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
//                                         placeholder="Any special requests, notes for your instructor, etc."
//                                     />
//                                 </div>

//                                 {/* Terms */}
//                                 <div className="border-t border-gray-200 pt-4">
//                                     <div className="flex items-start gap-3">
//                                         <input
//                                             type="checkbox"
//                                             id="acceptTerms"
//                                             checked={acceptTerms}
//                                             onChange={(e) => {
//                                                 setAcceptTerms(
//                                                     e.target.checked,
//                                                 );
//                                                 if (formErrors.terms)
//                                                     setFormErrors((prev) => ({
//                                                         ...prev,
//                                                         terms: "",
//                                                     }));
//                                             }}
//                                             className="mt-1 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//                                             required
//                                         />
//                                         <label
//                                             htmlFor="acceptTerms"
//                                             className="text-sm text-gray-700"
//                                         >
//                                             I agree to the{" "}
//                                             <a
//                                                 href="https://wheelmasterdriving.com.au/terms"
//                                                 target="_blank"
//                                                 rel="noopener noreferrer"
//                                                 className="text-indigo-600 hover:text-indigo-800 underline font-medium"
//                                             >
//                                                 Terms & Conditions
//                                             </a>{" "}
//                                             and{" "}
//                                             <a
//                                                 href="https://wheelmasterdriving.com.au/policy"
//                                                 target="_blank"
//                                                 rel="noopener noreferrer"
//                                                 className="text-indigo-600 hover:text-indigo-800 underline font-medium"
//                                             >
//                                                 Privacy Policy
//                                             </a>{" "}
//                                             <span className="text-red-500">*</span>
//                                         </label>
//                                     </div>
//                                     {formErrors.terms && (
//                                         <p className="mt-1 text-sm text-red-600">
//                                             {formErrors.terms}
//                                         </p>
//                                     )}
//                                 </div>

//                                 {/* Submit */}
//                                 <div className="pt-4">
//                                     <button
//                                         type="submit"
//                                         disabled={submitting || !acceptTerms}
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

//                     {/* ── Order Summary ──────────────────────────────────── */}
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
//                                         className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${showOrderSummary ? "rotate-180" : ""}`}
//                                     />
//                                 </div>
//                             </div>

//                             {showOrderSummary && (
//                                 <div className="mt-5 pt-5 border-t border-gray-200 space-y-3">
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
//                                                     <div className="mt-4 pt-4 border-t">
//                                                         <div className="flex justify-between text-sm mb-2">
//                                                             <span className="text-gray-600">
//                                                                 Total Booking
//                                                                 Duration:
//                                                             </span>
//                                                             <span className="font-medium text-gray-900 text-right">
//                                                                 {formatTimeForDisplay(
//                                                                     bookingDetails.start_time,
//                                                                 )}{" "}
//                                                                 to{" "}
//                                                                 {formatTimeForDisplay(
//                                                                     bookingDetails.end_time,
//                                                                 )}
//                                                             </span>
//                                                         </div>
//                                                         <div className="flex justify-between text-sm">
//                                                             <span className="text-gray-600">
//                                                                 Actual Test
//                                                                 Time:
//                                                             </span>
//                                                             <span className="font-medium text-blue-600 text-right">
//                                                                 {formatTimeForDisplay(
//                                                                     selectedTime,
//                                                                 )}{" "}
//                                                                 (
//                                                                 {price.duration}
//                                                                 )
//                                                             </span>
//                                                         </div>
//                                                     </div>
//                                                 )}
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default TestCalendarIntegrationMobile;

