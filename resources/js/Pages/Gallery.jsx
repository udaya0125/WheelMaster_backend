import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { Link } from "@inertiajs/react";
import { ChevronLeft } from "lucide-react";
import AddGalleryForm from "@/AddFormComponent/AddGalleryForm";
import Wrapper from "@/AdminWrapper/Wrapper";

const Gallery = () => {
    const scrollRef = useRef(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const [activeImage, setActiveImage] = useState(null);
    const [isClosing, setIsClosing] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    const handleOpenAddForm = () => {
        setShowAddForm(true);
    };

    const handleCloseAddForm = () => {
        setShowAddForm(false);
    };

    const handleGalleryAdded = () => {
        setShowAddForm(false);
        setReloadTrigger((prev) => !prev);
    };

    const imgurl = import.meta.env.VITE_IMAGE_PATH;

    // Fetch images from backend
    useEffect(() => {
        const fetchImages = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(route("ourgallery.index"));
                
                // Handle different response structures (similar to testimonials)
                let imagesData = [];
                
                if (Array.isArray(response.data)) {
                    imagesData = response.data;
                } else if (response.data && Array.isArray(response.data.data)) {
                    imagesData = response.data.data;
                } else if (response.data && response.data.images) {
                    imagesData = response.data.images;
                } else {
                    console.warn("Unexpected API response structure:", response.data);
                    imagesData = [];
                }
                
                // Sort by id in descending order (newest first)
                const sorted = [...imagesData].sort((a, b) => b.id - a.id);
                setImages(sorted);
            } catch (err) {
                setError("Failed to load gallery images");
                console.error("Error fetching gallery images:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, [reloadTrigger]);

    // Close active image on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && activeImage) {
                handleClose();
            }
            if (e.key === "Escape" && showAddForm) {
                handleCloseAddForm();
            }
        };

        if (activeImage || showAddForm) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleEscape);
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleEscape);
        };
    }, [activeImage, showAddForm]);

    const handleImageClick = (image, index) => {
        setActiveImage({ ...image, index });
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setActiveImage(null);
            setIsClosing(false);
        }, 300);
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath || typeof imagePath !== "string") {
            return "/images/placeholder.jpg";
        }
        return `${imgurl}/${imagePath}`;
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this image?")) {
            return;
        }

        try {
            await axios.delete(route("ourgallery.destroy", { id }));
            setReloadTrigger((prev) => !prev);
            if (activeImage?.id === id) {
                handleClose();
            }
        } catch (err) {
            console.error("Error deleting image:", err);
            alert("Failed to delete image. Please try again.");
        }
    };

    // Error state
    if (error) {
        return (
            <Wrapper>
                <section className="relative py-12 overflow-hidden">
                    <div className="px-2 sm:px-6 lg:px-8 py-6 lg:py-8">
                        <div className="flex justify-end items-start px-4 mb-12">
                            <div className="flex flex-col items-end gap-4">
                                <button
                                    onClick={handleOpenAddForm}
                                    className="bg-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:bg-indigo-700 transition-colors flex items-center"
                                >
                                    <FiPlus className="mr-2" />
                                    Add Gallery
                                </button>
                            </div>
                        </div>

                        <div className="text-center mb-16 px-2">
                            <p className="text-transparent bg-clip-text bg-gradient-to-r from-gray-600 to-gray-800 font-semibold text-sm tracking-widest uppercase mb-3">
                                Showcasing Excellence
                            </p>
                            <h1 className="text-4xl md:text-5xl font-bold mt-2 relative inline-block text-gray-900">
                                Our Gallery
                                <span className="absolute bottom-[-12px] left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400 rounded-full"></span>
                            </h1>
                            <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
                                Explore our diverse portfolio of stunning projects and
                                creative works
                            </p>
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
                    </div>
                </section>
            </Wrapper>
        );
    }

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

    return (
        <Wrapper>
            {/* Add Gallery Form Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">
                                    Add Gallery
                                </h2>
                                <button
                                    onClick={handleCloseAddForm}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    <FiX />
                                </button>
                            </div>
                            <AddGalleryForm
                                onClose={handleCloseAddForm}
                                setReloadTrigger={setReloadTrigger}
                            />
                        </div>
                    </div>
                </div>
            )}

            <section className="relative py-12 overflow-hidden">
                <div className="px-2 sm:px-6 lg:px-8 py-6 lg:py-8">
                    <div className="flex justify-end items-start px-4 mb-12">
                        <div className="flex flex-col items-end gap-4">
                            <button
                                onClick={handleOpenAddForm}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:bg-indigo-700 transition-colors flex items-center"
                            >
                                <FiPlus className="mr-2" />
                                Add Gallery
                            </button>
                        </div>
                    </div>

                    {/* Section Header */}
                    <div className="text-center mb-16 px-2">
                        <p className="text-transparent bg-clip-text bg-gradient-to-r from-gray-600 to-gray-800 font-semibold text-sm tracking-widest uppercase mb-3">
                            Showcasing Excellence
                        </p>
                        <h1 className="text-4xl md:text-5xl font-bold mt-2 relative inline-block text-gray-900">
                            Our Gallery
                            <span className="absolute bottom-[-12px] left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400 rounded-full"></span>
                        </h1>
                        <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
                            Explore our diverse portfolio of stunning projects and
                            creative works
                        </p>
                    </div>

                    {/* Loading State - Matches Testimonial pattern */}
                    {loading && (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            <p className="mt-4 text-gray-600">
                                Loading gallery...
                            </p>
                        </div>
                    )}

                    {/* Gallery Content - Only show when not loading */}
                    {!loading && (
                        <>
                            {/* Empty state */}
                            {images.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="inline-block p-8 bg-gray-50 rounded-lg">
                                        <svg
                                            className="w-24 h-24 text-gray-300 mx-auto mb-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                            No images in gallery
                                        </h3>
                                        <p className="text-gray-500 mb-6">
                                            Start by adding some images to showcase your
                                            work
                                        </p>
                                        <button
                                            onClick={handleOpenAddForm}
                                            className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition-colors flex items-center justify-center mx-auto"
                                        >
                                            <FiPlus className="mr-2" />
                                            Add Gallery Image
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Masonry Grid Gallery */
                                <div className="px-2 sm:px-6 lg:px-8">
                                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                                        {images.map((image, index) => {
                                            // Add different aspect ratios for variety
                                            const aspectRatios = [
                                                "aspect-[4/3]",
                                                "aspect-square",
                                                "aspect-[2/3]",
                                                "aspect-[3/4]",
                                                "aspect-[4/3]",
                                                "aspect-square",
                                                "aspect-[16/9]",
                                                "aspect-[4/3]",
                                                "aspect-[16/9]",
                                            ];
                                            const aspectClass =
                                                aspectRatios[index % aspectRatios.length];

                                            return (
                                                <div
                                                    key={`gallery-${image.id}`}
                                                    className={`relative break-inside-avoid overflow-hidden rounded-lg cursor-pointer group ${aspectClass}`}
                                                    onClick={() =>
                                                        handleImageClick(image, index)
                                                    }
                                                >
                                                    <div
                                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-110"
                                                        style={{
                                                            backgroundImage: `url(${getImageUrl(
                                                                image.image_path,
                                                            )})`,
                                                        }}
                                                    >
                                                        <img
                                                            src={getImageUrl(
                                                                image.image_path,
                                                            )}
                                                            alt={
                                                                image.alt ||
                                                                `Gallery image ${image.id}`
                                                            }
                                                            className="invisible"
                                                            onError={(e) => {
                                                                e.target.src =
                                                                    "/images/placeholder.jpg";
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Overlay on hover */}
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 ease-out"></div>

                                                    {/* Delete button */}
                                                    <button
                                                        onClick={(e) =>
                                                            handleDelete(image.id, e)
                                                        }
                                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 transform group-hover:scale-100 scale-90 z-10"
                                                        title="Delete image"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Fullscreen Active Image Overlay */}
            {activeImage && (
                <div
                    className={`fixed inset-0 z-50 bg-black transition-all duration-300 ease-out ${
                        isClosing ? "bg-opacity-0" : "bg-opacity-80"
                    }`}
                    onClick={handleClose}
                >
                    <div
                        className={`absolute inset-0 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
                            isClosing
                                ? "scale-95 opacity-0"
                                : "scale-100 opacity-100"
                        }`}
                    >
                        <div
                            className="relative max-w-4xl max-h-[90vh] w-full h-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={getImageUrl(activeImage.image_path)}
                                alt={activeImage.alt || "Gallery image"}
                                className="w-full h-full object-contain rounded-lg"
                            />

                            {/* Close button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-all duration-200"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>

                            {/* Delete button on fullscreen */}
                            <button
                                onClick={(e) => handleDelete(activeImage.id, e)}
                                className="absolute top-4 right-20 bg-red-500/80 backdrop-blur-sm text-white p-3 rounded-full hover:bg-red-600/80 transition-all duration-200"
                                title="Delete image"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </button>

                            {/* Image info */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-white/60 text-sm mt-2">
                                    Image {activeImage.index + 1} of{" "}
                                    {images.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Wrapper>
    );
};

export default Gallery;



// import React, { useEffect, useRef, useState } from "react";
// import axios from "axios";
// import { FiPlus, FiTrash2, FiX } from "react-icons/fi";
// import { Link } from "@inertiajs/react";
// import { ChevronLeft } from "lucide-react";
// import AddGalleryForm from "@/AddFormComponent/AddGalleryForm";
// import Wrapper from "@/AdminWrapper/Wrapper";

// const Gallery = () => {
//     const scrollRef = useRef(null);
//     const [images, setImages] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [reloadTrigger, setReloadTrigger] = useState(false);
//     const [activeImage, setActiveImage] = useState(null);
//     const [isClosing, setIsClosing] = useState(false);
//     const [showAddForm, setShowAddForm] = useState(false);

//     const handleOpenAddForm = () => {
//         setShowAddForm(true);
//     };

//     const handleCloseAddForm = () => {
//         setShowAddForm(false);
//     };

//     const handleGalleryAdded = () => {
//         setShowAddForm(false);
//         setReloadTrigger((prev) => !prev);
//     };

//     const imgurl = import.meta.env.VITE_IMAGE_PATH;

//     // Fetch images from backend
//     useEffect(() => {
//         const fetchImages = async () => {
//             try {
//                 setLoading(true);
//                 setError(null);
//                 const response = await axios.get(route("ourgallery.index"));
//                 // setImages(Array.isArray(response.data) ? response.data : []);
//                 const data = Array.isArray(response.data) ? response.data : [];
//                 setImages([...data].sort((a, b) => b.id - a.id));
//             } catch (err) {
//                 setError("Failed to load gallery images");
//                 console.error("Error fetching gallery images:", err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchImages();
//     }, [reloadTrigger]);

//     // Close active image on escape key
//     useEffect(() => {
//         const handleEscape = (e) => {
//             if (e.key === "Escape" && activeImage) {
//                 handleClose();
//             }
//             if (e.key === "Escape" && showAddForm) {
//                 handleCloseAddForm();
//             }
//         };

//         if (activeImage || showAddForm) {
//             document.body.style.overflow = "hidden";
//             window.addEventListener("keydown", handleEscape);
//         } else {
//             document.body.style.overflow = "unset";
//         }

//         return () => {
//             document.body.style.overflow = "unset";
//             window.removeEventListener("keydown", handleEscape);
//         };
//     }, [activeImage, showAddForm]);

//     const handleImageClick = (image, index) => {
//         setActiveImage({ ...image, index });
//     };

//     const handleClose = () => {
//         setIsClosing(true);
//         setTimeout(() => {
//             setActiveImage(null);
//             setIsClosing(false);
//         }, 300);
//     };

//     const getImageUrl = (imagePath) => {
//         if (!imagePath || typeof imagePath !== "string") {
//             return "/images/placeholder.jpg";
//         }
//         return `${imgurl}/${imagePath}`;
//     };

//     const handleDelete = async (id, e) => {
//         e.stopPropagation();
//         if (!confirm("Are you sure you want to delete this image?")) {
//             return;
//         }

//         try {
//             await axios.delete(route("ourgallery.destroy", { id }));
//             setReloadTrigger((prev) => !prev);
//             if (activeImage?.id === id) {
//                 handleClose();
//             }
//         } catch (err) {
//             console.error("Error deleting image:", err);
//             alert("Failed to delete image. Please try again.");
//         }
//     };

//     // Loading state
//     // if (loading) {
//     //     return (
//     //         <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
//     //             <div className="text-center">
//     //                 <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
//     //                 <p className="text-gray-600 mt-4">Loading gallery...</p>
//     //             </div>
//     //         </section>
//     //     );
//     // }

//     // Error state
//     if (error) {
//         return (
//             <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
//                 <div className="text-center text-red-600">
//                     <p>{error}</p>
//                 </div>
//             </section>
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
//             {/* Add Gallery Form Modal */}
//             {showAddForm && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//                     <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//                         <div className="p-6">
//                             <div className="flex justify-between items-center mb-6">
//                                 <h2 className="text-2xl font-bold">
//                                     Add Gallery
//                                 </h2>
//                                 <button
//                                     onClick={handleCloseAddForm}
//                                     className="text-gray-500 hover:text-gray-700 text-2xl"
//                                 >
//                                     <FiX />
//                                 </button>
//                             </div>
//                             <AddGalleryForm
//                                 onClose={handleCloseAddForm}
//                                 setReloadTrigger={setReloadTrigger}
//                             />
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* <section className="relative overflow-hidden h-[60vh]">
//                 <div className="absolute inset-0 w-full h-full">
//                     <img
//                         src="/images/bg.webp"
//                         alt="Banner background"
//                         className="w-full h-full object-cover object-center"
//                         loading="eager"
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-transparent" />
//                 </div>

//                 <div className="relative container mx-auto h-full flex justify-center items-center px-4">
//                     <div className="max-w-2xl text-white text-center">
//                         <Link
//                             href={"/dashboard"}
//                             className="text-4xl md:text-5xl font-bold mb-4 underline"
//                         >
//                             Gallery
//                         </Link>
//                         <p className="text-xl mb-6">
//                             Explore our collection of images
//                         </p>

//                         <button
//                             onClick={handleOpenAddForm}
//                             className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
//                         >
//                             <FiPlus className="mr-2" />
//                             Add New Gallery Item
//                         </button>
//                     </div>
//                 </div>
//             </section> */}

//             <section className="">
//                 <div className=" px-2 sm:px-6 lg:px-8 py-6 lg:py-8">
//                     {/* Back Button */}
//                     {/* <Link
//                         href="/dashboard"
//                         className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
//                     >
//                         <ChevronLeft size={20} />
//                         <span className="font-medium">Back to Dashboard</span>
//                     </Link> */}

//                     {/* Right Section (Logout on top, Add button below) */}
//                     <div className="flex flex-col items-end gap-4">
//                         {/* Logout Button */}
//                         {/* <button
//                             onClick={handleLogout}
//                             className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
//                         >
//                             Log Out
//                         </button> */}

//                         {/* Add Gallery Button */}
//                         <button
//                             onClick={handleOpenAddForm}
//                             className="bg-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:bg-indigo-700 transition-colors flex items-center"
//                         >
//                             <FiPlus className="mr-2" />
//                             Add Gallery
//                         </button>
//                     </div>
//                 </div>

//                 {/* Section Header */}
//                 <div className="text-center mb-16 px-2">
//                     <p className="text-transparent bg-clip-text bg-gradient-to-r from-gray-600 to-gray-800 font-semibold text-sm tracking-widest uppercase mb-3">
//                         Showcasing Excellence
//                     </p>
//                     <h1 className="text-4xl md:text-5xl font-bold mt-2 relative inline-block text-gray-900">
//                         Our Gallery
//                         <span className="absolute bottom-[-12px] left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400 rounded-full"></span>
//                     </h1>
//                     <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
//                         Explore our diverse portfolio of stunning projects and
//                         creative works
//                     </p>
//                 </div>

//                 {/* Empty state */}
//                 {images.length === 0 ? (
//                     <div className="text-center py-12">
//                         <div className="inline-block p-8 bg-gray-50 rounded-lg">
//                             <svg
//                                 className="w-24 h-24 text-gray-300 mx-auto mb-4"
//                                 fill="none"
//                                 stroke="currentColor"
//                                 viewBox="0 0 24 24"
//                             >
//                                 <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     strokeWidth={1}
//                                     d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
//                                 />
//                             </svg>
//                             <h3 className="text-xl font-semibold text-gray-700 mb-2">
//                                 No images in gallery
//                             </h3>
//                             <p className="text-gray-500 mb-6">
//                                 Start by adding some images to showcase your
//                                 work
//                             </p>
//                             <button
//                                 onClick={handleOpenAddForm}
//                                 className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition-colors flex items-center justify-center mx-auto"
//                             >
//                                 <FiPlus className="mr-2" />
//                                 Add  Gallery Image
//                             </button>
//                         </div>
//                     </div>
//                 ) : (
//                     /* Masonry Grid Gallery */
//                     <div className="px-2 sm:px-6 lg:px-8">
//                         <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
//                             {images.map((image, index) => {
//                                 // Add different aspect ratios for variety
//                                 const aspectRatios = [
//                                     "aspect-[4/3]",
//                                     "aspect-square",
//                                     "aspect-[2/3]",
//                                     "aspect-[3/4]",
//                                     "aspect-[4/3]",
//                                     "aspect-square",
//                                     "aspect-[16/9]",
//                                     "aspect-[4/3]",
//                                     "aspect-[16/9]",
//                                 ];
//                                 const aspectClass =
//                                     aspectRatios[index % aspectRatios.length];

//                                 return (
//                                     <div
//                                         key={`gallery-${image.id}`}
//                                         className={`relative break-inside-avoid overflow-hidden rounded-lg cursor-pointer group ${aspectClass}`}
//                                         onClick={() =>
//                                             handleImageClick(image, index)
//                                         }
//                                     >
//                                         <div
//                                             className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-110"
//                                             style={{
//                                                 backgroundImage: `url(${getImageUrl(
//                                                     image.image_path,
//                                                 )})`,
//                                             }}
//                                         >
//                                             <img
//                                                 src={getImageUrl(
//                                                     image.image_path,
//                                                 )}
//                                                 alt={
//                                                     image.alt ||
//                                                     `Gallery image ${image.id}`
//                                                 }
//                                                 className="invisible"
//                                                 onError={(e) => {
//                                                     e.target.src =
//                                                         "/images/placeholder.jpg";
//                                                 }}
//                                             />
//                                         </div>

//                                         {/* Overlay on hover */}
//                                         <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 ease-out"></div>

//                                         {/* Delete button */}
//                                         <button
//                                             onClick={(e) =>
//                                                 handleDelete(image.id, e)
//                                             }
//                                             className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 transform group-hover:scale-100 scale-90 z-10"
//                                             title="Delete image"
//                                         >
//                                             <FiTrash2 className="w-4 h-4" />
//                                         </button>
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                     </div>
//                 )}
//             </section>

//             {/* Fullscreen Active Image Overlay */}
//             {activeImage && (
//                 <div
//                     className={`fixed inset-0 z-50 bg-black transition-all duration-300 ease-out ${
//                         isClosing ? "bg-opacity-0" : "bg-opacity-80"
//                     }`}
//                     onClick={handleClose}
//                 >
//                     <div
//                         className={`absolute inset-0 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
//                             isClosing
//                                 ? "scale-95 opacity-0"
//                                 : "scale-100 opacity-100"
//                         }`}
//                     >
//                         <div
//                             className="relative max-w-4xl max-h-[90vh] w-full h-full"
//                             onClick={(e) => e.stopPropagation()}
//                         >
//                             <img
//                                 src={getImageUrl(activeImage.image_path)}
//                                 alt={activeImage.alt || "Gallery image"}
//                                 className="w-full h-full object-contain rounded-lg"
//                             />

//                             {/* Close button */}
//                             <button
//                                 onClick={handleClose}
//                                 className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-all duration-200"
//                             >
//                                 <svg
//                                     className="w-6 h-6"
//                                     fill="none"
//                                     stroke="currentColor"
//                                     viewBox="0 0 24 24"
//                                 >
//                                     <path
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                         strokeWidth={2}
//                                         d="M6 18L18 6M6 6l12 12"
//                                     />
//                                 </svg>
//                             </button>

//                             {/* Delete button on fullscreen */}
//                             <button
//                                 onClick={(e) => handleDelete(activeImage.id, e)}
//                                 className="absolute top-4 right-20 bg-red-500/80 backdrop-blur-sm text-white p-3 rounded-full hover:bg-red-600/80 transition-all duration-200"
//                                 title="Delete image"
//                             >
//                                 <svg
//                                     className="w-6 h-6"
//                                     fill="none"
//                                     stroke="currentColor"
//                                     viewBox="0 0 24 24"
//                                 >
//                                     <path
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                         strokeWidth={2}
//                                         d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                                     />
//                                 </svg>
//                             </button>

//                             {/* Image info */}
//                             <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
//                                 <p className="text-white/60 text-sm mt-2">
//                                     Image {activeImage.index + 1} of{" "}
//                                     {images.length}
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </Wrapper>
//     );
// };

// export default Gallery;
