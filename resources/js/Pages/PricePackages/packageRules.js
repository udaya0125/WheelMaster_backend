export const FIVE_HOUR_BUNDLE_SESSION_MINUTES = 60;
export const FIVE_HOUR_BUNDLE_TOTAL_MINUTES = 300;
export const FIVE_HOUR_BUNDLE_ALLOWED_SESSION_MINUTES = [60, 120];
export const LESSON_BOOKING_BUFFER_MINUTES = 20;

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

export const isFiveHourLessonBundle = (price) => {
    const category = (price?.category || "").toLowerCase();
    const description = (price?.description || "").toLowerCase();

    return (
        !category.includes("test") &&
        !description.includes("test") &&
        category.includes("package bundles") &&
        /\b5\s*-?\s*hour\b/.test(description)
    );
};

export const getLessonBookingDuration = (
    price,
    selectedDurationMinutes = FIVE_HOUR_BUNDLE_SESSION_MINUTES,
) =>
    isFiveHourLessonBundle(price)
        ? `${selectedDurationMinutes} minutes`
        : price?.duration;

export const getPackageDurationLabel = (price) =>
    isFiveHourLessonBundle(price)
        ? "5 Hours of 1- or 2-Hour Lessons"
        : price?.duration;

export const getBundleItemDurationMinutes = (item) => {
    const durationMinutes = Number(item?.duration_minutes);

    return FIVE_HOUR_BUNDLE_ALLOWED_SESSION_MINUTES.includes(durationMinutes)
        ? durationMinutes
        : FIVE_HOUR_BUNDLE_SESSION_MINUTES;
};

export const getCartItemDurationMinutes = (item) =>
    isFiveHourLessonBundle(item?.price)
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

export const getFiveHourBundleSelectedMinutes = (items = [], priceId = null) =>
    getFiveHourBundleItems(items, priceId).reduce(
        (total, item) => total + getBundleItemDurationMinutes(item),
        0,
    );

export const hasIncompleteFiveHourBundle = (items = []) => {
    const bundleGroups = getFiveHourBundleItems(items).reduce((groups, item) => {
        const key = String(item.price_id);
        groups[key] = [...(groups[key] || []), item];
        return groups;
    }, {});

    return Object.values(bundleGroups).some(
        (bundleItems) =>
            getFiveHourBundleSelectedMinutes(bundleItems) !==
            FIVE_HOUR_BUNDLE_TOTAL_MINUTES,
    );
};

export const getCartSubtotal = (items = []) => {
    const chargedBundleIds = new Set();

    return items.reduce((sum, item) => {
        const itemPrice = item.price || {};

        if (isFiveHourLessonBundle(itemPrice)) {
            if (chargedBundleIds.has(item.price_id)) return sum;
            chargedBundleIds.add(item.price_id);
        }

        return sum + Number(itemPrice.price || item.price_amount || 0);
    }, 0);
};

export const getFiveHourBundleItems = (items = [], priceId = null) =>
    items.filter(
        (item) =>
            isFiveHourLessonBundle(item.price) &&
            (priceId === null || item.price_id === priceId),
    );
