import Wrapper from "@/AdminWrapper/Wrapper";
import { Calendar } from "@/components/ui/calendar";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { router } from "@inertiajs/react";
import { Package, X, Lock, Unlock, CalendarCheck } from "lucide-react";

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

// ─── Build display-slot grid ──────────────────────────────────────────────────
//
// Shows every lesson-sized window across the day.
// Step = duration + 20 min.
// A window is valid when: windowStart + duration ≤ scheduleEnd
// (the +20 buffer is a customer booking constraint, not an admin view one).

const buildDisplayGrid = (rawSlots, scheduleEndStr, duration) => {
    if (!rawSlots || rawSlots.length === 0) return [];

    const durationMins    = parseDuration(duration);
    const bookingStepMins = durationMins + 20;

    const rawStartMins = rawSlots
        .map((s) => timeToMinutes(hhmm(s.start_time)))
        .filter(Number.isFinite)
        .sort((a, b) => a - b);

    if (rawStartMins.length === 0) return [];

    let scheduleEndMins;
    if (scheduleEndStr) {
        scheduleEndMins = timeToMinutes(hhmm(scheduleEndStr));
    } else {
        const lastEndTimes = rawSlots
            .map((s) => timeToMinutes(hhmm(s.end_time)))
            .filter(Number.isFinite);
        scheduleEndMins = lastEndTimes.length > 0
            ? Math.max(...lastEndTimes)
            : rawStartMins[rawStartMins.length - 1] + bookingStepMins;
    }

    // Last window is valid as long as windowStart + duration ≤ scheduleEnd
    const latestStart = scheduleEndMins - durationMins;

    const displaySlots = [];
    let candidate = rawStartMins[0];

    while (candidate <= latestStart) {
        displaySlots.push(minutesToTime(candidate));
        const next = candidate + bookingStepMins;

        const hasNearby = rawStartMins.some((m) => m >= next && m < next + 20);
        if (hasNearby) {
            candidate = next;
        } else {
            const nextReal = rawStartMins.find((m) => m >= next);
            if (nextReal === undefined) break;
            candidate = nextReal;
        }
    }

    return displaySlots;
};

// ─── Status resolver for a display window ────────────────────────────────────
//
// Checks raw 20-min slots whose start_time falls in [windowStart, windowStart+duration).
// Priority: reserved > blocked > available.

const resolveWindowStatus = (windowStartStr, rawSlots, duration) => {
    const durationMins = parseDuration(duration);
    const startMin     = timeToMinutes(windowStartStr);
    const endMin       = startMin + durationMins;

    const windowSlots = rawSlots.filter((s) => {
        const sm = timeToMinutes(hhmm(s.start_time));
        return sm >= startMin && sm < endMin;
    });

    if (windowSlots.some((s) => s.status === "reserved")) return "reserved";
    if (windowSlots.some((s) => s.status === "blocked"))  return "blocked";
    return "available";
};

// ─── Get unique BlockReservation IDs covering a display window ────────────────
//
// Uses block_id field added by TimeSlotController (the BlockReservation PK,
// not the TimeSlot PK). Deduplicates so each BlockReservation is deleted once.

const getBlockIdsForWindow = (windowStartStr, rawSlots, duration) => {
    const durationMins = parseDuration(duration);
    const startMin     = timeToMinutes(windowStartStr);
    const endMin       = startMin + durationMins;

    const ids = rawSlots
        .filter((s) => {
            if (s.status !== "blocked" || !s.block_id) return false;
            const sm = timeToMinutes(hhmm(s.start_time));
            return sm >= startMin && sm < endMin;
        })
        .map((s) => s.block_id);

    // Deduplicate — one BlockReservation can span multiple 20-min slots
    return [...new Set(ids)];
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
        default:
            return "cursor-default border-gray-100 text-gray-400";
    }
};

// ─── Package selector helpers ─────────────────────────────────────────────────

const getPackageHref = (pkg) => {
    const cat = (pkg?.category || "").toLowerCase();
    return cat.includes("test")
        ? route("block-time.test", { slug: pkg.slug })
        : route("block-time.show", { slug: pkg.slug });
};

const getPackageLabel = (pkg) =>
    pkg.duration ? `${pkg.duration} Lesson` : "Lesson";

// ─── Slot Action Modal ────────────────────────────────────────────────────────

const SlotActionModal = ({ slot, date, duration, onClose, onBlock, onUnblock, isSubmitting }) => {
    const isBlocked  = slot.status === "blocked";
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
                                disabled
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-400 rounded-lg text-sm font-medium border border-indigo-100 cursor-not-allowed"
                            >
                                <CalendarCheck size={16} />
                                Reserve
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
    const [selectedDate, setSelectedDate]           = useState(new Date());
    const [rawSlotsCache, setRawSlotsCache]         = useState({});
    const [scheduleEndCache, setScheduleEndCache]   = useState({});
    const [loading, setLoading]                     = useState(false);
    const [isChangingPackage, setIsChangingPackage] = useState(false);
    const [activeSlot, setActiveSlot]               = useState(null);
    const [isSubmitting, setIsSubmitting]           = useState(false);

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

    const handlePackageChange = (e) => {
        const id   = Number(e.target.value);
        const next = packages.find((p) => p.id === id);
        if (!next || next.id === price?.id) return;
        setIsChangingPackage(true);
        router.visit(getPackageHref(next), {
            preserveScroll: false,
            preserveState: false,
            onFinish: () => setIsChangingPackage(false),
        });
    };

    // ── Fetch raw slots for a date ────────────────────────────────────────────
    const fetchSlots = async (date) => {
        if (!date || !price?.id) return;
        setLoading(true);
        const dateKey = formatDateKey(date);
        try {
            const res = await axios.get(route("ourtimeslots.get"), {
                params: { date: dateKey, price_id: price.id },
            });
            if (res.data.success) {
                setRawSlotsCache((prev) => ({
                    ...prev,
                    [dateKey]: res.data.slots || [],
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
    }, [price?.id, selectedDate]);

    const handleDateSelect = (date) => {
        if (!date) return;
        if (isPastDate(date)) {
            toast.error("Cannot select past dates", { icon: "⚠️" });
        } else {
            setSelectedDate(date);
        }
    };

    // ── Derived display data ──────────────────────────────────────────────────
    const dateKey     = selectedDate ? formatDateKey(selectedDate) : null;
    const rawSlots    = dateKey ? rawSlotsCache[dateKey]    || [] : [];
    const scheduleEnd = dateKey ? scheduleEndCache[dateKey] || "" : "";

    const displaySlots = buildDisplayGrid(rawSlots, scheduleEnd, price?.duration);

    // ── Block action ──────────────────────────────────────────────────────────
    const handleBlockSlot = async () => {
        if (!activeSlot || !selectedDate || !price?.id) return;
        setIsSubmitting(true);
        try {
            const dateStr      = formatDateKey(selectedDate);
            const startTime    = activeSlot.startTime;
            const endTime      = calculateEndTime(startTime, price?.duration);
            const durationMins = parseDuration(price?.duration);

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
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to block. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Unblock action ────────────────────────────────────────────────────────
    // Uses block_id (BlockReservation PK) from the slot objects,
    // NOT slot.id (TimeSlot PK) — avoids the "No query results" 404.
    const handleUnblockSlot = async () => {
        if (!activeSlot || !selectedDate) return;
        setIsSubmitting(true);
        try {
            const blockIds = getBlockIdsForWindow(
                activeSlot.startTime,
                rawSlots,
                price?.duration
            );

            if (blockIds.length === 0) {
                toast.error("No block records found for this slot.");
                setIsSubmitting(false);
                return;
            }

            await Promise.all(
                blockIds.map((id) =>
                    axios.delete(route("ourblockreservations.destroy", { id }))
                )
            );

            toast.success("Time slot unblocked.");
            setActiveSlot(null);
            await fetchSlots(selectedDate);
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to unblock. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSlotClick = (timeStr, status) => {
        if (status === "reserved") return;
        setActiveSlot({ startTime: timeStr, status });
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <Wrapper>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: { background: "#363636", color: "#fff" },
                    success: { duration: 3000, style: { background: "#10b981", color: "#fff" } },
                    error:   { duration: 4000, style: { background: "#ef4444", color: "#fff" } },
                }}
            />

            {activeSlot && (
                <SlotActionModal
                    slot={activeSlot}
                    date={selectedDate}
                    duration={price?.duration}
                    onClose={() => !isSubmitting && setActiveSlot(null)}
                    onBlock={handleBlockSlot}
                    onUnblock={handleUnblockSlot}
                    isSubmitting={isSubmitting}
                />
            )}

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Block Time</h1>
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
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={isPastDate}
                        className="rounded-md border
                            [&_.rdp-day_selected]:!bg-indigo-600
                            [&_.rdp-day_selected]:!text-white
                            [&_.rdp-day_selected:hover]:!bg-indigo-700
                            [&_.rdp-day_disabled]:!bg-transparent
                            [&_.rdp-day_disabled]:!text-gray-300
                            [&_.rdp-day_disabled]:cursor-not-allowed"
                    />
                </div>

                {/* ── Time Slots panel ── */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-2">

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
                                    value={price?.id || ""}
                                    onChange={handlePackageChange}
                                    disabled={isChangingPackage}
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

                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                        Time Slots
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mb-3">
                        {formatDisplayDate(selectedDate)}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-sm border-2 border-gray-300" />
                            <span>Available — click to block</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-sm bg-red-100 border border-red-300" />
                            <span>Blocked — click to unblock</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-300" />
                            <span>Reserved</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                            <p className="text-gray-500 text-sm mt-3">Loading time slots...</p>
                        </div>
                    ) : displaySlots.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                            {displaySlots.map((timeStr, index) => {
                                const status    = resolveWindowStatus(timeStr, rawSlots, price?.duration);
                                const clickable = status !== "reserved";
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
                                        {getTimeSlotDisplay(timeStr, price?.duration)}
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
        </Wrapper>
    );
};

export default BlockTime;






// import Wrapper from "@/AdminWrapper/Wrapper";
// import { Calendar } from "@/components/ui/calendar";
// import axios from "axios";
// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import toast, { Toaster } from "react-hot-toast";
// import { router } from "@inertiajs/react";
// import { Package } from "lucide-react";

// // ─── Helpers ─────────────────────────────────────────────────────────────────

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

// // ─── Package selector helpers (same as PackageSelector.jsx) ──────────────────

// const getPackageHref = (packageOption) => {
//     const category = (packageOption?.category || "").toLowerCase();
//     if (category.includes("test")) {
//         return `/block-time/test/${packageOption.slug}`;
//     }
//     return `/block-time/${packageOption.slug}`;
// };

// const getPackageLabel = (packageOption) => {
//     const duration = packageOption.duration;
//     if (!duration) return "Lesson";
//     return `${duration} Lesson`;
// };

// // ─── Main Component ───────────────────────────────────────────────────────────

// const BlockTime = ({ price, packageOptions = [] }) => {
//     const [selectedDate, setSelectedDate] = useState(new Date());
//     const [currentMonth, setCurrentMonth] = useState(new Date());
//     const [dayAvailability, setDayAvailability] = useState({});
//     const [allSlotsData, setAllSlotsData] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [isChangingPackage, setIsChangingPackage] = useState(false);

//     // ── Deduplicate packages (same logic as PackageSelector) ─────────────────
//     const packages = useMemo(() => {
//         const packageMap = new Map();
//         [price, ...packageOptions].forEach((pkg) => {
//             if (pkg?.id && pkg?.slug) packageMap.set(pkg.id, pkg);
//         });
//         return Array.from(packageMap.values());
//     }, [price, packageOptions]);

//     const groupedPackages = useMemo(
//         () =>
//             packages.reduce((groups, pkg) => {
//                 const key = pkg.category || "Driving Lessons";
//                 if (!groups[key]) groups[key] = [];
//                 groups[key].push(pkg);
//                 return groups;
//             }, {}),
//         [packages]
//     );

//     const handlePackageChange = (event) => {
//         const selectedId = Number(event.target.value);
//         const nextPackage = packages.find((p) => p.id === selectedId);
//         if (!nextPackage || nextPackage.id === price?.id) return;
//         setIsChangingPackage(true);
//         router.visit(getPackageHref(nextPackage), {
//             preserveScroll: false,
//             preserveState: false,
//             onFinish: () => setIsChangingPackage(false),
//         });
//     };

//     // ── Fetch month availability ──────────────────────────────────────────────
//     const fetchMonthAvailability = useCallback(
//         async (monthDate) => {
//             if (!price?.id) return;

//             const year = monthDate.getFullYear();
//             const month = monthDate.getMonth();
//             const today = new Date();
//             today.setHours(0, 0, 0, 0);

//             const daysInMonth = new Date(year, month + 1, 0).getDate();
//             const datesToFetch = [];

//             for (let d = 1; d <= daysInMonth; d++) {
//                 const date = new Date(year, month, d);
//                 if (date >= today) {
//                     const key = formatDateKey(date);
//                     if (!dayAvailability[key]) datesToFetch.push(date);
//                 }
//             }

//             if (datesToFetch.length === 0) return;

//             const batchSize = 7;
//             for (let i = 0; i < datesToFetch.length; i += batchSize) {
//                 const batch = datesToFetch.slice(i, i + batchSize);
//                 await Promise.all(
//                     batch.map(async (date) => {
//                         const dateKey = formatDateKey(date);
//                         try {
//                             const response = await axios.get(
//                                 route("ourtimeslots.get"),
//                                 { params: { date: dateKey, price_id: price.id } }
//                             );
//                             if (response.data.success) {
//                                 const slots = response.data.slots || [];
//                                 const hasAvailable = slots.some(
//                                     (s) => s.status === "available"
//                                 );
//                                 setDayAvailability((prev) => ({
//                                     ...prev,
//                                     [dateKey]: hasAvailable ? "available" : "unavailable",
//                                 }));
//                             } else {
//                                 setDayAvailability((prev) => ({
//                                     ...prev,
//                                     [dateKey]: "unavailable",
//                                 }));
//                             }
//                         } catch {
//                             setDayAvailability((prev) => ({
//                                 ...prev,
//                                 [dateKey]: "unavailable",
//                             }));
//                         }
//                     })
//                 );
//             }
//         },
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//         [price?.id]
//     );

//     useEffect(() => {
//         fetchMonthAvailability(currentMonth);
//     }, [currentMonth, fetchMonthAvailability]);

//     // ── Fetch slots for selected date ─────────────────────────────────────────
//     useEffect(() => {
//         const fetchSlots = async () => {
//             if (!selectedDate || !price?.id) return;
//             setLoading(true);
//             const dateKey = formatDateKey(selectedDate);
//             try {
//                 const response = await axios.get(route("ourtimeslots.get"), {
//                     params: { date: dateKey, price_id: price.id },
//                 });
//                 if (response.data.success) {
//                     const slots = response.data.slots || [];
//                     setAllSlotsData((prev) => ({ ...prev, [dateKey]: slots }));
//                     const hasAvailable = slots.some((s) => s.status === "available");
//                     setDayAvailability((prev) => ({
//                         ...prev,
//                         [dateKey]: hasAvailable ? "available" : "unavailable",
//                     }));
//                 } else {
//                     toast.error("Error loading time slots. Please try again.");
//                 }
//             } catch {
//                 toast.error("Error loading time slots. Please try again.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchSlots();
//     }, [price?.id, selectedDate]);

//     // ── Calendar modifier arrays ──────────────────────────────────────────────
//     const availableDays = Object.entries(dayAvailability)
//         .filter(([, status]) => status === "available")
//         .map(([key]) => new Date(key + "T00:00:00"));

//     const unavailableDays = Object.entries(dayAvailability)
//         .filter(([, status]) => status === "unavailable")
//         .map(([key]) => new Date(key + "T00:00:00"));

//     const handleDateSelect = (date) => {
//         if (date && !isPastDate(date)) {
//             setSelectedDate(date);
//         } else if (date && isPastDate(date)) {
//             toast.error("Cannot select past dates", { icon: "⚠️" });
//         }
//     };

//     // ── Slots for current selected date ───────────────────────────────────────
//     const dateKey = selectedDate ? formatDateKey(selectedDate) : null;
//     const currentSlots = dateKey ? allSlotsData[dateKey] || [] : [];

//     const getSlotStyle = (status) => {
//         switch (status) {
//             case "available":
//                 return "border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50";
//             case "blocked":
//                 return "border-red-300 bg-red-50 text-red-600";
//             case "reserved":
//                 return "border-emerald-300 bg-emerald-50 text-emerald-700";
//             default:
//                 return "border-gray-100 text-gray-400";
//         }
//     };

//     return (
//         <Wrapper>
//             <Toaster
//                 position="top-right"
//                 toastOptions={{
//                     duration: 4000,
//                     style: { background: "#363636", color: "#fff" },
//                     success: {
//                         duration: 3000,
//                         style: { background: "#10b981", color: "#fff" },
//                     },
//                     error: {
//                         duration: 4000,
//                         style: { background: "#ef4444", color: "#fff" },
//                     },
//                 }}
//             />

//             <div className="mb-6">
//                 <h1 className="text-2xl font-bold text-gray-900">Block Time</h1>
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
//                         <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
//                             <div className="flex items-center gap-1.5">
//                                 <div className="w-3 h-3 rounded-sm bg-emerald-500" />
//                                 <span>Available</span>
//                             </div>
//                             <div className="flex items-center gap-1.5">
//                                 <div className="w-3 h-3 rounded-sm bg-red-400" />
//                                 <span>Fully Booked</span>
//                             </div>
//                         </div>
//                     </div>

//                     <Calendar
//                         mode="single"
//                         selected={selectedDate}
//                         onSelect={handleDateSelect}
//                         onMonthChange={setCurrentMonth}
//                         disabled={isPastDate}
//                         modifiers={{
//                             available: availableDays,
//                             unavailable: unavailableDays,
//                         }}
//                         modifiersClassNames={{
//                             available:
//                                 "!bg-emerald-400 !text-white hover:!bg-emerald-600 !rounded-md !font-semibold",
//                             unavailable:
//                                 "!bg-red-400 !text-white hover:!bg-red-500 !rounded-md !font-semibold",
//                         }}
//                         className="rounded-md border
//                             [&_.rdp-day_selected]:!bg-indigo-600
//                             [&_.rdp-day_selected]:!text-white
//                             [&_.rdp-day_selected:hover]:!bg-indigo-700
//                             [&_.rdp-day_disabled]:!bg-transparent
//                             [&_.rdp-day_disabled]:!text-gray-300
//                             [&_.rdp-day_disabled]:cursor-not-allowed"
//                     />
//                 </div>

//                 {/* ── Package selector + Time Slots ── */}
//                 <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-2">

//                     {/* Package selector at top — only if more than one package */}
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
//                                     value={price?.id || ""}
//                                     onChange={handlePackageChange}
//                                     disabled={isChangingPackage}
//                                     className="w-full appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3 pl-10 pr-10 transition disabled:opacity-60 disabled:cursor-wait"
//                                 >
//                                     {Object.entries(groupedPackages).map(([category, options]) => (
//                                         <optgroup key={category} label={category}>
//                                             {options.map((pkg) => (
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

//                     {/* Time slots heading */}
//                     <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
//                         Time Slots
//                     </h2>
//                     <p className="text-xs sm:text-sm text-gray-500 mb-3">
//                         {formatDisplayDate(selectedDate)}
//                     </p>

//                     {/* Legend */}
//                     <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-gray-500">
//                         <div className="flex items-center gap-1.5">
//                             <div className="w-3 h-3 rounded-sm border-2 border-gray-300" />
//                             <span>Available</span>
//                         </div>
//                         <div className="flex items-center gap-1.5">
//                             <div className="w-3 h-3 rounded-sm bg-red-100 border border-red-300" />
//                             <span>Blocked</span>
//                         </div>
//                         <div className="flex items-center gap-1.5">
//                             <div className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-300" />
//                             <span>Reserved</span>
//                         </div>
//                     </div>

//                     {/* Slots grid */}
//                     {loading ? (
//                         <div className="flex flex-col items-center justify-center py-8">
//                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
//                             <p className="text-gray-500 text-sm mt-3">
//                                 Loading time slots...
//                             </p>
//                         </div>
//                     ) : currentSlots.length > 0 ? (
//                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
//                             {currentSlots.map((slot, index) => (
//                                 <div
//                                     key={index}
//                                     className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg border-2 font-medium text-sm sm:text-base text-center ${getSlotStyle(slot.status)}`}
//                                 >
//                                     {slot.start_time} – {slot.end_time}
//                                 </div>
//                             ))}
//                         </div>
//                     ) : (
//                         <div className="text-center py-8">
//                             <div className="text-gray-400 mb-3">
//                                 <svg
//                                     className="w-12 h-12 mx-auto"
//                                     fill="none"
//                                     stroke="currentColor"
//                                     viewBox="0 0 24 24"
//                                 >
//                                     <path
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                         strokeWidth={1}
//                                         d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
//                                     />
//                                 </svg>
//                             </div>
//                             <p className="text-gray-500 font-medium mb-1">
//                                 {isPastDate(selectedDate)
//                                     ? "Cannot select past dates"
//                                     : "No time slots found"}
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
