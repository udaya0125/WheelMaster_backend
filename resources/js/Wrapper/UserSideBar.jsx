import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { RxDashboard } from "react-icons/rx";
import { BiMenu } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import {
    MdOutlineCalendarMonth,
    MdOutlineCalendarToday,
    MdOutlinePayment,
    MdOutlineDescription,
    MdOutlinePerson,
    MdOutlineHelpOutline,
} from "react-icons/md";
import logo from '../../../public/images/logo.png'

const UserSideBar = ({
    isMobileOpen,
    onMobileToggle,
    isCollapsed,
    onToggleCollapse,
}) => {
    const { url, props } = usePage();
    const currentPath = "/" + url.split("/")[1];
    const user = props?.auth?.user;

    const NAV_ITEMS = [
        { href: "/dashboard", label: "Dashboard", icon: RxDashboard },
        { href: "/my-booking", label: "My Bookings", icon: MdOutlineCalendarMonth },
        { href: "/book-lesson", label: "Book a Lesson", icon: MdOutlineCalendarToday },
        { href: "/my-payments", label: "Payments", icon: MdOutlinePayment },
        { href: "/my-documents", label: "Documents", icon: MdOutlineDescription },
        { href: "/profile", label: "My Profile", icon: MdOutlinePerson },
        { href: "/support", label: "Support", icon: MdOutlineHelpOutline },
    ];

    const isActive = (href) => currentPath === href;

    return (
        <>
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    style={{
                        background: "rgba(15,23,42,0.35)",
                        backdropFilter: "blur(4px)",
                    }}
                    onClick={onMobileToggle}
                />
            )}

            <div
                className={`
                    fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 ease-in-out bg-white
                    ${isCollapsed ? "w-[68px]" : "w-64"}
                    ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                {/* Header */}
                <div
                    className={`flex items-center h-16 px-4 flex-shrink-0 ${isCollapsed ? "justify-center" : "justify-between"}`}
                >
                    {!isCollapsed && (
                        <div className="flex justify-center items-center w-full py-2">
                            <Link href="/">
                                <img src={logo} className="w-40" />
                            </Link>
                        </div>
                    )}

                    {isCollapsed && (
                        <button
                            onClick={onToggleCollapse}
                            className="lg:flex w-7 h-7 rounded-full items-center justify-center border border-gray-200 bg-gray-50 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-110 hover:border-blue-300 ml-1"
                            title="Expand sidebar"
                        >
                            <BiMenu className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                    )}

                    {!isCollapsed && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={onToggleCollapse}
                                className="hidden lg:flex w-7 h-7 rounded-full items-center justify-center border border-gray-200 bg-gray-50 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-110 hover:border-blue-300 ml-1"
                                title="Collapse sidebar"
                            >
                                <BiMenu className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                            <button
                                onClick={onMobileToggle}
                                className="lg:hidden w-7 h-7 rounded-full flex items-center justify-center border border-gray-200 bg-gray-50 hover:shadow-md hover:scale-110 transition-all"
                            >
                                <IoClose className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Section label */}
                {!isCollapsed && (
                    <div className="px-5 pt-5 pb-2">
                        <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-gray-400">
                            My Account
                        </span>
                    </div>
                )}

                {/* Nav items */}
                <nav
                    className={`flex-1 overflow-y-auto overflow-x-hidden py-2 space-y-1 ${isCollapsed ? "px-2" : "px-2"}`}
                    style={{ scrollbarWidth: "none" }}
                >
                    {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                        const active = isActive(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                title={isCollapsed ? label : ""}
                                className={`
                                    relative flex items-center gap-3 rounded-xl transition-all duration-200 group
                                    ${isCollapsed ? "p-2.5 justify-center" : "p-2.5"}
                                    ${
                                        active
                                            ? "bg-[#2f2e7f] border border-gray-300 text-white"
                                            : "hover:bg-indigo-300/80 text-gray-700 hover:text-gray-800 hover:border hover:border-gray-200 border border-transparent"
                                    }
                                `}
                            >
                                <div
                                    className={`relative flex-shrink-0 ${isCollapsed ? "mx-auto" : ""}`}
                                >
                                    <Icon size={18} />
                                </div>

                                {!isCollapsed && (
                                    <span
                                        style={{
                                            fontSize: "14.5px",
                                            fontWeight: 500,
                                            letterSpacing: "0.01em",
                                        }}
                                    >
                                        {label}
                                    </span>
                                )}

                                {isCollapsed && (
                                    <div
                                        className="absolute left-full ml-3 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all duration-150 translate-x-1 group-hover:translate-x-0"
                                        style={{
                                            background: "#1e293b",
                                            color: "#f8fafc",
                                            borderColor: "rgba(255,255,255,0.06)",
                                            fontSize: "12.5px",
                                        }}
                                    >
                                        {label}
                                        <div
                                            className="absolute right-full top-1/2 -translate-y-1/2"
                                            style={{
                                                width: 0,
                                                height: 0,
                                                borderTop: "4px solid transparent",
                                                borderBottom: "4px solid transparent",
                                                borderRight: "4px solid #1e293b",
                                            }}
                                        />
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div
                    className="mx-4 mb-2"
                    style={{ borderTop: "1px solid #f3f4f6" }}
                />
            </div>
        </>
    );
};

export default UserSideBar;
