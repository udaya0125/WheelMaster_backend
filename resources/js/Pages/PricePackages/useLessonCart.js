import { useCallback, useEffect, useMemo, useState } from "react";

const CART_KEY = "wheelmaster_lesson_cart_v1";

const readStoredCart = () => {
    if (typeof window === "undefined") return [];

    try {
        const stored = window.localStorage.getItem(CART_KEY);
        const parsed = stored ? JSON.parse(stored) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const getCartItemKey = (item) =>
    `${item.price_id}|${item.reservation_date}|${item.start_time}`;

export const useLessonCart = () => {
    const [items, setItems] = useState(readStoredCart);

    useEffect(() => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    }, [items]);

    const addItem = useCallback(
        (item) => {
            const key = getCartItemKey(item);

            if (items.some((cartItem) => cartItem.key === key)) {
                return false;
            }

            setItems([
                ...items,
                {
                    ...item,
                    key,
                    added_at: new Date().toISOString(),
                },
            ]);

            return true;
        },
        [items],
    );

    const removeItem = useCallback((key) => {
        setItems((currentItems) =>
            currentItems.filter((cartItem) => cartItem.key !== key),
        );
    }, []);

    const removeItems = useCallback((keys) => {
        const keySet = new Set(keys);
        setItems((currentItems) =>
            currentItems.filter((cartItem) => !keySet.has(cartItem.key)),
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const subtotal = useMemo(
        () =>
            items.reduce(
                (sum, item) =>
                    sum + Number(item.price?.price || item.price_amount || 0),
                0,
            ),
        [items],
    );

    return {
        items,
        count: items.length,
        subtotal,
        addItem,
        removeItem,
        removeItems,
        clearCart,
    };
};
