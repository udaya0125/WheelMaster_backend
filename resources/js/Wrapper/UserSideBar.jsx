// import React from "react";
// import { Link, usePage } from "@inertiajs/react";
// import { RxDashboard } from "react-icons/rx";
// import { BiMenu } from "react-icons/bi";
// import { IoClose } from "react-icons/io5";
// import {
//     MdOutlineCalendarMonth,
//     MdOutlineCalendarToday,
//     MdOutlinePayment,
//     MdOutlineDescription,
//     MdOutlinePerson,
//     MdOutlineHelpOutline,
// } from "react-icons/md";
// import logo from '../../../public/images/logo.png'

// const UserSideBar = ({
//     isMobileOpen,
//     onMobileToggle,
//     isCollapsed,
//     onToggleCollapse,
// }) => {
//     const { url, props } = usePage();
//     const currentPath = "/" + url.split("/")[1];
//     const user = props?.auth?.user;

//     const NAV_ITEMS = [
//         { href: "/dashboard", label: "Dashboard", icon: RxDashboard },
//         { href: "/my-booking", label: "My Bookings", icon: MdOutlineCalendarMonth },
//         { href: "/book-lesson", label: "Book a Lesson", icon: MdOutlineCalendarToday },
//         { href: "/my-payments", label: "Payments", icon: MdOutlinePayment },
//         { href: "/my-documents", label: "Documents", icon: MdOutlineDescription },
//         { href: "/profile", label: "My Profile", icon: MdOutlinePerson },
//         { href: "/support", label: "Support", icon: MdOutlineHelpOutline },
//     ];

//     const isActive = (href) => currentPath === href;

//     return (
//         <>
//             {isMobileOpen && (
//                 <div
//                     className="fixed inset-0 z-40 lg:hidden"
//                     style={{
//                         background: "rgba(15,23,42,0.35)",
//                         backdropFilter: "blur(4px)",
//                     }}
//                     onClick={onMobileToggle}
//                 />
//             )}

//             <div
//                 className={`
//                     fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 ease-in-out bg-white
//                     ${isCollapsed ? "w-[68px]" : "w-64"}
//                     ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
//                 `}
//             >
//                 {/* Header */}
//                 <div
//                     className={`flex items-center h-16 px-4 flex-shrink-0 ${isCollapsed ? "justify-center" : "justify-between"}`}
//                 >
//                     {!isCollapsed && (
//                         <div className="flex justify-center items-center w-full py-2">
//                             <Link href="/">
//                                 <img src={logo} className="w-40" />
//                             </Link>
//                         </div>
//                     )}

//                     {isCollapsed && (
//                         <button
//                             onClick={onToggleCollapse}
//                             className="lg:flex w-7 h-7 rounded-full items-center justify-center border border-gray-200 bg-gray-50 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-110 hover:border-blue-300 ml-1"
//                             title="Expand sidebar"
//                         >
//                             <BiMenu className="w-3.5 h-3.5 text-gray-500" />
//                         </button>
//                     )}

//                     {!isCollapsed && (
//                         <div className="flex items-center gap-1">
//                             <button
//                                 onClick={onToggleCollapse}
//                                 className="hidden lg:flex w-7 h-7 rounded-full items-center justify-center border border-gray-200 bg-gray-50 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-110 hover:border-blue-300 ml-1"
//                                 title="Collapse sidebar"
//                             >
//                                 <BiMenu className="w-3.5 h-3.5 text-gray-500" />
//                             </button>
//                             <button
//                                 onClick={onMobileToggle}
//                                 className="lg:hidden w-7 h-7 rounded-full flex items-center justify-center border border-gray-200 bg-gray-50 hover:shadow-md hover:scale-110 transition-all"
//                             >
//                                 <IoClose className="w-3.5 h-3.5 text-gray-500" />
//                             </button>
//                         </div>
//                     )}
//                 </div>

//                 {/* Section label */}
//                 {!isCollapsed && (
//                     <div className="px-5 pt-5 pb-2">
//                         <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-gray-400">
//                             My Account
//                         </span>
//                     </div>
//                 )}

//                 {/* Nav items */}
//                 <nav
//                     className={`flex-1 overflow-y-auto overflow-x-hidden py-2 space-y-1 ${isCollapsed ? "px-2" : "px-2"}`}
//                     style={{ scrollbarWidth: "none" }}
//                 >
//                     {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
//                         const active = isActive(href);
//                         return (
//                             <Link
//                                 key={href}
//                                 href={href}
//                                 title={isCollapsed ? label : ""}
//                                 className={`
//                                     relative flex items-center gap-3 rounded-xl transition-all duration-200 group
//                                     ${isCollapsed ? "p-2.5 justify-center" : "p-2.5"}
//                                     ${
//                                         active
//                                             ? "bg-[#2f2e7f] border border-gray-300 text-white"
//                                             : "hover:bg-indigo-300/80 text-gray-700 hover:text-gray-800 hover:border hover:border-gray-200 border border-transparent"
//                                     }
//                                 `}
//                             >
//                                 <div
//                                     className={`relative flex-shrink-0 ${isCollapsed ? "mx-auto" : ""}`}
//                                 >
//                                     <Icon size={18} />
//                                 </div>

//                                 {!isCollapsed && (
//                                     <span
//                                         style={{
//                                             fontSize: "14.5px",
//                                             fontWeight: 500,
//                                             letterSpacing: "0.01em",
//                                         }}
//                                     >
//                                         {label}
//                                     </span>
//                                 )}

//                                 {isCollapsed && (
//                                     <div
//                                         className="absolute left-full ml-3 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all duration-150 translate-x-1 group-hover:translate-x-0"
//                                         style={{
//                                             background: "#1e293b",
//                                             color: "#f8fafc",
//                                             borderColor: "rgba(255,255,255,0.06)",
//                                             fontSize: "12.5px",
//                                         }}
//                                     >
//                                         {label}
//                                         <div
//                                             className="absolute right-full top-1/2 -translate-y-1/2"
//                                             style={{
//                                                 width: 0,
//                                                 height: 0,
//                                                 borderTop: "4px solid transparent",
//                                                 borderBottom: "4px solid transparent",
//                                                 borderRight: "4px solid #1e293b",
//                                             }}
//                                         />
//                                     </div>
//                                 )}
//                             </Link>
//                         );
//                     })}
//                 </nav>

//                 <div
//                     className="mx-4 mb-2"
//                     style={{ borderTop: "1px solid #f3f4f6" }}
//                 />
//             </div>
//         </>
//     );
// };

// export default UserSideBar;


import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { RxDashboard } from "react-icons/rx";
import { BiMenu } from "react-icons/bi";
import { IoClose, IoChevronForward } from "react-icons/io5";
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
        { href: "/user-dashboard", label: "Dashboard", icon: RxDashboard },
        { href: "/my-booking", label: "My Bookings", icon: MdOutlineCalendarMonth },
        { href: "/profile", label: "My Profile", icon: MdOutlinePerson },
    ];

    const isActive = (href) => currentPath === href;

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((n) => n[0]?.toUpperCase())
            .join("");
    };

    return (
        <>
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden transition-opacity duration-300"
                    style={{
                        background: "rgba(15,23,42,0.4)",
                        backdropFilter: "blur(4px)",
                    }}
                    onClick={onMobileToggle}
                />
            )}

            <div
                className={`
                    fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 ease-in-out bg-white
                    border-r border-gray-100 shadow-[1px_0_0_0_rgba(0,0,0,0.02),4px_0_24px_-12px_rgba(15,23,42,0.06)]
                    ${isCollapsed ? "w-[68px]" : "w-64"}
                    ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                {/* Header */}
                <div
                    className={`flex items-center h-16 px-4 flex-shrink-0 border-b border-gray-50 ${isCollapsed ? "justify-center" : "justify-between"}`}
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
                            className="lg:flex w-8 h-8 rounded-full items-center justify-center border border-gray-200 bg-gray-50 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-110 hover:border-[#2f2e7f]/40 hover:bg-[#2f2e7f]/5 ml-1"
                            title="Expand sidebar"
                        >
                            <BiMenu className="w-4 h-4 text-gray-500" />
                        </button>
                    )}

                    {!isCollapsed && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={onToggleCollapse}
                                className="hidden lg:flex w-8 h-8 rounded-full items-center justify-center border border-gray-200 bg-gray-50 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-110 hover:border-[#2f2e7f]/40 hover:bg-[#2f2e7f]/5 ml-1"
                                title="Collapse sidebar"
                            >
                                <BiMenu className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                                onClick={onMobileToggle}
                                className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 bg-gray-50 hover:shadow-md hover:scale-110 transition-all"
                            >
                                <IoClose className="w-4 h-4 text-gray-500" />
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
                    className={`flex-1 overflow-y-auto overflow-x-hidden py-2 space-y-1 ${isCollapsed ? "px-2 pt-4" : "px-2"}`}
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
                                            ? "bg-gradient-to-r from-[#2f2e7f] to-[#3d3b9e] text-white shadow-sm shadow-[#2f2e7f]/20"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }
                                `}
                            >
                                {active && !isCollapsed && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 rounded-r-full bg-white/70" />
                                )}

                                <div
                                    className={`relative flex-shrink-0 transition-transform duration-200 ${isCollapsed ? "mx-auto" : ""} ${!active ? "group-hover:scale-110" : ""}`}
                                >
                                    <Icon size={18} />
                                </div>

                                {!isCollapsed && (
                                    <span
                                        style={{
                                            fontSize: "14.5px",
                                            fontWeight: active ? 600 : 500,
                                            letterSpacing: "0.01em",
                                        }}
                                    >
                                        {label}
                                    </span>
                                )}

                                {!isCollapsed && active && (
                                    <IoChevronForward className="ml-auto w-3.5 h-3.5 opacity-70" />
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

                {/* Footer profile card */}
                <div className="flex-shrink-0 p-3 border-t border-gray-50">
                    <Link
                        href="/profile"
                        title={isCollapsed ? (user?.name || "My Profile") : ""}
                        className={`flex items-center gap-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 group ${
                            isCollapsed ? "p-2 justify-center" : "p-2"
                        }`}
                    >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#2f2e7f] to-[#4a48b0] ring-2 ring-white shadow-sm flex-shrink-0">
                            {user?.image ? (
                                <img
                                    src={user.image}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-[11px] font-semibold text-white">
                                    {getInitials(user?.name)}
                                </span>
                            )}
                        </div>
                        {!isCollapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-semibold text-gray-800 truncate">
                                    {user?.name || "Guest"}
                                </p>
                                <p className="text-[11px] text-gray-400 truncate">
                                    {user?.email || "View profile"}
                                </p>
                            </div>
                        )}
                    </Link>
                </div>
            </div>
        </>
    );
};

export default UserSideBar;
