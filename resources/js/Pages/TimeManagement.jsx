import Wrapper from "@/AdminWrapper/Wrapper";
import { Clock, X } from "lucide-react";
import React from "react";

const TimeManagement = () => {
    return (
        <>
            <Wrapper>
                <div className="px-2 sm:px-6 lg:px-8 py-6 lg:py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Time Management</h1>
                    <button
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800 transition-colors w-full sm:w-auto"
                    >
                        <Clock size={18} />
                        <span>manage</span>
                    </button>
                </div>
                </div>
            </Wrapper>
        </>
    );
};

export default TimeManagement;
