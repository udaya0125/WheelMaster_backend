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

//                 // Extract unique categories from prices
//                 const uniqueCategories = [
//                     ...new Set(
//                         response.data.data.map((price) => price.category)
//                     ),
//                 ];
//                 setCategories(uniqueCategories.filter(Boolean));

//                 // Set initial active tab to first available category
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

//     console.log("Prices:", prices);

//     // Get pricing data for the active tab
//     const getPricesByCategory = () => {
//         return prices.filter((price) => price.category === activeTab);
//     };

//     // Get the appropriate booking route based on category
//     const getBookingRoute = (slug, category) => {
//         if (category === "test packages") {
//             return `/calendar/test/${slug}`;
//         }
//         return `/calendar/${slug}`;
//     };

//     // Helper function to extract features from HTML string and render with checkmarks
//     const renderFeatures = (features) => {
//         if (!features) return null;

//         try {
//             // Clean the features string
//             const cleanedFeatures = features.trim().replace(/^["']|["']$/g, "");

//             // Extract list items from HTML string
//             // Method 1: Parse HTML to extract text (simple approach)
//             const tempDiv = document.createElement("div");
//             tempDiv.innerHTML = cleanedFeatures;

//             // Get all list items or text content
//             let featureItems = [];

//             // Check if it's a list
//             const listItems = tempDiv.querySelectorAll("li");
//             if (listItems.length > 0) {
//                 listItems.forEach((li) => {
//                     const text = li.textContent.trim();
//                     if (text) featureItems.push(text);
//                 });
//             } else {
//                 // Try to split by common separators
//                 const text = tempDiv.textContent || cleanedFeatures;
//                 featureItems = text
//                     .split(/[•\n\-]/)
//                     .map((item) => item.trim())
//                     .filter((item) => item.length > 0);
//             }

//             // If no items found, use the original text
//             if (featureItems.length === 0) {
//                 featureItems = [cleanedFeatures.replace(/<[^>]*>/g, "")];
//             }

//             return (
//                 <div className="space-y-2">
//                     {featureItems.map((feature, index) => (
//                         <div key={index} className="flex items-start gap-2">
//                             <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
//                             <span className="text-gray-700 text-sm">
//                                 {feature}
//                             </span>
//                         </div>
//                     ))}
//                 </div>
//             );
//         } catch (error) {
//             console.error("Error parsing features:", error);
//             // Fallback: return plain text with checkmark
//             const plainText = features.replace(/<[^>]*>/g, "").trim();
//             return (
//                 <div className="space-y-2">
//                     <div className="flex items-start gap-2">
//                         <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
//                         <span className="text-gray-700 text-sm">
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
//         // Check if it's a package bundle category
//         const isPackageBundle = category && category.toLowerCase().includes("package bundle");

//         // Check if it's Log Book Package
//         const isLogBookPackage = description && description.toLowerCase().includes("log book package");

//         // Determine which tag to show based on your criteria
//         let tagType = null;
//         let tagText = "";
//         let tagIcon = null;
//         let tagColorClass = "bg-blue-500"; // Default blue

//         // Check for 90 minutes duration
//         if (duration && duration.toLowerCase().includes("90")) {
//             tagType = "mostPopular";
//             tagText = "Most Popular";
//             tagIcon = <Star className="w-4 h-4 fill-current" />;
//             tagColorClass = "bg-blue-500";
//         }
//         // Check for "10 x 1-Hour Lessons" description
//         else if (description && description.toLowerCase().includes("10 x 1-hour lessons")) {
//             tagType = "popular";
//             tagText = "Popular";
//             tagIcon = <Star className="w-4 h-4 fill-current" />;
//             tagColorClass = "bg-blue-400";
//         }
//         // Check for "Log Book Package" description
//         else if (isLogBookPackage) {
//             tagType = "special";
//             tagText = "SPECIAL";
//             tagIcon = <Zap className="w-4 h-4 fill-current" />;
//             tagColorClass = "bg-blue-600";
//         }
//         // Check for Ultimate Value (50 duration or 3300 price)
//         else if ((duration && duration.includes("50")) || (price && price.includes("3300"))) {
//             tagType = "ultimate";
//             tagText = "Ultimate Value";
//             tagIcon = <Crown className="w-4 h-4 fill-current" />;
//             tagColorClass = "bg-blue-500";
//         }
//         // Check for Best Value (25 duration or 1670 price)
//         else if ((duration && duration.includes("25")) || (price && price.includes("1670"))) {
//             tagType = "bestValue";
//             tagText = "Best Value";
//             tagIcon = <Zap className="w-4 h-4 fill-current" />;
//             tagColorClass = "bg-blue-400";
//         }

//         // Get the correct booking route
//         const bookingRoute = getBookingRoute(slug, category);

//         // Determine border color based on tag type
//         const getBorderColor = () => {
//             switch(tagType) {
//                 case "mostPopular": return "border-blue-500";
//                 case "popular": return "border-blue-400";
//                 case "special": return "border-blue-600";
//                 case "ultimate": return "border-blue-500";
//                 case "bestValue": return "border-blue-400";
//                 default: return "border-gray-200";
//             }
//         };

//         // Determine button color based on tag type
//         const getButtonColor = () => {
//             switch(tagType) {
//                 case "mostPopular": return "bg-blue-500 hover:bg-blue-600";
//                 case "popular": return "bg-blue-400 hover:bg-blue-500";
//                 case "special": return "bg-blue-600 hover:bg-blue-700";
//                 case "ultimate": return "bg-blue-500 hover:bg-blue-600";
//                 case "bestValue": return "bg-blue-400 hover:bg-blue-500";
//                 default: return "bg-blue-500 hover:bg-blue-600";
//             }
//         };

//         // Render price section - show "Included" for Log Book Package
//         const renderPriceSection = () => {
//             if (isLogBookPackage) {
//                 return (
//                     <div className="text-center mb-6">
//                         <div className="flex items-baseline justify-center">
//                             <span className="text-4xl sm:text-5xl font-bold text-gray-900">
//                                 Included
//                             </span>
//                         </div>
//                         {/* <p className="text-gray-600 text-sm mt-2">
//                             With qualifying packages
//                         </p> */}
//                     </div>
//                 );
//             }

//             return (
//                 <div className="text-center mb-6">
//                     <div className="flex items-baseline justify-center gap-1">
//                         <span className="text-4xl sm:text-5xl font-bold text-gray-900">
//                             ${price}
//                         </span>
//                     </div>
//                     {discount && (
//                         <div className="mt-2 inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
//                             Save ${discount}
//                         </div>
//                     )}
//                 </div>
//             );
//         };

//         return (
//             <div
//                 className={`relative bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col h-full ${
//                     tagType
//                         ? `${getBorderColor()} ${tagType === "mostPopular" ? "scale-105 md:scale-110" : ""}`
//                         : "border border-gray-200"
//                 }`}
//             >
//                 {tagType && (
//                     <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 ${tagColorClass} text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1`}>
//                         {tagIcon}
//                         {tagText}
//                     </div>
//                 )}

//                 <div className="p-6 sm:p-8 flex flex-col flex-grow">
//                     <div className="text-center mb-6">
//                         {/* Don't show duration for package bundles */}
//                         {!isPackageBundle && duration && (
//                             <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
//                                 {duration}
//                             </h3>
//                         )}
//                         {description && (
//                             <p className="text-gray-600 text-sm">{description}</p>
//                         )}
//                     </div>

//                     {/* Price section with conditional rendering */}
//                     {renderPriceSection()}

//                     {/* Features list with checkmarks */}
//                     {features && (
//                         <div className="mb-6 flex-grow">
//                             {renderFeatures(features)}
//                         </div>
//                     )}

//                     <Link
//                         href={bookingRoute}
//                         className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 mt-auto text-white shadow-lg hover:shadow-xl ${getButtonColor()}`}
//                     >
//                         {isLogBookPackage ? "Learn More" : "Book Now"}
//                         <ArrowRight className="w-5 h-5" />
//                     </Link>
//                 </div>
//             </div>
//         );
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//                     <p className="mt-4 text-gray-600">Loading pricing...</p>
//                 </div>
//             </div>
//         );
//     }

//     // Format category name for display
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
//             <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 -mt-8">
//                 <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
//                     <div className="text-center mb-8">
//                         <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
//                             Select Package Type
//                         </h2>
//                     </div>

//                     <div className="bg-gray-100 rounded-2xl p-2 flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4">
//                         {categories.length > 0 ? (
//                             categories.map((category) => (
//                                 <button
//                                     key={category}
//                                     onClick={() => setActiveTab(category)}
//                                     className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] ${
//                                         activeTab === category
//                                             ? "bg-white text-blue-600 shadow-lg"
//                                             : "text-gray-700 hover:bg-white hover:text-blue-600"
//                                     }`}
//                                 >
//                                     {formatCategoryName(category)}
//                                 </button>
//                             ))
//                         ) : (
//                             <div className="w-full text-center py-4 text-gray-500">
//                                 No categories available
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Pricing Cards */}
//             <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
//                 {getPricesByCategory().length > 0 ? (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
//                         {getPricesByCategory().map((priceItem) => (
//                             <PricingCard
//                                 key={priceItem.id}
//                                 duration={priceItem.duration}
//                                 price={priceItem.price}
//                                 description={priceItem.description}
//                                 features={priceItem.features}
//                                 discount={priceItem.discount}
//                                 category={priceItem.category}
//                                 slug={priceItem.slug}
//                             />
//                         ))}
//                     </div>
//                 ) : (
//                     <div className="text-center py-12">
//                         <div className="max-w-md mx-auto">
//                             <svg
//                                 className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
//                             <p className="text-gray-500 text-lg mb-4">
//                                 No pricing available for{" "}
//                                 {formatCategoryName(activeTab)} at the moment.
//                             </p>
//                             <p className="text-gray-400 text-sm">
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

//                 // Extract unique categories from prices
//                 const uniqueCategories = [
//                     ...new Set(
//                         response.data.data.map((price) => price.category)
//                     ),
//                 ];
//                 setCategories(uniqueCategories.filter(Boolean));

//                 // Set initial active tab to first available category
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

//     //console.log("Prices:", prices);

//     // Get pricing data for the active tab
//     const getPricesByCategory = () => {
//         return prices.filter((price) => price.category === activeTab);
//     };

//     // Get the appropriate booking route based on category
//     const getBookingRoute = (slug, category) => {
//         if (category === "test packages") {
//             return `/calendar/test/${slug}`;
//         }
//         return `/calendar/${slug}`;
//     };

//     // Helper function to extract features from HTML string and render with checkmarks
//     const renderFeatures = (features) => {
//         if (!features) return null;

//         try {
//             // Clean the features string
//             const cleanedFeatures = features.trim().replace(/^["']|["']$/g, "");

//             // Extract list items from HTML string
//             // Method 1: Parse HTML to extract text (simple approach)
//             const tempDiv = document.createElement("div");
//             tempDiv.innerHTML = cleanedFeatures;

//             // Get all list items or text content
//             let featureItems = [];

//             // Check if it's a list
//             const listItems = tempDiv.querySelectorAll("li");
//             if (listItems.length > 0) {
//                 listItems.forEach((li) => {
//                     const text = li.textContent.trim();
//                     if (text) featureItems.push(text);
//                 });
//             } else {
//                 // Try to split by common separators
//                 const text = tempDiv.textContent || cleanedFeatures;
//                 featureItems = text
//                     .split(/[•\n\-]/)
//                     .map((item) => item.trim())
//                     .filter((item) => item.length > 0);
//             }

//             // If no items found, use the original text
//             if (featureItems.length === 0) {
//                 featureItems = [cleanedFeatures.replace(/<[^>]*>/g, "")];
//             }

//             return (
//                 <div className="space-y-2">
//                     {featureItems.map((feature, index) => (
//                         <div key={index} className="flex items-start gap-2">
//                             <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
//                             <span className="text-gray-700 text-sm">
//                                 {feature}
//                             </span>
//                         </div>
//                     ))}
//                 </div>
//             );
//         } catch (error) {
//             console.error("Error parsing features:", error);
//             // Fallback: return plain text with checkmark
//             const plainText = features.replace(/<[^>]*>/g, "").trim();
//             return (
//                 <div className="space-y-2">
//                     <div className="flex items-start gap-2">
//                         <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
//                         <span className="text-gray-700 text-sm">
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
//         // Check if it's a package bundle category
//         const isPackageBundle = category && category.toLowerCase().includes("package bundle");

//         // Check if it's Log Book Package
//         const isLogBookPackage = description && description.toLowerCase().includes("log book package");

//         // Determine which tag to show based on your criteria
//         let tagType = null;
//         let tagText = "";
//         let tagIcon = null;
//         let tagColorClass = "bg-blue-500"; // Default blue

//         // Check for 90 minutes duration
//         if (duration && duration.toLowerCase().includes("2")) {
//             tagType = "mostPopular";
//             tagText = "Most Popular";
//             tagIcon = <Star className="w-4 h-4 fill-current" />;
//             tagColorClass = "bg-blue-500";
//         }
//         // Check for "10 x 1-Hour Lessons" description
//         else if (description && description.toLowerCase().includes("10 x 1-hour lessons")) {
//             tagType = "popular";
//             tagText = "Popular";
//             tagIcon = <Star className="w-4 h-4 fill-current" />;
//             tagColorClass = "bg-blue-400";
//         }
//         // Check for "Log Book Package" description
//         else if (isLogBookPackage) {
//             tagType = "special";
//             tagText = "SPECIAL";
//             tagIcon = <Zap className="w-4 h-4 fill-current" />;
//             tagColorClass = "bg-blue-600";
//         }

//         // Get the correct booking route
//         const bookingRoute = getBookingRoute(slug, category);

//         // Determine border color based on tag type
//         const getBorderColor = () => {
//             switch(tagType) {
//                 case "mostPopular": return "border-blue-500";
//                 case "popular": return "border-blue-400";
//                 case "special": return "border-blue-600";
//                 default: return "border-gray-200";
//             }
//         };

//         // Determine button color based on tag type
//         const getButtonColor = () => {
//             switch(tagType) {
//                 case "mostPopular": return "bg-blue-500 hover:bg-blue-600";
//                 case "popular": return "bg-blue-400 hover:bg-blue-500";
//                 case "special": return "bg-blue-600 hover:bg-blue-700";
//                 default: return "bg-blue-500 hover:bg-blue-600";
//             }
//         };

//         // Render price section - show "Included" for Log Book Package
//         const renderPriceSection = () => {
//             if (isLogBookPackage) {
//                 return (
//                     <div className="text-center mb-6">
//                         <div className="flex items-baseline justify-center">
//                             <span className="text-4xl sm:text-5xl font-bold text-gray-900">
//                                 Included
//                             </span>
//                         </div>
//                         {/* <p className="text-gray-600 text-sm mt-2">
//                             With qualifying packages
//                         </p> */}
//                     </div>
//                 );
//             }

//             return (
//                 <div className="text-center mb-6">
//                     <div className="flex items-baseline justify-center gap-1">
//                         <span className="text-4xl sm:text-5xl font-bold text-gray-900">
//                             ${price}
//                         </span>
//                     </div>
//                     {discount && (
//                         <div className="mt-2 inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
//                             Save ${discount}
//                         </div>
//                     )}
//                 </div>
//             );
//         };

//         return (
//             <div
//                 className={`relative bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col h-full ${
//                     tagType
//                         ? `${getBorderColor()} ${tagType === "mostPopular" ? "scale-105 md:scale-110" : ""}`
//                         : "border border-gray-200"
//                 }`}
//             >
//                 {tagType && (
//                     <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 ${tagColorClass} text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1`}>
//                         {tagIcon}
//                         {tagText}
//                     </div>
//                 )}

//                 <div className="p-6 sm:p-8 flex flex-col flex-grow">
//                     <div className="text-center mb-6">
//                         {/* Don't show duration for package bundles */}
//                         {!isPackageBundle && duration && (
//                             <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
//                                 {duration}
//                             </h3>
//                         )}
//                         {description && (
//                             <p className="text-gray-600 text-sm">{description}</p>
//                         )}
//                     </div>

//                     {/* Price section with conditional rendering */}
//                     {renderPriceSection()}

//                     {/* Features list with checkmarks */}
//                     {features && (
//                         <div className="mb-6 flex-grow">
//                             {renderFeatures(features)}
//                         </div>
//                     )}

//                     <Link
//                         href={bookingRoute}
//                         className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 mt-auto text-white shadow-lg hover:shadow-xl ${getButtonColor()}`}
//                     >
//                         {isLogBookPackage ? "Learn More" : "Book Now"}
//                         <ArrowRight className="w-5 h-5" />
//                     </Link>
//                 </div>
//             </div>
//         );
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//                     <p className="mt-4 text-gray-600">Loading pricing...</p>
//                 </div>
//             </div>
//         );
//     }

//     // Format category name for display
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
//             <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 -mt-8">
//                 <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
//                     <div className="text-center mb-8">
//                         <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
//                             Select Package Type
//                         </h2>
//                     </div>

//                     <div className="bg-gray-100 rounded-2xl p-2 flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4">
//                         {categories.length > 0 ? (
//                             categories.map((category) => (
//                                 <button
//                                     key={category}
//                                     onClick={() => setActiveTab(category)}
//                                     className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] ${
//                                         activeTab === category
//                                             ? "bg-white text-blue-600 shadow-lg"
//                                             : "text-gray-700 hover:bg-white hover:text-blue-600"
//                                     }`}
//                                 >
//                                     {formatCategoryName(category)}
//                                 </button>
//                             ))
//                         ) : (
//                             <div className="w-full text-center py-4 text-gray-500">
//                                 No categories available
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Pricing Cards */}
//             <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
//                 {getPricesByCategory().length > 0 ? (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
//                         {getPricesByCategory().map((priceItem) => (
//                             <PricingCard
//                                 key={priceItem.id}
//                                 duration={priceItem.duration}
//                                 price={priceItem.price}
//                                 description={priceItem.description}
//                                 features={priceItem.features}
//                                 discount={priceItem.discount}
//                                 category={priceItem.category}
//                                 slug={priceItem.slug}
//                             />
//                         ))}
//                     </div>
//                 ) : (
//                     <div className="text-center py-12">
//                         <div className="max-w-md mx-auto">
//                             <svg
//                                 className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
//                             <p className="text-gray-500 text-lg mb-4">
//                                 No pricing available for{" "}
//                                 {formatCategoryName(activeTab)} at the moment.
//                             </p>
//                             <p className="text-gray-400 text-sm">
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

//                 // Extract unique categories from prices
//                 const uniqueCategories = [
//                     ...new Set(
//                         response.data.data.map((price) => price.category),
//                     ),
//                 ];
//                 setCategories(uniqueCategories.filter(Boolean));

//                 // Set initial active tab to first available category
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

//     console.log("Prices:", prices);

//     // Get pricing data for the active tab and reorder to put "Most Popular" in the middle
//     const getPricesByCategory = () => {
//         const filteredPrices = prices.filter((price) => price.category === activeTab);
        
//         // Only reorder for standard lessons category
//         if (activeTab.toLowerCase() === "standard lessons" && filteredPrices.length >= 3) {
//             // Find the index of the "Most Popular" card (120 minutes duration)
//             const mostPopularIndex = filteredPrices.findIndex(
//                 (price) => price.duration && price.duration.toLowerCase().includes("2")
//             );
            
//             if (mostPopularIndex !== -1) {
//                 // Create a new array with the "Most Popular" card in the middle
//                 const reorderedPrices = [...filteredPrices];
//                 const [mostPopularCard] = reorderedPrices.splice(mostPopularIndex, 1);
                
//                 // Calculate middle index
//                 const middleIndex = Math.floor(reorderedPrices.length / 2);
                
//                 // Insert the most popular card at the middle position
//                 reorderedPrices.splice(middleIndex, 0, mostPopularCard);
                
//                 return reorderedPrices;
//             }
//         }
        
//         return filteredPrices;
//     };

//     // Get the appropriate booking route based on category
//     const getBookingRoute = (slug, category) => {
//         if (category === "test packages") {
//             return `/calendar/test/${slug}`;
//         }
//         return `/calendar/${slug}`;
//     };

//     // Helper function to extract features from HTML string and render with checkmarks
//     const renderFeatures = (features) => {
//         if (!features) return null;

//         try {
//             // Clean the features string
//             const cleanedFeatures = features.trim().replace(/^["']|["']$/g, "");

//             // Extract list items from HTML string
//             // Method 1: Parse HTML to extract text (simple approach)
//             const tempDiv = document.createElement("div");
//             tempDiv.innerHTML = cleanedFeatures;

//             // Get all list items or text content
//             let featureItems = [];

//             // Check if it's a list
//             const listItems = tempDiv.querySelectorAll("li");
//             if (listItems.length > 0) {
//                 listItems.forEach((li) => {
//                     const text = li.textContent.trim();
//                     if (text) featureItems.push(text);
//                 });
//             } else {
//                 // Try to split by common separators
//                 const text = tempDiv.textContent || cleanedFeatures;
//                 featureItems = text
//                     .split(/[•\n\-]/)
//                     .map((item) => item.trim())
//                     .filter((item) => item.length > 0);
//             }

//             // If no items found, use the original text
//             if (featureItems.length === 0) {
//                 featureItems = [cleanedFeatures.replace(/<[^>]*>/g, "")];
//             }

//             return (
//                 <div className="space-y-2">
//                     {featureItems.map((feature, index) => (
//                         <div key={index} className="flex items-start gap-2">
//                             <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
//                             <span className="text-gray-700 text-sm">
//                                 {feature}
//                             </span>
//                         </div>
//                     ))}
//                 </div>
//             );
//         } catch (error) {
//             console.error("Error parsing features:", error);
//             // Fallback: return plain text with checkmark
//             const plainText = features.replace(/<[^>]*>/g, "").trim();
//             return (
//                 <div className="space-y-2">
//                     <div className="flex items-start gap-2">
//                         <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
//                         <span className="text-gray-700 text-sm">
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
//         // Check if it's a package bundle category
//         const isPackageBundle =
//             category && category.toLowerCase().includes("package bundles");

//         // Check if it's Log Book Package
//         const isLogBookPackage =
//             description &&
//             description.toLowerCase().includes("log book package");

//         // NEW CONDITION: Check if it's test packages category with Test Only duration
//         const isTestOnly =
//             category &&
//             category.toLowerCase() === "test packages" &&
//             duration &&
//             duration.toLowerCase().includes("test only");

//         // Determine which tag to show based on your criteria
//         let tagType = null;
//         let tagText = "";
//         let tagIcon = null;
//         let tagColorClass = "bg-blue-500"; // Default blue

//         // Check for 120 minutes duration in standard lessons category
//         if (
//             category &&
//             category.toLowerCase() === "standard lessons" &&
//             duration &&
//             duration.toLowerCase().includes("2")
//         ) {
//             tagType = "mostPopular";
//             tagText = "Most Popular";
//             tagIcon = <Star className="w-4 h-4 fill-current" />;
//             tagColorClass = "bg-blue-500";
//         }
//         // Check for "10 x 1-Hour Lessons" description
//         else if (
//             description &&
//             description.toLowerCase().includes("10 x 1-hour lessons")
//         ) {
//             tagType = "popular";
//             tagText = "Popular";
//             tagIcon = <Star className="w-4 h-4 fill-current" />;
//             tagColorClass = "bg-blue-400";
//         }
//         // Check for "Log Book Package" description
//         else if (isLogBookPackage) {
//             tagType = "special";
//             tagText = "SPECIAL";
//             tagIcon = <Zap className="w-4 h-4 fill-current" />;
//             tagColorClass = "bg-blue-600";
//         }

//         // Get the correct booking route
//         const bookingRoute = getBookingRoute(slug, category);

//         // Determine border color based on tag type
//         const getBorderColor = () => {
//             switch (tagType) {
//                 case "mostPopular":
//                     return "border-blue-500";
//                 case "popular":
//                     return "border-blue-400";
//                 case "special":
//                     return "border-blue-600";
//                 default:
//                     return "border-gray-200";
//             }
//         };

//         // Determine button color based on tag type
//         const getButtonColor = () => {
//             switch (tagType) {
//                 case "mostPopular":
//                     return "bg-blue-500 hover:bg-blue-600";
//                 case "popular":
//                     return "bg-blue-400 hover:bg-blue-500";
//                 case "special":
//                     return "bg-blue-600 hover:bg-blue-700";
//                 default:
//                     return "bg-blue-500 hover:bg-blue-600";
//             }
//         };

//         // Render price section - show "Included" for Log Book Package
//         const renderPriceSection = () => {
//             if (isLogBookPackage) {
//                 return (
//                     <div className="text-center mb-6">
//                         <div className="flex items-baseline justify-center">
//                             <span className="text-4xl sm:text-5xl font-bold text-gray-900">
//                                 Included
//                             </span>
//                         </div>
//                         {/* <p className="text-gray-600 text-sm mt-2">
//                             With qualifying packages
//                         </p> */}
//                     </div>
//                 );
//             }

//             return (
//                 <div className="text-center mb-6">
//                     <div className="flex items-baseline justify-center gap-1">
//                         <span className="text-4xl sm:text-5xl font-bold text-gray-900">
//                             ${price}
//                         </span>
//                     </div>
//                     {discount && (
//                         <div className="mt-2 inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
//                             Save ${discount}
//                         </div>
//                     )}
//                 </div>
//             );
//         };

//         // Render button based on category and test only condition
//         const renderButton = () => {
//             // Show Call Now for Package Bundles OR Test Packages with Test Only duration
//             if (isPackageBundle || isTestOnly) {
//                 return (
//                     <a
//                         href="tel:+1234567890" // Replace with your actual phone number
//                         className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 mt-auto text-white shadow-lg hover:shadow-xl ${getButtonColor()}`}
//                     >
//                         <Phone className="w-5 h-5" />
//                         Call Now
//                         <ArrowRight className="w-5 h-5" />
//                     </a>
//                 );
//             }

//             return (
//                 <Link
//                     href={bookingRoute}
//                     className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 mt-auto text-white shadow-lg hover:shadow-xl ${getButtonColor()}`}
//                 >
//                     {isLogBookPackage ? "Learn More" : "Book Now"}
//                     <ArrowRight className="w-5 h-5" />
//                 </Link>
//             );
//         };

//         return (
//             <div
//                 className={`relative bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col h-full ${
//                     tagType
//                         ? `${getBorderColor()} ${tagType === "mostPopular" ? "scale-105 md:scale-110 z-10" : ""}`
//                         : "border border-gray-200"
//                 }`}
//             >
//                 {tagType && (
//                     <div
//                         className={`absolute -top-4 left-1/2 transform -translate-x-1/2 ${tagColorClass} text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1 whitespace-nowrap`}
//                     >
//                         {tagIcon}
//                         {tagText}
//                     </div>
//                 )}

//                 <div className="p-6 sm:p-8 flex flex-col flex-grow">
//                     <div className="text-center mb-6">
//                         {/* Don't show duration for package bundles */}
//                         {!isPackageBundle && duration && (
//                             <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
//                                 {duration}
//                             </h3>
//                         )}
//                         {description && (
//                             <p className="text-gray-600 text-sm">
//                                 {description}
//                             </p>
//                         )}
//                     </div>

//                     {/* Price section with conditional rendering */}
//                     {renderPriceSection()}

//                     {/* Features list with checkmarks */}
//                     {features && (
//                         <div className="mb-6 flex-grow">
//                             {renderFeatures(features)}
//                         </div>
//                     )}

//                     {/* Button with conditional rendering */}
//                     {renderButton()}
//                 </div>
//             </div>
//         );
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//                     <p className="mt-4 text-gray-600">Loading pricing...</p>
//                 </div>
//             </div>
//         );
//     }

//     // Format category name for display
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
//             <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 -mt-8">
//                 <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
//                     <div className="text-center mb-8">
//                         <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
//                             Select Package Type
//                         </h2>
//                     </div>

//                     <div className="bg-gray-100 rounded-2xl p-2 flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4">
//                         {categories.length > 0 ? (
//                             categories.map((category) => (
//                                 <button
//                                     key={category}
//                                     onClick={() => setActiveTab(category)}
//                                     className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] ${
//                                         activeTab === category
//                                             ? "bg-white text-blue-600 shadow-lg"
//                                             : "text-gray-700 hover:bg-white hover:text-blue-600"
//                                     }`}
//                                 >
//                                     {formatCategoryName(category)}
//                                 </button>
//                             ))
//                         ) : (
//                             <div className="w-full text-center py-4 text-gray-500">
//                                 No categories available
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Pricing Cards */}
//             <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
//                 {getPricesByCategory().length > 0 ? (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
//                         {getPricesByCategory().map((priceItem, index) => (
//                             <PricingCard
//                                 key={priceItem.id}
//                                 duration={priceItem.duration}
//                                 price={priceItem.price}
//                                 description={priceItem.description}
//                                 features={priceItem.features}
//                                 discount={priceItem.discount}
//                                 category={priceItem.category}
//                                 slug={priceItem.slug}
//                             />
//                         ))}
//                     </div>
//                 ) : (
//                     <div className="text-center py-12">
//                         <div className="max-w-md mx-auto">
//                             <svg
//                                 className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
//                             <p className="text-gray-500 text-lg mb-4">
//                                 No pricing available for{" "}
//                                 {formatCategoryName(activeTab)} at the moment.
//                             </p>
//                             <p className="text-gray-400 text-sm">
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
import { Check, Star, Crown, Zap, ArrowRight, Phone, Mail } from "lucide-react";
import { Link } from "@inertiajs/react";
import axios from "axios";

const Pricing = ({ price }) => {
    const [activeTab, setActiveTab] = useState("standard lessons");
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                setLoading(true);
                const response = await axios.get(route("ourprice.index"));
                setPrices(response.data.data);

                const uniqueCategories = [
                    ...new Set(
                        response.data.data.map((price) => price.category),
                    ),
                ];
                setCategories(uniqueCategories.filter(Boolean));

                if (uniqueCategories.length > 0 && uniqueCategories[0]) {
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
        const filteredPrices = prices.filter((price) => price.category === activeTab);

        if (activeTab.toLowerCase() === "standard lessons" && filteredPrices.length >= 3) {
            const mostPopularIndex = filteredPrices.findIndex(
                (price) => price.duration && price.duration.toLowerCase().includes("2")
            );

            if (mostPopularIndex !== -1) {
                const reorderedPrices = [...filteredPrices];
                const [mostPopularCard] = reorderedPrices.splice(mostPopularIndex, 1);
                const middleIndex = Math.floor(reorderedPrices.length / 2);
                reorderedPrices.splice(middleIndex, 0, mostPopularCard);
                return reorderedPrices;
            }
        }

        return filteredPrices;
    };

    const getBookingRoute = (slug, category) => {
        if (category === "test packages") {
            return `/calendar/test/${slug}`;
        }
        return `/calendar/${slug}`;
    };

    const renderFeatures = (features) => {
        if (!features) return null;

        try {
            const cleanedFeatures = features.trim().replace(/^["']|["']$/g, "");
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = cleanedFeatures;

            let featureItems = [];
            const listItems = tempDiv.querySelectorAll("li");
            if (listItems.length > 0) {
                listItems.forEach((li) => {
                    const text = li.textContent.trim();
                    if (text) featureItems.push(text);
                });
            } else {
                const text = tempDiv.textContent || cleanedFeatures;
                featureItems = text
                    .split(/[•\n\-]/)
                    .map((item) => item.trim())
                    .filter((item) => item.length > 0);
            }

            if (featureItems.length === 0) {
                featureItems = [cleanedFeatures.replace(/<[^>]*>/g, "")];
            }

            return (
                <div className="space-y-2">
                    {featureItems.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                                {feature}
                            </span>
                        </div>
                    ))}
                </div>
            );
        } catch (error) {
            console.error("Error parsing features:", error);
            const plainText = features.replace(/<[^>]*>/g, "").trim();
            return (
                <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-xs sm:text-sm">
                            {plainText}
                        </span>
                    </div>
                </div>
            );
        }
    };

    const PricingCard = ({
        duration,
        price,
        description,
        features,
        discount,
        category,
        slug,
    }) => {
        const isPackageBundle =
            category && category.toLowerCase().includes("package bundles");

        const isLogBookPackage =
            description &&
            description.toLowerCase().includes("log book package");

        const isTestOnly =
            category &&
            category.toLowerCase() === "test packages" &&
            duration &&
            duration.toLowerCase().includes("test only");

        let tagType = null;
        let tagText = "";
        let tagIcon = null;
        let tagColorClass = "bg-blue-500";

        if (
            category &&
            category.toLowerCase() === "standard lessons" &&
            duration &&
            duration.toLowerCase().includes("2")
        ) {
            tagType = "mostPopular";
            tagText = "Most Popular";
            tagIcon = <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />;
            tagColorClass = "bg-blue-500";
        } else if (
            description &&
            description.toLowerCase().includes("10 x 1-hour lessons")
        ) {
            tagType = "popular";
            tagText = "Popular";
            tagIcon = <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />;
            tagColorClass = "bg-blue-400";
        } else if (isLogBookPackage) {
            tagType = "special";
            tagText = "SPECIAL";
            tagIcon = <Zap className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />;
            tagColorClass = "bg-blue-600";
        }

        const bookingRoute = getBookingRoute(slug, category);

        const getBorderColor = () => {
            switch (tagType) {
                case "mostPopular": return "border-blue-500";
                case "popular": return "border-blue-400";
                case "special": return "border-blue-600";
                default: return "border-gray-200";
            }
        };

        const getButtonColor = () => {
            switch (tagType) {
                case "mostPopular": return "bg-blue-500 hover:bg-blue-600";
                case "popular": return "bg-blue-400 hover:bg-blue-500";
                case "special": return "bg-blue-600 hover:bg-blue-700";
                default: return "bg-blue-500 hover:bg-blue-600";
            }
        };

        const renderPriceSection = () => {
            if (isLogBookPackage) {
                return (
                    <div className="text-center mb-4 sm:mb-6">
                        <div className="flex items-baseline justify-center">
                            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                                Included
                            </span>
                        </div>
                    </div>
                );
            }

            return (
                <div className="text-center mb-4 sm:mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                            ${price}
                        </span>
                    </div>
                    {discount && (
                        <div className="mt-2 inline-block bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                            Save ${discount}
                        </div>
                    )}
                </div>
            );
        };

        const renderButton = () => {
            if (isPackageBundle || isTestOnly) {
                return (
                    <a
                        href="tel:+1234567890"
                        className={`w-full py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 mt-auto text-white shadow-lg hover:shadow-xl text-sm sm:text-base ${getButtonColor()}`}
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
                    className={`w-full py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 mt-auto text-white shadow-lg hover:shadow-xl text-sm sm:text-base ${getButtonColor()}`}
                >
                    {isLogBookPackage ? "Learn More" : "Book Now"}
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
            );
        };

        return (
            <div
                className={`relative bg-white rounded-2xl sm:rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col h-full border-2 ${
                    tagType
                        ? `${getBorderColor()} ${tagType === "mostPopular" ? "md:scale-105 lg:scale-110 z-10" : ""}`
                        : "border-gray-200"
                }`}
            >
                {tagType && (
                    <div
                        className={`absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 ${tagColorClass} text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center gap-1 whitespace-nowrap`}
                    >
                        {tagIcon}
                        {tagText}
                    </div>
                )}

                <div className="p-5 sm:p-6 lg:p-8 flex flex-col flex-grow">
                    <div className="text-center mb-4 sm:mb-6">
                        {!isPackageBundle && duration && (
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                                {duration}
                            </h3>
                        )}
                        {description && (
                            <p className="text-gray-600 text-xs sm:text-sm">
                                {description}
                            </p>
                        )}
                    </div>

                    {renderPriceSection()}

                    {features && (
                        <div className="mb-4 sm:mb-6 flex-grow">
                            {renderFeatures(features)}
                        </div>
                    )}

                    {renderButton()}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading pricing...</p>
                </div>
            </div>
        );
    }

    const formatCategoryName = (category) => {
        if (!category) return "Other";
        return category
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">

            {/* Tab Navigation */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12 -mt-4 sm:-mt-8">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 lg:p-6">
                    <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                            Select Package Type
                        </h2>
                    </div>

                    {/* Tabs: stack vertically on mobile, horizontal on sm+ */}
                    <div className="bg-gray-100 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 flex flex-col sm:flex-row gap-1.5 sm:gap-2 lg:gap-4">
                        {categories.length > 0 ? (
                            categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setActiveTab(category)}
                                    className={`flex-1 py-3 sm:py-3.5 lg:py-4 px-3 sm:px-4 lg:px-6 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base transform hover:scale-[1.02] ${
                                        activeTab === category
                                            ? "bg-white text-blue-600 shadow-lg"
                                            : "text-gray-700 hover:bg-white hover:text-blue-600"
                                    }`}
                                >
                                    {formatCategoryName(category)}
                                </button>
                            ))
                        ) : (
                            <div className="w-full text-center py-4 text-gray-500 text-sm sm:text-base">
                                No categories available
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pb-10 sm:pb-12 lg:py-12">
                {getPricesByCategory().length > 0 ? (
                    <div className={`grid gap-5 sm:gap-6 lg:gap-10 ${
                        getPricesByCategory().length === 1
                            ? "grid-cols-1 max-w-sm mx-auto"
                            : getPricesByCategory().length === 2
                            ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    }`}>
                        {getPricesByCategory().map((priceItem, index) => (
                            /* Extra top padding on mobile/tablet to accommodate the badge for the "mostPopular" card */
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
                            <svg
                                className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p className="text-gray-500 text-base sm:text-lg mb-4">
                                No pricing available for{" "}
                                {formatCategoryName(activeTab)} at the moment.
                            </p>
                            <p className="text-gray-400 text-xs sm:text-sm">
                                Please check back later or contact us for custom
                                packages.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Pricing;
