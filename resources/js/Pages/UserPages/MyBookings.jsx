import { useEffect, useState } from "react";
import axios from "axios";
import { CalendarClock, MapPin } from "lucide-react";
import UserWrapper from "@/Wrapper/UserWrapper";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

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

  const statusBadge = (status) => {
    const styles = {
      Accepted: "bg-green-100 text-green-700",
      Rejected: "bg-red-100 text-red-700",
      Pending: "bg-yellow-100 text-yellow-700",
    };
    const labels = {
      Accepted: "Completed",
      Rejected: "Cancelled",
      Pending: "Pending",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  return (
    <>
    <UserWrapper>
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h1 className="text-xl font-semibold text-gray-800">My Bookings</h1>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading your bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center text-gray-500 py-12 border border-dashed rounded-lg">
          No bookings found.
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white shadow-sm"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 text-gray-800 font-medium">
                  <CalendarClock size={16} className="text-gray-400" />
                  {booking.reservation_date} · {booking.start_time?.slice(0, 5)} -{" "}
                  {booking.end_time?.slice(0, 5)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {booking.package_type}
                  {booking.price ? ` · ${booking.price}` : ""}
                </div>
                {(booking.pickup_location || booking.dropoff_location) && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin size={14} />
                    {booking.pickup_location}
                    {booking.pickup_location && booking.dropoff_location ? " → " : ""}
                    {booking.dropoff_location}
                  </div>
                )}
              </div>
              <div>{statusBadge(booking.status)}</div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.last_page > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <button
            disabled={page >= pagination.last_page}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
    </UserWrapper>
    </>
  );
}
