import React, { useEffect, useState } from "react";
import axios from "axios";

const AddGalleryForm = ({ onClose, setReloadTrigger }) => {
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
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
            // Filter valid files (size <= 2MB)
            const validFiles = [];
            const invalidFiles = [];

            files.forEach((file) => {
                if (isFileSizeValid(file)) {
                    validFiles.push(file);
                } else {
                    invalidFiles.push(file);
                }
            });

            // Show alert for invalid files
            if (invalidFiles.length > 0) {
                const invalidFileNames = invalidFiles
                    .map(
                        (file) =>
                            `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
                    )
                    .join("\n");

                alert(
                    `The following file(s) exceed the 2MB limit and were not added:\n\n${invalidFileNames}\n\n` +
                        `Maximum allowed file size is 2MB per image.`,
                );
            }

            // Add only valid files
            if (validFiles.length > 0) {
                const newImages = [...selectedImages, ...validFiles];
                setSelectedImages(newImages);

                // Create preview URLs for valid files
                const newPreviews = validFiles.map((file) => ({
                    file,
                    previewUrl: URL.createObjectURL(file),
                }));
                setImagePreviews((prev) => [...prev, ...newPreviews]);
            }
        }
    };

    // Handle Create Gallery Images
    const handleCreate = async (formData) => {
        try {
            await axios.post(route("ourgallery.store"), formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setReloadTrigger((prev) => !prev);
        } catch (error) {
            console.log("Error creating gallery images", error);
            throw error;
        }
    };

    // Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedImages.length === 0) {
            alert("Please select at least one image");
            return;
        }

        const formData = new FormData();

        // Append all images
        selectedImages.forEach((image) => {
            formData.append("images[]", image);
        });

        try {
            setSubmitting(true);
            await handleCreate(formData);

            // Clean up preview URLs
            imagePreviews.forEach((preview) => {
                URL.revokeObjectURL(preview.previewUrl);
            });

            // Reset form
            setSelectedImages([]);
            setImagePreviews([]);
            onClose();
        } catch (error) {
            console.log("Error saving gallery images", error);
            alert("Failed to upload images. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        // Revoke the object URL to avoid memory leaks
        URL.revokeObjectURL(imagePreviews[indexToRemove].previewUrl);

        setSelectedImages((prev) =>
            prev.filter((_, index) => index !== indexToRemove),
        );
        setImagePreviews((prev) =>
            prev.filter((_, index) => index !== indexToRemove),
        );
    };

    const handleRemoveAllImages = () => {
        // Revoke all object URLs to avoid memory leaks
        imagePreviews.forEach((preview) => {
            URL.revokeObjectURL(preview.previewUrl);
        });
        setSelectedImages([]);
        setImagePreviews([]);
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
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload Area */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">
                            Upload Images ({selectedImages.length} selected)
                        </label>
                        {selectedImages.length > 0 && (
                            <button
                                type="button"
                                onClick={handleRemoveAllImages}
                                className="text-sm text-red-600 hover:text-red-800 font-medium"
                            >
                                Remove All
                            </button>
                        )}
                    </div>

                    {/* Image Previews Grid */}
                    {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={preview.previewUrl}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                                    >
                                        ×
                                    </button>
                                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                        {preview.file.name}
                                    </div>
                                    {/* Show file size in preview */}
                                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                        {(
                                            preview.file.size /
                                            (1024 * 1024)
                                        ).toFixed(2)}
                                        MB
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* File Input */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center ${
                            selectedImages.length > 0
                                ? "border-gray-300"
                                : "border-gray-300 hover:border-blue-400"
                        } transition-colors`}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="image-upload"
                            multiple
                        />
                        <label
                            htmlFor="image-upload"
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
                                    PNG, JPG, GIF up to 2MB each
                                </p>
                                <p className="text-xs text-gray-500">
                                    You can select multiple images
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={selectedImages.length === 0 || submitting}
                        className={`flex-1 py-2 px-4 rounded-md text-white font-medium ${
                            selectedImages.length > 0 && !submitting
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-blue-400 cursor-not-allowed"
                        } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    >
                        {submitting
                            ? "Uploading..."
                            : `Add ${selectedImages.length} Image${selectedImages.length !== 1 ? "s" : ""} to Gallery`}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddGalleryForm;
