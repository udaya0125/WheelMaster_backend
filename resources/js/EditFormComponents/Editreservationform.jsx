import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { X, Calendar, Clock, Mail, Phone, Home, MapPin } from "lucide-react";

const EditReservationForm = ({
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
    const [isManualEndTime, setIsManualEndTime] = useState(false); // Track if end time was manually set

    // ─── scroll lock ────────────────────────────────────────────────────────────
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

    // ─── constants ──────────────────────────────────────────────────────────────
    const testPackageCategories = [
        "Driving Test Packages",
        "Test Packages",
        "Driving Test",
        "PDA Test Packages",
        "Road Test Packages",
    ];

    const isTestPackage = useCallback(() => {
        return testPackageCategories.some(
            (cat) => cat.toLowerCase() === formData.package_type?.toLowerCase(),
        );
    }, [formData.package_type]);

    // ─── helpers ────────────────────────────────────────────────────────────────
    const parseDurationToMinutes = (duration) => {
        if (!duration) return null;
        const s = duration.toString().toLowerCase();
        const h = s.match(/(\d+(?:\.\d+)?)\s*hours?/);
        if (h) return parseFloat(h[1]) * 60;
        const m = s.match(/(\d+)\s*minutes?/);
        if (m) return parseInt(m[1]);
        return null;
    };

    const calculateEndTime = (startTime, durationMinutes) => {
        if (!startTime || !durationMinutes) return "";
        const [hh, mm] = startTime.split(":").map(Number);
        const d = new Date();
        d.setHours(hh, mm, 0, 0);
        const e = new Date(d.getTime() + durationMinutes * 60000);
        return `${String(e.getHours()).padStart(2, "0")}:${String(e.getMinutes()).padStart(2, "0")}`;
    };

    const calculateStartTimeFromTest = (testTime, durationMinutes) => {
        if (!testTime || !durationMinutes) return "";
        const [hh, mm] = testTime.split(":").map(Number);
        const d = new Date();
        d.setHours(hh, mm, 0, 0);
        const s = new Date(d.getTime() - durationMinutes * 60000);
        return `${String(s.getHours()).padStart(2, "0")}:${String(s.getMinutes()).padStart(2, "0")}`;
    };

    const extractLessonCount = (description) => {
        if (!description) return 1;
        const match = description.match(/^(\d+)\s*x\s*/);
        return match ? parseInt(match[1]) : 1;
    };

    // ─── fetch prices on open ───────────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) return;
        const fetchPrices = async () => {
            try {
                setFetchingPrices(true);
                const response = await axios.get(route("ourprice.index"));
                const pricesData = response.data.data;
                setPrices(pricesData);
                const uniqueCategories = [
                    ...new Set(pricesData.map((p) => p.category).filter(Boolean)),
                ];
                setCategories(uniqueCategories);
            } catch (err) {
                console.error("Error fetching prices:", err);
                alert("Failed to load price packages. Please refresh the page.");
            } finally {
                setFetchingPrices(false);
            }
        };
        fetchPrices();
    }, [isOpen]);

    // ─── populate form with existing reservation data when modal opens ───────────
    useEffect(() => {
        if (!isOpen || !reservationToEdit) return;

        setFormData({
            user_name: reservationToEdit.user_name || "",
            email: reservationToEdit.email || "",
            phone: reservationToEdit.phone || "",
            address: reservationToEdit.address || "",
            pickup_location: reservationToEdit.pickup_location || "",
            dropoff_location: reservationToEdit.dropoff_location || "",
            package_type: "",   // will be restored once prices are loaded
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
                reservationToEdit.test_location || "Mandurah licensing center",
        });

        setFilteredPackages([]);
        setSelectedPackage(null);
        setError(null);
        setSuccessMessage(null);
        setIsManualEndTime(false); // Reset manual flag when editing a new reservation
    }, [reservationToEdit, isOpen]);

    // ─── KEY FIX: restore category + filtered packages once prices are loaded ────
    // The backend stores the package DESCRIPTION in `package_type`, not the
    // category name, so we look up the real category via price_id.
    useEffect(() => {
        if (!reservationToEdit || prices.length === 0) return;
        if (!reservationToEdit.price_id) return;

        const matchedPrice = prices.find(
            (p) => p.id === parseInt(reservationToEdit.price_id),
        );
        if (!matchedPrice) return;

        const realCategory = matchedPrice.category;
        const filtered = prices.filter((p) => p.category === realCategory);

        setFilteredPackages(filtered);
        setSelectedPackage(matchedPrice);

        setFormData((prev) => ({
            ...prev,
            package_type: realCategory,
            price_id: reservationToEdit.price_id.toString(),
        }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prices, reservationToEdit]);

    // ─── auto-calculate times (only if end time wasn't manually changed) ───────────────────────────────────
    useEffect(() => {
        if (isManualEndTime) return; // Skip auto-calculation if user manually set end time
        
        if (!selectedPackage?.duration) return;
        const durationMinutes = parseDurationToMinutes(selectedPackage.duration);
        if (!durationMinutes) return;

        if (isTestPackage() && formData.test_time) {
            const calcStart = calculateStartTimeFromTest(formData.test_time, durationMinutes);
            const calcEnd   = calculateEndTime(formData.test_time, 60);
            setFormData((prev) => {
                if (prev.start_time === calcStart && prev.end_time === calcEnd) return prev;
                return { ...prev, start_time: calcStart, end_time: calcEnd };
            });
        } else if (!isTestPackage() && formData.start_time) {
            const calcEnd = calculateEndTime(formData.start_time, durationMinutes);
            setFormData((prev) => {
                if (prev.end_time === calcEnd) return prev;
                return { ...prev, end_time: calcEnd };
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPackage?.id, formData.test_time, formData.start_time, formData.package_type, isManualEndTime]);

    // ─── category change handler ──────────────────────────────────────────────────
    const handleCategoryChange = (newCategory) => {
        const filtered = prices.filter((p) => p.category === newCategory);
        setFilteredPackages(filtered);
        setSelectedPackage(null);
        setIsManualEndTime(false); // Reset manual flag when category changes
        setFormData((prev) => ({
            ...prev,
            package_type: newCategory,
            price_id: "",
            start_time: "",
            end_time: "",
            test_time: testPackageCategories.some(
                (c) => c.toLowerCase() === newCategory.toLowerCase(),
            )
                ? prev.test_time
                : "",
            test_location: "Mandurah licensing center",
        }));
    };

    // ─── package change handler ───────────────────────────────────────────────────
    const handlePackageChange = (newPriceId) => {
        const pkg = prices.find((p) => p.id === parseInt(newPriceId));
        setSelectedPackage(pkg || null);
        setIsManualEndTime(false); // Reset manual flag when package changes

        setFormData((prev) => ({
            ...prev,
            price_id: newPriceId,
            // Preserve existing times when editing; only reset if package truly changed
        }));
    };

    // ─── generic field change ───────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "package_type") { handleCategoryChange(value); return; }
        if (name === "price_id")     { handlePackageChange(value);  return; }

        if (name === "end_time") {
            // User manually changed end time
            setIsManualEndTime(true);
            setFormData((prev) => ({ ...prev, [name]: value }));
            return;
        }

        if (name === "test_time" && isTestPackage() && selectedPackage) {
            const mins = parseDurationToMinutes(selectedPackage.duration);
            if (mins) {
                setIsManualEndTime(false); // Reset manual flag when test time changes
                setFormData((prev) => ({
                    ...prev,
                    test_time:  value,
                    start_time: calculateStartTimeFromTest(value, mins),
                    end_time:   calculateEndTime(value, 60),
                }));
                return;
            }
        }

        if (name === "start_time" && !isTestPackage() && selectedPackage) {
            const mins = parseDurationToMinutes(selectedPackage.duration);
            if (mins) {
                setIsManualEndTime(false); // Reset manual flag when start time changes
                setFormData((prev) => ({
                    ...prev,
                    start_time: value,
                    end_time:   calculateEndTime(value, mins),
                }));
                return;
            }
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ─── validation ─────────────────────────────────────────────────────────────
    const validateForm = () => {
        const required = [
            "user_name","email","phone","address",
            "pickup_location","dropoff_location",
            "reservation_date","start_time","end_time",
            "package_type","price_id",
        ];
        for (const field of required) {
            if (!formData[field] || !formData[field].toString().trim()) {
                const label = field === "package_type" ? "category"
                            : field === "price_id"     ? "package"
                            : field;
                alert(`❌ ${label.replace(/_/g, " ")} is required`);
                return false;
            }
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { alert("❌ Please enter a valid email"); return false; }
        if (formData.phone.length < 10) { alert("❌ Please enter a valid phone number"); return false; }
        if (formData.start_time >= formData.end_time) { alert("❌ End time must be after start time"); return false; }
        const today = new Date().toISOString().split("T")[0];
        if (formData.reservation_date < today) { alert("❌ Reservation date cannot be in the past"); return false; }
        if (isTestPackage()) {
            if (!formData.test_time)          { alert("❌ Test time is required for test packages"); return false; }
            if (!formData.test_location?.trim()) { alert("❌ Test location is required for test packages"); return false; }
        }
        return true;
    };

    // ─── submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        const packageDescription = selectedPackage?.description || formData.package_type;

        try {
            const submitData = {
                user_name:        formData.user_name,
                email:            formData.email,
                phone:            formData.phone,
                address:          formData.address,
                pickup_location:  formData.pickup_location,
                dropoff_location: formData.dropoff_location,
                package_type:     packageDescription,
                price_id:         parseInt(formData.price_id),
                reservation_date: formData.reservation_date,
                start_time:       formData.start_time,
                end_time:         formData.end_time,
                ...(isTestPackage() && {
                    test_time:     formData.test_time,
                    test_location: formData.test_location,
                }),
            };

            const response = await axios.put(
                route("ouruserreservations.update", { id: reservationToEdit.id }),
                submitData,
            );

            if (response.data.success) {
                alert("✓ Reservation updated successfully!");
                if (onSuccess) onSuccess(response.data.data);
                setTimeout(() => onClose(), 500);
            }
        } catch (err) {
            console.error("Error updating reservation:", err);
            if (err.response?.data) {
                const { message: msg, errors: errs } = err.response.data;
                if (errs && Array.isArray(errs)) {
                    alert(`❌ Validation Error:\n${errs.join("\n")}`);
                } else if (msg?.toLowerCase().includes("blocked")) {
                    alert("❌ This time slot is already BLOCKED by administrator.\n\nPlease select a different time.");
                } else if (msg?.toLowerCase().includes("booked") || msg?.toLowerCase().includes("reserved")) {
                    alert("❌ This time slot is already BOOKED.\n\nPlease select a different time.");
                } else {
                    alert(`❌ Error: ${msg || "Failed to update reservation"}`);
                }
            } else {
                alert("❌ Failed to update reservation. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !reservationToEdit) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Edit Reservation
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {successMessage && (
                    <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* ── Personal Info ── */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                            <input type="text" name="user_name" value={formData.user_name} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter full name" required />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="email" name="email" value={formData.email} onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="email@example.com" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter phone number" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                            <div className="relative">
                                <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" name="address" value={formData.address} onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter address" required />
                            </div>
                        </div>

                        {/* ── Locations ── */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location *</label>
                            <input type="text" name="pickup_location" value={formData.pickup_location} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter pickup location" required />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Dropoff Location *</label>
                            <input type="text" name="dropoff_location" value={formData.dropoff_location} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter dropoff location" required />
                        </div>

                        {/* ── Package Category ── */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Package Category *</label>
                            <select name="package_type" value={formData.package_type} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required>
                                <option value="">Select a package category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            {fetchingPrices && categories.length === 0 && (
                                <p className="text-sm text-gray-500 mt-1">Loading categories...</p>
                            )}
                        </div>

                        {/* ── Specific Package ── */}
                        {formData.package_type && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Package *</label>
                                <select name="price_id" value={formData.price_id} onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                    disabled={fetchingPrices || filteredPackages.length === 0}>
                                    <option value="">Choose a package</option>
                                    {filteredPackages.map((pkg) => (
                                        <option key={pkg.id} value={pkg.id}>
                                            {pkg.description}{pkg.price ? ` - $${pkg.price}` : ""}
                                        </option>
                                    ))}
                                </select>
                                {filteredPackages.length === 0 && !fetchingPrices && (
                                    <p className="text-sm text-red-500 mt-1">No packages available in this category</p>
                                )}
                            </div>
                        )}

                        {/* ── Date / Time fields ── */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Reservation Date *</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="date" name="reservation_date" value={formData.reservation_date}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split("T")[0]}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required />
                            </div>
                        </div>

                        {isTestPackage() && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Test Location *</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" name="test_location" value={formData.test_location}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter test location" required={isTestPackage()} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Test Time *</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="time" name="test_time" value={formData.test_time}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required={isTestPackage()} />
                                    </div>
                                    {selectedPackage?.duration && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Start time will be automatically calculated {selectedPackage.duration} before test time
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="time" name="start_time" value={formData.start_time}
                                    onChange={handleChange} step="60"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required readOnly={isTestPackage()} disabled={isTestPackage()} />
                            </div>
                            {!isTestPackage() && selectedPackage?.duration && (
                                <p className="text-xs text-gray-500 mt-1">
                                    End time will be automatically calculated based on {selectedPackage.duration}
                                </p>
                            )}
                            {isTestPackage() && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Start time is automatically calculated based on test time
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="time" name="end_time" value={formData.end_time}
                                    onChange={handleChange} step="60"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required />
                            </div>
                            {isTestPackage() && !isManualEndTime && (
                                <p className="text-xs text-gray-500 mt-1">End time is set to 1 hour after test time (you can manually change it)</p>
                            )}
                            {!isTestPackage() && !isManualEndTime && selectedPackage?.duration && (
                                <p className="text-xs text-gray-500 mt-1">End time is automatically calculated (you can manually change it)</p>
                            )}
                            {isManualEndTime && (
                                <p className="text-xs text-blue-500 mt-1">Manual override - auto-calculation disabled</p>
                            )}
                        </div>
                    </div>

                    {/* ── Selected Package Summary ── */}
                    {selectedPackage && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h3 className="font-medium text-green-800 mb-2">Selected Package Details:</h3>
                            <p className="text-sm text-green-600">
                                <span className="font-medium">Category:</span> {selectedPackage.category}<br />
                                <span className="font-medium">Package:</span> {selectedPackage.description}<br />
                                {selectedPackage.price && (
                                    <><span className="font-medium">Price:</span> ${selectedPackage.price}<br /></>
                                )}
                                {selectedPackage.duration && (
                                    <><span className="font-medium">Duration:</span> {selectedPackage.duration}<br /></>
                                )}
                            </p>
                        </div>
                    )}

                    {/* ── Actions ── */}
                    <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                        <button type="button" onClick={onClose} disabled={loading}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    Updating...
                                </>
                            ) : (
                                "Update Reservation"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditReservationForm;



// import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios";
// import { X, Calendar, Clock, Mail, Phone, Home, MapPin } from "lucide-react";

// const EditReservationForm = ({
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
//         package_type: "",   // holds the CATEGORY value for the dropdown
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

//     // ─── scroll lock ────────────────────────────────────────────────────────────
//     useEffect(() => {
//         if (isOpen) {
//             const scrollY = window.scrollY;
//             document.body.style.position = "fixed";
//             document.body.style.top = `-${scrollY}px`;
//             document.body.style.width = "100%";
//             document.body.style.overflow = "hidden";
//             return () => {
//                 document.body.style.position = "";
//                 document.body.style.top = "";
//                 document.body.style.width = "";
//                 document.body.style.overflow = "";
//                 window.scrollTo(0, scrollY);
//             };
//         }
//     }, [isOpen]);

//     // ─── constants ──────────────────────────────────────────────────────────────
//     const testPackageCategories = [
//         "Driving Test Packages",
//         "Test Packages",
//         "Driving Test",
//         "PDA Test Packages",
//         "Road Test Packages",
//     ];

//     const isTestPackage = useCallback(() => {
//         return testPackageCategories.some(
//             (cat) => cat.toLowerCase() === formData.package_type?.toLowerCase(),
//         );
//     }, [formData.package_type]);

//     // ─── helpers ────────────────────────────────────────────────────────────────
//     const parseDurationToMinutes = (duration) => {
//         if (!duration) return null;
//         const s = duration.toString().toLowerCase();
//         const h = s.match(/(\d+(?:\.\d+)?)\s*hours?/);
//         if (h) return parseFloat(h[1]) * 60;
//         const m = s.match(/(\d+)\s*minutes?/);
//         if (m) return parseInt(m[1]);
//         return null;
//     };

//     const calculateEndTime = (startTime, durationMinutes) => {
//         if (!startTime || !durationMinutes) return "";
//         const [hh, mm] = startTime.split(":").map(Number);
//         const d = new Date();
//         d.setHours(hh, mm, 0, 0);
//         const e = new Date(d.getTime() + durationMinutes * 60000);
//         return `${String(e.getHours()).padStart(2, "0")}:${String(e.getMinutes()).padStart(2, "0")}`;
//     };

//     const calculateStartTimeFromTest = (testTime, durationMinutes) => {
//         if (!testTime || !durationMinutes) return "";
//         const [hh, mm] = testTime.split(":").map(Number);
//         const d = new Date();
//         d.setHours(hh, mm, 0, 0);
//         const s = new Date(d.getTime() - durationMinutes * 60000);
//         return `${String(s.getHours()).padStart(2, "0")}:${String(s.getMinutes()).padStart(2, "0")}`;
//     };

//     const extractLessonCount = (description) => {
//         if (!description) return 1;
//         const match = description.match(/^(\d+)\s*x\s*/);
//         return match ? parseInt(match[1]) : 1;
//     };

//     // ─── fetch prices on open ───────────────────────────────────────────────────
//     useEffect(() => {
//         if (!isOpen) return;
//         const fetchPrices = async () => {
//             try {
//                 setFetchingPrices(true);
//                 const response = await axios.get(route("ourprice.index"));
//                 const pricesData = response.data.data;
//                 setPrices(pricesData);
//                 const uniqueCategories = [
//                     ...new Set(pricesData.map((p) => p.category).filter(Boolean)),
//                 ];
//                 setCategories(uniqueCategories);
//             } catch (err) {
//                 console.error("Error fetching prices:", err);
//                 alert("Failed to load price packages. Please refresh the page.");
//             } finally {
//                 setFetchingPrices(false);
//             }
//         };
//         fetchPrices();
//     }, [isOpen]);

//     // ─── populate form with existing reservation data when modal opens ───────────
//     useEffect(() => {
//         if (!isOpen || !reservationToEdit) return;

//         setFormData({
//             user_name: reservationToEdit.user_name || "",
//             email: reservationToEdit.email || "",
//             phone: reservationToEdit.phone || "",
//             address: reservationToEdit.address || "",
//             pickup_location: reservationToEdit.pickup_location || "",
//             dropoff_location: reservationToEdit.dropoff_location || "",
//             package_type: "",   // will be restored once prices are loaded
//             reservation_date: reservationToEdit.reservation_date
//                 ? new Date(reservationToEdit.reservation_date)
//                       .toISOString()
//                       .split("T")[0]
//                 : "",
//             start_time: reservationToEdit.start_time || "",
//             end_time: reservationToEdit.end_time || "",
//             price_id: reservationToEdit.price_id
//                 ? reservationToEdit.price_id.toString()
//                 : "",
//             test_time: reservationToEdit.test_time || "",
//             test_location:
//                 reservationToEdit.test_location || "Mandurah licensing center",
//         });

//         setFilteredPackages([]);
//         setSelectedPackage(null);
//         setError(null);
//         setSuccessMessage(null);
//     }, [reservationToEdit, isOpen]);

//     // ─── KEY FIX: restore category + filtered packages once prices are loaded ────
//     // The backend stores the package DESCRIPTION in `package_type`, not the
//     // category name, so we look up the real category via price_id.
//     useEffect(() => {
//         if (!reservationToEdit || prices.length === 0) return;
//         if (!reservationToEdit.price_id) return;

//         const matchedPrice = prices.find(
//             (p) => p.id === parseInt(reservationToEdit.price_id),
//         );
//         if (!matchedPrice) return;

//         const realCategory = matchedPrice.category;
//         const filtered = prices.filter((p) => p.category === realCategory);

//         setFilteredPackages(filtered);
//         setSelectedPackage(matchedPrice);

//         setFormData((prev) => ({
//             ...prev,
//             package_type: realCategory,
//             price_id: reservationToEdit.price_id.toString(),
//         }));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [prices, reservationToEdit]);

//     // ─── auto-calculate times ───────────────────────────────────────────────────
//     useEffect(() => {
//         if (!selectedPackage?.duration) return;
//         const durationMinutes = parseDurationToMinutes(selectedPackage.duration);
//         if (!durationMinutes) return;

//         if (isTestPackage() && formData.test_time) {
//             const calcStart = calculateStartTimeFromTest(formData.test_time, durationMinutes);
//             const calcEnd   = calculateEndTime(formData.test_time, 60);
//             setFormData((prev) => {
//                 if (prev.start_time === calcStart && prev.end_time === calcEnd) return prev;
//                 return { ...prev, start_time: calcStart, end_time: calcEnd };
//             });
//         } else if (!isTestPackage() && formData.start_time) {
//             const calcEnd = calculateEndTime(formData.start_time, durationMinutes);
//             setFormData((prev) => {
//                 if (prev.end_time === calcEnd) return prev;
//                 return { ...prev, end_time: calcEnd };
//             });
//         }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [selectedPackage?.id, formData.test_time, formData.start_time, formData.package_type]);

//     // ─── category change handler ──────────────────────────────────────────────────
//     const handleCategoryChange = (newCategory) => {
//         const filtered = prices.filter((p) => p.category === newCategory);
//         setFilteredPackages(filtered);
//         setSelectedPackage(null);
//         setFormData((prev) => ({
//             ...prev,
//             package_type: newCategory,
//             price_id: "",
//             start_time: "",
//             end_time: "",
//             test_time: testPackageCategories.some(
//                 (c) => c.toLowerCase() === newCategory.toLowerCase(),
//             )
//                 ? prev.test_time
//                 : "",
//             test_location: "Mandurah licensing center",
//         }));
//     };

//     // ─── package change handler ───────────────────────────────────────────────────
//     const handlePackageChange = (newPriceId) => {
//         const pkg = prices.find((p) => p.id === parseInt(newPriceId));
//         setSelectedPackage(pkg || null);

//         setFormData((prev) => ({
//             ...prev,
//             price_id: newPriceId,
//             // Preserve existing times when editing; only reset if package truly changed
//         }));
//     };

//     // ─── generic field change ───────────────────────────────────────────────────
//     const handleChange = (e) => {
//         const { name, value } = e.target;

//         if (name === "package_type") { handleCategoryChange(value); return; }
//         if (name === "price_id")     { handlePackageChange(value);  return; }

//         if (name === "test_time" && isTestPackage() && selectedPackage) {
//             const mins = parseDurationToMinutes(selectedPackage.duration);
//             if (mins) {
//                 setFormData((prev) => ({
//                     ...prev,
//                     test_time:  value,
//                     start_time: calculateStartTimeFromTest(value, mins),
//                     end_time:   calculateEndTime(value, 60),
//                 }));
//                 return;
//             }
//         }

//         if (name === "start_time" && !isTestPackage() && selectedPackage) {
//             const mins = parseDurationToMinutes(selectedPackage.duration);
//             if (mins) {
//                 setFormData((prev) => ({
//                     ...prev,
//                     start_time: value,
//                     end_time:   calculateEndTime(value, mins),
//                 }));
//                 return;
//             }
//         }

//         setFormData((prev) => ({ ...prev, [name]: value }));
//     };

//     // ─── validation ─────────────────────────────────────────────────────────────
//     const validateForm = () => {
//         const required = [
//             "user_name","email","phone","address",
//             "pickup_location","dropoff_location",
//             "reservation_date","start_time","end_time",
//             "package_type","price_id",
//         ];
//         for (const field of required) {
//             if (!formData[field] || !formData[field].toString().trim()) {
//                 const label = field === "package_type" ? "category"
//                             : field === "price_id"     ? "package"
//                             : field;
//                 alert(`❌ ${label.replace(/_/g, " ")} is required`);
//                 return false;
//             }
//         }
//         if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { alert("❌ Please enter a valid email"); return false; }
//         if (formData.phone.length < 10) { alert("❌ Please enter a valid phone number"); return false; }
//         if (formData.start_time >= formData.end_time) { alert("❌ End time must be after start time"); return false; }
//         const today = new Date().toISOString().split("T")[0];
//         if (formData.reservation_date < today) { alert("❌ Reservation date cannot be in the past"); return false; }
//         if (isTestPackage()) {
//             if (!formData.test_time)          { alert("❌ Test time is required for test packages"); return false; }
//             if (!formData.test_location?.trim()) { alert("❌ Test location is required for test packages"); return false; }
//         }
//         return true;
//     };

//     // ─── submit ─────────────────────────────────────────────────────────────────
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!validateForm()) return;

//         setLoading(true);
//         setError(null);
//         setSuccessMessage(null);

//         const packageDescription = selectedPackage?.description || formData.package_type;

//         try {
//             const submitData = {
//                 user_name:        formData.user_name,
//                 email:            formData.email,
//                 phone:            formData.phone,
//                 address:          formData.address,
//                 pickup_location:  formData.pickup_location,
//                 dropoff_location: formData.dropoff_location,
//                 package_type:     packageDescription,
//                 price_id:         parseInt(formData.price_id),
//                 reservation_date: formData.reservation_date,
//                 start_time:       formData.start_time,
//                 end_time:         formData.end_time,
//                 ...(isTestPackage() && {
//                     test_time:     formData.test_time,
//                     test_location: formData.test_location,
//                 }),
//             };

//             const response = await axios.put(
//                 route("ouruserreservations.update", { id: reservationToEdit.id }),
//                 submitData,
//             );

//             if (response.data.success) {
//                 alert("✓ Reservation updated successfully!");
//                 if (onSuccess) onSuccess(response.data.data);
//                 setTimeout(() => onClose(), 500);
//             }
//         } catch (err) {
//             console.error("Error updating reservation:", err);
//             if (err.response?.data) {
//                 const { message: msg, errors: errs } = err.response.data;
//                 if (errs && Array.isArray(errs)) {
//                     alert(`❌ Validation Error:\n${errs.join("\n")}`);
//                 } else if (msg?.toLowerCase().includes("blocked")) {
//                     alert("❌ This time slot is already BLOCKED by administrator.\n\nPlease select a different time.");
//                 } else if (msg?.toLowerCase().includes("booked") || msg?.toLowerCase().includes("reserved")) {
//                     alert("❌ This time slot is already BOOKED.\n\nPlease select a different time.");
//                 } else {
//                     alert(`❌ Error: ${msg || "Failed to update reservation"}`);
//                 }
//             } else {
//                 alert("❌ Failed to update reservation. Please try again.");
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!isOpen || !reservationToEdit) return null;

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
//             <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">

//                 {/* Header */}
//                 <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
//                     <h2 className="text-xl font-semibold text-gray-800">
//                         Edit Reservation
//                     </h2>
//                     <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
//                         <X size={24} />
//                     </button>
//                 </div>

//                 {successMessage && (
//                     <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
//                         {successMessage}
//                     </div>
//                 )}

//                 <form onSubmit={handleSubmit} className="p-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

//                         {/* ── Personal Info ── */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
//                             <input type="text" name="user_name" value={formData.user_name} onChange={handleChange}
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 placeholder="Enter full name" required />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
//                             <div className="relative">
//                                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                                 <input type="email" name="email" value={formData.email} onChange={handleChange}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="email@example.com" required />
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
//                             <div className="relative">
//                                 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                                 <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="Enter phone number" required />
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
//                             <div className="relative">
//                                 <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                                 <input type="text" name="address" value={formData.address} onChange={handleChange}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="Enter address" required />
//                             </div>
//                         </div>

//                         {/* ── Locations ── */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location *</label>
//                             <input type="text" name="pickup_location" value={formData.pickup_location} onChange={handleChange}
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 placeholder="Enter pickup location" required />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Dropoff Location *</label>
//                             <input type="text" name="dropoff_location" value={formData.dropoff_location} onChange={handleChange}
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 placeholder="Enter dropoff location" required />
//                         </div>

//                         {/* ── Package Category ── */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Package Category *</label>
//                             <select name="package_type" value={formData.package_type} onChange={handleChange}
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 required>
//                                 <option value="">Select a package category</option>
//                                 {categories.map((cat) => (
//                                     <option key={cat} value={cat}>{cat}</option>
//                                 ))}
//                             </select>
//                             {fetchingPrices && categories.length === 0 && (
//                                 <p className="text-sm text-gray-500 mt-1">Loading categories...</p>
//                             )}
//                         </div>

//                         {/* ── Specific Package ── */}
//                         {formData.package_type && (
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Select Package *</label>
//                                 <select name="price_id" value={formData.price_id} onChange={handleChange}
//                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     required
//                                     disabled={fetchingPrices || filteredPackages.length === 0}>
//                                     <option value="">Choose a package</option>
//                                     {filteredPackages.map((pkg) => (
//                                         <option key={pkg.id} value={pkg.id}>
//                                             {pkg.description}{pkg.price ? ` - $${pkg.price}` : ""}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 {filteredPackages.length === 0 && !fetchingPrices && (
//                                     <p className="text-sm text-red-500 mt-1">No packages available in this category</p>
//                                 )}
//                             </div>
//                         )}

//                         {/* ── Date / Time fields ── */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Reservation Date *</label>
//                             <div className="relative">
//                                 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                                 <input type="date" name="reservation_date" value={formData.reservation_date}
//                                     onChange={handleChange}
//                                     min={new Date().toISOString().split("T")[0]}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     required />
//                             </div>
//                         </div>

//                         {isTestPackage() && (
//                             <>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">Test Location *</label>
//                                     <div className="relative">
//                                         <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                                         <input type="text" name="test_location" value={formData.test_location}
//                                             onChange={handleChange}
//                                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                             placeholder="Enter test location" required={isTestPackage()} />
//                                     </div>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">Test Time *</label>
//                                     <div className="relative">
//                                         <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                                         <input type="time" name="test_time" value={formData.test_time}
//                                             onChange={handleChange}
//                                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                             required={isTestPackage()} />
//                                     </div>
//                                     {selectedPackage?.duration && (
//                                         <p className="text-xs text-gray-500 mt-1">
//                                             Start time will be automatically calculated {selectedPackage.duration} before test time
//                                         </p>
//                                     )}
//                                 </div>
//                             </>
//                         )}

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
//                             <div className="relative">
//                                 <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                                 <input type="time" name="start_time" value={formData.start_time}
//                                     onChange={handleChange} step="60"
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     required readOnly={isTestPackage()} disabled={isTestPackage()} />
//                             </div>
//                             {!isTestPackage() && selectedPackage?.duration && (
//                                 <p className="text-xs text-gray-500 mt-1">
//                                     End time will be automatically calculated based on {selectedPackage.duration}
//                                 </p>
//                             )}
//                             {isTestPackage() && (
//                                 <p className="text-xs text-gray-500 mt-1">
//                                     Start time is automatically calculated based on test time
//                                 </p>
//                             )}
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
//                             <div className="relative">
//                                 <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                                 <input type="time" name="end_time" value={formData.end_time}
//                                     onChange={handleChange} step="60"
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
//                                     required readOnly disabled />
//                             </div>
//                             {isTestPackage() && (
//                                 <p className="text-xs text-gray-500 mt-1">End time is set to 1 hour after test time</p>
//                             )}
//                         </div>
//                     </div>

//                     {/* ── Selected Package Summary ── */}
//                     {selectedPackage && (
//                         <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
//                             <h3 className="font-medium text-green-800 mb-2">Selected Package Details:</h3>
//                             <p className="text-sm text-green-600">
//                                 <span className="font-medium">Category:</span> {selectedPackage.category}<br />
//                                 <span className="font-medium">Package:</span> {selectedPackage.description}<br />
//                                 {selectedPackage.price && (
//                                     <><span className="font-medium">Price:</span> ${selectedPackage.price}<br /></>
//                                 )}
//                                 {selectedPackage.duration && (
//                                     <><span className="font-medium">Duration:</span> {selectedPackage.duration}<br /></>
//                                 )}
//                             </p>
//                         </div>
//                     )}

//                     {/* ── Actions ── */}
//                     <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
//                         <button type="button" onClick={onClose} disabled={loading}
//                             className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
//                             Cancel
//                         </button>
//                         <button type="submit" disabled={loading}
//                             className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
//                             {loading ? (
//                                 <>
//                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
//                                     Updating...
//                                 </>
//                             ) : (
//                                 "Update Reservation"
//                             )}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default EditReservationForm;
