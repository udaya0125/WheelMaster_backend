import React, { useEffect, useState } from "react";
import axios from "axios";
import EditPriceForm from "@/EditFormComponents/EditPriceForm";
import AddPriceForm from "@/AddFormComponent/AddPriceForm";
import { FiPlus, FiX, FiEdit, FiTrash2, FiCheck, FiZap, FiClock } from "react-icons/fi";
import Wrapper from "@/AdminWrapper/Wrapper";

const PricePackages = () => {
    const [allPrice, setAllPrice] = useState([]);
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const [editingPrice, setEditingPrice] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(route("ourprice.index"));

                let priceData = [];
                if (Array.isArray(response.data)) {
                    priceData = response.data;
                } else if (response.data && Array.isArray(response.data.data)) {
                    priceData = response.data.data;
                } else if (response.data && response.data.prices) {
                    priceData = response.data.prices;
                } else {
                    console.warn("Unexpected API response structure:", response.data);
                    priceData = [];
                }

                const sorted = [...priceData].sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at),
                );
                setAllPrice(sorted);
            } catch (error) {
                console.error("fetching error ", error);
                setError("Failed to load price packages");
            } finally {
                setLoading(false);
            }
        };
        fetchPrice();
    }, [reloadTrigger]);

    // handleDelete
    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this price package?")) {
            return;
        }
        try {
            await axios.delete(route("ourprice.destroy", { id: id }));
            setReloadTrigger((prev) => !prev);
        } catch (error) {
            console.log("Delete error:", error);
            alert("Error deleting price package");
        }
    };

    // handleEdit
    const handleEdit = (price) => {
        setEditingPrice(price);
        setShowEditForm(true);
    };

    const handleCloseEditForm = () => {
        setShowEditForm(false);
        setEditingPrice(null);
    };

    const handleOpenAddForm = () => setShowAddForm(true);
    const handleCloseAddForm = () => setShowAddForm(false);

    // Card accent colours based on category
    const getCategoryAccent = (category) => {
        switch (category?.toLowerCase()) {
            case "standard lessons":
                return { 
                    bg: "from-sky-500 to-cyan-500", 
                    badge: "bg-sky-100 text-sky-700", 
                    ring: "ring-sky-200",
                    editBg: "bg-sky-600",
                    editHover: "hover:bg-sky-700"
                };
            case "test packages":
                return { 
                    bg: "from-emerald-500 to-teal-500", 
                    badge: "bg-emerald-100 text-emerald-700", 
                    ring: "ring-emerald-200",
                    editBg: "bg-emerald-600",
                    editHover: "hover:bg-emerald-700"
                };
            case "package bundles":
                return { 
                    bg: "from-violet-600 to-indigo-600", 
                    badge: "bg-violet-100 text-violet-700", 
                    ring: "ring-violet-200",
                    editBg: "bg-violet-600",
                    editHover: "hover:bg-violet-700"
                };
            default:
                return { 
                    bg: "from-gray-500 to-gray-600", 
                    badge: "bg-gray-100 text-gray-700", 
                    ring: "ring-gray-200",
                    editBg: "bg-gray-600",
                    editHover: "hover:bg-gray-700"
                };
        }
    };

    const parseFeatures = (features) => {
        if (!features) return [];
        const stripped = features.replace(/<[^>]*>/g, "\n").replace(/&[^;]+;/g, " ");
        return stripped.split(/\n|,|;/).map(f => f.trim()).filter(Boolean);
    };

    // Format duration display
    const formatDuration = (duration) => {
        if (!duration) return "Duration not specified";
        
        // If duration already has "duration:" prefix, return as is
        if (duration.toLowerCase().includes("duration:")) {
            return duration;
        }
        
        // Add "duration: " prefix
        return `duration: ${duration}`;
    };

    // Calculate discounted price from dollar amount discount
    const calculateDiscountedPrice = (originalPrice, discountAmount) => {
        if (!discountAmount) return { discountedPrice: originalPrice, savingsAmount: null };
        
        const discountMatch = discountAmount.toString().match(/(\d+(?:\.\d+)?)/);
        if (discountMatch) {
            const discountValue = parseFloat(discountMatch[0]);
            const discountedPrice = originalPrice - discountValue;
            return { discountedPrice, savingsAmount: discountValue };
        }
        return { discountedPrice: originalPrice, savingsAmount: null };
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

    // Error state
    if (error) {
        return (
            <Wrapper>
                <section className="px-2 sm:px-6 lg:px-8 py-6 lg:py-8">
                    <div className="flex justify-end items-start px-4 mb-12">
                        <div className="flex flex-col items-end gap-4">
                            <button
                                onClick={handleOpenAddForm}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:bg-indigo-700 transition-colors flex items-center"
                            >
                                <FiPlus className="mr-2" />
                                Add Price
                            </button>
                        </div>
                    </div>

                    <div className="text-center mb-16">
                        <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full mb-4">
                            Pricing Plans
                        </span>
                        <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                            Transparent{" "}
                            <span className="text-blue-600">Pricing</span>
                        </h2>
                        <div className="mt-6 max-w-2xl mx-auto">
                            <p className="text-lg text-gray-700">
                                Choose the perfect driving lesson package that suits your needs and budget
                            </p>
                        </div>
                    </div>

                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
                        {error}
                        <button
                            onClick={() => setError(null)}
                            className="ml-4 text-red-800 hover:text-red-900 font-bold"
                        >
                            <FiX />
                        </button>
                    </div>
                </section>
            </Wrapper>
        );
    }

    return (
        <Wrapper>
            {/* Add Form Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">
                                    Add New Price Package
                                </h2>
                                <button
                                    onClick={handleCloseAddForm}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    <FiX />
                                </button>
                            </div>
                            <AddPriceForm
                                onClose={handleCloseAddForm}
                                setReloadTrigger={setReloadTrigger}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Form Modal */}
            {showEditForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">
                                Edit Price Package
                            </h2>
                            <button
                                onClick={handleCloseEditForm}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                <FiX />
                            </button>
                        </div>
                        <EditPriceForm
                            editingPrice={editingPrice}
                            onClose={handleCloseEditForm}
                            setReloadTrigger={setReloadTrigger}
                        />
                    </div>
                </div>
            )}

            {/* Price Packages List */}
            <section className="px-2 sm:px-6 lg:px-8 py-6 lg:py-8">
                <div className="flex justify-end items-start px-4 mb-12">
                    <div className="flex flex-col items-end gap-4">
                        <button
                            onClick={handleOpenAddForm}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:bg-indigo-700 transition-colors flex items-center"
                        >
                            <FiPlus className="mr-2" />
                            Add Price
                        </button>
                    </div>
                </div>

                {/* Section Header */}
                <div className="text-center mb-16">
                    <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full mb-4">
                        Pricing Plans
                    </span>
                    <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                        Transparent{" "}
                        <span className="text-blue-600">Pricing</span>
                    </h2>
                    <div className="mt-6 max-w-2xl mx-auto">
                        <p className="text-lg text-gray-700">
                            Choose the perfect driving lesson package that suits your needs and budget
                        </p>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        <p className="mt-4 text-gray-600">
                            Loading price packages...
                        </p>
                    </div>
                )}

                {/* Price Packages Content - Only show when not loading */}
                {!loading && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allPrice.map((price, index) => {
                                const accent = getCategoryAccent(price.category);
                                const features = parseFeatures(price.features);
                                const originalPrice = parseFloat(price.price);
                                const { discountedPrice, savingsAmount } = calculateDiscountedPrice(originalPrice, price.discount);
                                const formattedDuration = formatDuration(price.duration);

                                return (
                                    <div
                                        key={price.id}
                                        className={`relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ring-1 ${accent.ring}`}
                                    >
                                        {/* Edit/Delete Actions - Top Right Corner */}
                                        <div className="absolute top-4 right-4 flex space-x-2 z-10">
                                            <button
                                                onClick={() => handleEdit(price)}
                                                className={`${accent.editBg} text-white p-2 rounded-full ${accent.editHover} transition-colors shadow-md`}
                                                title="Edit"
                                            >
                                                <FiEdit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(price.id)}
                                                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-md"
                                                title="Delete"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>

                                        {/* Top gradient bar */}
                                        <div className={`h-2 w-full bg-gradient-to-r ${accent.bg}`} />

                                        <div className="p-6 pt-12">
                                            {/* Category badge */}
                                            <div className="flex items-start justify-between mb-4">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${accent.badge}`}>
                                                    <FiZap size={11} />
                                                    {price.category || "General"}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-lg font-bold text-gray-900 leading-snug mb-1">
                                                {price.description}
                                            </h3>

                                            {/* Duration with icon */}
                                            <div className="flex items-center gap-2 mb-5">
                                                <FiClock className="text-gray-400 text-sm" />
                                                <p className="text-sm text-gray-500">
                                                    {formattedDuration}
                                                </p>
                                            </div>

                                            {/* Price with discount */}
                                            <div className="mb-6">
                                                {savingsAmount ? (
                                                    <>
                                                        {/* Flex container for price and discount */}
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-4xl font-extrabold text-gray-900">
                                                                    ${discountedPrice.toFixed(0)}
                                                                </span>
                                                                <span className="text-sm text-gray-400 font-medium">
                                                                    .{discountedPrice.toFixed(2).split(".")[1]}
                                                                </span>
                                                            </div>
                                                            
                                                            {/* Discount badge - Save $XX */}
                                                            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${accent.badge}`}>
                                                                <FiZap size={12} />
                                                                save ${savingsAmount.toFixed(0)}
                                                            </span>
                                                        </div>
                                                        
                                                        {/* Original price with strikethrough */}
                                                        <div className="mt-2">
                                                            <span className="text-sm text-gray-400 line-through">
                                                                ${originalPrice.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    /* Regular price without discount */
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-4xl font-extrabold text-gray-900">
                                                            ${originalPrice.toFixed(0)}
                                                        </span>
                                                        <span className="text-sm text-gray-400 font-medium">
                                                            .{originalPrice.toFixed(2).split(".")[1]}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Divider */}
                                            <div className="border-t border-gray-100 mb-5" />

                                            {/* Features */}
                                            {features.length > 0 && (
                                                <ul className="space-y-2.5 mb-6">
                                                    {features.slice(0, 5).map((feature, i) => (
                                                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                                                            <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${accent.badge}`}>
                                                                <FiCheck size={10} />
                                                            </span>
                                                            {feature}
                                                        </li>
                                                    ))}
                                                    {features.length > 5 && (
                                                        <li className="text-xs text-gray-400 pl-6">
                                                            +{features.length - 5} more features
                                                        </li>
                                                    )}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {allPrice.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">
                                    No price packages found.
                                </p>
                                <button
                                    onClick={handleOpenAddForm}
                                    className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition-colors flex items-center justify-center mx-auto"
                                >
                                    <FiPlus className="mr-2" />
                                    Add Price Package
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </Wrapper>
    );
};

export default PricePackages;




// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import EditPriceForm from "@/EditFormComponents/EditPriceForm";
// import AddPriceForm from "@/AddFormComponent/AddPriceForm";
// import { FiPlus, FiX } from "react-icons/fi";
// import Wrapper from "@/AdminWrapper/Wrapper";

// const PricePackages = () => {
//     const [allPrice, setAllPrice] = useState([]);
//     const [reloadTrigger, setReloadTrigger] = useState(false);
//     const [editingPrice, setEditingPrice] = useState(null);
//     const [showEditForm, setShowEditForm] = useState(false);
//     const [showAddForm, setShowAddForm] = useState(false);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const fetchPrice = async () => {
//             try {
//                 setLoading(true);
//                 setError(null);
//                 const response = await axios.get(route("ourprice.index"));
                
//                 // Handle different response structures
//                 let priceData = [];
                
//                 if (Array.isArray(response.data)) {
//                     priceData = response.data;
//                 } else if (response.data && Array.isArray(response.data.data)) {
//                     priceData = response.data.data;
//                 } else if (response.data && response.data.prices) {
//                     priceData = response.data.prices;
//                 } else {
//                     console.warn("Unexpected API response structure:", response.data);
//                     priceData = [];
//                 }
                
//                 const sorted = [...priceData].sort(
//                     (a, b) => new Date(b.created_at) - new Date(a.created_at),
//                 );
//                 setAllPrice(sorted);
//             } catch (error) {
//                 console.error("fetching error ", error);
//                 setError("Failed to load price packages");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchPrice();
//     }, [reloadTrigger]);

//     // handleDelete
//     const handleDelete = async (id) => {
//         if (!confirm("Are you sure you want to delete this price package?")) {
//             return;
//         }

//         try {
//             await axios.delete(route("ourprice.destroy", { id: id }));
//             setReloadTrigger((prev) => !prev);
//         } catch (error) {
//             console.log("Delete error:", error);
//             alert("Error deleting price package");
//         }
//     };

//     // handleEdit
//     const handleEdit = (price) => {
//         setEditingPrice(price);
//         setShowEditForm(true);
//     };

//     const handleCloseEditForm = () => {
//         setShowEditForm(false);
//         setEditingPrice(null);
//     };

//     // Added these functions for Add Form
//     const handleOpenAddForm = () => {
//         setShowAddForm(true);
//     };

//     const handleCloseAddForm = () => {
//         setShowAddForm(false);
//     };

//     // Error state
//     if (error) {
//         return (
//             <Wrapper>
//                 <section className="px-2 sm:px-6 lg:px-8 py-6 lg:py-8">
//                     <div className="flex justify-end items-start px-4 mb-12">
//                         <div className="flex flex-col items-end gap-4">
//                             <button
//                                 onClick={handleOpenAddForm}
//                                 className="bg-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:bg-indigo-700 transition-colors flex items-center"
//                             >
//                                 <FiPlus className="mr-2" />
//                                 Add Price
//                             </button>
//                         </div>
//                     </div>

//                     <div className="text-center mb-16">
//                         <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full mb-4">
//                             Pricing Plans
//                         </span>
//                         <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
//                             Transparent{" "}
//                             <span className="text-blue-600">Pricing</span>
//                         </h2>
//                         <div className="mt-6 max-w-2xl mx-auto">
//                             <p className="text-lg text-gray-700">
//                                 Choose the perfect driving lesson package that suits your needs and budget
//                             </p>
//                         </div>
//                     </div>

//                     <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
//                         {error}
//                         <button
//                             onClick={() => setError(null)}
//                             className="ml-4 text-red-800 hover:text-red-900 font-bold"
//                         >
//                             <FiX />
//                         </button>
//                     </div>
//                 </section>
//             </Wrapper>
//         );
//     }

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
//             {/* Add Form Modal - Moved to top */}
//             {showAddForm && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//                     <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//                         <div className="p-6">
//                             <div className="flex justify-between items-center mb-6">
//                                 <h2 className="text-2xl font-bold">
//                                     Add New Price Package
//                                 </h2>
//                                 <button
//                                     onClick={handleCloseAddForm}
//                                     className="text-gray-500 hover:text-gray-700 text-2xl"
//                                 >
//                                     <FiX />
//                                 </button>
//                             </div>
//                             <AddPriceForm
//                                 onClose={handleCloseAddForm}
//                                 setReloadTrigger={setReloadTrigger}
//                             />
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Edit Form Modal */}
//             {showEditForm && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//                     <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
//                         <div className="flex justify-between items-center mb-6">
//                             <h2 className="text-2xl font-bold">
//                                 Edit Price Package
//                             </h2>
//                             <button
//                                 onClick={handleCloseEditForm}
//                                 className="text-gray-500 hover:text-gray-700 text-2xl"
//                             >
//                                 <FiX />
//                             </button>
//                         </div>
//                         <EditPriceForm
//                             editingPrice={editingPrice}
//                             onClose={handleCloseEditForm}
//                             setReloadTrigger={setReloadTrigger}
//                         />
//                     </div>
//                 </div>
//             )}

//             {/* Price Packages List */}
//             <section className="px-2 sm:px-6 lg:px-8 py-6 lg:py-8">
//                 <div className="flex justify-end items-start px-4 mb-12">
//                     <div className="flex flex-col items-end gap-4">
//                         <button
//                             onClick={handleOpenAddForm}
//                             className="bg-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:bg-indigo-700 transition-colors flex items-center"
//                         >
//                             <FiPlus className="mr-2" />
//                             Add Price
//                         </button>
//                     </div>
//                 </div>

//                 {/* Section Header */}
//                 <div className="text-center mb-16">
//                     <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full mb-4">
//                         Pricing Plans
//                     </span>
//                     <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
//                         Transparent{" "}
//                         <span className="text-blue-600">Pricing</span>
//                     </h2>
//                     <div className="mt-6 max-w-2xl mx-auto">
//                         <p className="text-lg text-gray-700">
//                             Choose the perfect driving lesson package that suits your needs and budget
//                         </p>
//                     </div>
//                 </div>

//                 {/* Loading State - Matches other components pattern */}
//                 {loading && (
//                     <div className="text-center py-12">
//                         <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//                         <p className="mt-4 text-gray-600">
//                             Loading price packages...
//                         </p>
//                     </div>
//                 )}

//                 {/* Price Packages Content - Only show when not loading */}
//                 {!loading && (
//                     <>
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                             {allPrice.map((price) => (
//                                 <div
//                                     key={price.id}
//                                     className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300"
//                                 >
//                                     {/* Category and Description Header */}
//                                     <div className="flex justify-between items-start mb-2">
//                                         <h3 className="text-xl font-bold text-gray-800">
//                                             {price.description}
//                                         </h3>
//                                         <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
//                                             {price.category || "Uncategorized"}
//                                         </span>
//                                     </div>

//                                     {/* Price and Discount */}
//                                     <div className="text-3xl font-bold text-blue-600 mb-2">
//                                         ${parseFloat(price.price).toFixed(2)}
//                                     </div>

//                                     {/* Display discount if available */}
//                                     {price.discount && (
//                                         <div className="text-green-600 font-semibold mb-2">
//                                             {price.discount}
//                                         </div>
//                                     )}

//                                     <div className="text-gray-600 mb-4">
//                                         <span className="font-semibold">Duration:</span>{" "}
//                                         {price.duration}
//                                     </div>

//                                     <div className="mb-6">
//                                         <h4 className="font-semibold text-gray-700 mb-2">
//                                             Features:
//                                         </h4>
//                                         <div
//                                             className="text-gray-600 whitespace-pre-line"
//                                             dangerouslySetInnerHTML={{
//                                                 __html: price.features,
//                                             }}
//                                         />
//                                     </div>

//                                     <div className="flex space-x-2">
//                                         <button
//                                             onClick={() => handleEdit(price)}
//                                             className="flex-1 bg-gray-300 hover:bg-gray-400 text-white py-2 px-4 rounded transition duration-200"
//                                         >
//                                             Edit
//                                         </button>
//                                         <button
//                                             onClick={() => handleDelete(price.id)}
//                                             className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition duration-200"
//                                         >
//                                             Delete
//                                         </button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>

//                         {allPrice.length === 0 && (
//                             <div className="text-center py-12">
//                                 <p className="text-gray-500 text-lg">
//                                     No price packages found.
//                                 </p>
//                                 <button
//                                     onClick={handleOpenAddForm}
//                                     className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition-colors flex items-center justify-center mx-auto"
//                                 >
//                                     <FiPlus className="mr-2" />
//                                     Add Price Package
//                                 </button>
//                             </div>
//                         )}
//                     </>
//                 )}
//             </section>
//         </Wrapper>
//     );
// };

// export default PricePackages;