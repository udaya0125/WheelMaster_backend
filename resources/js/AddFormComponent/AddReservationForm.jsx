// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { X, Calendar, Clock, Mail, Phone, Home, MapPin } from "lucide-react";

// const AddReservationForm = ({ isOpen, onClose, reservationToEdit, onSuccess }) => {
//     const [formData, setFormData] = useState({
//         user_name: "",
//         email: "",
//         phone: "",
//         address: "",
//         pickup_location: "",
//         dropoff_location: "",
//         package_type: "", // This should be a STRING (category)
//         reservation_date: "",
//         start_time: "",
//         end_time: "",
//         price_id: "", // This should be a NUMBER (package ID)
//         test_time: "",
//         test_location: "Mandurah licensing center", // Pre-filled with default value
//     });

//     const [prices, setPrices] = useState([]);
//     const [categories, setCategories] = useState([]);
//     const [filteredPackages, setFilteredPackages] = useState([]);
//     const [selectedPackage, setSelectedPackage] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [fetchingPrices, setFetchingPrices] = useState(false);
//     const [error, setError] = useState(null);
//     const [successMessage, setSuccessMessage] = useState(null);

//     // Define test package categories (updated to use "packages" terminology)
//     const testPackageCategories = [
//         "Driving Test Packages",
//         "Test Packages",
//         "Driving Test",
//         "PDA Test Packages",
//         "Road Test Packages",
//         // Add any other test-related category names from your system
//     ];

//     // Check if selected category is a test package
//     const isTestPackage = () => {
//         return testPackageCategories.some(
//             category => category.toLowerCase() === formData.package_type?.toLowerCase()
//         );
//     };

//     // ======================================
//     // FETCH PRICES FOR DROPDOWN
//     // ======================================
//     useEffect(() => {
//         const fetchPrices = async () => {
//             try {
//                 setFetchingPrices(true);
//                 const response = await axios.get(route("ourprice.index"));
//                 const pricesData = response.data.data;
//                 setPrices(pricesData);

//                 // Extract unique categories from prices
//                 const uniqueCategories = [...new Set(pricesData
//                     .map(price => price.category)
//                     .filter(category => category) // Remove null/undefined
//                 )];
//                 setCategories(uniqueCategories);

//             } catch (err) {
//                 console.error("Error fetching prices:", err);
//                 setError("Failed to load price packages");
//             } finally {
//                 setFetchingPrices(false);
//             }
//         };

//         if (isOpen) {
//             fetchPrices();
//         }
//     }, [isOpen]);

//     // ======================================
//     // FILTER PACKAGES BASED ON SELECTED CATEGORY (package_type)
//     // ======================================
//     useEffect(() => {
//         if (formData.package_type && prices.length > 0) {
//             const filtered = prices.filter(price =>
//                 price.category && price.category === formData.package_type
//             );
//             setFilteredPackages(filtered);

//             // Reset selected package when category changes
//             setFormData(prev => ({ ...prev, price_id: "" }));
//             setSelectedPackage(null);

//             // Clear test fields if category is not a test package
//             if (!testPackageCategories.some(
//                 category => category.toLowerCase() === formData.package_type?.toLowerCase()
//             )) {
//                 setFormData(prev => ({
//                     ...prev,
//                     test_time: "",
//                     test_location: "Mandurah licensing center" // Reset to default
//                 }));
//             }
//         } else {
//             setFilteredPackages([]);
//         }
//     }, [formData.package_type, prices]);

//     // ======================================
//     // UPDATE SELECTED PACKAGE DETAILS WHEN price_id CHANGES
//     // ======================================
//     useEffect(() => {
//         if (formData.price_id && prices.length > 0) {
//             // Convert to number for comparison since price_id comes as string from form
//             const package_ = prices.find(p => p.id === parseInt(formData.price_id));
//             setSelectedPackage(package_ || null);

//             // Debug log to see package details
//             if (package_) {
//                 console.log("Selected package details:", package_);
//             }
//         } else {
//             setSelectedPackage(null);
//         }
//     }, [formData.price_id, prices]);

//     // ======================================
//     // POPULATE FORM WHEN EDITING
//     // ======================================
//     useEffect(() => {
//         if (reservationToEdit) {
//             console.log("Editing reservation:", reservationToEdit); // Debug log

//             setFormData({
//                 user_name: reservationToEdit.user_name || "",
//                 email: reservationToEdit.email || "",
//                 phone: reservationToEdit.phone || "",
//                 address: reservationToEdit.address || "",
//                 pickup_location: reservationToEdit.pickup_location || "",
//                 dropoff_location: reservationToEdit.dropoff_location || "",
//                 package_type: reservationToEdit.package_type || "", // String (category)
//                 reservation_date: reservationToEdit.reservation_date
//                     ? new Date(reservationToEdit.reservation_date).toISOString().split('T')[0]
//                     : "",
//                 start_time: reservationToEdit.start_time || "",
//                 end_time: reservationToEdit.end_time || "",
//                 price_id: reservationToEdit.price_id ? reservationToEdit.price_id.toString() : "", // Package ID as string for select element
//                 test_time: reservationToEdit.test_time || "",
//                 test_location: reservationToEdit.test_location || "Mandurah licensing center", // Use existing value or default
//             });
//         } else {
//             // Reset form when adding new - keep test_location default value
//             setFormData({
//                 user_name: "",
//                 email: "",
//                 phone: "",
//                 address: "",
//                 pickup_location: "",
//                 dropoff_location: "",
//                 package_type: "", // Will store category (string)
//                 reservation_date: "",
//                 start_time: "",
//                 end_time: "",
//                 price_id: "", // Will store package ID (number)
//                 test_time: "",
//                 test_location: "Mandurah licensing center", // Pre-filled default
//             });
//         }
//         // Clear messages
//         setError(null);
//         setSuccessMessage(null);
//     }, [reservationToEdit, isOpen]);

//     // ======================================
//     // HANDLE INPUT CHANGES
//     // ======================================
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));

//         // Debug logs
//         if (name === 'package_type') {
//             console.log('Category (package_type) changed to:', value);
//         }
//         if (name === 'price_id') {
//             console.log('Package ID (price_id) changed to:', value);
//         }
//     };

//     // ======================================
//     // VALIDATE FORM
//     // ======================================
//     const validateForm = () => {
//         const required = [
//             'user_name', 'email', 'phone', 'address',
//             'pickup_location', 'dropoff_location',
//             'reservation_date', 'start_time', 'end_time',
//             'package_type', 'price_id'
//         ];

//         for (let field of required) {
//             if (!formData[field] || formData[field].trim() === '') {
//                 let fieldName = field;
//                 if (field === 'package_type') fieldName = 'category';
//                 if (field === 'price_id') fieldName = 'package';
//                 setError(`${fieldName.replace('_', ' ')} is required`);
//                 return false;
//             }
//         }

//         // Email validation
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(formData.email)) {
//             setError('Please enter a valid email address');
//             return false;
//         }

//         // Phone validation (basic)
//         if (formData.phone.length < 10) {
//             setError('Please enter a valid phone number');
//             return false;
//         }

//         // Time validation (end time should be after start time)
//         if (formData.start_time >= formData.end_time) {
//             setError('End time must be after start time');
//             return false;
//         }

//         // Date validation (can't be in the past)
//         const today = new Date().toISOString().split('T')[0];
//         if (formData.reservation_date < today) {
//             setError('Reservation date cannot be in the past');
//             return false;
//         }

//         // Validate test fields if it's a test package
//         if (isTestPackage()) {
//             if (!formData.test_time) {
//                 setError('Test time is required for test packages');
//                 return false;
//             }
//             if (!formData.test_location || formData.test_location.trim() === '') {
//                 setError('Test location is required for test packages');
//                 return false;
//             }
//         }

//         return true;
//     };

//     // ======================================
//     // HANDLE FORM SUBMIT
//     // ======================================
//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!validateForm()) {
//             return;
//         }

//         setLoading(true);
//         setError(null);
//         setSuccessMessage(null);

//         // Prepare data for submission - matching backend expectations
//         const submitData = {
//             ...formData,
//             // price_id should be sent as a number (package ID)
//             price_id: parseInt(formData.price_id),
//             // package_type should be sent as a string (category)
//             package_type: formData.package_type // Already a string
//         };

//         // If it's not a test package, clear test fields
//         if (!isTestPackage()) {
//             submitData.test_time = "";
//             submitData.test_location = "";
//         }

//         console.log("Submitting data:", submitData); // Debug log

//         try {
//             let response;

//             if (reservationToEdit) {
//                 // Update existing reservation
//                 response = await axios.put(
//                     route("ouruserreservations.update", { id: reservationToEdit.id }),
//                     submitData
//                 );
//             } else {
//                 // Create new reservation
//                 response = await axios.post(
//                     route("ouruserreservations.store"),
//                     submitData
//                 );
//             }

//             if (response.data.success) {
//                 setSuccessMessage(
//                     reservationToEdit
//                         ? "Reservation updated successfully!"
//                         : "Reservation created successfully!"
//                 );

//                 // Call success callback
//                 if (onSuccess) {
//                     onSuccess(response.data.data);
//                 }

//                 // Close form after a delay
//                 setTimeout(() => {
//                     onClose();
//                 }, 1500);
//             }
//         } catch (err) {
//             console.error("Error saving reservation:", err);

//             if (err.response && err.response.data) {
//                 // Display validation errors
//                 const errors = err.response.data.errors;
//                 if (errors) {
//                     const errorMessages = Object.values(errors).flat().join(', ');
//                     setError(errorMessages);
//                 } else {
//                     setError(err.response.data.message || "Failed to save reservation");
//                 }
//             } else {
//                 setError("Failed to save reservation. Please try again.");
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
//             <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 h-[600px] overflow-y-auto">
//                 {/* Header */}
//                 <div className="flex items-center justify-between p-6 border-b">
//                     <h2 className="text-xl font-semibold text-gray-800">
//                         {reservationToEdit ? "Edit Reservation" : "Add New Reservation"}
//                     </h2>
//                     <button
//                         onClick={onClose}
//                         className="text-gray-400 hover:text-gray-600 transition-colors"
//                     >
//                         <X size={24} />
//                     </button>
//                 </div>

//                 {/* Messages */}
//                 {error && (
//                     <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
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

//                 {successMessage && (
//                     <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
//                         {successMessage}
//                     </div>
//                 )}

//                 {/* Form */}
//                 <form onSubmit={handleSubmit} className="p-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         {/* Personal Information */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Full Name *
//                             </label>
//                             <input
//                                 type="text"
//                                 name="user_name"
//                                 value={formData.user_name}
//                                 onChange={handleChange}
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 placeholder="Enter full name"
//                                 required
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Email *
//                             </label>
//                             <div className="relative">
//                                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                                 <input
//                                     type="email"
//                                     name="email"
//                                     value={formData.email}
//                                     onChange={handleChange}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="email@example.com"
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Phone *
//                             </label>
//                             <div className="relative">
//                                 <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                                 <input
//                                     type="tel"
//                                     name="phone"
//                                     value={formData.phone}
//                                     onChange={handleChange}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="Enter phone number"
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Address *
//                             </label>
//                             <div className="relative">
//                                 <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                                 <input
//                                     type="text"
//                                     name="address"
//                                     value={formData.address}
//                                     onChange={handleChange}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="Enter address"
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         {/* Location Information */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Pickup Location *
//                             </label>
//                             <input
//                                 type="text"
//                                 name="pickup_location"
//                                 value={formData.pickup_location}
//                                 onChange={handleChange}
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 placeholder="Enter pickup location"
//                                 required
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Dropoff Location *
//                             </label>
//                             <input
//                                 type="text"
//                                 name="dropoff_location"
//                                 value={formData.dropoff_location}
//                                 onChange={handleChange}
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 placeholder="Enter dropoff location"
//                                 required
//                             />
//                         </div>

//                         {/* Package Category Selection - stored in package_type (string) */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Package Category *
//                             </label>
//                             <select
//                                 name="package_type" // This stores the category (string)
//                                 value={formData.package_type}
//                                 onChange={handleChange}
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 required
//                             >
//                                 <option value="">Select a package category</option>
//                                 {categories.map(category => (
//                                     <option key={category} value={category}>
//                                         {category}
//                                     </option>
//                                 ))}
//                             </select>
//                             {fetchingPrices && categories.length === 0 && (
//                                 <p className="text-sm text-gray-500 mt-1">Loading categories...</p>
//                             )}
//                         </div>

//                         {/* Specific Package Selection - stored in price_id (number) */}
//                         {formData.package_type && (
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Select Package *
//                                 </label>
//                                 <select
//                                     name="price_id" // This stores the package ID (number)
//                                     value={formData.price_id}
//                                     onChange={handleChange}
//                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     required
//                                     disabled={fetchingPrices || filteredPackages.length === 0}
//                                 >
//                                     <option value="">Choose a package</option>
//                                     {filteredPackages.map(pkg => (
//                                         <option key={pkg.id} value={pkg.id}>
//                                             {pkg.description}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 {fetchingPrices && (
//                                     <p className="text-sm text-gray-500 mt-1">Loading packages...</p>
//                                 )}
//                                 {filteredPackages.length === 0 && !fetchingPrices && (
//                                     <p className="text-sm text-red-500 mt-1">No packages available in this category</p>
//                                 )}
//                             </div>
//                         )}

//                         {/* Date and Time Information */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Reservation Date *
//                             </label>
//                             <div className="relative">
//                                 <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                                 <input
//                                     type="date"
//                                     name="reservation_date"
//                                     value={formData.reservation_date}
//                                     onChange={handleChange}
//                                     min={new Date().toISOString().split('T')[0]}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         {/* Test fields - Only show for test packages */}
//                         {isTestPackage() && (
//                             <>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Test Location *
//                                     </label>
//                                     <div className="relative">
//                                         <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                                         <input
//                                             type="text"
//                                             name="test_location"
//                                             value={formData.test_location}
//                                             onChange={handleChange}
//                                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                             placeholder="Enter test location"
//                                             required={isTestPackage()}
//                                         />
//                                     </div>
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Test Time *
//                                     </label>
//                                     <div className="relative">
//                                         <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                                         <input
//                                             type="time"
//                                             name="test_time"
//                                             value={formData.test_time}
//                                             onChange={handleChange}
//                                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                             required={isTestPackage()}
//                                         />
//                                     </div>
//                                 </div>
//                             </>
//                         )}

//                         {/* Regular start and end times (always shown) */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Start Time *
//                             </label>
//                             <div className="relative">
//                                 <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                                 <input
//                                     type="time"
//                                     name="start_time"
//                                     value={formData.start_time}
//                                     onChange={handleChange}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 End Time *
//                             </label>
//                             <div className="relative">
//                                 <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                                 <input
//                                     type="time"
//                                     name="end_time"
//                                     value={formData.end_time}
//                                     onChange={handleChange}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     required
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Form Actions */}
//                     <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//                             disabled={loading}
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${
//                                 loading ? "opacity-50 cursor-not-allowed" : ""
//                             }`}
//                         >
//                             {loading ? (
//                                 <>
//                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                                     {reservationToEdit ? "Updating..." : "Creating..."}
//                                 </>
//                             ) : (
//                                 <>{reservationToEdit ? "Update Reservation" : "Create Reservation"}</>
//                             )}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default AddReservationForm;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { X, Calendar, Clock, Mail, Phone, Home, MapPin } from "lucide-react";

// const AddReservationForm = ({
//     isOpen,
//     onClose,
//     reservationToEdit,
//     onSuccess,
// }) => {
//     const [formData, setFormData] = useState({
//         user_name: "",
//         email: "",
//         phone: "",
//         address: "",
//         pickup_location: "",
//         dropoff_location: "",
//         package_type: "",
//         reservation_date: "",
//         start_time: "",
//         end_time: "",
//         price_id: "",
//         test_time: "",
//         test_location: "Mandurah licensing center",
//     });

//     const [prices, setPrices] = useState([]);
//     const [categories, setCategories] = useState([]);
//     const [filteredPackages, setFilteredPackages] = useState([]);
//     const [selectedPackage, setSelectedPackage] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [fetchingPrices, setFetchingPrices] = useState(false);
//     const [error, setError] = useState(null);
//     const [successMessage, setSuccessMessage] = useState(null);

//     // Test package categories
//     const testPackageCategories = [
//         "Driving Test Packages",
//         "Test Packages",
//         "Driving Test",
//         "PDA Test Packages",
//         "Road Test Packages",
//     ];

//     // Check if selected category is a test package
//     const isTestPackage = () => {
//         return testPackageCategories.some(
//             (category) =>
//                 category.toLowerCase() === formData.package_type?.toLowerCase(),
//         );
//     };

//     // Fetch prices when form opens
//     useEffect(() => {
//         const fetchPrices = async () => {
//             try {
//                 setFetchingPrices(true);
//                 const response = await axios.get(route("ourprice.index"));
//                 const pricesData = response.data.data;
//                 setPrices(pricesData);

//                 // Extract unique categories from prices
//                 const uniqueCategories = [
//                     ...new Set(
//                         pricesData
//                             .map((price) => price.category)
//                             .filter((category) => category),
//                     ),
//                 ];
//                 setCategories(uniqueCategories);
//             } catch (err) {
//                 console.error("Error fetching prices:", err);
//                 setError("Failed to load price packages");
//             } finally {
//                 setFetchingPrices(false);
//             }
//         };

//         if (isOpen) {
//             fetchPrices();
//         }
//     }, [isOpen]);

//     // Filter packages based on selected category
//     useEffect(() => {
//         if (formData.package_type && prices.length > 0) {
//             const filtered = prices.filter(
//                 (price) =>
//                     price.category && price.category === formData.package_type,
//             );
//             setFilteredPackages(filtered);

//             // Reset selected package when category changes
//             setFormData((prev) => ({ ...prev, price_id: "" }));
//             setSelectedPackage(null);

//             // Clear test fields if category is not a test package
//             if (!isTestPackage()) {
//                 setFormData((prev) => ({
//                     ...prev,
//                     test_time: "",
//                     test_location: "Mandurah licensing center",
//                 }));
//             }
//         } else {
//             setFilteredPackages([]);
//         }
//     }, [formData.package_type, prices]);

//     // Update selected package details when price_id changes
//     useEffect(() => {
//         if (formData.price_id && prices.length > 0) {
//             const package_ = prices.find(
//                 (p) => p.id === parseInt(formData.price_id),
//             );
//             setSelectedPackage(package_ || null);
//         } else {
//             setSelectedPackage(null);
//         }
//     }, [formData.price_id, prices]);

//     // Populate form when editing
//     useEffect(() => {
//         if (reservationToEdit) {
//             setFormData({
//                 user_name: reservationToEdit.user_name || "",
//                 email: reservationToEdit.email || "",
//                 phone: reservationToEdit.phone || "",
//                 address: reservationToEdit.address || "",
//                 pickup_location: reservationToEdit.pickup_location || "",
//                 dropoff_location: reservationToEdit.dropoff_location || "",
//                 package_type: reservationToEdit.package_type || "",
//                 reservation_date: reservationToEdit.reservation_date
//                     ? new Date(reservationToEdit.reservation_date)
//                           .toISOString()
//                           .split("T")[0]
//                     : "",
//                 start_time: reservationToEdit.start_time || "",
//                 end_time: reservationToEdit.end_time || "",
//                 price_id: reservationToEdit.price_id
//                     ? reservationToEdit.price_id.toString()
//                     : "",
//                 test_time: reservationToEdit.test_time || "",
//                 test_location:
//                     reservationToEdit.test_location ||
//                     "Mandurah licensing center",
//             });
//         } else {
//             setFormData({
//                 user_name: "",
//                 email: "",
//                 phone: "",
//                 address: "",
//                 pickup_location: "",
//                 dropoff_location: "",
//                 package_type: "",
//                 reservation_date: "",
//                 start_time: "",
//                 end_time: "",
//                 price_id: "",
//                 test_time: "",
//                 test_location: "Mandurah licensing center",
//             });
//         }
//         setError(null);
//         setSuccessMessage(null);
//     }, [reservationToEdit, isOpen]);

//     // Handle input changes
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     };

//     // Validate form
//     const validateForm = () => {
//         const required = [
//             "user_name",
//             "email",
//             "phone",
//             "address",
//             "pickup_location",
//             "dropoff_location",
//             "reservation_date",
//             "start_time",
//             "end_time",
//             "package_type",
//             "price_id",
//         ];

//         for (let field of required) {
//             if (!formData[field] || formData[field].toString().trim() === "") {
//                 let fieldName = field;
//                 if (field === "package_type") fieldName = "category";
//                 if (field === "price_id") fieldName = "package";
//                 setError(`${fieldName.replace("_", " ")} is required`);
//                 return false;
//             }
//         }

//         // Email validation
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(formData.email)) {
//             setError("Please enter a valid email address");
//             return false;
//         }

//         // Phone validation
//         if (formData.phone.length < 10) {
//             setError("Please enter a valid phone number");
//             return false;
//         }

//         // Time validation
//         if (formData.start_time >= formData.end_time) {
//             setError("End time must be after start time");
//             return false;
//         }

//         // Date validation
//         const today = new Date().toISOString().split("T")[0];
//         if (formData.reservation_date < today) {
//             setError("Reservation date cannot be in the past");
//             return false;
//         }

//         // Validate test fields if it's a test package
//         if (isTestPackage()) {
//             if (!formData.test_time) {
//                 setError("Test time is required for test packages");
//                 return false;
//             }
//             if (
//                 !formData.test_location ||
//                 formData.test_location.trim() === ""
//             ) {
//                 setError("Test location is required for test packages");
//                 return false;
//             }
//         }

//         return true;
//     };

//     // Handle form submit
//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!validateForm()) {
//             return;
//         }

//         setLoading(true);
//         setError(null);
//         setSuccessMessage(null);

//         // Prepare data for submission
//         // const submitData = {
//         //     user_name: formData.user_name,
//         //     email: formData.email,
//         //     phone: formData.phone,
//         //     address: formData.address,
//         //     pickup_location: formData.pickup_location,
//         //     dropoff_location: formData.dropoff_location,
//         //     // package_type: formData.package_type, // String - category name
//         //     package_type: JSON.stringify({
//         //         category: formData.package_type,
//         //         price_id: parseInt(formData.price_id),
//         //     }),
//         //     price_id: parseInt(formData.price_id), // Integer - package ID
//         //     reservation_date: formData.reservation_date,
//         //     start_time: formData.start_time,
//         //     end_time: formData.end_time,
//         // };

//         // Find the selected package from the filteredPackages array
//         const getPackageDescription = () => {
//             if (!formData.price_id) return formData.package_type;

//             const selectedPkg = filteredPackages.find(
//                 (p) => p.id === parseInt(formData.price_id),
//             );
//             return selectedPkg
//                 ? selectedPkg.description
//                 : formData.package_type;
//         };

//         const submitData = {
//             user_name: formData.user_name,
//             email: formData.email,
//             phone: formData.phone,
//             address: formData.address,
//             pickup_location: formData.pickup_location,
//             dropoff_location: formData.dropoff_location,
//             // Store the actual package description
//             package_type: getPackageDescription(),
//             // Keep price_id as the package ID
//             price_id: parseInt(formData.price_id),
//             reservation_date: formData.reservation_date,
//             start_time: formData.start_time,
//             end_time: formData.end_time,
//         };

//         console.log("Package being saved:", getPackageDescription()); // Will show like "Extended lesson with comprehensive assessment"

//         // Add test fields only if it's a test package
//         if (isTestPackage()) {
//             submitData.test_time = formData.test_time;
//             submitData.test_location = formData.test_location;
//         }

//         console.log("Submitting data:", submitData); // Debug log

//         try {
//             let response;

//             if (reservationToEdit) {
//                 // Update existing reservation
//                 response = await axios.put(
//                     route("ouruserreservations.update", {
//                         id: reservationToEdit.id,
//                     }),
//                     submitData,
//                 );
//             } else {
//                 // Create new reservation
//                 response = await axios.post(
//                     route("ouruserreservations.store"),
//                     submitData,
//                 );
//             }

//             if (response.data.success) {
//                 setSuccessMessage(
//                     reservationToEdit
//                         ? "Reservation updated successfully!"
//                         : "Reservation created successfully!",
//                 );

//                 if (onSuccess) {
//                     onSuccess(response.data.data);
//                 }

//                 setTimeout(() => {
//                     onClose();
//                 }, 1500);
//             }
//         } catch (err) {
//             console.error("Error saving reservation:", err);

//             if (err.response && err.response.data) {
//                 const errors = err.response.data.errors;
//                 if (errors) {
//                     const errorMessages = Object.values(errors)
//                         .flat()
//                         .join(", ");
//                     setError(errorMessages);
//                 } else {
//                     setError(
//                         err.response.data.message ||
//                             "Failed to save reservation",
//                     );
//                 }
//             } else {
//                 setError("Failed to save reservation. Please try again.");
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
//             <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 h-[600px] overflow-y-auto">
//                 {/* Header */}
//                 <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
//                     <h2 className="text-xl font-semibold text-gray-800">
//                         {reservationToEdit
//                             ? "Edit Reservation"
//                             : "Add New Reservation"}
//                     </h2>
//                     <button
//                         onClick={onClose}
//                         className="text-gray-400 hover:text-gray-600 transition-colors"
//                     >
//                         <X size={24} />
//                     </button>
//                 </div>

//                 {/* Messages */}
//                 {error && (
//                     <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
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

//                 {successMessage && (
//                     <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
//                         {successMessage}
//                     </div>
//                 )}

//                 {/* Form */}
//                 <form onSubmit={handleSubmit} className="p-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         {/* Personal Information */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Full Name *
//                             </label>
//                             <input
//                                 type="text"
//                                 name="user_name"
//                                 value={formData.user_name}
//                                 onChange={handleChange}
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 placeholder="Enter full name"
//                                 required
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Email *
//                             </label>
//                             <div className="relative">
//                                 <Mail
//                                     className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                                     size={18}
//                                 />
//                                 <input
//                                     type="email"
//                                     name="email"
//                                     value={formData.email}
//                                     onChange={handleChange}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="email@example.com"
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Phone *
//                             </label>
//                             <div className="relative">
//                                 <Phone
//                                     className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                                     size={18}
//                                 />
//                                 <input
//                                     type="tel"
//                                     name="phone"
//                                     value={formData.phone}
//                                     onChange={handleChange}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="Enter phone number"
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Address *
//                             </label>
//                             <div className="relative">
//                                 <Home
//                                     className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                                     size={18}
//                                 />
//                                 <input
//                                     type="text"
//                                     name="address"
//                                     value={formData.address}
//                                     onChange={handleChange}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="Enter address"
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         {/* Location Information */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Pickup Location *
//                             </label>
//                             <input
//                                 type="text"
//                                 name="pickup_location"
//                                 value={formData.pickup_location}
//                                 onChange={handleChange}
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 placeholder="Enter pickup location"
//                                 required
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Dropoff Location *
//                             </label>
//                             <input
//                                 type="text"
//                                 name="dropoff_location"
//                                 value={formData.dropoff_location}
//                                 onChange={handleChange}
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 placeholder="Enter dropoff location"
//                                 required
//                             />
//                         </div>

//                         {/* Package Category Selection */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Package Category *
//                             </label>
//                             <select
//                                 name="package_type"
//                                 value={formData.package_type}
//                                 onChange={handleChange}
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 required
//                             >
//                                 <option value="">
//                                     Select a package category
//                                 </option>
//                                 {categories.map((category) => (
//                                     <option key={category} value={category}>
//                                         {category}
//                                     </option>
//                                 ))}
//                             </select>
//                             {fetchingPrices && categories.length === 0 && (
//                                 <p className="text-sm text-gray-500 mt-1">
//                                     Loading categories...
//                                 </p>
//                             )}
//                         </div>

//                         {/* Specific Package Selection */}
//                         {formData.package_type && (
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Select Package *
//                                 </label>
//                                 <select
//                                     name="price_id"
//                                     value={formData.price_id}
//                                     onChange={handleChange}
//                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     required
//                                     disabled={
//                                         fetchingPrices ||
//                                         filteredPackages.length === 0
//                                     }
//                                 >
//                                     <option value="">Choose a package</option>
//                                     {filteredPackages.map((pkg) => (
//                                         <option key={pkg.id} value={pkg.id}>
//                                             {pkg.description}{" "}
//                                             {pkg.price ? `- $${pkg.price}` : ""}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 {filteredPackages.length === 0 &&
//                                     !fetchingPrices && (
//                                         <p className="text-sm text-red-500 mt-1">
//                                             No packages available in this
//                                             category
//                                         </p>
//                                     )}
//                             </div>
//                         )}

//                         {/* Date and Time Information */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Reservation Date *
//                             </label>
//                             <div className="relative">
//                                 <Calendar
//                                     className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                                     size={18}
//                                 />
//                                 <input
//                                     type="date"
//                                     name="reservation_date"
//                                     value={formData.reservation_date}
//                                     onChange={handleChange}
//                                     min={new Date().toISOString().split("T")[0]}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         {/* Test fields - Only show for test packages */}
//                         {isTestPackage() && (
//                             <>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Test Location *
//                                     </label>
//                                     <div className="relative">
//                                         <MapPin
//                                             className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                                             size={18}
//                                         />
//                                         <input
//                                             type="text"
//                                             name="test_location"
//                                             value={formData.test_location}
//                                             onChange={handleChange}
//                                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                             placeholder="Enter test location"
//                                             required={isTestPackage()}
//                                         />
//                                     </div>
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Test Time *
//                                     </label>
//                                     <div className="relative">
//                                         <Clock
//                                             className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                                             size={18}
//                                         />
//                                         <input
//                                             type="time"
//                                             name="test_time"
//                                             value={formData.test_time}
//                                             onChange={handleChange}
//                                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                             required={isTestPackage()}
//                                         />
//                                     </div>
//                                 </div>
//                             </>
//                         )}

//                         {/* Regular start and end times */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Start Time *
//                             </label>
//                             <div className="relative">
//                                 <Clock
//                                     className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                                     size={18}
//                                 />
//                                 <input
//                                     type="time"
//                                     name="start_time"
//                                     value={formData.start_time}
//                                     onChange={handleChange}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 End Time *
//                             </label>
//                             <div className="relative">
//                                 <Clock
//                                     className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                                     size={18}
//                                 />
//                                 <input
//                                     type="time"
//                                     name="end_time"
//                                     value={formData.end_time}
//                                     onChange={handleChange}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     required
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Selected Package Summary */}
//                     {selectedPackage && (
//                         <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                             <h3 className="font-medium text-blue-800 mb-2">
//                                 Selected Package Details:
//                             </h3>
//                             <p className="text-sm text-blue-600">
//                                 <span className="font-medium">Category:</span>{" "}
//                                 {selectedPackage.category}
//                                 <br />
//                                 <span className="font-medium">
//                                     Package:
//                                 </span>{" "}
//                                 {selectedPackage.description}
//                                 <br />
//                                 {selectedPackage.price && (
//                                     <>
//                                         <span className="font-medium">
//                                             Price:
//                                         </span>{" "}
//                                         ${selectedPackage.price}
//                                         <br />
//                                     </>
//                                 )}
//                                 {selectedPackage.duration && (
//                                     <>
//                                         <span className="font-medium">
//                                             Duration:
//                                         </span>{" "}
//                                         {selectedPackage.duration}
//                                         <br />
//                                     </>
//                                 )}
//                             </p>
//                         </div>
//                     )}

//                     {/* Form Actions */}
//                     <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//                             disabled={loading}
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${
//                                 loading ? "opacity-50 cursor-not-allowed" : ""
//                             }`}
//                         >
//                             {loading ? (
//                                 <>
//                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                                     {reservationToEdit
//                                         ? "Updating..."
//                                         : "Creating..."}
//                                 </>
//                             ) : (
//                                 <>
//                                     {reservationToEdit
//                                         ? "Update Reservation"
//                                         : "Create Reservation"}
//                                 </>
//                             )}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default AddReservationForm;

// import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios";
// import { X, Calendar, Clock, Mail, Phone, Home, MapPin } from "lucide-react";

// const AddReservationForm = ({
//     isOpen,
//     onClose,
//     reservationToEdit,
//     onSuccess,
// }) => {
//     const [formData, setFormData] = useState({
//         user_name: "",
//         email: "",
//         phone: "",
//         address: "",
//         pickup_location: "",
//         dropoff_location: "",
//         package_type: "",
//         reservation_date: "",
//         start_time: "",
//         end_time: "",
//         price_id: "",
//         test_time: "",
//         test_location: "Mandurah licensing center",
//     });

//     const [prices, setPrices] = useState([]);
//     const [categories, setCategories] = useState([]);
//     const [filteredPackages, setFilteredPackages] = useState([]);
//     const [selectedPackage, setSelectedPackage] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [fetchingPrices, setFetchingPrices] = useState(false);
//     const [error, setError] = useState(null);
//     const [successMessage, setSuccessMessage] = useState(null);

//     useEffect(() => {
//         if (isOpen) {
//             // Save current scroll position
//             const scrollY = window.scrollY;

//             // Add styles to prevent scrolling
//             document.body.style.position = "fixed";
//             document.body.style.top = `-${scrollY}px`;
//             document.body.style.width = "100%";
//             document.body.style.overflow = "hidden";

//             // Store scroll position to restore later
//             return () => {
//                 // Restore scrolling
//                 document.body.style.position = "";
//                 document.body.style.top = "";
//                 document.body.style.width = "";
//                 document.body.style.overflow = "";
//                 window.scrollTo(0, scrollY);
//             };
//         }
//     }, [isOpen]);

//     // Test package categories
//     const testPackageCategories = [
//         "Driving Test Packages",
//         "Test Packages",
//         "Driving Test",
//         "PDA Test Packages",
//         "Road Test Packages",
//     ];

//     // Check if selected category is a test package
//     const isTestPackage = useCallback(() => {
//         return testPackageCategories.some(
//             (category) =>
//                 category.toLowerCase() === formData.package_type?.toLowerCase(),
//         );
//     }, [formData.package_type]);

//     // Parse duration string to minutes (e.g., "2 hours" -> 120, "90 minutes" -> 90)
//     const parseDurationToMinutes = (duration) => {
//         if (!duration) return null;

//         const durationStr = duration.toString().toLowerCase();

//         // Check for hours
//         const hoursMatch = durationStr.match(/(\d+(?:\.\d+)?)\s*hours?/);
//         if (hoursMatch) {
//             return parseFloat(hoursMatch[1]) * 60;
//         }

//         // Check for minutes
//         const minutesMatch = durationStr.match(/(\d+)\s*minutes?/);
//         if (minutesMatch) {
//             return parseInt(minutesMatch[1]);
//         }

//         return null;
//     };

//     // Calculate end time based on start time and duration
//     const calculateEndTime = (startTime, durationMinutes) => {
//         if (!startTime || !durationMinutes) return "";

//         const [hours, minutes] = startTime.split(":").map(Number);
//         const startDate = new Date();
//         startDate.setHours(hours, minutes, 0, 0);

//         const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

//         const endHours = endDate.getHours().toString().padStart(2, "0");
//         const endMinutes = endDate.getMinutes().toString().padStart(2, "0");

//         return `${endHours}:${endMinutes}`;
//     };

//     // Calculate start time based on test time and duration (for test packages)
//     const calculateStartTimeFromTest = (testTime, durationMinutes) => {
//         if (!testTime || !durationMinutes) return "";

//         const [hours, minutes] = testTime.split(":").map(Number);
//         const testDate = new Date();
//         testDate.setHours(hours, minutes, 0, 0);

//         // Start time is duration minutes before test time
//         const startDate = new Date(
//             testDate.getTime() - durationMinutes * 60000,
//         );

//         const startHours = startDate.getHours().toString().padStart(2, "0");
//         const startMinutes = startDate.getMinutes().toString().padStart(2, "0");

//         return `${startHours}:${startMinutes}`;
//     };

//     // Auto-calculate times when package or times change
//     useEffect(() => {
//         if (!selectedPackage || !selectedPackage.duration) return;

//         const durationMinutes = parseDurationToMinutes(
//             selectedPackage.duration,
//         );
//         if (!durationMinutes) return;

//         if (isTestPackage()) {
//             // For test packages: calculate start time from test time
//             if (formData.test_time && !formData.start_time) {
//                 const calculatedStartTime = calculateStartTimeFromTest(
//                     formData.test_time,
//                     durationMinutes,
//                 );
//                 const calculatedEndTime = calculateEndTime(
//                     formData.test_time,
//                     60, // End time is 1 hour after test time
//                 );

//                 setFormData((prev) => ({
//                     ...prev,
//                     start_time: calculatedStartTime,
//                     end_time: calculatedEndTime,
//                 }));
//             }
//             // If test time changes, recalculate start and end times
//             else if (formData.test_time) {
//                 const calculatedStartTime = calculateStartTimeFromTest(
//                     formData.test_time,
//                     durationMinutes,
//                 );
//                 const calculatedEndTime = calculateEndTime(
//                     formData.test_time,
//                     60, // End time is 1 hour after test time
//                 );

//                 setFormData((prev) => ({
//                     ...prev,
//                     start_time: calculatedStartTime,
//                     end_time: calculatedEndTime,
//                 }));
//             }
//         } else {
//             // For standard lessons: calculate end time from start time
//             if (formData.start_time && !formData.end_time) {
//                 const calculatedEndTime = calculateEndTime(
//                     formData.start_time,
//                     durationMinutes,
//                 );
//                 setFormData((prev) => ({
//                     ...prev,
//                     end_time: calculatedEndTime,
//                 }));
//             }
//             // If start time changes, recalculate end time
//             else if (formData.start_time) {
//                 const calculatedEndTime = calculateEndTime(
//                     formData.start_time,
//                     durationMinutes,
//                 );
//                 setFormData((prev) => ({
//                     ...prev,
//                     end_time: calculatedEndTime,
//                 }));
//             }
//         }
//     }, [
//         selectedPackage,
//         formData.start_time,
//         formData.test_time,
//         formData.package_type,
//     ]);

//     // Reset times when package changes
//     useEffect(() => {
//         if (selectedPackage) {
//             setFormData((prev) => ({
//                 ...prev,
//                 start_time: "",
//                 end_time: "",
//             }));
//         }
//     }, [selectedPackage?.id]);

//     // Fetch prices when form opens
//     useEffect(() => {
//         const fetchPrices = async () => {
//             try {
//                 setFetchingPrices(true);
//                 const response = await axios.get(route("ourprice.index"));
//                 const pricesData = response.data.data;
//                 setPrices(pricesData);

//                 // Extract unique categories from prices
//                 const uniqueCategories = [
//                     ...new Set(
//                         pricesData
//                             .map((price) => price.category)
//                             .filter((category) => category),
//                     ),
//                 ];
//                 setCategories(uniqueCategories);
//             } catch (err) {
//                 console.error("Error fetching prices:", err);
//                 alert(
//                     "Failed to load price packages. Please refresh the page.",
//                 );
//             } finally {
//                 setFetchingPrices(false);
//             }
//         };

//         if (isOpen) {
//             fetchPrices();
//         }
//     }, [isOpen]);

//     // Filter packages based on selected category
//     useEffect(() => {
//         if (formData.package_type && prices.length > 0) {
//             const filtered = prices.filter(
//                 (price) =>
//                     price.category && price.category === formData.package_type,
//             );
//             setFilteredPackages(filtered);

//             // Reset selected package when category changes
//             setFormData((prev) => ({ ...prev, price_id: "" }));
//             setSelectedPackage(null);

//             // Clear test fields if category is not a test package
//             if (!isTestPackage()) {
//                 setFormData((prev) => ({
//                     ...prev,
//                     test_time: "",
//                     test_location: "Mandurah licensing center",
//                 }));
//             }
//         } else {
//             setFilteredPackages([]);
//         }
//     }, [formData.package_type, prices]);

//     // Update selected package details when price_id changes
//     useEffect(() => {
//         if (formData.price_id && prices.length > 0) {
//             const package_ = prices.find(
//                 (p) => p.id === parseInt(formData.price_id),
//             );
//             setSelectedPackage(package_ || null);
//         } else {
//             setSelectedPackage(null);
//         }
//     }, [formData.price_id, prices]);

//     // Populate form when editing
//     useEffect(() => {
//         if (reservationToEdit) {
//             setFormData({
//                 user_name: reservationToEdit.user_name || "",
//                 email: reservationToEdit.email || "",
//                 phone: reservationToEdit.phone || "",
//                 address: reservationToEdit.address || "",
//                 pickup_location: reservationToEdit.pickup_location || "",
//                 dropoff_location: reservationToEdit.dropoff_location || "",
//                 package_type: reservationToEdit.package_type || "",
//                 reservation_date: reservationToEdit.reservation_date
//                     ? new Date(reservationToEdit.reservation_date)
//                           .toISOString()
//                           .split("T")[0]
//                     : "",
//                 start_time: reservationToEdit.start_time || "",
//                 end_time: reservationToEdit.end_time || "",
//                 price_id: reservationToEdit.price_id
//                     ? reservationToEdit.price_id.toString()
//                     : "",
//                 test_time: reservationToEdit.test_time || "",
//                 test_location:
//                     reservationToEdit.test_location ||
//                     "Mandurah licensing center",
//             });
//         } else {
//             setFormData({
//                 user_name: "",
//                 email: "",
//                 phone: "",
//                 address: "",
//                 pickup_location: "",
//                 dropoff_location: "",
//                 package_type: "",
//                 reservation_date: "",
//                 start_time: "",
//                 end_time: "",
//                 price_id: "",
//                 test_time: "",
//                 test_location: "Mandurah licensing center",
//             });
//         }
//         setError(null);
//         setSuccessMessage(null);
//     }, [reservationToEdit, isOpen]);

//     // Handle input changes
//     const handleChange = (e) => {
//         const { name, value } = e.target;

//         // Special handling for test_time changes
//         if (name === "test_time" && isTestPackage() && selectedPackage) {
//             const durationMinutes = parseDurationToMinutes(
//                 selectedPackage.duration,
//             );
//             if (durationMinutes) {
//                 const calculatedStartTime = calculateStartTimeFromTest(
//                     value,
//                     durationMinutes,
//                 );
//                 const calculatedEndTime = calculateEndTime(value, 60);

//                 setFormData((prev) => ({
//                     ...prev,
//                     [name]: value,
//                     start_time: calculatedStartTime,
//                     end_time: calculatedEndTime,
//                 }));
//                 return;
//             }
//         }

//         // Special handling for start_time changes (standard packages)
//         if (name === "start_time" && !isTestPackage() && selectedPackage) {
//             const durationMinutes = parseDurationToMinutes(
//                 selectedPackage.duration,
//             );
//             if (durationMinutes) {
//                 const calculatedEndTime = calculateEndTime(
//                     value,
//                     durationMinutes,
//                 );
//                 setFormData((prev) => ({
//                     ...prev,
//                     [name]: value,
//                     end_time: calculatedEndTime,
//                 }));
//                 return;
//             }
//         }

//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     };

//     // Validate form
//     const validateForm = () => {
//         const required = [
//             "user_name",
//             "email",
//             "phone",
//             "address",
//             "pickup_location",
//             "dropoff_location",
//             "reservation_date",
//             "start_time",
//             "end_time",
//             "package_type",
//             "price_id",
//         ];

//         for (let field of required) {
//             if (!formData[field] || formData[field].toString().trim() === "") {
//                 let fieldName = field;
//                 if (field === "package_type") fieldName = "category";
//                 if (field === "price_id") fieldName = "package";
//                 alert(`❌ ${fieldName.replace("_", " ")} is required`);
//                 return false;
//             }
//         }

//         // Email validation
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(formData.email)) {
//             alert("❌ Please enter a valid email address");
//             return false;
//         }

//         // Phone validation
//         if (formData.phone.length < 10) {
//             alert("❌ Please enter a valid phone number");
//             return false;
//         }

//         // Time validation
//         if (formData.start_time >= formData.end_time) {
//             alert("❌ End time must be after start time");
//             return false;
//         }

//         // Date validation
//         const today = new Date().toISOString().split("T")[0];
//         if (formData.reservation_date < today) {
//             alert("❌ Reservation date cannot be in the past");
//             return false;
//         }

//         // Validate test fields if it's a test package
//         if (isTestPackage()) {
//             if (!formData.test_time) {
//                 alert("❌ Test time is required for test packages");
//                 return false;
//             }
//             if (
//                 !formData.test_location ||
//                 formData.test_location.trim() === ""
//             ) {
//                 alert("❌ Test location is required for test packages");
//                 return false;
//             }
//         }

//         return true;
//     };

//     // Handle form submit
//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!validateForm()) {
//             return;
//         }

//         setLoading(true);
//         setError(null);
//         setSuccessMessage(null);

//         // Find the selected package from the filteredPackages array
//         const getPackageDescription = () => {
//             if (!formData.price_id) return formData.package_type;

//             const selectedPkg = filteredPackages.find(
//                 (p) => p.id === parseInt(formData.price_id),
//             );
//             return selectedPkg
//                 ? selectedPkg.description
//                 : formData.package_type;
//         };

//         const submitData = {
//             user_name: formData.user_name,
//             email: formData.email,
//             phone: formData.phone,
//             address: formData.address,
//             pickup_location: formData.pickup_location,
//             dropoff_location: formData.dropoff_location,
//             package_type: getPackageDescription(),
//             price_id: parseInt(formData.price_id),
//             reservation_date: formData.reservation_date,
//             start_time: formData.start_time,
//             end_time: formData.end_time,
//         };

//         // Add test fields only if it's a test package
//         if (isTestPackage()) {
//             submitData.test_time = formData.test_time;
//             submitData.test_location = formData.test_location;
//         }

//         try {
//             let response;

//             if (reservationToEdit) {
//                 // Update existing reservation
//                 response = await axios.put(
//                     route("ouruserreservations.update", {
//                         id: reservationToEdit.id,
//                     }),
//                     submitData,
//                 );
//             } else {
//                 // Create new reservation
//                 response = await axios.post(
//                     route("ouruserreservations.store"),
//                     submitData,
//                 );
//             }

//             if (response.data.success) {
//                 alert(
//                     `✓ ${reservationToEdit ? "Reservation updated" : "Reservation created"} successfully!`,
//                 );

//                 if (onSuccess) {
//                     onSuccess(response.data.data);
//                 }

//                 setTimeout(() => {
//                     onClose();
//                 }, 500);
//             }
//         } catch (err) {
//             console.error("Error saving reservation:", err);

//             if (err.response && err.response.data) {
//                 const errorMessage = err.response.data.message;

//                 // Show popup alert for blocked or booked slots
//                 if (
//                     errorMessage &&
//                     errorMessage.toLowerCase().includes("blocked")
//                 ) {
//                     alert(
//                         "❌ This time slot is already BLOCKED by administrator.\n\nPlease select a different time.",
//                     );
//                 } else if (
//                     errorMessage &&
//                     errorMessage.toLowerCase().includes("booked")
//                 ) {
//                     alert(
//                         "❌ This time slot is already BOOKED.\n\nPlease select a different time.",
//                     );
//                 } else if (
//                     errorMessage &&
//                     errorMessage.toLowerCase().includes("reserved")
//                 ) {
//                     alert(
//                         "❌ This time slot is already BOOKED.\n\nPlease select a different time.",
//                     );
//                 } else {
//                     alert(
//                         `❌ Error: ${errorMessage || "Failed to save reservation"}`,
//                     );
//                 }
//             } else {
//                 alert("❌ Failed to save reservation. Please try again.");
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
//             <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 h-[600px] overflow-y-auto">
//                 {/* Header */}
//                 <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
//                     <h2 className="text-xl font-semibold text-gray-800">
//                         {reservationToEdit
//                             ? "Edit Reservation"
//                             : "Add New Reservation"}
//                     </h2>
//                     <button
//                         onClick={onClose}
//                         className="text-gray-400 hover:text-gray-600 transition-colors"
//                     >
//                         <X size={24} />
//                     </button>
//                 </div>

//                 {/* Success Message */}
//                 {successMessage && (
//                     <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
//                         {successMessage}
//                     </div>
//                 )}

//                 {/* Form */}
//                 <form onSubmit={handleSubmit} className="p-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         {/* Personal Information */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Full Name *
//                             </label>
//                             <input
//                                 type="text"
//                                 name="user_name"
//                                 value={formData.user_name}
//                                 onChange={handleChange}
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 placeholder="Enter full name"
//                                 required
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Email *
//                             </label>
//                             <div className="relative">
//                                 <Mail
//                                     className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                                     size={18}
//                                 />
//                                 <input
//                                     type="email"
//                                     name="email"
//                                     value={formData.email}
//                                     onChange={handleChange}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="email@example.com"
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Phone *
//                             </label>
//                             <div className="relative">
//                                 <Phone
//                                     className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                                     size={18}
//                                 />
//                                 <input
//                                     type="tel"
//                                     name="phone"
//                                     value={formData.phone}
//                                     onChange={handleChange}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="Enter phone number"
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Address *
//                             </label>
//                             <div className="relative">
//                                 <Home
//                                     className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                                     size={18}
//                                 />
//                                 <input
//                                     type="text"
//                                     name="address"
//                                     value={formData.address}
//                                     onChange={handleChange}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="Enter address"
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         {/* Location Information */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Pickup Location *
//                             </label>
//                             <input
//                                 type="text"
//                                 name="pickup_location"
//                                 value={formData.pickup_location}
//                                 onChange={handleChange}
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 placeholder="Enter pickup location"
//                                 required
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Dropoff Location *
//                             </label>
//                             <input
//                                 type="text"
//                                 name="dropoff_location"
//                                 value={formData.dropoff_location}
//                                 onChange={handleChange}
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 placeholder="Enter dropoff location"
//                                 required
//                             />
//                         </div>

//                         {/* Package Category Selection */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Package Category *
//                             </label>
//                             <select
//                                 name="package_type"
//                                 value={formData.package_type}
//                                 onChange={handleChange}
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 required
//                             >
//                                 <option value="">
//                                     Select a package category
//                                 </option>
//                                 {categories.map((category) => (
//                                     <option key={category} value={category}>
//                                         {category}
//                                     </option>
//                                 ))}
//                             </select>
//                             {fetchingPrices && categories.length === 0 && (
//                                 <p className="text-sm text-gray-500 mt-1">
//                                     Loading categories...
//                                 </p>
//                             )}
//                         </div>

//                         {/* Specific Package Selection */}
//                         {formData.package_type && (
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Select Package *
//                                 </label>
//                                 <select
//                                     name="price_id"
//                                     value={formData.price_id}
//                                     onChange={handleChange}
//                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     required
//                                     disabled={
//                                         fetchingPrices ||
//                                         filteredPackages.length === 0
//                                     }
//                                 >
//                                     <option value="">Choose a package</option>
//                                     {filteredPackages.map((pkg) => (
//                                         <option key={pkg.id} value={pkg.id}>
//                                             {pkg.description}{" "}
//                                             {pkg.price ? `- $${pkg.price}` : ""}
//                                             {/* {pkg.duration
//                                                 ? ` (${pkg.duration})`
//                                                 : ""} */}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 {filteredPackages.length === 0 &&
//                                     !fetchingPrices && (
//                                         <p className="text-sm text-red-500 mt-1">
//                                             No packages available in this
//                                             category
//                                         </p>
//                                     )}
//                             </div>
//                         )}

//                         {/* Date and Time Information */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Reservation Date *
//                             </label>
//                             <div className="relative">
//                                 <Calendar
//                                     className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                                     size={18}
//                                 />
//                                 <input
//                                     type="date"
//                                     name="reservation_date"
//                                     value={formData.reservation_date}
//                                     onChange={handleChange}
//                                     min={new Date().toISOString().split("T")[0]}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         {/* Test fields - Only show for test packages */}
//                         {isTestPackage() && (
//                             <>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Test Location *
//                                     </label>
//                                     <div className="relative">
//                                         <MapPin
//                                             className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                                             size={18}
//                                         />
//                                         <input
//                                             type="text"
//                                             name="test_location"
//                                             value={formData.test_location}
//                                             onChange={handleChange}
//                                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                             placeholder="Enter test location"
//                                             required={isTestPackage()}
//                                         />
//                                     </div>
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Test Time *
//                                     </label>
//                                     <div className="relative">
//                                         <Clock
//                                             className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                                             size={18}
//                                         />
//                                         <input
//                                             type="time"
//                                             name="test_time"
//                                             value={formData.test_time}
//                                             onChange={handleChange}
//                                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                             required={isTestPackage()}
//                                         />
//                                     </div>
//                                     {selectedPackage &&
//                                         selectedPackage.duration && (
//                                             <p className="text-xs text-gray-500 mt-1">
//                                                 Start time will be automatically
//                                                 calculated{" "}
//                                                 {selectedPackage.duration}{" "}
//                                                 before test time
//                                             </p>
//                                         )}
//                                 </div>
//                             </>
//                         )}

//                         {/* Regular start and end times */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Start Time *
//                             </label>
//                             <div className="relative">
//                                 <Clock
//                                     className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                                     size={18}
//                                 />
//                                 <input
//                                     type="time"
//                                     name="start_time"
//                                     value={formData.start_time}
//                                     onChange={handleChange}
//                                     step="60"
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     required
//                                     readOnly={isTestPackage()}
//                                     disabled={isTestPackage()}
//                                 />
//                             </div>
//                             {!isTestPackage() &&
//                                 selectedPackage &&
//                                 selectedPackage.duration && (
//                                     <p className="text-xs text-gray-500 mt-1">
//                                         End time will be automatically
//                                         calculated based on{" "}
//                                         {selectedPackage.duration}
//                                     </p>
//                                 )}
//                             {isTestPackage() && (
//                                 <p className="text-xs text-gray-500 mt-1">
//                                     Start time is automatically calculated based
//                                     on test time
//                                 </p>
//                             )}
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 End Time *
//                             </label>
//                             <div className="relative">
//                                 <Clock
//                                     className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                                     size={18}
//                                 />
//                                 <input
//                                     type="time"
//                                     name="end_time"
//                                     value={formData.end_time}
//                                     onChange={handleChange}
//                                     step="60"
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
//                                     required
//                                     readOnly
//                                     disabled
//                                 />
//                             </div>
//                             {isTestPackage() && (
//                                 <p className="text-xs text-gray-500 mt-1">
//                                     End time is set to 1 hour after test time
//                                 </p>
//                             )}
//                         </div>
//                     </div>

//                     {/* Info Note about flexible time slots 
//                     <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                         <p className="text-xs text-blue-700">
//                             💡 <span className="font-medium">Tip:</span> You can select any time (e.g., 10:03, 11:07, 11:30, 14:45). 
//                             The system will only check if the time slot is blocked by admin or already booked by another customer.
//                         </p>
//                     </div> 
//                     */}

//                     {/* Selected Package Summary */}
//                     {selectedPackage && (
//                         <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
//                             <h3 className="font-medium text-green-800 mb-2">
//                                 Selected Package Details:
//                             </h3>
//                             <p className="text-sm text-green-600">
//                                 <span className="font-medium">Category:</span>{" "}
//                                 {selectedPackage.category}
//                                 <br />
//                                 <span className="font-medium">
//                                     Package:
//                                 </span>{" "}
//                                 {selectedPackage.description}
//                                 <br />
//                                 {selectedPackage.price && (
//                                     <>
//                                         <span className="font-medium">
//                                             Price:
//                                         </span>{" "}
//                                         ${selectedPackage.price}
//                                         <br />
//                                     </>
//                                 )}
//                                 {selectedPackage.duration && (
//                                     <>
//                                         <span className="font-medium">
//                                             Duration:
//                                         </span>{" "}
//                                         {selectedPackage.duration}
//                                         <br />
//                                     </>
//                                 )}
//                             </p>
//                         </div>
//                     )}

//                     {/* Form Actions */}
//                     <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//                             disabled={loading}
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${
//                                 loading ? "opacity-50 cursor-not-allowed" : ""
//                             }`}
//                         >
//                             {loading ? (
//                                 <>
//                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                                     {reservationToEdit
//                                         ? "Updating..."
//                                         : "Creating..."}
//                                 </>
//                             ) : (
//                                 <>
//                                     {reservationToEdit
//                                         ? "Update Reservation"
//                                         : "Create Reservation"}
//                                 </>
//                             )}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default AddReservationForm;


import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { X, Calendar, Clock, Mail, Phone, Home, MapPin, Plus, Minus } from "lucide-react";

const AddReservationForm = ({
    isOpen,
    onClose,
    reservationToEdit,
    onSuccess,
}) => {
    const [formData, setFormData] = useState({
        user_name: "",
        email: "",
        phone: "",
        address: "",
        pickup_location: "",
        dropoff_location: "",
        package_type: "",
        reservation_date: "",
        start_time: "",
        end_time: "",
        price_id: "",
        test_time: "",
        test_location: "Mandurah licensing center",
    });

    const [prices, setPrices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filteredPackages, setFilteredPackages] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchingPrices, setFetchingPrices] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    
    // Bundle mode states
    const [isBundleMode, setIsBundleMode] = useState(false);
    const [requiredSessionCount, setRequiredSessionCount] = useState(1);
    const [bundleSessions, setBundleSessions] = useState([]);

    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = "100%";
            document.body.style.overflow = "hidden";

            return () => {
                document.body.style.position = "";
                document.body.style.top = "";
                document.body.style.width = "";
                document.body.style.overflow = "";
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen]);

    // Test package categories
    const testPackageCategories = [
        "Driving Test Packages",
        "Test Packages",
        "Driving Test",
        "PDA Test Packages",
        "Road Test Packages",
    ];

    // Check if selected category is a test package
    const isTestPackage = useCallback(() => {
        return testPackageCategories.some(
            (category) =>
                category.toLowerCase() === formData.package_type?.toLowerCase(),
        );
    }, [formData.package_type]);

    // Parse duration string to minutes (e.g., "2 hours" -> 120, "90 minutes" -> 90)
    const parseDurationToMinutes = (duration) => {
        if (!duration) return null;

        const durationStr = duration.toString().toLowerCase();

        const hoursMatch = durationStr.match(/(\d+(?:\.\d+)?)\s*hours?/);
        if (hoursMatch) {
            return parseFloat(hoursMatch[1]) * 60;
        }

        const minutesMatch = durationStr.match(/(\d+)\s*minutes?/);
        if (minutesMatch) {
            return parseInt(minutesMatch[1]);
        }

        return null;
    };

    // Calculate end time based on start time and duration
    const calculateEndTime = (startTime, durationMinutes) => {
        if (!startTime || !durationMinutes) return "";

        const [hours, minutes] = startTime.split(":").map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);

        const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

        const endHours = endDate.getHours().toString().padStart(2, "0");
        const endMinutes = endDate.getMinutes().toString().padStart(2, "0");

        return `${endHours}:${endMinutes}`;
    };

    // Calculate start time based on test time and duration (for test packages)
    const calculateStartTimeFromTest = (testTime, durationMinutes) => {
        if (!testTime || !durationMinutes) return "";

        const [hours, minutes] = testTime.split(":").map(Number);
        const testDate = new Date();
        testDate.setHours(hours, minutes, 0, 0);

        const startDate = new Date(
            testDate.getTime() - durationMinutes * 60000,
        );

        const startHours = startDate.getHours().toString().padStart(2, "0");
        const startMinutes = startDate.getMinutes().toString().padStart(2, "0");

        return `${startHours}:${startMinutes}`;
    };

    // Extract lesson count from package description
    const extractLessonCount = (description) => {
        if (!description) return 1;
        const match = description.match(/^(\d+)\s*x\s*/);
        return match ? parseInt(match[1]) : 1;
    };

    // Auto-calculate times when package or times change
    useEffect(() => {
        if (!selectedPackage || !selectedPackage.duration) return;

        const durationMinutes = parseDurationToMinutes(
            selectedPackage.duration,
        );
        if (!durationMinutes) return;

        if (isTestPackage()) {
            if (formData.test_time && !formData.start_time) {
                const calculatedStartTime = calculateStartTimeFromTest(
                    formData.test_time,
                    durationMinutes,
                );
                const calculatedEndTime = calculateEndTime(
                    formData.test_time,
                    60,
                );

                setFormData((prev) => ({
                    ...prev,
                    start_time: calculatedStartTime,
                    end_time: calculatedEndTime,
                }));
            } else if (formData.test_time) {
                const calculatedStartTime = calculateStartTimeFromTest(
                    formData.test_time,
                    durationMinutes,
                );
                const calculatedEndTime = calculateEndTime(
                    formData.test_time,
                    60,
                );

                setFormData((prev) => ({
                    ...prev,
                    start_time: calculatedStartTime,
                    end_time: calculatedEndTime,
                }));
            }
        } else {
            if (formData.start_time && !formData.end_time) {
                const calculatedEndTime = calculateEndTime(
                    formData.start_time,
                    durationMinutes,
                );
                setFormData((prev) => ({
                    ...prev,
                    end_time: calculatedEndTime,
                }));
            } else if (formData.start_time) {
                const calculatedEndTime = calculateEndTime(
                    formData.start_time,
                    durationMinutes,
                );
                setFormData((prev) => ({
                    ...prev,
                    end_time: calculatedEndTime,
                }));
            }
        }
    }, [
        selectedPackage,
        formData.start_time,
        formData.test_time,
        formData.package_type,
    ]);

    // Reset times when package changes
    useEffect(() => {
        if (selectedPackage) {
            setFormData((prev) => ({
                ...prev,
                start_time: "",
                end_time: "",
            }));
        }
    }, [selectedPackage?.id]);

    // Fetch prices when form opens
    useEffect(() => {
        const fetchPrices = async () => {
            try {
                setFetchingPrices(true);
                const response = await axios.get(route("ourprice.index"));
                const pricesData = response.data.data;
                setPrices(pricesData);

                const uniqueCategories = [
                    ...new Set(
                        pricesData
                            .map((price) => price.category)
                            .filter((category) => category),
                    ),
                ];
                setCategories(uniqueCategories);
            } catch (err) {
                console.error("Error fetching prices:", err);
                alert("Failed to load price packages. Please refresh the page.");
            } finally {
                setFetchingPrices(false);
            }
        };

        if (isOpen) {
            fetchPrices();
        }
    }, [isOpen]);

    // Filter packages based on selected category
    useEffect(() => {
        if (formData.package_type && prices.length > 0) {
            const filtered = prices.filter(
                (price) =>
                    price.category && price.category === formData.package_type,
            );
            setFilteredPackages(filtered);

            setFormData((prev) => ({ ...prev, price_id: "" }));
            setSelectedPackage(null);
            setIsBundleMode(false);
            setRequiredSessionCount(1);
            setBundleSessions([]);

            if (!isTestPackage()) {
                setFormData((prev) => ({
                    ...prev,
                    test_time: "",
                    test_location: "Mandurah licensing center",
                }));
            }
        } else {
            setFilteredPackages([]);
        }
    }, [formData.package_type, prices]);

    // Update selected package details when price_id changes
    useEffect(() => {
        if (formData.price_id && prices.length > 0) {
            const package_ = prices.find(
                (p) => p.id === parseInt(formData.price_id),
            );
            setSelectedPackage(package_ || null);
            
            // Check if this is a bundle package
            if (package_ && package_.description) {
                const lessonCount = extractLessonCount(package_.description);
                setRequiredSessionCount(lessonCount);
                setIsBundleMode(lessonCount > 1);
                
                if (lessonCount > 1) {
                    // Initialize bundle sessions
                    const sessions = [];
                    for (let i = 0; i < lessonCount; i++) {
                        sessions.push({
                            reservation_date: "",
                            start_time: "",
                            end_time: "",
                            test_time: "",
                            test_location: "Mandurah licensing center"
                        });
                    }
                    setBundleSessions(sessions);
                }
            }
        } else {
            setSelectedPackage(null);
            setIsBundleMode(false);
            setRequiredSessionCount(1);
            setBundleSessions([]);
        }
    }, [formData.price_id, prices]);

    // Populate form when editing
    useEffect(() => {
        if (reservationToEdit) {
            setFormData({
                user_name: reservationToEdit.user_name || "",
                email: reservationToEdit.email || "",
                phone: reservationToEdit.phone || "",
                address: reservationToEdit.address || "",
                pickup_location: reservationToEdit.pickup_location || "",
                dropoff_location: reservationToEdit.dropoff_location || "",
                package_type: reservationToEdit.package_type || "",
                reservation_date: reservationToEdit.reservation_date
                    ? new Date(reservationToEdit.reservation_date)
                          .toISOString()
                          .split("T")[0]
                    : "",
                start_time: reservationToEdit.start_time || "",
                end_time: reservationToEdit.end_time || "",
                price_id: reservationToEdit.price_id
                    ? reservationToEdit.price_id.toString()
                    : "",
                test_time: reservationToEdit.test_time || "",
                test_location:
                    reservationToEdit.test_location ||
                    "Mandurah licensing center",
            });
            setIsBundleMode(false);
            setBundleSessions([]);
        } else {
            setFormData({
                user_name: "",
                email: "",
                phone: "",
                address: "",
                pickup_location: "",
                dropoff_location: "",
                package_type: "",
                reservation_date: "",
                start_time: "",
                end_time: "",
                price_id: "",
                test_time: "",
                test_location: "Mandurah licensing center",
            });
            setIsBundleMode(false);
            setBundleSessions([]);
        }
        setError(null);
        setSuccessMessage(null);
    }, [reservationToEdit, isOpen]);

    // Update bundle session time
    const updateBundleSession = (index, field, value) => {
        const newSessions = [...bundleSessions];
        newSessions[index][field] = value;
        
        // Auto-calculate end time if start time changes and we have duration
        if (field === 'start_time' && selectedPackage?.duration && value) {
            const durationMinutes = parseDurationToMinutes(selectedPackage.duration);
            if (durationMinutes) {
                newSessions[index].end_time = calculateEndTime(value, durationMinutes);
            }
        }
        
        setBundleSessions(newSessions);
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "test_time" && isTestPackage() && selectedPackage) {
            const durationMinutes = parseDurationToMinutes(
                selectedPackage.duration,
            );
            if (durationMinutes) {
                const calculatedStartTime = calculateStartTimeFromTest(
                    value,
                    durationMinutes,
                );
                const calculatedEndTime = calculateEndTime(value, 60);

                setFormData((prev) => ({
                    ...prev,
                    [name]: value,
                    start_time: calculatedStartTime,
                    end_time: calculatedEndTime,
                }));
                return;
            }
        }

        if (name === "start_time" && !isTestPackage() && selectedPackage) {
            const durationMinutes = parseDurationToMinutes(
                selectedPackage.duration,
            );
            if (durationMinutes) {
                const calculatedEndTime = calculateEndTime(
                    value,
                    durationMinutes,
                );
                setFormData((prev) => ({
                    ...prev,
                    [name]: value,
                    end_time: calculatedEndTime,
                }));
                return;
            }
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Validate form
    const validateForm = () => {
        // Bundle mode validation
        if (isBundleMode && requiredSessionCount > 1) {
            for (let i = 0; i < bundleSessions.length; i++) {
                const session = bundleSessions[i];
                if (!session.reservation_date) {
                    alert(`❌ Session ${i + 1}: Date is required`);
                    return false;
                }
                if (!session.start_time) {
                    alert(`❌ Session ${i + 1}: Start time is required`);
                    return false;
                }
                if (!session.end_time) {
                    alert(`❌ Session ${i + 1}: End time is required`);
                    return false;
                }
                
                // Date validation
                const today = new Date().toISOString().split("T")[0];
                if (session.reservation_date < today) {
                    alert(`❌ Session ${i + 1}: Reservation date cannot be in the past`);
                    return false;
                }
                
                // Time validation
                if (session.start_time >= session.end_time) {
                    alert(`❌ Session ${i + 1}: End time must be after start time`);
                    return false;
                }
            }
            
            // Validate common fields
            if (!formData.user_name) {
                alert("❌ Full name is required");
                return false;
            }
            if (!formData.email) {
                alert("❌ Email is required");
                return false;
            }
            if (!formData.phone) {
                alert("❌ Phone is required");
                return false;
            }
            if (!formData.address) {
                alert("❌ Address is required");
                return false;
            }
            if (!formData.pickup_location) {
                alert("❌ Pickup location is required");
                return false;
            }
            if (!formData.dropoff_location) {
                alert("❌ Dropoff location is required");
                return false;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                alert("❌ Please enter a valid email address");
                return false;
            }
            
            // Phone validation
            if (formData.phone.length < 10) {
                alert("❌ Please enter a valid phone number");
                return false;
            }
            
            return true;
        }
        
        // Single mode validation
        const required = [
            "user_name",
            "email",
            "phone",
            "address",
            "pickup_location",
            "dropoff_location",
            "reservation_date",
            "start_time",
            "end_time",
            "package_type",
            "price_id",
        ];

        for (let field of required) {
            if (!formData[field] || formData[field].toString().trim() === "") {
                let fieldName = field;
                if (field === "package_type") fieldName = "category";
                if (field === "price_id") fieldName = "package";
                alert(`❌ ${fieldName.replace("_", " ")} is required`);
                return false;
            }
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert("❌ Please enter a valid email address");
            return false;
        }

        if (formData.phone.length < 10) {
            alert("❌ Please enter a valid phone number");
            return false;
        }

        if (formData.start_time >= formData.end_time) {
            alert("❌ End time must be after start time");
            return false;
        }

        const today = new Date().toISOString().split("T")[0];
        if (formData.reservation_date < today) {
            alert("❌ Reservation date cannot be in the past");
            return false;
        }

        if (isTestPackage()) {
            if (!formData.test_time) {
                alert("❌ Test time is required for test packages");
                return false;
            }
            if (!formData.test_location || formData.test_location.trim() === "") {
                alert("❌ Test location is required for test packages");
                return false;
            }
        }

        return true;
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        const getPackageDescription = () => {
            if (!formData.price_id) return formData.package_type;
            const selectedPkg = filteredPackages.find(
                (p) => p.id === parseInt(formData.price_id),
            );
            return selectedPkg
                ? selectedPkg.description
                : formData.package_type;
        };

        try {
            let response;

            // Bundle mode - send multiple sessions
            if (isBundleMode && requiredSessionCount > 1 && !reservationToEdit) {
                const submitData = {
                    user_name: formData.user_name,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    pickup_location: formData.pickup_location,
                    dropoff_location: formData.dropoff_location,
                    package_type: getPackageDescription(),
                    price_id: parseInt(formData.price_id),
                    bundle_sessions: bundleSessions.map(session => ({
                        reservation_date: session.reservation_date,
                        start_time: session.start_time,
                        end_time: session.end_time,
                        test_time: session.test_time,
                        test_location: session.test_location
                    }))
                };

                response = await axios.post(
                    route("ouruserreservations.store"),
                    submitData,
                );
            } 
            // Single mode
            else {
                const submitData = {
                    user_name: formData.user_name,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    pickup_location: formData.pickup_location,
                    dropoff_location: formData.dropoff_location,
                    package_type: getPackageDescription(),
                    price_id: parseInt(formData.price_id),
                    reservation_date: formData.reservation_date,
                    start_time: formData.start_time,
                    end_time: formData.end_time,
                };

                if (isTestPackage()) {
                    submitData.test_time = formData.test_time;
                    submitData.test_location = formData.test_location;
                }

                if (reservationToEdit) {
                    response = await axios.put(
                        route("ouruserreservations.update", {
                            id: reservationToEdit.id,
                        }),
                        submitData,
                    );
                } else {
                    response = await axios.post(
                        route("ouruserreservations.store"),
                        submitData,
                    );
                }
            }

            if (response.data.success) {
                const message = isBundleMode && requiredSessionCount > 1
                    ? `✓ Bundle reservation created successfully with ${requiredSessionCount} sessions!`
                    : `✓ ${reservationToEdit ? "Reservation updated" : "Reservation created"} successfully!`;
                
                alert(message);

                if (onSuccess) {
                    onSuccess(response.data.data);
                }

                setTimeout(() => {
                    onClose();
                }, 500);
            }
        } catch (err) {
            console.error("Error saving reservation:", err);

            if (err.response && err.response.data) {
                const errorMessage = err.response.data.message;
                const errors = err.response.data.errors;

                if (errors && Array.isArray(errors)) {
                    alert(`❌ Validation Error:\n${errors.join("\n")}`);
                } else if (errorMessage && errorMessage.toLowerCase().includes("blocked")) {
                    alert("❌ This time slot is already BLOCKED by administrator.\n\nPlease select a different time.");
                } else if (errorMessage && errorMessage.toLowerCase().includes("booked")) {
                    alert("❌ This time slot is already BOOKED.\n\nPlease select a different time.");
                } else if (errorMessage && errorMessage.toLowerCase().includes("reserved")) {
                    alert("❌ This time slot is already BOOKED.\n\nPlease select a different time.");
                } else {
                    alert(`❌ Error: ${errorMessage || "Failed to save reservation"}`);
                }
            } else {
                alert("❌ Failed to save reservation. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {reservationToEdit
                            ? "Edit Reservation"
                            : isBundleMode && requiredSessionCount > 1
                                ? `Add Bundle Reservation (${requiredSessionCount} Sessions)`
                                : "Add New Reservation"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
                        {successMessage}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="user_name"
                                value={formData.user_name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter full name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email *
                            </label>
                            <div className="relative">
                                <Mail
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    size={18}
                                />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone *
                            </label>
                            <div className="relative">
                                <Phone
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    size={18}
                                />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter phone number"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address *
                            </label>
                            <div className="relative">
                                <Home
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    size={18}
                                />
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter address"
                                    required
                                />
                            </div>
                        </div>

                        {/* Location Information */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pickup Location *
                            </label>
                            <input
                                type="text"
                                name="pickup_location"
                                value={formData.pickup_location}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter pickup location"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dropoff Location *
                            </label>
                            <input
                                type="text"
                                name="dropoff_location"
                                value={formData.dropoff_location}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter dropoff location"
                                required
                            />
                        </div>

                        {/* Package Category Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Package Category *
                            </label>
                            <select
                                name="package_type"
                                value={formData.package_type}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">
                                    Select a package category
                                </option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            {fetchingPrices && categories.length === 0 && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Loading categories...
                                </p>
                            )}
                        </div>

                        {/* Specific Package Selection */}
                        {formData.package_type && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Package *
                                </label>
                                <select
                                    name="price_id"
                                    value={formData.price_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                    disabled={
                                        fetchingPrices ||
                                        filteredPackages.length === 0
                                    }
                                >
                                    <option value="">Choose a package</option>
                                    {filteredPackages.map((pkg) => (
                                        <option key={pkg.id} value={pkg.id}>
                                            {pkg.description}{" "}
                                            {pkg.price ? `- $${pkg.price}` : ""}
                                        </option>
                                    ))}
                                </select>
                                {filteredPackages.length === 0 &&
                                    !fetchingPrices && (
                                        <p className="text-sm text-red-500 mt-1">
                                            No packages available in this
                                            category
                                        </p>
                                    )}
                            </div>
                        )}

                        {/* Bundle Mode - Show multiple session inputs */}
                        {isBundleMode && requiredSessionCount > 1 && !reservationToEdit && (
                            <div className="col-span-1 md:col-span-2">
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-medium text-gray-900">
                                            Bundle Sessions ({requiredSessionCount} sessions required)
                                        </h3>
                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                            Package: {selectedPackage?.description}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                        {bundleSessions.map((session, index) => (
                                            <div key={index} className="border rounded-lg p-4 bg-white">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="font-medium text-sm text-gray-700">
                                                        Session {index + 1} of {requiredSessionCount}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {selectedPackage?.duration && `Duration: ${selectedPackage.duration}`}
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Date *
                                                        </label>
                                                        <div className="relative">
                                                            <Calendar
                                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                                size={14}
                                                            />
                                                            <input
                                                                type="date"
                                                                value={session.reservation_date}
                                                                onChange={(e) => updateBundleSession(index, 'reservation_date', e.target.value)}
                                                                min={new Date().toISOString().split("T")[0]}
                                                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Start Time *
                                                        </label>
                                                        <div className="relative">
                                                            <Clock
                                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                                size={14}
                                                            />
                                                            <input
                                                                type="time"
                                                                value={session.start_time}
                                                                onChange={(e) => updateBundleSession(index, 'start_time', e.target.value)}
                                                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            End Time *
                                                        </label>
                                                        <div className="relative">
                                                            <Clock
                                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                                size={14}
                                                            />
                                                            <input
                                                                type="time"
                                                                value={session.end_time}
                                                                onChange={(e) => updateBundleSession(index, 'end_time', e.target.value)}
                                                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                                                                required
                                                                readOnly={!!selectedPackage?.duration}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Test fields for test packages */}
                                                {isTestPackage() && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                Test Time
                                                            </label>
                                                            <div className="relative">
                                                                <Clock
                                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                                    size={14}
                                                                />
                                                                <input
                                                                    type="time"
                                                                    value={session.test_time}
                                                                    onChange={(e) => updateBundleSession(index, 'test_time', e.target.value)}
                                                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                Test Location
                                                            </label>
                                                            <div className="relative">
                                                                <MapPin
                                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                                    size={14}
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={session.test_location}
                                                                    onChange={(e) => updateBundleSession(index, 'test_location', e.target.value)}
                                                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg"
                                                                    placeholder="Test location"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-xs text-yellow-700">
                                            ⚠️ <span className="font-medium">Important:</span> Each session will be created as a separate reservation. 
                                            Please ensure all dates and times are correct before submitting.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Single Mode - Regular date and time inputs */}
                        {(!isBundleMode || requiredSessionCount === 1 || reservationToEdit) && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reservation Date *
                                    </label>
                                    <div className="relative">
                                        <Calendar
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                            size={18}
                                        />
                                        <input
                                            type="date"
                                            name="reservation_date"
                                            value={formData.reservation_date}
                                            onChange={handleChange}
                                            min={new Date().toISOString().split("T")[0]}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Test fields - Only show for test packages */}
                                {isTestPackage() && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Test Location *
                                            </label>
                                            <div className="relative">
                                                <MapPin
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                    size={18}
                                                />
                                                <input
                                                    type="text"
                                                    name="test_location"
                                                    value={formData.test_location}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter test location"
                                                    required={isTestPackage()}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Test Time *
                                            </label>
                                            <div className="relative">
                                                <Clock
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                    size={18}
                                                />
                                                <input
                                                    type="time"
                                                    name="test_time"
                                                    value={formData.test_time}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required={isTestPackage()}
                                                />
                                            </div>
                                            {selectedPackage && selectedPackage.duration && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Start time will be automatically calculated{" "}
                                                    {selectedPackage.duration} before test time
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* Regular start and end times */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Time *
                                    </label>
                                    <div className="relative">
                                        <Clock
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                            size={18}
                                        />
                                        <input
                                            type="time"
                                            name="start_time"
                                            value={formData.start_time}
                                            onChange={handleChange}
                                            step="60"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                            readOnly={isTestPackage()}
                                            disabled={isTestPackage()}
                                        />
                                    </div>
                                    {!isTestPackage() && selectedPackage && selectedPackage.duration && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            End time will be automatically calculated based on{" "}
                                            {selectedPackage.duration}
                                        </p>
                                    )}
                                    {isTestPackage() && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Start time is automatically calculated based on test time
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Time *
                                    </label>
                                    <div className="relative">
                                        <Clock
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                            size={18}
                                        />
                                        <input
                                            type="time"
                                            name="end_time"
                                            value={formData.end_time}
                                            onChange={handleChange}
                                            step="60"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                            required
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                    {isTestPackage() && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            End time is set to 1 hour after test time
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Selected Package Summary */}
                    {selectedPackage && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h3 className="font-medium text-green-800 mb-2">
                                Selected Package Details:
                            </h3>
                            <p className="text-sm text-green-600">
                                <span className="font-medium">Category:</span>{" "}
                                {selectedPackage.category}
                                <br />
                                <span className="font-medium">Package:</span>{" "}
                                {selectedPackage.description}
                                <br />
                                {selectedPackage.price && (
                                    <>
                                        <span className="font-medium">Price:</span> $
                                        {selectedPackage.price}
                                        <br />
                                    </>
                                )}
                                {selectedPackage.duration && (
                                    <>
                                        <span className="font-medium">Duration:</span>{" "}
                                        {selectedPackage.duration}
                                        <br />
                                    </>
                                )}
                                {isBundleMode && requiredSessionCount > 1 && (
                                    <>
                                        <span className="font-medium">Total Sessions:</span>{" "}
                                        {requiredSessionCount}
                                        <br />
                                    </>
                                )}
                            </p>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${
                                loading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    {reservationToEdit
                                        ? "Updating..."
                                        : isBundleMode && requiredSessionCount > 1
                                            ? `Creating ${requiredSessionCount} Sessions...`
                                            : "Creating..."}
                                </>
                            ) : (
                                <>
                                    {reservationToEdit
                                        ? "Update Reservation"
                                        : isBundleMode && requiredSessionCount > 1
                                            ? `Create Bundle (${requiredSessionCount} Sessions)`
                                            : "Create Reservation"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddReservationForm;
