import React from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    X,
    Menu,
    Image,
    MessageSquare,
    FileText,
    Package,
    Calendar,
    Shield,
    Users,
    LayoutDashboard,
    CalendarCheck,
    CalendarDays,
    Clock,
} from "lucide-react";

const SideBar = ({
    isMobileOpen,
    onMobileToggle,
    isCollapsed,
    onToggleCollapse,
}) => {
    const { url } = usePage();
    const currentPath = url.split("/")[1];

    const isActive = (href) => {
        const path = href.replace("/", "");
        return currentPath === path;
    };

    // Get authenticated user from auth prop
    const { auth } = usePage().props;
    const user = auth?.user;

    // Check The Role of the User
    const isAdmin = user?.role === "admin";

    return (
        <>
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onMobileToggle}
                />
            )}

            <div
                className={`
                    fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-50 transition-all duration-300
                    ${isCollapsed ? "w-16" : "w-64"}
                    ${
                        isMobileOpen
                            ? "translate-x-0"
                            : "-translate-x-full lg:translate-x-0"
                    }
                `}
            >
                {/* Header */}
                <div
                    className={`flex items-center justify-between p-4 border-b h-16 ${
                        isCollapsed ? "px-3" : ""
                    }`}
                >
                    {!isCollapsed && (
                        <div className="text-lg font-bold text-gray-800 whitespace-nowrap">
                           Wheel Master
                        </div>
                    )}
                    <div className="flex items-center space-x-1">
                        {/* Collapse Toggle Button - Only show on desktop */}
                        <button
                            onClick={onToggleCollapse}
                            className="hidden lg:flex p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            title={
                                isCollapsed
                                    ? "Expand sidebar"
                                    : "Collapse sidebar"
                            }
                        >
                            <Menu className="w-4 h-4 text-gray-600" />
                        </button>

                        {/* Mobile Close Button */}
                        <button
                            onClick={onMobileToggle}
                            className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Menu Items */}
                <div
                    className={`p-2 space-y-1 ${isCollapsed ? "px-2" : "px-3"}`}
                >
                    {/* Gallery */}
                    <Link
                        href="/dashboard"
                        className={`
                            flex items-center rounded-lg transition-colors duration-200 group relative
                            ${isCollapsed ? "p-3 justify-center" : "p-3"}
                            ${
                                isActive("/dashboard")
                                    ? "bg-gray-200 text-gray-600 "
                                    : "text-gray-600 hover:bg-gray-50"
                            }
                        `}
                        title={isCollapsed ? "Dashboard" : ""}
                    >
                        <LayoutDashboard
                            className={`
                            ${isCollapsed ? "w-5 h-5" : "w-5 h-5"}
                            ${
                                isActive("/dashboard")
                                    ? "text-gray-600"
                                    : "text-gray-500 group-hover:text-gray-700"
                            }
                        `}
                        />
                        {!isCollapsed && (
                            <span className="ml-3 font-medium whitespace-nowrap">
                                Dashboard
                            </span>
                        )}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                Dashboard
                            </div>
                        )}
                    </Link>

                    {/* Gallery */}
                    <Link
                        href="/gallery"
                        className={`
                            flex items-center rounded-lg transition-colors duration-200 group relative
                            ${isCollapsed ? "p-3 justify-center" : "p-3"}
                            ${
                                isActive("/gallery")
                                    ? "bg-gray-200 text-gray-600 "
                                    : "text-gray-600 hover:bg-gray-50"
                            }
                        `}
                        title={isCollapsed ? "Gallery" : ""}
                    >
                        <Image
                            className={`
                            ${isCollapsed ? "w-5 h-5" : "w-5 h-5"}
                            ${
                                isActive("/gallery")
                                    ? "text-gray-600"
                                    : "text-gray-500 group-hover:text-gray-700"
                            }
                        `}
                        />
                        {!isCollapsed && (
                            <span className="ml-3 font-medium whitespace-nowrap">
                                Gallery
                            </span>
                        )}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                Gallery
                            </div>
                        )}
                    </Link>

                    {/* Testimonial */}
                    <Link
                        href="/testimonial"
                        className={`
                            flex items-center rounded-lg transition-colors duration-200 group relative
                            ${isCollapsed ? "p-3 justify-center" : "p-3"}
                            ${
                                isActive("/testimonial")
                                    ? "bg-gray-200 text-gray-600"
                                    : "text-gray-600 hover:bg-gray-50"
                            }
                        `}
                        title={isCollapsed ? "Testimonial" : ""}
                    >
                        <MessageSquare
                            className={`
                            ${isCollapsed ? "w-5 h-5" : "w-5 h-5"}
                            ${
                                isActive("/testimonial")
                                    ? "text-gray-600"
                                    : "text-gray-500 group-hover:text-gray-700"
                            }
                        `}
                        />
                        {!isCollapsed && (
                            <span className="ml-3 font-medium whitespace-nowrap">
                                Testimonial
                            </span>
                        )}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                Testimonial
                            </div>
                        )}
                    </Link>

                    {/* Blog */}
                    <Link
                        href="/blog"
                        className={`
                            flex items-center rounded-lg transition-colors duration-200 group relative
                            ${isCollapsed ? "p-3 justify-center" : "p-3"}
                            ${
                                isActive("/blog")
                                    ? "bg-gray-200 text-gray-600"
                                    : "text-gray-600 hover:bg-gray-50"
                            }
                        `}
                        title={isCollapsed ? "Blog" : ""}
                    >
                        <FileText
                            className={`
                            ${isCollapsed ? "w-5 h-5" : "w-5 h-5"}
                            ${
                                isActive("/blog")
                                    ? "text-gray-600"
                                    : "text-gray-500 group-hover:text-gray-700"
                            }
                        `}
                        />
                        {!isCollapsed && (
                            <span className="ml-3 font-medium whitespace-nowrap">
                                Blog
                            </span>
                        )}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                Blog
                            </div>
                        )}
                    </Link>

                    {/* Price Package */}
                    <Link
                        href="/price-package"
                        className={`
                            flex items-center rounded-lg transition-colors duration-200 group relative
                            ${isCollapsed ? "p-3 justify-center" : "p-3"}
                            ${
                                isActive("/price-package")
                                    ? "bg-gray-200 text-gray-600"
                                    : "text-gray-600 hover:bg-gray-50"
                            }
                        `}
                        title={isCollapsed ? "Price Package" : ""}
                    >
                        <Package
                            className={`
                            ${isCollapsed ? "w-5 h-5" : "w-5 h-5"}
                            ${
                                isActive("/price-package")
                                    ? "text-gray-600"
                                    : "text-gray-500 group-hover:text-gray-700"
                            }
                        `}
                        />
                        {!isCollapsed && (
                            <span className="ml-3 font-medium whitespace-nowrap">
                                Price Package
                            </span>
                        )}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                Price Package
                            </div>
                        )}
                    </Link>

                    {/* Calendar Booking */}
                    <Link
                        href="/calendar-booking"
                        className={`
                            flex items-center rounded-lg transition-colors duration-200 group relative
                            ${isCollapsed ? "p-3 justify-center" : "p-3"}
                            ${
                                isActive("/calendar-booking")
                                    ? "bg-gray-200 text-gray-600 "
                                    : "text-gray-600 hover:bg-gray-50"
                            }
                        `}
                        title={isCollapsed ? "Booking" : ""}
                    >
                        <CalendarDays
                            className={`
                            ${isCollapsed ? "w-5 h-5" : "w-5 h-5"}
                            ${
                                isActive("/calendar-booking")
                                    ? "text-gray-600"
                                    : "text-gray-500 group-hover:text-gray-700"
                            }
                        `}
                        />
                        {!isCollapsed && (
                            <span className="ml-3 font-medium whitespace-nowrap">
                                Booking
                            </span>
                        )}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                Booking
                            </div>
                        )}
                    </Link>


                    {/* Time Management */}
                    <Link
                        href="/time-management"
                        className={`
                            flex items-center rounded-lg transition-colors duration-200 group relative
                            ${isCollapsed ? "p-3 justify-center" : "p-3"}
                            ${
                                isActive("/time-management")
                                    ? "bg-gray-200 text-gray-600 "
                                    : "text-gray-600 hover:bg-gray-50"
                            }
                        `}
                        title={isCollapsed ? "Time Management" : ""}
                    >
                        <Clock
                            className={`
                            ${isCollapsed ? "w-5 h-5" : "w-5 h-5"}
                            ${
                                isActive("/time-management")
                                    ? "text-gray-600"
                                    : "text-gray-500 group-hover:text-gray-700"
                            }
                        `}
                        />
                        {!isCollapsed && (
                            <span className="ml-3 font-medium whitespace-nowrap">
                                Time Management
                            </span>
                        )}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                Time Management
                            </div>
                        )}
                    </Link>

                    {/* User Reservation */}
                    <Link
                        href="/user-reservation"
                        className={`
                            flex items-center rounded-lg transition-colors duration-200 group relative
                            ${isCollapsed ? "p-3 justify-center" : "p-3"}
                            ${
                                isActive("/user-reservation")
                                    ? "bg-gray-200 text-gray-600"
                                    : "text-gray-600 hover:bg-gray-50"
                            }
                        `}
                        title={isCollapsed ? "User Reservation" : ""}
                    >
                        <Calendar
                            className={`
                            ${isCollapsed ? "w-5 h-5" : "w-5 h-5"}
                            ${
                                isActive("/user-reservation")
                                    ? "text-gray-600"
                                    : "text-gray-500 group-hover:text-gray-700"
                            }
                        `}
                        />
                        {!isCollapsed && (
                            <span className="ml-3 font-medium whitespace-nowrap">
                                User Reservation
                            </span>
                        )}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                User Reservation
                            </div>
                        )}
                    </Link>

                    {/* Block Reservation */}
                    <Link
                        href="/block-reservation"
                        className={`
                            flex items-center rounded-lg transition-colors duration-200 group relative
                            ${isCollapsed ? "p-3 justify-center" : "p-3"}
                            ${
                                isActive("/block-reservation")
                                    ? "bg-gray-200 text-gray-600"
                                    : "text-gray-600 hover:bg-gray-50"
                            }
                        `}
                        title={isCollapsed ? "Block Reservation" : ""}
                    >
                        <Shield
                            className={`
                            ${isCollapsed ? "w-5 h-5" : "w-5 h-5"}
                            ${
                                isActive("/block-reservation")
                                    ? "text-gray-600"
                                    : "text-gray-500 group-hover:text-gray-700"
                            }
                        `}
                        />
                        {!isCollapsed && (
                            <span className="ml-3 font-medium whitespace-nowrap">
                                Block Reservation
                            </span>
                        )}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                Block Reservation
                            </div>
                        )}
                    </Link>

                    {/* User Management */}
                    <Link
                        href="/user-management"
                        className={`
                                flex items-center rounded-lg transition-colors duration-200 group relative
                                ${isCollapsed ? "p-3 justify-center" : "p-3"}
                                ${
                                    isActive("/user-management")
                                        ? "bg-gray-200 text-gray-600 "
                                        : "text-gray-600 hover:bg-gray-50"
                                }
                            `}
                        title={isCollapsed ? "User Management" : ""}
                    >
                        <Users
                            className={`
                                ${isCollapsed ? "w-5 h-5" : "w-5 h-5"}
                                ${
                                    isActive("/user-management")
                                        ? "text-gray-600"
                                        : "text-gray-500 group-hover:text-gray-700"
                                }
                            `}
                        />
                        {!isCollapsed && (
                            <span className="ml-3 font-medium whitespace-nowrap">
                                User Management
                            </span>
                        )}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                User Management
                            </div>
                        )}
                    </Link>
                </div>
            </div>
        </>
    );
};

export default SideBar;
