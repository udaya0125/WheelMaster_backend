import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Wrapper from '@/AdminWrapper/Wrapper';
import axios from 'axios';
import { X, User, Package, Car, CheckCircle, XCircle, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

const localizer = momentLocalizer(moment);

// Custom Year View Component
const YearView = ({ date, events, onDrillDown }) => {
  const currentYear = moment(date).year();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const months = monthNames.map((name, i) => {
    const monthEvents = events.filter(
      event =>
        moment(event.start).year() === currentYear &&
        moment(event.start).month() === i
    );
    return { name, index: i, events: monthEvents };
  });

  const getMonthColor = (count) => {
    if (count === 0) return 'bg-gray-50 hover:bg-gray-100 border-gray-200';
    if (count < 3)   return 'bg-green-50 hover:bg-green-100 border-green-300';
    if (count < 6)   return 'bg-yellow-50 hover:bg-yellow-100 border-yellow-300';
    return 'bg-orange-50 hover:bg-orange-100 border-orange-300';
  };

  return (
    <div className="year-view p-4" style={{ height: '100%', overflowY: 'auto' }}>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">{currentYear}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {months.map((month) => (
          <div
            key={month.index}
            onClick={() =>
              onDrillDown &&
              onDrillDown(
                moment().year(currentYear).month(month.index).startOf('month').toDate()
              )
            }
            className={`${getMonthColor(month.events.length)} rounded-xl p-5 cursor-pointer border-2 shadow-sm hover:shadow-xl hover:scale-105 transform transition-all duration-300`}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-gray-800">{month.name}</h3>
              <CalendarIcon size={20} className="text-gray-400" />
            </div>
            <div className="text-sm font-semibold text-gray-600 mb-2">
              {month.events.length} {month.events.length === 1 ? 'Booking' : 'Bookings'}
            </div>
            {month.events.length > 0 && (
              <div className="space-y-1">
                {month.events.slice(0, 2).map((event, idx) => (
                  <div key={idx} className="text-xs text-gray-500 truncate">
                    • {event.title}
                  </div>
                ))}
                {month.events.length > 2 && (
                  <div className="text-blue-500 text-xs font-semibold">
                    +{month.events.length - 2} more
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Static properties required by react-big-calendar for custom views
YearView.title = (date) => moment(date).format('YYYY');
YearView.navigate = (date, action) => {
  switch (action) {
    case 'PREV': return moment(date).subtract(1, 'year').startOf('year').toDate();
    case 'NEXT': return moment(date).add(1, 'year').startOf('year').toDate();
    default:     return date;
  }
};

const CalendarBooking = () => {
  const [events, setEvents] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    color: '#3b82f6'
  });
  const [view, setView] = useState('month');
  const [date, setDate] = useState(() => {
    return moment().startOf('month').toDate();
  });
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const colors = {
    Pending: '#f59e0b',
    Accepted: '#10b981',
    Rejected: '#ef4444',
    Default: '#3b82f6'
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showModal) {
      const scrollY = window.scrollY;
      const body = document.body;
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';
      body.style.overflowY = 'scroll';
      body.setAttribute('data-scroll-y', scrollY);

      return () => {
        const body = document.body;
        const scrollY = body.getAttribute('data-scroll-y');
        body.style.position = '';
        body.style.top = '';
        body.style.width = '';
        body.style.overflowY = '';
        if (scrollY) window.scrollTo(0, parseInt(scrollY, 10));
        body.removeAttribute('data-scroll-y');
      };
    }
  }, [showModal]);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(route('ouruserreservations.index'));

      if (response.data.success) {
        const fetchedReservations = response.data.data;
        setReservations(fetchedReservations);

        const calendarEvents = fetchedReservations.map(reservation => {
          const color = colors[reservation.status] || colors.Default;

          const startDate = new Date(reservation.reservation_date);
          const [startHour, startMinute] = reservation.start_time.split(':');
          const [endHour, endMinute] = reservation.end_time.split(':');

          const start = new Date(startDate);
          start.setHours(parseInt(startHour), parseInt(startMinute), 0);

          const end = new Date(startDate);
          end.setHours(parseInt(endHour), parseInt(endMinute), 0);

          const title = `${reservation.user_name} - ${reservation.package_type}`;

          const description = `
            User: ${reservation.user_name}
            Email: ${reservation.email}
            Phone: ${reservation.phone}
            Pickup: ${reservation.pickup_location}
            Dropoff: ${reservation.dropoff_location}
            Package: ${reservation.package_type}
            Status: ${reservation.status}
            Address: ${reservation.address}
            Test Time: ${reservation.test_time || 'N/A'}
          `;

          return {
            id: reservation.id,
            title,
            start,
            end,
            allDay: false,
            color,
            description,
            reservationData: reservation
          };
        });

        setEvents(calendarEvents);
      } else {
        setError('Failed to fetch reservations');
        toast.error('Failed to fetch reservations');
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Error loading reservations. Please try again.');
      toast.error('Error loading reservations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = useCallback((slotInfo) => {
    setSelectedSlot(slotInfo);
    setSelectedReservation(null);
    setNewEvent({ title: '', description: '', color: '#3b82f6' });
    setShowModal(true);
  }, []);

  const handleSelectEvent = useCallback((event) => {
    setSelectedReservation(event.reservationData);
    setSelectedSlot(null);
    setShowModal(true);
  }, []);

  const handleUpdateStatus = async (status) => {
    if (!selectedReservation) return;

    try {
      setUpdatingStatus(true);

      const response = await axios.put(
        route('ouruserreservations.update', { id: selectedReservation.id }),
        { status }
      );

      if (response.data.success) {
        setReservations(prev =>
          prev.map(r => r.id === selectedReservation.id ? { ...r, status } : r)
        );

        setEvents(prev =>
          prev.map(event => {
            if (event.id === selectedReservation.id) {
              return {
                ...event,
                color: colors[status] || colors.Default,
                reservationData: { ...selectedReservation, status }
              };
            }
            return event;
          })
        );

        setSelectedReservation(prev => ({ ...prev, status }));
        toast.success(`Reservation status updated to ${status}`);
      } else {
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(err.response?.data?.message || 'Failed to update reservation status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteReservation = async () => {
    if (!selectedReservation) return;

    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex flex-col`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">Delete Reservation</p>
              <p className="mt-1 text-sm text-gray-500">
                Are you sure you want to delete reservation #{selectedReservation.id}? This action cannot be undone.
              </p>
            </div>
            <button onClick={() => toast.dismiss(t.id)} className="ml-4 flex-shrink-0">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await axios.delete(
                    route('ouruserreservations.destroy', { id: selectedReservation.id })
                  );
                  setReservations(prev => prev.filter(r => r.id !== selectedReservation.id));
                  setEvents(prev => prev.filter(e => e.id !== selectedReservation.id));
                  handleCloseModal();
                  toast.success('Reservation deleted successfully');
                } catch (err) {
                  console.error('Error deleting reservation:', err);
                  toast.error('Failed to delete reservation');
                }
              }}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReservation(null);
    setSelectedSlot(null);
    setNewEvent({ title: '', description: '', color: '#3b82f6' });
    setUpdatingStatus(false);
  };

  // Navigate handler — handles month, year, and other views correctly
  const handleNavigate = useCallback((newDate, viewType) => {
    if (viewType === 'month') {
      setDate(moment(newDate).startOf('month').toDate());
    } else if (viewType === 'year') {
      setDate(moment(newDate).startOf('year').toDate());
    } else {
      setDate(newDate);
    }
  }, []);

  const handleView = useCallback((newView) => {
    setView(newView);
  }, []);

  // Drill down from year view card → month view
  const handleDrillDown = useCallback((targetDate) => {
    setDate(moment(targetDate).startOf('month').toDate());
    setView('month');
  }, []);

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: event.color,
      borderRadius: '6px',
      opacity: 0.9,
      color: 'white',
      border: '0',
      display: 'block',
      padding: '2px 5px',
      fontSize: '0.85em',
      fontWeight: '500',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  });

  const refreshReservations = () => {
    toast.promise(fetchReservations(), {
      loading: 'Refreshing reservations...',
      success: 'Reservations refreshed successfully',
      error: 'Failed to refresh reservations',
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Accepted': return <CheckCircle className="text-green-600" size={16} />;
      case 'Rejected': return <XCircle className="text-red-600" size={16} />;
      case 'Pending':  return <AlertCircle className="text-yellow-600" size={16} />;
      default:         return <AlertCircle className="text-gray-600" size={16} />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':  return 'bg-yellow-100 text-yellow-800';
      case 'Accepted': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default:         return 'bg-gray-100 text-gray-800';
    }
  };

  // Wrap YearView and forward the drill-down handler + copy static props
  const YearViewWithDrillDown = useCallback(
    (props) => <YearView {...props} onDrillDown={handleDrillDown} />,
    [handleDrillDown]
  );
  YearViewWithDrillDown.title    = YearView.title;
  YearViewWithDrillDown.navigate = YearView.navigate;

  const views = {
    month:  true,
    week:   true,
    day:    true,
    agenda: true,
    year:   YearViewWithDrillDown,
  };

  return (
    <Wrapper>
      <div className="">
        <Toaster
          position="center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
            },
            success: {
              duration: 3000,
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              duration: 4000,
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
            loading: { duration: Infinity },
          }}
        />

        <div className="sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">

          {/* Calendar */}
          {loading && events.length === 0 ? (
            <div
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 text-center"
              style={{ height: '70vh', minHeight: '550px' }}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mb-3 sm:mb-4"></div>
                <p className="text-gray-600 text-sm sm:text-base">Loading reservations...</p>
              </div>
            </div>
          ) : (
            <div
              className="bg-white rounded-xl shadow-lg p-2 sm:p-4 md:p-6"
              style={{ height: '70vh', minHeight: '550px' }}
            >
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                onNavigate={handleNavigate}
                onView={handleView}
                view={view}
                date={date}
                eventPropGetter={eventStyleGetter}
                views={views}
                defaultView="month"
                style={{ height: '100%' }}
                popup
                showMultiDayTimes
                step={30}
                timeslots={2}
                className="rbc-calendar-sm"
                messages={{
                  today: 'Today',
                  previous: 'Prev',
                  next: 'Next',
                  month: 'Month',
                  week: 'Week',
                  day: 'Day',
                  agenda: 'Agenda',
                  year: 'Year',
                  date: 'Date',
                  time: 'Time',
                  event: 'Event',
                  noEventsInRange: 'No reservations in this range'
                }}
              />
            </div>
          )}

          {/* Stats Section */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mt-4 sm:mt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Reservation Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600">Total Reservations</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">{reservations.length}</p>
              </div>
              <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">
                  {reservations.filter(r => r.status === 'Pending').length}
                </p>
              </div>
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600">Accepted</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">
                  {reservations.filter(r => r.status === 'Accepted').length}
                </p>
              </div>
              <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600">Rejected</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600">
                  {reservations.filter(r => r.status === 'Rejected').length}
                </p>
              </div>
            </div>
          </div>

          {/* Reservation Details Modal */}
          {showModal && selectedReservation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
              <div
                className="bg-white rounded-xl shadow-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                      {selectedReservation.package_type}
                    </h2>
                    <div className="flex items-center gap-1 sm:gap-2 mt-1">
                      {getStatusIcon(selectedReservation.status)}
                      <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm font-semibold ${getStatusBadgeClass(selectedReservation.status)}`}>
                        {selectedReservation.status}
                      </span>
                      <span className="text-gray-500 text-xs sm:text-sm">
                        • Booked {moment(selectedReservation.created_at).fromNow()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={18} className="sm:w-5 sm:h-5" />
                  </button>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* User Information */}
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <h3 className="font-bold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                        <User size={14} className="sm:w-4 sm:h-4" />
                        <span className="text-sm sm:text-base">User Information</span>
                      </h3>
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs sm:text-sm text-gray-600">Name:</span>
                          <span className="text-xs sm:text-sm font-medium">{selectedReservation.user_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs sm:text-sm text-gray-600">Email:</span>
                          <span className="text-xs sm:text-sm font-medium">{selectedReservation.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs sm:text-sm text-gray-600">Phone:</span>
                          <span className="text-xs sm:text-sm font-medium">{selectedReservation.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs sm:text-sm text-gray-600">Address:</span>
                          <span className="text-xs sm:text-sm font-medium">{selectedReservation.address}</span>
                        </div>
                      </div>
                    </div>

                    {/* Package Information */}
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                      <h3 className="font-bold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                        <Package size={14} className="sm:w-4 sm:h-4" />
                        <span className="text-sm sm:text-base">Package Details</span>
                      </h3>
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs sm:text-sm text-gray-600">Package Type:</span>
                          <span className="text-xs sm:text-sm font-medium">{selectedReservation.package_type}</span>
                        </div>
                        {selectedReservation.test_time && (
                          <div className="flex justify-between">
                            <span className="text-xs sm:text-sm text-gray-600">Test Time:</span>
                            <span className="text-xs sm:text-sm font-medium">{selectedReservation.test_time}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Trip Information */}
                    <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                      <h3 className="font-bold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                        <Car size={14} className="sm:w-4 sm:h-4" />
                        <span className="text-sm sm:text-base">Trip Information</span>
                      </h3>
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs sm:text-sm text-gray-600">Pickup:</span>
                          <span className="text-xs sm:text-sm font-medium">{selectedReservation.pickup_location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs sm:text-sm text-gray-600">Dropoff:</span>
                          <span className="text-xs sm:text-sm font-medium">{selectedReservation.dropoff_location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs sm:text-sm text-gray-600">Date:</span>
                          <span className="text-xs sm:text-sm font-medium">
                            {moment(selectedReservation.reservation_date).format('ddd, MMM D, YYYY')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs sm:text-sm text-gray-600">Time:</span>
                          <span className="text-xs sm:text-sm font-medium">
                            {selectedReservation.start_time} - {selectedReservation.end_time}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs sm:text-sm text-gray-600">Duration:</span>
                          <span className="text-xs sm:text-sm font-medium">
                            {moment
                              .duration(
                                moment(selectedReservation.end_time, 'HH:mm:ss').diff(
                                  moment(selectedReservation.start_time, 'HH:mm:ss')
                                )
                              )
                              .asHours()
                              .toFixed(1)}{' '}
                            hours
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Actions */}
                    <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
                      <h3 className="font-bold text-gray-700 mb-2 sm:mb-3">Manage Reservation</h3>
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                        {selectedReservation.status !== 'Accepted' && (
                          <button
                            onClick={() => handleUpdateStatus('Accepted')}
                            disabled={updatingStatus}
                            className={`px-2 py-1.5 sm:px-3 sm:py-2 text-white bg-green-600 rounded text-xs sm:text-sm flex items-center justify-center gap-1 ${
                              updatingStatus ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
                            }`}
                          >
                            {updatingStatus ? (
                              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                                <span>Accept</span>
                              </>
                            )}
                          </button>
                        )}

                        {selectedReservation.status !== 'Rejected' && (
                          <button
                            onClick={() => handleUpdateStatus('Rejected')}
                            disabled={updatingStatus}
                            className={`px-2 py-1.5 sm:px-3 sm:py-2 text-white bg-red-600 rounded text-xs sm:text-sm flex items-center justify-center gap-1 ${
                              updatingStatus ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                            }`}
                          >
                            {updatingStatus ? (
                              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <XCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                                <span>Reject</span>
                              </>
                            )}
                          </button>
                        )}

                        {(selectedReservation.status === 'Accepted' ||
                          selectedReservation.status === 'Rejected') && (
                          <button
                            onClick={() => handleUpdateStatus('Pending')}
                            disabled={updatingStatus}
                            className={`px-2 py-1.5 sm:px-3 sm:py-2 text-white bg-gray-600 rounded text-xs sm:text-sm flex items-center justify-center ${
                              updatingStatus ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
                            }`}
                          >
                            {updatingStatus ? (
                              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                            ) : (
                              'Reset'
                            )}
                          </button>
                        )}

                        <button
                          onClick={handleDeleteReservation}
                          className="px-2 py-1.5 sm:px-3 sm:py-2 text-white bg-red-500 rounded text-xs sm:text-sm col-span-3 mt-1.5 sm:mt-2 hover:bg-red-600"
                        >
                          Delete Reservation
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <div className="mt-4 sm:mt-6 flex justify-end">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-1.5 sm:px-6 sm:py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg text-sm sm:text-base transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
};

export default CalendarBooking;