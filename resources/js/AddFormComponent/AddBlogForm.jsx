import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const AddBlogForm = ({ onClose, onSuccess }) => {
    const [blogForm, setBlogForm] = useState({
        title: "",
        short_description: "",
        long_description: "",
        category: "",
        duration: "",
        image: null,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const categories = [
        "Test Tips",
        "Safety",
        "Driving Skills",
        "Parent Resources",
        "Laws & Regulations",
        "Vehicle Maintenance",
    ];

    // Quill modules configuration
    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ align: [] }],
            ["link", "image", "video"],
            ["clean"],
            [{ color: [] }, { background: [] }],
        ],
    };

    // Quill formats configuration
    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "list",
        "bullet",
        "indent",
        "link",
        "image",
        "video",
        "align",
        "color",
        "background",
    ];

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === "file") {
            setBlogForm((prev) => ({ ...prev, [name]: files[0] }));
        } else {
            setBlogForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Handler for Quill editor
    const handleEditorChange = (content) => {
        setBlogForm((prev) => ({ ...prev, long_description: content }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const formDataToSend = new FormData();

            formDataToSend.append("title", blogForm.title);
            formDataToSend.append(
                "short_description",
                blogForm.short_description,
            );
            formDataToSend.append(
                "long_description",
                blogForm.long_description,
            );
            formDataToSend.append("category", blogForm.category);
            formDataToSend.append("duration", blogForm.duration);

            if (blogForm.image) {
                formDataToSend.append("image", blogForm.image);
            }

            const response = await axios.post(
                route("ourblog.store"),
                formDataToSend,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );

            setBlogForm({
                title: "",
                short_description: "",
                long_description: "",
                category: "",
                duration: "",
                image: null,
            });

            if (onSuccess) {
                onSuccess(response.data.data);
            }

            onClose();
        } catch (err) {
            console.error(err);

            if (err.response?.status === 422) {
                const msg = Object.values(err.response.data.errors)
                    .flat()
                    .join(", ");
                setError(msg);
            } else {
                setError("Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <div className="w-full max-w-4xl mx-auto">
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* TITLE */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Title *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={blogForm.title}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                </div>

                {/* SHORT DESCRIPTION */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Short Description *
                    </label>
                    <textarea
                        name="short_description"
                        value={blogForm.short_description}
                        onChange={handleChange}
                        rows="3"
                        required
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                </div>

                {/* LONG DESCRIPTION - React Quill Editor */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Content *
                    </label>
                    <div className="border rounded overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                        <ReactQuill
                            theme="snow"
                            value={blogForm.long_description}
                            onChange={handleEditorChange}
                            modules={modules}
                            formats={formats}
                            placeholder="Write your blog content here..."
                            className="h-64"
                        />
                    </div>
                </div>

                {/* CATEGORY */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Category *
                    </label>
                    <select
                        name="category"
                        value={blogForm.category}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                {/* DURATION */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Read Duration *
                    </label>
                    <input
                        type="text"
                        name="duration"
                        value={blogForm.duration}
                        onChange={handleChange}
                        required
                        placeholder="e.g. 5 min read"
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                </div>

                {/* IMAGE */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Image *
                    </label>
                    <input
                        type="file"
                        name="image"
                        onChange={handleChange}
                        required
                        accept="image/*"
                        className="w-full px-3 py-2 border rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>

                {/* BUTTONS */}
                <div className="flex space-x-3 pt-6 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading || !blogForm.long_description.trim()}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Adding..." : "Add Blog"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddBlogForm;