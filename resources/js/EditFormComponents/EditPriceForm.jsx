import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import Select from "react-select";
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

    // Category options for react-select dropdown
    const categoryOptions = [
        { value: "standard lessons", label: "Standard Lessons" },
        { value: "test packages", label: "Test Packages" },
        { value: "package bundles", label: "Package Bundles" },
    ];

    // Duration options for react-select dropdown
    const durationOptions = [
        { value: "1 Hour", label: "1 Hour" },
        { value: "2 Hour", label: "2 Hour" },
        { value: "90 Minutes", label: "90 Minutes" },
        { value: "1hr or 2hr", label: "1hr or 2hr" },
        { value: "1 Hour + PDA", label: "1 Hour + PDA" },
        { value: "2 Hour + PDA", label: "2 Hour + PDA" },
        { value: "CAR HIRE for Test Only", label: "CAR HIRE for Test Only" },
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

    // Handle change for regular form fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPriceForm((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (error) setError("");
    };

    // Handle change for react-select category
    const handleCategoryChange = (selectedOption) => {
        setPriceForm((prev) => ({
            ...prev,
            category: selectedOption ? selectedOption.value : "",
        }));
        if (error) setError("");
    };

    // Handle change for react-select duration
    const handleDurationChange = (selectedOption) => {
        setPriceForm((prev) => ({
            ...prev,
            duration: selectedOption ? selectedOption.value : "",
        }));
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
            {/* Scoped fix for the React Quill overlap issue.
                Setting height via className on <ReactQuill> only sizes the
                outer wrapper, not .ql-container, so .ql-editor keeps growing
                and spills into whatever sits below it. Fixing the container
                height + overflow-y here stops that overlap. */}
            <style>{`
                .price-form-quill .ql-container {
                    height: 180px;
                    overflow-y: auto;
                }
                .price-form-quill .ql-editor {
                    min-height: 180px;
                }
            `}</style>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Category and Duration Fields - same flex row */}
                <div className="flex space-x-3">
                    <div className="flex-1">
                        <label
                            htmlFor="category"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Category *
                        </label>
                        <Select
                            inputId="category"
                            name="category"
                            options={categoryOptions}
                            value={
                                categoryOptions.find(
                                    (option) => option.value === priceForm.category,
                                ) || null
                            }
                            onChange={handleCategoryChange}
                            placeholder="Select Category"
                            isDisabled={submitting}
                            isClearable
                            menuPortalTarget={document.body}
                            styles={{
                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            }}
                        />
                    </div>

                    <div className="flex-1">
                        <label
                            htmlFor="duration"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Duration *
                        </label>
                        <Select
                            inputId="duration"
                            name="duration"
                            options={durationOptions}
                            value={
                                durationOptions.find(
                                    (option) => option.value === priceForm.duration,
                                ) || null
                            }
                            onChange={handleDurationChange}
                            placeholder="Select Duration"
                            isDisabled={submitting}
                            isClearable
                            menuPortalTarget={document.body}
                            styles={{
                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            }}
                        />
                    </div>
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

                {/* Price and Discount Fields - same flex row */}
                <div className="flex space-x-3">
                    <div className="flex-1">
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

                    <div className="flex-1">
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
                            placeholder="e.g., $80, $200"
                            disabled={submitting}
                        />
                    </div>
                </div>

                {/* Features Field - React Quill Editor */}
                <div>
                    <label
                        htmlFor="features"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Features *
                    </label>
                    <div className="border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent price-form-quill">
                        <ReactQuill
                            ref={quillRef}
                            theme="snow"
                            value={priceForm.features}
                            onChange={handleEditorChange}
                            modules={modules}
                            formats={formats}
                            placeholder="List features (you can use bullets, numbers, or paragraphs)..."
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-full hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || !priceForm.features.trim()}
                        className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? "Updating..." : "Update Price Package"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditPriceForm;



// import axios from "axios";
// import React, { useState, useEffect, useRef } from "react";
// import ReactQuill from "react-quill";
// import Select from "react-select";
// import "react-quill/dist/quill.snow.css";

// const EditPriceForm = ({ editingPrice, onClose, setReloadTrigger }) => {
//     const [priceForm, setPriceForm] = useState({
//         description: "",
//         price: "",
//         features: "",
//         duration: "",
//         discount: "",
//         category: "",
//     });
//     const [submitting, setSubmitting] = useState(false);
//     const [error, setError] = useState("");
//     const quillRef = useRef(null);

//     // Quill modules configuration
//     const modules = {
//         toolbar: [
//             [{ header: [1, 2, 3, false] }],
//             ["bold", "italic", "underline"],
//             [{ list: "ordered" }, { list: "bullet" }],
//             ["link"],
//             ["clean"],
//         ],
//     };

//     // Quill formats configuration
//     const formats = [
//         "header",
//         "bold",
//         "italic",
//         "underline",
//         "list",
//         "bullet",
//         "link",
//     ];

//     // Category options for react-select dropdown
//     const categoryOptions = [
//         { value: "standard lessons", label: "Standard Lessons" },
//         { value: "test packages", label: "Test Packages" },
//         { value: "package bundles", label: "Package Bundles" },
//     ];

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

//     // Populate form with editing data
//     useEffect(() => {
//         if (editingPrice) {
//             setPriceForm({
//                 description: editingPrice.description || "",
//                 price: editingPrice.price || "",
//                 features: editingPrice.features || "",
//                 duration: editingPrice.duration || "",
//                 discount: editingPrice.discount || "",
//                 category: editingPrice.category || "",
//             });
//         }
//         setError(""); // Clear any previous errors
//     }, [editingPrice]);

//     // Handle Update Price
//     const handleUpdate = async (formData, id) => {
//         try {
//             formData.append("_method", "PUT");

//             const response = await axios.post(
//                 route("ourprice.update", { id }),
//                 formData,
//                 {
//                     headers: {
//                         "Content-Type": "multipart/form-data",
//                     },
//                 },
//             );
//             setReloadTrigger((prev) => !prev);
//             return response.data;
//         } catch (error) {
//             console.log("Error updating price", error);
//             throw error;
//         }
//     };

//     // Handle Submit
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError("");

//         const formData = new FormData();

//         // Append all form data
//         for (const key in priceForm) {
//             if (priceForm[key] !== null && priceForm[key] !== "") {
//                 formData.append(key, priceForm[key]);
//             }
//         }

//         try {
//             setSubmitting(true);
//             await handleUpdate(formData, editingPrice.id);

//             // Reset form and close
//             setPriceForm({
//                 description: "",
//                 price: "",
//                 features: "",
//                 duration: "",
//                 discount: "",
//                 category: "",
//             });
//             onClose();
//         } catch (error) {
//             console.log("Error updating data", error);
//             setError(
//                 error.response?.data?.message ||
//                     error.message ||
//                     "An error occurred while updating. Please try again.",
//             );
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     // Handle change for regular form fields
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setPriceForm((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//         // Clear error when user starts typing
//         if (error) setError("");
//     };

//     // Handle change for react-select category
//     const handleCategoryChange = (selectedOption) => {
//         setPriceForm((prev) => ({
//             ...prev,
//             category: selectedOption ? selectedOption.value : "",
//         }));
//         if (error) setError("");
//     };

//     // Handle Quill editor change
//     const handleEditorChange = (content) => {
//         setPriceForm((prev) => ({
//             ...prev,
//             features: content,
//         }));
//         // Clear error when user starts typing
//         if (error) setError("");
//     };

//     return (
//         <div className="w-full max-w-4xl mx-auto">
//             {/* Scoped fix for the React Quill overlap issue.
//                 Setting height via className on <ReactQuill> only sizes the
//                 outer wrapper, not .ql-container, so .ql-editor keeps growing
//                 and spills into whatever sits below it. Fixing the container
//                 height + overflow-y here stops that overlap. */}
//             <style>{`
//                 .price-form-quill .ql-container {
//                     height: 180px;
//                     overflow-y: auto;
//                 }
//                 .price-form-quill .ql-editor {
//                     min-height: 180px;
//                 }
//             `}</style>

//             <form onSubmit={handleSubmit} className="space-y-4">
//                 {/* Error Message */}
//                 {error && (
//                     <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//                         {error}
//                     </div>
//                 )}

//                 {/* Category Field - react-select */}
//                 <div>
//                     <label
//                         htmlFor="category"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                         Category *
//                     </label>
//                     <Select
//                         inputId="category"
//                         name="category"
//                         options={categoryOptions}
//                         value={
//                             categoryOptions.find(
//                                 (option) => option.value === priceForm.category,
//                             ) || null
//                         }
//                         onChange={handleCategoryChange}
//                         placeholder="Select Category"
//                         isDisabled={submitting}
//                         isClearable
//                         menuPortalTarget={document.body}
//                         styles={{
//                             menuPortal: (base) => ({ ...base, zIndex: 9999 }),
//                         }}
//                     />
//                 </div>

//                 {/* Description Field */}
//                 <div>
//                     <label
//                         htmlFor="description"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                         Description *
//                     </label>
//                     <input
//                         type="text"
//                         id="description"
//                         name="description"
//                         value={priceForm.description}
//                         onChange={handleChange}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="Enter plan description"
//                         required
//                         disabled={submitting}
//                     />
//                 </div>

//                 {/* Price and Discount Fields - same flex row */}
//                 <div className="flex space-x-3">
//                     <div className="flex-1">
//                         <label
//                             htmlFor="price"
//                             className="block text-sm font-medium text-gray-700 mb-1"
//                         >
//                             Price *
//                         </label>
//                         <input
//                             type="number"
//                             id="price"
//                             name="price"
//                             value={priceForm.price}
//                             onChange={handleChange}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             placeholder="Enter price"
//                             min="0"
//                             step="0.01"
//                             required
//                             disabled={submitting}
//                         />
//                     </div>

//                     <div className="flex-1">
//                         <label
//                             htmlFor="discount"
//                             className="block text-sm font-medium text-gray-700 mb-1"
//                         >
//                             Discount
//                         </label>
//                         <input
//                             type="text"
//                             id="discount"
//                             name="discount"
//                             value={priceForm.discount}
//                             onChange={handleChange}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             placeholder="e.g., $80, $200"
//                             disabled={submitting}
//                         />
//                     </div>
//                 </div>

//                 {/* Features Field - React Quill Editor */}
//                 <div>
//                     <label
//                         htmlFor="features"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                         Features *
//                     </label>
//                     <div className="border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent price-form-quill">
//                         <ReactQuill
//                             ref={quillRef}
//                             theme="snow"
//                             value={priceForm.features}
//                             onChange={handleEditorChange}
//                             modules={modules}
//                             formats={formats}
//                             placeholder="List features (you can use bullets, numbers, or paragraphs)..."
//                             className="w-full"
//                         />
//                     </div>
//                 </div>

//                 {/* Duration Field */}
//                 <div>
//                     <label
//                         htmlFor="duration"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                         Duration *
//                     </label>
//                     <input
//                         type="text"
//                         id="duration"
//                         name="duration"
//                         value={priceForm.duration}
//                         onChange={handleChange}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="e.g., 1hr , 2hr"
//                         required
//                         disabled={submitting}
//                     />
//                 </div>

//                 {/* Buttons */}
//                 <div className="flex space-x-3 pt-4">
//                     <button
//                         type="button"
//                         onClick={onClose}
//                         disabled={submitting}
//                         className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-full hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         type="submit"
//                         disabled={submitting || !priceForm.features.trim()}
//                         className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                         {submitting ? "Updating..." : "Update Price Package"}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default EditPriceForm;