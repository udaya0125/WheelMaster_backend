
import { Calendar } from "@/components/ui/calendar";
import axios from "axios";
import React, { useEffect, useState, useCallback, useRef } from "react";
import BookingForm from "./BookingForm";
import PackageSelector from "./PackageSelector";
import { useLessonCart } from "./useLessonCart";
import { Link } from "@inertiajs/react";
import { ChevronLeft, ShoppingCart, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const CalendarIntegration = ({ price, packageOptions = [] }) => {
    const [activePrice, setActivePrice] = useState(price);
    const [timeSlots, setTimeSlots] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(null);
    const [showNextAvailability, setShowNextAvailability] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [showCartCheckout, setShowCartCheckout] = useState(false);
    const [nextAvailableDates, setNextAvailableDates] = useState([]);
    const [allSlotsData, setAllSlotsData] = useState({});
    const [scheduleEnds, setScheduleEnds] = useState({});

    // dayAvailability: { "YYYY-MM-DD": "available" | "unavailable" }
    const [dayAvailability, setDayAvailability] = useState({});
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [availabilitySummarySettledAt, setAvailabilitySummarySettledAt] =
        useState(0);
    const availabilitySummaryLoadingRef = useRef(false);
    const cartSectionRef = useRef(null);
    const lessonCart = useLessonCart();

    useEffect(() => {
        setActivePrice(price);
    }, [price]);

    const handlePackageChange = useCallback((nextPackage) => {
        setActivePrice(nextPackage);
        setSelectedTime(null);
        setShowBookingForm(false);
        setShowNextAvailability(false);
        setNextAvailableDates([]);
        setTimeSlots({});
        setAllSlotsData({});
        setScheduleEnds({});
        setDayAvailability({});
    }, []);

    const handleCartShortcutClick = useCallback(() => {
        cartSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }, []);

    // ─── Fetch availability for every day in the visible month ───────────────
    const applyAvailabilitySummary = useCallback((summary = {}) => {
        const nextDayAvailability = {};
        const nextTimeSlots = {};
        const nextScheduleEnds = {};

        Object.entries(summary).forEach(([dateKey, day]) => {
            const availableSlots = day.available_slots || [];
            nextDayAvailability[dateKey] =
                day.status === "available" && availableSlots.length > 0
                    ? "available"
                    : "unavailable";
            nextTimeSlots[dateKey] = availableSlots;
            if (day.current_end) nextScheduleEnds[dateKey] = day.current_end;
        });

        setDayAvailability((prev) => ({
            ...prev,
            ...nextDayAvailability,
        }));
        setTimeSlots((prev) => ({ ...prev, ...nextTimeSlots }));
        setScheduleEnds((prev) => ({ ...prev, ...nextScheduleEnds }));
    }, []);

    const fetchAvailabilitySummary = useCallback(
        async (startDate, endDate) => {
            if (!activePrice?.id || !startDate || !endDate) return {};

            const response = await axios.get(
                route("ourtimeslots.availability-summary"),
                {
                    params: {
                        start_date: formatDateKey(startDate),
                        end_date: formatDateKey(endDate),
                        price_id: activePrice.id,
                    },
                }
            );

            if (!response.data.success) return {};

            const summary = response.data.data || {};
            applyAvailabilitySummary(summary);
            return summary;
        },
        [activePrice?.id, applyAvailabilitySummary]
    );

    const fetchMonthAvailability = useCallback(
        async (monthDate) => {
            if (!activePrice?.id) return;

            const year = monthDate.getFullYear();
            const month = monthDate.getMonth();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const startDate = firstDay < today ? today : firstDay;

            if (startDate > lastDay) return;

            try {
                availabilitySummaryLoadingRef.current = true;
                await fetchAvailabilitySummary(startDate, lastDay);
            } catch (error) {
                console.error("Error fetching month availability:", error);
            } finally {
                availabilitySummaryLoadingRef.current = false;
                setAvailabilitySummarySettledAt(Date.now());
            }
        },
        [activePrice?.id, fetchAvailabilitySummary]
    );

    useEffect(() => {
        fetchMonthAvailability(currentMonth);
    }, [currentMonth, fetchMonthAvailability]);

    // ─── Fetch slots for the selected date (detailed, with booked slots) ─────
    useEffect(() => {
        const fetchTimeSlots = async () => {
            try {
                const dateKey = formatDateKey(selectedDate);
                if (timeSlots[dateKey] !== undefined) return;
                if (availabilitySummaryLoadingRef.current) return;

                setLoading(true);

                const response = await axios.get(route("ourtimeslots.get"), {
                    params: {
                        date: dateKey,
                        price_id: activePrice.id,
                    },
                });

                if (response.data.success) {
                    setAllSlotsData((prev) => ({
                        ...prev,
                        [dateKey]: response.data.slots,
                    }));
                    setScheduleEnds((prev) => ({
                        ...prev,
                        [dateKey]: response.data.current_end,
                    }));

                    const allSlots = response.data.slots || [];

                    const available = allSlots
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
                        [dateKey]: available,
                    }));

                    setDayAvailability((prev) => ({
                        ...prev,
                        [dateKey]:
                            available.length > 0 ? "available" : "unavailable",
                    }));
                } else {
                    console.error(
                        "Error fetching time slots:",
                        response.data.message
                    );
                    toast.error("Error loading time slots. Please try again.");
                }
            } catch (err) {
                console.error("Error fetching time slots:", err);
                toast.error("Error loading time slots. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (selectedDate && activePrice?.id) {
            fetchTimeSlots();
        }
    }, [activePrice?.id, availabilitySummarySettledAt, selectedDate, timeSlots]);

    // ─── Helpers ─────────────────────────────────────────────────────────────

    const formatDateKey = (date) => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const isPastDate = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        return compareDate < today;
    };

    const getTimeSlotsForDate = (date) => {
        if (!date) return [];
        const dateKey = formatDateKey(date);
        return timeSlots[dateKey] || [];
    };

    const formatDisplayDate = (date) => {
        if (!date) return "Select a date";
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

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

    const calculateEndTime = (startTime, durationString) => {
        const durationMinutes = parseDuration(durationString);
        const startTimeStr =
            typeof startTime === "object" ? startTime.start_time : startTime;
        let cleanStartTime = startTimeStr;
        if (
            typeof cleanStartTime === "string" &&
            cleanStartTime.includes(":")
        ) {
            const parts = cleanStartTime.split(":");
            if (parts.length >= 2)
                cleanStartTime = `${parts[0]}:${parts[1]}`;
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
        if (hours > 0)
            return `${hours} ${hours === 1 ? "hour" : "hours"}`;
        return `${mins} minutes`;
    };

    const getNonOverlappingSlots = (slots, date) => {
        if (!slots || slots.length === 0) return [];
        const durationMinutes = parseDuration(activePrice?.duration);
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
                let startTime = typeof slot === "string" ? slot : slot?.start_time;
                if (startTime?.includes(":")) {
                    const parts = startTime.split(":");
                    startTime = `${parts[0]}:${parts[1]}`;
                }
                return timeToMinutes(startTime);
            })
            .filter(Number.isFinite)
            .sort((a, b) => a - b);

        if (sortedSlotMinutes.length === 0) return [];

        const dateKey = formatDateKey(date);
        const allSlotEndMinutes = (allSlotsData[dateKey] || [])
            .map((slot) => slot.end_time)
            .map((time) => {
                if (typeof time === "string" && time.includes(":")) {
                    const parts = time.split(":");
                    return timeToMinutes(`${parts[0]}:${parts[1]}`);
                }
                return Number.NaN;
            })
            .filter(Number.isFinite);
        const scheduleEndMinutes = scheduleEnds[dateKey]
            ? timeToMinutes(scheduleEnds[dateKey])
            : allSlotEndMinutes.length > 0
              ? Math.max(...allSlotEndMinutes)
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
        const endTimeStr = calculateEndTime(startTimeStr, activePrice?.duration);
        return `${startTimeStr} - ${endTimeStr}`;
    };

    // ─── Next availability ────────────────────────────────────────────────────

    const findNextAvailableDates = async () => {
        try {
            const today = new Date();
            const rangeDates = [];

            for (let i = 1; i <= 30; i++) {
                const nextDate = new Date(today);
                nextDate.setDate(today.getDate() + i);
                rangeDates.push(nextDate);
            }

            const cachedAvailableDates = rangeDates.filter((date) => {
                const dateKey = formatDateKey(date);
                return (timeSlots[dateKey] || []).length > 0;
            });

            if (cachedAvailableDates.length >= 3) {
                return cachedAvailableDates.slice(0, 3);
            }

            const summary = await fetchAvailabilitySummary(
                rangeDates[0],
                rangeDates[rangeDates.length - 1]
            );

            return rangeDates
                .filter((date) => {
                    const dateKey = formatDateKey(date);
                    const summarySlots =
                        summary[dateKey]?.available_slots || [];
                    const cachedSlots = timeSlots[dateKey] || [];
                    return summarySlots.length > 0 || cachedSlots.length > 0;
                })
                .slice(0, 3);
        } catch (error) {
            console.error("Error finding next available dates:", error);
            return [];
        }
    };

    // ─── Handlers ────────────────────────────────────────────────────────────

    const handleNextAvailabilityClick = async () => {
        setShowNextAvailability(true);
        const loadingToast = toast.loading(
            "Checking next available dates..."
        );
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
        setSelectedDate(date);
        setSelectedTime(null);
        setShowNextAvailability(false);
        toast.success(`Selected date: ${date.toLocaleDateString()}`);
    };

    const handleConfirmBookingClick = () => {
        if (selectedTime && activePrice?.duration) {
            setTimeout(() => setShowBookingForm(true), 500);
        } else {
            toast.error("Please select a time slot first");
        }
    };

    const handleAddToCart = () => {
        if (!selectedTime || !activePrice?.id || isPastDate(selectedDate)) {
            toast.error("Please select an available time slot first");
            return;
        }

        const added = lessonCart.addItem({
            price_id: activePrice.id,
            reservation_date: formatDateKey(selectedDate),
            start_time: selectedTime,
            price: {
                id: activePrice.id,
                description: activePrice.description,
                duration: activePrice.duration,
                price: activePrice.price,
                category: activePrice.category,
            },
        });

        if (added) {
            toast.success("Lesson added to cart");
            setSelectedTime(null);
        } else {
            toast.error("That lesson is already in your cart");
        }
    };

    const handleCartCheckoutSuccess = async () => {
        lessonCart.clearCart();
        setShowCartCheckout(false);
        setSelectedTime(null);
        setTimeSlots({});
        setAllSlotsData({});
        setScheduleEnds({});
        setDayAvailability({});
        await fetchMonthAvailability(currentMonth);
    };

    const handleCartItemsUnavailable = async (unavailableIndexes) => {
        const keysToRemove = unavailableIndexes
            .map((index) => lessonCart.items[index]?.key)
            .filter(Boolean);

        if (keysToRemove.length > 0) {
            lessonCart.removeItems(keysToRemove);
            toast.error("Unavailable lessons were removed from your cart.");
        }

        setTimeSlots({});
        setAllSlotsData({});
        setScheduleEnds({});
        setDayAvailability({});
        await fetchMonthAvailability(currentMonth);
    };

    const handleBookingSuccess = async () => {
        const loadingToast = toast.loading(
            "Refreshing available time slots..."
        );
        try {
            setLoading(true);
            const dateKey = formatDateKey(selectedDate);
            const response = await axios.get(route("ourtimeslots.get"), {
                params: { date: dateKey, price_id: activePrice.id },
            });
            if (response.data.success) {
                const allSlots = response.data.slots || [];
                const available = allSlots
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
                setTimeSlots((prev) => ({ ...prev, [dateKey]: available }));
                setAllSlotsData((prev) => ({
                    ...prev,
                    [dateKey]: allSlots,
                }));
                setScheduleEnds((prev) => ({
                    ...prev,
                    [dateKey]: response.data.current_end,
                }));
                setDayAvailability((prev) => ({
                    ...prev,
                    [dateKey]:
                        available.length > 0 ? "available" : "unavailable",
                }));
                toast.dismiss(loadingToast);
                toast.success("Booking confirmed! Time slots refreshed. Please check your Spam email for booking details.");
            }
        } catch (error) {
            console.error("Error refreshing time slots:", error);
            toast.dismiss(loadingToast);
            toast.error(
                "Booking confirmed, but failed to refresh time slots. Please check your Spam email for booking details."
            );
        } finally {
            setLoading(false);
            setSelectedTime(null);
            setShowBookingForm(false);
        }
    };

    const handleDateSelect = (date) => {
        if (date && !isPastDate(date)) {
            setSelectedDate(date);
            setSelectedTime(null);
            setShowNextAvailability(false);
        } else if (date && isPastDate(date)) {
            toast.error("Cannot select past dates", { icon: "⚠️" });
        }
    };

    const handleMonthChange = (month) => {
        setCurrentMonth(month);
    };

    // ─── Build modifier date arrays ───────────────────────────────────────────
    // IMPORTANT: Dates must be constructed with T00:00:00 to avoid UTC offset
    // issues that would shift the date by one day in some timezones.

    const availableDays = Object.entries(dayAvailability)
        .filter(([, status]) => status === "available")
        .map(([key]) => new Date(key + "T00:00:00"));

    const unavailableDays = Object.entries(dayAvailability)
        .filter(([, status]) => status === "unavailable")
        .map(([key]) => new Date(key + "T00:00:00"));

    // ─── Render ───────────────────────────────────────────────────────────────

    const currentTimeSlots = getTimeSlotsForDate(selectedDate);
    const displayTimeSlots = getNonOverlappingSlots(
        currentTimeSlots,
        selectedDate,
    );

    return (
        <div className="min-h-screen bg-gray-50">
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
                    loading: {
                        style: { background: "#3b82f6", color: "#fff" },
                    },
                }}
            />

            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <Link
                    href={"/"}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ChevronLeft size={20} />
                    <span className="font-medium">Back</span>
                </Link>

                <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                Schedule Your Service
                            </h1>
                            <p className="text-gray-600 text-sm sm:text-base">
                                Check out our availability and book the date and time
                                that works for you
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleCartShortcutClick}
                            className="inline-flex w-fit items-center gap-3 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:border-indigo-200 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            aria-label={`View cart with ${lessonCart.count} lessons`}
                        >
                            <ShoppingCart size={18} />
                            <span>Cart</span>
                            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-indigo-600 px-2 text-xs font-bold text-white">
                                {lessonCart.count}
                            </span>
                            <span className="text-xs font-medium text-indigo-500">
                                ${lessonCart.subtotal.toFixed(2)}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

                    {/* ── Calendar ── */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-1">
                        <div className="mb-4">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                                Select a Date
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500">
                                Time zone: Australian Western Standard Time
                                (GMT+8)
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                                    <span>Available</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-sm bg-red-400" />
                                    <span>Fully Booked</span>
                                </div>
                            </div>
                        </div>

                        {/*
                         * HOW THE COLORING WORKS:
                         *
                         * `modifiers` — passes named arrays of Date objects to
                         *   react-day-picker. Each date in the array gets that
                         *   modifier class added to its <button> element.
                         *
                         * `modifiersClassNames` — maps modifier names to CSS
                         *   class strings applied directly to the day <button>.
                         *   Using Tailwind's `!` prefix forces these styles to
                         *   win over the default rdp styles.
                         *
                         * This is the ONLY reliable way to color full day cells
                         * in shadcn/radix Calendar — DayContent only wraps the
                         * text node, not the button background.
                         */}
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            onMonthChange={handleMonthChange}
                            disabled={isPastDate}
                            modifiers={{
                                available: availableDays,
                                unavailable: unavailableDays,
                            }}
                            modifiersClassNames={{
                                available:
                                    "!bg-emerald-400 !text-white hover:!bg-emerald-600 !rounded-md !font-semibold",
                                unavailable:
                                    "!bg-red-400 !text-white hover:!bg-red-500 !rounded-md !font-semibold",
                            }}
                            className="rounded-md border
                                [&_.rdp-day_selected]:!bg-indigo-600
                                [&_.rdp-day_selected]:!text-white
                                [&_.rdp-day_selected:hover]:!bg-indigo-700
                                [&_.rdp-day_disabled]:!bg-transparent
                                [&_.rdp-day_disabled]:!text-gray-300
                                [&_.rdp-day_disabled]:cursor-not-allowed"
                        />
                    </div>

                    {/* ── Time Slots ── */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-1">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                            Available Times
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 mb-4">
                            {formatDisplayDate(selectedDate)}
                        </p>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                                <p className="text-gray-500 text-sm mt-3">
                                    Loading time slots...
                                </p>
                            </div>
                        ) : displayTimeSlots.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
                                {displayTimeSlots.map((time, index) => (
                                    <button
                                        key={index}
                                        onClick={() =>
                                            setSelectedTime(time)
                                        }
                                        className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg border-2 transition-all duration-200 font-medium text-sm sm:text-base ${
                                            selectedTime === time
                                                ? "border-indigo-600 bg-indigo-600 text-white shadow-md"
                                                : "border-gray-200 hover:border-indigo-300 text-gray-700 hover:bg-indigo-50"
                                        }`}
                                    >
                                        {getTimeSlotDisplay(time)}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <div className="text-gray-400 mb-3">
                                    <svg
                                        className="w-12 h-12 mx-auto"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <p className="text-gray-500 font-medium mb-2">
                                    {isPastDate(selectedDate)
                                        ? "Cannot select past dates"
                                        : "No available time slots"}
                                </p>
                                <p className="text-gray-400 text-sm mb-4">
                                    {isPastDate(selectedDate)
                                        ? "Please select a current or future date"
                                        : "Please select another date"}
                                </p>

                                {!showNextAvailability ? (
                                    <button
                                        onClick={handleNextAvailabilityClick}
                                        className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
                                    >
                                        Check Next Availability
                                    </button>
                                ) : (
                                    <div className="mt-4">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-3 text-left">
                                            Next available dates:
                                        </h3>
                                        <div className="space-y-2">
                                            {nextAvailableDates.map(
                                                (date, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() =>
                                                            handleSelectNextAvailableDate(
                                                                date
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
                                                                }
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            {
                                                                getTimeSlotsForDate(
                                                                    date
                                                                ).length
                                                            }{" "}
                                                            time slots available
                                                        </div>
                                                    </button>
                                                )
                                            )}
                                        </div>
                                        {nextAvailableDates.length === 0 && (
                                            <p className="text-gray-500 text-sm py-2">
                                                No available dates found in the
                                                next 30 days.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Service Details ── */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-1">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                            Service Details
                        </h2>

                        <div className="space-y-4 mb-6">
                            <PackageSelector
                                price={price}
                                activePrice={activePrice}
                                packageOptions={packageOptions}
                                onPackageChange={handlePackageChange}
                            />

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base capitalize">
                                    {activePrice?.category || "Driving Lessons"}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600">
                                    {activePrice?.description ||
                                        "Professional driving instruction with certified instructors"}
                                </p>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between text-xs sm:text-sm mb-2">
                                    <span className="text-gray-600">
                                        Package:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {activePrice?.description}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs sm:text-sm mb-2">
                                    <span className="text-gray-600">
                                        Duration:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {formatDurationDisplay(activePrice?.duration)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs sm:text-sm mb-2">
                                    <span className="text-gray-600">
                                        Price:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        ${activePrice?.price}
                                    </span>
                                </div>
                                {selectedDate && selectedTime && (
                                    <>
                                        <div className="flex justify-between text-xs sm:text-sm">
                                            <span className="text-gray-600">
                                                Selected:
                                            </span>
                                            <span className="font-medium text-gray-900 text-right">
                                                {selectedDate.toLocaleDateString()}{" "}
                                                at{" "}
                                                {getTimeSlotDisplay(
                                                    selectedTime
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs sm:text-sm mt-1">
                                            <span className="text-gray-600">
                                                End Time:
                                            </span>
                                            <span className="font-medium text-indigo-600 text-right">
                                                {calculateEndTime(
                                                    selectedTime,
                                                    activePrice?.duration
                                                )}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={
                                    !selectedTime || isPastDate(selectedDate)
                                }
                                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
                                    selectedTime && !isPastDate(selectedDate)
                                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                            >
                                {selectedTime ? "Add to Cart" : "Select a Time"}
                            </button>

                            <button
                                onClick={handleConfirmBookingClick}
                                disabled={
                                    !selectedTime || isPastDate(selectedDate)
                                }
                                className="w-full py-2.5 px-6 rounded-lg border border-gray-300 text-gray-700 font-semibold transition-colors duration-200 text-sm hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                                Book this lesson only
                            </button>
                        </div>

                        {selectedTime && (
                            <p className="text-xs text-center text-gray-500 mt-3">
                                Add this lesson to your cart or book it by itself.
                            </p>
                        )}

                        <div ref={cartSectionRef} className="mt-6 scroll-mt-6 border-t pt-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart size={18} className="text-indigo-600" />
                                    <h3 className="font-semibold text-gray-900">
                                        Cart
                                    </h3>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {lessonCart.count} lessons
                                </span>
                            </div>

                            {lessonCart.count === 0 ? (
                                <p className="text-sm text-gray-500">
                                    Add multiple lessons, then checkout once.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                        {lessonCart.items.map((item) => (
                                            <div
                                                key={item.key}
                                                className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {item.price.description}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {item.reservation_date} at {item.start_time}
                                                    </p>
                                                    <p className="text-xs font-medium text-gray-700">
                                                        ${item.price.price}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        lessonCart.removeItem(item.key)
                                                    }
                                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-white hover:text-red-600"
                                                    aria-label="Remove lesson from cart"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
                                        <span>Total</span>
                                        <span>${lessonCart.subtotal.toFixed(2)}</span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setShowCartCheckout(true)}
                                        className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                                    >
                                        Checkout Cart
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {showBookingForm && (
                    <BookingForm
                        selectedDate={selectedDate}
                        selectedTime={selectedTime}
                        priceId={activePrice?.id}
                        price={activePrice}
                        onClose={() => setShowBookingForm(false)}
                        onBookingSuccess={handleBookingSuccess}
                    />
                )}

                {showCartCheckout && (
                    <BookingForm
                        selectedDate={selectedDate}
                        selectedTime={selectedTime}
                        priceId={activePrice?.id}
                        price={activePrice}
                        cartItems={lessonCart.items}
                        onClose={() => setShowCartCheckout(false)}
                        onBookingSuccess={handleCartCheckoutSuccess}
                        onCartItemsUnavailable={handleCartItemsUnavailable}
                    />
                )}
            </div>
        </div>
    );
};

export default CalendarIntegration;


