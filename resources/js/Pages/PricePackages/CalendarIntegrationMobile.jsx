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
import PackageSelector from "./PackageSelector";

const MEETPOINT_AREA = "meetpoint-mandurah-dot";
const MEETPOINT_LOCATION = {
    label: "Mandurah, Western Australia 6210",
    name: "Mandurah",
    street: "Mandurah",
    housenumber: null,
    postcode: "6210",
    city: "Mandurah",
    district: null,
    state: "Western Australia",
    source: "fixed",
};
const MEETPOINT_HOME_ADDRESS = "Ranceby Avenue";

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
    disabled,
}) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchError, setSearchError] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const blurTimeout = useRef(null);

    useEffect(() => {
        if (disabled) {
            setSuggestions([]);
            setIsOpen(false);
            return undefined;
        }
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
    }, [value, selectedLocation, disabled]);

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
                {action}
            </div>
            <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    id={id}
                    name={name}
                    value={value}
                    onChange={(event) =>
                        !disabled && onInputChange(name, event.target.value)
                    }
                    onFocus={() => !disabled && setIsOpen(true)}
                    onBlur={handleBlur}
                    required
                    autoComplete="off"
                    readOnly={disabled}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
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
                                    onMouseDown={(event) => {
                                        event.preventDefault();
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
                    Choose a service-area suggestion, then add house number,
                    unit, or pickup notes if needed.
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

// ─── HomeAddressField ────────────────────────────────────────────────────────
const HomeAddressField = ({ value, onChange, error, id, label, disabled }) => (
    <div className="flex-1 min-w-0">
        <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-2"
        >
            {label} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
            <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
                type="text"
                id={id}
                value={value}
                onChange={(e) => !disabled && onChange(e.target.value)}
                required={!disabled}
                readOnly={disabled}
                autoComplete={disabled ? "off" : "street-address"}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                    error ? "border-red-500" : "border-gray-300"
                } ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                placeholder="e.g. 12 Ocean Drive, Mandurah"
            />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {!error && !disabled && (
            <p className="mt-1 text-xs text-gray-500">
                Enter the full street address including house/unit number.
            </p>
        )}
        {!error && disabled && (
            <p className="mt-1 text-xs text-gray-500">
                Auto-filled for Meetpoint Mandurah Dot.
            </p>
        )}
    </div>
);

const CalendarIntegrationMobile = ({ price, packageOptions = [] }) => {
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");

    const [formData, setFormData] = useState({
        user_name: "",
        email: "",
        phone: "",
        address: "",
        pickup_location: "",
        dropoff_location: "",
        pickup_home_address: "",
        dropoff_home_address: "",
        comment: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedLocations, setSelectedLocations] = useState({
        pickup_location: null,
        dropoff_location: null,
    });
    const [acceptTerms, setAcceptTerms] = useState(false);

    const [timeSlots, setTimeSlots] = useState({});
    const [scheduleEnds, setScheduleEnds] = useState({});
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [showNextAvailability, setShowNextAvailability] = useState(false);
    const [nextAvailableDates, setNextAvailableDates] = useState([]);
    const [allDates, setAllDates] = useState([]);
    const timeSlotsRef = useRef({});
    const loadingDateKeyRef = useRef("");
    const availabilityLoadingRef = useRef(false);

    useEffect(() => {
        timeSlotsRef.current = timeSlots;
    }, [timeSlots]);

    // ── derived: is meetpoint selected ──────────────────────────────────────
    const isMeetpoint = formData.address === MEETPOINT_AREA;

    // ── helpers ──────────────────────────────────────────────────────────────

    const formatDateKey = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

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

    const calculateEndTime = (startTime, durationString) => {
        const durationMinutes = parseDuration(durationString);
        let cleanStartTime = startTime;
        if (
            typeof cleanStartTime === "string" &&
            cleanStartTime.includes(":")
        ) {
            const parts = cleanStartTime.split(":");
            if (parts.length >= 2) cleanStartTime = `${parts[0]}:${parts[1]}`;
        }
        const [hours, minutes] = cleanStartTime.split(":").map(Number);
        const totalMinutes = hours * 60 + minutes + durationMinutes;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
    };

    const formatDurationDisplay = (durationString) => {
        const minutes = parseDuration(durationString);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0 && mins > 0)
            return `${hours} ${hours === 1 ? "hour" : "hours"} ${mins} minutes`;
        if (hours > 0) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
        return `${mins} minutes`;
    };

    // ── "same as pickup" ─────────────────────────────────────────────────────

    const setDropoffSameAsPickup = () => {
        if (
            formData.pickup_location &&
            locationMatchesTypedAddress(
                selectedLocations.pickup_location,
                formData.pickup_location,
            )
        ) {
            setFormData((prev) => ({
                ...prev,
                dropoff_location: prev.pickup_location,
                dropoff_home_address: prev.pickup_home_address,
            }));
            setSelectedLocations((prev) => ({
                ...prev,
                dropoff_location: prev.pickup_location,
            }));
            setErrors((prev) => ({
                ...prev,
                dropoff_location: "",
                dropoff_home_address: "",
            }));
            toast.success("Dropoff location set to pickup location");
        } else {
            toast.error(
                "Please select a pickup location from the suggestions first",
            );
        }
    };

    // ── slot helpers ─────────────────────────────────────────────────────────

    const getNonOverlappingSlots = (slots, dateKey) => {
        if (!slots || slots.length === 0) return [];
        const durationMinutes = parseDuration(price?.duration);
        const bookingStepMinutes = durationMinutes + 20;
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
            .filter(Number.isFinite)
            .sort((a, b) => a - b);
        if (sortedSlotMinutes.length === 0) return [];
        const scheduleEndMinutes = scheduleEnds[dateKey]
            ? timeToMinutes(scheduleEnds[dateKey])
            : sortedSlotMinutes[sortedSlotMinutes.length - 1] +
              bookingStepMinutes;
        const latestStartMinutes = scheduleEndMinutes - bookingStepMinutes;
        const displaySlots = [];
        let candidateMinutes = sortedSlotMinutes[0];
        while (candidateMinutes <= latestStartMinutes) {
            displaySlots.push(minutesToTime(candidateMinutes));
            candidateMinutes += bookingStepMinutes;
            const hasNearbyAvailableSlot = sortedSlotMinutes.some(
                (slotMinutes) =>
                    slotMinutes >= candidateMinutes &&
                    slotMinutes < candidateMinutes + 20,
            );
            if (!hasNearbyAvailableSlot) {
                const nextAvailableSlot = sortedSlotMinutes.find(
                    (slotMinutes) => slotMinutes >= candidateMinutes,
                );
                if (nextAvailableSlot === undefined) break;
                candidateMinutes = nextAvailableSlot;
            }
        }
        return displaySlots;
    };

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

    const isPastDate = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const compareDate = new Date(dateString);
        compareDate.setHours(0, 0, 0, 0);
        return compareDate < today;
    };

    // ── generate 365 days ────────────────────────────────────────────────────

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

    const mapAvailableSlots = useCallback(
        (slots = []) =>
            slots
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
                }),
        [],
    );

    const fetchDropdownAvailability = useCallback(async () => {
        if (
            !price?.id ||
            allDates.length === 0 ||
            availabilityLoadingRef.current
        )
            return;
        const datesToFetch = allDates
            .slice(0, 60)
            .filter(
                (date) =>
                    !isPastDate(date.value) &&
                    timeSlotsRef.current[date.value] === undefined,
            );
        if (datesToFetch.length === 0) return;
        availabilityLoadingRef.current = true;
        setAvailabilityLoading(true);
        try {
            const batchSize = 7;
            for (let i = 0; i < datesToFetch.length; i += batchSize) {
                const batch = datesToFetch.slice(i, i + batchSize);
                const results = await Promise.all(
                    batch.map(async (date) => {
                        try {
                            const response = await axios.get(
                                route("ourtimeslots.get"),
                                {
                                    params: {
                                        date: date.value,
                                        price_id: price.id,
                                    },
                                },
                            );
                            return [
                                date.value,
                                response.data.success
                                    ? mapAvailableSlots(
                                          response.data.slots || [],
                                      )
                                    : [],
                                response.data.success
                                    ? response.data.current_end
                                    : null,
                            ];
                        } catch (err) {
                            console.error(
                                `Error fetching slots for ${date.value}:`,
                                err,
                            );
                            return [date.value, [], null];
                        }
                    }),
                );
                const nextSlots = Object.fromEntries(
                    results.map(([dateKey, slots]) => [dateKey, slots]),
                );
                const nextEnds = Object.fromEntries(
                    results
                        .filter(([, , endTime]) => endTime)
                        .map(([dateKey, , endTime]) => [dateKey, endTime]),
                );
                timeSlotsRef.current = {
                    ...timeSlotsRef.current,
                    ...nextSlots,
                };
                setTimeSlots((prev) => ({ ...prev, ...nextSlots }));
                setScheduleEnds((prev) => ({ ...prev, ...nextEnds }));
            }
        } finally {
            availabilityLoadingRef.current = false;
            setAvailabilityLoading(false);
        }
    }, [allDates, mapAvailableSlots, price?.id]);

    useEffect(() => {
        fetchDropdownAvailability();
    }, [fetchDropdownAvailability]);

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
                    params: { date: dateKey, price_id: price.id },
                });
                const availableSlots = response.data.success
                    ? mapAvailableSlots(response.data.slots || [])
                    : [];
                timeSlotsRef.current = {
                    ...timeSlotsRef.current,
                    [dateKey]: availableSlots,
                };
                setTimeSlots((prev) => ({
                    ...prev,
                    [dateKey]: availableSlots,
                }));
                if (response.data.success) {
                    setScheduleEnds((prev) => ({
                        ...prev,
                        [dateKey]: response.data.current_end,
                    }));
                }
            } catch (err) {
                console.error(`Error fetching slots for ${dateKey}:`, err);
                timeSlotsRef.current = {
                    ...timeSlotsRef.current,
                    [dateKey]: [],
                };
                setTimeSlots((prev) => ({ ...prev, [dateKey]: [] }));
            } finally {
                if (loadingDateKeyRef.current === dateKey) {
                    loadingDateKeyRef.current = "";
                    setLoading(false);
                }
            }
        },
        [mapAvailableSlots, price?.id],
    );

    useEffect(() => {
        const fetchTimeSlotsForSelected = async () => {
            if (!selectedDate || !price?.id) return;
            await fetchSlotsForDate(selectedDate, true);
            setSelectedTime("");
        };
        fetchTimeSlotsForSelected();
    }, [selectedDate, price?.id, fetchSlotsForDate]);

    const getTimeSlotsForDate = (date) => {
        if (!date) return [];
        return timeSlots[date] || [];
    };

    const getDateAvailabilityStatus = (dateValue) => {
        if (!dateValue) return null;
        if (isPastDate(dateValue))
            return {
                label: "Past date",
                className: "border-gray-200 bg-gray-50 text-gray-500",
            };
        if (loading && selectedDate === dateValue)
            return {
                label: "Checking availability...",
                className: "border-amber-200 bg-amber-50 text-amber-700",
            };
        if (timeSlots[dateValue] === undefined)
            return {
                label: availabilityLoading
                    ? "Checking availability..."
                    : "Choose a time after selecting a date",
                className: availabilityLoading
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-gray-200 bg-gray-50 text-gray-600",
            };
        if (timeSlots[dateValue].length > 0)
            return {
                label: "Available",
                className: "border-emerald-200 bg-emerald-50 text-emerald-700",
            };
        return {
            label: "Fully booked",
            className: "border-red-200 bg-red-50 text-red-700",
        };
    };

    const getDateOptionLabel = (date) => {
        if (isPastDate(date.value)) return `${date.display} (Past date)`;
        const slots = timeSlots[date.value];
        if (slots === undefined)
            return availabilityLoading
                ? `${date.display} (Checking...)`
                : date.display;
        return slots.length > 0
            ? `${date.display} \u2713 Available`
            : `${date.display} \u2715 Fully booked`;
    };

    const getDateOptionClassName = (dateValue) => {
        if (isPastDate(dateValue)) return "py-1 text-gray-400";
        if (timeSlots[dateValue] === undefined) return "py-1 text-gray-900";
        return timeSlots[dateValue].length > 0
            ? "py-1 text-emerald-700"
            : "py-1 text-red-600";
    };

    const findNextAvailableDates = async () => {
        try {
            const availableDates = [];
            const today = new Date();
            for (let i = 1; i <= 30; i++) {
                const nextDate = new Date(today);
                nextDate.setDate(today.getDate() + i);
                const dateKey = formatDateKey(nextDate);
                let availableSlots = timeSlots[dateKey];
                if (!availableSlots) {
                    try {
                        const response = await axios.get(
                            route("ourtimeslots.get"),
                            {
                                params: { date: dateKey, price_id: price.id },
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
                            setTimeSlots((prev) => ({
                                ...prev,
                                [dateKey]: availableSlots,
                            }));
                            setScheduleEnds((prev) => ({
                                ...prev,
                                [dateKey]: response.data.current_end,
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
                if (availableSlots && availableSlots.length > 0)
                    availableDates.push(nextDate);
                if (availableDates.length >= 3) break;
            }
            return availableDates;
        } catch (error) {
            console.error("Error finding next available dates:", error);
            return [];
        }
    };

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

    // ── form change handlers ─────────────────────────────────────────────────

    const handleChange = (e) => {
        const { name, value } = e.target;

        const isSelectingMeetpoint =
            name === "address" && value === MEETPOINT_AREA;
        const isLeavingMeetpoint =
            name === "address" &&
            value !== MEETPOINT_AREA &&
            formData.address === MEETPOINT_AREA;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(isSelectingMeetpoint
                ? {
                      pickup_location: MEETPOINT_LOCATION.label,
                      dropoff_location: MEETPOINT_LOCATION.label,
                      pickup_home_address: MEETPOINT_HOME_ADDRESS,
                      dropoff_home_address: MEETPOINT_HOME_ADDRESS,
                  }
                : {}),
            ...(isLeavingMeetpoint
                ? {
                      pickup_location: "",
                      dropoff_location: "",
                      pickup_home_address: "",
                      dropoff_home_address: "",
                  }
                : {}),
        }));

        if (isSelectingMeetpoint) {
            setSelectedLocations({
                pickup_location: MEETPOINT_LOCATION,
                dropoff_location: MEETPOINT_LOCATION,
            });
        }
        if (isLeavingMeetpoint) {
            setSelectedLocations({
                pickup_location: null,
                dropoff_location: null,
            });
        }

        if (
            errors[name] ||
            ((isSelectingMeetpoint || isLeavingMeetpoint) &&
                (errors.pickup_location || errors.dropoff_location))
        ) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
                ...(isSelectingMeetpoint || isLeavingMeetpoint
                    ? {
                          pickup_location: "",
                          dropoff_location: "",
                          pickup_home_address: "",
                          dropoff_home_address: "",
                      }
                    : {}),
            }));
        }
    };

    const handleLocationInputChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setSelectedLocations((prev) => ({
            ...prev,
            [name]: locationMatchesTypedAddress(prev[name], value)
                ? prev[name]
                : null,
        }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleLocationSelect = (name, location) => {
        setFormData((prev) => ({ ...prev, [name]: location.label }));
        setSelectedLocations((prev) => ({ ...prev, [name]: location }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    // ── validation ───────────────────────────────────────────────────────────

    const validateSelectedLocations = () => {
        const locationErrors = {};
        [
            ["pickup_location", "pickup location"],
            ["dropoff_location", "dropoff location"],
        ].forEach(([field, label]) => {
            if (!formData[field]?.trim()) {
                locationErrors[field] = `Please enter a ${label}.`;
                return;
            }
            if (
                !selectedLocations[field] ||
                !locationMatchesTypedAddress(
                    selectedLocations[field],
                    formData[field],
                )
            ) {
                locationErrors[field] =
                    `Please choose a service-area suggestion for the ${label}, then add house/unit details if needed.`;
            }
        });
        return locationErrors;
    };

    // ── submission ───────────────────────────────────────────────────────────

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        [
            "user_name",
            "email",
            "phone",
            "address",
            "pickup_location",
            "dropoff_location",
        ].forEach((field) => {
            if (!formData[field]?.trim())
                newErrors[field] = `${field.replace("_", " ")} is required`;
        });

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Home address validation – skip when meetpoint (auto-filled)
        if (
            !isMeetpoint &&
            selectedLocations.pickup_location &&
            locationMatchesTypedAddress(
                selectedLocations.pickup_location,
                formData.pickup_location,
            ) &&
            !formData.pickup_home_address?.trim()
        ) {
            newErrors.pickup_home_address =
                "Please enter your home address for the pickup location.";
        }

        if (
            !isMeetpoint &&
            selectedLocations.dropoff_location &&
            locationMatchesTypedAddress(
                selectedLocations.dropoff_location,
                formData.dropoff_location,
            ) &&
            !formData.dropoff_home_address?.trim()
        ) {
            newErrors.dropoff_home_address =
                "Please enter your home address for the dropoff location.";
        }

        if (!selectedDate) {
            toast.error("Please select a date");
            return;
        }
        if (!selectedTime) {
            toast.error("Please select a time slot");
            return;
        }

        if (!acceptTerms) {
            setErrors((prev) => ({
                ...prev,
                terms: "Please accept the Terms & Conditions and Privacy Policy",
            }));
            toast.error(
                "Please accept the Terms & Conditions and Privacy Policy",
            );
            return;
        }

        const locationErrors = validateSelectedLocations();
        Object.assign(newErrors, locationErrors);

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill in all required fields correctly");
            return;
        }

        setSubmitting(true);

        try {
            const durationMinutes = parseDuration(price.duration);

            const extractPackageName = (description) => {
                if (!description) return "";
                if (description.includes(":"))
                    return description.split(":").pop().trim();
                return description.trim();
            };

            const buildLocationWithHome = (location, homeAddress) =>
                homeAddress?.trim()
                    ? `${homeAddress.trim()}, ${location}`
                    : location;

            const bookingData = {
                user_name: formData.user_name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                reservation_date: selectedDate,
                price_id: price.id,
                duration_minutes: durationMinutes,
                start_time: selectedTime,
                end_time: calculateEndTime(selectedTime, price.duration),
                package_type: extractPackageName(price.description),
                package_price: price.price,
                pickup_location: buildLocationWithHome(
                    formData.pickup_location,
                    formData.pickup_home_address,
                ),
                dropoff_location: buildLocationWithHome(
                    formData.dropoff_location,
                    formData.dropoff_home_address,
                ),
                accepted_terms: acceptTerms,
                comment: formData.comment,
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
                    pickup_location: "",
                    dropoff_location: "",
                    pickup_home_address: "",
                    dropoff_home_address: "",
                    comment: "",
                });
                setSelectedLocations({
                    pickup_location: null,
                    dropoff_location: null,
                });
                setSelectedDate("");
                setSelectedTime("");
                setAcceptTerms(false);

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

    // ── derived state ────────────────────────────────────────────────────────

    const currentTimeSlots = getTimeSlotsForDate(selectedDate);
    const nonOverlappingSlots = getNonOverlappingSlots(
        currentTimeSlots,
        selectedDate,
    );

    const pickupConfirmed =
        !!formData.pickup_location &&
        locationMatchesTypedAddress(
            selectedLocations.pickup_location,
            formData.pickup_location,
        );

    const dropoffConfirmed =
        !!formData.dropoff_location &&
        locationMatchesTypedAddress(
            selectedLocations.dropoff_location,
            formData.dropoff_location,
        );

    // ── render ───────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 lg:py-12">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: { background: "#363636", color: "#fff" },
                    success: {
                        duration: 3000,
                        style: { background: "#10b981", color: "#fff" },
                    },
                    error: {
                        duration: 4000,
                        style: { background: "#ef4444", color: "#fff" },
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
                            <PackageSelector
                                price={price}
                                packageOptions={packageOptions}
                                className="mb-4"
                            />
                            <h3 className="font-semibold text-gray-900 mb-2 capitalize">
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
                        {/* ── Date Selection ───────────────────────────────── */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Available Date *
                            </label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                <select
                                    value={selectedDate}
                                    onFocus={fetchDropdownAvailability}
                                    onMouseDown={fetchDropdownAvailability}
                                    onTouchStart={fetchDropdownAvailability}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value);
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
                                                {dates.map((date, i) => (
                                                    <option
                                                        key={i}
                                                        value={date.value}
                                                        disabled={isPastDate(
                                                            date.value,
                                                        )}
                                                        className={getDateOptionClassName(
                                                            date.value,
                                                        )}
                                                    >
                                                        {getDateOptionLabel(
                                                            date,
                                                        )}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ),
                                    )}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            </div>
                            {selectedDate && (
                                <p
                                    className={`mt-2 rounded-lg border px-3 py-2 text-xs font-semibold ${getDateAvailabilityStatus(selectedDate).className}`}
                                >
                                    {
                                        getDateAvailabilityStatus(selectedDate)
                                            .label
                                    }
                                </p>
                            )}
                        </div>

                        {/* Legend */}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                            <div className="flex items-center gap-1">
                                <span className="text-green-500 text-sm"> ✓</span>
                                <span className="text-gray-600">
                                    Has available slots
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-red-500 text-sm"> ✗</span>
                                <span className="text-gray-600">
                                    No available slots
                                </span>
                            </div>
                        </div>

                        {/* ── Time Selection ───────────────────────────────── */}
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

                        {/* Next Availability */}
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
                                                                weekday: "short",
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

                        {/* ── Personal Details ─────────────────────────────── */}
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
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${errors.user_name ? "border-red-500" : "border-gray-300"}`}
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
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${errors.email ? "border-red-500" : "border-gray-300"}`}
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
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${errors.phone ? "border-red-500" : "border-gray-300"}`}
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

                        {/* ── Area ─────────────────────────────────────────── */}
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
                                    className={`w-full appearance-none pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white ${errors.address ? "border-red-500" : "border-gray-300"}`}
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
                                    <option value="singleton">Singleton</option>
                                    <option value="parklands">Parklands</option>
                                    <option value="stake-hill">
                                        Stake Hill
                                    </option>
                                    <option value="san-remo">San Remo</option>
                                    <option value="meetpoint-mandurah-dot">
                                        Meetpoint Mandurah Dot
                                    </option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            </div>
                            {errors.address && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.address}
                                </p>
                            )}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            Currently serving only these areas with postcode
                            6210, 6180, or 6175.
                            <span className="block">
                                If your address is not available, please select
                                "Meetpoint Mandurah Dot" where you will be
                                meeting instructor.
                            </span>
                        </p>

                        {/* ── Pickup Location + Home Address ───────────────── */}
                        <div className="space-y-4">
                            {pickupConfirmed && (
                                <div className="flex flex-col sm:flex-row gap-4 items-start rounded-xl">
                                    <HomeAddressField
                                        id="pickup_home_address"
                                        label="Home Address"
                                        value={formData.pickup_home_address}
                                        error={errors.pickup_home_address}
                                        disabled={isMeetpoint}
                                        onChange={(val) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                pickup_home_address: val,
                                            }));
                                            if (errors.pickup_home_address) {
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    pickup_home_address: "",
                                                }));
                                            }
                                        }}
                                    />
                                </div>
                            )}
                            <LocationAutocomplete
                                id="pickup_location"
                                name="pickup_location"
                                label="Pickup Location *"
                                value={formData.pickup_location}
                                selectedLocation={
                                    selectedLocations.pickup_location
                                }
                                error={errors.pickup_location}
                                placeholder="Start typing pickup address"
                                onInputChange={handleLocationInputChange}
                                onLocationSelect={handleLocationSelect}
                                disabled={isMeetpoint}
                            />
                        </div>

                        {/* ── Dropoff Location + Home Address ─────────────── */}
                        <div className="space-y-4">
                            {dropoffConfirmed && (
                                <div className="flex flex-col sm:flex-row gap-4 items-start rounded-xl">
                                    <HomeAddressField
                                        id="dropoff_home_address"
                                        label="Home Address"
                                        value={formData.dropoff_home_address}
                                        error={errors.dropoff_home_address}
                                        disabled={isMeetpoint}
                                        onChange={(val) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                dropoff_home_address: val,
                                            }));
                                            if (errors.dropoff_home_address) {
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    dropoff_home_address: "",
                                                }));
                                            }
                                        }}
                                    />
                                </div>
                            )}
                            <LocationAutocomplete
                                id="dropoff_location"
                                name="dropoff_location"
                                label="Dropoff Location *"
                                value={formData.dropoff_location}
                                selectedLocation={
                                    selectedLocations.dropoff_location
                                }
                                error={errors.dropoff_location}
                                placeholder="Start typing dropoff address"
                                onInputChange={handleLocationInputChange}
                                onLocationSelect={handleLocationSelect}
                                disabled={isMeetpoint}
                                action={
                                    !isMeetpoint ? (
                                        <button
                                            type="button"
                                            onClick={setDropoffSameAsPickup}
                                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                                        >
                                            Same as pickup location
                                        </button>
                                    ) : null
                                }
                            />
                        </div>

                        {/* ── Comment ──────────────────────────────────────── */}
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
                                value={formData.comment}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                                placeholder="Any special requests, notes for your instructor, etc."
                            />
                        </div>

                        {/* ── Terms ────────────────────────────────────────── */}
                        <div className="border-t border-gray-200 pt-4">
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="acceptTerms"
                                    checked={acceptTerms}
                                    onChange={(e) => {
                                        setAcceptTerms(e.target.checked);
                                        if (errors.terms)
                                            setErrors((prev) => ({
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
                                    *
                                </label>
                            </div>
                            {errors.terms && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.terms}
                                </p>
                            )}
                        </div>

                        {/* ── Submit ───────────────────────────────────────── */}
                        <button
                            type="submit"
                            disabled={
                                submitting ||
                                !selectedDate ||
                                !selectedTime ||
                                !acceptTerms
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
                            and conditions and privacy policy
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
// import PackageSelector from "./PackageSelector";

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
//                 <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
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
//                     className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
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

// const CalendarIntegrationMobile = ({ price, packageOptions = [] }) => {
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
//         comment: "",
//     });

//     const [errors, setErrors] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [submitting, setSubmitting] = useState(false);
//     const [selectedLocations, setSelectedLocations] = useState({
//         pickup_location: null,
//         dropoff_location: null,
//     });

//     // Terms and conditions acceptance
//     const [acceptTerms, setAcceptTerms] = useState(false);

//     // Time slots state
//     const [timeSlots, setTimeSlots] = useState({});
//     const [scheduleEnds, setScheduleEnds] = useState({});
//     const [availabilityLoading, setAvailabilityLoading] = useState(false);
//     const [showNextAvailability, setShowNextAvailability] = useState(false);
//     const [nextAvailableDates, setNextAvailableDates] = useState([]);
//     const [allDates, setAllDates] = useState([]);
//     const timeSlotsRef = useRef({});
//     const loadingDateKeyRef = useRef("");
//     const availabilityLoadingRef = useRef(false);

//     useEffect(() => {
//         timeSlotsRef.current = timeSlots;
//     }, [timeSlots]);

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

//     // Function to set dropoff location same as pickup location
//     const setDropoffSameAsPickup = () => {
//         if (
//             formData.pickup_location &&
//             locationMatchesTypedAddress(
//                 selectedLocations.pickup_location,
//                 formData.pickup_location,
//             )
//         ) {
//             setFormData((prev) => ({
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
//             toast.success("Dropoff location set to pickup location");
//         } else {
//             toast.error(
//                 "Please select a pickup location from the suggestions first",
//             );
//         }
//     };

//     // The backend already filters slots by package duration, buffer, blocks, and reservations.
//     const getNonOverlappingSlots = (slots, dateKey) => {
//         if (!slots || slots.length === 0) return [];
//         const durationMinutes = parseDuration(price?.duration);
//         const bookingStepMinutes = durationMinutes + 20;

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
//             .filter(Number.isFinite)
//             .sort((a, b) => a - b);

//         if (sortedSlotMinutes.length === 0) return [];

//         const scheduleEndMinutes = scheduleEnds[dateKey]
//             ? timeToMinutes(scheduleEnds[dateKey])
//             : sortedSlotMinutes[sortedSlotMinutes.length - 1] +
//               bookingStepMinutes;
//         const latestStartMinutes = scheduleEndMinutes - bookingStepMinutes;
//         const displaySlots = [];
//         let candidateMinutes = sortedSlotMinutes[0];

//         while (candidateMinutes <= latestStartMinutes) {
//             displaySlots.push(minutesToTime(candidateMinutes));
//             candidateMinutes += bookingStepMinutes;

//             const hasNearbyAvailableSlot = sortedSlotMinutes.some(
//                 (slotMinutes) =>
//                     slotMinutes >= candidateMinutes &&
//                     slotMinutes < candidateMinutes + 20,
//             );

//             if (!hasNearbyAvailableSlot) {
//                 const nextAvailableSlot = sortedSlotMinutes.find(
//                     (slotMinutes) => slotMinutes >= candidateMinutes,
//                 );

//                 if (nextAvailableSlot === undefined) break;

//                 candidateMinutes = nextAvailableSlot;
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

//     const mapAvailableSlots = useCallback(
//         (slots = []) =>
//             slots
//                 .filter((slot) => slot.status === "available")
//                 .map((slot) => {
//                     const startTime = slot.start_time;
//                     if (
//                         typeof startTime === "string" &&
//                         startTime.includes(":")
//                     ) {
//                         const parts = startTime.split(":");
//                         return `${parts[0]}:${parts[1]}`;
//                     }
//                     return startTime;
//                 }),
//         [],
//     );

//     const fetchDropdownAvailability = useCallback(async () => {
//         if (
//             !price?.id ||
//             allDates.length === 0 ||
//             availabilityLoadingRef.current
//         ) {
//             return;
//         }

//         const datesToFetch = allDates
//             .slice(0, 60)
//             .filter(
//                 (date) =>
//                     !isPastDate(date.value) &&
//                     timeSlotsRef.current[date.value] === undefined,
//             );

//         if (datesToFetch.length === 0) return;

//         availabilityLoadingRef.current = true;
//         setAvailabilityLoading(true);

//         try {
//             const batchSize = 7;

//             for (let i = 0; i < datesToFetch.length; i += batchSize) {
//                 const batch = datesToFetch.slice(i, i + batchSize);

//                 const results = await Promise.all(
//                     batch.map(async (date) => {
//                         try {
//                             const response = await axios.get(
//                                 route("ourtimeslots.get"),
//                                 {
//                                     params: {
//                                         date: date.value,
//                                         price_id: price.id,
//                                     },
//                                 },
//                             );

//                             return [
//                                 date.value,
//                                 response.data.success
//                                     ? mapAvailableSlots(
//                                           response.data.slots || [],
//                                       )
//                                     : [],
//                                 response.data.success
//                                     ? response.data.current_end
//                                     : null,
//                             ];
//                         } catch (err) {
//                             console.error(
//                                 `Error fetching slots for ${date.value}:`,
//                                 err,
//                             );
//                             return [date.value, [], null];
//                         }
//                     }),
//                 );

//                 const nextSlots = Object.fromEntries(
//                     results.map(([dateKey, slots]) => [dateKey, slots]),
//                 );
//                 const nextEnds = Object.fromEntries(
//                     results
//                         .filter(([, , endTime]) => endTime)
//                         .map(([dateKey, , endTime]) => [dateKey, endTime]),
//                 );
//                 timeSlotsRef.current = {
//                     ...timeSlotsRef.current,
//                     ...nextSlots,
//                 };
//                 setTimeSlots((prev) => ({
//                     ...prev,
//                     ...nextSlots,
//                 }));
//                 setScheduleEnds((prev) => ({
//                     ...prev,
//                     ...nextEnds,
//                 }));
//             }
//         } finally {
//             availabilityLoadingRef.current = false;
//             setAvailabilityLoading(false);
//         }
//     }, [allDates, mapAvailableSlots, price?.id]);

//     useEffect(() => {
//         fetchDropdownAvailability();
//     }, [fetchDropdownAvailability]);

//     // Fetch time slots for a specific date.
//     const fetchSlotsForDate = useCallback(
//         async (dateKey, force = false) => {
//             if (!dateKey || !price?.id || isPastDate(dateKey)) return;

//             const alreadyFetched = timeSlotsRef.current[dateKey] !== undefined;
//             const alreadyLoading = loadingDateKeyRef.current === dateKey;

//             if (!force && (alreadyFetched || alreadyLoading)) return;

//             try {
//                 loadingDateKeyRef.current = dateKey;
//                 setLoading(true);

//                 const response = await axios.get(route("ourtimeslots.get"), {
//                     params: {
//                         date: dateKey,
//                         price_id: price.id,
//                     },
//                 });

//                 const availableSlots = response.data.success
//                     ? mapAvailableSlots(response.data.slots || [])
//                     : [];

//                 timeSlotsRef.current = {
//                     ...timeSlotsRef.current,
//                     [dateKey]: availableSlots,
//                 };
//                 setTimeSlots((prev) => ({
//                     ...prev,
//                     [dateKey]: availableSlots,
//                 }));
//                 if (response.data.success) {
//                     setScheduleEnds((prev) => ({
//                         ...prev,
//                         [dateKey]: response.data.current_end,
//                     }));
//                 }
//             } catch (err) {
//                 console.error(`Error fetching slots for ${dateKey}:`, err);
//                 timeSlotsRef.current = {
//                     ...timeSlotsRef.current,
//                     [dateKey]: [],
//                 };
//                 setTimeSlots((prev) => ({
//                     ...prev,
//                     [dateKey]: [],
//                 }));
//             } finally {
//                 if (loadingDateKeyRef.current === dateKey) {
//                     loadingDateKeyRef.current = "";
//                     setLoading(false);
//                 }
//             }
//         },
//         [mapAvailableSlots, price?.id],
//     );

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

//     const getDateAvailabilityStatus = (dateValue) => {
//         if (!dateValue) return null;

//         if (isPastDate(dateValue)) {
//             return {
//                 label: "Past date",
//                 className: "border-gray-200 bg-gray-50 text-gray-500",
//             };
//         }

//         if (loading && selectedDate === dateValue) {
//             return {
//                 label: "Checking availability...",
//                 className: "border-amber-200 bg-amber-50 text-amber-700",
//             };
//         }

//         if (timeSlots[dateValue] === undefined) {
//             return {
//                 label: availabilityLoading
//                     ? "Checking availability..."
//                     : "Choose a time after selecting a date",
//                 className: availabilityLoading
//                     ? "border-amber-200 bg-amber-50 text-amber-700"
//                     : "border-gray-200 bg-gray-50 text-gray-600",
//             };
//         }

//         if (timeSlots[dateValue].length > 0) {
//             return {
//                 label: "Available",
//                 className: "border-emerald-200 bg-emerald-50 text-emerald-700",
//             };
//         }

//         return {
//             label: "Fully booked",
//             className: "border-red-200 bg-red-50 text-red-700",
//         };
//     };

//     const getDateOptionLabel = (date) => {
//         if (isPastDate(date.value)) {
//             return `${date.display} (Past date)`;
//         }

//         const slots = timeSlots[date.value];

//         if (slots === undefined) {
//             return availabilityLoading
//                 ? `${date.display} (Checking...)`
//                 : date.display;
//         }

//         return slots.length > 0
//             ? `${date.display} \u2713 Available`
//             : `${date.display} \u2715 Fully booked`;
//     };

//     const getDateOptionClassName = (dateValue) => {
//         if (isPastDate(dateValue)) return "py-1 text-gray-400";
//         if (timeSlots[dateValue] === undefined) return "py-1 text-gray-900";
//         return timeSlots[dateValue].length > 0
//             ? "py-1 text-emerald-700"
//             : "py-1 text-red-600";
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
//                             setScheduleEnds((prev) => ({
//                                 ...prev,
//                                 [dateKey]: response.data.current_end,
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
//         setFormData((prev) => ({
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
//         setFormData((prev) => ({
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
//             if (!formData[field]?.trim()) {
//                 locationErrors[field] = `Please enter a ${label}.`;
//                 return;
//             }

//             if (
//                 !selectedLocations[field] ||
//                 !locationMatchesTypedAddress(
//                     selectedLocations[field],
//                     formData[field],
//                 )
//             ) {
//                 locationErrors[field] =
//                     `Please choose a service-area suggestion for the ${label}, then add house/unit details if needed.`;
//             }
//         });

//         return locationErrors;
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
//             setErrors((prev) => ({
//                 ...prev,
//                 terms: "Please accept the Terms & Conditions and Privacy Policy",
//             }));
//             toast.error(
//                 "Please accept the Terms & Conditions and Privacy Policy",
//             );
//             return;
//         }

//         const locationErrors = validateSelectedLocations();
//         Object.assign(newErrors, locationErrors);

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
//                 comment: formData.comment,
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
//                     comment: "",
//                 });
//                 setSelectedLocations({
//                     pickup_location: null,
//                     dropoff_location: null,
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
//     const nonOverlappingSlots = getNonOverlappingSlots(
//         currentTimeSlots,
//         selectedDate,
//     );

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
//                             <PackageSelector
//                                 price={price}
//                                 packageOptions={packageOptions}
//                                 className="mb-4"
//                             />

//                             <h3 className="font-semibold text-gray-900 mb-2 capitalize">
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
//                         {/* Date Selection */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Available Date *
//                             </label>
//                             <div className="relative">
//                                 <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                                 <select
//                                     value={selectedDate}
//                                     onFocus={fetchDropdownAvailability}
//                                     onMouseDown={fetchDropdownAvailability}
//                                     onTouchStart={fetchDropdownAvailability}
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
//                                                 label={`-- ${monthYear} --`}
//                                                 className="font-semibold text-gray-700"
//                                             >
//                                                 {dates.map((date, i) => {
//                                                     const isPast = isPastDate(
//                                                         date.value,
//                                                     );

//                                                     return (
//                                                         <option
//                                                             key={i}
//                                                             value={date.value}
//                                                             disabled={isPast}
//                                                             className={getDateOptionClassName(
//                                                                 date.value,
//                                                             )}
//                                                         >
//                                                             {getDateOptionLabel(
//                                                                 date,
//                                                             )}
//                                                         </option>
//                                                     );
//                                                 })}
//                                             </optgroup>
//                                         ),
//                                     )}
//                                 </select>
//                                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                             </div>

//                             {selectedDate && (
//                                 <p
//                                     className={`mt-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
//                                         getDateAvailabilityStatus(selectedDate)
//                                             .className
//                                     }`}
//                                 >
//                                     {
//                                         getDateAvailabilityStatus(selectedDate)
//                                             .label
//                                     }
//                                 </p>
//                             )}
//                         </div>
//                         {/* Legend for color indicators */}
//                         <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
//                             <div className="flex items-center gap-1">
//                                 <span className="text-green-500 text-sm">
//                                     {" "}
//                                     ✓
//                                 </span>
//                                 <span className="text-gray-600">
//                                     Has available slots
//                                 </span>
//                             </div>

//                             <div className="flex items-center gap-1">
//                                 <span className="text-red-500 text-sm"> ✗</span>
//                                 <span className="text-gray-600">
//                                     No available slots
//                                 </span>
//                             </div>
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

//                                     <option value="singleton">Singleton</option>
//                                     <option value="parklands">Parklands</option>
//                                     <option value="stake-hill">
//                                         Stake Hill
//                                     </option>
//                                     <option value="san-remo">San Remo</option>
//                                     <option value="meetpoint-mandurah-dot">
//                                         Meetpoint Mandurah Dot
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
//                         <p className="mt-1 text-sm text-gray-500">
//                             Currently serving only these areas with postcode
//                             6210, 6180, or 6175.
//                             <span className="block">
//                                 If your address is not available, please select
//                                 "Meetpoint Mandurah Dot" where you will be
//                                 meeting instructor.
//                             </span>
//                         </p>

//                         {/* Pickup Location */}
//                         <LocationAutocomplete
//                             id="pickup_location"
//                             name="pickup_location"
//                             label="Pickup Location *"
//                             value={formData.pickup_location}
//                             selectedLocation={selectedLocations.pickup_location}
//                             error={errors.pickup_location}
//                             placeholder="Start typing pickup address"
//                             onInputChange={handleLocationInputChange}
//                             onLocationSelect={handleLocationSelect}
//                         />

//                         {/* Dropoff Location */}
//                         <LocationAutocomplete
//                             id="dropoff_location"
//                             name="dropoff_location"
//                             label="Dropoff Location *"
//                             value={formData.dropoff_location}
//                             selectedLocation={
//                                 selectedLocations.dropoff_location
//                             }
//                             error={errors.dropoff_location}
//                             placeholder="Start typing dropoff address"
//                             onInputChange={handleLocationInputChange}
//                             onLocationSelect={handleLocationSelect}
//                             action={
//                                 <button
//                                     type="button"
//                                     onClick={setDropoffSameAsPickup}
//                                     className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
//                                 >
//                                     Same as pickup location
//                                 </button>
//                             }
//                         />

//                         {/* Comment */}
//                         <div>
//                             <label
//                                 htmlFor="comment"
//                                 className="block text-sm font-medium text-gray-700 mb-2"
//                             >
//                                 Comment
//                             </label>
//                             <textarea
//                                 id="comment"
//                                 name="comment"
//                                 value={formData.comment}
//                                 onChange={handleChange}
//                                 rows={6}
//                                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
//                                 placeholder="Any special requests, notes for your instructor, etc."
//                             />
//                         </div>

//                         {/* Terms and Conditions Checkbox */}
//                         <div className="border-t border-gray-200 pt-4">
//                             <div className="flex items-start gap-3">
//                                 <input
//                                     type="checkbox"
//                                     id="acceptTerms"
//                                     checked={acceptTerms}
//                                     onChange={(e) => {
//                                         setAcceptTerms(e.target.checked);
//                                         if (errors.terms) {
//                                             setErrors((prev) => ({
//                                                 ...prev,
//                                                 terms: "",
//                                             }));
//                                         }
//                                     }}
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
//                             {errors.terms && (
//                                 <p className="mt-1 text-sm text-red-600">
//                                     {errors.terms}
//                                 </p>
//                             )}
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


