// import React, { useState, useCallback, useEffect } from 'react';
// import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
// import moment from 'moment';
// import 'react-big-calendar/lib/css/react-big-calendar.css';
// import Wrapper from '@/AdminWrapper/Wrapper';
// import axios from 'axios';
// import { X, User, Package, Car, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
// import { toast, Toaster } from 'react-hot-toast';

// const localizer = momentLocalizer(moment);

// const CalendarBooking = () => {
//   const [events, setEvents] = useState([]);
//   const [reservations, setReservations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedSlot, setSelectedSlot] = useState(null);
//   const [selectedReservation, setSelectedReservation] = useState(null);
//   const [newEvent, setNewEvent] = useState({
//     title: '',
//     description: '',
//     color: '#3b82f6'
//   });
//   const [view, setView] = useState('month');
//   const [date, setDate] = useState(new Date());
//   const [updatingStatus, setUpdatingStatus] = useState(false);
  
//   const colors = {
//     Pending: '#f59e0b',
//     Accepted: '#10b981',
//     Rejected: '#ef4444',
//     Default: '#3b82f6'
//   };

//   // Prevent background scrolling when modal is open
//   useEffect(() => {
//     if (showModal) {
//       // Store the current scroll position
//       const scrollY = window.scrollY;
//       const body = document.body;
      
//       // Add styles to prevent scrolling
//       body.style.position = 'fixed';
//       body.style.top = `-${scrollY}px`;
//       body.style.width = '100%';
//       body.style.overflowY = 'scroll';
      
//       // Store scroll position for later restoration
//       body.setAttribute('data-scroll-y', scrollY);
      
//       return () => {
//         // Restore scrolling when modal closes
//         const body = document.body;
//         const scrollY = body.getAttribute('data-scroll-y');
        
//         body.style.position = '';
//         body.style.top = '';
//         body.style.width = '';
//         body.style.overflowY = '';
        
//         if (scrollY) {
//           window.scrollTo(0, parseInt(scrollY, 10));
//         }
        
//         body.removeAttribute('data-scroll-y');
//       };
//     }
//   }, [showModal]);

//   useEffect(() => {
//     fetchReservations();
//   }, []);

//   const fetchReservations = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await axios.get(route('ouruserreservations.index'));
      
//       if (response.data.success) {
//         const fetchedReservations = response.data.data;
//         setReservations(fetchedReservations);
        
//         const calendarEvents = fetchedReservations.map(reservation => {
//           const color = colors[reservation.status] || colors.Default;
          
//           const startDate = new Date(reservation.reservation_date);
//           const [startHour, startMinute] = reservation.start_time.split(':');
//           const [endHour, endMinute] = reservation.end_time.split(':');
          
//           const start = new Date(startDate);
//           start.setHours(parseInt(startHour), parseInt(startMinute), 0);
          
//           const end = new Date(startDate);
//           end.setHours(parseInt(endHour), parseInt(endMinute), 0);
          
//           const title = `${reservation.user_name} - ${reservation.package_type}`;
          
//           const description = `
//             User: ${reservation.user_name}
//             Email: ${reservation.email}
//             Phone: ${reservation.phone}
//             Pickup: ${reservation.pickup_location}
//             Dropoff: ${reservation.dropoff_location}
//             Package: ${reservation.package_type}
//             Status: ${reservation.status}
//             Address: ${reservation.address}
//             Test Time: ${reservation.test_time || 'N/A'}
//           `;
          
//           return {
//             id: reservation.id,
//             title: title,
//             start: start,
//             end: end,
//             allDay: false,
//             color: color,
//             description: description,
//             reservationData: reservation
//           };
//         });
        
//         setEvents(calendarEvents);
//       } else {
//         setError('Failed to fetch reservations');
//         toast.error('Failed to fetch reservations');
//       }
//     } catch (err) {
//       console.error('Error fetching reservations:', err);
//       setError('Error loading reservations. Please try again.');
//       toast.error('Error loading reservations. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSelectSlot = useCallback((slotInfo) => {
//     setSelectedSlot(slotInfo);
//     setSelectedReservation(null);
//     setNewEvent({
//       title: '',
//       description: '',
//       color: '#3b82f6'
//     });
//     setShowModal(true);
//   }, []);

//   const handleSelectEvent = useCallback((event) => {
//     setSelectedReservation(event.reservationData);
//     setSelectedSlot(null);
//     setShowModal(true);
//   }, []);

//   const handleUpdateStatus = async (status) => {
//     if (!selectedReservation) return;
    
//     try {
//       setUpdatingStatus(true);
      
//       const response = await axios.put(
//         route('ouruserreservations.update', { id: selectedReservation.id }),
//         { status: status }
//       );
      
//       if (response.data.success) {
//         const updatedReservations = reservations.map(r => 
//           r.id === selectedReservation.id ? { ...r, status: status } : r
//         );
//         setReservations(updatedReservations);
        
//         const updatedEvents = events.map(event => {
//           if (event.id === selectedReservation.id) {
//             return {
//               ...event,
//               color: colors[status] || colors.Default,
//               title: `${selectedReservation.user_name} - ${selectedReservation.package_type}`,
//               reservationData: { ...selectedReservation, status: status }
//             };
//           }
//           return event;
//         });
//         setEvents(updatedEvents);
        
//         setSelectedReservation({ ...selectedReservation, status: status });
        
//         toast.success(`Reservation status updated to ${status}`);
//       } else {
//         toast.error(response.data.message || 'Failed to update status');
//       }
//     } catch (err) {
//       console.error('Error updating status:', err);
//       toast.error(err.response?.data?.message || 'Failed to update reservation status');
//     } finally {
//       setUpdatingStatus(false);
//     }
//   };

//   const handleDeleteReservation = async () => {
//     if (!selectedReservation) return;
    
//     // Show confirmation toast with action buttons
//     const toastId = toast.custom((t) => (
//       <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex flex-col`}>
//         <div className="p-4">
//           <div className="flex items-start">
//             <div className="flex-shrink-0">
//               <AlertCircle className="h-6 w-6 text-red-600" />
//             </div>
//             <div className="ml-3 w-0 flex-1">
//               <p className="text-sm font-medium text-gray-900">
//                 Delete Reservation
//               </p>
//               <p className="mt-1 text-sm text-gray-500">
//                 Are you sure you want to delete reservation #{selectedReservation.id}? This action cannot be undone.
//               </p>
//             </div>
//             <button
//               onClick={() => toast.dismiss(t.id)}
//               className="ml-4 flex-shrink-0 flex"
//             >
//               <X className="h-5 w-5 text-gray-400" />
//             </button>
//           </div>
//           <div className="mt-4 flex justify-end space-x-3">
//             <button
//               onClick={() => {
//                 toast.dismiss(t.id);
//                 performDelete();
//               }}
//               className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
//             >
//               Delete
//             </button>
//             <button
//               onClick={() => toast.dismiss(t.id)}
//               className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     ), {
//       duration: Infinity, // Custom toast doesn't auto-dismiss
//     });

//     // Function to perform the actual delete
//     const performDelete = async () => {
//       try {
//         await axios.delete(
//           route('ouruserreservations.destroy', { id: selectedReservation.id })
//         );
        
//         const updatedReservations = reservations.filter(r => r.id !== selectedReservation.id);
//         setReservations(updatedReservations);
        
//         const updatedEvents = events.filter(event => event.id !== selectedReservation.id);
//         setEvents(updatedEvents);
        
//         handleCloseModal();
//         toast.success('Reservation deleted successfully');
//       } catch (err) {
//         console.error('Error deleting reservation:', err);
//         toast.error('Failed to delete reservation');
//       }
//     };
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setSelectedReservation(null);
//     setSelectedSlot(null);
//     setNewEvent({ title: '', description: '', color: '#3b82f6' });
//     setUpdatingStatus(false);
//   };

//   const handleNavigate = useCallback((newDate) => {
//     setDate(newDate);
//   }, []);

//   const handleView = useCallback((newView) => {
//     setView(newView);
//   }, []);

//   const eventStyleGetter = (event) => {
//     const style = {
//       backgroundColor: event.color,
//       borderRadius: '6px',
//       opacity: 0.9,
//       color: 'white',
//       border: '0',
//       display: 'block',
//       padding: '2px 5px',
//       fontSize: '0.85em',
//       fontWeight: '500',
//       overflow: 'hidden',
//       textOverflow: 'ellipsis',
//       whiteSpace: 'nowrap'
//     };
//     return { style };
//   };

//   const goToToday = () => {
//     setDate(new Date());
//     toast.success('Navigated to today');
//   };

//   const refreshReservations = () => {
//     toast.promise(
//       fetchReservations(),
//       {
//         loading: 'Refreshing reservations...',
//         success: 'Reservations refreshed successfully',
//         error: 'Failed to refresh reservations',
//       }
//     );
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'Accepted': return <CheckCircle className="text-green-600" size={16} />;
//       case 'Rejected': return <XCircle className="text-red-600" size={16} />;
//       case 'Pending': return <AlertCircle className="text-yellow-600" size={16} />;
//       default: return <AlertCircle className="text-gray-600" size={16} />;
//     }
//   };

//   const getStatusBadgeClass = (status) => {
//     switch (status) {
//       case 'Pending': return 'bg-yellow-100 text-yellow-800';
//       case 'Accepted': return 'bg-green-100 text-green-800';
//       case 'Rejected': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <Wrapper>
//       <div className="">
//         {/* Add Toaster component at the top level */}
//         <Toaster
//           position="top-right"
//           toastOptions={{
//             duration: 4000,
//             style: {
//               background: '#fff',
//               color: '#374151',
//               borderRadius: '10px',
//               border: '1px solid #e5e7eb',
//             },
//             success: {
//               duration: 3000,
//               iconTheme: {
//                 primary: '#10b981',
//                 secondary: '#fff',
//               },
//             },
//             error: {
//               duration: 4000,
//               iconTheme: {
//                 primary: '#ef4444',
//                 secondary: '#fff',
//               },
//             },
//             loading: {
//               duration: Infinity,
//             },
//           }}
//         />
        
//         <div className="sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
//           {/* Calendar */}
//           {loading && events.length === 0 ? (
//             <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 text-center" style={{ height: '70vh', minHeight: '550px' }}>
//               <div className="flex flex-col items-center justify-center h-full">
//                 <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mb-3 sm:mb-4"></div>
//                 <p className="text-gray-600 text-sm sm:text-base">Loading reservations...</p>
//               </div>
//             </div>
//           ) : (
//             <div className="bg-white rounded-xl shadow-lg p-2 sm:p-4 md:p-6" style={{ height: '70vh', minHeight: '550px' }}>
//               <Calendar
//                 localizer={localizer}
//                 events={events}
//                 startAccessor="start"
//                 endAccessor="end"
//                 selectable
//                 onSelectSlot={handleSelectSlot}
//                 onSelectEvent={handleSelectEvent}
//                 onNavigate={handleNavigate}
//                 onView={handleView}
//                 view={view}
//                 date={date}
//                 eventPropGetter={eventStyleGetter}
//                 views={['month', 'week', 'day', 'agenda']}
//                 defaultView="month"
//                 style={{ height: '100%' }}
//                 popup
//                 showMultiDayTimes
//                 step={30}
//                 timeslots={2}
//                 className="rbc-calendar-sm"
//                 messages={{
//                   today: 'Today',
//                   previous: 'Prev',
//                   next: 'Next',
//                   month: 'Month',
//                   week: 'Week',
//                   day: 'Day',
//                   agenda: 'Agenda',
//                   date: 'Date',
//                   time: 'Time',
//                   event: 'Event',
//                   noEventsInRange: 'No reservations in this range'
//                 }}
//               />
//             </div>
//           )}

//           {/* Stats Section */}
//           <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mt-4 sm:mt-6">
//             <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Reservation Overview</h2>
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
//               <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
//                 <p className="text-xs sm:text-sm text-gray-600">Total Reservations</p>
//                 <p className="text-lg sm:text-2xl font-bold text-blue-600">{reservations.length}</p>
//               </div>
//               <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
//                 <p className="text-xs sm:text-sm text-gray-600">Pending</p>
//                 <p className="text-lg sm:text-2xl font-bold text-yellow-600">
//                   {reservations.filter(r => r.status === 'Pending').length}
//                 </p>
//               </div>
//               <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
//                 <p className="text-xs sm:text-sm text-gray-600">Accepted</p>
//                 <p className="text-lg sm:text-2xl font-bold text-green-600">
//                   {reservations.filter(r => r.status === 'Accepted').length}
//                 </p>
//               </div>
//               <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
//                 <p className="text-xs sm:text-sm text-gray-600">Rejected</p>
//                 <p className="text-lg sm:text-2xl font-bold text-red-600">
//                   {reservations.filter(r => r.status === 'Rejected').length}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Reservation Details Modal */}
//           {showModal && selectedReservation && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
//               <div 
//                 className="bg-white rounded-xl shadow-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 {/* Modal Header */}
//                 <div className="flex justify-between items-start mb-4 sm:mb-6">
//                   <div>
//                     <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
//                       {selectedReservation.package_type}
//                     </h2>
//                     <div className="flex items-center gap-1 sm:gap-2 mt-1">
//                       {getStatusIcon(selectedReservation.status)}
//                       <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm font-semibold ${getStatusBadgeClass(selectedReservation.status)}`}>
//                         {selectedReservation.status}
//                       </span>
//                       <span className="text-gray-500 text-xs sm:text-sm">
//                         • Booked {moment(selectedReservation.created_at).fromNow()}
//                       </span>
//                     </div>
//                   </div>
//                   <button
//                     onClick={handleCloseModal}
//                     className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                   >
//                     <X size={18} className="sm:w-5 sm:h-5" />
//                   </button>
//                 </div>

//                 {/* Main Content Grid */}
//                 <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
//                   {/* Left Column - User Info */}
//                   <div className="space-y-4">
//                     {/* User Information */}
//                     <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
//                       <h3 className="font-bold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
//                         <User size={14} className="sm:w-4 sm:h-4" />
//                         <span className="text-sm sm:text-base">User Information</span>
//                       </h3>
//                       <div className="space-y-1.5 sm:space-y-2">
//                         <div className="flex justify-between">
//                           <span className="text-xs sm:text-sm text-gray-600">Name:</span>
//                           <span className="text-xs sm:text-sm font-medium">{selectedReservation.user_name}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-xs sm:text-sm text-gray-600">Email:</span>
//                           <span className="text-xs sm:text-sm font-medium">{selectedReservation.email}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-xs sm:text-sm text-gray-600">Phone:</span>
//                           <span className="text-xs sm:text-sm font-medium">{selectedReservation.phone}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-xs sm:text-sm text-gray-600">Address:</span>
//                           <span className="text-xs sm:text-sm font-medium">{selectedReservation.address}</span>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Package Information */}
//                     <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
//                       <h3 className="font-bold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
//                         <Package size={14} className="sm:w-4 sm:h-4" />
//                         <span className="text-sm sm:text-base">Package Details</span>
//                       </h3>
//                       <div className="space-y-1.5 sm:space-y-2">
//                         <div className="flex justify-between">
//                           <span className="text-xs sm:text-sm text-gray-600">Package Type:</span>
//                           <span className="text-xs sm:text-sm font-medium">{selectedReservation.package_type}</span>
//                         </div>
//                         {selectedReservation.test_time && (
//                           <div className="flex justify-between">
//                             <span className="text-xs sm:text-sm text-gray-600">Test Time:</span>
//                             <span className="text-xs sm:text-sm font-medium">{selectedReservation.test_time}</span>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Right Column - Trip Info */}
//                   <div className="space-y-4">
//                     {/* Trip Information */}
//                     <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
//                       <h3 className="font-bold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
//                         <Car size={14} className="sm:w-4 sm:h-4" />
//                         <span className="text-sm sm:text-base">Trip Information</span>
//                       </h3>
//                       <div className="space-y-1.5 sm:space-y-2">
//                         <div className="flex justify-between">
//                           <span className="text-xs sm:text-sm text-gray-600">Pickup:</span>
//                           <span className="text-xs sm:text-sm font-medium">{selectedReservation.pickup_location}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-xs sm:text-sm text-gray-600">Dropoff:</span>
//                           <span className="text-xs sm:text-sm font-medium">{selectedReservation.dropoff_location}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-xs sm:text-sm text-gray-600">Date:</span>
//                           <span className="text-xs sm:text-sm font-medium">
//                             {moment(selectedReservation.reservation_date).format('ddd, MMM D, YYYY')}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-xs sm:text-sm text-gray-600">Time:</span>
//                           <span className="text-xs sm:text-sm font-medium">
//                             {selectedReservation.start_time} - {selectedReservation.end_time}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-xs sm:text-sm text-gray-600">Duration:</span>
//                           <span className="text-xs sm:text-sm font-medium">
//                             {moment.duration(moment(selectedReservation.end_time, 'HH:mm:ss')
//                               .diff(moment(selectedReservation.start_time, 'HH:mm:ss')))
//                               .asHours().toFixed(1)} hours
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Status Actions */}
//                     <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
//                       <h3 className="font-bold text-gray-700 mb-2 sm:mb-3">Manage Reservation</h3>
//                       <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
//                         {selectedReservation.status !== 'Accepted' && (
//                           <button
//                             onClick={() => handleUpdateStatus('Accepted')}
//                             disabled={updatingStatus}
//                             className={`px-2 py-1.5 sm:px-3 sm:py-2 text-white bg-green-600 rounded text-xs sm:text-sm flex items-center justify-center gap-1 ${
//                               updatingStatus ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
//                             }`}
//                           >
//                             {updatingStatus ? (
//                               <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
//                             ) : (
//                               <>
//                                 <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5" />
//                                 <span>Accept</span>
//                               </>
//                             )}
//                           </button>
//                         )}

//                         {selectedReservation.status !== 'Rejected' && (
//                           <button
//                             onClick={() => handleUpdateStatus('Rejected')}
//                             disabled={updatingStatus}
//                             className={`px-2 py-1.5 sm:px-3 sm:py-2 text-white bg-red-600 rounded text-xs sm:text-sm flex items-center justify-center gap-1 ${
//                               updatingStatus ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
//                             }`}
//                           >
//                             {updatingStatus ? (
//                               <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
//                             ) : (
//                               <>
//                                 <XCircle size={12} className="sm:w-3.5 sm:h-3.5" />
//                                 <span>Reject</span>
//                               </>
//                             )}
//                           </button>
//                         )}

//                         {(selectedReservation.status === 'Accepted' || selectedReservation.status === 'Rejected') && (
//                           <button
//                             onClick={() => handleUpdateStatus('Pending')}
//                             disabled={updatingStatus}
//                             className={`px-2 py-1.5 sm:px-3 sm:py-2 text-white bg-gray-600 rounded text-xs sm:text-sm flex items-center justify-center ${
//                               updatingStatus ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
//                             }`}
//                           >
//                             {updatingStatus ? (
//                               <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
//                             ) : (
//                               'Reset'
//                             )}
//                           </button>
//                         )}

//                         <button
//                           onClick={handleDeleteReservation}
//                           className="px-2 py-1.5 sm:px-3 sm:py-2 text-white bg-red-500 rounded text-xs sm:text-sm col-span-3 mt-1.5 sm:mt-2 hover:bg-red-600"
//                         >
//                           Delete Reservation
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Close Button */}
//                 <div className="mt-4 sm:mt-6 flex justify-end">
//                   <button
//                     onClick={handleCloseModal}
//                     className="px-4 py-1.5 sm:px-6 sm:py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg text-sm sm:text-base transition-colors"
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </Wrapper>
//   );
// };

// export default CalendarBooking;



// import React, { useState, useCallback, useEffect } from 'react';
// import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
// import moment from 'moment';
// import 'react-big-calendar/lib/css/react-big-calendar.css';
// import Wrapper from '@/AdminWrapper/Wrapper';
// import axios from 'axios';
// import { X, User, Package, Car, CheckCircle, XCircle, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
// import { toast, Toaster } from 'react-hot-toast';

// const localizer = momentLocalizer(moment);

// // Custom Year View Component
// const YearView = ({ date, events, onSelectEvent, onSelectSlot, localizer: viewLocalizer, onDrillDown }) => {
//   const months = [];
//   // Get the year from the date
//   const currentYear = moment(date).year();
  
//   // Generate months for the year in correct order (January to December)
//   const monthNames = [
//     'January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December'
//   ];
  
//   for (let i = 0; i < 12; i++) {
//     const monthDate = moment().year(currentYear).month(i);
//     const monthEvents = events.filter(event => 
//       moment(event.start).year() === currentYear && 
//       moment(event.start).month() === i
//     );
    
//     months.push({
//       name: monthNames[i],
//       date: monthDate,
//       events: monthEvents,
//       eventCount: monthEvents.length
//     });
//   }
  
//   const handleMonthClick = (month) => {
//     // Call the drill down function passed from parent
//     if (onDrillDown) {
//       onDrillDown(month.date.toDate());
//     }
//   };
  
//   const getMonthColor = (eventCount) => {
//     if (eventCount === 0) return 'bg-gray-50 hover:bg-gray-100 border-gray-200';
//     if (eventCount < 3) return 'bg-green-50 hover:bg-green-100 border-green-200';
//     if (eventCount < 6) return 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200';
//     return 'bg-orange-50 hover:bg-orange-100 border-orange-200';
//   };
  
//   return (
//     <div className="year-view p-4" style={{ height: '100%', overflowY: 'auto' }}>
//       <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">{currentYear}</h2>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
//         {months.map((month, index) => (
//           <div
//             key={index}
//             onClick={() => handleMonthClick(month)}
//             className={`${getMonthColor(month.eventCount)} rounded-xl p-5 cursor-pointer transition-all duration-300 border-2 shadow-sm hover:shadow-xl hover:scale-105 transform transition-transform`}
//           >
//             <div className="flex justify-between items-center mb-3">
//               <h3 className="text-xl font-bold text-gray-800">{month.name}</h3>
//               <CalendarIcon size={24} className="text-gray-500" />
//             </div>
//             <div className="text-base text-gray-600 font-semibold">
//               {month.eventCount} {month.eventCount === 1 ? 'Booking' : 'Bookings'}
//             </div>
//             {month.events.length > 0 && (
//               <div className="mt-3 space-y-1">
//                 {month.events.slice(0, 2).map((event, idx) => (
//                   <div key={idx} className="text-xs text-gray-600 truncate">
//                     • {event.title}
//                   </div>
//                 ))}
//                 {month.events.length > 2 && (
//                   <div className="text-blue-600 text-xs font-semibold mt-1">
//                     +{month.events.length - 2} more bookings
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // Add title property to YearView
// YearView.title = (date, { localizer }) => {
//   return localizer.format(date, 'YYYY');
// };

// const CalendarBooking = () => {
//   const [events, setEvents] = useState([]);
//   const [reservations, setReservations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedSlot, setSelectedSlot] = useState(null);
//   const [selectedReservation, setSelectedReservation] = useState(null);
//   const [newEvent, setNewEvent] = useState({
//     title: '',
//     description: '',
//     color: '#3b82f6'
//   });
//   const [view, setView] = useState('month');
//   const [date, setDate] = useState(() => {
//     // Initialize to first day of current month
//     return moment().startOf('month').toDate();
//   });
//   const [updatingStatus, setUpdatingStatus] = useState(false);
  
//   const colors = {
//     Pending: '#f59e0b',
//     Accepted: '#10b981',
//     Rejected: '#ef4444',
//     Default: '#3b82f6'
//   };
  

//   // Prevent background scrolling when modal is open
//   useEffect(() => {
//     if (showModal) {
//       // Store the current scroll position
//       const scrollY = window.scrollY;
//       const body = document.body;
      
//       // Add styles to prevent scrolling
//       body.style.position = 'fixed';
//       body.style.top = `-${scrollY}px`;
//       body.style.width = '100%';
//       body.style.overflowY = 'scroll';
      
//       // Store scroll position for later restoration
//       body.setAttribute('data-scroll-y', scrollY);
      
//       return () => {
//         // Restore scrolling when modal closes
//         const body = document.body;
//         const scrollY = body.getAttribute('data-scroll-y');
        
//         body.style.position = '';
//         body.style.top = '';
//         body.style.width = '';
//         body.style.overflowY = '';
        
//         if (scrollY) {
//           window.scrollTo(0, parseInt(scrollY, 10));
//         }
        
//         body.removeAttribute('data-scroll-y');
//       };
//     }
//   }, [showModal]);

//   useEffect(() => {
//     fetchReservations();
//   }, []);

//   const fetchReservations = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await axios.get(route('ouruserreservations.index'));
      
//       if (response.data.success) {
//         const fetchedReservations = response.data.data;
//         setReservations(fetchedReservations);
        
//         const calendarEvents = fetchedReservations.map(reservation => {
//           const color = colors[reservation.status] || colors.Default;
          
//           const startDate = new Date(reservation.reservation_date);
//           const [startHour, startMinute] = reservation.start_time.split(':');
//           const [endHour, endMinute] = reservation.end_time.split(':');
          
//           const start = new Date(startDate);
//           start.setHours(parseInt(startHour), parseInt(startMinute), 0);
          
//           const end = new Date(startDate);
//           end.setHours(parseInt(endHour), parseInt(endMinute), 0);
          
//           const title = `${reservation.user_name} - ${reservation.package_type}`;
          
//           const description = `
//             User: ${reservation.user_name}
//             Email: ${reservation.email}
//             Phone: ${reservation.phone}
//             Pickup: ${reservation.pickup_location}
//             Dropoff: ${reservation.dropoff_location}
//             Package: ${reservation.package_type}
//             Status: ${reservation.status}
//             Address: ${reservation.address}
//             Test Time: ${reservation.test_time || 'N/A'}
//           `;
          
//           return {
//             id: reservation.id,
//             title: title,
//             start: start,
//             end: end,
//             allDay: false,
//             color: color,
//             description: description,
//             reservationData: reservation
//           };
//         });
        
//         setEvents(calendarEvents);
//       } else {
//         setError('Failed to fetch reservations');
//         toast.error('Failed to fetch reservations');
//       }
//     } catch (err) {
//       console.error('Error fetching reservations:', err);
//       setError('Error loading reservations. Please try again.');
//       toast.error('Error loading reservations. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSelectSlot = useCallback((slotInfo) => {
//     setSelectedSlot(slotInfo);
//     setSelectedReservation(null);
//     setNewEvent({
//       title: '',
//       description: '',
//       color: '#3b82f6'
//     });
//     setShowModal(true);
//   }, []);

//   const handleSelectEvent = useCallback((event) => {
//     setSelectedReservation(event.reservationData);
//     setSelectedSlot(null);
//     setShowModal(true);
//   }, []);

//   const handleUpdateStatus = async (status) => {
//     if (!selectedReservation) return;
    
//     try {
//       setUpdatingStatus(true);
      
//       const response = await axios.put(
//         route('ouruserreservations.update', { id: selectedReservation.id }),
//         { status: status }
//       );
      
//       if (response.data.success) {
//         const updatedReservations = reservations.map(r => 
//           r.id === selectedReservation.id ? { ...r, status: status } : r
//         );
//         setReservations(updatedReservations);
        
//         const updatedEvents = events.map(event => {
//           if (event.id === selectedReservation.id) {
//             return {
//               ...event,
//               color: colors[status] || colors.Default,
//               title: `${selectedReservation.user_name} - ${selectedReservation.package_type}`,
//               reservationData: { ...selectedReservation, status: status }
//             };
//           }
//           return event;
//         });
//         setEvents(updatedEvents);
        
//         setSelectedReservation({ ...selectedReservation, status: status });
        
//         toast.success(`Reservation status updated to ${status}`);
//       } else {
//         toast.error(response.data.message || 'Failed to update status');
//       }
//     } catch (err) {
//       console.error('Error updating status:', err);
//       toast.error(err.response?.data?.message || 'Failed to update reservation status');
//     } finally {
//       setUpdatingStatus(false);
//     }
//   };

//   const handleDeleteReservation = async () => {
//     if (!selectedReservation) return;
    
//     // Show confirmation toast with action buttons
//     toast.custom((t) => (
//       <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex flex-col`}>
//         <div className="p-4">
//           <div className="flex items-start">
//             <div className="flex-shrink-0">
//               <AlertCircle className="h-6 w-6 text-red-600" />
//             </div>
//             <div className="ml-3 w-0 flex-1">
//               <p className="text-sm font-medium text-gray-900">
//                 Delete Reservation
//               </p>
//               <p className="mt-1 text-sm text-gray-500">
//                 Are you sure you want to delete reservation #{selectedReservation.id}? This action cannot be undone.
//               </p>
//             </div>
//             <button
//               onClick={() => toast.dismiss(t.id)}
//               className="ml-4 flex-shrink-0 flex"
//             >
//               <X className="h-5 w-5 text-gray-400" />
//             </button>
//           </div>
//           <div className="mt-4 flex justify-end space-x-3">
//             <button
//               onClick={async () => {
//                 toast.dismiss(t.id);
//                 try {
//                   await axios.delete(
//                     route('ouruserreservations.destroy', { id: selectedReservation.id })
//                   );
                  
//                   const updatedReservations = reservations.filter(r => r.id !== selectedReservation.id);
//                   setReservations(updatedReservations);
                  
//                   const updatedEvents = events.filter(event => event.id !== selectedReservation.id);
//                   setEvents(updatedEvents);
                  
//                   handleCloseModal();
//                   toast.success('Reservation deleted successfully');
//                 } catch (err) {
//                   console.error('Error deleting reservation:', err);
//                   toast.error('Failed to delete reservation');
//                 }
//               }}
//               className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
//             >
//               Delete
//             </button>
//             <button
//               onClick={() => toast.dismiss(t.id)}
//               className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     ), {
//       duration: Infinity,
//     });
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setSelectedReservation(null);
//     setSelectedSlot(null);
//     setNewEvent({ title: '', description: '', color: '#3b82f6' });
//     setUpdatingStatus(false);
//   };

//   // Fixed navigation handler to ensure proper month navigation without skipping
//   const handleNavigate = useCallback((newDate, viewType) => {
//     if (viewType === 'month') {
//       // For month view, always set to the first day of the month
//       const targetDate = moment(newDate);
//       const firstDayOfMonth = targetDate.clone().startOf('month').toDate();
//       setDate(firstDayOfMonth);
//     } else {
//       setDate(newDate);
//     }
//   }, []);

//   const handleView = useCallback((newView) => {
//     setView(newView);
//   }, []);

//   // Handle drill down from year view to month view
//   const handleDrillDown = (targetDate) => {
//     // Set to the first day of the target month
//     const firstDayOfMonth = moment(targetDate).startOf('month').toDate();
//     setDate(firstDayOfMonth);
//     setView('month');
//   };

//   const eventStyleGetter = (event) => {
//     const style = {
//       backgroundColor: event.color,
//       borderRadius: '6px',
//       opacity: 0.9,
//       color: 'white',
//       border: '0',
//       display: 'block',
//       padding: '2px 5px',
//       fontSize: '0.85em',
//       fontWeight: '500',
//       overflow: 'hidden',
//       textOverflow: 'ellipsis',
//       whiteSpace: 'nowrap'
//     };
//     return { style };
//   };

//   const goToToday = () => {
//     const now = moment();
//     if (view === 'month') {
//       setDate(now.clone().startOf('month').toDate());
//     } else {
//       setDate(now.toDate());
//     }
//     toast.success('Navigated to today');
//   };

//   const refreshReservations = () => {
//     toast.promise(
//       fetchReservations(),
//       {
//         loading: 'Refreshing reservations...',
//         success: 'Reservations refreshed successfully',
//         error: 'Failed to refresh reservations',
//       }
//     );
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'Accepted': return <CheckCircle className="text-green-600" size={16} />;
//       case 'Rejected': return <XCircle className="text-red-600" size={16} />;
//       case 'Pending': return <AlertCircle className="text-yellow-600" size={16} />;
//       default: return <AlertCircle className="text-gray-600" size={16} />;
//     }
//   };

//   const getStatusBadgeClass = (status) => {
//     switch (status) {
//       case 'Pending': return 'bg-yellow-100 text-yellow-800';
//       case 'Accepted': return 'bg-green-100 text-green-800';
//       case 'Rejected': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   // Create a wrapped component that passes the drill down handler
//   const YearViewWithDrillDown = (props) => {
//     return <YearView {...props} onDrillDown={handleDrillDown} />;
//   };
  
//   // Copy the static title property to the wrapped component
//   YearViewWithDrillDown.title = YearView.title;

//   // Define the views object with year view
//   const views = {
//     month: true,
//     week: true,
//     day: true,
//     agenda: true,
//     year: YearViewWithDrillDown
//   };

//   return (
//     <Wrapper>
//       <div className="">
//         {/* Add Toaster component at the top level */}
//         <Toaster
//           position="center"
//           toastOptions={{
//             duration: 4000,
//             style: {
//               background: '#fff',
//               color: '#374151',
//               borderRadius: '10px',
//               border: '1px solid #e5e7eb',
//             },
//             success: {
//               duration: 3000,
//               iconTheme: {
//                 primary: '#10b981',
//                 secondary: '#fff',
//               },
//             },
//             error: {
//               duration: 4000,
//               iconTheme: {
//                 primary: '#ef4444',
//                 secondary: '#fff',
//               },
//             },
//             loading: {
//               duration: Infinity,
//             },
//           }}
//         />
        
//         <div className="sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
//           {/* Calendar */}
//           {loading && events.length === 0 ? (
//             <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 text-center" style={{ height: '70vh', minHeight: '550px' }}>
//               <div className="flex flex-col items-center justify-center h-full">
//                 <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mb-3 sm:mb-4"></div>
//                 <p className="text-gray-600 text-sm sm:text-base">Loading reservations...</p>
//               </div>
//             </div>
//           ) : (
//             <div className="bg-white rounded-xl shadow-lg p-2 sm:p-4 md:p-6" style={{ height: '70vh', minHeight: '550px' }}>
//               <Calendar
//                 localizer={localizer}
//                 events={events}
//                 startAccessor="start"
//                 endAccessor="end"
//                 selectable
//                 onSelectSlot={handleSelectSlot}
//                 onSelectEvent={handleSelectEvent}
//                 onNavigate={handleNavigate}
//                 onView={handleView}
//                 view={view}
//                 date={date}
//                 eventPropGetter={eventStyleGetter}
//                 views={views}
//                 defaultView="month"
//                 style={{ height: '100%' }}
//                 popup
//                 showMultiDayTimes
//                 step={30}
//                 timeslots={2}
//                 className="rbc-calendar-sm"
//                 messages={{
//                   today: 'Today',
//                   previous: 'Prev',
//                   next: 'Next',
//                   month: 'Month',
//                   week: 'Week',
//                   day: 'Day',
//                   agenda: 'Agenda',
//                   year: 'Year',
//                   date: 'Date',
//                   time: 'Time',
//                   event: 'Event',
//                   noEventsInRange: 'No reservations in this range'
//                 }}
//               />
//             </div>
//           )}

//           {/* Stats Section */}
//           <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mt-4 sm:mt-6">
//             <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Reservation Overview</h2>
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
//               <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
//                 <p className="text-xs sm:text-sm text-gray-600">Total Reservations</p>
//                 <p className="text-lg sm:text-2xl font-bold text-blue-600">{reservations.length}</p>
//               </div>
//               <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
//                 <p className="text-xs sm:text-sm text-gray-600">Pending</p>
//                 <p className="text-lg sm:text-2xl font-bold text-yellow-600">
//                   {reservations.filter(r => r.status === 'Pending').length}
//                 </p>
//               </div>
//               <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
//                 <p className="text-xs sm:text-sm text-gray-600">Accepted</p>
//                 <p className="text-lg sm:text-2xl font-bold text-green-600">
//                   {reservations.filter(r => r.status === 'Accepted').length}
//                 </p>
//               </div>
//               <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
//                 <p className="text-xs sm:text-sm text-gray-600">Rejected</p>
//                 <p className="text-lg sm:text-2xl font-bold text-red-600">
//                   {reservations.filter(r => r.status === 'Rejected').length}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Reservation Details Modal */}
//           {showModal && selectedReservation && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
//               <div 
//                 className="bg-white rounded-xl shadow-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 {/* Modal Header */}
//                 <div className="flex justify-between items-start mb-4 sm:mb-6">
//                   <div>
//                     <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
//                       {selectedReservation.package_type}
//                     </h2>
//                     <div className="flex items-center gap-1 sm:gap-2 mt-1">
//                       {getStatusIcon(selectedReservation.status)}
//                       <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm font-semibold ${getStatusBadgeClass(selectedReservation.status)}`}>
//                         {selectedReservation.status}
//                       </span>
//                       <span className="text-gray-500 text-xs sm:text-sm">
//                         • Booked {moment(selectedReservation.created_at).fromNow()}
//                       </span>
//                     </div>
//                   </div>
//                   <button
//                     onClick={handleCloseModal}
//                     className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                   >
//                     <X size={18} className="sm:w-5 sm:h-5" />
//                   </button>
//                 </div>

//                 {/* Main Content Grid */}
//                 <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
//                   {/* Left Column - User Info */}
//                   <div className="space-y-4">
//                     {/* User Information */}
//                     <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
//                       <h3 className="font-bold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
//                         <User size={14} className="sm:w-4 sm:h-4" />
//                         <span className="text-sm sm:text-base">User Information</span>
//                       </h3>
//                       <div className="space-y-1.5 sm:space-y-2">
//                         <div className="flex justify-between">
//                           <span className="text-xs sm:text-sm text-gray-600">Name:</span>
//                           <span className="text-xs sm:text-sm font-medium">{selectedReservation.user_name}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-xs sm:text-sm text-gray-600">Email:</span>
//                           <span className="text-xs sm:text-sm font-medium">{selectedReservation.email}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-xs sm:text-sm text-gray-600">Phone:</span>
//                           <span className="text-xs sm:text-sm font-medium">{selectedReservation.phone}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-xs sm:text-sm text-gray-600">Address:</span>
//                           <span className="text-xs sm:text-sm font-medium">{selectedReservation.address}</span>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Package Information */}
//                     <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
//                       <h3 className="font-bold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
//                         <Package size={14} className="sm:w-4 sm:h-4" />
//                         <span className="text-sm sm:text-base">Package Details</span>
//                       </h3>
//                       <div className="space-y-1.5 sm:space-y-2">
//                         <div className="flex justify-between">
//                           <span className="text-xs sm:text-sm text-gray-600">Package Type:</span>
//                           <span className="text-xs sm:text-sm font-medium">{selectedReservation.package_type}</span>
//                         </div>
//                         {selectedReservation.test_time && (
//                           <div className="flex justify-between">
//                             <span className="text-xs sm:text-sm text-gray-600">Test Time:</span>
//                             <span className="text-xs sm:text-sm font-medium">{selectedReservation.test_time}</span>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Right Column - Trip Info */}
//                   <div className="space-y-4">
//                     {/* Trip Information */}
//                     <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
//                       <h3 className="font-bold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
//                         <Car size={14} className="sm:w-4 sm:h-4" />
//                         <span className="text-sm sm:text-base">Trip Information</span>
//                       </h3>
//                       <div className="space-y-1.5 sm:space-y-2">
//                         <div className="flex justify-between">
//                           <span className="text-xs sm:text-sm text-gray-600">Pickup:</span>
//                           <span className="text-xs sm:text-sm font-medium">{selectedReservation.pickup_location}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-xs sm:text-sm text-gray-600">Dropoff:</span>
//                           <span className="text-xs sm:text-sm font-medium">{selectedReservation.dropoff_location}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-xs sm:text-sm text-gray-600">Date:</span>
//                           <span className="text-xs sm:text-sm font-medium">
//                             {moment(selectedReservation.reservation_date).format('ddd, MMM D, YYYY')}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-xs sm:text-sm text-gray-600">Time:</span>
//                           <span className="text-xs sm:text-sm font-medium">
//                             {selectedReservation.start_time} - {selectedReservation.end_time}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-xs sm:text-sm text-gray-600">Duration:</span>
//                           <span className="text-xs sm:text-sm font-medium">
//                             {moment.duration(moment(selectedReservation.end_time, 'HH:mm:ss')
//                               .diff(moment(selectedReservation.start_time, 'HH:mm:ss')))
//                               .asHours().toFixed(1)} hours
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Status Actions */}
//                     <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
//                       <h3 className="font-bold text-gray-700 mb-2 sm:mb-3">Manage Reservation</h3>
//                       <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
//                         {selectedReservation.status !== 'Accepted' && (
//                           <button
//                             onClick={() => handleUpdateStatus('Accepted')}
//                             disabled={updatingStatus}
//                             className={`px-2 py-1.5 sm:px-3 sm:py-2 text-white bg-green-600 rounded text-xs sm:text-sm flex items-center justify-center gap-1 ${
//                               updatingStatus ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
//                             }`}
//                           >
//                             {updatingStatus ? (
//                               <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
//                             ) : (
//                               <>
//                                 <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5" />
//                                 <span>Accept</span>
//                               </>
//                             )}
//                           </button>
//                         )}

//                         {selectedReservation.status !== 'Rejected' && (
//                           <button
//                             onClick={() => handleUpdateStatus('Rejected')}
//                             disabled={updatingStatus}
//                             className={`px-2 py-1.5 sm:px-3 sm:py-2 text-white bg-red-600 rounded text-xs sm:text-sm flex items-center justify-center gap-1 ${
//                               updatingStatus ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
//                             }`}
//                           >
//                             {updatingStatus ? (
//                               <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
//                             ) : (
//                               <>
//                                 <XCircle size={12} className="sm:w-3.5 sm:h-3.5" />
//                                 <span>Reject</span>
//                               </>
//                             )}
//                           </button>
//                         )}

//                         {(selectedReservation.status === 'Accepted' || selectedReservation.status === 'Rejected') && (
//                           <button
//                             onClick={() => handleUpdateStatus('Pending')}
//                             disabled={updatingStatus}
//                             className={`px-2 py-1.5 sm:px-3 sm:py-2 text-white bg-gray-600 rounded text-xs sm:text-sm flex items-center justify-center ${
//                               updatingStatus ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
//                             }`}
//                           >
//                             {updatingStatus ? (
//                               <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
//                             ) : (
//                               'Reset'
//                             )}
//                           </button>
//                         )}

//                         <button
//                           onClick={handleDeleteReservation}
//                           className="px-2 py-1.5 sm:px-3 sm:py-2 text-white bg-red-500 rounded text-xs sm:text-sm col-span-3 mt-1.5 sm:mt-2 hover:bg-red-600"
//                         >
//                           Delete Reservation
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Close Button */}
//                 <div className="mt-4 sm:mt-6 flex justify-end">
//                   <button
//                     onClick={handleCloseModal}
//                     className="px-4 py-1.5 sm:px-6 sm:py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg text-sm sm:text-base transition-colors"
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </Wrapper>
//   );
// };

// export default CalendarBooking;


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
const YearView = ({ date, events, onSelectEvent, onSelectSlot, localizer: viewLocalizer, onDrillDown }) => {
  const months = [];
  // Get the year from the date
  const currentYear = moment(date).year();
  
  // Generate months for the year in correct order (January to December)
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  for (let i = 0; i < 12; i++) {
    const monthDate = moment().year(currentYear).month(i);
    const monthEvents = events.filter(event => 
      moment(event.start).year() === currentYear && 
      moment(event.start).month() === i
    );
    
    months.push({
      name: monthNames[i],
      date: monthDate,
      events: monthEvents,
      eventCount: monthEvents.length
    });
  }
  
  const handleMonthClick = (month) => {
    // Call the drill down function passed from parent
    if (onDrillDown) {
      onDrillDown(month.date.toDate());
    }
  };
  
  const getMonthColor = (eventCount) => {
    if (eventCount === 0) return 'bg-gray-50 hover:bg-gray-100 border-gray-200';
    if (eventCount < 3) return 'bg-green-50 hover:bg-green-100 border-green-200';
    if (eventCount < 6) return 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200';
    return 'bg-orange-50 hover:bg-orange-100 border-orange-200';
  };
  
  return (
    <div className="year-view p-4" style={{ height: '100%', overflowY: 'auto' }}>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">{currentYear}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {months.map((month, index) => (
          <div
            key={index}
            onClick={() => handleMonthClick(month)}
            className={`${getMonthColor(month.eventCount)} rounded-xl p-5 cursor-pointer transition-all duration-300 border-2 shadow-sm hover:shadow-xl hover:scale-105 transform transition-transform`}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-gray-800">{month.name}</h3>
              <CalendarIcon size={24} className="text-gray-500" />
            </div>
            <div className="text-base text-gray-600 font-semibold">
              {month.eventCount} {month.eventCount === 1 ? 'Booking' : 'Bookings'}
            </div>
            {month.events.length > 0 && (
              <div className="mt-3 space-y-1">
                {month.events.slice(0, 2).map((event, idx) => (
                  <div key={idx} className="text-xs text-gray-600 truncate">
                    • {event.title}
                  </div>
                ))}
                {month.events.length > 2 && (
                  <div className="text-blue-600 text-xs font-semibold mt-1">
                    +{month.events.length - 2} more bookings
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

// Add title property to YearView
YearView.title = (date, { localizer }) => {
  return localizer.format(date, 'YYYY');
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
    // Initialize to first day of current month
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
      // Store the current scroll position
      const scrollY = window.scrollY;
      const body = document.body;
      
      // Add styles to prevent scrolling
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';
      body.style.overflowY = 'scroll';
      
      // Store scroll position for later restoration
      body.setAttribute('data-scroll-y', scrollY);
      
      return () => {
        // Restore scrolling when modal closes
        const body = document.body;
        const scrollY = body.getAttribute('data-scroll-y');
        
        body.style.position = '';
        body.style.top = '';
        body.style.width = '';
        body.style.overflowY = '';
        
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY, 10));
        }
        
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
            title: title,
            start: start,
            end: end,
            allDay: false,
            color: color,
            description: description,
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
    setNewEvent({
      title: '',
      description: '',
      color: '#3b82f6'
    });
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
        { status: status }
      );
      
      if (response.data.success) {
        const updatedReservations = reservations.map(r => 
          r.id === selectedReservation.id ? { ...r, status: status } : r
        );
        setReservations(updatedReservations);
        
        const updatedEvents = events.map(event => {
          if (event.id === selectedReservation.id) {
            return {
              ...event,
              color: colors[status] || colors.Default,
              title: `${selectedReservation.user_name} - ${selectedReservation.package_type}`,
              reservationData: { ...selectedReservation, status: status }
            };
          }
          return event;
        });
        setEvents(updatedEvents);
        
        setSelectedReservation({ ...selectedReservation, status: status });
        
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
    
    // Show confirmation toast with action buttons
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex flex-col`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">
                Delete Reservation
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Are you sure you want to delete reservation #{selectedReservation.id}? This action cannot be undone.
              </p>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="ml-4 flex-shrink-0 flex"
            >
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
                  
                  const updatedReservations = reservations.filter(r => r.id !== selectedReservation.id);
                  setReservations(updatedReservations);
                  
                  const updatedEvents = events.filter(event => event.id !== selectedReservation.id);
                  setEvents(updatedEvents);
                  
                  handleCloseModal();
                  toast.success('Reservation deleted successfully');
                } catch (err) {
                  console.error('Error deleting reservation:', err);
                  toast.error('Failed to delete reservation');
                }
              }}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    ), {
      duration: Infinity,
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReservation(null);
    setSelectedSlot(null);
    setNewEvent({ title: '', description: '', color: '#3b82f6' });
    setUpdatingStatus(false);
  };

  // Fixed navigation handler to work with all views including year
  const handleNavigate = useCallback((newDate, viewType) => {
    console.log('Navigate called:', { newDate: moment(newDate).format('YYYY-MM-DD'), viewType });
    
    if (viewType === 'year') {
      // Get the current year from the date
      const currentYear = moment(date).year();
      const targetYear = moment(newDate).year();
      
      // Calculate the difference in years
      const yearDiff = targetYear - currentYear;
      
      // Create new date by adding/subtracting years
      const newYearDate = moment(date).add(yearDiff, 'years').startOf('year').toDate();
      
      console.log('Year navigation:', { currentYear, targetYear, yearDiff, newYearDate: moment(newYearDate).format('YYYY-MM-DD') });
      
      setDate(newYearDate);
    } else if (viewType === 'month') {
      // For month view, set to the first day of the month
      const targetDate = moment(newDate);
      const firstDayOfMonth = targetDate.clone().startOf('month').toDate();
      setDate(firstDayOfMonth);
    } else {
      // For week, day, agenda views
      setDate(newDate);
    }
  }, [date]);

  const handleView = useCallback((newView) => {
    console.log('View changed to:', newView);
    setView(newView);
  }, []);

  // Handle drill down from year view to month view
  const handleDrillDown = (targetDate) => {
    // Set to the first day of the target month
    const firstDayOfMonth = moment(targetDate).startOf('month').toDate();
    setDate(firstDayOfMonth);
    setView('month');
  };

  const goToToday = () => {
    const now = moment();
    if (view === 'year') {
      setDate(now.clone().startOf('year').toDate());
      toast.success(`Navigated to ${now.year()}`);
    } else if (view === 'month') {
      setDate(now.clone().startOf('month').toDate());
      toast.success('Navigated to current month');
    } else {
      setDate(now.toDate());
      toast.success('Navigated to today');
    }
  };

  const eventStyleGetter = (event) => {
    const style = {
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
    };
    return { style };
  };

  const refreshReservations = () => {
    toast.promise(
      fetchReservations(),
      {
        loading: 'Refreshing reservations...',
        success: 'Reservations refreshed successfully',
        error: 'Failed to refresh reservations',
      }
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Accepted': return <CheckCircle className="text-green-600" size={16} />;
      case 'Rejected': return <XCircle className="text-red-600" size={16} />;
      case 'Pending': return <AlertCircle className="text-yellow-600" size={16} />;
      default: return <AlertCircle className="text-gray-600" size={16} />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Accepted': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Create a wrapped component that passes the drill down handler
  const YearViewWithDrillDown = (props) => {
    return <YearView {...props} onDrillDown={handleDrillDown} />;
  };
  
  // Copy the static title property to the wrapped component
  YearViewWithDrillDown.title = YearView.title;

  // Define the views object with year view
  const views = {
    month: true,
    week: true,
    day: true,
    agenda: true,
    year: YearViewWithDrillDown
  };

  return (
    <Wrapper>
      <div className="">
        {/* Add Toaster component at the top level */}
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
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
            loading: {
              duration: Infinity,
            },
          }}
        />
        
        <div className="sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
          {/* Calendar */}
          {loading && events.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 text-center" style={{ height: '70vh', minHeight: '550px' }}>
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mb-3 sm:mb-4"></div>
                <p className="text-gray-600 text-sm sm:text-base">Loading reservations...</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-2 sm:p-4 md:p-6" style={{ height: '70vh', minHeight: '550px' }}>
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
                  {/* Left Column - User Info */}
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

                  {/* Right Column - Trip Info */}
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
                            {moment.duration(moment(selectedReservation.end_time, 'HH:mm:ss')
                              .diff(moment(selectedReservation.start_time, 'HH:mm:ss')))
                              .asHours().toFixed(1)} hours
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

                        {(selectedReservation.status === 'Accepted' || selectedReservation.status === 'Rejected') && (
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