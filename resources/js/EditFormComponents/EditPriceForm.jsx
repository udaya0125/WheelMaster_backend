import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const EditPriceForm = ({ editingPrice, onClose, setReloadTrigger }) => {
    const [priceForm, setPriceForm] = useState({
        description: "",
        price: "",
        features: "",
        duration: "",
        discount: "",
        category: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const quillRef = useRef(null);

    // Quill modules configuration
    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
            ["clean"],
        ],
    };

    // Quill formats configuration
    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "list",
        "bullet",
        "link",
    ];

    // Category options for dropdown
    const categoryOptions = [
        { value: "", label: "Select Category" },
        { value: "standard lessons", label: "Standard Lessons" },
        { value: "test packages", label: "Test Packages" },
        { value: "package bundles", label: "Package Bundles" },
    ];

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

    // Populate form with editing data
    useEffect(() => {
        if (editingPrice) {
            setPriceForm({
                description: editingPrice.description || "",
                price: editingPrice.price || "",
                features: editingPrice.features || "",
                duration: editingPrice.duration || "",
                discount: editingPrice.discount || "",
                category: editingPrice.category || "",
            });
        }
        setError(""); // Clear any previous errors
    }, [editingPrice]);

    // Handle Update Price
    const handleUpdate = async (formData, id) => {
        try {
            formData.append("_method", "PUT");

            const response = await axios.post(
                route("ourprice.update", { id }),
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );
            setReloadTrigger((prev) => !prev);
            return response.data;
        } catch (error) {
            console.log("Error updating price", error);
            throw error;
        }
    };

    // Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const formData = new FormData();

        // Append all form data
        for (const key in priceForm) {
            if (priceForm[key] !== null && priceForm[key] !== "") {
                formData.append(key, priceForm[key]);
            }
        }

        try {
            setSubmitting(true);
            await handleUpdate(formData, editingPrice.id);

            // Reset form and close
            setPriceForm({
                description: "",
                price: "",
                features: "",
                duration: "",
                discount: "",
                category: "",
            });
            onClose();
        } catch (error) {
            console.log("Error updating data", error);
            setError(
                error.response?.data?.message ||
                    error.message ||
                    "An error occurred while updating. Please try again.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Handle change for form fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPriceForm((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (error) setError("");
    };

    // Handle Quill editor change
    const handleEditorChange = (content) => {
        setPriceForm((prev) => ({
            ...prev,
            features: content,
        }));
        // Clear error when user starts typing
        if (error) setError("");
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* <h2 className="text-2xl font-bold mb-6">Edit Price Package</h2> */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Category Field */}
                <div>
                    <label
                        htmlFor="category"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Category *
                    </label>
                    <select
                        id="category"
                        name="category"
                        value={priceForm.category}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        disabled={submitting}
                    >
                        {categoryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Description Field */}
                <div>
                    <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Description *
                    </label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        value={priceForm.description}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter plan description"
                        required
                        disabled={submitting}
                    />
                </div>

                {/* Price Field */}
                <div>
                    <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Price *
                    </label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={priceForm.price}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter price"
                        min="0"
                        step="0.01"
                        required
                        disabled={submitting}
                    />
                </div>

                {/* Discount Field */}
                <div>
                    <label
                        htmlFor="discount"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Discount
                    </label>
                    <input
                        type="text"
                        id="discount"
                        name="discount"
                        value={priceForm.discount}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 20% off, $50 discount"
                        disabled={submitting}
                    />
                </div>

                {/* Features Field - React Quill Editor */}
                <div>
                    <label
                        htmlFor="features"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Features *
                    </label>
                    <div className="border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                        <ReactQuill
                            ref={quillRef}
                            theme="snow"
                            value={priceForm.features}
                            onChange={handleEditorChange}
                            modules={modules}
                            formats={formats}
                            placeholder="List features (you can use bullets, numbers, or paragraphs)..."
                            className="h-48 w-full"
                        />
                    </div>
                </div>

                {/* Duration Field */}
                <div>
                    <label
                        htmlFor="duration"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Duration *
                    </label>
                    <input
                        type="text"
                        id="duration"
                        name="duration"
                        value={priceForm.duration}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 1 month, 1 year, lifetime"
                        required
                        disabled={submitting}
                    />
                </div>

                {/* Buttons */}
                <div className="flex space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || !priceForm.features.trim()}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? "Updating..." : "Update Price Package"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditPriceForm;
