import React, { useState, useRef, useEffect } from "react";
import {
    Menu,
    UserCircle,
    LogOut,
    ChevronDown,
    Bell,
    Check,
    X,
} from "lucide-react";
import { Link, usePage } from "@inertiajs/react";
import axios from "axios";

const NavBar = ({ onMenuToggle }) => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const userMenuRef = useRef(null);
    const notificationMenuRef = useRef(null);
    const { auth } = usePage().props;
    const user = auth?.user;

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get(route("notifications.index"));
            const notificationsData = response.data || [];
            const formattedNotifications = notificationsData.map(
                (notification) => ({
                    id: notification.id,
                    title: "New Reservation",
                    description: notification.message,
                    time: formatTime(notification.created_at),
                    read: Boolean(notification.is_read),
                }),
            );
            setNotifications(formattedNotifications);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    //  console.log("Notifications state:", notifications); // Debug log

    const formatTime = (timestamp) => {
        if (!timestamp) return "Just now";
        const notificationTime = new Date(timestamp);
        if (isNaN(notificationTime.getTime())) return "Just now";
        const now = new Date();
        const diffMs = now - notificationTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1) return "Just now";
        if (diffMins < 60)
            return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
        if (diffHours < 24)
            return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleUserMenu = () => {
        setIsUserMenuOpen((prev) => !prev);
        setIsNotificationMenuOpen(false);
    };

    // const toggleNotificationMenu = () => {
    //     setIsNotificationMenuOpen((prev) => !prev);
    //     setIsUserMenuOpen(false);
    //     if (!isNotificationMenuOpen) markAllAsRead();
    // };
    const toggleNotificationMenu = () => {
        setIsNotificationMenuOpen((prev) => !prev);
        setIsUserMenuOpen(false);
    };

    const handleLogout = async () => {
        try {
            await axios.post(route("logout"));
            window.location.href = "/login";
        } catch (error) {
            console.error("Logout error:", error);
            window.location.href = "/login";
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.patch(route("notifications.markAsRead", id));
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.patch(route("notifications.markAllAsRead"));
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await axios.delete(route("notifications.destroy", id));
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const clearAllNotifications = async () => {
        try {
            await axios.delete(route("notifications.clearAll"));
            setNotifications([]);
        } catch (error) {
            console.error("Error clearing notifications:", error);
        }
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    // Close menus on outside click or Escape
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target) &&
                (!notificationMenuRef.current ||
                    !notificationMenuRef.current.contains(event.target))
            ) {
                setIsUserMenuOpen(false);
                setIsNotificationMenuOpen(false);
            }
        };

        const handleEscapeKey = (event) => {
            if (event.key === "Escape") {
                setIsUserMenuOpen(false);
                setIsNotificationMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscapeKey);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscapeKey);
        };
    }, []);

    // Close on route change (Inertia)
    useEffect(() => {
        const handleRouteChange = () => {
            setIsUserMenuOpen(false);
            setIsNotificationMenuOpen(false);
        };
        window.addEventListener("popstate", handleRouteChange);
        return () => window.removeEventListener("popstate", handleRouteChange);
    }, []);

    return (
        <nav
            className={`fixed top-0 right-0 left-0 lg:left-auto lg:w-[98%] h-16 z-30 transition-all duration-300 ${
                isScrolled
                    ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/60"
                    : "bg-transparent"
            }`}
        >
            <div className="h-full px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-full">
                    {/* Left: Menu toggle (mobile) + Brand (optional) */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onMenuToggle}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            aria-label="Toggle menu"
                        >
                            <Menu className="w-5 h-5 text-gray-600" />
                        </button>

                        {/* Optional: Add a small brand/logo for mobile/tablet */}
                        {/* <div className="lg:hidden text-sm font-semibold text-gray-800">YourApp</div> */}
                    </div>

                    {/* Right: Notifications + User */}
                    <div className="flex items-center space-x-3">
                        {/* Notifications Bell */}
                        <div className="relative" ref={notificationMenuRef}>
                            <button
                                onClick={toggleNotificationMenu}
                                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                aria-expanded={isNotificationMenuOpen}
                                aria-haspopup="true"
                            >
                                <Bell className="w-5 h-5 text-gray-600" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </button>

                            {isNotificationMenuOpen && (
                                <div className="fixed lg:absolute lg:static inset-x-0 bottom-auto top-16 lg:top-auto lg:inset-x-auto lg:right-0 lg:mt-2 w-full lg:w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-40 max-h-[70vh] lg:max-h-none overflow-hidden">
                                    {/* Header */}
                                    <div className="px-4 py-2 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            Notifications
                                        </h3>
                                        <div className="flex space-x-2">
                                            {notifications.length > 0 && (
                                                <>
                                                    <button
                                                        onClick={markAllAsRead}
                                                        className="text-xs text-blue-600 hover:text-blue-800"
                                                    >
                                                        Mark all read
                                                    </button>
                                                    <button
                                                        onClick={
                                                            clearAllNotifications
                                                        }
                                                        className="text-xs text-red-600 hover:text-red-800"
                                                    >
                                                        Clear all
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="max-h-80 overflow-y-auto">
                                        {loading ? (
                                            <div className="px-4 py-8 text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    Loading...
                                                </p>
                                            </div>
                                        ) : notifications.length > 0 ? (
                                            <div className="py-1">
                                                {notifications.map(
                                                    (notification) => (
                                                        <div
                                                            key={
                                                                notification.id
                                                            }
                                                            className={`px-4 py-3 hover:bg-gray-50 border-l-4 ${
                                                                notification.read
                                                                    ? "border-transparent"
                                                                    : "border-blue-500 bg-blue-50"
                                                            }`}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {
                                                                            notification.title
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        {
                                                                            notification.description
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-gray-400 mt-2">
                                                                        {
                                                                            notification.time
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div className="flex space-x-1 ml-2 flex-shrink-0">
                                                                    {!notification.read && (
                                                                        <button
                                                                            onClick={() =>
                                                                                markAsRead(
                                                                                    notification.id,
                                                                                )
                                                                            }
                                                                            className="p-1 hover:bg-green-100 rounded"
                                                                            title="Mark as read"
                                                                        >
                                                                            <Check className="w-3 h-3 text-green-600" />
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() =>
                                                                            deleteNotification(
                                                                                notification.id,
                                                                            )
                                                                        }
                                                                        className="p-1 hover:bg-red-100 rounded"
                                                                        title="Delete"
                                                                    >
                                                                        <X className="w-3 h-3 text-red-600" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <div className="px-4 py-8 text-center">
                                                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                                <p className="text-sm text-gray-500">
                                                    No notifications
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    You're all caught up!
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Menu */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={toggleUserMenu}
                                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            >
                                <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-gray-200">
                                    {user?.image ? (
                                        <img
                                            src={user.image}
                                            alt={`${
                                                user.name || "User"
                                            } profile`}
                                            className="w-full h-full object-cover"
                                            onError={(e) =>
                                                (e.target.style.display =
                                                    "none")
                                            }
                                        />
                                    ) : (
                                        <UserCircle className="w-5 h-5 text-gray-500" />
                                    )}
                                </div>

                                {/* Show name only on sm+ */}
                                <span className="hidden sm:block text-sm font-medium text-gray-900">
                                    {user?.name || "Guest"}
                                </span>

                                <ChevronDown
                                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                                        isUserMenuOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-40">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {user?.name || "Guest"}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate mt-1">
                                            {user?.email || ""}
                                        </p>
                                    </div>
                                    <div className="border-t border-gray-100 pt-1">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="w-4 h-4 mr-3" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
