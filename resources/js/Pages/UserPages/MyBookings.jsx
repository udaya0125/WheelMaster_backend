// import { useEffect, useState } from "react";
// import axios from "axios";
// import { CalendarClock, MapPin } from "lucide-react";
// import UserWrapper from "@/Wrapper/UserWrapper";

// export default function MyBookings() {
//   const [bookings, setBookings] = useState([]);
//   const [pagination, setPagination] = useState(null);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(true);

//   const fetchBookings = async (pageNum = 1) => {
//     setLoading(true);
//     try {
//       const response = await axios.get(route("ourbookings.history"), {
//         params: {
//           page: pageNum,
//         },
//       });

//       const result = response.data.data;
//       setBookings(result.data);
//       setPagination(result);
//     } catch (error) {
//       console.error("Failed to fetch booking history:", error);
//     } finally {
//       setLoading(false);
//     }
//   };


//   useEffect(() => {
//     fetchBookings(page);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [page]);

//   const statusBadge = (status) => {
//     const styles = {
//       Accepted: "bg-green-100 text-green-700",
//       Rejected: "bg-red-100 text-red-700",
//       Pending: "bg-yellow-100 text-yellow-700",
//     };
//     const labels = {
//       Accepted: "Completed",
//       Rejected: "Cancelled",
//       Pending: "Pending",
//     };
//     return (
//       <span
//         className={`px-2 py-1 rounded-full text-xs font-medium ${
//           styles[status] || "bg-gray-100 text-gray-700"
//         }`}
//       >
//         {labels[status] || status}
//       </span>
//     );
//   };

//   return (
//     <>
//     <UserWrapper>
//     <div className="p-4">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
//         <h1 className="text-xl font-semibold text-gray-800">My Bookings</h1>
//       </div>

//       {loading ? (
//         <div className="text-center text-gray-500 py-12">Loading your bookings...</div>
//       ) : bookings.length === 0 ? (
//         <div className="text-center text-gray-500 py-12 border border-dashed rounded-lg">
//           No bookings found.
//         </div>
//       ) : (
//         <div className="space-y-3">
//           {bookings.map((booking) => (
//             <div
//               key={booking.id}
//               className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white shadow-sm"
//             >
//               <div className="flex-1">
//                 <div className="flex items-center gap-2 text-gray-800 font-medium">
//                   <CalendarClock size={16} className="text-gray-400" />
//                   {booking.reservation_date} · {booking.start_time?.slice(0, 5)} -{" "}
//                   {booking.end_time?.slice(0, 5)}
//                 </div>
//                 <div className="text-sm text-gray-500 mt-1">
//                   {booking.package_type}
//                   {booking.price ? ` · ${booking.price}` : ""}
//                 </div>
//                 {(booking.pickup_location || booking.dropoff_location) && (
//                   <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
//                     <MapPin size={14} />
//                     {booking.pickup_location}
//                     {booking.pickup_location && booking.dropoff_location ? " → " : ""}
//                     {booking.dropoff_location}
//                   </div>
//                 )}
//               </div>
//               <div>{statusBadge(booking.status)}</div>
//             </div>
//           ))}
//         </div>
//       )}

//       {pagination && pagination.last_page > 1 && (
//         <div className="flex justify-center items-center gap-2 mt-6">
//           <button
//             disabled={page <= 1}
//             onClick={() => setPage((p) => p - 1)}
//             className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-40"
//           >
//             Prev
//           </button>
//           <span className="text-sm text-gray-600">
//             Page {pagination.current_page} of {pagination.last_page}
//           </span>
//           <button
//             disabled={page >= pagination.last_page}
//             onClick={() => setPage((p) => p + 1)}
//             className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-40"
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//     </UserWrapper>
//     </>
//   );
// }



import { useEffect, useState } from "react";
import axios from "axios";
import {
  CalendarClock,
  MapPin,
  Clock,
  Tag,
  Wallet,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Timer,
  FileCheck,
} from "lucide-react";
import UserWrapper from "@/Wrapper/UserWrapper";
import Loader from "./Loader";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchBookings = async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(route("ourbookings.history"), {
        params: {
          page: pageNum,
        },
      });

      const result = response.data.data;
      setBookings(result.data);
      setPagination(result);
    } catch (error) {
      console.error("Failed to fetch booking history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const statusConfig = {
    Accepted: {
      label: "Completed",
      badge: "bg-green-100 text-green-700",
      bar: "bg-green-500",
    },
    Rejected: {
      label: "Cancelled",
      badge: "bg-red-100 text-red-700",
      bar: "bg-red-500",
    },
    Pending: {
      label: "Pending",
      badge: "bg-yellow-100 text-yellow-700",
      bar: "bg-yellow-500",
    },
  };

  const getStatus = (status) =>
    statusConfig[status] || {
      label: status,
      badge: "bg-gray-100 text-gray-700",
      bar: "bg-gray-400",
    };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Combines reservation_date + start_time into a real Date object
  const getBookingStart = (booking) => {
    if (!booking.reservation_date || !booking.start_time) return null;
    const d = new Date(`${booking.reservation_date}T${booking.start_time}`);
    return isNaN(d) ? null : d;
  };

  // Returns { days, hours, minutes, seconds, totalMs } remaining until target, or null if in the past
  const getCountdown = (target) => {
    if (!target) return null;
    const diffMs = target.getTime() - now;
    if (diffMs <= 0) return null;

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const seconds = Math.floor((diffMs / 1000) % 60);

    return { days, hours, minutes, seconds, totalMs: diffMs };
  };

  const formatCountdown = ({ days, hours, minutes, seconds }) => {
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(
      2,
      "0"
    )}m ${String(seconds).padStart(2, "0")}s`;
  };

  return (
    <UserWrapper>
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">My Bookings</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              View and track the status of all your driving lesson bookings
            </p>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : bookings.length === 0 ? (
          <div className="text-center text-gray-500 py-16 border border-dashed rounded-xl bg-white">
            <CalendarClock className="mx-auto mb-3 text-gray-300" size={40} />
            No bookings found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {bookings.map((booking) => {
              const status = getStatus(booking.status);
              const bookingStart = getBookingStart(booking);
              const countdown = getCountdown(bookingStart);
              return (
                <div
                  key={booking.id}
                  className="relative border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 h-full w-1 ${status.bar}`} />

                  <div className="p-5 pl-6">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2 text-gray-800 font-semibold">
                          <CalendarClock size={16} className="text-gray-400 shrink-0" />
                          {formatDate(booking.reservation_date)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Clock size={14} className="text-gray-400 shrink-0" />
                          {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${status.badge}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    {countdown && (
                      <div className="flex items-center gap-2 mb-3 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium w-fit">
                        <Timer size={14} className="shrink-0" />
                        <span>Starts in {formatCountdown(countdown)}</span>
                      </div>
                    )}

                    <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-3">
                      {booking.package_type && (
                        <div className="flex items-center gap-2">
                          <Tag size={14} className="text-gray-400 shrink-0" />
                          <span>{booking.package_type}</span>
                        </div>
                      )}

                      {booking.price && (
                        <div className="flex items-center gap-2">
                          <Wallet size={14} className="text-gray-400 shrink-0" />
                          <span>{booking.price}</span>
                        </div>
                      )}

                      {(booking.pickup_location || booking.dropoff_location) && (
                        <div className="flex items-start gap-2">
                          <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">
                            {booking.pickup_location}
                            {booking.pickup_location && booking.dropoff_location ? " → " : ""}
                            {booking.dropoff_location}
                          </span>
                        </div>
                      )}

                      {booking.test_location && (
                        <div className="flex items-start gap-2">
                          <FileCheck size={14} className="text-gray-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">
                            Test location: {booking.test_location}
                          </span>
                        </div>
                      )}

                      {booking.comment && (
                        <div className="flex items-start gap-2">
                          <MessageSquare size={14} className="text-gray-400 shrink-0 mt-0.5" />
                          <span className="leading-snug italic text-gray-500">
                            {booking.comment}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pagination && pagination.last_page > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={14} />
              Prev
            </button>
            <span className="text-sm text-gray-600 px-2">
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <button
              disabled={page >= pagination.last_page}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </UserWrapper>
  );
}


// import { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   CalendarClock,
//   MapPin,
//   Clock,
//   Tag,
//   Wallet,
//   MessageSquare,
//   ChevronLeft,
//   ChevronRight,
//   Timer,
//   FileCheck,
// } from "lucide-react";
// import UserWrapper from "@/Wrapper/UserWrapper";

// export default function MyBookings() {
//   const [bookings, setBookings] = useState([]);
//   const [pagination, setPagination] = useState(null);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [now, setNow] = useState(() => Date.now());

//   useEffect(() => {
//     const timer = setInterval(() => setNow(Date.now()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const fetchBookings = async (pageNum = 1) => {
//     setLoading(true);
//     try {
//       const response = await axios.get(route("ourbookings.history"), {
//         params: {
//           page: pageNum,
//         },
//       });

//       const result = response.data.data;
//       setBookings(result.data);
//       setPagination(result);
//     } catch (error) {
//       console.error("Failed to fetch booking history:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchBookings(page);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [page]);

//   const statusConfig = {
//     Accepted: {
//       label: "Completed",
//       badge: "bg-green-100 text-green-700",
//       bar: "bg-green-500",
//     },
//     Rejected: {
//       label: "Cancelled",
//       badge: "bg-red-100 text-red-700",
//       bar: "bg-red-500",
//     },
//     Pending: {
//       label: "Pending",
//       badge: "bg-yellow-100 text-yellow-700",
//       bar: "bg-yellow-500",
//     },
//   };

//   const getStatus = (status) =>
//     statusConfig[status] || {
//       label: status,
//       badge: "bg-gray-100 text-gray-700",
//       bar: "bg-gray-400",
//     };

//   const formatDate = (dateStr) => {
//     if (!dateStr) return "";
//     const d = new Date(dateStr);
//     if (isNaN(d)) return dateStr;
//     return d.toLocaleDateString("en-AU", {
//       weekday: "short",
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   // Combines reservation_date + start_time into a real Date object
//   const getBookingStart = (booking) => {
//     if (!booking.reservation_date || !booking.start_time) return null;
//     const d = new Date(`${booking.reservation_date}T${booking.start_time}`);
//     return isNaN(d) ? null : d;
//   };

//   // Returns { days, hours, minutes, seconds, totalMs } remaining until target, or null if in the past
//   const getCountdown = (target) => {
//     if (!target) return null;
//     const diffMs = target.getTime() - now;
//     if (diffMs <= 0) return null;

//     const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
//     const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
//     const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
//     const seconds = Math.floor((diffMs / 1000) % 60);

//     return { days, hours, minutes, seconds, totalMs: diffMs };
//   };

//   const formatCountdown = ({ days, hours, minutes, seconds }) => {
//     if (days > 0) {
//       return `${days}d ${hours}h ${minutes}m`;
//     }
//     return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(
//       2,
//       "0"
//     )}m ${String(seconds).padStart(2, "0")}s`;
//   };

//   return (
//     <UserWrapper>
//       <div className="p-4 md:p-6">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
//           <div>
//             <h1 className="text-xl font-semibold text-gray-800">My Bookings</h1>
//             <p className="text-sm text-gray-500 mt-0.5">
//               View and track the status of all your driving lesson bookings
//             </p>
//           </div>
//         </div>

//         {loading ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {[...Array(4)].map((_, i) => (
//               <div
//                 key={i}
//                 className="animate-pulse border border-gray-200 rounded-xl p-5 bg-white h-40"
//               />
//             ))}
//           </div>
//         ) : bookings.length === 0 ? (
//           <div className="text-center text-gray-500 py-16 border border-dashed rounded-xl bg-white">
//             <CalendarClock className="mx-auto mb-3 text-gray-300" size={40} />
//             No bookings found.
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//             {bookings.map((booking) => {
//               const status = getStatus(booking.status);
//               const bookingStart = getBookingStart(booking);
//               const countdown = getCountdown(bookingStart);
//               return (
//                 <div
//                   key={booking.id}
//                   className="relative border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
//                 >
//                   <div className={`absolute left-0 top-0 h-full w-1 ${status.bar}`} />

//                   <div className="p-5 pl-6">
//                     <div className="flex items-start justify-between gap-2 mb-3">
//                       <div>
//                         <div className="flex items-center gap-2 text-gray-800 font-semibold">
//                           <CalendarClock size={16} className="text-gray-400 shrink-0" />
//                           {formatDate(booking.reservation_date)}
//                         </div>
//                         <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
//                           <Clock size={14} className="text-gray-400 shrink-0" />
//                           {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}
//                         </div>
//                       </div>
//                       <span
//                         className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${status.badge}`}
//                       >
//                         {status.label}
//                       </span>
//                     </div>

//                     {countdown && (
//                       <div className="flex items-center gap-2 mb-3 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium w-fit">
//                         <Timer size={14} className="shrink-0" />
//                         <span>Starts in {formatCountdown(countdown)}</span>
//                       </div>
//                     )}

//                     <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-3">
//                       {booking.package_type && (
//                         <div className="flex items-center gap-2">
//                           <Tag size={14} className="text-gray-400 shrink-0" />
//                           <span>{booking.package_type}</span>
//                         </div>
//                       )}

//                       {booking.price && (
//                         <div className="flex items-center gap-2">
//                           <Wallet size={14} className="text-gray-400 shrink-0" />
//                           <span>{booking.price}</span>
//                         </div>
//                       )}

//                       {(booking.pickup_location || booking.dropoff_location) && (
//                         <div className="flex items-start gap-2">
//                           <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
//                           <span className="leading-snug">
//                             {booking.pickup_location}
//                             {booking.pickup_location && booking.dropoff_location ? " → " : ""}
//                             {booking.dropoff_location}
//                           </span>
//                         </div>
//                       )}

//                       {booking.test_location && (
//                         <div className="flex items-start gap-2">
//                           <FileCheck size={14} className="text-gray-400 shrink-0 mt-0.5" />
//                           <span className="leading-snug">
//                             Test location: {booking.test_location}
//                           </span>
//                         </div>
//                       )}

//                       {booking.comment && (
//                         <div className="flex items-start gap-2">
//                           <MessageSquare size={14} className="text-gray-400 shrink-0 mt-0.5" />
//                           <span className="leading-snug italic text-gray-500">
//                             {booking.comment}
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {pagination && pagination.last_page > 1 && (
//           <div className="flex justify-center items-center gap-2 mt-8">
//             <button
//               disabled={page <= 1}
//               onClick={() => setPage((p) => p - 1)}
//               className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent"
//             >
//               <ChevronLeft size={14} />
//               Prev
//             </button>
//             <span className="text-sm text-gray-600 px-2">
//               Page {pagination.current_page} of {pagination.last_page}
//             </span>
//             <button
//               disabled={page >= pagination.last_page}
//               onClick={() => setPage((p) => p + 1)}
//               className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent"
//             >
//               Next
//               <ChevronRight size={14} />
//             </button>
//           </div>
//         )}
//       </div>
//     </UserWrapper>
//   );
// }
