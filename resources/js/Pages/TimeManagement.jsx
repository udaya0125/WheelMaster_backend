
import Wrapper from "@/AdminWrapper/Wrapper";
import { Calendar } from "@/components/ui/calendar";
import { Clock } from "lucide-react";
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

    // ── Helpers ────────────────────────────────────────────────────────────────

    const formatDateKey = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    const formatTime = (timeString) => {
        if (!timeString) return "";
        const [hours, minutes] = timeString.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
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
    };

    const handleNextDay = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + 1);
        setSelectedDate(d);
    };

    const handleToday = () => setSelectedDate(new Date());
    const handleDateSelect = (date) => {
        if (date) setSelectedDate(date);
    };

    // ── Reset ──────────────────────────────────────────────────────────────────

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
                toast.success("Reset to default schedule");
                await fetchTimeSlots();
            }
        } catch (error) {
            console.error("Error resetting:", error);
            toast.error("Failed to reset time slots");
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
        const timeValue = parseInt(newTime.replace(":", ""));
        if (timeValue < 700 || timeValue > 1800) {
            toast.error("Time must be between 7:00 AM and 6:00 PM");
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

    // ── Calendar day renderer ──────────────────────────────────────────────────

    const renderDayContent = (date) => {
        const isPast = isPastDate(date);
        return (
            <div className="relative">
                <span className={isPast ? "text-gray-400" : ""}>
                    {date.getDate()}
                </span>
                {!isPast && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                )}
            </div>
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
                    <div className="p-6 sm:p-8 mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                            Time Management
                        </h1>
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
                                    formatMonthCaption: (d) =>
                                        d.toLocaleString("default", {
                                            month: "long",
                                        }),
                                    formatYearCaption: (d) =>
                                        d.getFullYear().toString(),
                                }}
                            />
                        </div>

                        {/* ── Slots grid ── */}
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
            </Wrapper>
        </>
    );
};

export default TimeManagement;
