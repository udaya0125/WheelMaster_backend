// export const FIVE_HOUR_BUNDLE_SESSION_MINUTES = 60;
// export const FIVE_HOUR_BUNDLE_TOTAL_MINUTES = 300;
// export const FIVE_HOUR_BUNDLE_ALLOWED_SESSION_MINUTES = [60, 120];
// export const LESSON_BOOKING_BUFFER_MINUTES = 20;

// export const parsePackageDuration = (durationString) => {
//     if (!durationString) return 60;

//     const cleanString = durationString.trim().toLowerCase();
//     const hourMatch = cleanString.match(
//         /(\d+(?:\.\d+)?)\s*(?:hrs|hr|hour|hours)/,
//     );
//     const minuteMatch = cleanString.match(
//         /(\d+)\s*(?:min|mins|minute|minutes)/,
//     );
//     let totalMinutes = 0;

//     if (hourMatch) totalMinutes += parseFloat(hourMatch[1]) * 60;
//     if (minuteMatch) totalMinutes += parseInt(minuteMatch[1]);

//     if (totalMinutes === 0) {
//         const numberMatch = cleanString.match(/(\d+(?:\.\d+)?)/);
//         if (numberMatch) {
//             const num = parseFloat(numberMatch[1]);
//             totalMinutes = num < 10 ? Math.round(num * 60) : Math.round(num);
//         }
//     }

//     return totalMinutes || 60;
// };

// export const isFiveHourLessonBundle = (price) => {
//     const category = (price?.category || "").toLowerCase();
//     const description = (price?.description || "").toLowerCase();

//     return (
//         !category.includes("test") &&
//         !description.includes("test") &&
//         category.includes("package bundles") &&
//         /\b5\s*-?\s*hour\b/.test(description)
//     );
// };

// export const getLessonBookingDuration = (
//     price,
//     selectedDurationMinutes = FIVE_HOUR_BUNDLE_SESSION_MINUTES,
// ) =>
//     isFiveHourLessonBundle(price)
//         ? `${selectedDurationMinutes} minutes`
//         : price?.duration;

// export const getPackageDurationLabel = (price) =>
//     isFiveHourLessonBundle(price)
//         ? "5 Hours of 1- or 2-Hour Lessons"
//         : price?.duration;

// export const getBundleItemDurationMinutes = (item) => {
//     const durationMinutes = Number(item?.duration_minutes);

//     return FIVE_HOUR_BUNDLE_ALLOWED_SESSION_MINUTES.includes(durationMinutes)
//         ? durationMinutes
//         : FIVE_HOUR_BUNDLE_SESSION_MINUTES;
// };

// export const getCartItemDurationMinutes = (item) =>
//     isFiveHourLessonBundle(item?.price)
//         ? getBundleItemDurationMinutes(item)
//         : parsePackageDuration(item?.price?.duration);

// const timeToMinutes = (time) => {
//     if (typeof time !== "string" || !time.includes(":")) return Number.NaN;

//     const [hours, minutes] = time.split(":").map(Number);
//     if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
//         return Number.NaN;
//     }

//     return hours * 60 + minutes;
// };

// export const findOverlappingCartItem = (items = [], candidateItem) => {
//     const candidateStart = timeToMinutes(candidateItem?.start_time);
//     const candidateDuration = getCartItemDurationMinutes(candidateItem);

//     if (!Number.isFinite(candidateStart) || !Number.isFinite(candidateDuration)) {
//         return null;
//     }

//     const candidateBufferEnd =
//         candidateStart + candidateDuration + LESSON_BOOKING_BUFFER_MINUTES;

//     return (
//         items.find((item) => {
//             if (
//                 String(item?.reservation_date) !==
//                 String(candidateItem?.reservation_date)
//             ) {
//                 return false;
//             }

//             const itemStart = timeToMinutes(item?.start_time);
//             const itemDuration = getCartItemDurationMinutes(item);

//             if (!Number.isFinite(itemStart) || !Number.isFinite(itemDuration)) {
//                 return false;
//             }

//             const itemBufferEnd =
//                 itemStart + itemDuration + LESSON_BOOKING_BUFFER_MINUTES;

//             return (
//                 candidateStart < itemBufferEnd &&
//                 itemStart < candidateBufferEnd
//             );
//         }) || null
//     );
// };

// export const getFiveHourBundleSelectedMinutes = (items = [], priceId = null) =>
//     getFiveHourBundleItems(items, priceId).reduce(
//         (total, item) => total + getBundleItemDurationMinutes(item),
//         0,
//     );

// export const hasIncompleteFiveHourBundle = (items = []) => {
//     const bundleGroups = getFiveHourBundleItems(items).reduce((groups, item) => {
//         const key = String(item.price_id);
//         groups[key] = [...(groups[key] || []), item];
//         return groups;
//     }, {});

//     return Object.values(bundleGroups).some(
//         (bundleItems) =>
//             getFiveHourBundleSelectedMinutes(bundleItems) !==
//             FIVE_HOUR_BUNDLE_TOTAL_MINUTES,
//     );
// };

// export const getCartSubtotal = (items = []) => {
//     const chargedBundleIds = new Set();

//     return items.reduce((sum, item) => {
//         const itemPrice = item.price || {};

//         if (isFiveHourLessonBundle(itemPrice)) {
//             if (chargedBundleIds.has(item.price_id)) return sum;
//             chargedBundleIds.add(item.price_id);
//         }

//         return sum + Number(itemPrice.price || item.price_amount || 0);
//     }, 0);
// };

// export const getFiveHourBundleItems = (items = [], priceId = null) =>
//     items.filter(
//         (item) =>
//             isFiveHourLessonBundle(item.price) &&
//             (priceId === null || item.price_id === priceId),
//     );



export const LESSON_BUNDLE_SESSION_MINUTES = 60;
export const LESSON_BUNDLE_ALLOWED_SESSION_MINUTES = [60, 120];
export const LESSON_BOOKING_BUFFER_MINUTES = 20;

export const FIVE_HOUR_BUNDLE_HOURS = 5;
export const FIVE_HOUR_BUNDLE_SESSION_MINUTES = LESSON_BUNDLE_SESSION_MINUTES;
export const FIVE_HOUR_BUNDLE_TOTAL_MINUTES = FIVE_HOUR_BUNDLE_HOURS * 60;
export const FIVE_HOUR_BUNDLE_ALLOWED_SESSION_MINUTES = LESSON_BUNDLE_ALLOWED_SESSION_MINUTES;

export const TEN_HOUR_BUNDLE_HOURS = 10;
export const TEN_HOUR_BUNDLE_SESSION_MINUTES = LESSON_BUNDLE_SESSION_MINUTES;
export const TEN_HOUR_BUNDLE_TOTAL_MINUTES = TEN_HOUR_BUNDLE_HOURS * 60;
export const TEN_HOUR_BUNDLE_ALLOWED_SESSION_MINUTES = LESSON_BUNDLE_ALLOWED_SESSION_MINUTES;

const LESSON_BUNDLE_HOUR_OPTIONS = [FIVE_HOUR_BUNDLE_HOURS, TEN_HOUR_BUNDLE_HOURS];

const buildBundleHourRegex = (hours) => new RegExp(`\\b${hours}\\s*-?\\s*hour\\b`);

export const getBundleTotalMinutes = (hours) => hours * 60;

export const parsePackageDuration = (durationString) => {
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
            totalMinutes = num < 10 ? Math.round(num * 60) : Math.round(num);
        }
    }

    return totalMinutes || 60;
};

// Returns the matched bundle size (5, 10, ...) for a price, or null if it isn't a lesson bundle.
export const getLessonBundleHours = (price) => {
    const category = (price?.category || "").toLowerCase();
    const description = (price?.description || "").toLowerCase();

    if (
        !category.includes("package bundles") ||
        category.includes("test") ||
        description.includes("test")
    ) {
        return null;
    }

    return (
        LESSON_BUNDLE_HOUR_OPTIONS.find((hours) =>
            buildBundleHourRegex(hours).test(description),
        ) || null
    );
};

export const isLessonBundle = (price) => getLessonBundleHours(price) !== null;

export const isFiveHourLessonBundle = (price) =>
    getLessonBundleHours(price) === FIVE_HOUR_BUNDLE_HOURS;

export const isTenHourLessonBundle = (price) =>
    getLessonBundleHours(price) === TEN_HOUR_BUNDLE_HOURS;

export const getLessonBookingDuration = (
    price,
    selectedDurationMinutes = LESSON_BUNDLE_SESSION_MINUTES,
) =>
    isLessonBundle(price) ? `${selectedDurationMinutes} minutes` : price?.duration;

export const getPackageDurationLabel = (price) => {
    const hours = getLessonBundleHours(price);
    return hours ? `${hours} Hours of 1- or 2-Hour Lessons` : price?.duration;
};

export const getBundleItemDurationMinutes = (item) => {
    const durationMinutes = Number(item?.duration_minutes);

    return LESSON_BUNDLE_ALLOWED_SESSION_MINUTES.includes(durationMinutes)
        ? durationMinutes
        : LESSON_BUNDLE_SESSION_MINUTES;
};

export const getCartItemDurationMinutes = (item) =>
    isLessonBundle(item?.price)
        ? getBundleItemDurationMinutes(item)
        : parsePackageDuration(item?.price?.duration);

const timeToMinutes = (time) => {
    if (typeof time !== "string" || !time.includes(":")) return Number.NaN;

    const [hours, minutes] = time.split(":").map(Number);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
        return Number.NaN;
    }

    return hours * 60 + minutes;
};

export const findOverlappingCartItem = (items = [], candidateItem) => {
    const candidateStart = timeToMinutes(candidateItem?.start_time);
    const candidateDuration = getCartItemDurationMinutes(candidateItem);

    if (!Number.isFinite(candidateStart) || !Number.isFinite(candidateDuration)) {
        return null;
    }

    const candidateBufferEnd =
        candidateStart + candidateDuration + LESSON_BOOKING_BUFFER_MINUTES;

    return (
        items.find((item) => {
            if (
                String(item?.reservation_date) !==
                String(candidateItem?.reservation_date)
            ) {
                return false;
            }

            const itemStart = timeToMinutes(item?.start_time);
            const itemDuration = getCartItemDurationMinutes(item);

            if (!Number.isFinite(itemStart) || !Number.isFinite(itemDuration)) {
                return false;
            }

            const itemBufferEnd =
                itemStart + itemDuration + LESSON_BOOKING_BUFFER_MINUTES;

            return (
                candidateStart < itemBufferEnd &&
                itemStart < candidateBufferEnd
            );
        }) || null
    );
};

// hours = null returns all lesson-bundle items regardless of size (5-hour, 10-hour, ...).
export const getLessonBundleItems = (items = [], hours = null, priceId = null) =>
    items.filter((item) => {
        const itemHours = getLessonBundleHours(item.price);
        if (itemHours === null) return false;
        if (hours !== null && itemHours !== hours) return false;
        if (priceId !== null && item.price_id !== priceId) return false;
        return true;
    });

export const getFiveHourBundleItems = (items = [], priceId = null) =>
    getLessonBundleItems(items, FIVE_HOUR_BUNDLE_HOURS, priceId);

export const getTenHourBundleItems = (items = [], priceId = null) =>
    getLessonBundleItems(items, TEN_HOUR_BUNDLE_HOURS, priceId);

export const getLessonBundleSelectedMinutes = (items = [], hours = null, priceId = null) =>
    getLessonBundleItems(items, hours, priceId).reduce(
        (total, item) => total + getBundleItemDurationMinutes(item),
        0,
    );

export const getFiveHourBundleSelectedMinutes = (items = [], priceId = null) =>
    getLessonBundleSelectedMinutes(items, FIVE_HOUR_BUNDLE_HOURS, priceId);

export const getTenHourBundleSelectedMinutes = (items = [], priceId = null) =>
    getLessonBundleSelectedMinutes(items, TEN_HOUR_BUNDLE_HOURS, priceId);

// Groups lesson-bundle items (of any size) by price_id and checks each group
// against its own bundle's required total minutes.
export const hasIncompleteLessonBundle = (items = []) => {
    const bundleGroups = getLessonBundleItems(items).reduce((groups, item) => {
        const key = String(item.price_id);
        groups[key] = groups[key] || {
            hours: getLessonBundleHours(item.price),
            items: [],
        };
        groups[key].items.push(item);
        return groups;
    }, {});

    return Object.values(bundleGroups).some(
        ({ hours, items: bundleItems }) =>
            getLessonBundleSelectedMinutes(bundleItems, hours) !==
            getBundleTotalMinutes(hours),
    );
};

export const hasIncompleteFiveHourBundle = (items = []) =>
    hasIncompleteLessonBundle(getFiveHourBundleItems(items));

export const hasIncompleteTenHourBundle = (items = []) =>
    hasIncompleteLessonBundle(getTenHourBundleItems(items));

export const getCartSubtotal = (items = []) => {
    const chargedBundleIds = new Set();

    return items.reduce((sum, item) => {
        const itemPrice = item.price || {};

        if (isLessonBundle(itemPrice)) {
            if (chargedBundleIds.has(item.price_id)) return sum;
            chargedBundleIds.add(item.price_id);
        }

        return sum + Number(itemPrice.price || item.price_amount || 0);
    }, 0);
};