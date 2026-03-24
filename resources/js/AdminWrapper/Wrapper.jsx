import React, { useState, useEffect } from "react";

import { usePage } from "@inertiajs/react";
import NavBar from "./NavBar";
import SideBar from "./SideBar";


const Wrapper = ({ children }) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { props } = usePage();
    const user = props?.auth?.user || null;

    const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    // Close mobile sidebar on resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar onMenuToggle={toggleMobile} />
            <SideBar
                isMobileOpen={isMobileOpen}
                onMobileToggle={toggleMobile}
                user={user}
                isCollapsed={isCollapsed}
                onToggleCollapse={toggleCollapse}
            />

            <main
                className={`pt-10 min-h-screen  transition-all duration-300 ${
                    isCollapsed ? "lg:ml-16" : "lg:ml-64"
                }`}
            >
                <div className="p-4">{children}</div>
            </main>
        </div>
    );
};

export default Wrapper;
