// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { FiEye, FiEyeOff, FiX } from "react-icons/fi"; // Using Feather icons
// // Alternative: You could also use other icon libraries like:
// // import { FaEye, FaEyeSlash } from 'react-icons/fa';
// // import { HiEye, HiEyeOff } from 'react-icons/hi';
// // import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

// const AddUserForm = ({ onClose, onSuccess }) => {
//     const [formData, setFormData] = useState({
//         name: "",
//         email: "",
//         password: "",
//         confirmPassword: "",
//     });

//     const [errors, setErrors] = useState({});
//     const [apiErrors, setApiErrors] = useState({});
//     const [submitting, setSubmitting] = useState(false);
//     const [showPassword, setShowPassword] = useState(false);
//     const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));

//         // Clear errors when user starts typing
//         if (errors[name]) {
//             setErrors((prev) => ({
//                 ...prev,
//                 [name]: "",
//             }));
//         }
//         if (apiErrors[name]) {
//             setApiErrors((prev) => ({
//                 ...prev,
//                 [name]: "",
//             }));
//         }
//     };

//     const togglePasswordVisibility = () => {
//         setShowPassword(!showPassword);
//     };

//     const toggleConfirmPasswordVisibility = () => {
//         setShowConfirmPassword(!showConfirmPassword);
//     };

//     const validateForm = () => {
//         const newErrors = {};

//         if (!formData.name.trim()) {
//             newErrors.name = "Full name is required";
//         }

//         if (!formData.email.trim()) {
//             newErrors.email = "Email is required";
//         } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//             newErrors.email = "Email is invalid";
//         }

//         if (!formData.password) {
//             newErrors.password = "Password is required";
//         } else if (formData.password.length < 6) {
//             newErrors.password = "Password must be at least 6 characters";
//         }

//         if (!formData.confirmPassword) {
//             newErrors.confirmPassword = "Please confirm your password";
//         } else if (formData.password !== formData.confirmPassword) {
//             newErrors.confirmPassword = "Passwords do not match";
//         }

//         return newErrors;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         const validationErrors = validateForm();
//         if (Object.keys(validationErrors).length > 0) {
//             setErrors(validationErrors);
//             return;
//         }

//         try {
//             setSubmitting(true);
//             setApiErrors({});

//             const submitData = new FormData();
//             submitData.append("name", formData.name);
//             submitData.append("email", formData.email);
//             submitData.append("password", formData.password);

//             // Create new user
//             await axios.post(route("ouruser.store"), submitData, {
//                 headers: {
//                     "Content-Type": "multipart/form-data",
//                 },
//             });

//             // Reset form
//             setFormData({
//                 name: "",
//                 email: "",
//                 password: "",
//                 confirmPassword: "",
//             });

//             // Call success callback
//             if (onSuccess) {
//                 onSuccess();
//             }

//             // Close modal
//             onClose();
//         } catch (error) {
//             console.error("Error creating user:", error);

//             if (
//                 error.response &&
//                 error.response.data &&
//                 error.response.data.errors
//             ) {
//                 const serverErrors = error.response.data.errors;
//                 setApiErrors(serverErrors);

//                 const firstError = Object.values(serverErrors)[0]?.[0];
//                 if (firstError) {
//                     alert(firstError);
//                 }
//             } else {
//                 alert("Error creating user. Please try again.");
//             }
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     const getErrorMessage = (field) => {
//         return apiErrors[field]?.[0] || errors[field];
//     };

//     return (
//         <div className="relative">
//             {/* Optional: Add a close button at the top right if needed */}
//             {/* <button
//         type="button"
//         onClick={onClose}
//         className="absolute right-0 top-0 text-gray-400 hover:text-gray-600 focus:outline-none"
//         disabled={submitting}
//       >
//         <FiX size={24} />
//       </button> */}

//             <form onSubmit={handleSubmit} className="space-y-4 pt-2">
//                 <div>
//                     <label
//                         htmlFor="name"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                         Full Name *
//                     </label>
//                     <input
//                         type="text"
//                         id="name"
//                         name="name"
//                         value={formData.name}
//                         onChange={handleChange}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Enter full name"
//                         disabled={submitting}
//                     />
//                     {getErrorMessage("name") && (
//                         <p className="text-red-500 text-sm mt-1">
//                             {getErrorMessage("name")}
//                         </p>
//                     )}
//                 </div>

//                 <div>
//                     <label
//                         htmlFor="email"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                         Email *
//                     </label>
//                     <input
//                         type="email"
//                         id="email"
//                         name="email"
//                         value={formData.email}
//                         onChange={handleChange}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Enter email"
//                         disabled={submitting}
//                     />
//                     {getErrorMessage("email") && (
//                         <p className="text-red-500 text-sm mt-1">
//                             {getErrorMessage("email")}
//                         </p>
//                     )}
//                 </div>

//                 <div>
//                     <label
//                         htmlFor="password"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                         Password *
//                     </label>
//                     <div className="relative">
//                         <input
//                             type={showPassword ? "text" : "password"}
//                             id="password"
//                             name="password"
//                             value={formData.password}
//                             onChange={handleChange}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
//                             placeholder="Enter password (min. 6 characters)"
//                             disabled={submitting}
//                         />
//                         <button
//                             type="button"
//                             onClick={togglePasswordVisibility}
//                             className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
//                             disabled={submitting}
//                             aria-label={
//                                 showPassword ? "Hide password" : "Show password"
//                             }
//                         >
//                             {showPassword ? (
//                                 <FiEyeOff size={20} className="text-gray-500" />
//                             ) : (
//                                 <FiEye size={20} className="text-gray-500" />
//                             )}
//                         </button>
//                     </div>
//                     {getErrorMessage("password") && (
//                         <p className="text-red-500 text-sm mt-1">
//                             {getErrorMessage("password")}
//                         </p>
//                     )}
//                 </div>

//                 <div>
//                     <label
//                         htmlFor="confirmPassword"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                         Confirm Password *
//                     </label>
//                     <div className="relative">
//                         <input
//                             type={showConfirmPassword ? "text" : "password"}
//                             id="confirmPassword"
//                             name="confirmPassword"
//                             value={formData.confirmPassword}
//                             onChange={handleChange}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
//                             placeholder="Confirm password"
//                             disabled={submitting}
//                         />
//                         <button
//                             type="button"
//                             onClick={toggleConfirmPasswordVisibility}
//                             className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
//                             disabled={submitting}
//                             aria-label={
//                                 showConfirmPassword
//                                     ? "Hide confirm password"
//                                     : "Show confirm password"
//                             }
//                         >
//                             {showConfirmPassword ? (
//                                 <FiEyeOff size={20} className="text-gray-500" />
//                             ) : (
//                                 <FiEye size={20} className="text-gray-500" />
//                             )}
//                         </button>
//                     </div>
//                     {getErrorMessage("confirmPassword") && (
//                         <p className="text-red-500 text-sm mt-1">
//                             {getErrorMessage("confirmPassword")}
//                         </p>
//                     )}
//                 </div>

//                 <div className="flex space-x-3 pt-4">
//                     <button
//                         type="button"
//                         onClick={onClose}
//                         disabled={submitting}
//                         className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors font-medium disabled:opacity-50"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         type="submit"
//                         disabled={submitting}
//                         className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//                     >
//                         {submitting ? (
//                             <>
//                                 <svg
//                                     className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     fill="none"
//                                     viewBox="0 0 24 24"
//                                 >
//                                     <circle
//                                         className="opacity-25"
//                                         cx="12"
//                                         cy="12"
//                                         r="10"
//                                         stroke="currentColor"
//                                         strokeWidth="4"
//                                     ></circle>
//                                     <path
//                                         className="opacity-75"
//                                         fill="currentColor"
//                                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                                     ></path>
//                                 </svg>
//                                 Creating...
//                             </>
//                         ) : (
//                             "Add User"
//                         )}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default AddUserForm;


import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import {
    FiEye,
    FiEyeOff,
    FiUser,
    FiMail,
    FiLock,
    FiPhone,
    FiShield,
} from "react-icons/fi";

const ROLE_OPTIONS = [
    { value: "admin", label: "Admin" },
    { value: "user", label: "User" },
];

const AddUserForm = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        phone_number: "",
    });

    const [errors, setErrors] = useState({});
    const [apiErrors, setApiErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.width = "100%";

        return () => {
            document.body.style.overflow = "unset";
            document.body.style.position = "static";
            document.body.style.width = "auto";
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
        if (apiErrors[name]) {
            setApiErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleRoleChange = (selectedOption) => {
        setFormData((prev) => ({
            ...prev,
            role: selectedOption ? selectedOption.value : "",
        }));

        if (errors.role) {
            setErrors((prev) => ({
                ...prev,
                role: "",
            }));
        }
        if (apiErrors.role) {
            setApiErrors((prev) => ({
                ...prev,
                role: "",
            }));
        }
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () =>
        setShowConfirmPassword(!showConfirmPassword);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Full name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setSubmitting(true);
            setApiErrors({});

            const submitData = new FormData();
            submitData.append("name", formData.name);
            submitData.append("email", formData.email);
            submitData.append("password", formData.password);
            if (formData.role) {
                submitData.append("role", formData.role);
            }
            if (formData.phone_number) {
                submitData.append("phone_number", formData.phone_number);
            }

            await axios.post(route("ouruser.store"), submitData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setFormData({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                role: "",
                phone_number: "",
            });

            if (onSuccess) {
                onSuccess();
            }

            onClose();
        } catch (error) {
            console.error("Error creating user:", error);

            if (
                error.response &&
                error.response.data &&
                error.response.data.errors
            ) {
                const serverErrors = error.response.data.errors;
                setApiErrors(serverErrors);

                const firstError = Object.values(serverErrors)[0]?.[0];
                if (firstError) {
                    alert(firstError);
                }
            } else {
                alert("Error creating user. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const getErrorMessage = (field) => apiErrors[field]?.[0] || errors[field];

    const fieldBaseClass = (field) =>
        `w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 ${
            getErrorMessage(field)
                ? "border-red-300 bg-red-50/40"
                : "border-gray-300 bg-white hover:border-gray-400"
        }`;

    const getRoleSelectStyles = (hasError) => ({
        control: (base, state) => ({
            ...base,
            paddingLeft: "1.75rem",
            minHeight: "42px",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            borderColor: hasError
                ? "#fca5a5"
                : state.isFocused
                  ? "#6366f1"
                  : "#d1d5db",
            backgroundColor: hasError ? "rgba(254, 242, 242, 0.4)" : "#ffffff",
            boxShadow: state.isFocused
                ? "0 0 0 2px rgba(99, 102, 241, 0.4)"
                : "none",
            "&:hover": {
                borderColor: state.isFocused
                    ? "#6366f1"
                    : hasError
                      ? "#fca5a5"
                      : "#9ca3af",
            },
        }),
        valueContainer: (base) => ({
            ...base,
            padding: "2px 4px",
        }),
        placeholder: (base) => ({
            ...base,
            color: "#9ca3af",
        }),
        singleValue: (base) => ({
            ...base,
            color: "#111827",
        }),
        indicatorSeparator: () => ({
            display: "none",
        }),
        menu: (base) => ({
            ...base,
            zIndex: 20,
            fontSize: "0.875rem",
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? "#4f46e5"
                : state.isFocused
                  ? "#eef2ff"
                  : "#ffffff",
            color: state.isSelected ? "#ffffff" : "#111827",
        }),
    });

    const selectedRoleOption =
        ROLE_OPTIONS.find((opt) => opt.value === formData.role) || null;

    return (
        <div className="relative">
            <form onSubmit={handleSubmit} className="pt-1">
                {/* Section: Account details */}
                <div className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Account Details
                    </p>

                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                        >
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FiUser
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={16}
                            />
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={fieldBaseClass("name")}
                                placeholder="e.g. Jane Cooper"
                                disabled={submitting}
                            />
                        </div>
                        {getErrorMessage("name") && (
                            <p className="text-red-500 text-xs mt-1.5">
                                {getErrorMessage("name")}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                        >
                            Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FiMail
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={16}
                            />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={fieldBaseClass("email")}
                                placeholder="name@company.com"
                                disabled={submitting}
                            />
                        </div>
                        {getErrorMessage("email") && (
                            <p className="text-red-500 text-xs mt-1.5">
                                {getErrorMessage("email")}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="role"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Role
                            </label>
                            <div className="relative">
                                <FiShield
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                                    size={16}
                                />
                                <Select
                                    inputId="role"
                                    name="role"
                                    options={ROLE_OPTIONS}
                                    value={selectedRoleOption}
                                    onChange={handleRoleChange}
                                    isDisabled={submitting}
                                    isClearable
                                    placeholder="Select role"
                                    styles={getRoleSelectStyles(
                                        !!getErrorMessage("role"),
                                    )}
                                />
                            </div>
                            {getErrorMessage("role") && (
                                <p className="text-red-500 text-xs mt-1.5">
                                    {getErrorMessage("role")}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="phone_number"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Phone Number
                            </label>
                            <div className="relative">
                                <FiPhone
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={16}
                                />
                                <input
                                    type="text"
                                    id="phone_number"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    className={fieldBaseClass("phone_number")}
                                    placeholder="Optional"
                                    disabled={submitting}
                                />
                            </div>
                            {getErrorMessage("phone_number") && (
                                <p className="text-red-500 text-xs mt-1.5">
                                    {getErrorMessage("phone_number")}
                                </p>
                            )}
                        </div>
                    </div>
                     <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                        >
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FiLock
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={16}
                            />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`${fieldBaseClass("password")} pr-10`}
                                placeholder="Min. 6 characters"
                                disabled={submitting}
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                disabled={submitting}
                                aria-label={
                                    showPassword ? "Hide password" : "Show password"
                                }
                            >
                                {showPassword ? (
                                    <FiEyeOff size={16} />
                                ) : (
                                    <FiEye size={16} />
                                )}
                            </button>
                        </div>
                        {getErrorMessage("password") && (
                            <p className="text-red-500 text-xs mt-1.5">
                                {getErrorMessage("password")}
                            </p>
                        )}
                    </div>
                     <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                        >
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FiLock
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={16}
                            />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`${fieldBaseClass("confirmPassword")} pr-10`}
                                placeholder="Re-enter password"
                                disabled={submitting}
                            />
                            <button
                                type="button"
                                onClick={toggleConfirmPasswordVisibility}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                disabled={submitting}
                                aria-label={
                                    showConfirmPassword
                                        ? "Hide confirm password"
                                        : "Show confirm password"
                                }
                            >
                                {showConfirmPassword ? (
                                    <FiEyeOff size={16} />
                                ) : (
                                    <FiEye size={16} />
                                )}
                            </button>
                        </div>
                        {getErrorMessage("confirmPassword") && (
                            <p className="text-red-500 text-xs mt-1.5">
                                {getErrorMessage("confirmPassword")}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex space-x-3 pt-6 mt-1  pt-5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="flex-1 bg-white text-gray-700 py-2.5 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                    >
                        {submitting ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Creating...
                            </>
                        ) : (
                            "Add User"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddUserForm;

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { FiEye, FiEyeOff, FiX } from "react-icons/fi";

// const AddUserForm = ({ onClose, onSuccess }) => {
//     const [formData, setFormData] = useState({
//         name: "",
//         email: "",
//         password: "",
//         confirmPassword: "",
//         role: "",
//         phone_number: "",
//     });

//     const [errors, setErrors] = useState({});
//     const [apiErrors, setApiErrors] = useState({});
//     const [submitting, setSubmitting] = useState(false);
//     const [showPassword, setShowPassword] = useState(false);
//     const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//     useEffect(() => {
//         document.body.style.overflow = "hidden";
//         document.body.style.position = "fixed";
//         document.body.style.width = "100%";

//         return () => {
//             document.body.style.overflow = "unset";
//             document.body.style.position = "static";
//             document.body.style.width = "auto";
//         };
//     }, []);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));

//         if (errors[name]) {
//             setErrors((prev) => ({
//                 ...prev,
//                 [name]: "",
//             }));
//         }
//         if (apiErrors[name]) {
//             setApiErrors((prev) => ({
//                 ...prev,
//                 [name]: "",
//             }));
//         }
//     };

//     const togglePasswordVisibility = () => {
//         setShowPassword(!showPassword);
//     };

//     const toggleConfirmPasswordVisibility = () => {
//         setShowConfirmPassword(!showConfirmPassword);
//     };

//     const validateForm = () => {
//         const newErrors = {};

//         if (!formData.name.trim()) {
//             newErrors.name = "Full name is required";
//         }

//         if (!formData.email.trim()) {
//             newErrors.email = "Email is required";
//         } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//             newErrors.email = "Email is invalid";
//         }

//         if (!formData.password) {
//             newErrors.password = "Password is required";
//         } else if (formData.password.length < 6) {
//             newErrors.password = "Password must be at least 6 characters";
//         }

//         if (!formData.confirmPassword) {
//             newErrors.confirmPassword = "Please confirm your password";
//         } else if (formData.password !== formData.confirmPassword) {
//             newErrors.confirmPassword = "Passwords do not match";
//         }

//         return newErrors;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         const validationErrors = validateForm();
//         if (Object.keys(validationErrors).length > 0) {
//             setErrors(validationErrors);
//             return;
//         }

//         try {
//             setSubmitting(true);
//             setApiErrors({});

//             const submitData = new FormData();
//             submitData.append("name", formData.name);
//             submitData.append("email", formData.email);
//             submitData.append("password", formData.password);
//             if (formData.role) {
//                 submitData.append("role", formData.role);
//             }
//             if (formData.phone_number) {
//                 submitData.append("phone_number", formData.phone_number);
//             }

//             await axios.post(route("ouruser.store"), submitData, {
//                 headers: {
//                     "Content-Type": "multipart/form-data",
//                 },
//             });

//             setFormData({
//                 name: "",
//                 email: "",
//                 password: "",
//                 confirmPassword: "",
//                 role: "",
//                 phone_number: "",
//             });

//             if (onSuccess) {
//                 onSuccess();
//             }

//             onClose();
//         } catch (error) {
//             console.error("Error creating user:", error);

//             if (
//                 error.response &&
//                 error.response.data &&
//                 error.response.data.errors
//             ) {
//                 const serverErrors = error.response.data.errors;
//                 setApiErrors(serverErrors);

//                 const firstError = Object.values(serverErrors)[0]?.[0];
//                 if (firstError) {
//                     alert(firstError);
//                 }
//             } else {
//                 alert("Error creating user. Please try again.");
//             }
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     const getErrorMessage = (field) => {
//         return apiErrors[field]?.[0] || errors[field];
//     };

//     return (
//         <div className="relative">
//             <form onSubmit={handleSubmit} className="space-y-4 pt-2">
//                 <div>
//                     <label
//                         htmlFor="name"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                         Full Name *
//                     </label>
//                     <input
//                         type="text"
//                         id="name"
//                         name="name"
//                         value={formData.name}
//                         onChange={handleChange}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Enter full name"
//                         disabled={submitting}
//                     />
//                     {getErrorMessage("name") && (
//                         <p className="text-red-500 text-sm mt-1">
//                             {getErrorMessage("name")}
//                         </p>
//                     )}
//                 </div>

//                 <div>
//                     <label
//                         htmlFor="email"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                         Email *
//                     </label>
//                     <input
//                         type="email"
//                         id="email"
//                         name="email"
//                         value={formData.email}
//                         onChange={handleChange}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Enter email"
//                         disabled={submitting}
//                     />
//                     {getErrorMessage("email") && (
//                         <p className="text-red-500 text-sm mt-1">
//                             {getErrorMessage("email")}
//                         </p>
//                     )}
//                 </div>

//                 <div>
//                     <label
//                         htmlFor="role"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                         Role
//                     </label>
//                     <select
//                         id="role"
//                         name="role"
//                         value={formData.role}
//                         onChange={handleChange}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         disabled={submitting}
//                     >
//                         <option value="">Select role</option>
//                         <option value="admin">Admin</option>
//                         <option value="user">User</option>
//                     </select>
//                     {getErrorMessage("role") && (
//                         <p className="text-red-500 text-sm mt-1">
//                             {getErrorMessage("role")}
//                         </p>
//                     )}
//                 </div>

//                 <div>
//                     <label
//                         htmlFor="phone_number"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                         Phone Number
//                     </label>
//                     <input
//                         type="text"
//                         id="phone_number"
//                         name="phone_number"
//                         value={formData.phone_number}
//                         onChange={handleChange}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Enter phone number"
//                         disabled={submitting}
//                     />
//                     {getErrorMessage("phone_number") && (
//                         <p className="text-red-500 text-sm mt-1">
//                             {getErrorMessage("phone_number")}
//                         </p>
//                     )}
//                 </div>

//                 <div>
//                     <label
//                         htmlFor="password"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                         Password *
//                     </label>
//                     <div className="relative">
//                         <input
//                             type={showPassword ? "text" : "password"}
//                             id="password"
//                             name="password"
//                             value={formData.password}
//                             onChange={handleChange}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
//                             placeholder="Enter password (min. 6 characters)"
//                             disabled={submitting}
//                         />
//                         <button
//                             type="button"
//                             onClick={togglePasswordVisibility}
//                             className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
//                             disabled={submitting}
//                             aria-label={
//                                 showPassword ? "Hide password" : "Show password"
//                             }
//                         >
//                             {showPassword ? (
//                                 <FiEyeOff size={20} className="text-gray-500" />
//                             ) : (
//                                 <FiEye size={20} className="text-gray-500" />
//                             )}
//                         </button>
//                     </div>
//                     {getErrorMessage("password") && (
//                         <p className="text-red-500 text-sm mt-1">
//                             {getErrorMessage("password")}
//                         </p>
//                     )}
//                 </div>

//                 <div>
//                     <label
//                         htmlFor="confirmPassword"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                         Confirm Password *
//                     </label>
//                     <div className="relative">
//                         <input
//                             type={showConfirmPassword ? "text" : "password"}
//                             id="confirmPassword"
//                             name="confirmPassword"
//                             value={formData.confirmPassword}
//                             onChange={handleChange}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
//                             placeholder="Confirm password"
//                             disabled={submitting}
//                         />
//                         <button
//                             type="button"
//                             onClick={toggleConfirmPasswordVisibility}
//                             className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
//                             disabled={submitting}
//                             aria-label={
//                                 showConfirmPassword
//                                     ? "Hide confirm password"
//                                     : "Show confirm password"
//                             }
//                         >
//                             {showConfirmPassword ? (
//                                 <FiEyeOff size={20} className="text-gray-500" />
//                             ) : (
//                                 <FiEye size={20} className="text-gray-500" />
//                             )}
//                         </button>
//                     </div>
//                     {getErrorMessage("confirmPassword") && (
//                         <p className="text-red-500 text-sm mt-1">
//                             {getErrorMessage("confirmPassword")}
//                         </p>
//                     )}
//                 </div>

//                 <div className="flex space-x-3 pt-4">
//                     <button
//                         type="button"
//                         onClick={onClose}
//                         disabled={submitting}
//                         className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors font-medium disabled:opacity-50"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         type="submit"
//                         disabled={submitting}
//                         className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//                     >
//                         {submitting ? (
//                             <>
//                                 <svg
//                                     className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     fill="none"
//                                     viewBox="0 0 24 24"
//                                 >
//                                     <circle
//                                         className="opacity-25"
//                                         cx="12"
//                                         cy="12"
//                                         r="10"
//                                         stroke="currentColor"
//                                         strokeWidth="4"
//                                     ></circle>
//                                     <path
//                                         className="opacity-75"
//                                         fill="currentColor"
//                                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                                     ></path>
//                                 </svg>
//                                 Creating...
//                             </>
//                         ) : (
//                             "Add User"
//                         )}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default AddUserForm;
