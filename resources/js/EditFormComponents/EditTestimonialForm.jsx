import React, { useState, useEffect } from "react";

const EditTestimonialForm = ({ onClose, editingTestimonial, onUpdate }) => {
    const [testimonialForm, setTestimonialForm] = useState({
        comment: "",
        author_name: "",
        author_image: null,
        author_role: "",
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImage, setExistingImage] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const imgurl = import.meta.env.VITE_IMAGE_PATH;

    // Use Effect to populate form when editing
    useEffect(() => {
        if (editingTestimonial) {
            setTestimonialForm({
                comment: editingTestimonial.comment || editingTestimonial.comment || "",
                author_name: editingTestimonial.name || editingTestimonial.author_name || "",
                author_image: null,
                author_role: editingTestimonial.role || editingTestimonial.author_role || "",
            });
            
            // Store existing image separately for display
            if (editingTestimonial.avatar || editingTestimonial.author_image) {
                const imagePath = editingTestimonial.avatar || editingTestimonial.author_image;
                setExistingImage(imagePath);
                setImagePreview(`${imgurl}/${imagePath}`);
            }
        }
    }, [editingTestimonial, imgurl]);

    // Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        
        // Append all form data except author_image if it's not changed
        for (const key in testimonialForm) {
            if (key === 'author_image') {
                // Only append author_image if it's a new file (not null)
                if (testimonialForm.author_image instanceof File) {
                    formData.append(key, testimonialForm[key]);
                }
            } else if (testimonialForm[key] !== null && testimonialForm[key] !== "") {
                formData.append(key, testimonialForm[key]);
            }
        }

        // Rename comment to content for backend if needed
        if (formData.has('comment')) {
            const comment = formData.get('comment');
            formData.delete('comment');
            formData.append('comment', comment);
        }

        try {
            setSubmitting(true);
            await onUpdate(formData, editingTestimonial.id);
            
            // Reset form
            setTestimonialForm({
                comment: "",
                author_name: "",
                author_image: null,
                author_role: "",
            });
            setImagePreview(null);
            setExistingImage(null);
            
            onClose();
        } catch (error) {
            console.log("Error updating testimonial", error);
            alert("Error updating testimonial. Please try again.");
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

    // Remove new image (revert to existing)
    const handleRemoveNewImage = () => {
        setTestimonialForm((prev) => ({
            ...prev,
            author_image: null,
        }));
        setImagePreview(existingImage ? `${imgurl}/${existingImage}` : null);
        
        // Reset file input
        const fileInput = document.getElementById('author_image');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    // Remove existing image
    const handleRemoveExistingImage = () => {
        setExistingImage(null);
        setImagePreview(null);
        setTestimonialForm((prev) => ({
            ...prev,
            author_image: null,
        }));
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
                        Author Image
                    </label>
                    <input
                        type="file"
                        id="author_image"
                        name="author_image"
                        onChange={handleChange}
                        accept="image/*"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    
                    {/* Image Display */}
                    <div className="mt-2">
                        {existingImage && !(testimonialForm.author_image instanceof File) ? (
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={`${imgurl}/${existingImage}`}
                                        alt="Current"
                                        className="w-16 h-16 rounded-full object-cover border"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveExistingImage}
                                        className="text-red-600 text-sm hover:text-red-800 focus:outline-none"
                                    >
                                        Remove Image
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Upload a new image to replace the current one.
                                </p>
                            </div>
                        ) : imagePreview && testimonialForm.author_image instanceof File ? (
                            <div>
                                <p className="text-sm text-gray-600 mb-1">New Image Preview:</p>
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={imagePreview}
                                        alt="New Preview"
                                        className="w-16 h-16 rounded-full object-cover border"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveNewImage}
                                        className="text-red-600 text-sm hover:text-red-800 focus:outline-none"
                                    >
                                        Remove New Image
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500 mt-1">
                                No image selected. Upload a new image or keep the current one (if any).
                            </p>
                        )}
                    </div>
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
                        {submitting ? "Updating..." : "Update Testimonial"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditTestimonialForm;