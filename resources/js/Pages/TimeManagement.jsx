
import Wrapper from "@/AdminWrapper/Wrapper";
import { Calendar } from "@/components/ui/calendar";
import { CalendarRange, Clock, Package, X } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const getPackageLabel = (pkg) =>
    pkg?.duration ? `${pkg.duration} Lesson` : pkg?.description || "Lesson";

const TimeManagement = ({ packageOptions = [] }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarMonth, setCalendarMonth] = useState(
        () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    );
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activePrice, setActivePrice] = useState(() => packageOptions[0] || null);
    const [availabilitySummaryCache, setAvailabilitySummaryCache] = useState({});
    const [customStartTime, setCustomStartTime] = useState("07:00");
    const [customEndTime, setCustomEndTime] = useState("18:00");
    const [defaultStartTime] = useState("07:00");
    const [defaultEndTime] = useState("18:00");
    const [customStartInfo, setCustomStartInfo] = useState(null);
    const [editingIndex, setEditingIndex] = useState(null);
    const [showRangeModal, setShowRangeModal] = useState(false);
    const [rangeSubmitting, setRangeSubmitting] = useState(false);
    const [rangeForm, setRangeForm] = useState({
        startDate: "",
        endDate: "",
        startTime: "07:00",
        endTime: "18:00",
    });
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        reserved: 0,
        blocked: 0,
        default: 0,
        custom: 0,
    });

    const inputRefs = useRef({});

    const packages = React.useMemo(() => {
        const map = new Map();
        packageOptions.forEach((pkg) => {
            if (pkg?.id) map.set(pkg.id, pkg);
        });
        return Array.from(map.values());
    }, [packageOptions]);

    const groupedPackages = React.useMemo(
        () =>
            packages.reduce((groups, pkg) => {
                const key = pkg.category || "Driving Lessons";
                if (!groups[key]) groups[key] = [];
                groups[key].push(pkg);
                return groups;
            }, {}),
        [packages],
    );

    useEffect(() => {
        if (!packages.length) {
            if (activePrice) setActivePrice(null);
            return;
        }

        if (!activePrice || !packages.some((pkg) => pkg.id === activePrice.id)) {
            setActivePrice(packages[0]);
        }
    }, [activePrice?.id, packages]);

    useEffect(() => {
        fetchTimeSlots();
    }, [selectedDate]);

    useEffect(() => {
        if (!showRangeModal) return;

        const handleKeyDown = (event) => {
            if (event.key === "Escape" && !rangeSubmitting) {
                setShowRangeModal(false);
            }
        };

        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = "";
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [showRangeModal, rangeSubmitting]);

    // ── Helpers ────────────────────────────────────────────────────────────────

    const formatDateKey = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    const startOfMonth = (date) =>
        new Date(date.getFullYear(), date.getMonth(), 1);

    const endOfMonth = (date) =>
        new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const addDays = (date, days) => {
        const next = new Date(date);
        next.setDate(next.getDate() + days);
        return next;
    };

    const getCalendarRangeForMonth = (monthDate) => {
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);

        return {
            startDate: formatDateKey(addDays(monthStart, -monthStart.getDay())),
            endDate: formatDateKey(addDays(monthEnd, 6 - monthEnd.getDay())),
        };
    };

    const formatTime = (timeString) => {
        if (!timeString) return "";
        const [hours, minutes] = timeString.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const timeToMinutes = (timeString) => {
        const [hours, minutes] = timeString.split(":").map(Number);
        return hours * 60 + minutes;
    };

    const formatDisplayDate = (date) =>
        date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    const isPastDate = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const calendarRange = React.useMemo(
        () => getCalendarRangeForMonth(calendarMonth),
        [calendarMonth],
    );
    const calendarRangeKey = `${calendarRange.startDate}:${calendarRange.endDate}:${activePrice?.id || ""}`;
    const availabilitySummary =
        availabilitySummaryCache[calendarRangeKey] || {};

    const refreshAvailabilitySummary = async (force = false) => {
        if (!activePrice?.id) return;
        if (!force && availabilitySummaryCache[calendarRangeKey]) return;

        try {
            const response = await axios.get(
                route("ourtimeslots.availability-summary"),
                {
                    params: {
                        start_date: calendarRange.startDate,
                        end_date: calendarRange.endDate,
                        price_id: activePrice.id,
                    },
                },
            );

            if (response.data.success) {
                setAvailabilitySummaryCache((current) => ({
                    ...current,
                    [calendarRangeKey]: response.data.data || {},
                }));
            }
        } catch (error) {
            console.error("Error fetching availability summary:", error);
            toast.error("Failed to load calendar availability");
        }
    };

    const refreshCalendarAfterScheduleChange = async () => {
        setAvailabilitySummaryCache({});
        await refreshAvailabilitySummary(true);
    };

    useEffect(() => {
        refreshAvailabilitySummary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [calendarRangeKey, activePrice?.id]);

    const getRangeDayCount = () => {
        if (!rangeForm.startDate || !rangeForm.endDate) return 0;

        const toUtcTimestamp = (dateString) => {
            const [year, month, day] = dateString.split("-").map(Number);
            return Date.UTC(year, month - 1, day);
        };
        const dayCount =
            Math.floor(
                (toUtcTimestamp(rangeForm.endDate) -
                    toUtcTimestamp(rangeForm.startDate)) /
                    86400000,
            ) + 1;

        return dayCount > 0 ? dayCount : 0;
    };

    const calculateStats = (slots) => {
        const total = slots.length;
        const available = slots.filter((s) => s.status === "available").length;
        const reserved = slots.filter((s) => s.status === "reserved").length;
        const blocked = slots.filter((s) => s.status === "blocked").length;
        const default_count = slots.filter((s) => s.is_default_time).length;
        setStats({
            total,
            available,
            reserved,
            blocked,
            default: default_count,
            custom: total - default_count,
        });
    };

    // ── Data fetching ──────────────────────────────────────────────────────────

    const fetchTimeSlots = async () => {
        try {
            setLoading(true);
            const response = await axios.get(route("ourtimeslots.get"), {
                params: { date: formatDateKey(selectedDate) },
            });

            if (response.data.success) {
                const slotsWithEdit = response.data.slots.map((slot) => ({
                    ...slot,
                    isEditing: false,
                    formatted_start:
                        slot.formatted_start || formatTime(slot.start_time),
                }));
                setTimeSlots(slotsWithEdit);
                setCustomStartTime(response.data.current_start);
                setCustomEndTime(
                    response.data.current_end ||
                        slotsWithEdit[slotsWithEdit.length - 1]?.end_time ||
                        defaultEndTime,
                );
                setCustomStartInfo(response.data.custom_start_info);
                calculateStats(slotsWithEdit);
            }
        } catch (error) {
            console.error("Error fetching time slots:", error);
            toast.error("Failed to load time slots");
        } finally {
            setLoading(false);
        }
    };

    // ── Navigation ─────────────────────────────────────────────────────────────

    const handlePreviousDay = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - 1);
        setSelectedDate(d);
        setCalendarMonth(startOfMonth(d));
    };

    const handleNextDay = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + 1);
        setSelectedDate(d);
        setCalendarMonth(startOfMonth(d));
    };

    const handleToday = () => {
        const today = new Date();
        setSelectedDate(today);
        setCalendarMonth(startOfMonth(today));
    };
    const handleDateSelect = (date) => {
        if (date) {
            setSelectedDate(date);
            setCalendarMonth(startOfMonth(date));
        }
    };

    // ── Reset ──────────────────────────────────────────────────────────────────

    const handleOpenRangeModal = () => {
        const selectedDateKey = formatDateKey(selectedDate);
        setRangeForm({
            startDate: selectedDateKey,
            endDate: selectedDateKey,
            startTime: customStartTime || defaultStartTime,
            endTime: customEndTime || defaultEndTime,
        });
        setShowRangeModal(true);
    };

    const handleRangeFormChange = (event) => {
        const { name, value } = event.target;
        setRangeForm((current) => ({ ...current, [name]: value }));
    };

    const handleApplyRangeSchedule = async (event) => {
        event.preventDefault();

        if (!rangeForm.startDate || !rangeForm.endDate) {
            toast.error("Please choose both dates");
            return;
        }

        if (rangeForm.endDate < rangeForm.startDate) {
            toast.error("End date must be on or after start date");
            return;
        }

        const minutesFromStart =
            timeToMinutes(rangeForm.endTime) -
            timeToMinutes(rangeForm.startTime);

        if (timeToMinutes(rangeForm.startTime) < timeToMinutes(defaultStartTime)) {
            toast.error("Start time cannot be earlier than 7:00 AM");
            return;
        }

        if (minutesFromStart < 20) {
            toast.error("End time must be at least 20 minutes after start time");
            return;
        }

        if (minutesFromStart % 20 !== 0) {
            toast.error("Schedule must align with 20-minute slots");
            return;
        }

        try {
            setRangeSubmitting(true);
            const response = await axios.post(
                route("ourtimeslots.update-range"),
                {
                    start_date: rangeForm.startDate,
                    end_date: rangeForm.endDate,
                    start_time: rangeForm.startTime,
                    end_time: rangeForm.endTime,
                },
            );

            if (response.data.success) {
                setShowRangeModal(false);
                toast.success(response.data.message || "Date range updated");
                await fetchTimeSlots();
                await refreshCalendarAfterScheduleChange();
            }
        } catch (error) {
            console.error("Error updating date range:", error);
            toast.error(
                error.response?.data?.message ||
                    "Failed to update the date range",
            );
        } finally {
            setRangeSubmitting(false);
        }
    };

    const handleResetToDefault = async () => {
        if (
            !confirm(
                "Reset ALL slots for this date to the default 7:00 AM schedule?",
            )
        )
            return;

        try {
            setLoading(true);
            const response = await axios.post(route("ourtimeslots.reset"), {
                date: formatDateKey(selectedDate),
            });

            if (response.data.success) {
                setCustomStartTime(defaultStartTime);
                setCustomEndTime(defaultEndTime);
                toast.success("Reset to default schedule");
                await fetchTimeSlots();
                await refreshCalendarAfterScheduleChange();
            }
        } catch (error) {
            console.error("Error resetting:", error);
            toast.error("Failed to reset time slots");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEndTime = async () => {
        if (!customEndTime) {
            toast.error("Please choose an end time");
            return;
        }

        const firstStart = timeSlots[0]?.start_time || defaultStartTime;
        const minutesFromStart =
            timeToMinutes(customEndTime) - timeToMinutes(firstStart);

        if (minutesFromStart < 20) {
            toast.error("End time must be at least 20 minutes after start time");
            return;
        }

        if (minutesFromStart % 20 !== 0) {
            toast.error("End time must align with 20-minute slots");
            return;
        }

        if (
            !window.confirm(
                `Update this date's schedule to end at ${formatTime(customEndTime)}?`,
            )
        ) {
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(route("ourtimeslots.update-end"), {
                date: formatDateKey(selectedDate),
                end_time: customEndTime,
            });

            if (response.data.success) {
                const updatedSlots = response.data.slots.map((s) => ({
                    ...s,
                    isEditing: false,
                    formatted_start:
                        s.formatted_start || formatTime(s.start_time),
                }));

                setTimeSlots(updatedSlots);
                setCustomStartTime(response.data.current_start);
                setCustomEndTime(response.data.current_end);
                calculateStats(updatedSlots);
                toast.success(response.data.message || "End time updated");
                await refreshCalendarAfterScheduleChange();
            }
        } catch (error) {
            console.error("Error updating end time:", error);
            toast.error(
                error.response?.data?.message ||
                    "Failed to update schedule end time",
            );
        } finally {
            setLoading(false);
        }
    };

    // ── Slot editing ───────────────────────────────────────────────────────────

    const handleSlotClick = (slot, index) => {
        if (slot.status !== "available") {
            toast.error("Cannot edit reserved or blocked slots");
            return;
        }

        // Close any other open editor first
        const updated = timeSlots.map((s) => ({ ...s, isEditing: false }));
        updated[index] = { ...slot, isEditing: true };
        setTimeSlots(updated);
        setEditingIndex(index);

        setTimeout(() => {
            if (inputRefs.current[index]) inputRefs.current[index].focus();
        }, 100);
    };

    const cancelEditing = (index) => {
        const updated = [...timeSlots];
        if (updated[index]) {
            updated[index] = { ...updated[index], isEditing: false };
            setTimeSlots(updated);
        }
        setEditingIndex(null);
    };

    const handleTimeEditBlur = (e, slot, index) =>
        handleTimeEditSubmit(e, slot, index);
    const handleTimeEditKeyPress = (e, slot, index) => {
        if (e.key === "Enter") handleTimeEditSubmit(e, slot, index);
        if (e.key === "Escape") cancelEditing(index);
    };

    const handleTimeEditSubmit = async (e, slot, index) => {
        const newTime = e.target.value;

        if (!newTime) {
            cancelEditing(index);
            return;
        }

        // Basic format validation
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(newTime)) {
            toast.error("Please enter a valid time (HH:MM)");
            cancelEditing(index);
            return;
        }

        // Range validation
        const timeValue = timeToMinutes(newTime);
        const maxSlotStart = timeToMinutes(customEndTime) - 20;
        if (timeValue < timeToMinutes(defaultStartTime) || timeValue > maxSlotStart) {
            toast.error(
                `Time must be between 7:00 AM and ${formatTime(
                    `${String(Math.floor(maxSlotStart / 60)).padStart(2, "0")}:${String(
                        maxSlotStart % 60,
                    ).padStart(2, "0")}`,
                )}`,
            );
            cancelEditing(index);
            return;
        }

        // Confirm — show how many slots will shift in each direction
        const slotsBefore = index;
        const slotsAfter = timeSlots.length - index - 1;
        const confirmMessage =
            `Changing this slot to ${newTime} will adjust:\n` +
            `• ${slotsBefore} earlier slot(s) backward\n` +
            `• ${slotsAfter} later slot(s) forward\n\n` +
            `All free slots will maintain 20-minute intervals. Continue?`;

        if (!window.confirm(confirmMessage)) {
            cancelEditing(index);
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                route("ourtimeslots.update-single-with-subsequent"),
                {
                    date: formatDateKey(selectedDate),
                    start_index: index,
                    new_start_time: newTime,
                },
            );

            if (response.data.success) {
                toast.success(`Slots updated around ${newTime}`);

                const updatedSlots = response.data.slots.map((s) => ({
                    ...s,
                    isEditing: false,
                    formatted_start:
                        s.formatted_start || formatTime(s.start_time),
                }));

                setTimeSlots(updatedSlots);
                calculateStats(updatedSlots);
                setEditingIndex(null);

                if (response.data.custom_start_info)
                    setCustomStartInfo(response.data.custom_start_info);
                if (response.data.current_start)
                    setCustomStartTime(response.data.current_start);
                if (response.data.current_end)
                    setCustomEndTime(response.data.current_end);
                await refreshCalendarAfterScheduleChange();
            } else {
                throw new Error(
                    response.data.message || "Failed to update slots",
                );
            }
        } catch (error) {
            console.error("Error updating time slots:", error);
            toast.error(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to update time slots",
            );
            cancelEditing(index);
        } finally {
            setLoading(false);
        }
    };

    // ── Status badge ───────────────────────────────────────────────────────────

    const getStatusBadge = (status) => {
        const map = {
            available: "bg-green-100 text-green-800",
            reserved: "bg-blue-100 text-blue-800",
            blocked: "bg-red-100 text-red-800",
        };
        const cls = map[status] || "bg-gray-100 text-gray-800";
        const label = status.charAt(0).toUpperCase() + status.slice(1);
        return (
            <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${cls}`}
            >
                {label}
            </span>
        );
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <>
            <Wrapper>
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

                <div className="px-2 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col gap-4 p-6 sm:p-8 mb-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                Time Management
                            </h1>
                            <p className="text-sm text-gray-500">
                                Fine-tune one day or apply a schedule across a
                                date range.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            {packages.length > 0 && (
                                <label
                                    htmlFor="time-management-package-selector"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Lesson Type
                                    <div className="relative mt-1">
                                        <Package className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <select
                                            id="time-management-package-selector"
                                            value={activePrice?.id || ""}
                                            onChange={(event) => {
                                                const next = packages.find(
                                                    (pkg) =>
                                                        pkg.id ===
                                                        Number(event.target.value),
                                                );
                                                setActivePrice(next || null);
                                            }}
                                            className="w-full min-w-52 appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-8 text-sm text-gray-900 shadow-sm transition focus:border-emerald-500 focus:ring-emerald-500"
                                        >
                                            {Object.entries(groupedPackages).map(
                                                ([category, options]) => (
                                                    <optgroup
                                                        key={category}
                                                        label={category}
                                                    >
                                                        {options.map((pkg) => (
                                                            <option
                                                                key={pkg.id}
                                                                value={pkg.id}
                                                            >
                                                                {getPackageLabel(
                                                                    pkg,
                                                                )}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                ),
                                            )}
                                        </select>
                                    </div>
                                </label>
                            )}
                            <button
                                onClick={handleOpenRangeModal}
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                            >
                                <CalendarRange size={18} />
                                Set Date Range
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* ── Calendar ── */}
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
                                month={calendarMonth}
                                onMonthChange={(month) =>
                                    setCalendarMonth(startOfMonth(month))
                                }
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                disabled={(date) => isPastDate(date)}
                                fixedWeeks
                                modifiers={{
                                    unavailable: (date) => {
                                        const day =
                                            availabilitySummary[
                                                formatDateKey(date)
                                            ];
                                        return (
                                            !isPastDate(date) &&
                                            Boolean(day) &&
                                            day.status !== "available"
                                        );
                                    },
                                    available: (date) =>
                                        !isPastDate(date) &&
                                        availabilitySummary[
                                            formatDateKey(date)
                                        ]?.status ===
                                            "available",
                                }}
                                modifiersClassNames={{
                                    unavailable:
                                        "relative after:pointer-events-none after:absolute after:bottom-1 after:left-1/2 after:z-10 after:h-1 after:w-4 after:-translate-x-1/2 after:rounded-full after:bg-red-500",
                                    available:
                                        "relative after:pointer-events-none after:absolute after:bottom-1 after:left-1/2 after:z-10 after:h-1 after:w-4 after:-translate-x-1/2 after:rounded-full after:bg-emerald-500",
                                }}
                                captionLayout="dropdown"
                                className="rounded-md border [&_.rdp-day_selected]:bg-emerald-600 [&_.rdp-day_selected]:text-white [&_.rdp-day_selected:hover]:bg-emerald-700 [&_.rdp-button:hover]:bg-emerald-50 [&_.rdp-day_today]:bg-gray-100"
                                fromYear={new Date().getFullYear()}
                                toYear={new Date().getFullYear() + 8}
                                formatters={{
                                    formatMonthCaption: (d) =>
                                        d.toLocaleString("default", {
                                            month: "long",
                                        }),
                                    formatYearCaption: (d) =>
                                        d.getFullYear().toString(),
                                }}
                            />
                            <div className="mt-4 flex flex-wrap gap-3 border-t border-gray-100 pt-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-1.5 w-4 rounded-full bg-emerald-500" />
                                    <span>Bookable for selected lesson</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-1.5 w-4 rounded-full bg-red-500" />
                                    <span>No bookable lesson times</span>
                                </div>
                            </div>
                        </div>

                        {/* ── Slots grid ── */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        Time Slots for{" "}
                                        {formatDisplayDate(selectedDate)}
                                    </h2>
                                    <div className="flex flex-wrap items-end gap-3">
                                        <label className="text-sm font-medium text-gray-700">
                                            End time
                                            <input
                                                type="time"
                                                value={customEndTime}
                                                step="1200"
                                                onChange={(e) =>
                                                    setCustomEndTime(
                                                        e.target.value,
                                                    )
                                                }
                                                className="mt-1 block w-32 rounded-md border-gray-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </label>
                                        <button
                                            onClick={handleUpdateEndTime}
                                            disabled={loading}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                        >
                                            <Clock size={16} />
                                            Update End
                                        </button>
                                        <button
                                            onClick={handleResetToDefault}
                                            disabled={loading}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            Reset to Default
                                        </button>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
                                        <p className="text-gray-600 mt-4">
                                            Loading time slots…
                                        </p>
                                    </div>
                                ) : timeSlots.length > 0 ? (
                                    <div>
                                        {/* Custom-start divider */}
                                        {customStartInfo &&
                                            customStartInfo.index !==
                                                undefined && (
                                                <div className="relative mb-4">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t-2 border-dashed border-blue-300" />
                                                    </div>
                                                    <div className="relative flex justify-center">
                                                        <span className="bg-white px-3 py-1 text-xs font-medium text-blue-600 rounded-full border border-blue-300">
                                                            Custom schedule
                                                            starts here ↓
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                        {/* Slot cards */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                            {timeSlots.map((slot, index) => (
                                                <div
                                                    key={`${formatDateKey(selectedDate)}-${index}-${slot.start_time}`}
                                                    className={`p-3 rounded-lg border-2 relative transition-all hover:shadow-md
                                                        ${
                                                            slot.status ===
                                                            "available"
                                                                ? "border-green-200 bg-green-50 hover:border-green-400 cursor-pointer"
                                                                : slot.status ===
                                                                    "reserved"
                                                                  ? "border-blue-200 bg-blue-50 cursor-not-allowed opacity-75"
                                                                  : slot.status ===
                                                                      "blocked"
                                                                    ? "border-red-200 bg-red-50 cursor-not-allowed opacity-75"
                                                                    : "border-gray-200 bg-gray-50"
                                                        }
                                                        ${!slot.is_default_time ? "ring-2 ring-purple-200" : ""}`}
                                                    onClick={() =>
                                                        slot.status ===
                                                            "available" &&
                                                        !slot.isEditing &&
                                                        handleSlotClick(
                                                            slot,
                                                            index,
                                                        )
                                                    }
                                                >
                                                    {/* Custom-start dot marker */}
                                                    {customStartInfo &&
                                                        customStartInfo.index ===
                                                            index && (
                                                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
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
                                                                defaultValue={slot.start_time.substring(
                                                                    0,
                                                                    5,
                                                                )}
                                                                step="300"
                                                                className="w-full px-2 py-1 text-sm border border-emerald-500 rounded focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                                                ref={(el) =>
                                                                    (inputRefs.current[
                                                                        index
                                                                    ] = el)
                                                                }
                                                                onBlur={(e) =>
                                                                    handleTimeEditBlur(
                                                                        e,
                                                                        slot,
                                                                        index,
                                                                    )
                                                                }
                                                                onKeyDown={(
                                                                    e,
                                                                ) =>
                                                                    handleTimeEditKeyPress(
                                                                        e,
                                                                        slot,
                                                                        index,
                                                                    )
                                                                }
                                                            />
                                                            <div className="mt-1 text-[10px] text-emerald-600 font-medium">
                                                                Enter to save ·
                                                                Esc to cancel
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="text-sm font-medium text-gray-900 mb-1">
                                                                {slot.formatted_start ||
                                                                    formatTime(
                                                                        slot.start_time,
                                                                    )}
                                                            </div>
                                                            <div>
                                                                {getStatusBadge(
                                                                    slot.status,
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Clock
                                            size={48}
                                            className="mx-auto text-gray-400 mb-4"
                                        />
                                        <p className="text-gray-500 text-lg">
                                            No time slots available for this
                                            date
                                        </p>
                                        <p className="text-gray-400 text-sm mt-2">
                                            Try selecting a different date
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {showRangeModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="date-range-schedule-title"
                        onMouseDown={(event) => {
                            if (
                                event.target === event.currentTarget &&
                                !rangeSubmitting
                            ) {
                                setShowRangeModal(false);
                            }
                        }}
                    >
                        <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
                            <div className="flex items-start justify-between border-b border-gray-100 px-5 py-5 sm:px-6">
                                <div>
                                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                        <CalendarRange size={20} />
                                    </div>
                                    <h2
                                        id="date-range-schedule-title"
                                        className="text-xl font-semibold text-gray-900"
                                    >
                                        Set a date-range schedule
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Apply the same opening hours to several
                                        days at once.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowRangeModal(false)}
                                    disabled={rangeSubmitting}
                                    aria-label="Close date-range schedule"
                                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form
                                onSubmit={handleApplyRangeSchedule}
                                className="space-y-5 px-5 py-5 sm:px-6"
                            >
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Start date
                                        <input
                                            type="date"
                                            name="startDate"
                                            min={formatDateKey(new Date())}
                                            value={rangeForm.startDate}
                                            onChange={handleRangeFormChange}
                                            required
                                            className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </label>
                                    <label className="text-sm font-medium text-gray-700">
                                        End date
                                        <input
                                            type="date"
                                            name="endDate"
                                            min={
                                                rangeForm.startDate ||
                                                formatDateKey(new Date())
                                            }
                                            value={rangeForm.endDate}
                                            onChange={handleRangeFormChange}
                                            required
                                            className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </label>
                                </div>

                                <div className="rounded-xl bg-emerald-50 p-4">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-900">
                                        <Clock size={16} />
                                        Daily opening hours
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <label className="text-sm font-medium text-emerald-900">
                                            Start time
                                            <input
                                                type="time"
                                                name="startTime"
                                                min={defaultStartTime}
                                                step="1200"
                                                value={rangeForm.startTime}
                                                onChange={
                                                    handleRangeFormChange
                                                }
                                                required
                                                className="mt-1 block w-full rounded-lg border-emerald-200 bg-white text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </label>
                                        <label className="text-sm font-medium text-emerald-900">
                                            End time
                                            <input
                                                type="time"
                                                name="endTime"
                                                step="1200"
                                                value={rangeForm.endTime}
                                                onChange={
                                                    handleRangeFormChange
                                                }
                                                required
                                                className="mt-1 block w-full rounded-lg border-emerald-200 bg-white text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                                    This replaces day-specific custom schedules
                                    for{" "}
                                    <span className="font-semibold">
                                        {getRangeDayCount()} selected day(s)
                                    </span>
                                    . Existing reservations are protected and
                                    will stop the update if they fall outside
                                    the new hours.
                                </div>

                                <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowRangeModal(false)
                                        }
                                        disabled={rangeSubmitting}
                                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={
                                            rangeSubmitting ||
                                            getRangeDayCount() === 0
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                                    >
                                        <CalendarRange size={17} />
                                        {rangeSubmitting
                                            ? "Applying schedule..."
                                            : `Apply to ${getRangeDayCount()} day(s)`}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </Wrapper>
        </>
    );
};

export default TimeManagement;
