// import React, { useState, useEffect } from "react";
// import UserNavBar from "./UserNavBar";
// import UserSideBar from "./UserSideBar";

// const UserWrapper = ({ children }) => {
//     const [isMobileOpen, setIsMobileOpen] = useState(false);
//     const [isCollapsed, setIsCollapsed] = useState(() => {
//         if (typeof window === "undefined") return false;
//         return window.localStorage.getItem("user-sidebar-collapsed") === "true";
//     });

//     const SIDEBAR_WIDTH = isCollapsed ? 68 : 256;

//     const toggleMobile = () => setIsMobileOpen((prev) => !prev);
//     const toggleCollapse = () => setIsCollapsed((prev) => !prev);

//     // Sync CSS variable for navbar width calculation
//     useEffect(() => {
//         document.documentElement.style.setProperty("--sidebar-width", `${SIDEBAR_WIDTH}px`);
//     }, [SIDEBAR_WIDTH]);

//     useEffect(() => {
//         const handleResize = () => {
//             if (window.innerWidth >= 1024) setIsMobileOpen(false);
//         };
//         window.addEventListener("resize", handleResize);
//         return () => window.removeEventListener("resize", handleResize);
//     }, []);

//     useEffect(() => {
//         window.localStorage.setItem("user-sidebar-collapsed", String(isCollapsed));
//     }, [isCollapsed]);

//     return (
//         <div className="min-h-screen bg-[#f2f2f2]">
//             <UserNavBar onMenuToggle={toggleMobile} />

//             <UserSideBar
//                 isMobileOpen={isMobileOpen}
//                 onMobileToggle={toggleMobile}
//                 isCollapsed={isCollapsed}
//                 onToggleCollapse={toggleCollapse}
//             />

//             <main
//                 className="pt-16 min-h-screen transition-all duration-300 ease-in-out"
//                 style={{ marginLeft: `${SIDEBAR_WIDTH}px` }}
//             >
//                 <div className="lg:p-2 p-3">
//                     <div style={{ animation: "pageIn 0.25s ease-out" }}>
//                         {children}
//                     </div>
//                 </div>
//             </main>

//             <style>{`
//                 @media (max-width: 1023px) {
//                     main { margin-left: 0 !important; }
//                 }
//                 @keyframes pageIn {
//                     from { opacity: 0; transform: translateY(6px); }
//                     to   { opacity: 1; transform: translateY(0); }
//                 }
//             `}</style>
//         </div>
//     );
// };

// export default UserWrapper;



import React, { useState, useEffect } from "react";
import UserNavBar from "./UserNavBar";
import UserSideBar from "./UserSideBar";

const UserWrapper = ({ children }) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.localStorage.getItem("user-sidebar-collapsed") === "true";
    });

    const SIDEBAR_WIDTH = isCollapsed ? 68 : 256;

    const toggleMobile = () => setIsMobileOpen((prev) => !prev);
    const toggleCollapse = () => setIsCollapsed((prev) => !prev);

    // Sync CSS variable for navbar width calculation
    useEffect(() => {
        document.documentElement.style.setProperty("--sidebar-width", `${SIDEBAR_WIDTH}px`);
    }, [SIDEBAR_WIDTH]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setIsMobileOpen(false);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        window.localStorage.setItem("user-sidebar-collapsed", String(isCollapsed));
    }, [isCollapsed]);

    return (
        <div
            className="min-h-screen"
            style={{
                background:
                    "radial-gradient(1200px circle at 0% 0%, rgba(47,46,127,0.05), transparent 40%), radial-gradient(900px circle at 100% 0%, rgba(79,70,229,0.04), transparent 35%), #f4f4f6",
            }}
        >
            <UserNavBar onMenuToggle={toggleMobile} />

            <UserSideBar
                isMobileOpen={isMobileOpen}
                onMobileToggle={toggleMobile}
                isCollapsed={isCollapsed}
                onToggleCollapse={toggleCollapse}
            />

            <main
                className="pt-16 min-h-screen transition-all duration-300 ease-in-out"
                style={{ marginLeft: `${SIDEBAR_WIDTH}px` }}
            >
                <div className="lg:p-5 p-3">
                    <div
                        className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.08)] min-h-[calc(100vh-6.5rem)] p-4 lg:p-6"
                        style={{ animation: "pageIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
                    >
                        {children}
                    </div>
                </div>
            </main>

            <style>{`
                @media (max-width: 1023px) {
                    main { margin-left: 0 !important; }
                }
                @keyframes pageIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default UserWrapper;
