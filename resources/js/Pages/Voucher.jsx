// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import axios from "axios";
// import {
//     FiCheck,
//     FiClipboard,
//     FiEdit,
//     FiEye,
//     FiGift,
//     FiPlus,
//     FiTrash2,
// } from "react-icons/fi";
// import Wrapper from "@/AdminWrapper/Wrapper";
// import MyTable from "@/MyTable/MyTable";
// import AddVoucherForm from "@/AddFormComponent/AddVoucherForm";
// import EditVoucherForm from "@/EditFormComponents/EditVoucherForm";
// import VoucherPopup , {
//     FormModal,
//     formatDate,
//     money,
//     statusStyle,
// }from "./VoucherPopup";

// const ActionButton = ({ onClick, title, className, children }) => (
//     <button
//         onClick={onClick}
//         title={title}
//         className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 font-medium ${className}`}
//     >
//         {children}
//         <span className="sr-only">{title}</span>
//     </button>
// );

// const Voucher = () => {
//     const [vouchers, setVouchers] = useState([]);
//     const [packageOptions, setPackageOptions] = useState([]);
//     const [reloadTrigger, setReloadTrigger] = useState(false);
//     const [showAddForm, setShowAddForm] = useState(false);
//     const [editingVoucher, setEditingVoucher] = useState(null);
//     const [detailsVoucher, setDetailsVoucher] = useState(null);
//     const [copiedCode, setCopiedCode] = useState("");
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const copyTimer = useRef(null);

//     useEffect(() => {
//         const fetchVouchers = async () => {
//             try {
//                 setLoading(true);
//                 setError("");
//                 const { data } = await axios.get(route("ourvoucher.index"));
//                 setVouchers(data.vouchers || []);
//                 setPackageOptions(data.packageOptions || []);
//             } catch (fetchError) {
//                 console.error("Error fetching vouchers", fetchError);
//                 setError("Failed to load vouchers.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchVouchers();
//     }, [reloadTrigger]);

//     useEffect(() => () => clearTimeout(copyTimer.current), []);

//     const closeAdd = useCallback(() => setShowAddForm(false), []);
//     const closeEdit = useCallback(() => setEditingVoucher(null), []);
//     const closeDetails = useCallback(() => setDetailsVoucher(null), []);

//     const copyCode = useCallback(async (code) => {
//         try {
//             if (navigator.clipboard?.writeText) {
//                 await navigator.clipboard.writeText(code);
//             } else {
//                 const input = document.createElement("textarea");
//                 input.value = code;
//                 input.style.position = "fixed";
//                 input.style.opacity = "0";
//                 document.body.appendChild(input);
//                 input.select();
//                 document.execCommand("copy");
//                 input.remove();
//             }
//             setCopiedCode(code);
//             clearTimeout(copyTimer.current);
//             copyTimer.current = setTimeout(() => setCopiedCode(""), 2000);
//         } catch (copyError) {
//             console.error("Unable to copy voucher code", copyError);
//         }
//     }, []);

//     const deleteVoucher = useCallback(async (voucher) => {
//         if (!window.confirm(`Delete voucher ${voucher.code}? This cannot be undone.`)) {
//             return;
//         }

//         try {
//             await axios.delete(route("ourvoucher.destroy", { voucher: voucher.id }));
//             setVouchers((current) => current.filter((item) => item.id !== voucher.id));
//             setEditingVoucher((current) => (current?.id === voucher.id ? null : current));
//             setDetailsVoucher((current) => (current?.id === voucher.id ? null : current));
//         } catch (deleteError) {
//             console.error("Error deleting voucher", deleteError);
//             setError(
//                 deleteError.response?.data?.message ||
//                     "Unable to delete voucher. Please try again.",
//             );
//         }
//     }, []);

//     const openEditFromDetails = () => {
//         setEditingVoucher(detailsVoucher);
//         setDetailsVoucher(null);
//     };

//     const columns = useMemo(
//         () => [
//             {
//                 Header: "ID",
//                 accessor: (row, i) => i + 1,
//                 id: "rowIndex",
//                 width: 60,
//             },
//             {
//                 Header: "Code / Package",
//                 accessor: "code",
//                 Cell: ({ row: { original } }) => (
//                     <div>
//                         <div className="flex items-center gap-1">
//                             <p className="font-mono font-semibold text-gray-900">
//                                 {original.code}
//                             </p>
//                             <button
//                                 onClick={() => copyCode(original.code)}
//                                 title="Copy voucher code"
//                                 className="rounded p-1 text-indigo-600 hover:bg-indigo-50"
//                             >
//                                 {copiedCode === original.code ? <FiCheck /> : <FiClipboard />}
//                             </button>
//                         </div>
//                         <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
//                             {original.price?.description || "Package unavailable"}
//                         </p>
//                     </div>
//                 ),
//             },
//             {
//                 Header: "Recipient",
//                 accessor: "recipient_email",
//                 Cell: ({ row: { original } }) => (
//                     <div>
//                         <p className="font-medium text-gray-800">
//                             {original.recipient_email || original.buyer_email}
//                         </p>
//                         <p className="mt-1 text-xs text-gray-500">
//                             Buyer: {original.buyer_name}
//                         </p>
//                     </div>
//                 ),
//             },
//             {
//                 Header: "Balance",
//                 accessor: "balance",
//                 Cell: ({ row: { original } }) => (
//                     <div>
//                         <p className="font-semibold text-gray-800">{money(original.balance)}</p>
//                         <p className="text-xs text-gray-500">of {money(original.amount)}</p>
//                     </div>
//                 ),
//             },
//             {
//                 Header: "Expires",
//                 accessor: "expires_at",
//                 Cell: ({ value }) => (
//                     <span className="text-gray-600">{formatDate(value)}</span>
//                 ),
//             },
//             {
//                 Header: "Status",
//                 accessor: "status",
//                 Cell: ({ value }) => (
//                     <span
//                         className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle(value)}`}
//                     >
//                         {value}
//                     </span>
//                 ),
//             },
//             {
//                 Header: "Action",
//                 id: "action",
//                 disableSortBy: true,
//                 Cell: ({ row: { original } }) => (
//                     <div className="flex items-center gap-1">
//                         <ActionButton
//                             onClick={() => setDetailsVoucher(original)}
//                             title="View voucher details"
//                             className="text-slate-700 hover:bg-slate-100"
//                         >
//                             <FiEye />
//                         </ActionButton>
//                         <ActionButton
//                             onClick={() => setEditingVoucher(original)}
//                             title="Edit voucher"
//                             className="text-indigo-600 hover:bg-indigo-50"
//                         >
//                             <FiEdit />
//                         </ActionButton>
//                         <ActionButton
//                             onClick={() => deleteVoucher(original)}
//                             title="Delete voucher"
//                             className="text-red-600 hover:bg-red-50"
//                         >
//                             <FiTrash2 />
//                         </ActionButton>
//                     </div>
//                 ),
//             },
//         ],
//         [copiedCode, copyCode, deleteVoucher],
//     );

//     return (
//         <Wrapper>
//             {showAddForm && (
//                 <FormModal
//                     title="Add Voucher"
//                     subtitle="Create an active voucher without payment. It expires one year after creation."
//                     icon={<FiPlus />}
//                     onClose={closeAdd}
//                 >
//                     <AddVoucherForm
//                         onClose={closeAdd}
//                         setReloadTrigger={setReloadTrigger}
//                         packageOptions={packageOptions}
//                     />
//                 </FormModal>
//             )}

//             {editingVoucher && (
//                 <FormModal
//                     title="Edit Voucher"
//                     subtitle={`Update voucher ${editingVoucher.code}`}
//                     icon={<FiEdit />}
//                     onClose={closeEdit}
//                 >
//                     <EditVoucherForm
//                         editingVoucher={editingVoucher}
//                         onClose={closeEdit}
//                         setReloadTrigger={setReloadTrigger}
//                     />
//                 </FormModal>
//             )}

//             {detailsVoucher && (
//                 <VoucherPopup
//                     voucher={detailsVoucher}
//                     copied={copiedCode === detailsVoucher.code}
//                     onCopy={copyCode}
//                     onEdit={openEditFromDetails}
//                     onClose={closeDetails}
//                 />
//             )}

//             <section className="px-2 py-6 sm:px-6 lg:px-8">
//                 <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
//                     <h1 className="mt-3 text-3xl font-bold text-gray-900">Gift Vouchers</h1>
//                     <button
//                         onClick={() => setShowAddForm(true)}
//                         className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
//                     >
//                         <FiPlus /> Add Voucher
//                     </button>
//                 </div>

//                 {error && (
//                     <div className="mb-5 rounded-lg border border-red-300 bg-red-100 px-4 py-3 text-red-700">
//                         {error}
//                     </div>
//                 )}

//                 {loading ? (
//                     <div className="py-16 text-center text-gray-500">Loading vouchers...</div>
//                 ) : vouchers.length === 0 ? (
//                     <div className="rounded-xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-200">
//                         <FiGift className="mx-auto mb-3 text-4xl text-gray-300" />
//                         <p className="font-medium text-gray-700">No vouchers found.</p>
//                         <button
//                             onClick={() => setShowAddForm(true)}
//                             className="mt-4 text-sm font-semibold text-indigo-600"
//                         >
//                             Create the first voucher
//                         </button>
//                     </div>
//                 ) : (
//                     <MyTable columns={columns} data={vouchers} />
//                 )}
//             </section>
//         </Wrapper>
//     );
// };

// export default Voucher;


import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
    FiCheck,
    FiClipboard,
    FiEdit,
    FiEye,
    FiGift,
    FiPlus,
    FiSearch,
    FiTrash2,
    FiX,
} from "react-icons/fi";
import Wrapper from "@/AdminWrapper/Wrapper";
import MyTable from "@/MyTable/MyTable";
import AddVoucherForm from "@/AddFormComponent/AddVoucherForm";
import EditVoucherForm from "@/EditFormComponents/EditVoucherForm";
import VoucherPopup , {
    FormModal,
    formatDate,
    money,
    statusStyle,
}from "./VoucherPopup";

const STATUS_OPTIONS = [
    { value: "all", label: "All statuses" },
    { value: "active", label: "Active" },
    { value: "used", label: "Used" },
    { value: "expired", label: "Expired" },
    { value: "cancelled", label: "Cancelled" },
];

const ActionButton = ({ onClick, title, className, children }) => (
    <button
        onClick={onClick}
        title={title}
        className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 font-medium ${className}`}
    >
        {children}
        <span className="sr-only">{title}</span>
    </button>
);

const Voucher = () => {
    const [vouchers, setVouchers] = useState([]);
    const [packageOptions, setPackageOptions] = useState([]);
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);
    const [detailsVoucher, setDetailsVoucher] = useState(null);
    const [copiedCode, setCopiedCode] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const copyTimer = useRef(null);

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                setLoading(true);
                setError("");
                const { data } = await axios.get(route("ourvoucher.index"));
                setVouchers(data.vouchers || []);
                setPackageOptions(data.packageOptions || []);
            } catch (fetchError) {
                console.error("Error fetching vouchers", fetchError);
                setError("Failed to load vouchers.");
            } finally {
                setLoading(false);
            }
        };
        fetchVouchers();
    }, [reloadTrigger]);

    useEffect(() => () => clearTimeout(copyTimer.current), []);

    const closeAdd = useCallback(() => setShowAddForm(false), []);
    const closeEdit = useCallback(() => setEditingVoucher(null), []);
    const closeDetails = useCallback(() => setDetailsVoucher(null), []);

    const copyCode = useCallback(async (code) => {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(code);
            } else {
                const input = document.createElement("textarea");
                input.value = code;
                input.style.position = "fixed";
                input.style.opacity = "0";
                document.body.appendChild(input);
                input.select();
                document.execCommand("copy");
                input.remove();
            }
            setCopiedCode(code);
            clearTimeout(copyTimer.current);
            copyTimer.current = setTimeout(() => setCopiedCode(""), 2000);
        } catch (copyError) {
            console.error("Unable to copy voucher code", copyError);
        }
    }, []);

    const deleteVoucher = useCallback(async (voucher) => {
        if (!window.confirm(`Delete voucher ${voucher.code}? This cannot be undone.`)) {
            return;
        }

        try {
            await axios.delete(route("ourvoucher.destroy", { voucher: voucher.id }));
            setVouchers((current) => current.filter((item) => item.id !== voucher.id));
            setEditingVoucher((current) => (current?.id === voucher.id ? null : current));
            setDetailsVoucher((current) => (current?.id === voucher.id ? null : current));
        } catch (deleteError) {
            console.error("Error deleting voucher", deleteError);
            setError(
                deleteError.response?.data?.message ||
                    "Unable to delete voucher. Please try again.",
            );
        }
    }, []);

    const openEditFromDetails = () => {
        setEditingVoucher(detailsVoucher);
        setDetailsVoucher(null);
    };

    const statusCounts = useMemo(() => {
        const counts = { all: vouchers.length };
        vouchers.forEach((voucher) => {
            const key = String(voucher.status || "").toLowerCase();
            counts[key] = (counts[key] || 0) + 1;
        });
        return counts;
    }, [vouchers]);

    const filteredVouchers = useMemo(() => {
        const term = search.trim().toLowerCase();

        return vouchers.filter((voucher) => {
            const matchesStatus =
                statusFilter === "all" ||
                String(voucher.status || "").toLowerCase() === statusFilter;

            if (!matchesStatus) return false;
            if (!term) return true;

            return [
                voucher.code,
                voucher.buyer_name,
                voucher.buyer_email,
                voucher.recipient_email,
                voucher.price?.description,
            ].some((field) =>
                String(field || "")
                    .toLowerCase()
                    .includes(term),
            );
        });
    }, [vouchers, search, statusFilter]);

    const hasActiveFilters = search.trim() !== "" || statusFilter !== "all";

    const clearFilters = useCallback(() => {
        setSearch("");
        setStatusFilter("all");
    }, []);

    const columns = useMemo(
        () => [
            {
                Header: "ID",
                accessor: (row, i) => i + 1,
                id: "rowIndex",
                width: 60,
            },
            {
                Header: "Code / Package",
                accessor: "code",
                Cell: ({ row: { original } }) => (
                    <div>
                        <div className="flex items-center gap-1">
                            <p className="font-mono font-semibold text-gray-900">
                                {original.code}
                            </p>
                            <button
                                onClick={() => copyCode(original.code)}
                                title="Copy voucher code"
                                className="rounded p-1 text-indigo-600 hover:bg-indigo-50"
                            >
                                {copiedCode === original.code ? <FiCheck /> : <FiClipboard />}
                            </button>
                        </div>
                        <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                            {original.price?.description || "Package unavailable"}
                        </p>
                    </div>
                ),
            },
            {
                Header: "Recipient",
                accessor: "recipient_email",
                Cell: ({ row: { original } }) => (
                    <div>
                        <p className="font-medium text-gray-800">
                            {original.recipient_email || original.buyer_email}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            Buyer: {original.buyer_name}
                        </p>
                    </div>
                ),
            },
            {
                Header: "Balance",
                accessor: "balance",
                Cell: ({ row: { original } }) => (
                    <div>
                        <p className="font-semibold text-gray-800">{money(original.balance)}</p>
                        <p className="text-xs text-gray-500">of {money(original.amount)}</p>
                    </div>
                ),
            },
            {
                Header: "Expires",
                accessor: "expires_at",
                Cell: ({ value }) => (
                    <span className="text-gray-600">{formatDate(value)}</span>
                ),
            },
            {
                Header: "Status",
                accessor: "status",
                Cell: ({ value }) => (
                    <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle(value)}`}
                    >
                        {value}
                    </span>
                ),
            },
            {
                Header: "Action",
                id: "action",
                disableSortBy: true,
                Cell: ({ row: { original } }) => (
                    <div className="flex items-center gap-1">
                        <ActionButton
                            onClick={() => setDetailsVoucher(original)}
                            title="View voucher details"
                            className="text-slate-700 hover:bg-slate-100"
                        >
                            <FiEye />
                        </ActionButton>
                        <ActionButton
                            onClick={() => setEditingVoucher(original)}
                            title="Edit voucher"
                            className="text-indigo-600 hover:bg-indigo-50"
                        >
                            <FiEdit />
                        </ActionButton>
                        <ActionButton
                            onClick={() => deleteVoucher(original)}
                            title="Delete voucher"
                            className="text-red-600 hover:bg-red-50"
                        >
                            <FiTrash2 />
                        </ActionButton>
                    </div>
                ),
            },
        ],
        [copiedCode, copyCode, deleteVoucher],
    );

    return (
        <Wrapper>
            {showAddForm && (
                <FormModal
                    title="Add Voucher"
                    onClose={closeAdd}
                >
                    <AddVoucherForm
                        onClose={closeAdd}
                        setReloadTrigger={setReloadTrigger}
                        packageOptions={packageOptions}
                    />
                </FormModal>
            )}

            {editingVoucher && (
                <FormModal
                    title="Edit Voucher"
                    onClose={closeEdit}
                >
                    <EditVoucherForm
                        editingVoucher={editingVoucher}
                        onClose={closeEdit}
                        setReloadTrigger={setReloadTrigger}
                    />
                </FormModal>
            )}

            {detailsVoucher && (
                <VoucherPopup
                    voucher={detailsVoucher}
                    copied={copiedCode === detailsVoucher.code}
                    onCopy={copyCode}
                    onEdit={openEditFromDetails}
                    onClose={closeDetails}
                />
            )}

            <section className="px-2 py-6 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <h1 className="mt-3 text-3xl font-bold text-gray-900">Gift Vouchers</h1>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
                    >
                        <FiPlus /> Add Voucher
                    </button>
                </div>

                {!loading && vouchers.length > 0 && (
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by code, buyer, email or package..."
                                className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    title="Clear search"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                >
                                    <FiX />
                                </button>
                            )}
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-48"
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label} ({statusCounts[option.value] || 0})
                                </option>
                            ))}
                        </select>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex items-center justify-center gap-1 rounded-full px-4 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                            >
                                <FiX /> Clear
                            </button>
                        )}
                    </div>
                )}

                {!loading && vouchers.length > 0 && hasActiveFilters && (
                    <p className="mb-4 text-sm text-gray-500">
                        Showing {filteredVouchers.length} of {vouchers.length} vouchers
                    </p>
                )}

                {error && (
                    <div className="mb-5 rounded-lg border border-red-300 bg-red-100 px-4 py-3 text-red-700">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="py-16 text-center text-gray-500">Loading vouchers...</div>
                ) : vouchers.length === 0 ? (
                    <div className="rounded-xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-200">
                        <FiGift className="mx-auto mb-3 text-4xl text-gray-300" />
                        <p className="font-medium text-gray-700">No vouchers found.</p>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="mt-4 text-sm font-semibold text-indigo-600"
                        >
                            Create the first voucher
                        </button>
                    </div>
                ) : filteredVouchers.length === 0 ? (
                    <div className="rounded-xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-200">
                        <FiSearch className="mx-auto mb-3 text-4xl text-gray-300" />
                        <p className="font-medium text-gray-700">
                            No vouchers match your filters.
                        </p>
                        <button
                            onClick={clearFilters}
                            className="mt-4 text-sm font-semibold text-indigo-600"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <MyTable columns={columns} data={filteredVouchers} />
                )}
            </section>
        </Wrapper>
    );
};

export default Voucher;


// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import {
//     FiCalendar,
//     FiCheck,
//     FiClipboard,
//     FiEdit,
//     FiEye,
//     FiGift,
//     FiMail,
//     FiMessageSquare,
//     FiPackage,
//     FiPlus,
//     FiTrash2,
//     FiUser,
//     FiX,
// } from "react-icons/fi";
// import Wrapper from "@/AdminWrapper/Wrapper";
// import MyTable from "@/MyTable/MyTable";
// import AddVoucherForm from "@/AddFormComponent/AddVoucherForm";
// import EditVoucherForm from "@/EditFormComponents/EditVoucherForm";

// const money = (amount) =>
//     new Intl.NumberFormat("en-AU", {
//         style: "currency",
//         currency: "AUD",
//     }).format(Number(amount || 0));
// const formatDate = (value) =>
//     value
//         ? new Intl.DateTimeFormat("en-AU", { dateStyle: "medium" }).format(
//               new Date(value),
//           )
//         : "—";
// const statusStyle = (status) =>
//     ({
//         active: "bg-emerald-100 text-emerald-800",
//         used: "bg-gray-200 text-gray-700",
//         expired: "bg-amber-100 text-amber-800",
//         cancelled: "bg-red-100 text-red-800",
//     })[status] || "bg-gray-100 text-gray-700";

// const Voucher = () => {
//     const [vouchers, setVouchers] = useState([]);
//     const [packageOptions, setPackageOptions] = useState([]);
//     const [reloadTrigger, setReloadTrigger] = useState(false);
//     const [editingVoucher, setEditingVoucher] = useState(null);
//     const [showAddForm, setShowAddForm] = useState(false);
//     const [detailsVoucher, setDetailsVoucher] = useState(null);
//     const [copiedCode, setCopiedCode] = useState("");
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//     useEffect(() => {
//         const fetchVouchers = async () => {
//             try {
//                 setLoading(true);
//                 setError("");
//                 const response = await axios.get(route("ourvoucher.index"));
//                 setVouchers(response.data.vouchers || []);
//                 setPackageOptions(response.data.packageOptions || []);
//             } catch (fetchError) {
//                 console.error("Error fetching vouchers", fetchError);
//                 setError("Failed to load vouchers.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchVouchers();
//     }, [reloadTrigger]);

//     const copyCode = async (code) => {
//         try {
//             if (navigator.clipboard?.writeText) {
//                 await navigator.clipboard.writeText(code);
//             } else {
//                 const input = document.createElement("textarea");
//                 input.value = code;
//                 input.style.position = "fixed";
//                 input.style.opacity = "0";
//                 document.body.appendChild(input);
//                 input.select();
//                 document.execCommand("copy");
//                 input.remove();
//             }
//             setCopiedCode(code);
//             window.setTimeout(() => setCopiedCode(""), 2000);
//         } catch (copyError) {
//             console.error("Unable to copy voucher code", copyError);
//         }
//     };

//     const deleteVoucher = async (voucher) => {
//         if (!window.confirm(`Delete voucher ${voucher.code}? This cannot be undone.`)) {
//             return;
//         }

//         try {
//             await axios.delete(route("ourvoucher.destroy", { voucher: voucher.id }));
//             setVouchers((current) => current.filter((item) => item.id !== voucher.id));
//             if (editingVoucher?.id === voucher.id) closeEdit();
//             if (detailsVoucher?.id === voucher.id) setDetailsVoucher(null);
//         } catch (deleteError) {
//             console.error("Error deleting voucher", deleteError);
//             setError(deleteError.response?.data?.message || "Unable to delete voucher. Please try again.");
//         }
//     };

//     const columns = useMemo(
//         () => [
//             {
//                 Header: "ID",
//                 accessor: (row, i) => i + 1,
//                 id: "rowIndex",
//                 width: 60,
//             },
//             {
//                 Header: "Code / Package",
//                 accessor: "code",
//                 Cell: ({ row }) => (
//                     <div>
//                         <div className="flex items-center gap-1">
//                             <p className="font-mono font-semibold text-gray-900">
//                                 {row.original.code}
//                             </p>
//                             <button
//                                 onClick={() => copyCode(row.original.code)}
//                                 title="Copy voucher code"
//                                 className="rounded p-1 text-indigo-600 hover:bg-indigo-50"
//                             >
//                                 {copiedCode === row.original.code ? (
//                                     <FiCheck />
//                                 ) : (
//                                     <FiClipboard />
//                                 )}
//                             </button>
//                         </div>
//                         <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
//                             {row.original.price?.description ||
//                                 "Package unavailable"}
//                         </p>
//                     </div>
//                 ),
//             },
//             {
//                 Header: "Recipient",
//                 accessor: "recipient_email",
//                 Cell: ({ row }) => (
//                     <div>
//                         <p className="font-medium text-gray-800">
//                             {row.original.recipient_email ||
//                                 row.original.buyer_email}
//                         </p>
//                         <p className="mt-1 text-xs text-gray-500">
//                             Buyer: {row.original.buyer_name}
//                         </p>
//                     </div>
//                 ),
//             },
//             {
//                 Header: "Balance",
//                 accessor: "balance",
//                 Cell: ({ row }) => (
//                     <div>
//                         <p className="font-semibold text-gray-800">
//                             {money(row.original.balance)}
//                         </p>
//                         <p className="text-xs text-gray-500">
//                             of {money(row.original.amount)}
//                         </p>
//                     </div>
//                 ),
//             },
//             {
//                 Header: "Expires",
//                 accessor: "expires_at",
//                 Cell: ({ value }) => (
//                     <span className="text-gray-600">{formatDate(value)}</span>
//                 ),
//             },
//             {
//                 Header: "Status",
//                 accessor: "status",
//                 Cell: ({ value }) => (
//                     <span
//                         className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(value)}`}
//                     >
//                         {value}
//                     </span>
//                 ),
//             },
//             {
//                 Header: "Action",
//                 id: "action",
//                 disableSortBy: true,
//                 Cell: ({ row }) => (
//                     <div className="flex items-center gap-1">
//                         <button
//                             onClick={() => setDetailsVoucher(row.original)}
//                             title="View voucher details"
//                             className="inline-flex items-center gap-1 rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
//                         >
//                             <FiEye /> <span className="sr-only">View</span>
//                         </button>
//                         <button
//                             onClick={() => setEditingVoucher(row.original)}
//                             title="Edit voucher"
//                             className="inline-flex items-center gap-1 rounded-lg px-3 py-2 font-medium text-indigo-600 hover:bg-indigo-50"
//                         >
//                             <FiEdit /> <span className="sr-only">Edit</span>
//                         </button>
//                         <button
//                             onClick={() => deleteVoucher(row.original)}
//                             title="Delete voucher"
//                             className="inline-flex items-center gap-1 rounded-lg px-3 py-2 font-medium text-red-600 hover:bg-red-50"
//                         >
//                             <FiTrash2 /> <span className="sr-only">Delete</span>
//                         </button>
//                     </div>
//                 ),
//             },
//         ],
//         [copiedCode, detailsVoucher, editingVoucher],
//     );

//     const closeAdd = () => setShowAddForm(false);
//     const closeEdit = () => setEditingVoucher(null);

//     return (
//         <Wrapper>
//             {showAddForm && (
//                 <FormModal
//                     title="Add Voucher"
//                     subtitle="Create an active voucher without payment. It expires one year after creation."
//                     icon={<FiPlus />}
//                     onClose={closeAdd}
//                 >
//                     <AddVoucherForm
//                         onClose={closeAdd}
//                         setReloadTrigger={setReloadTrigger}
//                         packageOptions={packageOptions}
//                     />
//                 </FormModal>
//             )}
//             {editingVoucher && (
//                 <FormModal
//                     title="Edit Voucher"
//                     subtitle={`Update voucher ${editingVoucher.code}`}
//                     icon={<FiEdit />}
//                     onClose={closeEdit}
//                 >
//                     <EditVoucherForm
//                         editingVoucher={editingVoucher}
//                         onClose={closeEdit}
//                         setReloadTrigger={setReloadTrigger}
//                     />
//                 </FormModal>
//             )}
//             {detailsVoucher && (
//                 <VoucherDetails
//                     voucher={detailsVoucher}
//                     copiedCode={copiedCode}
//                     onCopy={copyCode}
//                     onEdit={() => {
//                         setEditingVoucher(detailsVoucher);
//                         setDetailsVoucher(null);
//                     }}
//                     onClose={() => setDetailsVoucher(null)}
//                 />
//             )}
//             <section className="px-2 py-6 sm:px-6 lg:px-8">
//                 <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
//                     <div>
//                         <h1 className="mt-3 text-3xl font-bold text-gray-900">
//                             Gift Vouchers
//                         </h1>
//                     </div>
//                     <button
//                         onClick={() => setShowAddForm(true)}
//                         className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
//                     >
//                         <FiPlus /> Add Voucher
//                     </button>
//                 </div>
//                 {error && (
//                     <div className="mb-5 rounded-lg border border-red-300 bg-red-100 px-4 py-3 text-red-700">
//                         {error}
//                     </div>
//                 )}
//                 {loading ? (
//                     <div className="py-16 text-center text-gray-500">
//                         Loading vouchers...
//                     </div>
//                 ) : vouchers.length === 0 ? (
//                     <div className="rounded-xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-200">
//                         <FiGift className="mx-auto mb-3 text-4xl text-gray-300" />
//                         <p className="font-medium text-gray-700">
//                             No vouchers found.
//                         </p>
//                         <button
//                             onClick={() => setShowAddForm(true)}
//                             className="mt-4 text-sm font-semibold text-indigo-600"
//                         >
//                             Create the first voucher
//                         </button>
//                     </div>
//                 ) : (
//                     <MyTable columns={columns} data={vouchers} />
//                 )}
//             </section>
//         </Wrapper>
//     );
// };

// /* ---------- Modal shell ---------- */

// const FormModal = ({
//     title,
//     subtitle,
//     icon,
//     onClose,
//     footer,
//     maxWidth = "max-w-2xl",
//     children,
// }) => {
//     useEffect(() => {
//         const onKeyDown = (e) => e.key === "Escape" && onClose();
//         const previousOverflow = document.body.style.overflow;
//         document.body.style.overflow = "hidden";
//         document.addEventListener("keydown", onKeyDown);
//         return () => {
//             document.body.style.overflow = previousOverflow;
//             document.removeEventListener("keydown", onKeyDown);
//         };
//     }, [onClose]);

//     return (
//         <div
//             className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm sm:items-center sm:p-6"
//             onMouseDown={(e) => e.target === e.currentTarget && onClose()}
//             role="dialog"
//             aria-modal="true"
//             aria-label={title}
//         >
//             <div
//                 className={`flex max-h-[92vh] w-full ${maxWidth} flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl ring-1 ring-black/5 sm:max-h-[90vh] sm:rounded-2xl`}
//             >
//                 {/* Header */}
//                 <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white px-5 py-4 sm:px-6">
//                     <div className="flex min-w-0 items-center gap-3">
//                         {icon && (
//                             <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-lg text-white shadow-sm">
//                                 {icon}
//                             </span>
//                         )}
//                         <div className="min-w-0">
//                             <h2 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
//                                 {title}
//                             </h2>
//                             {subtitle && (
//                                 <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
//                                     {subtitle}
//                                 </p>
//                             )}
//                         </div>
//                     </div>
//                     <button
//                         onClick={onClose}
//                         aria-label="Close"
//                         className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
//                     >
//                         <FiX />
//                     </button>
//                 </div>

//                 {/* Body */}
//                 <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
//                     {children}
//                 </div>

//                 {/* Footer (optional) */}
//                 {footer && (
//                     <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
//                         {footer}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// /* ---------- Details modal ---------- */

// const VoucherDetails = ({ voucher, copiedCode, onCopy, onEdit, onClose }) => {
//     const amount = Number(voucher.amount || 0);
//     const balance = Number(voucher.balance || 0);
//     const percentLeft =
//         amount > 0 ? Math.min(100, Math.max(0, (balance / amount) * 100)) : 0;
//     const copied = copiedCode === voucher.code;

//     return (
//         <FormModal
//             title="Voucher Details"
//             subtitle={voucher.price?.description || "Package unavailable"}
//             icon={<FiGift />}
//             onClose={onClose}
//             maxWidth="max-w-xl"
//             footer={
//                 <>
//                     <button
//                         onClick={onClose}
//                         className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
//                     >
//                         Close
//                     </button>
//                     <button
//                         onClick={onEdit}
//                         className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
//                     >
//                         <FiEdit /> Edit Voucher
//                     </button>
//                 </>
//             }
//         >
//             <div className="space-y-5">
//                 {/* Code card */}
//                 <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 text-white shadow-md">
//                     <div className="flex items-center justify-between gap-3">
//                         <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200">
//                             Voucher code
//                         </p>
//                         <span
//                             className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle(voucher.status)}`}
//                         >
//                             {voucher.status}
//                         </span>
//                     </div>
//                     <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
//                         <code className="break-all font-mono text-xl font-bold tracking-widest sm:text-2xl">
//                             {voucher.code}
//                         </code>
//                         <button
//                             onClick={() => onCopy(voucher.code)}
//                             className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/25"
//                         >
//                             {copied ? <FiCheck /> : <FiClipboard />}
//                             {copied ? "Copied" : "Copy"}
//                         </button>
//                     </div>
//                 </div>

//                 {/* Balance */}
//                 <div className="rounded-xl border border-gray-200 p-4">
//                     <div className="grid grid-cols-2 gap-4">
//                         <div>
//                             <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
//                                 Remaining balance
//                             </p>
//                             <p className="mt-1 text-2xl font-bold text-gray-900">
//                                 {money(balance)}
//                             </p>
//                         </div>
//                         <div className="text-right">
//                             <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
//                                 Original value
//                             </p>
//                             <p className="mt-1 text-2xl font-bold text-gray-400">
//                                 {money(amount)}
//                             </p>
//                         </div>
//                     </div>
//                     <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
//                         <div
//                             className="h-full rounded-full bg-emerald-500 transition-all"
//                             style={{ width: `${percentLeft}%` }}
//                         />
//                     </div>
//                     <p className="mt-2 text-xs text-gray-500">
//                         {Math.round(percentLeft)}% of the voucher remaining
//                     </p>
//                 </div>

//                 {/* Info grid */}
//                 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//                     <Detail
//                         icon={<FiPackage />}
//                         label="Package"
//                         value={voucher.price?.description || "Package unavailable"}
//                         className="sm:col-span-2"
//                     />
//                     <Detail
//                         icon={<FiUser />}
//                         label="Buyer"
//                         value={voucher.buyer_name || "—"}
//                         sub={voucher.buyer_email}
//                     />
//                     <Detail
//                         icon={<FiMail />}
//                         label="Recipient"
//                         value={voucher.recipient_email || voucher.buyer_email || "—"}
//                     />
//                     <Detail
//                         icon={<FiCalendar />}
//                         label="Created"
//                         value={formatDate(voucher.created_at)}
//                     />
//                     <Detail
//                         icon={<FiCalendar />}
//                         label="Expires"
//                         value={formatDate(voucher.expires_at)}
//                     />
//                     {voucher.message && (
//                         <Detail
//                             icon={<FiMessageSquare />}
//                             label="Message"
//                             value={voucher.message}
//                             className="sm:col-span-2"
//                         />
//                     )}
//                 </div>
//             </div>
//         </FormModal>
//     );
// };

// const Detail = ({ icon, label, value, sub, className = "" }) => (
//     <div
//         className={`flex items-start gap-3 rounded-xl bg-gray-50 p-3.5 ${className}`}
//     >
//         {icon && (
//             <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200">
//                 {icon}
//             </span>
//         )}
//         <div className="min-w-0">
//             <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
//                 {label}
//             </p>
//             <p className="mt-0.5 whitespace-pre-wrap break-words text-sm font-medium text-gray-900">
//                 {value}
//             </p>
//             {sub && (
//                 <p className="mt-0.5 break-all text-xs text-gray-500">{sub}</p>
//             )}
//         </div>
//     </div>
// );

// export default Voucher;
