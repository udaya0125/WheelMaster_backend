import { useEffect, useState } from "react";
import axios from "axios";
import {
  CalendarClock,
  MapPin,
  Clock,
  Tag,
  Wallet,
  MessageSquare,
  FileCheck,
  Timer,
  ChevronLeft,
  ChevronRight,
  CalendarCog,
} from "lucide-react";
import UserWrapper from "@/Wrapper/UserWrapper";
import Loader from "./Loader";
import RescheduleModal from "./RescheduleModal";
import toast, { Toaster } from "react-hot-toast";

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [rescheduleTarget, setRescheduleTarget] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchUpcoming = async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(route("ourbookings.history"), {
        params: {
          upcoming: 1,
          sort: "asc",
          per_page: 6,
          page: pageNum,
        },
      });
      const result = response.data.data;
      setBookings(result.data);
      setPagination(result);
    } catch (error) {
      console.error("Failed to fetch upcoming bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcoming(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const statusConfig = {
    Accepted: { label: "Confirmed", badge: "bg-green-100 text-green-700", bar: "bg-green-500" },
    Rejected: { label: "Cancelled", badge: "bg-red-100 text-red-700", bar: "bg-red-500" },
    Pending: { label: "Pending", badge: "bg-yellow-100 text-yellow-700", bar: "bg-yellow-500" },
  };

  const getStatus = (status) =>
    statusConfig[status] || { label: status, badge: "bg-gray-100 text-gray-700", bar: "bg-gray-400" };

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

  const getBookingStart = (booking) => {
    if (!booking.reservation_date || !booking.start_time) return null;
    const d = new Date(`${booking.reservation_date}T${booking.start_time}`);
    return isNaN(d) ? null : d;
  };

  const getCountdown = (target) => {
    if (!target) return null;
    const diffMs = target.getTime() - now;
    if (diffMs <= 0) return null;

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const seconds = Math.floor((diffMs / 1000) % 60);

    return { days, hours, minutes, seconds };
  };

  const formatCountdown = ({ days, hours, minutes, seconds }) => {
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(
      2,
      "0"
    )}m ${String(seconds).padStart(2, "0")}s`;
  };

  // A booking can be rescheduled as long as it hasn't been cancelled AND
  // its start time hasn't arrived yet. This is checked against the live
  // `now` clock (same one driving the countdown) so the button disappears
  // on its own the instant the slot starts — no page refresh or refetch
  // needed to hide it.
  const canReschedule = (booking) => {
    if (booking.status === "Rejected") return false;
    const start = getBookingStart(booking);
    if (start && start.getTime() <= now) return false;
    return true;
  };

  const handleRescheduled = (updatedBooking) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === updatedBooking.id ? { ...b, ...updatedBooking } : b))
    );
    // Refresh from the server too, since a reschedule can move a booking
    // out of the "upcoming, page N" window it was originally fetched into.
    fetchUpcoming(page);
  };

  return (
    <UserWrapper>
      <Toaster position="top-right" />
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Upcoming Bookings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Your next scheduled driving lessons, soonest first
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader />
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-gray-500 py-24 border border-dashed rounded-xl bg-white">
            <CalendarClock className="mb-3 text-gray-300" size={40} />
            <p className="font-medium text-gray-600">No upcoming bookings</p>
            <p className="text-sm mt-1">Book a lesson to see it appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {bookings.map((booking, index) => {
              const status = getStatus(booking.status);
              const bookingStart = getBookingStart(booking);
              const countdown = getCountdown(bookingStart);
              const isNext = page === 1 && index === 0;

              return (
                <div
                  key={booking.id}
                  className={`relative border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
                    isNext ? "border-blue-300 ring-1 ring-blue-100" : "border-gray-200"
                  }`}
                >
                  <div className={`absolute left-0 top-0 h-full w-1 ${status.bar}`} />

                  <div className="p-5 pl-6">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        {isNext && (
                          <span className="inline-block mb-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600">
                            Next Up
                          </span>
                        )}
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
                    </div>

                    {canReschedule(booking) && (
                      <div className="border-t border-gray-100 pt-3 mt-3">
                        <button
                          type="button"
                          onClick={() => setRescheduleTarget(booking)}
                          className="w-full flex items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
                        >
                          <CalendarCog size={15} />
                          Reschedule
                        </button>
                      </div>
                    )}
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

      {rescheduleTarget && (
        <RescheduleModal
          booking={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onRescheduled={handleRescheduled}
        />
      )}
    </UserWrapper>
  );
};

export default UserDashboard;


// import { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   CalendarClock,
//   MapPin,
//   Clock,
//   Tag,
//   Wallet,
//   MessageSquare,
//   FileCheck,
//   Timer,
//   ChevronLeft,
//   ChevronRight,
//   CalendarCog,
// } from "lucide-react";
// import UserWrapper from "@/Wrapper/UserWrapper";
// import Loader from "./Loader";
// import RescheduleModal from "./RescheduleModal";
// import toast, { Toaster } from "react-hot-toast";

// const UserDashboard = () => {
//   const [bookings, setBookings] = useState([]);
//   const [pagination, setPagination] = useState(null);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [now, setNow] = useState(() => Date.now());
//   const [rescheduleTarget, setRescheduleTarget] = useState(null);

//   useEffect(() => {
//     const timer = setInterval(() => setNow(Date.now()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const fetchUpcoming = async (pageNum = 1) => {
//     setLoading(true);
//     try {
//       const response = await axios.get(route("ourbookings.history"), {
//         params: {
//           upcoming: 1,
//           sort: "asc",
//           per_page: 6,
//           page: pageNum,
//         },
//       });
//       const result = response.data.data;
//       setBookings(result.data);
//       setPagination(result);
//     } catch (error) {
//       console.error("Failed to fetch upcoming bookings:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUpcoming(page);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [page]);

//   const statusConfig = {
//     Accepted: { label: "Confirmed", badge: "bg-green-100 text-green-700", bar: "bg-green-500" },
//     Rejected: { label: "Cancelled", badge: "bg-red-100 text-red-700", bar: "bg-red-500" },
//     Pending: { label: "Pending", badge: "bg-yellow-100 text-yellow-700", bar: "bg-yellow-500" },
//   };

//   const getStatus = (status) =>
//     statusConfig[status] || { label: status, badge: "bg-gray-100 text-gray-700", bar: "bg-gray-400" };

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

//   const getBookingStart = (booking) => {
//     if (!booking.reservation_date || !booking.start_time) return null;
//     const d = new Date(`${booking.reservation_date}T${booking.start_time}`);
//     return isNaN(d) ? null : d;
//   };

//   const getCountdown = (target) => {
//     if (!target) return null;
//     const diffMs = target.getTime() - now;
//     if (diffMs <= 0) return null;

//     const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
//     const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
//     const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
//     const seconds = Math.floor((diffMs / 1000) % 60);

//     return { days, hours, minutes, seconds };
//   };

//   const formatCountdown = ({ days, hours, minutes, seconds }) => {
//     if (days > 0) return `${days}d ${hours}h ${minutes}m`;
//     return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(
//       2,
//       "0"
//     )}m ${String(seconds).padStart(2, "0")}s`;
//   };

//   // A booking can be rescheduled as long as it hasn't been cancelled.
//   const canReschedule = (booking) => booking.status !== "Rejected";

//   const handleRescheduled = (updatedBooking) => {
//     setBookings((prev) =>
//       prev.map((b) => (b.id === updatedBooking.id ? { ...b, ...updatedBooking } : b))
//     );
//     // Refresh from the server too, since a reschedule can move a booking
//     // out of the "upcoming, page N" window it was originally fetched into.
//     fetchUpcoming(page);
//   };

//   return (
//     <UserWrapper>
//       <Toaster position="top-right" />
//       <div className="p-4 md:p-6">
//         <div className="mb-6">
//           <h1 className="text-xl font-semibold text-gray-800">Upcoming Bookings</h1>
//           <p className="text-sm text-gray-500 mt-0.5">
//             Your next scheduled driving lessons, soonest first
//           </p>
//         </div>

//         {loading ? (
//           <div className="flex items-center justify-center py-24">
//             <Loader />
//           </div>
//         ) : bookings.length === 0 ? (
//           <div className="flex flex-col items-center justify-center text-center text-gray-500 py-24 border border-dashed rounded-xl bg-white">
//             <CalendarClock className="mb-3 text-gray-300" size={40} />
//             <p className="font-medium text-gray-600">No upcoming bookings</p>
//             <p className="text-sm mt-1">Book a lesson to see it appear here.</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//             {bookings.map((booking, index) => {
//               const status = getStatus(booking.status);
//               const bookingStart = getBookingStart(booking);
//               const countdown = getCountdown(bookingStart);
//               const isNext = page === 1 && index === 0;

//               return (
//                 <div
//                   key={booking.id}
//                   className={`relative border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
//                     isNext ? "border-blue-300 ring-1 ring-blue-100" : "border-gray-200"
//                   }`}
//                 >
//                   <div className={`absolute left-0 top-0 h-full w-1 ${status.bar}`} />

//                   <div className="p-5 pl-6">
//                     <div className="flex items-start justify-between gap-2 mb-3">
//                       <div>
//                         {isNext && (
//                           <span className="inline-block mb-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600">
//                             Next Up
//                           </span>
//                         )}
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
//                     </div>

//                     {canReschedule(booking) && (
//                       <div className="border-t border-gray-100 pt-3 mt-3">
//                         <button
//                           type="button"
//                           onClick={() => setRescheduleTarget(booking)}
//                           className="w-full flex items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
//                         >
//                           <CalendarCog size={15} />
//                           Reschedule
//                         </button>
//                       </div>
//                     )}
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

//       {rescheduleTarget && (
//         <RescheduleModal
//           booking={rescheduleTarget}
//           onClose={() => setRescheduleTarget(null)}
//           onRescheduled={handleRescheduled}
//         />
//       )}
//     </UserWrapper>
//   );
// };

// export default UserDashboard;
