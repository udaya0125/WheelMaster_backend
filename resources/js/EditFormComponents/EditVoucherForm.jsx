// import axios from "axios";
// import React, { useState } from "react";

// const EditVoucherForm = ({ editingVoucher, onClose, setReloadTrigger }) => {
//     const [form, setForm] = useState({
//         buyer_name: editingVoucher.buyer_name || "",
//         buyer_email: editingVoucher.buyer_email || "",
//         recipient_email: editingVoucher.recipient_email || "",
//         message: editingVoucher.message || "",
//         status: editingVoucher.status || "active",
//     });
//     const [submitting, setSubmitting] = useState(false);
//     const [errors, setErrors] = useState({});
//     const change = (event) =>
//         setForm((current) => ({
//             ...current,
//             [event.target.name]: event.target.value,
//         }));
//     const handleSubmit = async (event) => {
//         event.preventDefault();
//         setSubmitting(true);
//         setErrors({});
//         try {
//             await axios.put(
//                 route("ourvoucher.update", { voucher: editingVoucher.id }),
//                 form,
//             );
//             setReloadTrigger((previous) => !previous);
//             onClose();
//         } catch (error) {
//             setErrors(
//                 error.response?.data?.errors || {
//                     general: "Unable to update voucher. Please try again.",
//                 },
//             );
//         } finally {
//             setSubmitting(false);
//         }
//     };
//     return (
//         <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
//                 <strong>{editingVoucher.code}</strong> ·{" "}
//                 {editingVoucher.price?.description || "Package unavailable"}
//             </div>
//             {errors.general && (
//                 <p className="rounded bg-red-100 p-3 text-sm text-red-700">
//                     {errors.general}
//                 </p>
//             )}
//             <div>
//                 <Field label="Buyer name" error={errors.buyer_name}>
//                     <input
//                         name="buyer_name"
//                         value={form.buyer_name}
//                         onChange={change}
//                         className={inputClass}
//                         required
//                         disabled={submitting}
//                     />
//                 </Field>
//                 <Field label="Buyer email" error={errors.buyer_email}>
//                     <input
//                         name="buyer_email"
//                         type="email"
//                         value={form.buyer_email}
//                         onChange={change}
//                         className={inputClass}
//                         required
//                         disabled={submitting}
//                     />
//                 </Field>
//             </div>
//             <Field label="Recipient email" error={errors.recipient_email}>
//                 <input
//                     name="recipient_email"
//                     type="email"
//                     value={form.recipient_email}
//                     onChange={change}
//                     className={inputClass}
//                     disabled={submitting}
//                 />
//             </Field>
//             <div className="grid gap-4 sm:grid-cols-2">
//                 <Field label="Status" error={errors.status}>
//                     <select
//                         name="status"
//                         value={form.status}
//                         onChange={change}
//                         className={inputClass}
//                         disabled={submitting}
//                     >
//                         <option value="active">Active</option>
//                         <option value="used">Used</option>
//                         <option value="expired">Expired</option>
//                         <option value="cancelled">Cancelled</option>
//                     </select>
//                 </Field>
//             </div>
//             <Field label="Message" error={errors.message}>
//                 <textarea
//                     name="message"
//                     value={form.message}
//                     onChange={change}
//                     className={inputClass}
//                     rows="6"
//                     disabled={submitting}
//                 />
//             </Field>
//             <div className="flex space-x-3 pt-4">
//                 <button
//                     type="button"
//                     onClick={onClose}
//                     disabled={submitting}
//                     className="flex-1 rounded-full bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
//                 >
//                     Cancel
//                 </button>
//                 <button
//                     disabled={submitting}
//                     className="flex-1 rounded-full bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
//                 >
//                     {submitting ? "Saving..." : "Save Changes"}
//                 </button>
//             </div>
//         </form>
//     );
// };
// const inputClass =
//     "w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500";
// const Field = ({ label, error, children }) => (
//     <label className="block text-sm font-medium text-gray-700">
//         {label}
//         <div className="mt-1">{children}</div>
//         {error && (
//             <span className="mt-1 block text-xs font-normal text-red-600">
//                 {error}
//             </span>
//         )}
//     </label>
// );
// export default EditVoucherForm;


import axios from "axios";
import React, { useState } from "react";
import Select from "react-select";
import {
    FiUser,
    FiMail,
    FiSend,
    FiFlag,
    FiMessageSquare,
    FiKey,
} from "react-icons/fi";

const STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "used", label: "Used" },
    { value: "expired", label: "Expired" },
    { value: "cancelled", label: "Cancelled" },
];

const  EditVoucherForm = ({ editingVoucher, onClose, setReloadTrigger }) => {
    const [form, setForm] = useState({
        buyer_name: editingVoucher.buyer_name || "",
        buyer_email: editingVoucher.buyer_email || "",
        recipient_email: editingVoucher.recipient_email || "",
        message: editingVoucher.message || "",
        status: editingVoucher.status || "active",
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const selectedStatus =
        STATUS_OPTIONS.find((opt) => opt.value === form.status) || null;

    const clearError = (name) =>
        setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));

    const change = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
        clearError(name);
    };

    const handleStatusChange = (selectedOption) => {
        setForm((current) => ({
            ...current,
            status: selectedOption ? selectedOption.value : "",
        }));
        clearError("status");
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.buyer_name.trim()) {
            newErrors.buyer_name = "Buyer name is required";
        }

        if (!form.buyer_email.trim()) {
            newErrors.buyer_email = "Buyer email is required";
        } else if (!/\S+@\S+\.\S+/.test(form.buyer_email)) {
            newErrors.buyer_email = "Email is invalid";
        }

        if (
            form.recipient_email.trim() &&
            !/\S+@\S+\.\S+/.test(form.recipient_email)
        ) {
            newErrors.recipient_email = "Email is invalid";
        }

        if (!form.status) newErrors.status = "Status is required";

        return newErrors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setSubmitting(true);
        setErrors({});
        try {
            await axios.put(
                route("ourvoucher.update", { voucher: editingVoucher.id }),
                form,
            );
            setReloadTrigger((previous) => !previous);
            onClose();
        } catch (error) {
            setErrors(
                error.response?.data?.errors || {
                    general: "Unable to update voucher. Please try again.",
                },
            );
        } finally {
            setSubmitting(false);
        }
    };

    const getErrorMessage = (field) => {
        const value = errors[field];
        return Array.isArray(value) ? value[0] : value;
    };

    const fieldBaseClass = (field) =>
        `w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 ${
            getErrorMessage(field)
                ? "border-red-300 bg-red-50/40"
                : "border-gray-300 bg-white hover:border-gray-400"
        }`;

    const getSelectStyles = (hasError) => ({
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

    const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
    const iconClass =
        "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400";
    const errorClass = "text-red-500 text-xs mt-1.5";

    return (
        <div className="relative">
            <form onSubmit={handleSubmit} className="pt-1" noValidate>
                <div className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Voucher Details
                    </p>

                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                        <FiKey className="text-gray-400 shrink-0" size={16} />
                        <span>
                            <strong className="font-mono tracking-widest">
                                {editingVoucher.code}
                            </strong>{" "}
                            ·{" "}
                            {editingVoucher.price?.description ||
                                "Package unavailable"}
                        </span>
                    </div>

                    {errors.general && (
                        <p className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                            {errors.general}
                        </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="buyer_name" className={labelClass}>
                                Buyer Name{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FiUser className={iconClass} size={16} />
                                <input
                                    type="text"
                                    id="buyer_name"
                                    name="buyer_name"
                                    value={form.buyer_name}
                                    onChange={change}
                                    className={fieldBaseClass("buyer_name")}
                                    placeholder="e.g. Jane Cooper"
                                    disabled={submitting}
                                />
                            </div>
                            {getErrorMessage("buyer_name") && (
                                <p className={errorClass}>
                                    {getErrorMessage("buyer_name")}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="buyer_email" className={labelClass}>
                                Buyer Email{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FiMail className={iconClass} size={16} />
                                <input
                                    type="email"
                                    id="buyer_email"
                                    name="buyer_email"
                                    value={form.buyer_email}
                                    onChange={change}
                                    className={fieldBaseClass("buyer_email")}
                                    placeholder="name@company.com"
                                    disabled={submitting}
                                />
                            </div>
                            {getErrorMessage("buyer_email") && (
                                <p className={errorClass}>
                                    {getErrorMessage("buyer_email")}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="recipient_email"
                                className={labelClass}
                            >
                                Recipient Email
                            </label>
                            <div className="relative">
                                <FiSend className={iconClass} size={16} />
                                <input
                                    type="email"
                                    id="recipient_email"
                                    name="recipient_email"
                                    value={form.recipient_email}
                                    onChange={change}
                                    className={fieldBaseClass(
                                        "recipient_email",
                                    )}
                                    placeholder="Optional"
                                    disabled={submitting}
                                />
                            </div>
                            {getErrorMessage("recipient_email") && (
                                <p className={errorClass}>
                                    {getErrorMessage("recipient_email")}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="status" className={labelClass}>
                                Status <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FiFlag
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                                    size={16}
                                />
                                <Select
                                    inputId="status"
                                    name="status"
                                    options={STATUS_OPTIONS}
                                    value={selectedStatus}
                                    onChange={handleStatusChange}
                                    isDisabled={submitting}
                                    placeholder="Select status"
                                    styles={getSelectStyles(
                                        !!getErrorMessage("status"),
                                    )}
                                />
                            </div>
                            {getErrorMessage("status") && (
                                <p className={errorClass}>
                                    {getErrorMessage("status")}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="message" className={labelClass}>
                            Message
                        </label>
                        <div className="relative">
                            <FiMessageSquare
                                className="absolute left-3 top-3.5 text-gray-400"
                                size={16}
                            />
                            <textarea
                                id="message"
                                name="message"
                                value={form.message}
                                onChange={change}
                                rows="5"
                                className={fieldBaseClass("message")}
                                placeholder="Optional"
                                disabled={submitting}
                            />
                        </div>
                        {getErrorMessage("message") && (
                            <p className={errorClass}>
                                {getErrorMessage("message")}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex space-x-3 pt-6 mt-1">
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
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditVoucherForm;
