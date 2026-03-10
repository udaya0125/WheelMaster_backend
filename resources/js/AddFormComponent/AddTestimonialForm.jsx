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

    // Handle change for inputs
    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === "file" && name === "author_image") {
            const file = files[0];
            if (file) {
                setTestimonialForm((prev) => ({
                    ...prev,
                    author_image: file,
                }));

                // Create preview for new image
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        } else {
            setTestimonialForm((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Remove image
    const handleRemoveImage = () => {
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

                {/* Author Image Field */}
                <div>
                    <label
                        htmlFor="author_image"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Author Image *
                    </label>
                    <input
                        type="file"
                        id="author_image"
                        name="author_image"
                        onChange={handleChange}
                        accept="image/*"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required={!testimonialForm.author_image}
                    />

                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="mt-2">
                            <p className="text-sm text-gray-600 mb-1">
                                Image Preview:
                            </p>
                            <div className="flex items-center space-x-4">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-16 h-16 rounded-full object-cover border"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="text-red-600 text-sm hover:text-red-800 focus:outline-none"
                                >
                                    Remove Image
                                </button>
                            </div>
                        </div>
                    )}

                    {!imagePreview && (
                        <p className="text-xs text-gray-500 mt-1">
                            Please upload an image file (JPG, PNG, WEBP, etc.)
                        </p>
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
