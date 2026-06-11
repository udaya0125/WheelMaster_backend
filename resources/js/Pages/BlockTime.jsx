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


import Wrapper from "@/AdminWrapper/Wrapper";
import { Calendar } from "@/components/ui/calendar";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { router } from "@inertiajs/react";
import { Package } from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Package selector helpers (same as PackageSelector.jsx) ──────────────────

const getPackageHref = (packageOption) => {
    const category = (packageOption?.category || "").toLowerCase();
    if (category.includes("test")) {
        return `/block-time/test/${packageOption.slug}`;
    }
    return `/block-time/${packageOption.slug}`;
};

const getPackageLabel = (packageOption) => {
    const duration = packageOption.duration;
    if (!duration) return "Lesson";
    return `${duration} Lesson`;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const BlockTime = ({ price, packageOptions = [] }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [allSlotsData, setAllSlotsData] = useState({});
    const [loading, setLoading] = useState(false);
    const [isChangingPackage, setIsChangingPackage] = useState(false);

    // ── Deduplicate packages (same logic as PackageSelector) ─────────────────
    const packages = useMemo(() => {
        const packageMap = new Map();
        [price, ...packageOptions].forEach((pkg) => {
            if (pkg?.id && pkg?.slug) packageMap.set(pkg.id, pkg);
        });
        return Array.from(packageMap.values());
    }, [price, packageOptions]);

    const groupedPackages = useMemo(
        () =>
            packages.reduce((groups, pkg) => {
                const key = pkg.category || "Driving Lessons";
                if (!groups[key]) groups[key] = [];
                groups[key].push(pkg);
                return groups;
            }, {}),
        [packages]
    );

    const handlePackageChange = (event) => {
        const selectedId = Number(event.target.value);
        const nextPackage = packages.find((p) => p.id === selectedId);
        if (!nextPackage || nextPackage.id === price?.id) return;
        setIsChangingPackage(true);
        router.visit(getPackageHref(nextPackage), {
            preserveScroll: false,
            preserveState: false,
            onFinish: () => setIsChangingPackage(false),
        });
    };

    // ── Fetch slots for selected date ─────────────────────────────────────────
    useEffect(() => {
        const fetchSlots = async () => {
            if (!selectedDate || !price?.id) return;
            setLoading(true);
            const dateKey = formatDateKey(selectedDate);
            try {
                const response = await axios.get(route("ourtimeslots.get"), {
                    params: { date: dateKey, price_id: price.id },
                });
                if (response.data.success) {
                    const slots = response.data.slots || [];
                    setAllSlotsData((prev) => ({ ...prev, [dateKey]: slots }));
                } else {
                    toast.error("Error loading time slots. Please try again.");
                }
            } catch {
                toast.error("Error loading time slots. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchSlots();
    }, [price?.id, selectedDate]);

    const handleDateSelect = (date) => {
        if (date && !isPastDate(date)) {
            setSelectedDate(date);
        } else if (date && isPastDate(date)) {
            toast.error("Cannot select past dates", { icon: "⚠️" });
        }
    };

    // ── Slots for current selected date ───────────────────────────────────────
    const dateKey = selectedDate ? formatDateKey(selectedDate) : null;
    const currentSlots = dateKey ? allSlotsData[dateKey] || [] : [];

    const getSlotStyle = (status) => {
        switch (status) {
            case "available":
                return "border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50";
            case "blocked":
                return "border-red-300 bg-red-50 text-red-600";
            case "reserved":
                return "border-emerald-300 bg-emerald-50 text-emerald-700";
            default:
                return "border-gray-100 text-gray-400";
        }
    };

    return (
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

                {/* ── Package selector + Time Slots ── */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-2">

                    {/* Package selector at top — only if more than one package */}
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
                                    {Object.entries(groupedPackages).map(([category, options]) => (
                                        <optgroup key={category} label={category}>
                                            {options.map((pkg) => (
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

                    {/* Time slots heading */}
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                        Time Slots
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mb-3">
                        {formatDisplayDate(selectedDate)}
                    </p>

                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-sm border-2 border-gray-300" />
                            <span>Available</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-sm bg-red-100 border border-red-300" />
                            <span>Blocked</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-300" />
                            <span>Reserved</span>
                        </div>
                    </div>

                    {/* Slots grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                            <p className="text-gray-500 text-sm mt-3">
                                Loading time slots...
                            </p>
                        </div>
                    ) : currentSlots.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                            {currentSlots.map((slot, index) => (
                                <div
                                    key={index}
                                    className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg border-2 font-medium text-sm sm:text-base text-center ${getSlotStyle(slot.status)}`}
                                >
                                    {slot.start_time} – {slot.end_time}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
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
                            <p className="text-gray-500 font-medium mb-1">
                                {isPastDate(selectedDate)
                                    ? "Cannot select past dates"
                                    : "No time slots found"}
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