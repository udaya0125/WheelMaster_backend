import Wrapper from "@/AdminWrapper/Wrapper";
import { Calendar } from "@/components/ui/calendar";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Package, X, Lock, Unlock, CalendarCheck } from "lucide-react";
import AddReservationForm from "@/AddFormComponent/AddReservationForm";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pad = (n) => String(n).padStart(2, "0");

const formatDateKey = (date) => {
    if (!date) return "";
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
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

const dateKeyToDate = (dateKey) => {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(year, month - 1, day);
};

const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
};

// ─── Time / duration helpers ──────────────────────────────────────────────────

const parseDuration = (durationString) => {
    if (!durationString) return 60;
    const s = durationString.trim().toLowerCase();
    const hourMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:hrs|hr|hour|hours)/);
    const minMatch  = s.match(/(\d+)\s*(?:min|mins|minute|minutes)/);
    let total = 0;
    if (hourMatch) total += parseFloat(hourMatch[1]) * 60;
    if (minMatch)  total += parseInt(minMatch[1]);
    if (total === 0) {
        const numMatch = s.match(/(\d+(?:\.\d+)?)/);
        if (numMatch) {
            const n = parseFloat(numMatch[1]);
            total = n < 10 ? Math.round(n * 60) : Math.round(n);
        }
    }
    return total || 60;
};

/** "08:00" or "08:00:00" → minutes since midnight */
const timeToMinutes = (t) => {
    if (!t) return NaN;
    const parts = String(t).split(":");
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
};

/** minutes since midnight → "HH:MM" */
const minutesToTime = (m) =>
    `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** Normalise "08:00:00" → "08:00" */
const hhmm = (t) => {
    if (!t) return "";
    const parts = String(t).split(":");
    return `${parts[0]}:${parts[1]}`;
};

const calculateEndTime = (startTime, durationString) => {
    const durationMinutes = parseDuration(durationString);
    const clean = hhmm(typeof startTime === "object" ? startTime.start_time : startTime);
    const [h, m] = clean.split(":").map(Number);
    const total = h * 60 + m + durationMinutes;
    return minutesToTime(total);
};

const getTimeSlotDisplay = (startTime, duration) => {
    const start = hhmm(typeof startTime === "object" ? startTime.start_time : startTime);
    return `${start} - ${calculateEndTime(start, duration)}`;
};

const getWindowBounds = (windowStartStr, duration) => {
    const startMin = timeToMinutes(windowStartStr);
    return {
        startMin,
        endMin: startMin + parseDuration(duration),
    };
};

const blockBounds = (block) => ({
    startMin: timeToMinutes(hhmm(block.start_time)),
    endMin:   timeToMinutes(hhmm(block.end_time)),
});

const getExactBlocksForDuration = (blockRecords, duration) => {
    const durationMins = parseDuration(duration);

    return blockRecords.filter((block) => {
        const blockRange = blockBounds(block);
        return blockRange.endMin - blockRange.startMin === durationMins;
    });
};

const getExactBlockForWindow = (windowStartStr, blockRecords, duration) => {
    const { startMin, endMin } = getWindowBounds(windowStartStr, duration);

    return blockRecords.find((block) => {
        const blockRange = blockBounds(block);
        return blockRange.startMin === startMin && blockRange.endMin === endMin;
    });
};

const blocksCoverRange = (blockRecords, startTime, endTime) => {
    const rangeStart = timeToMinutes(hhmm(startTime));
    const rangeEnd   = timeToMinutes(hhmm(endTime));

    if (!Number.isFinite(rangeStart) || !Number.isFinite(rangeEnd) || rangeStart >= rangeEnd) {
        return false;
    }

    const ranges = blockRecords
        .map(blockBounds)
        .filter((range) => (
            Number.isFinite(range.startMin) &&
            Number.isFinite(range.endMin) &&
            range.startMin < rangeEnd &&
            range.endMin > rangeStart
        ))
        .sort((a, b) => a.startMin - b.startMin);

    let coveredUntil = rangeStart;

    for (const range of ranges) {
        if (range.startMin > coveredUntil) return false;
        coveredUntil = Math.max(coveredUntil, range.endMin);
        if (coveredUntil >= rangeEnd) return true;
    }

    return false;
};

// ─── Build display-slot grid ──────────────────────────────────────────────────

const buildDisplayGrid = (rawSlots, scheduleEndStr, duration, blockRecords = []) => {
    const durationMins    = parseDuration(duration);
    const bookingStepMins = durationMins + 20;

    const availableStartMins = (rawSlots || [])
        .filter((s) => s.status === "available")
        .map((s) => timeToMinutes(hhmm(s.start_time)))
        .filter(Number.isFinite)
        .sort((a, b) => a - b);

    const exactBlockStartMins = getExactBlocksForDuration(blockRecords, duration)
        .map((block) => blockBounds(block).startMin)
        .filter(Number.isFinite);

    if (availableStartMins.length === 0 && exactBlockStartMins.length === 0) return [];

    let scheduleEndMins;
    if (scheduleEndStr) {
        scheduleEndMins = timeToMinutes(hhmm(scheduleEndStr));
    } else {
        const lastEndTimes = (rawSlots || [])
            .map((s) => timeToMinutes(hhmm(s.end_time)))
            .filter(Number.isFinite);
        scheduleEndMins = lastEndTimes.length > 0
            ? Math.max(...lastEndTimes)
            : Math.max(...exactBlockStartMins) + bookingStepMins;
    }

    const latestStart = scheduleEndMins - bookingStepMins;

    const displaySlots = [];
    let candidate = availableStartMins[0];

    while (Number.isFinite(candidate) && candidate <= latestStart) {
        displaySlots.push(minutesToTime(candidate));
        const next = candidate + bookingStepMins;

        const hasNearby = availableStartMins.some((m) => m >= next && m < next + 20);
        if (hasNearby) {
            candidate = next;
        } else {
            const nextReal = availableStartMins.find((m) => m >= next);
            if (nextReal === undefined) break;
            candidate = nextReal;
        }
    }

    return Array.from(
        new Set([
            ...displaySlots,
            ...exactBlockStartMins.map(minutesToTime),
        ])
    ).sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
};

// ─── Status resolver for a display window ────────────────────────────────────

const resolveWindowStatus = (windowStartStr, rawSlots, blockRecords, duration) => {
    const durationMins = parseDuration(duration);
    const startMin     = timeToMinutes(windowStartStr);
    const endMin       = startMin + durationMins;

    if (getExactBlockForWindow(windowStartStr, blockRecords, duration)) return "blocked";

    const windowSlots = rawSlots.filter((s) => {
        const sm = timeToMinutes(hhmm(s.start_time));
        return sm >= startMin && sm < endMin;
    });
    const startingSlot = windowSlots.find(
        (s) => timeToMinutes(hhmm(s.start_time)) === startMin
    );

    if (windowSlots.some((s) => s.status === "reserved")) return "reserved";
    if (startingSlot?.status === "unavailable") return "unavailable";
    return "available";
};

// ─── Slot styling ─────────────────────────────────────────────────────────────

const getSlotStyle = (status) => {
    switch (status) {
        case "available":
            return "cursor-pointer border-gray-200 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-sm";
        case "blocked":
            return "cursor-pointer border-red-300 bg-red-50 text-red-600 hover:border-red-400 hover:bg-red-100";
        case "reserved":
            return "cursor-default border-emerald-300 bg-emerald-50 text-emerald-700";
        case "unavailable":
            return "cursor-default border-gray-200 bg-gray-100 text-gray-400";
        default:
            return "cursor-default border-gray-100 text-gray-400";
    }
};

// ─── Package selector helpers ─────────────────────────────────────────────────

const getPackageLabel = (pkg) =>
    pkg.duration ? `${pkg.duration} Lesson` : "Lesson";

// ─── Slot Action Modal ────────────────────────────────────────────────────────

const SlotActionModal = ({ slot, date, duration, onClose, onBlock, onUnblock, onReserve, isSubmitting }) => {
    const isBlocked   = slot.status === "blocked";
    const timeDisplay = getTimeSlotDisplay(slot.startTime, duration);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">
                            {formatDisplayDate(date)}
                        </p>
                        <h3 className="text-base font-semibold text-gray-900">{timeDisplay}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 disabled:opacity-40"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-5 py-4">
                    {isBlocked ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
                                <Lock size={14} className="text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-700">
                                    This time slot is currently blocked.
                                </p>
                            </div>
                            <button
                                onClick={onUnblock}
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-wait transition-colors"
                            >
                                <Unlock size={16} />
                                {isSubmitting ? "Unblocking..." : "Unblock This Slot"}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            <button
                                onClick={onBlock}
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-wait transition-colors"
                            >
                                <Lock size={16} />
                                {isSubmitting ? "Blocking..." : "Block This Time"}
                            </button>
                            <button
                                onClick={onReserve}
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                <CalendarCheck size={16} />
                                Add Reservation
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const BlockTime = ({ price, packageOptions = [] }) => {
    const [selectedDate, setSelectedDate]             = useState(new Date());
    const [calendarMonth, setCalendarMonth]           = useState(() => startOfMonth(new Date()));
    const [activePrice, setActivePrice]               = useState(price);
    const [rawSlotsCache, setRawSlotsCache]           = useState({});
    const [blockRecordsCache, setBlockRecordsCache]   = useState({});
    const [availabilitySummaryCache, setAvailabilitySummaryCache] = useState({});
    const [scheduleEndCache, setScheduleEndCache]     = useState({});
    const [loading, setLoading]                       = useState(false);
    const [activeSlot, setActiveSlot]                 = useState(null);
    const [isSubmitting, setIsSubmitting]             = useState(false);
    const [reservationInitial, setReservationInitial] = useState(null);

    // ── Bulk / range state ────────────────────────────────────────────────────
    const [showRangePanel, setShowRangePanel]         = useState(false);
    const [rangeStart, setRangeStart]                 = useState("");
    const [rangeEnd, setRangeEnd]                     = useState("");
    const [isRangeSubmitting, setIsRangeSubmitting]   = useState(false);

    // ── Packages ──────────────────────────────────────────────────────────────
    const packages = React.useMemo(() => {
        const map = new Map();
        [price, ...packageOptions].forEach((pkg) => {
            if (pkg?.id && pkg?.slug) map.set(pkg.id, pkg);
        });
        return Array.from(map.values());
    }, [price, packageOptions]);

    const groupedPackages = React.useMemo(
        () =>
            packages.reduce((g, pkg) => {
                const key = pkg.category || "Driving Lessons";
                if (!g[key]) g[key] = [];
                g[key].push(pkg);
                return g;
            }, {}),
        [packages]
    );

    const calendarRange = React.useMemo(
        () => getCalendarRangeForMonth(calendarMonth),
        [calendarMonth]
    );
    const calendarRangeKey = `${calendarRange.startDate}:${calendarRange.endDate}:${activePrice?.id || ""}`;
    const availabilitySummary = availabilitySummaryCache[calendarRangeKey] || {};

    const blockedCalendarDays = React.useMemo(
        () =>
            Object.entries(availabilitySummary)
                .filter(([, day]) => day?.status !== "available")
                .map(([date]) => dateKeyToDate(date))
                .filter((date) => !isPastDate(date)),
        [availabilitySummary]
    );

    const availableCalendarDays = React.useMemo(
        () =>
            Object.entries(availabilitySummary)
                .filter(([, day]) => day?.status === "available")
                .map(([date]) => dateKeyToDate(date))
                .filter((date) => !isPastDate(date)),
        [availabilitySummary]
    );

    const refreshAvailabilitySummary = async (force = false) => {
        if (!activePrice?.id) return;
        if (!force && availabilitySummaryCache[calendarRangeKey]) return;

        try {
            const res = await axios.get(route("ourtimeslots.availability-summary"), {
                params: {
                    start_date: calendarRange.startDate,
                    end_date: calendarRange.endDate,
                    price_id: activePrice.id,
                },
            });

            if (res.data.success) {
                setAvailabilitySummaryCache((prev) => ({
                    ...prev,
                    [calendarRangeKey]: res.data.data || {},
                }));
            }
        } catch {
            toast.error("Error loading calendar availability.");
        }
    };

    const refreshCalendarAfterMutation = async () => {
        setAvailabilitySummaryCache({});
        await refreshAvailabilitySummary(true);
    };

    useEffect(() => {
        refreshAvailabilitySummary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [calendarRangeKey, activePrice?.id]);

    const handlePackageChange = (e) => {
        const id   = Number(e.target.value);
        const next = packages.find((p) => p.id === id);
        if (!next || next.id === activePrice?.id) return;
        setActivePrice(next);
        setActiveSlot(null);
    };

    // ── Fetch raw slots for a date ────────────────────────────────────────────
    const fetchSlots = async (date) => {
        if (!date || !activePrice?.id) return;
        setLoading(true);
        const dateKey = formatDateKey(date);
        try {
            const res = await axios.get(route("ourtimeslots.get"), {
                params: { date: dateKey, price_id: activePrice.id },
            });
            if (res.data.success) {
                setRawSlotsCache((prev) => ({
                    ...prev,
                    [dateKey]: res.data.slots || [],
                }));
                setBlockRecordsCache((prev) => ({
                    ...prev,
                    [dateKey]: res.data.blocks || [],
                }));
                setScheduleEndCache((prev) => ({
                    ...prev,
                    [dateKey]: res.data.current_end || "",
                }));
            } else {
                toast.error("Error loading time slots. Please try again.");
            }
        } catch {
            toast.error("Error loading time slots. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlots(selectedDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePrice?.id, selectedDate]);

    const handleDateSelect = (date) => {
        if (!date) return;
        if (isPastDate(date)) {
            toast.error("Cannot select past dates", { icon: "⚠️" });
        } else {
            setSelectedDate(date);
            setCalendarMonth(startOfMonth(date));
        }
    };

    // ── Derived display data ──────────────────────────────────────────────────
    const dateKey     = selectedDate ? formatDateKey(selectedDate) : null;
    const rawSlots    = dateKey ? rawSlotsCache[dateKey]    || [] : [];
    const blockRecords = dateKey ? blockRecordsCache[dateKey] || [] : [];
    const scheduleEnd = dateKey ? scheduleEndCache[dateKey] || "" : "";

    const displaySlots = buildDisplayGrid(rawSlots, scheduleEnd, activePrice?.duration, blockRecords);
    const sortedBlockRecords = [...blockRecords].sort(
        (a, b) => timeToMinutes(hhmm(a.start_time)) - timeToMinutes(hhmm(b.start_time))
    );

    // ── Helpers: first/last raw slot times ────────────────────────────────────
    const getScheduleBounds = () => {
        if (!rawSlots.length) return { startTime: "07:00", endTime: "18:00", durationHrs: "11.00" };
        const firstRaw = rawSlots.reduce((a, b) =>
            timeToMinutes(hhmm(a.start_time)) < timeToMinutes(hhmm(b.start_time)) ? a : b
        );
        const lastRaw = rawSlots.reduce((a, b) =>
            timeToMinutes(hhmm(a.end_time)) > timeToMinutes(hhmm(b.end_time)) ? a : b
        );
        const startTime   = hhmm(firstRaw.start_time);
        const endTime     = hhmm(lastRaw.end_time);
        const durationHrs = ((timeToMinutes(endTime) - timeToMinutes(startTime)) / 60).toFixed(2);
        return { startTime, endTime, durationHrs };
    };

    // ── Bulk: block entire day ────────────────────────────────────────────────
    const handleBlockAllDay = async () => {
        if (!selectedDate || !rawSlots.length) return;
        setIsSubmitting(true);
        try {
            const dateStr = formatDateKey(selectedDate);
            const { startTime, endTime, durationHrs } = getScheduleBounds();

            await axios.post(route("ourblockreservations.store"), {
                start_date:   dateStr,
                end_date:     dateStr,
                start_time:   startTime,
                end_time:     endTime,
                duration:     durationHrs,
                reason:       "Full day blocked by admin",
                block_action: "block_time",
            });

            toast.success("Entire day blocked.");
            await fetchSlots(selectedDate);
            await refreshCalendarAfterMutation();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to block day.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Bulk: unblock entire day ──────────────────────────────────────────────
    const handleUnblockAllDay = async () => {
        if (!selectedDate || !rawSlots.length) return;
        setIsSubmitting(true);
        try {
            const { startTime, endTime } = getScheduleBounds();
            const blockIds = blockRecords.map((block) => block.id);

            if (blockIds.length === 0) {
                toast.error("No block records found for this day.");
                return;
            }

            if (!blocksCoverRange(blockRecords, startTime, endTime)) {
                toast.error("Block records do not cover the full day.");
                return;
            }

            await Promise.all(
                blockIds.map((id) =>
                    axios.delete(route("ourblockreservations.destroy", { id }))
                )
            );

            toast.success("Entire day unblocked.");
            await fetchSlots(selectedDate);
            await refreshCalendarAfterMutation();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to unblock day.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Bulk: block a date range ──────────────────────────────────────────────
    const handleBlockRange = async () => {
        if (!rangeStart || !rangeEnd) {
            toast.error("Please select both start and end dates.");
            return;
        }
        setIsRangeSubmitting(true);
        try {
            const { startTime, endTime, durationHrs } = getScheduleBounds();

            await axios.post(route("ourblockreservations.store"), {
                start_date:   rangeStart,
                end_date:     rangeEnd,
                start_time:   startTime,
                end_time:     endTime,
                duration:     durationHrs,
                reason:       "Date range blocked by admin",
                block_action: "block_time",
            });

            toast.success("Date range blocked successfully.");
            setShowRangePanel(false);
            setRangeStart("");
            setRangeEnd("");
            await fetchSlots(selectedDate);
            await refreshCalendarAfterMutation();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to block date range.");
        } finally {
            setIsRangeSubmitting(false);
        }
    };

    // ── Derived: is day fully blocked? ────────────────────────────────────────
    const isDayFullyBlocked = (() => {
        if (displaySlots.length === 0 || blockRecords.length === 0) return false;
        const { startTime, endTime } = getScheduleBounds();
        return blocksCoverRange(blockRecords, startTime, endTime);
    })();

    // ── Single slot: block ────────────────────────────────────────────────────
    const handleBlockSlot = async () => {
        if (!activeSlot || !selectedDate || !activePrice?.id) return;
        setIsSubmitting(true);
        try {
            const dateStr      = formatDateKey(selectedDate);
            const startTime    = activeSlot.startTime;
            const endTime      = calculateEndTime(startTime, activePrice?.duration);
            const durationMins = parseDuration(activePrice?.duration);

            await axios.post(route("ourblockreservations.store"), {
                start_date:   dateStr,
                end_date:     dateStr,
                start_time:   startTime,
                end_time:     endTime,
                duration:     (durationMins / 60).toFixed(2),
                reason:       "Blocked by admin",
                block_action: "block_time",
            });

            toast.success("Time slot blocked.");
            setActiveSlot(null);
            await fetchSlots(selectedDate);
            await refreshCalendarAfterMutation();
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to block. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Single slot: unblock ──────────────────────────────────────────────────
    const handleUnblockSlot = async () => {
        if (!activeSlot || !selectedDate) return;
        setIsSubmitting(true);
        try {
            const exactBlock = getExactBlockForWindow(
                activeSlot.startTime,
                blockRecords,
                activePrice?.duration
            );

            if (!exactBlock) {
                toast.error("No block records found for this slot.");
                setIsSubmitting(false);
                return;
            }

            await axios.delete(route("ourblockreservations.destroy", { id: exactBlock.id }));

            toast.success("Time slot unblocked.");
            setActiveSlot(null);
            await fetchSlots(selectedDate);
            await refreshCalendarAfterMutation();
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to unblock. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSlotClick = (timeStr, status) => {
        if (status === "reserved" || status === "unavailable") return;
        setActiveSlot({ startTime: timeStr, status });
    };

    const handleReserveSlot = () => {
        if (!activeSlot || !selectedDate || !activePrice?.id) return;

        setReservationInitial({
            price_id:         activePrice.id,
            reservation_date: formatDateKey(selectedDate),
            start_time:       activeSlot.startTime,
            end_time:         calculateEndTime(activeSlot.startTime, activePrice?.duration),
        });
        setActiveSlot(null);
    };

    const handleReservationSuccess = async () => {
        setReservationInitial(null);
        toast.success("Reservation added.");
        await fetchSlots(selectedDate);
        await refreshCalendarAfterMutation();
    };

    // ── Schedule bounds hint for the range panel ──────────────────────────────
    const scheduleBoundsHint = React.useMemo(() => {
        if (!rawSlots.length) return "07:00 – 18:00";
        const { startTime, endTime } = getScheduleBounds();
        return `${startTime} – ${endTime}`;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rawSlots]);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <Wrapper>
            <div className="lg:p-4">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style:   { background: "#363636", color: "#fff" },
                    success: { duration: 3000, style: { background: "#10b981", color: "#fff" } },
                    error:   { duration: 4000, style: { background: "#ef4444", color: "#fff" } },
                }}
            />

            {activeSlot && (
                <SlotActionModal
                    slot={activeSlot}
                    date={selectedDate}
                    duration={activePrice?.duration}
                    onClose={() => !isSubmitting && setActiveSlot(null)}
                    onBlock={handleBlockSlot}
                    onUnblock={handleUnblockSlot}
                    onReserve={handleReserveSlot}
                    isSubmitting={isSubmitting}
                />
            )}

            <AddReservationForm
                isOpen={Boolean(reservationInitial)}
                initialData={reservationInitial}
                onClose={() => setReservationInitial(null)}
                onSuccess={handleReservationSuccess}
            />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

                {/* ── Calendar ── */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-1">
                    <div className="mb-4">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                            Select a Date
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500">
                            Time zone: Australian Western Standard Time (GMT+8)
                        </p>
                    </div>
                    <Calendar
                        mode="single"
                        month={calendarMonth}
                        onMonthChange={(month) => setCalendarMonth(startOfMonth(month))}
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={isPastDate}
                        fixedWeeks
                        modifiers={{
                            unavailable: blockedCalendarDays,
                            available: availableCalendarDays,
                        }}
                        modifiersClassNames={{
                            unavailable: "relative after:pointer-events-none after:absolute after:bottom-1 after:left-1/2 after:z-10 after:h-1 after:w-4 after:-translate-x-1/2 after:rounded-full after:bg-red-500",
                            available: "relative after:pointer-events-none after:absolute after:bottom-1 after:left-1/2 after:z-10 after:h-1 after:w-4 after:-translate-x-1/2 after:rounded-full after:bg-emerald-500",
                        }}
                        className="rounded-md border
                            [&_.rdp-day_selected]:!bg-indigo-600
                            [&_.rdp-day_selected]:!text-white
                            [&_.rdp-day_selected:hover]:!bg-indigo-700
                            [&_.rdp-day_disabled]:!bg-transparent
                            [&_.rdp-day_disabled]:!text-gray-300
                            [&_.rdp-day_disabled]:cursor-not-allowed"
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

                {/* ── Time Slots panel ── */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-2">

                    {/* Package selector */}
                    {packages.length > 1 && (
                        <div className="mb-5">
                            <label
                                htmlFor="block-package-selector"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Lesson Type
                            </label>
                            <div className="relative">
                                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                <select
                                    id="block-package-selector"
                                    value={activePrice?.id || ""}
                                    onChange={handlePackageChange}
                                    className="w-full appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3 pl-10 pr-10 transition disabled:opacity-60 disabled:cursor-wait"
                                >
                                    {Object.entries(groupedPackages).map(([cat, opts]) => (
                                        <optgroup key={cat} label={cat}>
                                            {opts.map((pkg) => (
                                                <option key={pkg.id} value={pkg.id}>
                                                    {getPackageLabel(pkg)}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Panel header + bulk action buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-1">
                        <div>
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                                Time Slots
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500">
                                {formatDisplayDate(selectedDate)}
                            </p>
                        </div>

                        {!loading && displaySlots.length > 0 && (
                            <div className="flex flex-wrap gap-2 shrink-0">
                                {isDayFullyBlocked ? (
                                    <button
                                        onClick={handleUnblockAllDay}
                                        disabled={isSubmitting}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-wait transition-colors"
                                    >
                                        <Unlock size={13} />
                                        {isSubmitting ? "Unblocking..." : "Unblock All Day"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleBlockAllDay}
                                        disabled={isSubmitting}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-wait transition-colors"
                                    >
                                        <Lock size={13} />
                                        {isSubmitting ? "Blocking..." : "Block All Day"}
                                    </button>
                                )}

                                <button
                                    onClick={() => {
                                        setShowRangePanel((v) => !v);
                                        setRangeStart("");
                                        setRangeEnd("");
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                                        showRangePanel
                                            ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                                            : "bg-white border-gray-300 text-gray-700 hover:border-indigo-300 hover:text-indigo-600"
                                    }`}
                                >
                                    <CalendarCheck size={13} />
                                    Block Date Range
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Date range block panel */}
                    {showRangePanel && (
                        <div className="mt-3 mb-2 p-4 rounded-xl border border-indigo-100 bg-indigo-50">
                            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-3">
                                Block a Date Range
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        From
                                    </label>
                                    <input
                                        type="date"
                                        value={rangeStart}
                                        min={formatDateKey(new Date())}
                                        onChange={(e) => setRangeStart(e.target.value)}
                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        To
                                    </label>
                                    <input
                                        type="date"
                                        value={rangeEnd}
                                        min={rangeStart || formatDateKey(new Date())}
                                        onChange={(e) => setRangeEnd(e.target.value)}
                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <button
                                        onClick={handleBlockRange}
                                        disabled={isRangeSubmitting || !rangeStart || !rangeEnd}
                                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-wait transition-colors whitespace-nowrap"
                                    >
                                        <Lock size={14} />
                                        {isRangeSubmitting ? "Blocking..." : "Block Range"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowRangePanel(false);
                                            setRangeStart("");
                                            setRangeEnd("");
                                        }}
                                        className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-lg hover:bg-white transition-colors whitespace-nowrap"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-indigo-600 mt-2.5">
                                Uses today's schedule hours ({scheduleBoundsHint}) as the block window for all selected dates.
                            </p>
                        </div>
                    )}

                    {sortedBlockRecords.length > 0 && (
                        <div className="mt-3 mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <p className="text-xs font-semibold uppercase tracking-wider text-red-700">
                                    Blocked times
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {sortedBlockRecords.map((block) => (
                                        <span
                                            key={block.id}
                                            className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700"
                                        >
                                            {hhmm(block.start_time)} - {hhmm(block.end_time)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-4 mb-4 mt-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-sm border-2 border-gray-300" />
                            <span>Available - click to block or reserve</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-sm bg-red-100 border border-red-300" />
                            <span>Blocked - click to unblock</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-300" />
                            <span>Reserved</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200" />
                            <span>Unavailable for this lesson</span>
                        </div>
                    </div>

                    {/* Slots grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                            <p className="text-gray-500 text-sm mt-3">Loading time slots...</p>
                        </div>
                    ) : displaySlots.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                            {displaySlots.map((timeStr, index) => {
                                const status    = resolveWindowStatus(timeStr, rawSlots, blockRecords, activePrice?.duration);
                                const clickable = status === "available" || status === "blocked";
                                return (
                                    <div
                                        key={index}
                                        onClick={() => clickable && handleSlotClick(timeStr, status)}
                                        className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg border-2 font-medium text-sm sm:text-base text-center transition-all select-none ${getSlotStyle(status)}`}
                                        title={
                                            status === "available" ? "Click to block or reserve"
                                            : status === "blocked"  ? "Click to unblock"
                                            : undefined
                                        }
                                    >
                                        {getTimeSlotDisplay(timeStr, activePrice?.duration)}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-3">
                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 font-medium mb-1">
                                {isPastDate(selectedDate) ? "Cannot select past dates" : "No time slots found"}
                            </p>
                            <p className="text-gray-400 text-sm">
                                {isPastDate(selectedDate)
                                    ? "Please select a current or future date"
                                    : "Please select another date"}
                            </p>
                        </div>
                    )}
                </div>

            </div>
            </div>
        </Wrapper>
    );
};

export default BlockTime;


// import Wrapper from "@/AdminWrapper/Wrapper";
// import { Calendar } from "@/components/ui/calendar";
// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import toast, { Toaster } from "react-hot-toast";
// import { Package, X, Lock, Unlock, CalendarCheck } from "lucide-react";
// import AddReservationForm from "@/AddFormComponent/AddReservationForm";

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const pad = (n) => String(n).padStart(2, "0");

// const formatDateKey = (date) => {
//     if (!date) return "";
//     return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
// };

// const formatDisplayDate = (date) => {
//     if (!date) return "Select a date";
//     return date.toLocaleDateString("en-US", {
//         weekday: "long",
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//     });
// };

// const isPastDate = (date) => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const compareDate = new Date(date);
//     compareDate.setHours(0, 0, 0, 0);
//     return compareDate < today;
// };

// // ─── Time / duration helpers ──────────────────────────────────────────────────

// const parseDuration = (durationString) => {
//     if (!durationString) return 60;
//     const s = durationString.trim().toLowerCase();
//     const hourMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:hrs|hr|hour|hours)/);
//     const minMatch  = s.match(/(\d+)\s*(?:min|mins|minute|minutes)/);
//     let total = 0;
//     if (hourMatch) total += parseFloat(hourMatch[1]) * 60;
//     if (minMatch)  total += parseInt(minMatch[1]);
//     if (total === 0) {
//         const numMatch = s.match(/(\d+(?:\.\d+)?)/);
//         if (numMatch) {
//             const n = parseFloat(numMatch[1]);
//             total = n < 10 ? Math.round(n * 60) : Math.round(n);
//         }
//     }
//     return total || 60;
// };

// /** "08:00" or "08:00:00" → minutes since midnight */
// const timeToMinutes = (t) => {
//     if (!t) return NaN;
//     const parts = String(t).split(":");
//     return parseInt(parts[0]) * 60 + parseInt(parts[1]);
// };

// /** minutes since midnight → "HH:MM" */
// const minutesToTime = (m) =>
//     `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

// /** Normalise "08:00:00" → "08:00" */
// const hhmm = (t) => {
//     if (!t) return "";
//     const parts = String(t).split(":");
//     return `${parts[0]}:${parts[1]}`;
// };

// const calculateEndTime = (startTime, durationString) => {
//     const durationMinutes = parseDuration(durationString);
//     const clean = hhmm(typeof startTime === "object" ? startTime.start_time : startTime);
//     const [h, m] = clean.split(":").map(Number);
//     const total = h * 60 + m + durationMinutes;
//     return minutesToTime(total);
// };

// const getTimeSlotDisplay = (startTime, duration) => {
//     const start = hhmm(typeof startTime === "object" ? startTime.start_time : startTime);
//     return `${start} - ${calculateEndTime(start, duration)}`;
// };

// // ─── Build display-slot grid ──────────────────────────────────────────────────
// //
// // Shows every lesson-sized window across the day.
// // Step = duration + 20 min.
// // A window is valid when: windowStart + duration ≤ scheduleEnd
// // (the +20 buffer is a customer booking constraint, not an admin view one).

// const buildDisplayGrid = (rawSlots, scheduleEndStr, duration) => {
//     if (!rawSlots || rawSlots.length === 0) return [];

//     const durationMins    = parseDuration(duration);
//     const bookingStepMins = durationMins + 20;

//     const rawStartMins = rawSlots
//         .map((s) => timeToMinutes(hhmm(s.start_time)))
//         .filter(Number.isFinite)
//         .sort((a, b) => a - b);

//     if (rawStartMins.length === 0) return [];

//     let scheduleEndMins;
//     if (scheduleEndStr) {
//         scheduleEndMins = timeToMinutes(hhmm(scheduleEndStr));
//     } else {
//         const lastEndTimes = rawSlots
//             .map((s) => timeToMinutes(hhmm(s.end_time)))
//             .filter(Number.isFinite);
//         scheduleEndMins = lastEndTimes.length > 0
//             ? Math.max(...lastEndTimes)
//             : rawStartMins[rawStartMins.length - 1] + bookingStepMins;
//     }

//     // Last window is valid as long as windowStart + duration ≤ scheduleEnd
//     const latestStart = scheduleEndMins - durationMins;

//     const displaySlots = [];
//     let candidate = rawStartMins[0];

//     while (candidate <= latestStart) {
//         displaySlots.push(minutesToTime(candidate));
//         const next = candidate + bookingStepMins;

//         const hasNearby = rawStartMins.some((m) => m >= next && m < next + 20);
//         if (hasNearby) {
//             candidate = next;
//         } else {
//             const nextReal = rawStartMins.find((m) => m >= next);
//             if (nextReal === undefined) break;
//             candidate = nextReal;
//         }
//     }

//     return displaySlots;
// };

// // ─── Status resolver for a display window ────────────────────────────────────
// //
// // Checks raw 20-min slots whose start_time falls in [windowStart, windowStart+duration).
// // Priority: reserved > blocked > unavailable > available.

// const resolveWindowStatus = (windowStartStr, rawSlots, duration) => {
//     const durationMins = parseDuration(duration);
//     const startMin     = timeToMinutes(windowStartStr);
//     const endMin       = startMin + durationMins;

//     const windowSlots = rawSlots.filter((s) => {
//         const sm = timeToMinutes(hhmm(s.start_time));
//         return sm >= startMin && sm < endMin;
//     });
//     const startingSlot = windowSlots.find(
//         (s) => timeToMinutes(hhmm(s.start_time)) === startMin
//     );

//     if (windowSlots.some((s) => s.status === "reserved")) return "reserved";
//     if (windowSlots.some((s) => s.status === "blocked"))  return "blocked";
//     if (startingSlot?.status === "unavailable") return "unavailable";
//     return "available";
// };

// // ─── Get unique BlockReservation IDs covering a display window ────────────────
// //
// // Uses block_id field added by TimeSlotController (the BlockReservation PK,
// // not the TimeSlot PK). Deduplicates so each BlockReservation is deleted once.

// const getBlockIdsForWindow = (windowStartStr, rawSlots, duration) => {
//     const durationMins = parseDuration(duration);
//     const startMin     = timeToMinutes(windowStartStr);
//     const endMin       = startMin + durationMins;

//     const ids = rawSlots
//         .filter((s) => {
//             if (s.status !== "blocked" || !s.block_id) return false;
//             const sm = timeToMinutes(hhmm(s.start_time));
//             return sm >= startMin && sm < endMin;
//         })
//         .map((s) => s.block_id);

//     // Deduplicate — one BlockReservation can span multiple 20-min slots
//     return [...new Set(ids)];
// };

// // ─── Slot styling ─────────────────────────────────────────────────────────────

// const getSlotStyle = (status) => {
//     switch (status) {
//         case "available":
//             return "cursor-pointer border-gray-200 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-sm";
//         case "blocked":
//             return "cursor-pointer border-red-300 bg-red-50 text-red-600 hover:border-red-400 hover:bg-red-100";
//         case "reserved":
//             return "cursor-default border-emerald-300 bg-emerald-50 text-emerald-700";
//         case "unavailable":
//             return "cursor-default border-gray-200 bg-gray-100 text-gray-400";
//         default:
//             return "cursor-default border-gray-100 text-gray-400";
//     }
// };

// // ─── Package selector helpers ─────────────────────────────────────────────────

// const getPackageLabel = (pkg) =>
//     pkg.duration ? `${pkg.duration} Lesson` : "Lesson";

// // ─── Slot Action Modal ────────────────────────────────────────────────────────

// const SlotActionModal = ({ slot, date, duration, onClose, onBlock, onUnblock, onReserve, isSubmitting }) => {
//     const isBlocked  = slot.status === "blocked";
//     const timeDisplay = getTimeSlotDisplay(slot.startTime, duration);

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
//                 <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
//                     <div>
//                         <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">
//                             {formatDisplayDate(date)}
//                         </p>
//                         <h3 className="text-base font-semibold text-gray-900">{timeDisplay}</h3>
//                     </div>
//                     <button
//                         onClick={onClose}
//                         disabled={isSubmitting}
//                         className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 disabled:opacity-40"
//                     >
//                         <X size={20} />
//                     </button>
//                 </div>

//                 <div className="px-5 py-4">
//                     {isBlocked ? (
//                         <div className="space-y-3">
//                             <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
//                                 <Lock size={14} className="text-red-500 flex-shrink-0" />
//                                 <p className="text-sm text-red-700">
//                                     This time slot is currently blocked.
//                                 </p>
//                             </div>
//                             <button
//                                 onClick={onUnblock}
//                                 disabled={isSubmitting}
//                                 className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-wait transition-colors"
//                             >
//                                 <Unlock size={16} />
//                                 {isSubmitting ? "Unblocking..." : "Unblock This Slot"}
//                             </button>
//                         </div>
//                     ) : (
//                         <div className="space-y-2.5">
//                             <button
//                                 onClick={onBlock}
//                                 disabled={isSubmitting}
//                                 className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-wait transition-colors"
//                             >
//                                 <Lock size={16} />
//                                 {isSubmitting ? "Blocking..." : "Block This Time"}
//                             </button>
//                             <button
//                                 onClick={onReserve}
//                                 disabled={isSubmitting}
//                                 className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
//                             >
//                                 <CalendarCheck size={16} />
//                                 Add Reservation
//                             </button>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// // ─── Main Component ───────────────────────────────────────────────────────────

// const BlockTime = ({ price, packageOptions = [] }) => {
//     const [selectedDate, setSelectedDate]           = useState(new Date());
//     const [activePrice, setActivePrice]             = useState(price);
//     const [rawSlotsCache, setRawSlotsCache]         = useState({});
//     const [scheduleEndCache, setScheduleEndCache]   = useState({});
//     const [loading, setLoading]                     = useState(false);
//     const [activeSlot, setActiveSlot]               = useState(null);
//     const [isSubmitting, setIsSubmitting]           = useState(false);
//     const [reservationInitial, setReservationInitial] = useState(null);

//     // ── Packages ──────────────────────────────────────────────────────────────
//     const packages = React.useMemo(() => {
//         const map = new Map();
//         [price, ...packageOptions].forEach((pkg) => {
//             if (pkg?.id && pkg?.slug) map.set(pkg.id, pkg);
//         });
//         return Array.from(map.values());
//     }, [price, packageOptions]);

//     const groupedPackages = React.useMemo(
//         () =>
//             packages.reduce((g, pkg) => {
//                 const key = pkg.category || "Driving Lessons";
//                 if (!g[key]) g[key] = [];
//                 g[key].push(pkg);
//                 return g;
//             }, {}),
//         [packages]
//     );

//     const handlePackageChange = (e) => {
//         const id   = Number(e.target.value);
//         const next = packages.find((p) => p.id === id);
//         if (!next || next.id === activePrice?.id) return;
//         setActivePrice(next);
//         setActiveSlot(null);
//     };

//     // ── Fetch raw slots for a date ────────────────────────────────────────────
//     const fetchSlots = async (date) => {
//         if (!date || !activePrice?.id) return;
//         setLoading(true);
//         const dateKey = formatDateKey(date);
//         try {
//             const res = await axios.get(route("ourtimeslots.get"), {
//                 params: { date: dateKey, price_id: activePrice.id },
//             });
//             if (res.data.success) {
//                 setRawSlotsCache((prev) => ({
//                     ...prev,
//                     [dateKey]: res.data.slots || [],
//                 }));
//                 setScheduleEndCache((prev) => ({
//                     ...prev,
//                     [dateKey]: res.data.current_end || "",
//                 }));
//             } else {
//                 toast.error("Error loading time slots. Please try again.");
//             }
//         } catch {
//             toast.error("Error loading time slots. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchSlots(selectedDate);
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [activePrice?.id, selectedDate]);

//     const handleDateSelect = (date) => {
//         if (!date) return;
//         if (isPastDate(date)) {
//             toast.error("Cannot select past dates", { icon: "⚠️" });
//         } else {
//             setSelectedDate(date);
//         }
//     };

//     // ── Derived display data ──────────────────────────────────────────────────
//     const dateKey     = selectedDate ? formatDateKey(selectedDate) : null;
//     const rawSlots    = dateKey ? rawSlotsCache[dateKey]    || [] : [];
//     const scheduleEnd = dateKey ? scheduleEndCache[dateKey] || "" : "";

//     const displaySlots = buildDisplayGrid(rawSlots, scheduleEnd, activePrice?.duration);

//     // ── Block action ──────────────────────────────────────────────────────────
//     const handleBlockSlot = async () => {
//         if (!activeSlot || !selectedDate || !activePrice?.id) return;
//         setIsSubmitting(true);
//         try {
//             const dateStr      = formatDateKey(selectedDate);
//             const startTime    = activeSlot.startTime;
//             const endTime      = calculateEndTime(startTime, activePrice?.duration);
//             const durationMins = parseDuration(activePrice?.duration);

//             await axios.post(route("ourblockreservations.store"), {
//                 start_date:   dateStr,
//                 end_date:     dateStr,
//                 start_time:   startTime,
//                 end_time:     endTime,
//                 duration:     (durationMins / 60).toFixed(2),
//                 reason:       "Blocked by admin",
//                 block_action: "block_time",
//             });

//             toast.success("Time slot blocked.");
//             setActiveSlot(null);
//             await fetchSlots(selectedDate);
//         } catch (err) {
//             toast.error(
//                 err.response?.data?.message || "Failed to block. Please try again."
//             );
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     // ── Unblock action ────────────────────────────────────────────────────────
//     // Uses block_id (BlockReservation PK) from the slot objects,
//     // NOT slot.id (TimeSlot PK) — avoids the "No query results" 404.
//     const handleUnblockSlot = async () => {
//         if (!activeSlot || !selectedDate) return;
//         setIsSubmitting(true);
//         try {
//             const blockIds = getBlockIdsForWindow(
//                 activeSlot.startTime,
//                 rawSlots,
//                 activePrice?.duration
//             );

//             if (blockIds.length === 0) {
//                 toast.error("No block records found for this slot.");
//                 setIsSubmitting(false);
//                 return;
//             }

//             await Promise.all(
//                 blockIds.map((id) =>
//                     axios.delete(route("ourblockreservations.destroy", { id }))
//                 )
//             );

//             toast.success("Time slot unblocked.");
//             setActiveSlot(null);
//             await fetchSlots(selectedDate);
//         } catch (err) {
//             toast.error(
//                 err.response?.data?.message || "Failed to unblock. Please try again."
//             );
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     const handleSlotClick = (timeStr, status) => {
//         if (status === "reserved" || status === "unavailable") return;
//         setActiveSlot({ startTime: timeStr, status });
//     };

//     const handleReserveSlot = () => {
//         if (!activeSlot || !selectedDate || !activePrice?.id) return;

//         setReservationInitial({
//             price_id: activePrice.id,
//             reservation_date: formatDateKey(selectedDate),
//             start_time: activeSlot.startTime,
//             end_time: calculateEndTime(activeSlot.startTime, activePrice?.duration),
//         });
//         setActiveSlot(null);
//     };

//     const handleReservationSuccess = async () => {
//         setReservationInitial(null);
//         toast.success("Reservation added.");
//         await fetchSlots(selectedDate);
//     };

//     // ── Render ────────────────────────────────────────────────────────────────
//     return (
//         <Wrapper>
//             <Toaster
//                 position="top-right"
//                 toastOptions={{
//                     duration: 4000,
//                     style: { background: "#363636", color: "#fff" },
//                     success: { duration: 3000, style: { background: "#10b981", color: "#fff" } },
//                     error:   { duration: 4000, style: { background: "#ef4444", color: "#fff" } },
//                 }}
//             />

//             {activeSlot && (
//                 <SlotActionModal
//                     slot={activeSlot}
//                     date={selectedDate}
//                     duration={activePrice?.duration}
//                     onClose={() => !isSubmitting && setActiveSlot(null)}
//                     onBlock={handleBlockSlot}
//                     onUnblock={handleUnblockSlot}
//                     onReserve={handleReserveSlot}
//                     isSubmitting={isSubmitting}
//                 />
//             )}

//             <AddReservationForm
//                 isOpen={Boolean(reservationInitial)}
//                 initialData={reservationInitial}
//                 onClose={() => setReservationInitial(null)}
//                 onSuccess={handleReservationSuccess}
//             />

//             <div className="mb-6">
//                 <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

//                 {/* ── Calendar ── */}
//                 <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-1">
//                     <div className="mb-4">
//                         <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
//                             Select a Date
//                         </h2>
//                         <p className="text-xs sm:text-sm text-gray-500">
//                             Time zone: Australian Western Standard Time (GMT+8)
//                         </p>
//                     </div>
//                     <Calendar
//                         mode="single"
//                         selected={selectedDate}
//                         onSelect={handleDateSelect}
//                         disabled={isPastDate}
//                         className="rounded-md border
//                             [&_.rdp-day_selected]:!bg-indigo-600
//                             [&_.rdp-day_selected]:!text-white
//                             [&_.rdp-day_selected:hover]:!bg-indigo-700
//                             [&_.rdp-day_disabled]:!bg-transparent
//                             [&_.rdp-day_disabled]:!text-gray-300
//                             [&_.rdp-day_disabled]:cursor-not-allowed"
//                     />
//                 </div>

//                 {/* ── Time Slots panel ── */}
//                 <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-2">

//                     {packages.length > 1 && (
//                         <div className="mb-5">
//                             <label
//                                 htmlFor="block-package-selector"
//                                 className="block text-sm font-medium text-gray-700 mb-2"
//                             >
//                                 Lesson Type
//                             </label>
//                             <div className="relative">
//                                 <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                                 <select
//                                     id="block-package-selector"
//                                     value={activePrice?.id || ""}
//                                     onChange={handlePackageChange}
//                                     className="w-full appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3 pl-10 pr-10 transition disabled:opacity-60 disabled:cursor-wait"
//                                 >
//                                     {Object.entries(groupedPackages).map(([cat, opts]) => (
//                                         <optgroup key={cat} label={cat}>
//                                             {opts.map((pkg) => (
//                                                 <option key={pkg.id} value={pkg.id}>
//                                                     {getPackageLabel(pkg)}
//                                                 </option>
//                                             ))}
//                                         </optgroup>
//                                     ))}
//                                 </select>
//                             </div>
//                         </div>
//                     )}

//                     <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
//                         Time Slots
//                     </h2>
//                     <p className="text-xs sm:text-sm text-gray-500 mb-3">
//                         {formatDisplayDate(selectedDate)}
//                     </p>

//                     <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-gray-500">
//                         <div className="flex items-center gap-1.5">
//                             <div className="w-3 h-3 rounded-sm border-2 border-gray-300" />
//                             <span>Available - click to block or reserve</span>
//                         </div>
//                         <div className="flex items-center gap-1.5">
//                             <div className="w-3 h-3 rounded-sm bg-red-100 border border-red-300" />
//                             <span>Blocked - click to unblock</span>
//                         </div>
//                         <div className="flex items-center gap-1.5">
//                             <div className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-300" />
//                             <span>Reserved</span>
//                         </div>
//                         <div className="flex items-center gap-1.5">
//                             <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200" />
//                             <span>Unavailable for this lesson</span>
//                         </div>
//                     </div>

//                     {loading ? (
//                         <div className="flex flex-col items-center justify-center py-8">
//                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
//                             <p className="text-gray-500 text-sm mt-3">Loading time slots...</p>
//                         </div>
//                     ) : displaySlots.length > 0 ? (
//                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
//                             {displaySlots.map((timeStr, index) => {
//                                 const status    = resolveWindowStatus(timeStr, rawSlots, activePrice?.duration);
//                                 const clickable = status === "available" || status === "blocked";
//                                 return (
//                                     <div
//                                         key={index}
//                                         onClick={() => clickable && handleSlotClick(timeStr, status)}
//                                         className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg border-2 font-medium text-sm sm:text-base text-center transition-all select-none ${getSlotStyle(status)}`}
//                                         title={
//                                             status === "available" ? "Click to block or reserve"
//                                             : status === "blocked"  ? "Click to unblock"
//                                             : undefined
//                                         }
//                                     >
//                                         {getTimeSlotDisplay(timeStr, activePrice?.duration)}
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                     ) : (
//                         <div className="text-center py-8">
//                             <div className="text-gray-400 mb-3">
//                                 <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
//                                         d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                 </svg>
//                             </div>
//                             <p className="text-gray-500 font-medium mb-1">
//                                 {isPastDate(selectedDate) ? "Cannot select past dates" : "No time slots found"}
//                             </p>
//                             <p className="text-gray-400 text-sm">
//                                 {isPastDate(selectedDate)
//                                     ? "Please select a current or future date"
//                                     : "Please select another date"}
//                             </p>
//                         </div>
//                     )}
//                 </div>

//             </div>
//         </Wrapper>
//     );
// };

// export default BlockTime;
