import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Calendar, Clock, Mail, Phone, Home, MapPin } from "lucide-react";

const AddReservationForm = ({ isOpen, onClose, reservationToEdit, onSuccess }) => {
    const [formData, setFormData] = useState({
        user_name: "",
        email: "",
        phone: "",
        address: "",
        pickup_location: "",
        dropoff_location: "",
        package_type: "", // This should be a STRING (category)
        reservation_date: "",
        start_time: "",
        end_time: "",
        price_id: "", // This should be a NUMBER (package ID)
        test_time: "",
        test_location: "Mandurah licensing center", // Pre-filled with default value
    });

    const [prices, setPrices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filteredPackages, setFilteredPackages] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchingPrices, setFetchingPrices] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Define test package categories (updated to use "packages" terminology)
    const testPackageCategories = [
        "Driving Test Packages",
        "Test Packages",
        "Driving Test",
        "PDA Test Packages",
        "Road Test Packages",
        // Add any other test-related category names from your system
    ];

    // Check if selected category is a test package
    const isTestPackage = () => {
        return testPackageCategories.some(
            category => category.toLowerCase() === formData.package_type?.toLowerCase()
        );
    };

    // ======================================
    // FETCH PRICES FOR DROPDOWN
    // ======================================
    useEffect(() => {
        const fetchPrices = async () => {
            try {
                setFetchingPrices(true);
                const response = await axios.get(route("ourprice.index"));
                const pricesData = response.data.data;
                setPrices(pricesData);
                
                // Extract unique categories from prices
                const uniqueCategories = [...new Set(pricesData
                    .map(price => price.category)
                    .filter(category => category) // Remove null/undefined
                )];
                setCategories(uniqueCategories);
                
            } catch (err) {
                console.error("Error fetching prices:", err);
                setError("Failed to load price packages");
            } finally {
                setFetchingPrices(false);
            }
        };

        if (isOpen) {
            fetchPrices();
        }
    }, [isOpen]);


    

    // ======================================
    // FILTER PACKAGES BASED ON SELECTED CATEGORY (package_type)
    // ======================================
    useEffect(() => {
        if (formData.package_type && prices.length > 0) {
            const filtered = prices.filter(price => 
                price.category && price.category === formData.package_type
            );
            setFilteredPackages(filtered);
            
            // Reset selected package when category changes
            setFormData(prev => ({ ...prev, price_id: "" }));
            setSelectedPackage(null);
            
            // Clear test fields if category is not a test package
            if (!testPackageCategories.some(
                category => category.toLowerCase() === formData.package_type?.toLowerCase()
            )) {
                setFormData(prev => ({
                    ...prev,
                    test_time: "",
                    test_location: "Mandurah licensing center" // Reset to default
                }));
            }
        } else {
            setFilteredPackages([]);
        }
    }, [formData.package_type, prices]);

    // ======================================
    // UPDATE SELECTED PACKAGE DETAILS WHEN price_id CHANGES
    // ======================================
    useEffect(() => {
        if (formData.price_id && prices.length > 0) {
            // Convert to number for comparison since price_id comes as string from form
            const package_ = prices.find(p => p.id === parseInt(formData.price_id));
            setSelectedPackage(package_ || null);
            
            // Debug log to see package details
            if (package_) {
                console.log("Selected package details:", package_);
            }
        } else {
            setSelectedPackage(null);
        }
    }, [formData.price_id, prices]);

    // ======================================
    // POPULATE FORM WHEN EDITING
    // ======================================
    useEffect(() => {
        if (reservationToEdit) {
            console.log("Editing reservation:", reservationToEdit); // Debug log
            
            setFormData({
                user_name: reservationToEdit.user_name || "",
                email: reservationToEdit.email || "",
                phone: reservationToEdit.phone || "",
                address: reservationToEdit.address || "",
                pickup_location: reservationToEdit.pickup_location || "",
                dropoff_location: reservationToEdit.dropoff_location || "",
                package_type: reservationToEdit.package_type || "", // String (category)
                reservation_date: reservationToEdit.reservation_date 
                    ? new Date(reservationToEdit.reservation_date).toISOString().split('T')[0] 
                    : "",
                start_time: reservationToEdit.start_time || "",
                end_time: reservationToEdit.end_time || "",
                price_id: reservationToEdit.price_id ? reservationToEdit.price_id.toString() : "", // Package ID as string for select element
                test_time: reservationToEdit.test_time || "",
                test_location: reservationToEdit.test_location || "Mandurah licensing center", // Use existing value or default
            });
        } else {
            // Reset form when adding new - keep test_location default value
            setFormData({
                user_name: "",
                email: "",
                phone: "",
                address: "",
                pickup_location: "",
                dropoff_location: "",
                package_type: "", // Will store category (string)
                reservation_date: "",
                start_time: "",
                end_time: "",
                price_id: "", // Will store package ID (number)
                test_time: "",
                test_location: "Mandurah licensing center", // Pre-filled default
            });
        }
        // Clear messages
        setError(null);
        setSuccessMessage(null);
    }, [reservationToEdit, isOpen]);

    // ======================================
    // HANDLE INPUT CHANGES
    // ======================================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Debug logs
        if (name === 'package_type') {
            console.log('Category (package_type) changed to:', value);
        }
        if (name === 'price_id') {
            console.log('Package ID (price_id) changed to:', value);
        }
    };

    // ======================================
    // VALIDATE FORM
    // ======================================
    const validateForm = () => {
        const required = [
            'user_name', 'email', 'phone', 'address', 
            'pickup_location', 'dropoff_location', 
            'reservation_date', 'start_time', 'end_time', 
            'package_type', 'price_id'
        ];
        
        for (let field of required) {
            if (!formData[field] || formData[field].trim() === '') {
                let fieldName = field;
                if (field === 'package_type') fieldName = 'category';
                if (field === 'price_id') fieldName = 'package';
                setError(`${fieldName.replace('_', ' ')} is required`);
                return false;
            }
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }

        // Phone validation (basic)
        if (formData.phone.length < 10) {
            setError('Please enter a valid phone number');
            return false;
        }

        // Time validation (end time should be after start time)
        if (formData.start_time >= formData.end_time) {
            setError('End time must be after start time');
            return false;
        }

        // Date validation (can't be in the past)
        const today = new Date().toISOString().split('T')[0];
        if (formData.reservation_date < today) {
            setError('Reservation date cannot be in the past');
            return false;
        }

        // Validate test fields if it's a test package
        if (isTestPackage()) {
            if (!formData.test_time) {
                setError('Test time is required for test packages');
                return false;
            }
            if (!formData.test_location || formData.test_location.trim() === '') {
                setError('Test location is required for test packages');
                return false;
            }
        }

        return true;
    };

    // ======================================
    // HANDLE FORM SUBMIT
    // ======================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        // Prepare data for submission - matching backend expectations
        const submitData = {
            ...formData,
            // price_id should be sent as a number (package ID)
            price_id: parseInt(formData.price_id),
            // package_type should be sent as a string (category)
            package_type: formData.package_type // Already a string
        };

        // If it's not a test package, clear test fields
        if (!isTestPackage()) {
            submitData.test_time = "";
            submitData.test_location = "";
        }

        console.log("Submitting data:", submitData); // Debug log

        try {
            let response;
            
            if (reservationToEdit) {
                // Update existing reservation
                response = await axios.put(
                    route("ouruserreservations.update", { id: reservationToEdit.id }),
                    submitData
                );
            } else {
                // Create new reservation
                response = await axios.post(
                    route("ouruserreservations.store"),
                    submitData
                );
            }

            if (response.data.success) {
                setSuccessMessage(
                    reservationToEdit 
                        ? "Reservation updated successfully!" 
                        : "Reservation created successfully!"
                );
                
                // Call success callback
                if (onSuccess) {
                    onSuccess(response.data.data);
                }
                
                // Close form after a delay
                setTimeout(() => {
                    onClose();
                }, 1500);
            }
        } catch (err) {
            console.error("Error saving reservation:", err);
            
            if (err.response && err.response.data) {
                // Display validation errors
                const errors = err.response.data.errors;
                if (errors) {
                    const errorMessages = Object.values(errors).flat().join(', ');
                    setError(errorMessages);
                } else {
                    setError(err.response.data.message || "Failed to save reservation");
                }
            } else {
                setError("Failed to save reservation. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 h-[600px] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {reservationToEdit ? "Edit Reservation" : "Add New Reservation"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
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
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
                                <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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

                        {/* Package Category Selection - stored in package_type (string) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Package Category *
                            </label>
                            <select
                                name="package_type" // This stores the category (string)
                                value={formData.package_type}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select a package category</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            {fetchingPrices && categories.length === 0 && (
                                <p className="text-sm text-gray-500 mt-1">Loading categories...</p>
                            )}
                        </div>

                        {/* Specific Package Selection - stored in price_id (number) */}
                        {formData.package_type && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Package *
                                </label>
                                <select
                                    name="price_id" // This stores the package ID (number)
                                    value={formData.price_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                    disabled={fetchingPrices || filteredPackages.length === 0}
                                >
                                    <option value="">Choose a package</option>
                                    {filteredPackages.map(pkg => (
                                        <option key={pkg.id} value={pkg.id}>
                                            {pkg.description}
                                        </option>
                                    ))}
                                </select>
                                {fetchingPrices && (
                                    <p className="text-sm text-gray-500 mt-1">Loading packages...</p>
                                )}
                                {filteredPackages.length === 0 && !fetchingPrices && (
                                    <p className="text-sm text-red-500 mt-1">No packages available in this category</p>
                                )}
                            </div>
                        )}

                        {/* Date and Time Information */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reservation Date *
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="date"
                                    name="reservation_date"
                                    value={formData.reservation_date}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
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
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
                                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="time"
                                            name="test_time"
                                            value={formData.test_time}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required={isTestPackage()}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Regular start and end times (always shown) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Time *
                            </label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="time"
                                    name="start_time"
                                    value={formData.start_time}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Time *
                            </label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="time"
                                    name="end_time"
                                    value={formData.end_time}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
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
                                    {reservationToEdit ? "Updating..." : "Creating..."}
                                </>
                            ) : (
                                <>{reservationToEdit ? "Update Reservation" : "Create Reservation"}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddReservationForm;