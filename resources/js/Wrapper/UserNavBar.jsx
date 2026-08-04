// import React, { useState, useRef, useEffect } from "react";
// import {
//     Menu,
//     UserCircle,
//     LogOut,
//     ChevronDown,
// } from "lucide-react";
// import { Link, usePage } from "@inertiajs/react";
// import axios from "axios";

// const UserNavBar = ({ onMenuToggle }) => {
//     const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
//     const [isScrolled, setIsScrolled] = useState(false);
//     const userMenuRef = useRef(null);
//     const { auth } = usePage().props;
//     const user = auth?.user;

//     useEffect(() => {
//         const handleScroll = () => {
//             setIsScrolled(window.scrollY > 0);
//         };

//         handleScroll();
//         window.addEventListener("scroll", handleScroll, { passive: true });
//         return () => window.removeEventListener("scroll", handleScroll);
//     }, []);

//     const toggleUserMenu = () => {
//         setIsUserMenuOpen((prev) => !prev);
//     };

//     const handleLogout = async () => {
//         try {
//             await axios.post(route("logout"));
//             window.location.href = "/login";
//         } catch (error) {
//             console.error("Logout error:", error);
//             window.location.href = "/login";
//         }
//     };

//     // Close menu on outside click or Escape
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (
//                 userMenuRef.current &&
//                 !userMenuRef.current.contains(event.target)
//             ) {
//                 setIsUserMenuOpen(false);
//             }
//         };

//         const handleEscapeKey = (event) => {
//             if (event.key === "Escape") {
//                 setIsUserMenuOpen(false);
//             }
//         };

//         document.addEventListener("mousedown", handleClickOutside);
//         document.addEventListener("keydown", handleEscapeKey);
//         return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//             document.removeEventListener("keydown", handleEscapeKey);
//         };
//     }, []);

//     // Close on route change (Inertia)
//     useEffect(() => {
//         const handleRouteChange = () => {
//             setIsUserMenuOpen(false);
//         };
//         window.addEventListener("popstate", handleRouteChange);
//         return () => window.removeEventListener("popstate", handleRouteChange);
//     }, []);

//     return (
//         <nav
//             className={`fixed top-0 right-0 left-0 lg:left-auto lg:w-[98%] h-16 z-30 transition-all duration-300 ${
//                 isScrolled
//                     ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/60"
//                     : "bg-transparent"
//             }`}
//         >
//             <div className="h-full px-4 sm:px-6 lg:px-8">
//                 <div className="flex items-center justify-between h-full">
//                     {/* Left: Menu toggle (mobile) */}
//                     <div className="flex items-center space-x-4">
//                         <button
//                             onClick={onMenuToggle}
//                             className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//                             aria-label="Toggle menu"
//                         >
//                             <Menu className="w-5 h-5 text-gray-600" />
//                         </button>
//                     </div>

//                     {/* Right: User */}
//                     <div className="flex items-center space-x-3">
//                         {/* User Menu */}
//                         <div className="relative" ref={userMenuRef}>
//                             <button
//                                 onClick={toggleUserMenu}
//                                 className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//                             >
//                                 <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-gray-200">
//                                     {user?.image ? (
//                                         <img
//                                             src={user.image}
//                                             alt={`${
//                                                 user.name || "User"
//                                             } profile`}
//                                             className="w-full h-full object-cover"
//                                             onError={(e) =>
//                                                 (e.target.style.display =
//                                                     "none")
//                                             }
//                                         />
//                                     ) : (
//                                         <UserCircle className="w-5 h-5 text-gray-500" />
//                                     )}
//                                 </div>

//                                 {/* Show name only on sm+ */}
//                                 <span className="hidden sm:block text-sm font-medium text-gray-900">
//                                     {user?.name || "Guest"}
//                                 </span>

//                                 <ChevronDown
//                                     className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
//                                         isUserMenuOpen ? "rotate-180" : ""
//                                     }`}
//                                 />
//                             </button>

//                             {isUserMenuOpen && (
//                                 <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-40">
//                                     <div className="px-4 py-3 border-b border-gray-100">
//                                         <p className="text-sm font-medium text-gray-900 truncate">
//                                             {user?.name || "Guest"}
//                                         </p>
//                                         <p className="text-sm text-gray-500 truncate mt-1">
//                                             {user?.email || ""}
//                                         </p>
//                                     </div>
//                                     <div className="border-t border-gray-100 pt-1">
//                                         <Link
//                                             // href={route("profile.edit")}
//                                             className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                                         >
//                                             <UserCircle className="w-4 h-4 mr-3" />
//                                             My Profile
//                                         </Link>
//                                         <button
//                                             onClick={handleLogout}
//                                             className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//                                         >
//                                             <LogOut className="w-4 h-4 mr-3" />
//                                             Sign Out
//                                         </button>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </nav>
//     );
// };

// export default UserNavBar;



import React, { useState, useRef, useEffect } from "react";
import {
    Menu,
    UserCircle,
    LogOut,
    ChevronDown,
    Settings,
} from "lucide-react";
import { Link, usePage } from "@inertiajs/react";
import axios from "axios";

const UserNavBar = ({ onMenuToggle }) => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const userMenuRef = useRef(null);
    const { auth } = usePage().props;
    const user = auth?.user;

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

    // Close menu on outside click or Escape
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target)
            ) {
                setIsUserMenuOpen(false);
            }
        };

        const handleEscapeKey = (event) => {
            if (event.key === "Escape") {
                setIsUserMenuOpen(false);
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
        };
        window.addEventListener("popstate", handleRouteChange);
        return () => window.removeEventListener("popstate", handleRouteChange);
    }, []);

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
        <nav
            className={`fixed top-0 right-0 left-0 lg:left-auto lg:w-[98%] h-16 z-30 transition-all duration-300 ${
                isScrolled
                    ? "bg-white/85 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.04),0_4px_16px_-8px_rgba(15,23,42,0.12)] border-b border-gray-200/60"
                    : "bg-white/40 backdrop-blur-sm"
            }`}
        >
            <div className="h-full px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-full">
                    {/* Left: Menu toggle (mobile) + greeting */}
                    <div className="flex items-center space-x-4 min-w-0">
                        <button
                            onClick={onMenuToggle}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2f2e7f]/30"
                            aria-label="Toggle menu"
                        >
                            <Menu className="w-5 h-5 text-gray-600" />
                        </button>   
                    </div>

                    {/* Right: User */}
                    <div className="flex items-center space-x-3">
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={toggleUserMenu}
                                className={`flex items-center space-x-2 py-1.5 pl-1.5 pr-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2f2e7f]/30 ${
                                    isUserMenuOpen
                                        ? "bg-gray-100 shadow-inner"
                                        : "hover:bg-gray-100"
                                }`}
                            >
                                <div className="relative w-8 h-8 flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#2f2e7f] to-[#4a48b0] ring-2 ring-white shadow-sm">
                                        {user?.image ? (
                                            <img
                                                src={user.image}
                                                alt={`${user.name || "User"} profile`}
                                                className="w-full h-full object-cover"
                                                onError={(e) =>
                                                    (e.target.style.display = "none")
                                                }
                                            />
                                        ) : (
                                            <span className="text-xs font-semibold text-white">
                                                {getInitials(user?.name)}
                                            </span>
                                        )}
                                    </div>
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
                                </div>

                                <span className="hidden sm:block text-sm font-medium text-gray-900 max-w-[120px] truncate">
                                    {user?.name || "Guest"}
                                </span>

                                <ChevronDown
                                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                                        isUserMenuOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {isUserMenuOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-black/[0.08] border border-gray-100 py-2 z-40 overflow-hidden"
                                    style={{ animation: "dropdownIn 0.16s cubic-bezier(0.16, 1, 0.3, 1)" }}
                                >
                                    <div className="px-4 py-3.5 bg-gradient-to-br from-[#2f2e7f]/[0.04] to-transparent border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#2f2e7f] to-[#4a48b0] ring-2 ring-white shadow-sm flex-shrink-0">
                                                {user?.image ? (
                                                    <img
                                                        src={user.image}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-semibold text-white">
                                                        {getInitials(user?.name)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {user?.name || "Guest"}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                                    {user?.email || ""}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-1.5 px-1.5">
                                        <Link
                                            href="/profile"
                                            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors group"
                                        >
                                            <UserCircle className="w-4 h-4 mr-3 text-gray-400 group-hover:text-[#2f2e7f] transition-colors" />
                                            My Profile
                                        </Link>
                                        <div className="my-1.5 border-t border-gray-100" />
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors mb-1"
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

            <style>{`
                @keyframes dropdownIn {
                    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </nav>
    );
};

export default UserNavBar;
