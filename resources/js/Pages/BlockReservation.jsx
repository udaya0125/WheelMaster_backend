// import Wrapper from "@/AdminWrapper/Wrapper";
// import { Link } from "@inertiajs/react";
// import axios from "axios";
// import {
//     ChevronUp,
//     ChevronDown,
//     ChevronLeft,
//     ChevronRight,
//     X,
//     Clock,
//     Calendar,
// } from "lucide-react";
// import React, { useState, useMemo, useEffect } from "react";
// import { useTable, useSortBy, usePagination } from "react-table";

// const BlockReservation = () => {
//     const [blockedSlots, setBlockedSlots] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [showBlockSlotForm, setShowBlockSlotForm] = useState(false);
//     const [formData, setFormData] = useState({
//         date: "",
//         startTime: "09:00",
//         endTime: "10:00",
//         reason: "",
//     });
//     const [formError, setFormError] = useState("");
//     const [submitting, setSubmitting] = useState(false);
//     const [reloadTrigger, setReloadTrigger] = useState(false);

//     useEffect(() => {
//         const fetchBlockReservations = async () => {
//             try {
//                 setLoading(true);
//                 const response = await axios.get(
//                     route("ourblockreservations.index")
//                 );
//                 setBlockedSlots(response.data.data);
//             } catch (err) {
//                 console.error("Error fetching reservations:", err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchBlockReservations();
//     }, [reloadTrigger]);

//     // Calculate duration in hours with minutes
//     const calculateDuration = (startTime, endTime) => {
//         const [startHours, startMinutes] = startTime.split(':').map(Number);
//         const [endHours, endMinutes] = endTime.split(':').map(Number);
        
//         const startTotalMinutes = startHours * 60 + startMinutes;
//         const endTotalMinutes = endHours * 60 + endMinutes;
        
//         const durationMinutes = endTotalMinutes - startTotalMinutes;
        
//         // Return in hours with 2 decimal places
//         return (durationMinutes / 60).toFixed(2);
//     };

//     // handleDelete
//     const handleDelete = async (id) => {
//         try {
//             await axios.delete(
//                 route("ourblockreservations.destroy", { id: id })
//             );
//             setReloadTrigger((prev) => !prev);
//         } catch (error) {
//             console.log("Error deleting block reservation:", error);
//         }
//     };



//      const handleLogout = () => {
//         axios
//             .post(route("logout"))
//             .then((response) => {
//                 if (response.data.redirect) {
//                     window.location.href = response.data.redirect;
//                 } else {
//                     window.location.href = "/login";
//                 }
//             })
//             .catch((error) => {
//                 console.error("logout error:", error);
//                 console.error("Failed to logout. Please try again.");
//             });
//     };

//     // ======================================
//     // TIME SLOT MANAGEMENT
//     // ======================================
//     const openBlockSlotForm = () => {
//         setShowBlockSlotForm(true);
//         setFormData({
//             date: "",
//             startTime: "09:00",
//             endTime: "10:00",
//             reason: "",
//         });
//         setFormError("");
//     };

//     const closeBlockSlotForm = () => {
//         setShowBlockSlotForm(false);
//         setFormData({
//             date: "",
//             startTime: "09:00",
//             endTime: "10:00",
//             reason: "",
//         });
//         setFormError("");
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//         setFormError("");
//     };

//     const validateTimeSlot = (date, startTime, endTime) => {
//         if (!date) {
//             return "Please select a date";
//         }

//         if (!startTime || !endTime) {
//             return "Please select both start and end time";
//         }

//         if (startTime >= endTime) {
//             return "End time must be after start time";
//         }

//         // Check for overlapping slots on the same date
//         const hasOverlap = blockedSlots.some(
//             (slot) =>
//                 slot.date === date &&
//                 ((startTime >= slot.start_time && startTime < slot.end_time) ||
//                     (endTime > slot.start_time && endTime <= slot.end_time) ||
//                     (startTime <= slot.start_time && endTime >= slot.end_time))
//         );

//         if (hasOverlap) {
//             return "This time slot overlaps with an existing blocked slot";
//         }

//         return "";
//     };

//     const handleBlockSlotSubmit = async (e) => {
//         e.preventDefault();

//         const validationError = validateTimeSlot(
//             formData.date,
//             formData.startTime,
//             formData.endTime
//         );

//         if (validationError) {
//             setFormError(validationError);
//             return;
//         }

//         try {
//             setSubmitting(true);

//             const duration = calculateDuration(formData.startTime, formData.endTime);

//             const requestData = {
//                 date: formData.date,
//                 start_time: formData.startTime,
//                 end_time: formData.endTime,
//                 duration: duration,
//                 reason: formData.reason || "No reason provided",
//             };

//             await axios.post(
//                 route("ourblockreservations.store"),
//                 requestData
//             );

//             console.log(
//                 `Time slot blocked successfully: ${formData.date} ${formData.startTime}-${formData.endTime}`
//             );
            
//             setReloadTrigger((prev) => !prev);
//             closeBlockSlotForm();
//         } catch (err) {
//             console.error("Error blocking time slot:", err);
//             setFormError("Failed to block time slot. Please try again.");
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     // ======================================
//     // UNBLOCK SLOT
//     // ======================================
//     const handleUnblockSlot = async (slotId) => {
//         try {
//             await handleDelete(slotId);
//             console.log(`Time slot ${slotId} unblocked`);
//         } catch (error) {
//             console.error("Error unblocking slot:", error);
//         }
//     };

//     // ======================================
//     // TABLE COLUMNS
//     // ======================================
//     const columns = useMemo(
//         () => [
//             {
//                 Header: "ID",
//                 accessor: (row, i) => i + 1,
//                 id: "rowIndex",
//                 width: 60,
//             },
//             {
//                 Header: "Date",
//                 accessor: "date",
//                 Cell: ({ value }) => (
//                     <div className="flex items-center gap-2">
//                         <Calendar size={16} className="text-gray-400" />
//                         {value}
//                     </div>
//                 ),
//             },
//             {
//                 Header: "Time Slot",
//                 accessor: (row) => `${row.start_time} - ${row.end_time}`,
//                 id: "timeSlot",
//                 Cell: ({ row }) => (
//                     <div className="flex items-center gap-2">
//                         <Clock size={16} className="text-gray-400" />
//                         <span className="font-medium">
//                             {row.original.start_time} - {row.original.end_time}
//                         </span>
//                     </div>
//                 ),
//             },
//             {
//                 Header: "Duration",
//                 accessor: (row) => {
//                     const duration = calculateDuration(row.start_time, row.end_time);
//                     const hours = Math.floor(duration);
//                     const minutes = Math.round((duration - hours) * 60);
                    
//                     if (hours === 0) {
//                         return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
//                     } else if (minutes === 0) {
//                         return `${hours} hour${hours !== 1 ? 's' : ''}`;
//                     } else {
//                         return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
//                     }
//                 },
//                 id: "duration",
//             },
//             {
//                 Header: "Reason",
//                 accessor: "reason",
//                 Cell: ({ value }) => (
//                     <span className="max-w-xs truncate" title={value}>
//                         {value}
//                     </span>
//                 ),
//             },
//             {
//                 Header: "Actions",
//                 Cell: ({ row }) => (
//                     <div className="flex gap-2">
//                         <button
//                             onClick={() => handleUnblockSlot(row.original.id)}
//                             className="px-3 py-1 text-white bg-red-600 rounded hover:bg-red-700 text-sm transition-colors"
//                         >
//                             Delete
//                         </button>
//                     </div>
//                 ),
//             },
//         ],
//         []
//     );

//     // ======================================
//     // TABLE INIT
//     // ======================================
//     const {
//         getTableProps,
//         getTableBodyProps,
//         headerGroups,
//         page,
//         prepareRow,
//         canPreviousPage,
//         canNextPage,
//         pageOptions,
//         pageCount,
//         gotoPage,
//         nextPage,
//         previousPage,
//         setPageSize,
//         state: { pageIndex, pageSize },
//     } = useTable(
//         {
//             columns,
//             data: blockedSlots,
//             initialState: { pageIndex: 0, pageSize: 5 },
//         },
//         useSortBy,
//         usePagination
//     );

//     return (
//         <Wrapper>
//             {/* Block Slot Modal */}
//             {showBlockSlotForm && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//                     <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
//                         <div className="flex items-center justify-between p-6 border-b">
//                             <h2 className="text-xl font-semibold text-gray-800">
//                                 Block Time Slot
//                             </h2>
//                             <button
//                                 onClick={closeBlockSlotForm}
//                                 className="text-gray-400 hover:text-gray-600 transition-colors"
//                             >
//                                 <X size={24} />
//                             </button>
//                         </div>

//                         <form onSubmit={handleBlockSlotSubmit} className="p-6">
//                             <div className="space-y-4">
//                                 {/* Date Input */}
//                                 <div>
//                                     <label
//                                         htmlFor="date"
//                                         className="block text-sm font-medium text-gray-700 mb-2"
//                                     >
//                                         Date *
//                                     </label>
//                                     <input
//                                         type="date"
//                                         id="date"
//                                         name="date"
//                                         value={formData.date}
//                                         onChange={handleInputChange}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                         min={
//                                             new Date()
//                                                 .toISOString()
//                                                 .split("T")[0]
//                                         }
//                                         required
//                                     />
//                                 </div>

//                                 {/* Time Slot Selection - Allow any time input */}
//                                 <div className="grid grid-cols-2 gap-4">
//                                     <div>
//                                         <label
//                                             htmlFor="startTime"
//                                             className="block text-sm font-medium text-gray-700 mb-2"
//                                         >
//                                             Start Time *
//                                         </label>
//                                         <input
//                                             type="time"
//                                             id="startTime"
//                                             name="startTime"
//                                             value={formData.startTime}
//                                             onChange={handleInputChange}
//                                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                             required
//                                             // Removed step attribute to allow any time
//                                             min="00:00"
//                                             max="23:59"
//                                         />
//                                         <p className="text-xs text-gray-500 mt-1">
//                                             Any time (e.g., 10:15, 10:04)
//                                         </p>
//                                     </div>
//                                     <div>
//                                         <label
//                                             htmlFor="endTime"
//                                             className="block text-sm font-medium text-gray-700 mb-2"
//                                         >
//                                             End Time *
//                                         </label>
//                                         <input
//                                             type="time"
//                                             id="endTime"
//                                             name="endTime"
//                                             value={formData.endTime}
//                                             onChange={handleInputChange}
//                                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                             required
//                                             // Removed step attribute to allow any time
//                                             min="00:01"
//                                             max="23:59"
//                                         />
//                                         <p className="text-xs text-gray-500 mt-1">
//                                             Any time after start time
//                                         </p>
//                                     </div>
//                                 </div>

//                                 {/* Reason Input */}
//                                 <div>
//                                     <label
//                                         htmlFor="reason"
//                                         className="block text-sm font-medium text-gray-700 mb-2"
//                                     >
//                                         Reason (Optional)
//                                     </label>
//                                     <input
//                                         type="text"
//                                         id="reason"
//                                         name="reason"
//                                         value={formData.reason}
//                                         onChange={handleInputChange}
//                                         placeholder="Enter reason for blocking..."
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                     />
//                                 </div>

//                                 {/* Error Message */}
//                                 {formError && (
//                                     <div className="p-3 bg-red-50 border border-red-200 rounded-md">
//                                         <p className="text-sm text-red-600">
//                                             {formError}
//                                         </p>
//                                     </div>
//                                 )}
//                             </div>

//                             <div className="flex justify-end space-x-3 mt-6">
//                                 <button
//                                     type="button"
//                                     onClick={closeBlockSlotForm}
//                                     className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     disabled={submitting}
//                                     className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                                 >
//                                     {submitting ? "Blocking..." : "Block Time Slot"}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             <div className=" p-6">
//                 {/* <Link href={'/dashboard'} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
//                     <ChevronLeft size={20} />
//                     <span className="font-medium">Back to Dashboard</span>
//                 </Link> */}
//                 <div className="flex flex-wrap items-center justify-between mb-6 md:mb-8">
//                     <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
//                         Time Slot Management
//                     </h1>

//                     <button
//                         onClick={openBlockSlotForm}
//                         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800 transition-colors flex items-center gap-2"
//                     >
//                         <Clock size={18} />
//                         Block Time Slot
//                     </button>
//                 </div>

//                 {/* ================== TABLE ================== */}
//                 {loading ? (
//                     <div className="text-center py-8">
//                         <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
//                         <p className="mt-2 text-gray-600">
//                             Loading blocked time slots...
//                         </p>
//                     </div>
//                 ) : (
//                     <>
//                         <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
//                             <table
//                                 {...getTableProps()}
//                                 className="min-w-full divide-y divide-gray-200"
//                             >
//                                 <thead className="bg-gray-50">
//                                     {headerGroups.map((headerGroup) => (
//                                         <tr
//                                             {...headerGroup.getHeaderGroupProps()}
//                                         >
//                                             {headerGroup.headers.map(
//                                                 (column) => (
//                                                     <th
//                                                         {...column.getHeaderProps(
//                                                             column.getSortByToggleProps()
//                                                         )}
//                                                         className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                                                     >
//                                                         <div className="flex items-center">
//                                                             {column.render(
//                                                                 "Header"
//                                                             )}
//                                                             {column.isSorted ? (
//                                                                 column.isSortedDesc ? (
//                                                                     <ChevronDown
//                                                                         size={
//                                                                             16
//                                                                         }
//                                                                         className="ml-1"
//                                                                     />
//                                                                 ) : (
//                                                                     <ChevronUp
//                                                                         size={
//                                                                             16
//                                                                         }
//                                                                         className="ml-1"
//                                                                     />
//                                                                 )
//                                                             ) : (
//                                                                 ""
//                                                             )}
//                                                         </div>
//                                                     </th>
//                                                 )
//                                             )}
//                                         </tr>
//                                     ))}
//                                 </thead>

//                                 <tbody
//                                     {...getTableBodyProps()}
//                                     className="bg-white divide-y divide-gray-200"
//                                 >
//                                     {page.length > 0 ? (
//                                         page.map((row) => {
//                                             prepareRow(row);
//                                             return (
//                                                 <tr
//                                                     {...row.getRowProps()}
//                                                     className="hover:bg-gray-50 transition-colors"
//                                                 >
//                                                     {row.cells.map((cell) => (
//                                                         <td
//                                                             {...cell.getCellProps()}
//                                                             className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
//                                                         >
//                                                             {cell.render(
//                                                                 "Cell"
//                                                             )}
//                                                         </td>
//                                                     ))}
//                                                 </tr>
//                                             );
//                                         })
//                                     ) : (
//                                         <tr>
//                                             <td
//                                                 colSpan={columns.length}
//                                                 className="px-6 py-12 text-center text-gray-500"
//                                             >
//                                                 <div className="flex flex-col items-center justify-center">
//                                                     <Calendar
//                                                         size={48}
//                                                         className="text-gray-300 mb-3"
//                                                     />
//                                                     <span className="text-lg mb-2">
//                                                         No blocked time slots
//                                                     </span>
//                                                     <span className="text-sm text-gray-400 mb-4">
//                                                         Block time slots to
//                                                         manage reservations
//                                                     </span>
//                                                     <button
//                                                         onClick={
//                                                             openBlockSlotForm
//                                                         }
//                                                         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800 transition-colors text-sm"
//                                                     >
//                                                         Block Your First Time
//                                                         Slot
//                                                     </button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>

//                         {/* ========= PAGINATION ========= */}
//                         {blockedSlots.length > 0 && (
//                             <div className="flex items-center justify-between flex-col md:flex-row mt-4 gap-4">
//                                 <div className="flex items-center">
//                                     <span className="text-sm text-gray-700 mr-2">
//                                         Show
//                                     </span>

//                                     <select
//                                         value={pageSize}
//                                         onChange={(e) =>
//                                             setPageSize(Number(e.target.value))
//                                         }
//                                         className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                     >
//                                         {[5, 10, 20].map((size) => (
//                                             <option key={size} value={size}>
//                                                 {size}
//                                             </option>
//                                         ))}
//                                     </select>

//                                     <span className="text-sm text-gray-700 ml-2">
//                                         entries
//                                     </span>
//                                 </div>

//                                 <div className="flex items-center space-x-2">
//                                     <button
//                                         onClick={() => gotoPage(0)}
//                                         disabled={!canPreviousPage}
//                                         className={`p-1 rounded ${
//                                             !canPreviousPage
//                                                 ? "opacity-50 cursor-not-allowed"
//                                                 : "hover:bg-gray-200"
//                                         }`}
//                                     >
//                                         <ChevronLeft size={20} />
//                                     </button>

//                                     <button
//                                         onClick={() => previousPage()}
//                                         disabled={!canPreviousPage}
//                                         className={`px-3 py-1 rounded text-sm ${
//                                             !canPreviousPage
//                                                 ? "opacity-50 cursor-not-allowed"
//                                                 : "hover:bg-gray-200"
//                                         }`}
//                                     >
//                                         Previous
//                                     </button>

//                                     <span className="text-sm text-gray-700">
//                                         Page <strong>{pageIndex + 1}</strong> of{" "}
//                                         <strong>{pageOptions.length}</strong>
//                                     </span>

//                                     <button
//                                         onClick={() => nextPage()}
//                                         disabled={!canNextPage}
//                                         className={`px-3 py-1 rounded text-sm ${
//                                             !canNextPage
//                                                 ? "opacity-50 cursor-not-allowed"
//                                                 : "hover:bg-gray-200"
//                                         }`}
//                                     >
//                                         Next
//                                     </button>

//                                     <button
//                                         onClick={() => gotoPage(pageCount - 1)}
//                                         disabled={!canNextPage}
//                                         className={`p-1 rounded ${
//                                             !canNextPage
//                                                 ? "opacity-50 cursor-not-allowed"
//                                                 : "hover:bg-gray-200"
//                                         }`}
//                                     >
//                                         <ChevronRight size={20} />
//                                     </button>
//                                 </div>
//                             </div>
//                         )}
//                     </>
//                 )}
//             </div>
//         </Wrapper>
//     );
// };

// export default BlockReservation;


import Wrapper from "@/AdminWrapper/Wrapper";
import { Link } from "@inertiajs/react";
import axios from "axios";
import {
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    X,
    Clock,
    Calendar,
} from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";
import { useTable, useSortBy, usePagination } from "react-table";

const BlockReservation = () => {
    const [blockedSlots, setBlockedSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBlockSlotForm, setShowBlockSlotForm] = useState(false);
    const [formData, setFormData] = useState({
        date: "",
        startTime: "09:00",
        endTime: "10:00",
        reason: "",
    });
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [reloadTrigger, setReloadTrigger] = useState(false);

    useEffect(() => {
        const fetchBlockReservations = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    route("ourblockreservations.index")
                );
                setBlockedSlots(response.data.data);
            } catch (err) {
                console.error("Error fetching reservations:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlockReservations();
    }, [reloadTrigger]);

    const calculateDuration = (startTime, endTime) => {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;
        const durationMinutes = endTotalMinutes - startTotalMinutes;
        return (durationMinutes / 60).toFixed(2);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(route("ourblockreservations.destroy", { id }));
            setReloadTrigger((prev) => !prev);
        } catch (error) {
            console.log("Error deleting block reservation:", error);
        }
    };

    const handleLogout = () => {
        axios
            .post(route("logout"))
            .then((response) => {
                if (response.data.redirect) {
                    window.location.href = response.data.redirect;
                } else {
                    window.location.href = "/login";
                }
            })
            .catch((error) => {
                console.error("logout error:", error);
                console.error("Failed to logout. Please try again.");
            });
    };

    // Time Slot Management
    const openBlockSlotForm = () => {
        setShowBlockSlotForm(true);
        setFormData({ date: "", startTime: "09:00", endTime: "10:00", reason: "" });
        setFormError("");
    };

    const closeBlockSlotForm = () => {
        setShowBlockSlotForm(false);
        setFormData({ date: "", startTime: "09:00", endTime: "10:00", reason: "" });
        setFormError("");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setFormError("");
    };

    const validateTimeSlot = (date, startTime, endTime) => {
        if (!date) return "Please select a date";
        if (!startTime || !endTime) return "Please select both start and end time";
        if (startTime >= endTime) return "End time must be after start time";

        const hasOverlap = blockedSlots.some(
            (slot) =>
                slot.date === date &&
                ((startTime >= slot.start_time && startTime < slot.end_time) ||
                    (endTime > slot.start_time && endTime <= slot.end_time) ||
                    (startTime <= slot.start_time && endTime >= slot.end_time))
        );

        if (hasOverlap) return "This time slot overlaps with an existing blocked slot";
        return "";
    };

    const handleBlockSlotSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateTimeSlot(formData.date, formData.startTime, formData.endTime);
        if (validationError) {
            setFormError(validationError);
            return;
        }

        try {
            setSubmitting(true);
            const duration = calculateDuration(formData.startTime, formData.endTime);
            const requestData = {
                date: formData.date,
                start_time: formData.startTime,
                end_time: formData.endTime,
                duration: duration,
                reason: formData.reason || "No reason provided",
            };

            await axios.post(route("ourblockreservations.store"), requestData);

            setReloadTrigger((prev) => !prev);
            closeBlockSlotForm();
        } catch (err) {
            console.error("Error blocking time slot:", err);
            setFormError("Failed to block time slot. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUnblockSlot = async (slotId) => {
        try {
            await handleDelete(slotId);
            console.log(`Time slot ${slotId} unblocked`);
        } catch (error) {
            console.error("Error unblocking slot:", error);
        }
    };

    // Table Columns
    const columns = useMemo(
        () => [
            {
                Header: "ID",
                accessor: (row, i) => i + 1,
                id: "rowIndex",
                width: 60,
            },
            {
                Header: "Date",
                accessor: "date",
                Cell: ({ value }) => (
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{value}</span>
                    </div>
                ),
            },
            {
                Header: "Time Slot",
                accessor: (row) => `${row.start_time} - ${row.end_time}`,
                id: "timeSlot",
                Cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="font-medium truncate">
                            {row.original.start_time} - {row.original.end_time}
                        </span>
                    </div>
                ),
            },
            {
                Header: "Duration",
                accessor: (row) => {
                    const duration = calculateDuration(row.start_time, row.end_time);
                    const hours = Math.floor(duration);
                    const minutes = Math.round((duration - hours) * 60);
                    if (hours === 0) return `${minutes} min${minutes !== 1 ? 's' : ''}`;
                    if (minutes === 0) return `${hours} hr${hours !== 1 ? 's' : ''}`;
                    return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
                },
                id: "duration",
            },
            {
                Header: "Reason",
                accessor: "reason",
                Cell: ({ value }) => (
                    <span className="truncate" title={value}>
                        {value || "—"}
                    </span>
                ),
            },
            {
                Header: "Actions",
                Cell: ({ row }) => (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleUnblockSlot(row.original.id)}
                            className="px-2 py-1 text-xs sm:text-sm  text-white bg-red-600 rounded hover:bg-red-700 transition-colors whitespace-nowrap"
                        >
                            Delete
                        </button>
                    </div>
                ),
            },
        ],
        []
    );

    // Table Hooks
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        prepareRow,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },
    } = useTable(
        {
            columns,
            data: blockedSlots,
            initialState: { pageIndex: 0, pageSize: 5 },
        },
        useSortBy,
        usePagination
    );

    return (
        <Wrapper>
            {/* Block Slot Modal */}
            {showBlockSlotForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Block Time Slot</h2>
                            <button
                                onClick={closeBlockSlotForm}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleBlockSlotSubmit} className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        id="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min={new Date().toISOString().split("T")[0]}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                                            Start Time *
                                        </label>
                                        <input
                                            type="time"
                                            id="startTime"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                            min="00:00"
                                            max="23:59"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">e.g., 10:15</p>
                                    </div>
                                    <div>
                                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                                            End Time *
                                        </label>
                                        <input
                                            type="time"
                                            id="endTime"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                            min="00:01"
                                            max="23:59"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">after start time</p>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                                        Reason (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        id="reason"
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Staff meeting"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {formError && (
                                    <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-md">
                                        <p className="text-sm text-red-600">{formError}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={closeBlockSlotForm}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? "Blocking..." : "Block Time Slot"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="px-2 sm:px-6 lg:px-8 py-6 lg:py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Time Slot Management</h1>
                    <button
                        onClick={openBlockSlotForm}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 rounded-full text-white  hover:bg-blue-800 transition-colors w-full sm:w-auto"
                    >
                        <Clock size={18} />
                        <span>Block</span>
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <p className="mt-2 text-gray-600">Loading blocked time slots...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
                            <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    {headerGroups.map((headerGroup) => (
                                        <tr {...headerGroup.getHeaderGroupProps()}>
                                            {headerGroup.headers.map((column) => (
                                                <th
                                                    {...column.getHeaderProps(column.getSortByToggleProps())}
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    <div className="flex items-center">
                                                        {column.render("Header")}
                                                        {column.isSorted ? (
                                                            column.isSortedDesc ? (
                                                                <ChevronDown size={14} className="ml-1" />
                                                            ) : (
                                                                <ChevronUp size={14} className="ml-1" />
                                                            )
                                                        ) : null}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
                                    {page.length > 0 ? (
                                        page.map((row) => {
                                            prepareRow(row);
                                            return (
                                                <tr {...row.getRowProps()} className="hover:bg-gray-50">
                                                    {row.cells.map((cell) => (
                                                        <td
                                                            {...cell.getCellProps()}
                                                            className="px-4 py-3 text-sm text-gray-900"
                                                        >
                                                            {cell.render("Cell")}
                                                        </td>
                                                    ))}
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center">
                                                    <Calendar size={40} className="text-gray-300 mb-2" />
                                                    <p className="text-base font-medium mb-1">No blocked time slots</p>
                                                    <p className="text-sm text-gray-400 mb-3">Block time slots to manage reservations</p>
                                                    <button
                                                        onClick={openBlockSlotForm}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800 text-sm"
                                                    >
                                                        Block Your First Time Slot
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {blockedSlots.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                                <div className="flex items-center flex-wrap gap-2">
                                    <span className="text-sm text-gray-700">Show</span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => setPageSize(Number(e.target.value))}
                                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {[5, 10, 20].map((size) => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                    <span className="text-sm text-gray-700">entries</span>
                                </div>

                                <div className="flex items-center flex-wrap justify-center gap-1 sm:gap-2">
                                    <button
                                        onClick={() => gotoPage(0)}
                                        disabled={!canPreviousPage}
                                        className={`p-1 rounded ${!canPreviousPage ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={() => previousPage()}
                                        disabled={!canPreviousPage}
                                        className={`px-2 py-1 text-sm rounded ${!canPreviousPage ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
                                    >
                                        Prev
                                    </button>
                                    <span className="text-sm text-gray-700 whitespace-nowrap">
                                        Page <strong>{pageIndex + 1}</strong> of <strong>{pageOptions.length}</strong>
                                    </span>
                                    <button
                                        onClick={() => nextPage()}
                                        disabled={!canNextPage}
                                        className={`px-2 py-1 text-sm rounded ${!canNextPage ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
                                    >
                                        Next
                                    </button>
                                    <button
                                        onClick={() => gotoPage(pageCount - 1)}
                                        disabled={!canNextPage}
                                        className={`p-1 rounded ${!canNextPage ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Wrapper>
    );
};

export default BlockReservation;