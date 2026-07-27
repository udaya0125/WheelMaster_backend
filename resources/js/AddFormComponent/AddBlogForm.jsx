// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";

// const AddBlogForm = ({ onClose, onSuccess }) => {
//     const [blogForm, setBlogForm] = useState({
//         title: "",
//         short_description: "",
//         long_description: "",
//         category: "",
//         duration: "",
//         image: null,
//     });

//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");

//     const categories = [
//         "Test Tips",
//         "Safety",
//         "Driving Skills",
//         "Parent Resources",
//         "Laws & Regulations",
//         "Vehicle Maintenance",
//     ];

//     // Quill modules configuration
//     const modules = {
//         toolbar: [
//             [{ header: [1, 2, 3, 4, 5, 6, false] }],
//             ["bold", "italic", "underline", "strike"],
//             [{ list: "ordered" }, { list: "bullet" }],
//             [{ indent: "-1" }, { indent: "+1" }],
//             [{ align: [] }],
//             ["link", "image", "video"],
//             ["clean"],
//             [{ color: [] }, { background: [] }],
//         ],
//     };

//     // Quill formats configuration
//     const formats = [
//         "header",
//         "bold",
//         "italic",
//         "underline",
//         "strike",
//         "list",
//         "bullet",
//         "indent",
//         "link",
//         "image",
//         "video",
//         "align",
//         "color",
//         "background",
//     ];

//     const handleChange = (e) => {
//         const { name, value, type, files } = e.target;

//         if (type === "file") {
//             setBlogForm((prev) => ({ ...prev, [name]: files[0] }));
//         } else {
//             setBlogForm((prev) => ({ ...prev, [name]: value }));
//         }
//     };

//     // Handler for Quill editor
//     const handleEditorChange = (content) => {
//         setBlogForm((prev) => ({ ...prev, long_description: content }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError("");

//         try {
//             const formDataToSend = new FormData();

//             formDataToSend.append("title", blogForm.title);
//             formDataToSend.append(
//                 "short_description",
//                 blogForm.short_description,
//             );
//             formDataToSend.append(
//                 "long_description",
//                 blogForm.long_description,
//             );
//             formDataToSend.append("category", blogForm.category);
//             formDataToSend.append("duration", blogForm.duration);

//             if (blogForm.image) {
//                 formDataToSend.append("image", blogForm.image);
//             }

//             const response = await axios.post(
//                 route("ourblog.store"),
//                 formDataToSend,
//                 {
//                     headers: {
//                         "Content-Type": "multipart/form-data",
//                     },
//                 },
//             );

//             setBlogForm({
//                 title: "",
//                 short_description: "",
//                 long_description: "",
//                 category: "",
//                 duration: "",
//                 image: null,
//             });

//             if (onSuccess) {
//                 onSuccess(response.data.data);
//             }

//             onClose();
//         } catch (err) {
//             console.error(err);

//             if (err.response?.status === 422) {
//                 const msg = Object.values(err.response.data.errors)
//                     .flat()
//                     .join(", ");
//                 setError(msg);
//             } else {
//                 setError("Something went wrong.");
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

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

//     return (
//         <div className="w-full max-w-4xl mx-auto">
//             {error && (
//                 <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
//                     {error}
//                 </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-6">
//                 {/* TITLE */}
//                 <div>
//                     <label className="block text-sm font-medium mb-2">
//                         Title *
//                     </label>
//                     <input
//                         type="text"
//                         name="title"
//                         value={blogForm.title}
//                         onChange={handleChange}
//                         required
//                         className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
//                     />
//                 </div>

//                 {/* SHORT DESCRIPTION */}
//                 <div>
//                     <label className="block text-sm font-medium mb-2">
//                         Short Description *
//                     </label>
//                     <textarea
//                         name="short_description"
//                         value={blogForm.short_description}
//                         onChange={handleChange}
//                         rows="3"
//                         required
//                         className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
//                     />
//                 </div>

//                 {/* LONG DESCRIPTION - React Quill Editor */}
//                 <div>
//                     <label className="block text-sm font-medium mb-2">
//                         Content *
//                     </label>
//                     <div className="border rounded overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
//                         <ReactQuill
//                             theme="snow"
//                             value={blogForm.long_description}
//                             onChange={handleEditorChange}
//                             modules={modules}
//                             formats={formats}
//                             placeholder="Write your blog content here..."
//                             className="h-64"
//                         />
//                     </div>
//                 </div>

//                 {/* CATEGORY */}
//                 <div>
//                     <label className="block text-sm font-medium mb-2">
//                         Category *
//                     </label>
//                     <select
//                         name="category"
//                         value={blogForm.category}
//                         onChange={handleChange}
//                         required
//                         className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
//                     >
//                         <option value="">Select Category</option>
//                         {categories.map((cat) => (
//                             <option key={cat} value={cat}>
//                                 {cat}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 {/* DURATION */}
//                 <div>
//                     <label className="block text-sm font-medium mb-2">
//                         Read Duration *
//                     </label>
//                     <input
//                         type="text"
//                         name="duration"
//                         value={blogForm.duration}
//                         onChange={handleChange}
//                         required
//                         placeholder="e.g. 5 min read"
//                         className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
//                     />
//                 </div>

//                 {/* IMAGE */}
//                 <div>
//                     <label className="block text-sm font-medium mb-2">
//                         Image *
//                     </label>
//                     <input
//                         type="file"
//                         name="image"
//                         onChange={handleChange}
//                         required
//                         accept="image/*"
//                         className="w-full px-3 py-2 border rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                     />
//                 </div>

//                 {/* BUTTONS */}
//                 <div className="flex space-x-3 pt-6 border-t">
//                     <button
//                         type="button"
//                         onClick={onClose}
//                         disabled={loading}
//                         className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                         Cancel
//                     </button>

//                     <button
//                         type="submit"
//                         disabled={loading || !blogForm.long_description.trim()}
//                         className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                         {loading ? "Adding..." : "Add Blog"}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default AddBlogForm;


import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import Select from "react-select";
import "react-quill/dist/quill.snow.css";

const categoryOptions = [
    { value: "Test Tips", label: "Test Tips" },
    { value: "Safety", label: "Safety" },
    { value: "Driving Skills", label: "Driving Skills" },
    { value: "Parent Resources", label: "Parent Resources" },
    { value: "Laws & Regulations", label: "Laws & Regulations" },
    { value: "Vehicle Maintenance", label: "Vehicle Maintenance" },
];

const AddBlogForm = ({ onClose, onSuccess }) => {
    const [blogForm, setBlogForm] = useState({
        title: "",
        short_description: "",
        long_description: "",
        category: "",
        duration: "",
        image: null,
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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

    // Check file size (max 2MB = 2 * 1024 * 1024 bytes)
    const isFileSizeValid = (file) => {
        const maxSizeInMB = 2;
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
        return file.size <= maxSizeInBytes;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBlogForm((prev) => ({ ...prev, [name]: value }));
    };

    // Handle react-select category change
    const handleCategoryChange = (selectedOption) => {
        setBlogForm((prev) => ({
            ...prev,
            category: selectedOption ? selectedOption.value : "",
        }));
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

            setBlogForm((prev) => ({ ...prev, image: file }));

            const previewUrl = URL.createObjectURL(file);
            setImagePreview((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return previewUrl;
            });
        }
    };

    // Remove image
    const handleRemoveImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setBlogForm((prev) => ({ ...prev, image: null }));
        setImagePreview(null);

        // Reset file input
        const fileInput = document.getElementById("image");
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

            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }

            setBlogForm({
                title: "",
                short_description: "",
                long_description: "",
                category: "",
                duration: "",
                image: null,
            });
            setImagePreview(null);

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

    const selectedCategoryOption =
        categoryOptions.find((opt) => opt.value === blogForm.category) ||
        null;

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

                {/* CATEGORY + DURATION - same flex row */}
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* CATEGORY */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-2">
                            Category *
                        </label>
                        <Select
                            name="category"
                            options={categoryOptions}
                            value={selectedCategoryOption}
                            onChange={handleCategoryChange}
                            placeholder="Select Category"
                            isClearable
                            classNamePrefix="react-select"
                            menuPortalTarget={document.body}
                            styles={{
                                menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                }),
                                control: (base, state) => ({
                                    ...base,
                                    minHeight: "42px",
                                    borderColor: state.isFocused
                                        ? "#3b82f6"
                                        : "#d1d5db",
                                    boxShadow: state.isFocused
                                        ? "0 0 0 2px rgba(59,130,246,0.5)"
                                        : "none",
                                    "&:hover": {
                                        borderColor: "#3b82f6",
                                    },
                                }),
                            }}
                        />
                        {/* Hidden input to keep native form validation consistent */}
                        <input
                            type="text"
                            tabIndex={-1}
                            autoComplete="off"
                            value={blogForm.category}
                            onChange={() => {}}
                            required
                            className="sr-only"
                        />
                    </div>

                    {/* DURATION */}
                    <div className="flex-1">
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
                </div>

                {/* IMAGE - Gallery style drag & drop */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">
                            Image {imagePreview ? "(1 selected)" : "*"}
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
                                {blogForm.image && (
                                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                        {blogForm.image.name}
                                    </div>
                                )}
                                {blogForm.image && (
                                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                        {(
                                            blogForm.image.size /
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
                                id="image"
                            />
                            <label htmlFor="image" className="cursor-pointer block">
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
