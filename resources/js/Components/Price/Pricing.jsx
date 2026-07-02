// import React, { useEffect, useState } from "react";
// import { Check, Star, Crown, Zap, ArrowRight, Phone, Mail } from "lucide-react";
// import { Link } from "@inertiajs/react";
// import axios from "axios";

// const Pricing = ({ price }) => {
//     const [activeTab, setActiveTab] = useState("standard lessons");
//     const [prices, setPrices] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [categories, setCategories] = useState([]);

//     useEffect(() => {
//         const fetchPrices = async () => {
//             try {
//                 setLoading(true);
//                 const response = await axios.get(route("ourprice.index"));
//                 setPrices(response.data.data);

//                 const uniqueCategories = [
//                     ...new Set(
//                         response.data.data.map((price) => price.category),
//                     ),
//                 ];
//                 setCategories(uniqueCategories.filter(Boolean));

//                 if (uniqueCategories.length > 0 && uniqueCategories[0]) {
//                     setActiveTab(uniqueCategories[0]);
//                 }
//             } catch (err) {
//                 console.error("Error fetching prices:", err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchPrices();
//     }, []);

//     const getPricesByCategory = () => {
//         const filteredPrices = prices.filter((price) => price.category === activeTab);

//         if (activeTab.toLowerCase() === "standard lessons" && filteredPrices.length >= 3) {
//             const mostPopularIndex = filteredPrices.findIndex(
//                 (price) => price.duration && price.duration.toLowerCase().includes("2")
//             );

//             if (mostPopularIndex !== -1) {
//                 const reorderedPrices = [...filteredPrices];
//                 const [mostPopularCard] = reorderedPrices.splice(mostPopularIndex, 1);
//                 const middleIndex = Math.floor(reorderedPrices.length / 2);
//                 reorderedPrices.splice(middleIndex, 0, mostPopularCard);
//                 return reorderedPrices;
//             }
//         }

//         return filteredPrices;
//     };

//     const getBookingRoute = (slug, category) => {
//         if (category === "test packages") {
//             return `/calendar/test/${slug}`;
//         }
//         return `/calendar/${slug}`;
//     };

//     const renderFeatures = (features) => {
//         if (!features) return null;

//         try {
//             const cleanedFeatures = features.trim().replace(/^["']|["']$/g, "");
//             const tempDiv = document.createElement("div");
//             tempDiv.innerHTML = cleanedFeatures;

//             let featureItems = [];
//             const listItems = tempDiv.querySelectorAll("li");
//             if (listItems.length > 0) {
//                 listItems.forEach((li) => {
//                     const text = li.textContent.trim();
//                     if (text) featureItems.push(text);
//                 });
//             } else {
//                 const text = tempDiv.textContent || cleanedFeatures;
//                 featureItems = text
//                     .split(/[•\n\-]/)
//                     .map((item) => item.trim())
//                     .filter((item) => item.length > 0);
//             }

//             if (featureItems.length === 0) {
//                 featureItems = [cleanedFeatures.replace(/<[^>]*>/g, "")];
//             }

//             return (
//                 <div className="space-y-2">
//                     {featureItems.map((feature, index) => (
//                         <div key={index} className="flex items-start gap-2">
//                             <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
//                             <span className="text-gray-700 text-xs sm:text-sm leading-relaxed">
//                                 {feature}
//                             </span>
//                         </div>
//                     ))}
//                 </div>
//             );
//         } catch (error) {
//             console.error("Error parsing features:", error);
//             const plainText = features.replace(/<[^>]*>/g, "").trim();
//             return (
//                 <div className="space-y-2">
//                     <div className="flex items-start gap-2">
//                         <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
//                         <span className="text-gray-700 text-xs sm:text-sm">
//                             {plainText}
//                         </span>
//                     </div>
//                 </div>
//             );
//         }
//     };

//     const PricingCard = ({
//         duration,
//         price,
//         description,
//         features,
//         discount,
//         category,
//         slug,
//     }) => {
//         const isPackageBundle =
//             category && category.toLowerCase().includes("package bundles");

//         const isLogBookPackage =
//             description &&
//             description.toLowerCase().includes("log book package");

//         const isTestOnly =
//             category &&
//             category.toLowerCase() === "test packages" &&
//             duration &&
//             duration.toLowerCase().includes("test only");

//         let tagType = null;
//         let tagText = "";
//         let tagIcon = null;
//         let tagColorClass = "bg-blue-500";

//         if (
//             category &&
//             category.toLowerCase() === "standard lessons" &&
//             duration &&
//             duration.toLowerCase().includes("2")
//         ) {
//             tagType = "mostPopular";
//             tagText = "Most Popular";
//             tagIcon = <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />;
//             tagColorClass = "bg-blue-500";
//         } else if (
//             description &&
//             description.toLowerCase().includes("10 x 1-hour lessons")
//         ) {
//             tagType = "popular";
//             tagText = "Popular";
//             tagIcon = <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />;
//             tagColorClass = "bg-blue-400";
//         } else if (isLogBookPackage) {
//             tagType = "special";
//             tagText = "SPECIAL";
//             tagIcon = <Zap className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />;
//             tagColorClass = "bg-blue-600";
//         }

//         const bookingRoute = getBookingRoute(slug, category);

//         const getBorderColor = () => {
//             switch (tagType) {
//                 case "mostPopular": return "border-blue-500";
//                 case "popular": return "border-blue-400";
//                 case "special": return "border-blue-600";
//                 default: return "border-gray-200";
//             }
//         };

//         const getButtonColor = () => {
//             switch (tagType) {
//                 case "mostPopular": return "bg-blue-500 hover:bg-blue-600";
//                 case "popular": return "bg-blue-400 hover:bg-blue-500";
//                 case "special": return "bg-blue-600 hover:bg-blue-700";
//                 default: return "bg-blue-500 hover:bg-blue-600";
//             }
//         };

//         const renderPriceSection = () => {
//             if (isLogBookPackage) {
//                 return (
//                     <div className="text-center mb-4 sm:mb-6">
//                         <div className="flex items-baseline justify-center">
//                             <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
//                                 Included
//                             </span>
//                         </div>
//                     </div>
//                 );
//             }

//             return (
//                 <div className="text-center mb-4 sm:mb-6">
//                     <div className="flex items-baseline justify-center gap-1">
//                         <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
//                             ${price}
//                         </span>
//                     </div>
//                     {discount && (
//                         <div className="mt-2 inline-block bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
//                             Save ${discount}
//                         </div>
//                     )}
//                 </div>
//             );
//         };

//         const renderButton = () => {
//             if (isPackageBundle || isTestOnly) {
//                 return (
//                     <a
//                         href="tel:+1234567890"
//                         className={`w-full py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 mt-auto text-white shadow-lg hover:shadow-xl text-sm sm:text-base ${getButtonColor()}`}
//                     >
//                         <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
//                         Call Now
//                         <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
//                     </a>
//                 );
//             }

//             return (
//                 <Link
//                     href={bookingRoute}
//                     className={`w-full py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 mt-auto text-white shadow-lg hover:shadow-xl text-sm sm:text-base ${getButtonColor()}`}
//                 >
//                     {isLogBookPackage ? "Learn More" : "Book Now"}
//                     <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
//                 </Link>
//             );
//         };

//         return (
//             <div
//                 className={`relative bg-white rounded-2xl sm:rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col h-full border-2 ${
//                     tagType
//                         ? `${getBorderColor()} ${tagType === "mostPopular" ? "md:scale-105 lg:scale-110 z-10" : ""}`
//                         : "border-gray-200"
//                 }`}
//             >
//                 {tagType && (
//                     <div
//                         className={`absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 ${tagColorClass} text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center gap-1 whitespace-nowrap`}
//                     >
//                         {tagIcon}
//                         {tagText}
//                     </div>
//                 )}

//                 <div className="p-5 sm:p-6 lg:p-8 flex flex-col flex-grow">
//                     <div className="text-center mb-4 sm:mb-6">
//                         {!isPackageBundle && duration && (
//                             <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
//                                 {duration}
//                             </h3>
//                         )}
//                         {description && (
//                             <p className="text-gray-600 text-xs sm:text-sm">
//                                 {description}
//                             </p>
//                         )}
//                     </div>

//                     {renderPriceSection()}

//                     {features && (
//                         <div className="mb-4 sm:mb-6 flex-grow">
//                             {renderFeatures(features)}
//                         </div>
//                     )}

//                     {renderButton()}
//                 </div>
//             </div>
//         );
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto"></div>
//                     <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading pricing...</p>
//                 </div>
//             </div>
//         );
//     }

//     const formatCategoryName = (category) => {
//         if (!category) return "Other";
//         return category
//             .split(" ")
//             .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//             .join(" ");
//     };



  

//     return (
//         <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">

//             {/* Tab Navigation */}
//             {/* <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12 -mt-4 sm:-mt-8">
//                 <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 lg:p-6">
//                     <div className="text-center mb-4 sm:mb-6 lg:mb-8">
//                         <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
//                             Select Package Type
//                         </h2>
//                     </div>

            
//                     <div className="bg-gray-100 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 flex flex-col sm:flex-row gap-1.5 sm:gap-2 lg:gap-4">
//                         {categories.length > 0 ? (
//                             categories.map((category) => (
//                                 <button
//                                     key={category}
//                                     onClick={() => setActiveTab(category)}
//                                     className={`flex-1 py-3 sm:py-3.5 lg:py-4 px-3 sm:px-4 lg:px-6 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base transform hover:scale-[1.02] ${
//                                         activeTab === category
//                                             ? "bg-white text-blue-600 shadow-lg"
//                                             : "text-gray-700 hover:bg-white hover:text-blue-600"
//                                     }`}
//                                 >
//                                     {formatCategoryName(category)}
//                                 </button>
//                             ))
//                         ) : (
//                             <div className="w-full text-center py-4 text-gray-500 text-sm sm:text-base">
//                                 No categories available
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div> */}

//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-10 lg:mb-12">
//     {/* Updated Card with subtle border and softer, larger shadow */}
//     <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-4 sm:p-6 lg:p-8">
        
//         {/* Header Section with subtle "Eyebrow" text for modern hierarchy */}
//         <div className="text-center mb-6 sm:mb-8">
//             <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2">
//                 Pricing Plans
//             </p>
//             <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900">
//                 Select Package Type
//             </h2>
//         </div>

//         {/* Modern Pill Container: Darker base, tighter gap, prevents layout shift */}
//         {/* <div className="bg-gray-200/60 backdrop-blur-sm rounded-2xl p-2 flex flex-col sm:flex-row gap-1.5 sm:gap-2">
//             {categories.length > 0 ? (
//                 categories.map((category) => (
//                     <button
//                         key={category}
//                         onClick={() => setActiveTab(category)}
//                         // Removed jarring scale, added smooth transitions and active styling
//                         className={`relative flex-1 py-3.5 px-4 lg:px-6 rounded-xl font-semibold transition-all duration-200 ease-in-out text-sm sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
//                             activeTab === category
//                                 ? "bg-white text-gray-900 shadow-md ring-1 ring-black/5"
//                                 : "text-gray-500 hover:text-gray-900 hover:bg-white/60"
//                         }`}
//                     >
//                         {formatCategoryName(category)}
//                     </button>
//                 ))
//             ) : (
//                 <div className="w-full text-center py-6 text-gray-400 text-sm sm:text-base font-medium">
//                     No categories available
//                 </div>
//             )}
//         </div> */}

//         <div className="bg-gray-200/60 backdrop-blur-sm rounded-2xl p-2 flex flex-col sm:flex-row gap-1.5 sm:gap-2">
//             {categories.length > 0 ? (
//                 categories.map((category) => (
//                     <button
//                         key={category}
//                         onClick={() => setActiveTab(category)}
//                         className={`relative flex-1 py-3.5 px-4 lg:px-6 rounded-xl font-semibold transition-all duration-200 ease-in-out text-sm sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
//                             activeTab === category
//                                 ? "bg-white text-blue-700 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.08),0_8px_16px_-4px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_1px_rgba(0,0,0,0.03)] ring-1 ring-black/5 -translate-y-px"
//                                 : "text-gray-500 hover:text-gray-900 hover:bg-white/60"
//                         }`}
//                     >
//                         {formatCategoryName(category)}
//                     </button>
//                 ))
//             ) : (
//                 <div className="w-full text-center py-6 text-gray-400 text-sm sm:text-base font-medium">
//                     No categories available
//                 </div>
//             )}
//         </div>
//     </div>
// </div>      






//             {/* Pricing Cards */}
//             <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pb-10 sm:pb-12 lg:py-12">
//                 {getPricesByCategory().length > 0 ? (
//                     <div className={`grid gap-5 sm:gap-6 lg:gap-10 ${
//                         getPricesByCategory().length === 1
//                             ? "grid-cols-1 max-w-sm mx-auto"
//                             : getPricesByCategory().length === 2
//                             ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
//                             : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
//                     }`}>
//                         {getPricesByCategory().map((priceItem, index) => (
//                             /* Extra top padding on mobile/tablet to accommodate the badge for the "mostPopular" card */
//                             <div
//                                 key={priceItem.id}
//                                 className={
//                                     priceItem.category?.toLowerCase() === "standard lessons" &&
//                                     priceItem.duration?.toLowerCase().includes("2")
//                                         ? "pt-5 sm:pt-6 lg:pt-0"
//                                         : ""
//                                 }
//                             >
//                                 <PricingCard
//                                     duration={priceItem.duration}
//                                     price={priceItem.price}
//                                     description={priceItem.description}
//                                     features={priceItem.features}
//                                     discount={priceItem.discount}
//                                     category={priceItem.category}
//                                     slug={priceItem.slug}
//                                 />
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                     <div className="text-center py-10 sm:py-12">
//                         <div className="max-w-xs sm:max-w-md mx-auto">
//                             <svg
//                                 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4"
//                                 fill="none"
//                                 stroke="currentColor"
//                                 viewBox="0 0 24 24"
//                             >
//                                 <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     strokeWidth={1}
//                                     d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                                 />
//                             </svg>
//                             <p className="text-gray-500 text-base sm:text-lg mb-4">
//                                 No pricing available for{" "}
//                                 {formatCategoryName(activeTab)} at the moment.
//                             </p>
//                             <p className="text-gray-400 text-xs sm:text-sm">
//                                 Please check back later or contact us for custom
//                                 packages.
//                             </p>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Pricing;



import React, { useEffect, useState } from "react";
import { Check, Star, Zap, ArrowRight, Phone, Route } from "lucide-react";
import { Link } from "@inertiajs/react";
import axios from "axios";

const Pricing = () => {
    const [activeTab, setActiveTab] = useState("");
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                setLoading(true);
                const response = await axios.get(route("ourprice.index"));
                const data = response.data.data;
                setPrices(data);

                const uniqueCategories = [...new Set(data.map((p) => p.category))].filter(Boolean);
                setCategories(uniqueCategories);

                if (uniqueCategories.length > 0) {
                    setActiveTab(uniqueCategories[0]);
                }
            } catch (err) {
                console.error("Error fetching prices:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPrices();
    }, []);

    const getPricesByCategory = () => {
        const filtered = prices.filter((p) => p.category === activeTab);

        if (activeTab.toLowerCase() === "standard lessons" && filtered.length >= 3) {
            const mostPopularIndex = filtered.findIndex(
                (p) => p.duration && p.duration.toLowerCase().includes("2")
            );

            if (mostPopularIndex !== -1) {
                const reordered = [...filtered];
                const [mostPopular] = reordered.splice(mostPopularIndex, 1);
                reordered.splice(Math.floor(reordered.length / 2), 0, mostPopular);
                return reordered;
            }
        }

        return filtered;
    };

    const getBookingRoute = (slug, category) =>
        category === "test packages" ? `/calendar/test/${slug}` : `/calendar/${slug}`;

    // Tailwind needs literal class names to detect them at build time, so
    // dynamic strings like `bg-${color}` won't work — use a lookup map instead.
    const colorClasses = {
        "blue-500": { border: "border-blue-500", tag: "bg-blue-500" },
        "blue-400": { border: "border-blue-400", tag: "bg-blue-400" },
        "blue-600": { border: "border-blue-600", tag: "bg-blue-600" },
    };

    const renderFeatures = (features) => {
        if (!features) return null;

        try {
            const cleaned = features.trim().replace(/^["']|["']$/g, "");
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = cleaned;

            let items = [];
            const listItems = tempDiv.querySelectorAll("li");
            if (listItems.length > 0) {
                listItems.forEach((li) => {
                    const text = li.textContent.trim();
                    if (text) items.push(text);
                });
            } else {
                const text = tempDiv.textContent || cleaned;
                items = text.split(/[•\n\-]/).map((i) => i.trim()).filter(Boolean);
            }

            if (items.length === 0) items = [cleaned.replace(/<[^>]*>/g, "")];

            return (
                <div className="space-y-2">
                    {items.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                                {feature}
                            </span>
                        </div>
                    ))}
                </div>
            );
        } catch (error) {
            console.error("Error parsing features:", error);
            return (
                <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600 text-xs sm:text-sm">
                        {features.replace(/<[^>]*>/g, "").trim()}
                    </span>
                </div>
            );
        }
    };

    const PricingCard = ({ duration, price, description, features, discount, category, slug }) => {
        const isPackageBundle = category?.toLowerCase().includes("package bundles");
        const isLogBookPackage = description?.toLowerCase().includes("log book package");
        const isTestOnly = category?.toLowerCase() === "test packages" && duration?.toLowerCase().includes("test only");

        let tag = null;
        if (category?.toLowerCase() === "standard lessons" && duration?.toLowerCase().includes("2")) {
            tag = { text: "Most Popular", icon: Star, color: "blue-500" };
        } else if (description?.toLowerCase().includes("10 x 1-hour lessons")) {
            tag = { text: "Popular", icon: Star, color: "blue-400" };
        } else if (isLogBookPackage) {
            tag = { text: "SPECIAL", icon: Zap, color: "blue-600" };
        }

        const bookingRoute = getBookingRoute(slug, category);
        const isHighlighted = tag?.text === "Most Popular";
        const colors = colorClasses[tag?.color] || colorClasses["blue-500"];

        const renderButton = () => {
            if (isPackageBundle || isTestOnly) {
                return (
                    <a
                        href="tel:+1234567890"
                        className="w-full py-3.5 sm:py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 mt-auto text-white shadow-md hover:shadow-lg bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
                    >
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                        Call Now
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                );
            }

            return (
                <Link
                    href={bookingRoute}
                    className="w-full py-3.5 sm:py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 mt-auto text-white shadow-md hover:shadow-lg bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
                >
                    {isLogBookPackage ? "Learn More" : "Book Now"}
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
            );
        };

        return (
            <div
                className={`relative bg-white rounded-2xl flex flex-col h-full border-2 transition-all duration-300 hover:-translate-y-1 ${
                    tag ? `${colors.border} shadow-lg` : "border-slate-200 shadow-sm hover:shadow-lg"
                } ${isHighlighted ? "md:scale-105 lg:scale-110 z-10" : ""}`}
            >
                {tag && (
                    <div
                        className={`absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 ${colors.tag} text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center gap-1 whitespace-nowrap`}
                    >
                        <tag.icon className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                        {tag.text}
                    </div>
                )}

                <div className="p-5 sm:p-6 lg:p-8 flex flex-col flex-grow">
                    <div className="mb-4 sm:mb-6">
                        {!isPackageBundle && duration && (
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5">
                                {duration}
                            </h3>
                        )}
                        {description && (
                            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{description}</p>
                        )}
                    </div>

                    <div className="mb-5 sm:mb-6 pb-5 sm:pb-6 border-b border-slate-100">
                        <div className="flex items-end gap-1.5">
                            {isLogBookPackage ? (
                                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">Included</span>
                            ) : (
                                <>
                                    <span className="text-sm font-semibold text-slate-400 mb-1">$</span>
                                    <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-none">
                                        {price}
                                    </span>
                                </>
                            )}
                        </div>
                        {discount && (
                            <div className="mt-2.5 inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                                You save ${discount}
                            </div>
                        )}
                    </div>

                    {features && <div className="mb-5 sm:mb-6 flex-grow">{renderFeatures(features)}</div>}

                    {renderButton()}
                </div>
            </div>
        );
    };

    const formatCategoryName = (category) =>
        category ? category.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "Other";

    const filteredPrices = getPricesByCategory();

    return (
        <div className="bg-slate-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-8 sm:pb-10 text-center">
                <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-blue-600 mb-3">
                    Pricing
                </p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
                    Choose your route to a licence
                </h2>
                <p className="text-slate-500 text-sm sm:text-base mt-3 max-w-xl mx-auto">
                    Simple, transparent pricing — no hidden fees.
                </p>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-1">
                {loading ? (
                    <div className="h-14 bg-slate-200/60 rounded-2xl animate-pulse" />
                ) : categories.length > 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-1.5 sm:p-2 flex flex-col sm:flex-row gap-1.5 shadow-sm">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveTab(category)}
                                className={`relative flex-1 py-3 px-4 lg:px-6 rounded-xl font-semibold transition-all duration-200 ease-in-out text-sm sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                                    activeTab === category
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                }`}
                            >
                                {formatCategoryName(category)}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="w-full text-center py-6 text-slate-400 text-sm sm:text-base font-medium">
                        No categories available
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pb-16 sm:pb-20 pt-10 sm:pt-12">
                {loading ? (
                    <div className="grid gap-5 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-96 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                        ))}
                    </div>
                ) : filteredPrices.length > 0 ? (
                    <div
                        className={`grid gap-5 sm:gap-6 lg:gap-10 ${
                            filteredPrices.length === 1
                                ? "grid-cols-1 max-w-sm mx-auto"
                                : filteredPrices.length === 2
                                ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
                                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        }`}
                    >
                        {filteredPrices.map((priceItem) => (
                            <div
                                key={priceItem.id}
                                className={
                                    priceItem.category?.toLowerCase() === "standard lessons" &&
                                    priceItem.duration?.toLowerCase().includes("2")
                                        ? "pt-5 sm:pt-6 lg:pt-0"
                                        : ""
                                }
                            >
                                <PricingCard
                                    duration={priceItem.duration}
                                    price={priceItem.price}
                                    description={priceItem.description}
                                    features={priceItem.features}
                                    discount={priceItem.discount}
                                    category={priceItem.category}
                                    slug={priceItem.slug}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 sm:py-12">
                        <div className="max-w-xs sm:max-w-md mx-auto">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <Route className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-600 text-base sm:text-lg mb-1.5 font-medium">
                                No pricing available for {formatCategoryName(activeTab)} at the moment.
                            </p>
                            <p className="text-slate-400 text-xs sm:text-sm">
                                Please check back later or contact us for custom packages.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Pricing;


// import React, { useEffect, useState } from "react";
// import { Check, Star, Flag, ArrowRight, Phone, Route } from "lucide-react";
// import { Link } from "@inertiajs/react";
// import axios from "axios";

// const Pricing = () => {
//     const [activeTab, setActiveTab] = useState("");
//     const [prices, setPrices] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [categories, setCategories] = useState([]);

//     useEffect(() => {
//         const fetchPrices = async () => {
//             try {
//                 setLoading(true);
//                 const response = await axios.get(route("ourprice.index"));
//                 const data = response.data.data;
//                 setPrices(data);

//                 const uniqueCategories = [...new Set(data.map((p) => p.category))].filter(Boolean);
//                 setCategories(uniqueCategories);

//                 if (uniqueCategories.length > 0) {
//                     setActiveTab(uniqueCategories[0]);
//                 }
//             } catch (err) {
//                 console.error("Error fetching prices:", err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchPrices();
//     }, []);

//     const getPricesByCategory = () => {
//         const filtered = prices.filter((p) => p.category === activeTab);

//         if (activeTab.toLowerCase() === "standard lessons" && filtered.length >= 3) {
//             const mostPopularIndex = filtered.findIndex(
//                 (p) => p.duration && p.duration.toLowerCase().includes("2")
//             );

//             if (mostPopularIndex !== -1) {
//                 const reordered = [...filtered];
//                 const [mostPopular] = reordered.splice(mostPopularIndex, 1);
//                 reordered.splice(Math.floor(reordered.length / 2), 0, mostPopular);
//                 return reordered;
//             }
//         }

//         return filtered;
//     };

//     const getBookingRoute = (slug, category) =>
//         category === "test packages" ? `/calendar/test/${slug}` : `/calendar/${slug}`;

//     // Tailwind needs literal class names to detect them at build time, so
//     // dynamic strings like `bg-${color}` won't work — use a lookup map instead.
//     const colorClasses = {
//         amber: { border: "border-amber-400", ring: "ring-4 ring-amber-100", tag: "bg-amber-500" },
//         blue: { border: "border-blue-300", ring: "", tag: "bg-blue-500" },
//         slate: { border: "border-slate-800", ring: "", tag: "bg-slate-900" },
//     };

//     const renderFeatures = (features) => {
//         if (!features) return null;

//         try {
//             const cleaned = features.trim().replace(/^["']|["']$/g, "");
//             const tempDiv = document.createElement("div");
//             tempDiv.innerHTML = cleaned;

//             let items = [];
//             const listItems = tempDiv.querySelectorAll("li");
//             if (listItems.length > 0) {
//                 listItems.forEach((li) => {
//                     const text = li.textContent.trim();
//                     if (text) items.push(text);
//                 });
//             } else {
//                 const text = tempDiv.textContent || cleaned;
//                 items = text.split(/[•\n\-]/).map((i) => i.trim()).filter(Boolean);
//             }

//             if (items.length === 0) items = [cleaned.replace(/<[^>]*>/g, "")];

//             return (
//                 <div className="space-y-2">
//                     {items.map((feature, i) => (
//                         <div key={i} className="flex items-start gap-2">
//                             <Check className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
//                             <span className="text-slate-600 text-xs sm:text-sm leading-relaxed">
//                                 {feature}
//                             </span>
//                         </div>
//                     ))}
//                 </div>
//             );
//         } catch (error) {
//             console.error("Error parsing features:", error);
//             return (
//                 <div className="flex items-start gap-2">
//                     <Check className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
//                     <span className="text-slate-600 text-xs sm:text-sm">
//                         {features.replace(/<[^>]*>/g, "").trim()}
//                     </span>
//                 </div>
//             );
//         }
//     };

//     const PricingCard = ({ duration, price, description, features, discount, category, slug }) => {
//         const isPackageBundle = category?.toLowerCase().includes("package bundles");
//         const isLogBookPackage = description?.toLowerCase().includes("log book package");
//         const isTestOnly = category?.toLowerCase() === "test packages" && duration?.toLowerCase().includes("test only");

//         let tag = null;
//         if (category?.toLowerCase() === "standard lessons" && duration?.toLowerCase().includes("2")) {
//             tag = { text: "Most Popular", icon: Star, color: "amber" };
//         } else if (description?.toLowerCase().includes("10 x 1-hour lessons")) {
//             tag = { text: "Popular", icon: Star, color: "blue" };
//         } else if (isLogBookPackage) {
//             tag = { text: "Special Offer", icon: Flag, color: "slate" };
//         }

//         const bookingRoute = getBookingRoute(slug, category);
//         const isHighlighted = tag?.text === "Most Popular";
//         const colors = colorClasses[tag?.color] || colorClasses["blue"];

//         const renderButton = () => {
//             if (isPackageBundle || isTestOnly) {
//                 return (
//                     <a
//                         href="tel:+1234567890"
//                         className="w-full py-3.5 sm:py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 mt-auto text-white shadow-md hover:shadow-lg bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
//                     >
//                         <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
//                         Call Now
//                         <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
//                     </a>
//                 );
//             }

//             return (
//                 <Link
//                     href={bookingRoute}
//                     className="w-full py-3.5 sm:py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 mt-auto text-white shadow-md hover:shadow-lg bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
//                 >
//                     {isLogBookPackage ? "Learn More" : "Book Now"}
//                     <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
//                 </Link>
//             );
//         };

//         return (
//             <div
//                 className={`relative bg-white rounded-2xl flex flex-col h-full border transition-all duration-300 hover:-translate-y-1 ${
//                     tag ? `${colors.border} ${colors.ring} shadow-lg` : "border-slate-200 shadow-sm hover:shadow-lg"
//                 } ${isHighlighted ? "md:-translate-y-2 z-10" : ""}`}
//             >
//                 {tag && (
//                     <div
//                         className={`absolute -top-3.5 left-6 ${colors.tag} text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 whitespace-nowrap`}
//                     >
//                         <tag.icon className="w-3.5 h-3.5 fill-current" />
//                         {tag.text}
//                     </div>
//                 )}

//                 <div className="p-5 sm:p-6 lg:p-8 flex flex-col flex-grow pt-7 sm:pt-8">
//                     <div className="mb-4 sm:mb-6">
//                         {!isPackageBundle && duration && (
//                             <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5">
//                                 {duration}
//                             </h3>
//                         )}
//                         {description && (
//                             <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{description}</p>
//                         )}
//                     </div>

//                     <div className="mb-5 sm:mb-6 pb-5 sm:pb-6 border-b border-slate-100">
//                         <div className="flex items-end gap-1.5">
//                             {isLogBookPackage ? (
//                                 <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">Included</span>
//                             ) : (
//                                 <>
//                                     <span className="text-sm font-semibold text-slate-400 mb-1">$</span>
//                                     <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-none">
//                                         {price}
//                                     </span>
//                                 </>
//                             )}
//                         </div>
//                         {discount && (
//                             <div className="mt-2.5 inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-semibold">
//                                 You save ${discount}
//                             </div>
//                         )}
//                     </div>

//                     {features && <div className="mb-5 sm:mb-6 flex-grow">{renderFeatures(features)}</div>}

//                     {renderButton()}
//                 </div>
//             </div>
//         );
//     };

//     const formatCategoryName = (category) =>
//         category ? category.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "Other";

//     const filteredPrices = getPricesByCategory();

//     return (
//         <div className="bg-slate-50">
//             <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-8 sm:pb-10 text-center">
//                 <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-blue-600 mb-3">
//                     Pricing
//                 </p>
//                 <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
//                     Choose your route to a licence
//                 </h2>
//                 <p className="text-slate-500 text-sm sm:text-base mt-3 max-w-xl mx-auto">
//                     Simple, transparent pricing — no hidden fees.
//                 </p>

//                 {/* Route-line divider */}
//                 {/* <div className="flex items-center justify-center gap-2 mt-8 mb-2" aria-hidden="true">
//                     <span className="w-2 h-2 rounded-full bg-blue-600" />
//                     <span className="flex-1 max-w-[240px] border-t-2 border-dashed border-slate-300" />
//                     <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
//                 </div> */}
//             </div>

//             <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-1">
//                 {loading ? (
//                     <div className="h-14 bg-slate-200/60 rounded-2xl animate-pulse" />
//                 ) : categories.length > 0 ? (
//                     <div className="bg-white border border-slate-200 rounded-2xl p-1.5 sm:p-2 flex flex-col sm:flex-row gap-1.5 shadow-sm">
//                         {categories.map((category) => (
//                             <button
//                                 key={category}
//                                 onClick={() => setActiveTab(category)}
//                                 className={`relative flex-1 py-3 px-4 lg:px-6 rounded-xl font-semibold transition-all duration-200 ease-in-out text-sm sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
//                                     activeTab === category
//                                         ? "bg-blue-600 text-white shadow-md"
//                                         : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
//                                 }`}
//                             >
//                                 {formatCategoryName(category)}
//                             </button>
//                         ))}
//                     </div>
//                 ) : (
//                     <div className="w-full text-center py-6 text-slate-400 text-sm sm:text-base font-medium">
//                         No categories available
//                     </div>
//                 )}
//             </div>

//             <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pb-16 sm:pb-20 pt-10 sm:pt-12">
//                 {loading ? (
//                     <div className="grid gap-5 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
//                         {[1, 2, 3].map((i) => (
//                             <div key={i} className="h-96 bg-white rounded-2xl border border-slate-200 animate-pulse" />
//                         ))}
//                     </div>
//                 ) : filteredPrices.length > 0 ? (
//                     <div
//                         className={`grid gap-5 sm:gap-6 lg:gap-10 ${
//                             filteredPrices.length === 1
//                                 ? "grid-cols-1 max-w-sm mx-auto"
//                                 : filteredPrices.length === 2
//                                 ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
//                                 : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
//                         }`}
//                     >
//                         {filteredPrices.map((priceItem) => (
//                             <div
//                                 key={priceItem.id}
//                                 className={
//                                     priceItem.category?.toLowerCase() === "standard lessons" &&
//                                     priceItem.duration?.toLowerCase().includes("2")
//                                         ? "pt-5 sm:pt-6 lg:pt-0"
//                                         : ""
//                                 }
//                             >
//                                 <PricingCard
//                                     duration={priceItem.duration}
//                                     price={priceItem.price}
//                                     description={priceItem.description}
//                                     features={priceItem.features}
//                                     discount={priceItem.discount}
//                                     category={priceItem.category}
//                                     slug={priceItem.slug}
//                                 />
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                     <div className="text-center py-10 sm:py-12">
//                         <div className="max-w-xs sm:max-w-md mx-auto">
//                             <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
//                                 <Route className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" />
//                             </div>
//                             <p className="text-slate-600 text-base sm:text-lg mb-1.5 font-medium">
//                                 No pricing available for {formatCategoryName(activeTab)} at the moment.
//                             </p>
//                             <p className="text-slate-400 text-xs sm:text-sm">
//                                 Please check back later or contact us for custom packages.
//                             </p>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Pricing;

