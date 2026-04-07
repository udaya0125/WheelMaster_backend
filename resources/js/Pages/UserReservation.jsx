// import {
//     ChevronUp,
//     ChevronDown,
//     ChevronLeft,
//     ChevronRight,
//     X,
//     Plus,
//     Edit,
//     Trash2,
//     Eye,
// } from "lucide-react";
// import React, { useState, useMemo, useEffect } from "react";
// import axios from "axios";
// import { Link } from "@inertiajs/react";
// import Wrapper from "@/AdminWrapper/Wrapper";
// import MyTable from "@/MyTable/MyTable";
// import AddReservationForm from "@/AddFormComponent/AddReservationForm";

// const UserReservation = () => {
//     const [reservations, setReservations] = useState([]);
//     const [filteredReservations, setFilteredReservations] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [refreshTrigger, setRefreshTrigger] = useState(0);
//     const [updatingId, setUpdatingId] = useState(null);
//     const [filter, setFilter] = useState("all");

//     // Form states
//     const [isFormOpen, setIsFormOpen] = useState(false);
//     const [selectedReservation, setSelectedReservation] = useState(null);
//     const [deleteConfirm, setDeleteConfirm] = useState(null);

//     // View modal states
//     const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//     const [viewingReservation, setViewingReservation] = useState(null);

//     // ======================================
//     // FETCH RESERVATIONS
//     // ======================================
//     useEffect(() => {
//         const fetchReservations = async () => {
//             try {
//                 setLoading(true);
//                 const response = await axios.get(
//                     route("ouruserreservations.index"),
//                 );
//                 const sorted = [...response.data.data].sort(
//                     (a, b) => new Date(b.created_at) - new Date(a.created_at),
//                 );
//                 setReservations(sorted);
//                 setError(null);
//             } catch (err) {
//                 setError("Failed to load reservations");
//                 console.error("Error fetching reservations:", err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchReservations();
//     }, [refreshTrigger]);

//     // ======================================
//     // FILTER RESERVATIONS
//     // ======================================
//     useEffect(() => {
//         if (!reservations.length) {
//             setFilteredReservations([]);
//             return;
//         }

//         switch (filter) {
//             case "accepted":
//                 setFilteredReservations(
//                     reservations.filter((r) => r.status === "Accepted"),
//                 );
//                 break;
//             case "rejected":
//                 setFilteredReservations(
//                     reservations.filter((r) => r.status === "Rejected"),
//                 );
//                 break;
//             case "pending":
//                 setFilteredReservations(
//                     reservations.filter((r) => r.status === "Pending"),
//                 );
//                 break;
//             default:
//                 setFilteredReservations(reservations);
//                 break;
//         }
//     }, [reservations, filter]);

//     // ======================================
//     // ACCEPT / REJECT / RESET RESERVATION
//     // ======================================
//     const updateStatus = async (id, status) => {
//         try {
//             setUpdatingId(id);

//             const response = await axios.put(
//                 route("ouruserreservations.update", { id: id }),
//                 { status: status },
//             );

//             if (response.data.success) {
//                 setReservations((prev) =>
//                     prev.map((r) =>
//                         r.id === id ? { ...r, status: status } : r,
//                     ),
//                 );

//                 // Also update the viewing reservation if it's the same one
//                 if (viewingReservation && viewingReservation.id === id) {
//                     setViewingReservation({
//                         ...viewingReservation,
//                         status: status,
//                     });
//                 }

//                 console.log(
//                     `Reservation ${id} ${status.toLowerCase()} successfully`,
//                 );
//                 setRefreshTrigger((prev) => prev + 1);
//             } else {
//                 setError(
//                     response.data.message ||
//                         "Failed to update reservation status",
//                 );
//             }
//         } catch (err) {
//             console.error("Error updating reservation:", err);

//             if (err.response && err.response.data) {
//                 setError(
//                     err.response.data.message ||
//                         "Failed to update reservation status",
//                 );
//             } else {
//                 setError(
//                     "Failed to update reservation status. Please try again.",
//                 );
//             }
//         } finally {
//             setUpdatingId(null);
//         }
//     };

//     // ======================================
//     // DELETE RESERVATION
//     // ======================================
//     const deleteReservation = async (id) => {
//         try {
//             setUpdatingId(id);

//             const response = await axios.delete(
//                 route("ouruserreservations.destroy", { id: id }),
//             );

//             if (response.data.success) {
//                 setReservations((prev) => prev.filter((r) => r.id !== id));
//                 setDeleteConfirm(null);

//                 // Close view modal if the deleted reservation was being viewed
//                 if (viewingReservation && viewingReservation.id === id) {
//                     setIsViewModalOpen(false);
//                     setViewingReservation(null);
//                 }

//                 setRefreshTrigger((prev) => prev + 1);
//             } else {
//                 setError(
//                     response.data.message || "Failed to delete reservation",
//                 );
//             }
//         } catch (err) {
//             console.error("Error deleting reservation:", err);
//             setError("Failed to delete reservation. Please try again.");
//         } finally {
//             setUpdatingId(null);
//         }
//     };

//     // ======================================
//     // HANDLE EDIT RESERVATION
//     // ======================================
//     const handleEditReservation = (reservation) => {
//         setSelectedReservation(reservation);
//         setIsFormOpen(true);
//         setIsViewModalOpen(false); // Close view modal if open
//     };

//     // ======================================
//     // HANDLE VIEW RESERVATION
//     // ======================================
//     const handleViewReservation = (reservation) => {
//         setViewingReservation(reservation);
//         setIsViewModalOpen(true);
//     };

//     // ======================================
//     // HANDLE ADD RESERVATION
//     // ======================================
//     const handleAddReservation = () => {
//         setSelectedReservation(null);
//         setIsFormOpen(true);
//     };

//     // ======================================
//     // HANDLE FORM SUCCESS
//     // ======================================
//     const handleFormSuccess = (data) => {
//         setRefreshTrigger((prev) => prev + 1);
//     };

//     // ======================================
//     // CLOSE VIEW MODAL
//     // ======================================
//     const closeViewModal = () => {
//         setIsViewModalOpen(false);
//         setViewingReservation(null);
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
//                 Header: "User",
//                 accessor: "user_name",
//             },
//             {
//                 Header: "Email",
//                 accessor: "email",
//             },
//             {
//                 Header: "Address",
//                 accessor: "address",
//                 Cell: ({ value }) => value || "-",
//             },
//             {
//                 Header: "Phone",
//                 accessor: "phone",
//                 Cell: ({ value }) =>
//                     value ? (
//                         <a
//                             href={`tel:${value}`}
//                             style={{ textDecoration: "none", color: "inherit" }}
//                         >
//                             {value}
//                         </a>
//                     ) : (
//                         "-"
//                     ),
//             },
//             {
//                 Header: "Package Type",
//                 accessor: "package_type",
//                 Cell: ({ value }) => value || "-",
//             },
//             {
//                 Header: "Status",
//                 accessor: "status",
//                 Cell: ({ value }) => (
//                     <span
//                         className={`px-2 py-1 rounded text-xs font-semibold
//                         ${
//                             value === "Pending"
//                                 ? "bg-yellow-100 text-yellow-600"
//                                 : value === "Accepted"
//                                   ? "bg-green-100 text-green-600"
//                                   : "bg-red-100 text-red-600"
//                         }`}
//                     >
//                         {value}
//                     </span>
//                 ),
//             },
//             {
//                 Header: "Actions",
//                 Cell: ({ row }) => (
//                     <div className="flex gap-2">
//                         {/* View Button */}
//                         <button
//                             onClick={() => handleViewReservation(row.original)}
//                             disabled={updatingId === row.original.id}
//                             className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
//                             title="View Details"
//                         >
//                             <Eye size={18} />
//                         </button>

//                         {/* Edit Button - UNCOMMENTED */}
//                         <button
//                             onClick={() => handleEditReservation(row.original)}
//                             disabled={updatingId === row.original.id}
//                             className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
//                             title="Edit"
//                         >
//                             <Edit size={18} />
//                         </button>

//                         {/* Delete Button */}
//                         {deleteConfirm === row.original.id ? (
//                             <>
//                                 <button
//                                     onClick={() =>
//                                         deleteReservation(row.original.id)
//                                     }
//                                     disabled={updatingId === row.original.id}
//                                     className="px-3 py-1 text-white bg-red-600 rounded hover:bg-red-700 text-sm transition-colors"
//                                 >
//                                     Confirm
//                                 </button>
//                                 <button
//                                     onClick={() => setDeleteConfirm(null)}
//                                     className="px-3 py-1 text-white bg-gray-600 rounded hover:bg-gray-700 text-sm transition-colors"
//                                 >
//                                     Cancel
//                                 </button>
//                             </>
//                         ) : (
//                             <button
//                                 onClick={() =>
//                                     setDeleteConfirm(row.original.id)
//                                 }
//                                 disabled={updatingId === row.original.id}
//                                 className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
//                                 title="Delete"
//                             >
//                                 <Trash2 size={18} />
//                             </button>
//                         )}
//                     </div>
//                 ),
//             },
//         ],
//         [updatingId, deleteConfirm],
//     );

//     const handleLogout = () => {
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

//     return (
//         <Wrapper>
//             <div className="px-2 sm:px-6 lg:px-8 py-6 lg:py-8">
//                 {/* Error Alert */}
//                 {error && (
//                     <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
//                         <div className="flex items-center justify-between">
//                             <span>{error}</span>
//                             <button
//                                 onClick={() => setError(null)}
//                                 className="text-red-500 hover:text-red-700"
//                             >
//                                 <X size={16} />
//                             </button>
//                         </div>
//                     </div>
//                 )}

//                 {/* ================== RESERVATIONS TABLE ================== */}
//                 <div>
//                     <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
//                         <h2 className="font-semibold text-gray-700 text-lg mb-4 md:mb-0">
//                             User Reservations
//                         </h2>

//                         {/* Filter Buttons and Add Button */}
//                         <div className="flex flex-wrap gap-2">
//                             {/* Add New Reservation Button */}
//                             <button
//                                 onClick={handleAddReservation}
//                                 className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
//                             >
//                                 <Plus size={16} />
//                                 Add Reservation
//                             </button>

//                             <button
//                                 onClick={() => setFilter("all")}
//                                 className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
//                                     filter === "all"
//                                         ? "bg-blue-600 text-white"
//                                         : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                                 }`}
//                             >
//                                 All ({reservations.length})
//                             </button>
//                             <button
//                                 onClick={() => setFilter("pending")}
//                                 className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
//                                     filter === "pending"
//                                         ? "bg-yellow-600 text-white"
//                                         : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                                 }`}
//                             >
//                                 <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
//                                 Pending (
//                                 {
//                                     reservations.filter(
//                                         (r) => r.status === "Pending",
//                                     ).length
//                                 }
//                                 )
//                             </button>
//                             <button
//                                 onClick={() => setFilter("accepted")}
//                                 className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
//                                     filter === "accepted"
//                                         ? "bg-green-600 text-white"
//                                         : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                                 }`}
//                             >
//                                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
//                                 Accepted (
//                                 {
//                                     reservations.filter(
//                                         (r) => r.status === "Accepted",
//                                     ).length
//                                 }
//                                 )
//                             </button>
//                             <button
//                                 onClick={() => setFilter("rejected")}
//                                 className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
//                                     filter === "rejected"
//                                         ? "bg-red-600 text-white"
//                                         : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                                 }`}
//                             >
//                                 <div className="w-2 h-2 rounded-full bg-red-500"></div>
//                                 Rejected (
//                                 {
//                                     reservations.filter(
//                                         (r) => r.status === "Rejected",
//                                     ).length
//                                 }
//                                 )
//                             </button>
//                         </div>
//                     </div>

//                     {loading ? (
//                         <div className="text-center py-8">
//                             <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                             <p className="mt-2 text-gray-600">
//                                 Loading reservations...
//                             </p>
//                         </div>
//                     ) : (
//                         <>
//                             {filteredReservations.length > 0 ? (
//                                 <MyTable
//                                     columns={columns}
//                                     data={filteredReservations}
//                                 />
//                             ) : (
//                                 <div className="text-center py-8 bg-white rounded-xl border border-blue-100 shadow-sm">
//                                     <div className="flex flex-col items-center justify-center">
//                                         <span className="text-lg mb-2 text-gray-700">
//                                             No reservations found
//                                         </span>
//                                         <span className="text-sm text-gray-400">
//                                             {filter === "all"
//                                                 ? "All reservations will appear here"
//                                                 : `No ${filter.toLowerCase()} reservations found`}
//                                         </span>
//                                         {filter !== "all" && (
//                                             <button
//                                                 onClick={() => setFilter("all")}
//                                                 className="mt-4 px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
//                                             >
//                                                 Show all reservations
//                                             </button>
//                                         )}
//                                     </div>
//                                 </div>
//                             )}
//                         </>
//                     )}
//                 </div>
//             </div>

//             {/* View Reservation Modal */}
//             {isViewModalOpen && viewingReservation && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//                         <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
//                             <h3 className="text-lg font-semibold text-gray-900">
//                                 Reservation Details of{" "}
//                                 {viewingReservation.user_name}
//                             </h3>
//                             <button
//                                 onClick={closeViewModal}
//                                 className="text-gray-400 hover:text-gray-600 transition-colors"
//                             >
//                                 <X size={20} />
//                             </button>
//                         </div>

//                         <div className="p-6">
//                             {/* Status Badge */}
//                             <div className="mb-6 flex justify-between items-center">
//                                 <span className="text-sm font-medium text-gray-500">
//                                     Current Status:
//                                 </span>
//                                 <span
//                                     className={`px-3 py-1 rounded-full text-sm font-semibold
//                                     ${
//                                         viewingReservation.status === "Pending"
//                                             ? "bg-yellow-100 text-yellow-600"
//                                             : viewingReservation.status ===
//                                                 "Accepted"
//                                               ? "bg-green-100 text-green-600"
//                                               : "bg-red-100 text-red-600"
//                                     }`}
//                                 >
//                                     {viewingReservation.status}
//                                 </span>
//                             </div>

//                             {/* Reservation Details Grid */}
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                 {/* User Information */}
//                                 <div className="bg-gray-50 rounded-lg p-4">
//                                     <h4 className="font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">
//                                         User Information
//                                     </h4>
//                                     <div className="space-y-2">
//                                         <div>
//                                             <span className="text-sm text-gray-500">
//                                                 Name:
//                                             </span>
//                                             <p className="text-gray-900 font-medium">
//                                                 {viewingReservation.user_name}
//                                             </p>
//                                         </div>
//                                         <div>
//                                             <span className="text-sm text-gray-500">
//                                                 Email:
//                                             </span>
//                                             <p className="text-gray-900">
//                                                 {viewingReservation.email}
//                                             </p>
//                                         </div>
//                                         <div>
//                                             <span className="text-sm text-gray-500">
//                                                 Phone:
//                                             </span>
//                                             <p className="text-gray-900">
//                                                 {viewingReservation.phone ? (
//                                                     <a
//                                                         href={`tel:${viewingReservation.phone}`}
//                                                         className="text-gray-900 hover:text-blue-600"
//                                                     >
//                                                         {
//                                                             viewingReservation.phone
//                                                         }
//                                                     </a>
//                                                 ) : (
//                                                     "-"
//                                                 )}
//                                             </p>
//                                         </div>
//                                         <div>
//                                             <span className="text-sm text-gray-500">
//                                                 Address:
//                                             </span>
//                                             <p className="text-gray-900">
//                                                 {viewingReservation.address ||
//                                                     "-"}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Location Information */}
//                                 <div className="bg-gray-50 rounded-lg p-4">
//                                     <h4 className="font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">
//                                         Location Details
//                                     </h4>
//                                     <div className="space-y-2">
//                                         <div>
//                                             <span className="text-sm text-gray-500">
//                                                 Pickup Location:
//                                             </span>
//                                             <p className="text-gray-900">
//                                                 {viewingReservation.pickup_location ||
//                                                     "-"}
//                                             </p>
//                                         </div>
//                                         <div>
//                                             <span className="text-sm text-gray-500">
//                                                 Dropoff Location:
//                                             </span>
//                                             <p className="text-gray-900">
//                                                 {viewingReservation.dropoff_location ||
//                                                     "-"}
//                                             </p>
//                                         </div>
//                                         <div>
//                                             <span className="text-sm text-gray-500">
//                                                 Test Location:
//                                             </span>
//                                             <p className="text-gray-900">
//                                                 {viewingReservation.test_location ||
//                                                     "-"}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Test Details */}
//                                 <div className="bg-gray-50 rounded-lg p-4">
//                                     <h4 className="font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">
//                                         Test Details
//                                     </h4>
//                                     <div className="space-y-2">
//                                         <div>
//                                             <span className="text-sm text-gray-500">
//                                                 Package Type:
//                                             </span>
//                                             <p className="text-gray-900">
//                                                 {viewingReservation.package_type ||
//                                                     "-"}
//                                             </p>
//                                         </div>
//                                         <div>
//                                             <span className="text-sm text-gray-500">
//                                                 Test Time:
//                                             </span>
//                                             <p className="text-gray-900">
//                                                 {viewingReservation.test_time ||
//                                                     "-"}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Schedule */}
//                                 <div className="bg-gray-50 rounded-lg p-4">
//                                     <h4 className="font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">
//                                         Schedule
//                                     </h4>
//                                     <div className="space-y-2">
//                                         <div>
//                                             <span className="text-sm text-gray-500">
//                                                 Date:
//                                             </span>
//                                             <p className="text-gray-900">
//                                                 {viewingReservation.reservation_date
//                                                     ? new Date(
//                                                           viewingReservation.reservation_date,
//                                                       ).toLocaleDateString(
//                                                           "en-US",
//                                                           {
//                                                               weekday: "long",
//                                                               year: "numeric",
//                                                               month: "long",
//                                                               day: "numeric",
//                                                           },
//                                                       )
//                                                     : "-"}
//                                             </p>
//                                         </div>
//                                         <div>
//                                             <span className="text-sm text-gray-500">
//                                                 Time Slot:
//                                             </span>
//                                             <p className="text-gray-900">
//                                                 {viewingReservation.start_time}{" "}
//                                                 - {viewingReservation.end_time}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Action Buttons */}
//                             <div className="mt-8 pt-6 border-t border-gray-200">
//                                 <div className="flex flex-wrap gap-3 justify-end">
//                                     {/* Edit Button - UNCOMMENTED */}
//                                     <button
//                                         onClick={() => handleEditReservation(viewingReservation)}
//                                         className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
//                                     >
//                                         <Edit size={16} />
//                                         Edit Reservation
//                                     </button>

//                                     {/* Accept Button */}
//                                     {viewingReservation.status !==
//                                         "Accepted" && (
//                                         <button
//                                             onClick={() => {
//                                                 updateStatus(
//                                                     viewingReservation.id,
//                                                     "Accepted",
//                                                 );
//                                             }}
//                                             disabled={
//                                                 updatingId ===
//                                                 viewingReservation.id
//                                             }
//                                             className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 ${
//                                                 updatingId ===
//                                                 viewingReservation.id
//                                                     ? "opacity-50 cursor-not-allowed"
//                                                     : ""
//                                             }`}
//                                         >
//                                             {updatingId ===
//                                             viewingReservation.id ? (
//                                                 <>
//                                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                                                     Processing...
//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     <span>✓</span>
//                                                     Accept Reservation
//                                                 </>
//                                             )}
//                                         </button>
//                                     )}

//                                     {/* Reject Button */}
//                                     {viewingReservation.status !==
//                                         "Rejected" && (
//                                         <button
//                                             onClick={() => {
//                                                 updateStatus(
//                                                     viewingReservation.id,
//                                                     "Rejected",
//                                                 );
//                                             }}
//                                             disabled={
//                                                 updatingId ===
//                                                 viewingReservation.id
//                                             }
//                                             className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 ${
//                                                 updatingId ===
//                                                 viewingReservation.id
//                                                     ? "opacity-50 cursor-not-allowed"
//                                                     : ""
//                                             }`}
//                                         >
//                                             {updatingId ===
//                                             viewingReservation.id ? (
//                                                 <>
//                                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                                                     Processing...
//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     <span>✗</span>
//                                                     Reject Reservation
//                                                 </>
//                                             )}
//                                         </button>
//                                     )}

//                                     {/* Reset Button */}
//                                     {(viewingReservation.status ===
//                                         "Accepted" ||
//                                         viewingReservation.status ===
//                                             "Rejected") && (
//                                         <button
//                                             onClick={() => {
//                                                 updateStatus(
//                                                     viewingReservation.id,
//                                                     "Pending",
//                                                 );
//                                             }}
//                                             disabled={
//                                                 updatingId ===
//                                                 viewingReservation.id
//                                             }
//                                             className={`px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2 ${
//                                                 updatingId ===
//                                                 viewingReservation.id
//                                                     ? "opacity-50 cursor-not-allowed"
//                                                     : ""
//                                             }`}
//                                         >
//                                             {updatingId ===
//                                             viewingReservation.id ? (
//                                                 <>
//                                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                                                     Processing...
//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     <span>↻</span>
//                                                     Reset to Pending
//                                                 </>
//                                             )}
//                                         </button>
//                                     )}

//                                     {/* Close Button */}
//                                     <button
//                                         onClick={closeViewModal}
//                                         className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
//                                     >
//                                         Close
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Add/Edit Reservation Form Modal */}
//             <AddReservationForm
//                 isOpen={isFormOpen}
//                 onClose={() => setIsFormOpen(false)}
//                 reservationToEdit={selectedReservation}
//                 onSuccess={handleFormSuccess}
//             />
//         </Wrapper>
//     );
// };

// export default UserReservation;


// import {
//     X,
//     Plus,
//     Edit,
//     Trash2,
//     Eye,
// } from "lucide-react";
// import React, { useState, useMemo, useEffect } from "react";
// import axios from "axios";
// import { Link } from "@inertiajs/react";
// import Wrapper from "@/AdminWrapper/Wrapper";
// import MyTable from "@/MyTable/MyTable";
// import AddReservationForm from "@/AddFormComponent/AddReservationForm";
// import EditReservationForm from "@/EditFormComponents/Editreservationform";


// const UserReservation = () => {
//     const [reservations, setReservations] = useState([]);
//     const [filteredReservations, setFilteredReservations] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [refreshTrigger, setRefreshTrigger] = useState(0);
//     const [updatingId, setUpdatingId] = useState(null);
//     const [filter, setFilter] = useState("all");

//     // Add form state
//     const [isAddFormOpen, setIsAddFormOpen] = useState(false);

//     // Edit form state
//     const [isEditFormOpen, setIsEditFormOpen] = useState(false);
//     const [selectedReservation, setSelectedReservation] = useState(null);

//     // Delete confirm state
//     const [deleteConfirm, setDeleteConfirm] = useState(null);

//     // View modal states
//     const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//     const [viewingReservation, setViewingReservation] = useState(null);

//     // ======================================
//     // FETCH RESERVATIONS
//     // ======================================
//     useEffect(() => {
//         const fetchReservations = async () => {
//             try {
//                 setLoading(true);
//                 const response = await axios.get(
//                     route("ouruserreservations.index"),
//                 );
//                 const sorted = [...response.data.data].sort(
//                     (a, b) => new Date(b.created_at) - new Date(a.created_at),
//                 );
//                 setReservations(sorted);
//                 setError(null);
//             } catch (err) {
//                 setError("Failed to load reservations");
//                 console.error("Error fetching reservations:", err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchReservations();
//     }, [refreshTrigger]);

//     // ======================================
//     // FILTER RESERVATIONS
//     // ======================================
//     useEffect(() => {
//         if (!reservations.length) {
//             setFilteredReservations([]);
//             return;
//         }

//         switch (filter) {
//             case "accepted":
//                 setFilteredReservations(
//                     reservations.filter((r) => r.status === "Accepted"),
//                 );
//                 break;
//             case "rejected":
//                 setFilteredReservations(
//                     reservations.filter((r) => r.status === "Rejected"),
//                 );
//                 break;
//             case "pending":
//                 setFilteredReservations(
//                     reservations.filter((r) => r.status === "Pending"),
//                 );
//                 break;
//             default:
//                 setFilteredReservations(reservations);
//                 break;
//         }
//     }, [reservations, filter]);

//     // ======================================
//     // ACCEPT / REJECT / RESET RESERVATION
//     // ======================================
//     const updateStatus = async (id, status) => {
//         try {
//             setUpdatingId(id);

//             const response = await axios.put(
//                 route("ouruserreservations.update", { id: id }),
//                 { status: status },
//             );

//             if (response.data.success) {
//                 setReservations((prev) =>
//                     prev.map((r) =>
//                         r.id === id ? { ...r, status: status } : r,
//                     ),
//                 );

//                 if (viewingReservation && viewingReservation.id === id) {
//                     setViewingReservation({
//                         ...viewingReservation,
//                         status: status,
//                     });
//                 }

//                 setRefreshTrigger((prev) => prev + 1);
//             } else {
//                 setError(
//                     response.data.message ||
//                         "Failed to update reservation status",
//                 );
//             }
//         } catch (err) {
//             console.error("Error updating reservation:", err);
//             if (err.response && err.response.data) {
//                 setError(
//                     err.response.data.message ||
//                         "Failed to update reservation status",
//                 );
//             } else {
//                 setError(
//                     "Failed to update reservation status. Please try again.",
//                 );
//             }
//         } finally {
//             setUpdatingId(null);
//         }
//     };

//     // ======================================
//     // DELETE RESERVATION
//     // ======================================
//     const deleteReservation = async (id) => {
//         try {
//             setUpdatingId(id);

//             const response = await axios.delete(
//                 route("ouruserreservations.destroy", { id: id }),
//             );

//             if (response.data.success) {
//                 setReservations((prev) => prev.filter((r) => r.id !== id));
//                 setDeleteConfirm(null);

//                 if (viewingReservation && viewingReservation.id === id) {
//                     setIsViewModalOpen(false);
//                     setViewingReservation(null);
//                 }

//                 setRefreshTrigger((prev) => prev + 1);
//             } else {
//                 setError(
//                     response.data.message || "Failed to delete reservation",
//                 );
//             }
//         } catch (err) {
//             console.error("Error deleting reservation:", err);
//             setError("Failed to delete reservation. Please try again.");
//         } finally {
//             setUpdatingId(null);
//         }
//     };

//     // ======================================
//     // HANDLE ADD RESERVATION
//     // ======================================
//     const handleAddReservation = () => {
//         setIsAddFormOpen(true);
//     };

//     // ======================================
//     // HANDLE EDIT RESERVATION
//     // ======================================
//     const handleEditReservation = (reservation) => {
//         setSelectedReservation(reservation);
//         setIsEditFormOpen(true);
//         setIsViewModalOpen(false); // Close view modal if open
//     };

//     // ======================================
//     // HANDLE VIEW RESERVATION
//     // ======================================
//     const handleViewReservation = (reservation) => {
//         setViewingReservation(reservation);
//         setIsViewModalOpen(true);
//     };

//     // ======================================
//     // HANDLE FORM SUCCESS
//     // ======================================
//     const handleFormSuccess = (data) => {
//         setRefreshTrigger((prev) => prev + 1);
//     };

//     // ======================================
//     // CLOSE VIEW MODAL
//     // ======================================
//     const closeViewModal = () => {
//         setIsViewModalOpen(false);
//         setViewingReservation(null);
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
//                 Header: "User",
//                 accessor: "user_name",
//             },
//             {
//                 Header: "Email",
//                 accessor: "email",
//             },
//             {
//                 Header: "Address",
//                 accessor: "address",
//                 Cell: ({ value }) => value || "-",
//             },
//             {
//                 Header: "Phone",
//                 accessor: "phone",
//                 Cell: ({ value }) =>
//                     value ? (
//                         <a
//                             href={`tel:${value}`}
//                             style={{ textDecoration: "none", color: "inherit" }}
//                         >
//                             {value}
//                         </a>
//                     ) : (
//                         "-"
//                     ),
//             },
//             {
//                 Header: "Package Type",
//                 accessor: "package_type",
//                 Cell: ({ value }) => value || "-",
//             },
//             {
//                 Header: "Status",
//                 accessor: "status",
//                 Cell: ({ value }) => (
//                     <span
//                         className={`px-2 py-1 rounded text-xs font-semibold
//                         ${
//                             value === "Pending"
//                                 ? "bg-yellow-100 text-yellow-600"
//                                 : value === "Accepted"
//                                   ? "bg-green-100 text-green-600"
//                                   : "bg-red-100 text-red-600"
//                         }`}
//                     >
//                         {value}
//                     </span>
//                 ),
//             },
//             {
//                 Header: "Actions",
//                 Cell: ({ row }) => (
//                     <div className="flex gap-2">
//                         {/* View Button */}
//                         <button
//                             onClick={() => handleViewReservation(row.original)}
//                             disabled={updatingId === row.original.id}
//                             className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
//                             title="View Details"
//                         >
//                             <Eye size={18} />
//                         </button>

//                         {/* Edit Button */}
//                         <button
//                             onClick={() => handleEditReservation(row.original)}
//                             disabled={updatingId === row.original.id}
//                             className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
//                             title="Edit"
//                         >
//                             <Edit size={18} />
//                         </button>

//                         {/* Delete Button */}
//                         {deleteConfirm === row.original.id ? (
//                             <>
//                                 <button
//                                     onClick={() =>
//                                         deleteReservation(row.original.id)
//                                     }
//                                     disabled={updatingId === row.original.id}
//                                     className="px-3 py-1 text-white bg-red-600 rounded hover:bg-red-700 text-sm transition-colors"
//                                 >
//                                     Confirm
//                                 </button>
//                                 <button
//                                     onClick={() => setDeleteConfirm(null)}
//                                     className="px-3 py-1 text-white bg-gray-600 rounded hover:bg-gray-700 text-sm transition-colors"
//                                 >
//                                     Cancel
//                                 </button>
//                             </>
//                         ) : (
//                             <button
//                                 onClick={() =>
//                                     setDeleteConfirm(row.original.id)
//                                 }
//                                 disabled={updatingId === row.original.id}
//                                 className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
//                                 title="Delete"
//                             >
//                                 <Trash2 size={18} />
//                             </button>
//                         )}
//                     </div>
//                 ),
//             },
//         ],
//         [updatingId, deleteConfirm],
//     );

//     const handleLogout = () => {
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

//     return (
//         <Wrapper>
//             <div className="px-2 sm:px-6 lg:px-8 py-6 lg:py-8">
//                 {/* Error Alert */}
//                 {error && (
//                     <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
//                         <div className="flex items-center justify-between">
//                             <span>{error}</span>
//                             <button
//                                 onClick={() => setError(null)}
//                                 className="text-red-500 hover:text-red-700"
//                             >
//                                 <X size={16} />
//                             </button>
//                         </div>
//                     </div>
//                 )}

//                 {/* ================== RESERVATIONS TABLE ================== */}
//                 <div>
//                     <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
//                         <h2 className="font-semibold text-gray-700 text-lg mb-4 md:mb-0">
//                             User Reservations
//                         </h2>

//                         {/* Filter Buttons and Add Button */}
//                         <div className="flex flex-wrap gap-2">
//                             {/* Add New Reservation Button */}
//                             <button
//                                 onClick={handleAddReservation}
//                                 className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
//                             >
//                                 <Plus size={16} />
//                                 Add Reservation
//                             </button>

//                             <button
//                                 onClick={() => setFilter("all")}
//                                 className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
//                                     filter === "all"
//                                         ? "bg-blue-600 text-white"
//                                         : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                                 }`}
//                             >
//                                 All ({reservations.length})
//                             </button>
//                             <button
//                                 onClick={() => setFilter("pending")}
//                                 className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
//                                     filter === "pending"
//                                         ? "bg-yellow-600 text-white"
//                                         : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                                 }`}
//                             >
//                                 <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
//                                 Pending (
//                                 {
//                                     reservations.filter(
//                                         (r) => r.status === "Pending",
//                                     ).length
//                                 }
//                                 )
//                             </button>
//                             <button
//                                 onClick={() => setFilter("accepted")}
//                                 className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
//                                     filter === "accepted"
//                                         ? "bg-green-600 text-white"
//                                         : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                                 }`}
//                             >
//                                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
//                                 Accepted (
//                                 {
//                                     reservations.filter(
//                                         (r) => r.status === "Accepted",
//                                     ).length
//                                 }
//                                 )
//                             </button>
//                             <button
//                                 onClick={() => setFilter("rejected")}
//                                 className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
//                                     filter === "rejected"
//                                         ? "bg-red-600 text-white"
//                                         : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                                 }`}
//                             >
//                                 <div className="w-2 h-2 rounded-full bg-red-500"></div>
//                                 Rejected (
//                                 {
//                                     reservations.filter(
//                                         (r) => r.status === "Rejected",
//                                     ).length
//                                 }
//                                 )
//                             </button>
//                         </div>
//                     </div>

//                     {loading ? (
//                         <div className="text-center py-8">
//                             <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                             <p className="mt-2 text-gray-600">
//                                 Loading reservations...
//                             </p>
//                         </div>
//                     ) : (
//                         <>
//                             {filteredReservations.length > 0 ? (
//                                 <MyTable
//                                     columns={columns}
//                                     data={filteredReservations}
//                                 />
//                             ) : (
//                                 <div className="text-center py-8 bg-white rounded-xl border border-blue-100 shadow-sm">
//                                     <div className="flex flex-col items-center justify-center">
//                                         <span className="text-lg mb-2 text-gray-700">
//                                             No reservations found
//                                         </span>
//                                         <span className="text-sm text-gray-400">
//                                             {filter === "all"
//                                                 ? "All reservations will appear here"
//                                                 : `No ${filter.toLowerCase()} reservations found`}
//                                         </span>
//                                         {filter !== "all" && (
//                                             <button
//                                                 onClick={() => setFilter("all")}
//                                                 className="mt-4 px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
//                                             >
//                                                 Show all reservations
//                                             </button>
//                                         )}
//                                     </div>
//                                 </div>
//                             )}
//                         </>
//                     )}
//                 </div>
//             </div>

//             {/* View Reservation Modal */}
//             {isViewModalOpen && viewingReservation && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//                         <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
//                             <h3 className="text-lg font-semibold text-gray-900">
//                                 Reservation Details of{" "}
//                                 {viewingReservation.user_name}
//                             </h3>
//                             <button
//                                 onClick={closeViewModal}
//                                 className="text-gray-400 hover:text-gray-600 transition-colors"
//                             >
//                                 <X size={20} />
//                             </button>
//                         </div>

//                         <div className="p-6">
//                             {/* Status Badge */}
//                             <div className="mb-6 flex justify-between items-center">
//                                 <span className="text-sm font-medium text-gray-500">
//                                     Current Status:
//                                 </span>
//                                 <span
//                                     className={`px-3 py-1 rounded-full text-sm font-semibold
//                                     ${
//                                         viewingReservation.status === "Pending"
//                                             ? "bg-yellow-100 text-yellow-600"
//                                             : viewingReservation.status ===
//                                                 "Accepted"
//                                               ? "bg-green-100 text-green-600"
//                                               : "bg-red-100 text-red-600"
//                                     }`}
//                                 >
//                                     {viewingReservation.status}
//                                 </span>
//                             </div>

//                             {/* Reservation Details Grid */}
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                 {/* User Information */}
//                                 <div className="bg-gray-50 rounded-lg p-4">
//                                     <h4 className="font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">
//                                         User Information
//                                     </h4>
//                                     <div className="space-y-2">
//                                         <div>
//                                             <span className="text-sm text-gray-500">Name:</span>
//                                             <p className="text-gray-900 font-medium">{viewingReservation.user_name}</p>
//                                         </div>
//                                         <div>
//                                             <span className="text-sm text-gray-500">Email:</span>
//                                             <p className="text-gray-900">{viewingReservation.email}</p>
//                                         </div>
//                                         <div>
//                                             <span className="text-sm text-gray-500">Phone:</span>
//                                             <p className="text-gray-900">
//                                                 {viewingReservation.phone ? (
//                                                     <a href={`tel:${viewingReservation.phone}`} className="text-gray-900 hover:text-blue-600">
//                                                         {viewingReservation.phone}
//                                                     </a>
//                                                 ) : "-"}
//                                             </p>
//                                         </div>
//                                         <div>
//                                             <span className="text-sm text-gray-500">Address:</span>
//                                             <p className="text-gray-900">{viewingReservation.address || "-"}</p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Location Information */}
//                                 <div className="bg-gray-50 rounded-lg p-4">
//                                     <h4 className="font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">
//                                         Location Details
//                                     </h4>
//                                     <div className="space-y-2">
//                                         <div>
//                                             <span className="text-sm text-gray-500">Pickup Location:</span>
//                                             <p className="text-gray-900">{viewingReservation.pickup_location || "-"}</p>
//                                         </div>
//                                         <div>
//                                             <span className="text-sm text-gray-500">Dropoff Location:</span>
//                                             <p className="text-gray-900">{viewingReservation.dropoff_location || "-"}</p>
//                                         </div>
//                                         <div>
//                                             <span className="text-sm text-gray-500">Test Location:</span>
//                                             <p className="text-gray-900">{viewingReservation.test_location || "-"}</p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Test Details */}
//                                 <div className="bg-gray-50 rounded-lg p-4">
//                                     <h4 className="font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">
//                                         Test Details
//                                     </h4>
//                                     <div className="space-y-2">
//                                         <div>
//                                             <span className="text-sm text-gray-500">Package Type:</span>
//                                             <p className="text-gray-900">{viewingReservation.package_type || "-"}</p>
//                                         </div>
//                                         <div>
//                                             <span className="text-sm text-gray-500">Test Time:</span>
//                                             <p className="text-gray-900">{viewingReservation.test_time || "-"}</p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Schedule */}
//                                 <div className="bg-gray-50 rounded-lg p-4">
//                                     <h4 className="font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">
//                                         Schedule
//                                     </h4>
//                                     <div className="space-y-2">
//                                         <div>
//                                             <span className="text-sm text-gray-500">Date:</span>
//                                             <p className="text-gray-900">
//                                                 {viewingReservation.reservation_date
//                                                     ? new Date(viewingReservation.reservation_date).toLocaleDateString("en-US", {
//                                                           weekday: "long",
//                                                           year: "numeric",
//                                                           month: "long",
//                                                           day: "numeric",
//                                                       })
//                                                     : "-"}
//                                             </p>
//                                         </div>
//                                         <div>
//                                             <span className="text-sm text-gray-500">Time Slot:</span>
//                                             <p className="text-gray-900">
//                                                 {viewingReservation.start_time} - {viewingReservation.end_time}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Action Buttons */}
//                             <div className="mt-8 pt-6 border-t border-gray-200">
//                                 <div className="flex flex-wrap gap-3 justify-end">
//                                     {/* Edit Button */}
//                                     <button
//                                         onClick={() => handleEditReservation(viewingReservation)}
//                                         className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
//                                     >
//                                         <Edit size={16} />
//                                         Edit Reservation
//                                     </button>

//                                     {/* Accept Button */}
//                                     {viewingReservation.status !== "Accepted" && (
//                                         <button
//                                             onClick={() => updateStatus(viewingReservation.id, "Accepted")}
//                                             disabled={updatingId === viewingReservation.id}
//                                             className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 ${
//                                                 updatingId === viewingReservation.id ? "opacity-50 cursor-not-allowed" : ""
//                                             }`}
//                                         >
//                                             {updatingId === viewingReservation.id ? (
//                                                 <>
//                                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                                                     Processing...
//                                                 </>
//                                             ) : (
//                                                 <><span>✓</span> Accept Reservation</>
//                                             )}
//                                         </button>
//                                     )}

//                                     {/* Reject Button */}
//                                     {viewingReservation.status !== "Rejected" && (
//                                         <button
//                                             onClick={() => updateStatus(viewingReservation.id, "Rejected")}
//                                             disabled={updatingId === viewingReservation.id}
//                                             className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 ${
//                                                 updatingId === viewingReservation.id ? "opacity-50 cursor-not-allowed" : ""
//                                             }`}
//                                         >
//                                             {updatingId === viewingReservation.id ? (
//                                                 <>
//                                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                                                     Processing...
//                                                 </>
//                                             ) : (
//                                                 <><span>✗</span> Reject Reservation</>
//                                             )}
//                                         </button>
//                                     )}

//                                     {/* Reset Button */}
//                                     {(viewingReservation.status === "Accepted" || viewingReservation.status === "Rejected") && (
//                                         <button
//                                             onClick={() => updateStatus(viewingReservation.id, "Pending")}
//                                             disabled={updatingId === viewingReservation.id}
//                                             className={`px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2 ${
//                                                 updatingId === viewingReservation.id ? "opacity-50 cursor-not-allowed" : ""
//                                             }`}
//                                         >
//                                             {updatingId === viewingReservation.id ? (
//                                                 <>
//                                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                                                     Processing...
//                                                 </>
//                                             ) : (
//                                                 <><span>↻</span> Reset to Pending</>
//                                             )}
//                                         </button>
//                                     )}

//                                     {/* Close Button */}
//                                     <button
//                                         onClick={closeViewModal}
//                                         className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
//                                     >
//                                         Close
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Add Reservation Form Modal */}
//             <AddReservationForm
//                 isOpen={isAddFormOpen}
//                 onClose={() => setIsAddFormOpen(false)}
//                 onSuccess={handleFormSuccess}
//             />

//             {/* Edit Reservation Form Modal */}
//             <EditReservationForm
//                 isOpen={isEditFormOpen}
//                 onClose={() => {
//                     setIsEditFormOpen(false);
//                     setSelectedReservation(null);
//                 }}
//                 reservationToEdit={selectedReservation}
//                 onSuccess={handleFormSuccess}
//             />
//         </Wrapper>
//     );
// };

// export default UserReservation;


import {
    X,
    Plus,
    Edit,
    Trash2,
    Eye,
} from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { Link } from "@inertiajs/react";
import Wrapper from "@/AdminWrapper/Wrapper";
import MyTable from "@/MyTable/MyTable";
import AddReservationForm from "@/AddFormComponent/AddReservationForm";
import EditReservationForm from "@/EditFormComponents/Editreservationform";


const UserReservation = () => {
    const [reservations, setReservations] = useState([]);
    const [filteredReservations, setFilteredReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [updatingId, setUpdatingId] = useState(null);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Add form state
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);

    // Edit form state
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);

    // Delete confirm state
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // View modal states
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingReservation, setViewingReservation] = useState(null);

    // ======================================
    // FETCH RESERVATIONS
    // ======================================
    useEffect(() => {
        const fetchReservations = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    route("ouruserreservations.index"),
                );
                const sorted = [...response.data.data].sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at),
                );
                setReservations(sorted);
                setError(null);
            } catch (err) {
                setError("Failed to load reservations");
                console.error("Error fetching reservations:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, [refreshTrigger]);

    // ======================================
    // FILTER RESERVATIONS (status + search)
    // ======================================
    useEffect(() => {
        if (!reservations.length) {
            setFilteredReservations([]);
            return;
        }

        let result = reservations;

        // Filter by status category
        if (filter !== "all") {
            result = result.filter(
                (r) => r.status.toLowerCase() === filter.toLowerCase(),
            );
        }

        // Filter by name search
        if (searchQuery.trim()) {
            result = result.filter((r) =>
                r.user_name
                    ?.toLowerCase()
                    .includes(searchQuery.trim().toLowerCase()),
            );
        }

        setFilteredReservations(result);
    }, [reservations, filter, searchQuery]);

    // ======================================
    // ACCEPT / REJECT / RESET RESERVATION
    // ======================================
    const updateStatus = async (id, status) => {
        try {
            setUpdatingId(id);

            const response = await axios.put(
                route("ouruserreservations.update", { id: id }),
                { status: status },
            );

            if (response.data.success) {
                setReservations((prev) =>
                    prev.map((r) =>
                        r.id === id ? { ...r, status: status } : r,
                    ),
                );

                if (viewingReservation && viewingReservation.id === id) {
                    setViewingReservation({
                        ...viewingReservation,
                        status: status,
                    });
                }

                setRefreshTrigger((prev) => prev + 1);
            } else {
                setError(
                    response.data.message ||
                        "Failed to update reservation status",
                );
            }
        } catch (err) {
            console.error("Error updating reservation:", err);
            if (err.response && err.response.data) {
                setError(
                    err.response.data.message ||
                        "Failed to update reservation status",
                );
            } else {
                setError(
                    "Failed to update reservation status. Please try again.",
                );
            }
        } finally {
            setUpdatingId(null);
        }
    };

    // ======================================
    // DELETE RESERVATION
    // ======================================
    const deleteReservation = async (id) => {
        try {
            setUpdatingId(id);

            const response = await axios.delete(
                route("ouruserreservations.destroy", { id: id }),
            );

            if (response.data.success) {
                setReservations((prev) => prev.filter((r) => r.id !== id));
                setDeleteConfirm(null);

                if (viewingReservation && viewingReservation.id === id) {
                    setIsViewModalOpen(false);
                    setViewingReservation(null);
                }

                setRefreshTrigger((prev) => prev + 1);
            } else {
                setError(
                    response.data.message || "Failed to delete reservation",
                );
            }
        } catch (err) {
            console.error("Error deleting reservation:", err);
            setError("Failed to delete reservation. Please try again.");
        } finally {
            setUpdatingId(null);
        }
    };

    // ======================================
    // HANDLE ADD RESERVATION
    // ======================================
    const handleAddReservation = () => {
        setIsAddFormOpen(true);
    };

    // ======================================
    // HANDLE EDIT RESERVATION
    // ======================================
    const handleEditReservation = (reservation) => {
        setSelectedReservation(reservation);
        setIsEditFormOpen(true);
        setIsViewModalOpen(false);
    };

    // ======================================
    // HANDLE VIEW RESERVATION
    // ======================================
    const handleViewReservation = (reservation) => {
        setViewingReservation(reservation);
        setIsViewModalOpen(true);
    };

    // ======================================
    // HANDLE FORM SUCCESS
    // ======================================
    const handleFormSuccess = (data) => {
        setRefreshTrigger((prev) => prev + 1);
    };

    // ======================================
    // CLOSE VIEW MODAL
    // ======================================
    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setViewingReservation(null);
    };

    // ======================================
    // TABLE COLUMNS
    // ======================================
    const columns = useMemo(
        () => [
            {
                Header: "ID",
                accessor: (row, i) => i + 1,
                id: "rowIndex",
                width: 60,
            },
            {
                Header: "User",
                accessor: "user_name",
            },
            {
                Header: "Email",
                accessor: "email",
            },
            {
                Header: "Address",
                accessor: "address",
                Cell: ({ value }) => value || "-",
            },
            {
                Header: "Phone",
                accessor: "phone",
                Cell: ({ value }) =>
                    value ? (
                        <a
                            href={`tel:${value}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                        >
                            {value}
                        </a>
                    ) : (
                        "-"
                    ),
            },
            {
                Header: "Package Type",
                accessor: "package_type",
                Cell: ({ value }) => value || "-",
            },
            {
                Header: "Status",
                accessor: "status",
                Cell: ({ value }) => (
                    <span
                        className={`px-2 py-1 rounded text-xs font-semibold
                        ${
                            value === "Pending"
                                ? "bg-yellow-100 text-yellow-600"
                                : value === "Accepted"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-red-100 text-red-600"
                        }`}
                    >
                        {value}
                    </span>
                ),
            },
            {
                Header: "Actions",
                Cell: ({ row }) => (
                    <div className="flex gap-2">
                        {/* View Button */}
                        <button
                            onClick={() => handleViewReservation(row.original)}
                            disabled={updatingId === row.original.id}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="View Details"
                        >
                            <Eye size={18} />
                        </button>

                        {/* Edit Button */}
                        <button
                            onClick={() => handleEditReservation(row.original)}
                            disabled={updatingId === row.original.id}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                            title="Edit"
                        >
                            <Edit size={18} />
                        </button>

                        {/* Delete Button */}
                        {deleteConfirm === row.original.id ? (
                            <>
                                <button
                                    onClick={() =>
                                        deleteReservation(row.original.id)
                                    }
                                    disabled={updatingId === row.original.id}
                                    className="px-3 py-1 text-white bg-red-600 rounded hover:bg-red-700 text-sm transition-colors"
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-3 py-1 text-white bg-gray-600 rounded hover:bg-gray-700 text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() =>
                                    setDeleteConfirm(row.original.id)
                                }
                                disabled={updatingId === row.original.id}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Delete"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                ),
            },
        ],
        [updatingId, deleteConfirm],
    );

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

    return (
        <Wrapper>
            <div className="px-2 sm:px-6 lg:px-8 py-6 lg:py-8">
                {/* Error Alert */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span>{error}</span>
                            <button
                                onClick={() => setError(null)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ================== RESERVATIONS TABLE ================== */}
                <div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                        <h2 className="font-semibold text-gray-700 text-lg">
                            User Reservations
                        </h2>

                        <div className="flex flex-wrap gap-2 items-center">
                            {/* Add New Reservation Button */}
                            <button
                                onClick={handleAddReservation}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Add Reservation
                            </button>

                            {/* Search by Name */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Status Category Dropdown */}
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">
                                    All ({reservations.length})
                                </option>
                                <option value="pending">
                                    Pending (
                                    {
                                        reservations.filter(
                                            (r) => r.status === "Pending",
                                        ).length
                                    }
                                    )
                                </option>
                                <option value="accepted">
                                    Accepted (
                                    {
                                        reservations.filter(
                                            (r) => r.status === "Accepted",
                                        ).length
                                    }
                                    )
                                </option>
                                <option value="rejected">
                                    Rejected (
                                    {
                                        reservations.filter(
                                            (r) => r.status === "Rejected",
                                        ).length
                                    }
                                    )
                                </option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-600">
                                Loading reservations...
                            </p>
                        </div>
                    ) : (
                        <>
                            {filteredReservations.length > 0 ? (
                                <MyTable
                                    columns={columns}
                                    data={filteredReservations}
                                />
                            ) : (
                                <div className="text-center py-8 bg-white rounded-xl border border-blue-100 shadow-sm">
                                    <div className="flex flex-col items-center justify-center">
                                        <span className="text-lg mb-2 text-gray-700">
                                            No reservations found
                                        </span>
                                        <span className="text-sm text-gray-400">
                                            {searchQuery
                                                ? `No reservations found for "${searchQuery}"`
                                                : filter === "all"
                                                  ? "All reservations will appear here"
                                                  : `No ${filter.toLowerCase()} reservations found`}
                                        </span>
                                        {(filter !== "all" || searchQuery) && (
                                            <button
                                                onClick={() => {
                                                    setFilter("all");
                                                    setSearchQuery("");
                                                }}
                                                className="mt-4 px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                            >
                                                Clear all filters
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* View Reservation Modal */}
            {isViewModalOpen && viewingReservation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Reservation Details of{" "}
                                {viewingReservation.user_name}
                            </h3>
                            <button
                                onClick={closeViewModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Status Badge */}
                            <div className="mb-6 flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-500">
                                    Current Status:
                                </span>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold
                                    ${
                                        viewingReservation.status === "Pending"
                                            ? "bg-yellow-100 text-yellow-600"
                                            : viewingReservation.status ===
                                                "Accepted"
                                              ? "bg-green-100 text-green-600"
                                              : "bg-red-100 text-red-600"
                                    }`}
                                >
                                    {viewingReservation.status}
                                </span>
                            </div>

                            {/* Reservation Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* User Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">
                                        User Information
                                    </h4>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Name:
                                            </span>
                                            <p className="text-gray-900 font-medium">
                                                {viewingReservation.user_name}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Email:
                                            </span>
                                            <p className="text-gray-900">
                                                {viewingReservation.email}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Phone:
                                            </span>
                                            <p className="text-gray-900">
                                                {viewingReservation.phone ? (
                                                    <a
                                                        href={`tel:${viewingReservation.phone}`}
                                                        className="text-gray-900 hover:text-blue-600"
                                                    >
                                                        {
                                                            viewingReservation.phone
                                                        }
                                                    </a>
                                                ) : (
                                                    "-"
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Address:
                                            </span>
                                            <p className="text-gray-900">
                                                {viewingReservation.address ||
                                                    "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Location Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">
                                        Location Details
                                    </h4>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Pickup Location:
                                            </span>
                                            <p className="text-gray-900">
                                                {viewingReservation.pickup_location ||
                                                    "-"}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Dropoff Location:
                                            </span>
                                            <p className="text-gray-900">
                                                {viewingReservation.dropoff_location ||
                                                    "-"}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Test Location:
                                            </span>
                                            <p className="text-gray-900">
                                                {viewingReservation.test_location ||
                                                    "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Test Details */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">
                                        Test Details
                                    </h4>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Package Type:
                                            </span>
                                            <p className="text-gray-900">
                                                {viewingReservation.package_type ||
                                                    "-"}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Test Time:
                                            </span>
                                            <p className="text-gray-900">
                                                {viewingReservation.test_time ||
                                                    "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Schedule */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">
                                        Schedule
                                    </h4>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Date:
                                            </span>
                                            <p className="text-gray-900">
                                                {viewingReservation.reservation_date
                                                    ? new Date(
                                                          viewingReservation.reservation_date,
                                                      ).toLocaleDateString(
                                                          "en-US",
                                                          {
                                                              weekday: "long",
                                                              year: "numeric",
                                                              month: "long",
                                                              day: "numeric",
                                                          },
                                                      )
                                                    : "-"}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Time Slot:
                                            </span>
                                            <p className="text-gray-900">
                                                {viewingReservation.start_time}{" "}
                                                -{" "}
                                                {viewingReservation.end_time}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <div className="flex flex-wrap gap-3 justify-end">
                                    {/* Edit Button */}
                                    <button
                                        onClick={() =>
                                            handleEditReservation(
                                                viewingReservation,
                                            )
                                        }
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                                    >
                                        <Edit size={16} />
                                        Edit Reservation
                                    </button>

                                    {/* Accept Button */}
                                    {viewingReservation.status !==
                                        "Accepted" && (
                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    viewingReservation.id,
                                                    "Accepted",
                                                )
                                            }
                                            disabled={
                                                updatingId ===
                                                viewingReservation.id
                                            }
                                            className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 ${
                                                updatingId ===
                                                viewingReservation.id
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }`}
                                        >
                                            {updatingId ===
                                            viewingReservation.id ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <span>✓</span> Accept
                                                    Reservation
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {/* Reject Button */}
                                    {viewingReservation.status !==
                                        "Rejected" && (
                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    viewingReservation.id,
                                                    "Rejected",
                                                )
                                            }
                                            disabled={
                                                updatingId ===
                                                viewingReservation.id
                                            }
                                            className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 ${
                                                updatingId ===
                                                viewingReservation.id
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }`}
                                        >
                                            {updatingId ===
                                            viewingReservation.id ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <span>✗</span> Reject
                                                    Reservation
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {/* Reset Button */}
                                    {(viewingReservation.status ===
                                        "Accepted" ||
                                        viewingReservation.status ===
                                            "Rejected") && (
                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    viewingReservation.id,
                                                    "Pending",
                                                )
                                            }
                                            disabled={
                                                updatingId ===
                                                viewingReservation.id
                                            }
                                            className={`px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                                                updatingId ===
                                                viewingReservation.id
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }`}
                                        >
                                            {updatingId ===
                                            viewingReservation.id ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <span>↻</span> Reset to
                                                    Pending
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {/* Close Button */}
                                    <button
                                        onClick={closeViewModal}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Reservation Form Modal */}
            <AddReservationForm
                isOpen={isAddFormOpen}
                onClose={() => setIsAddFormOpen(false)}
                onSuccess={handleFormSuccess}
            />

            {/* Edit Reservation Form Modal */}
            <EditReservationForm
                isOpen={isEditFormOpen}
                onClose={() => {
                    setIsEditFormOpen(false);
                    setSelectedReservation(null);
                }}
                reservationToEdit={selectedReservation}
                onSuccess={handleFormSuccess}
            />
        </Wrapper>
    );
};

export default UserReservation;
