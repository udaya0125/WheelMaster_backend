// import React, { useEffect, useState } from "react";

// const AddTestimonialForm = ({ onClose, onCreate }) => {
//     const [testimonialForm, setTestimonialForm] = useState({
//         comment: "",
//         author_name: "",
//         author_image: null,
//         author_role: "",
//     });
//     const [imagePreview, setImagePreview] = useState(null);
//     const [submitting, setSubmitting] = useState(false);

//     // Add this useEffect to lock body scroll when form mounts
//     useEffect(() => {
//         // Lock body scroll
//         document.body.style.overflow = "hidden";
//         document.body.style.position = "fixed";
//         document.body.style.width = "100%";

//         // Cleanup function to restore scroll when component unmounts
//         return () => {
//             document.body.style.overflow = "unset";
//             document.body.style.position = "static";
//             document.body.style.width = "auto";
//         };
//     }, []); // Empty dependency array means this runs once on mount

//     // Handle Submit
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const formData = new FormData();

//         // Append all form data
//         for (const key in testimonialForm) {
//             if (testimonialForm[key] !== null && testimonialForm[key] !== "") {
//                 formData.append(key, testimonialForm[key]);
//             }
//         }

//         try {
//             setSubmitting(true);
//             await onCreate(formData);

//             // Reset form
//             setTestimonialForm({
//                 comment: "",
//                 author_name: "",
//                 author_image: null,
//                 author_role: "",
//             });
//             setImagePreview(null);

//             onClose();
//         } catch (error) {
//             console.log("Error creating testimonial", error);
//             alert("Error creating testimonial. Please try again.");
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     // Handle change for inputs
//     const handleChange = (e) => {
//         const { name, value, type, files } = e.target;

//         if (type === "file" && name === "author_image") {
//             const file = files[0];
//             if (file) {
//                 setTestimonialForm((prev) => ({
//                     ...prev,
//                     author_image: file,
//                 }));

//                 // Create preview for new image
//                 const reader = new FileReader();
//                 reader.onloadend = () => {
//                     setImagePreview(reader.result);
//                 };
//                 reader.readAsDataURL(file);
//             }
//         } else {
//             setTestimonialForm((prev) => ({
//                 ...prev,
//                 [name]: value,
//             }));
//         }
//     };

//     // Remove image
//     const handleRemoveImage = () => {
//         setTestimonialForm((prev) => ({
//             ...prev,
//             author_image: null,
//         }));
//         setImagePreview(null);

//         // Reset file input
//         const fileInput = document.getElementById("author_image");
//         if (fileInput) {
//             fileInput.value = "";
//         }
//     };

//     return (
//         <div className="w-full">
//             <form onSubmit={handleSubmit} className="space-y-4">
//                 {/* Comment Field */}
//                 <div>
//                     <label
//                         htmlFor="comment"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                         Comment *
//                     </label>
//                     <textarea
//                         id="comment"
//                         name="comment"
//                         value={testimonialForm.comment}
//                         onChange={handleChange}
//                         rows="4"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="Enter the testimonial comment"
//                         required
//                     />
//                 </div>

//                 {/* Author Name Field */}
//                 <div>
//                     <label
//                         htmlFor="author_name"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                         Author Name *
//                     </label>
//                     <input
//                         type="text"
//                         id="author_name"
//                         name="author_name"
//                         value={testimonialForm.author_name}
//                         onChange={handleChange}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="Enter author's name"
//                         required
//                     />
//                 </div>

//                 {/* Author Image Field */}
//                 <div>
//                     <label
//                         htmlFor="author_image"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                         Author Image *
//                     </label>
//                     <input
//                         type="file"
//                         id="author_image"
//                         name="author_image"
//                         onChange={handleChange}
//                         accept="image/*"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         required={!testimonialForm.author_image}
//                     />

//                     {/* Image Preview */}
//                     {imagePreview && (
//                         <div className="mt-2">
//                             <p className="text-sm text-gray-600 mb-1">
//                                 Image Preview:
//                             </p>
//                             <div className="flex items-center space-x-4">
//                                 <img
//                                     src={imagePreview}
//                                     alt="Preview"
//                                     className="w-16 h-16 rounded-full object-cover border"
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={handleRemoveImage}
//                                     className="text-red-600 text-sm hover:text-red-800 focus:outline-none"
//                                 >
//                                     Remove Image
//                                 </button>
//                             </div>
//                         </div>
//                     )}

//                     {!imagePreview && (
//                         <p className="text-xs text-gray-500 mt-1">
//                             Please upload an image file (JPG, PNG, WEBP, etc.)
//                         </p>
//                     )}
//                 </div>

//                 {/* Author Role Field */}
//                 <div>
//                     <label
//                         htmlFor="author_role"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                         Author Role *
//                     </label>
//                     <input
//                         type="text"
//                         id="author_role"
//                         name="author_role"
//                         value={testimonialForm.author_role}
//                         onChange={handleChange}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="e.g., New Driver, Parent of Teen Driver, etc."
//                         required
//                     />
//                 </div>

//                 {/* Buttons */}
//                 <div className="flex space-x-3 pt-4">
//                     <button
//                         type="button"
//                         onClick={onClose}
//                         disabled={submitting}
//                         className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         type="submit"
//                         disabled={submitting}
//                         className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50"
//                     >
//                         {submitting ? "Creating..." : "Add Testimonial"}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default AddTestimonialForm;


import React, { useEffect, useState } from "react";

const AddTestimonialForm = ({ onClose, onCreate }) => {
    const [testimonialForm, setTestimonialForm] = useState({
        comment: "",
        author_name: "",
        author_image: null,
        author_role: "",
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Add this useEffect to lock body scroll when form mounts
    useEffect(() => {
        // Lock body scroll
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.width = "100%";

        // Cleanup function to restore scroll when component unmounts
        return () => {
            document.body.style.overflow = "unset";
            document.body.style.position = "static";
            document.body.style.width = "auto";
        };
    }, []); // Empty dependency array means this runs once on mount

    // Check file size (max 2MB = 2 * 1024 * 1024 bytes)
    const isFileSizeValid = (file) => {
        const maxSizeInMB = 2;
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
        return file.size <= maxSizeInBytes;
    };

    // Handle image selection with size validation
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || e.dataTransfer.files);

        if (files.length > 0) {
            const file = files[0]; // Only take the first image

            if (!isFileSizeValid(file)) {
                alert(
                    `The file "${file.name}" (${(file.size / (1024 * 1024)).toFixed(
                        2,
                    )}MB) exceeds the 2MB limit and was not added.\n\n` +
                        `Maximum allowed file size is 2MB.`,
                );
                return;
            }

            setTestimonialForm((prev) => ({
                ...prev,
                author_image: file,
            }));

            const previewUrl = URL.createObjectURL(file);
            setImagePreview((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return previewUrl;
            });
        }
    };

    // Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        // Append all form data
        for (const key in testimonialForm) {
            if (testimonialForm[key] !== null && testimonialForm[key] !== "") {
                formData.append(key, testimonialForm[key]);
            }
        }

        try {
            setSubmitting(true);
            await onCreate(formData);

            // Clean up preview URL
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }

            // Reset form
            setTestimonialForm({
                comment: "",
                author_name: "",
                author_image: null,
                author_role: "",
            });
            setImagePreview(null);

            onClose();
        } catch (error) {
            console.log("Error creating testimonial", error);
            alert("Error creating testimonial. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Handle change for text/textarea inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setTestimonialForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Remove image
    const handleRemoveImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setTestimonialForm((prev) => ({
            ...prev,
            author_image: null,
        }));
        setImagePreview(null);

        // Reset file input
        const fileInput = document.getElementById("author_image");
        if (fileInput) {
            fileInput.value = "";
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            const inputEvent = {
                target: {
                    files: e.dataTransfer.files,
                },
            };
            handleImageChange(inputEvent);
        }
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Comment Field */}
                <div>
                    <label
                        htmlFor="comment"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Comment *
                    </label>
                    <textarea
                        id="comment"
                        name="comment"
                        value={testimonialForm.comment}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter the testimonial comment"
                        required
                    />
                </div>

                {/* Author Name Field */}
                <div>
                    <label
                        htmlFor="author_name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Author Name *
                    </label>
                    <input
                        type="text"
                        id="author_name"
                        name="author_name"
                        value={testimonialForm.author_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter author's name"
                        required
                    />
                </div>

                {/* Author Image Field - Gallery style drag & drop */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">
                            Author Image {imagePreview ? "(1 selected)" : "*"}
                        </label>
                        {imagePreview && (
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="text-sm text-red-600 hover:text-red-800 font-medium"
                            >
                                Remove
                            </button>
                        )}
                    </div>

                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                            <div className="relative group">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                                >
                                    ×
                                </button>
                                {testimonialForm.author_image && (
                                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                        {testimonialForm.author_image.name}
                                    </div>
                                )}
                                {testimonialForm.author_image && (
                                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                        {(
                                            testimonialForm.author_image.size /
                                            (1024 * 1024)
                                        ).toFixed(2)}
                                        MB
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* File Input - hidden once an image is selected */}
                    {!imagePreview && (
                        <div
                            className="border-2 border-dashed rounded-lg p-6 text-center border-gray-300 hover:border-blue-400 transition-colors"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="author_image"
                            />
                            <label
                                htmlFor="author_image"
                                className="cursor-pointer block"
                            >
                                <div className="space-y-2">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <div className="text-gray-600">
                                        <span className="font-medium text-blue-600">
                                            Click to upload
                                        </span>{" "}
                                        or drag and drop
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        PNG, JPG, GIF up to 2MB
                                    </p>
                                </div>
                            </label>
                        </div>
                    )}
                </div>

                {/* Author Role Field */}
                <div>
                    <label
                        htmlFor="author_role"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Author Role *
                    </label>
                    <input
                        type="text"
                        id="author_role"
                        name="author_role"
                        value={testimonialForm.author_role}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., New Driver, Parent of Teen Driver, etc."
                        required
                    />
                </div>

                {/* Buttons */}
                <div className="flex space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50"
                    >
                        {submitting ? "Creating..." : "Add Testimonial"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddTestimonialForm;