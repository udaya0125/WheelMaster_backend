import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { RxDashboard } from "react-icons/rx";
import { BiMenu } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import {
    MdOutlineImage,
    MdOutlineChatBubbleOutline,
    MdOutlineArticle,
    MdOutlineInventory2,
    MdOutlineCalendarToday,
    MdOutlineAccessTime,
    MdOutlineCalendarMonth,
    MdOutlineShield,
    MdOutlinePeople,
    MdOutlineAccessTimeFilled,
} from "react-icons/md";
import { FaRegCalendarTimes } from "react-icons/fa";
import { PiTimer } from "react-icons/pi";

const SideBar = ({
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
        { href: "/gallery", label: "Gallery", icon: MdOutlineImage },
        { href: "/testimonial", label: "Testimonial", icon: MdOutlineChatBubbleOutline },
        { href: "/blog", label: "Blog", icon: MdOutlineArticle },
        { href: "/price-package", label: "Price Package", icon: MdOutlineInventory2 },
        { href: "/calendar-booking", label: "Booking", icon: MdOutlineCalendarToday },
        { href: "/time-management", label: "Time Management", icon: MdOutlineAccessTime },
        {href: "/block-time", label: "Block Time", icon: PiTimer }, 
        { href: "/user-reservation", label: "User Reservation", icon: MdOutlineCalendarMonth },
        { href: "/block-reservation", label: "Block Reservation", icon: FaRegCalendarTimes },
        { href: "/user-management", label: "User Management", icon: MdOutlinePeople },
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
                    fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 ease-in-out
                    ${isCollapsed ? "w-[68px]" : "w-64"}
                    ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
                style={{
                    background: "#ffffff",
                    borderRight: "1px solid #e5e7eb",
                    boxShadow: "2px 0 12px rgba(0,0,0,0.05)",
                }}
            >
                {/* Header */}
                <div
                    className={`flex items-center h-16 px-4 flex-shrink-0 ${isCollapsed ? "justify-center" : "justify-between"}`}
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                >
                    {!isCollapsed && (
                        <div className="flex justify-center items-center w-full py-2">
                            <Link href="/">
                                <span className="text-lg font-bold text-gray-800">Wheel Master</span>
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
                            Main Menu
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
                                            ? "bg-gray-200 border border-gray-300"
                                            : "hover:bg-gray-100/80 text-gray-700 hover:text-gray-800 hover:border hover:border-gray-200 border border-transparent"
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

export default SideBar;



// import React from "react";
// import { Link, usePage } from "@inertiajs/react";
// import { RiCloseLine, RiMenuLine } from "react-icons/ri";
// import { MdOutlineImage, MdOutlineChatBubbleOutline, MdOutlineArticle, MdOutlineInventory2, MdOutlineCalendarMonth, MdOutlineShield, MdOutlinePeople, MdOutlineDashboard, MdOutlineCalendarToday, MdOutlineAccessTime } from "react-icons/md";

// const SideBar = ({
//     isMobileOpen,
//     onMobileToggle,
//     isCollapsed,
//     onToggleCollapse,
// }) => {
//     const { url } = usePage();
//     const currentPath = url.split("/")[1];

//     const isActive = (href) => {
//         const path = href.replace("/", "");
//         return currentPath === path;
//     };

//     // Get authenticated user from auth prop
//     const { auth } = usePage().props;
//     const user = auth?.user;

//     // Check The Role of the User
//     const isAdmin = user?.role === "admin";

//     return (
//         <>
//             {isMobileOpen && (
//                 <div
//                     className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//                     onClick={onMobileToggle}
//                 />
//             )}

//             <div
//                 className={`
//                     fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-50 transition-all duration-300
//                     ${isCollapsed ? "w-16" : "w-64"}
//                     ${
//                         isMobileOpen
//                             ? "translate-x-0"
//                             : "-translate-x-full lg:translate-x-0"
//                     }
//                 `}
//             >
//                 {/* Header */}
//                 <div
//                     className={`flex items-center justify-between p-4 border-b h-16 ${
//                         isCollapsed ? "px-3" : ""
//                     }`}
//                 >
//                     {!isCollapsed && (
//                         <Link
//                             href="/"
//                             className="text-lg font-bold text-gray-800 whitespace-nowrap"
//                         >
//                             Wheel Master
//                         </Link>
//                     )}
//                     <div className="flex items-center space-x-1">
//                         {/* Collapse Toggle Button - Only show on desktop */}
//                         <button
//                             onClick={onToggleCollapse}
//                             className="hidden lg:flex p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200"
//                             title={
//                                 isCollapsed
//                                     ? "Expand sidebar"
//                                     : "Collapse sidebar"
//                             }
//                         >
//                             <RiMenuLine className="w-4 h-4 text-gray-600" />
//                         </button>

//                         {/* Mobile Close Button */}
//                         <button
//                             onClick={onMobileToggle}
//                             className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200"
//                         >
//                             <RiCloseLine className="w-4 h-4" />
//                         </button>
//                     </div>
//                 </div>

//                 {/* Menu Items */}
//                 <div
//                     className={`p-2 space-y-1 ${isCollapsed ? "px-2" : "px-3"}`}
//                 >
//                     {/* Dashboard */}
//                     <Link
//                         href="/dashboard"
//                         className={`
//                             flex items-center rounded-lg transition-colors duration-200 group relative
//                             ${isCollapsed ? "p-3 justify-center" : "p-3"}
//                             ${
//                                 isActive("/dashboard")
//                                     ? "bg-gray-200 text-gray-600 "
//                                     : "text-gray-600 hover:bg-gray-50"
//                             }
//                         `}
//                         title={isCollapsed ? "Dashboard" : ""}
//                     >
//                         <MdOutlineDashboard
//                             className={`
//                             w-5 h-5
//                             ${
//                                 isActive("/dashboard")
//                                     ? "text-gray-600"
//                                     : "text-gray-500 group-hover:text-gray-700"
//                             }
//                         `}
//                         />
//                         {!isCollapsed && (
//                             <span className="ml-3 font-medium whitespace-nowrap">
//                                 Dashboard
//                             </span>
//                         )}
//                         {isCollapsed && (
//                             <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
//                                 Dashboard
//                             </div>
//                         )}
//                     </Link>

//                     {/* Gallery */}
//                     <Link
//                         href="/gallery"
//                         className={`
//                             flex items-center rounded-lg transition-colors duration-200 group relative
//                             ${isCollapsed ? "p-3 justify-center" : "p-3"}
//                             ${
//                                 isActive("/gallery")
//                                     ? "bg-gray-200 text-gray-600 "
//                                     : "text-gray-600 hover:bg-gray-50"
//                             }
//                         `}
//                         title={isCollapsed ? "Gallery" : ""}
//                     >
//                         <MdOutlineImage
//                             className={`
//                             w-5 h-5
//                             ${
//                                 isActive("/gallery")
//                                     ? "text-gray-600"
//                                     : "text-gray-500 group-hover:text-gray-700"
//                             }
//                         `}
//                         />
//                         {!isCollapsed && (
//                             <span className="ml-3 font-medium whitespace-nowrap">
//                                 Gallery
//                             </span>
//                         )}
//                         {isCollapsed && (
//                             <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
//                                 Gallery
//                             </div>
//                         )}
//                     </Link>

//                     {/* Testimonial */}
//                     <Link
//                         href="/testimonial"
//                         className={`
//                             flex items-center rounded-lg transition-colors duration-200 group relative
//                             ${isCollapsed ? "p-3 justify-center" : "p-3"}
//                             ${
//                                 isActive("/testimonial")
//                                     ? "bg-gray-200 text-gray-600"
//                                     : "text-gray-600 hover:bg-gray-50"
//                             }
//                         `}
//                         title={isCollapsed ? "Testimonial" : ""}
//                     >
//                         <MdOutlineChatBubbleOutline
//                             className={`
//                             w-5 h-5
//                             ${
//                                 isActive("/testimonial")
//                                     ? "text-gray-600"
//                                     : "text-gray-500 group-hover:text-gray-700"
//                             }
//                         `}
//                         />
//                         {!isCollapsed && (
//                             <span className="ml-3 font-medium whitespace-nowrap">
//                                 Testimonial
//                             </span>
//                         )}
//                         {isCollapsed && (
//                             <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
//                                 Testimonial
//                             </div>
//                         )}
//                     </Link>

//                     {/* Blog */}
//                     <Link
//                         href="/blog"
//                         className={`
//                             flex items-center rounded-lg transition-colors duration-200 group relative
//                             ${isCollapsed ? "p-3 justify-center" : "p-3"}
//                             ${
//                                 isActive("/blog")
//                                     ? "bg-gray-200 text-gray-600"
//                                     : "text-gray-600 hover:bg-gray-50"
//                             }
//                         `}
//                         title={isCollapsed ? "Blog" : ""}
//                     >
//                         <MdOutlineArticle
//                             className={`
//                             w-5 h-5
//                             ${
//                                 isActive("/blog")
//                                     ? "text-gray-600"
//                                     : "text-gray-500 group-hover:text-gray-700"
//                             }
//                         `}
//                         />
//                         {!isCollapsed && (
//                             <span className="ml-3 font-medium whitespace-nowrap">
//                                 Blog
//                             </span>
//                         )}
//                         {isCollapsed && (
//                             <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
//                                 Blog
//                             </div>
//                         )}
//                     </Link>

//                     {/* Price Package */}
//                     <Link
//                         href="/price-package"
//                         className={`
//                             flex items-center rounded-lg transition-colors duration-200 group relative
//                             ${isCollapsed ? "p-3 justify-center" : "p-3"}
//                             ${
//                                 isActive("/price-package")
//                                     ? "bg-gray-200 text-gray-600"
//                                     : "text-gray-600 hover:bg-gray-50"
//                             }
//                         `}
//                         title={isCollapsed ? "Price Package" : ""}
//                     >
//                         <MdOutlineInventory2
//                             className={`
//                             w-5 h-5
//                             ${
//                                 isActive("/price-package")
//                                     ? "text-gray-600"
//                                     : "text-gray-500 group-hover:text-gray-700"
//                             }
//                         `}
//                         />
//                         {!isCollapsed && (
//                             <span className="ml-3 font-medium whitespace-nowrap">
//                                 Price Package
//                             </span>
//                         )}
//                         {isCollapsed && (
//                             <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
//                                 Price Package
//                             </div>
//                         )}
//                     </Link>

//                     {/* Calendar Booking */}
//                     <Link
//                         href="/calendar-booking"
//                         className={`
//                             flex items-center rounded-lg transition-colors duration-200 group relative
//                             ${isCollapsed ? "p-3 justify-center" : "p-3"}
//                             ${
//                                 isActive("/calendar-booking")
//                                     ? "bg-gray-200 text-gray-600 "
//                                     : "text-gray-600 hover:bg-gray-50"
//                             }
//                         `}
//                         title={isCollapsed ? "Booking" : ""}
//                     >
//                         <MdOutlineCalendarToday
//                             className={`
//                             w-5 h-5
//                             ${
//                                 isActive("/calendar-booking")
//                                     ? "text-gray-600"
//                                     : "text-gray-500 group-hover:text-gray-700"
//                             }
//                         `}
//                         />
//                         {!isCollapsed && (
//                             <span className="ml-3 font-medium whitespace-nowrap">
//                                 Booking
//                             </span>
//                         )}
//                         {isCollapsed && (
//                             <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
//                                 Booking
//                             </div>
//                         )}
//                     </Link>

//                     {/* Time Management */}
//                     <Link
//                         href="/time-management"
//                         className={`
//                             flex items-center rounded-lg transition-colors duration-200 group relative
//                             ${isCollapsed ? "p-3 justify-center" : "p-3"}
//                             ${
//                                 isActive("/time-management")
//                                     ? "bg-gray-200 text-gray-600 "
//                                     : "text-gray-600 hover:bg-gray-50"
//                             }
//                         `}
//                         title={isCollapsed ? "Time Management" : ""}
//                     >
//                         <MdOutlineAccessTime
//                             className={`
//                             w-5 h-5
//                             ${
//                                 isActive("/time-management")
//                                     ? "text-gray-600"
//                                     : "text-gray-500 group-hover:text-gray-700"
//                             }
//                         `}
//                         />
//                         {!isCollapsed && (
//                             <span className="ml-3 font-medium whitespace-nowrap">
//                                 Time Management
//                             </span>
//                         )}
//                         {isCollapsed && (
//                             <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
//                                 Time Management
//                             </div>
//                         )}
//                     </Link>

//                     {/* User Reservation */}
//                     <Link
//                         href="/user-reservation"
//                         className={`
//                             flex items-center rounded-lg transition-colors duration-200 group relative
//                             ${isCollapsed ? "p-3 justify-center" : "p-3"}
//                             ${
//                                 isActive("/user-reservation")
//                                     ? "bg-gray-200 text-gray-600"
//                                     : "text-gray-600 hover:bg-gray-50"
//                             }
//                         `}
//                         title={isCollapsed ? "User Reservation" : ""}
//                     >
//                         <MdOutlineCalendarMonth
//                             className={`
//                             w-5 h-5
//                             ${
//                                 isActive("/user-reservation")
//                                     ? "text-gray-600"
//                                     : "text-gray-500 group-hover:text-gray-700"
//                             }
//                         `}
//                         />
//                         {!isCollapsed && (
//                             <span className="ml-3 font-medium whitespace-nowrap">
//                                 User Reservation
//                             </span>
//                         )}
//                         {isCollapsed && (
//                             <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
//                                 User Reservation
//                             </div>
//                         )}
//                     </Link>

//                     {/* Block Reservation */}
//                     <Link
//                         href="/block-reservation"
//                         className={`
//                             flex items-center rounded-lg transition-colors duration-200 group relative
//                             ${isCollapsed ? "p-3 justify-center" : "p-3"}
//                             ${
//                                 isActive("/block-reservation")
//                                     ? "bg-gray-200 text-gray-600"
//                                     : "text-gray-600 hover:bg-gray-50"
//                             }
//                         `}
//                         title={isCollapsed ? "Block Reservation" : ""}
//                     >
//                         <MdOutlineShield
//                             className={`
//                             w-5 h-5
//                             ${
//                                 isActive("/block-reservation")
//                                     ? "text-gray-600"
//                                     : "text-gray-500 group-hover:text-gray-700"
//                             }
//                         `}
//                         />
//                         {!isCollapsed && (
//                             <span className="ml-3 font-medium whitespace-nowrap">
//                                 Block Reservation
//                             </span>
//                         )}
//                         {isCollapsed && (
//                             <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
//                                 Block Reservation
//                             </div>
//                         )}
//                     </Link>

//                     {/* User Management */}
//                     <Link
//                         href="/user-management"
//                         className={`
//                                 flex items-center rounded-lg transition-colors duration-200 group relative
//                                 ${isCollapsed ? "p-3 justify-center" : "p-3"}
//                                 ${
//                                     isActive("/user-management")
//                                         ? "bg-gray-200 text-gray-600 "
//                                         : "text-gray-600 hover:bg-gray-50"
//                                 }
//                             `}
//                         title={isCollapsed ? "User Management" : ""}
//                     >
//                         <MdOutlinePeople
//                             className={`
//                                 w-5 h-5
//                                 ${
//                                     isActive("/user-management")
//                                         ? "text-gray-600"
//                                         : "text-gray-500 group-hover:text-gray-700"
//                                 }
//                             `}
//                         />
//                         {!isCollapsed && (
//                             <span className="ml-3 font-medium whitespace-nowrap">
//                                 User Management
//                             </span>
//                         )}
//                         {isCollapsed && (
//                             <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
//                                 User Management
//                             </div>
//                         )}
//                     </Link>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default SideBar;