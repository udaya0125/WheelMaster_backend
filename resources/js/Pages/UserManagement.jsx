// import React, { useMemo, useState, useEffect } from "react";
// import { useTable, useSortBy, usePagination } from "react-table";
// import axios from "axios";
// import {
//     ChevronUp,
//     ChevronDown,
//     ChevronLeft,
//     ChevronRight,
//     SquarePen,
//     Trash,
// } from "lucide-react";
// import { Link } from "@inertiajs/react";
// import AddUserForm from "@/AddFormComponent/AddUserForm";
// import EditUserForm from "@/EditFormComponents/EditUserForm";
// import { FiPlus } from "react-icons/fi";
// import Wrapper from "@/AdminWrapper/Wrapper";

// const UserManagement = () => {
//     const [allUser, setAllUser] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [reloadTrigger, setReloadTrigger] = useState(false);
//     const [showAddForm, setShowAddForm] = useState(false);
//     const [showEditForm, setShowEditForm] = useState(false);
//     const [editingUser, setEditingUser] = useState(null);

//     // Use Effect
//     useEffect(() => {
//         const fetchUser = async () => {
//             try {
//                 setLoading(true);
//                 setError("");
//                 const response = await axios.get(route("ouruser.index"));
//                 setAllUser(response.data.data || response.data.users || []);
//             } catch (error) {
//                 console.error("fetching error ", error);
//                 setError("Failed to fetch users. Please try again.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchUser();
//     }, [reloadTrigger]);

//     const columns = useMemo(
//         () => [
//             {
//                 Header: "S/N",
//                 accessor: (row, i) => i + 1,
//                 id: "sn",
//                 width: 50,
//             },
//             {
//                 Header: "Name",
//                 accessor: "name",
//             },
//             {
//                 Header: "Email",
//                 accessor: "email",
//             },
//             {
//                 Header: "Actions",
//                 id: "actions",
//                 disableSortBy: true,
//                 Cell: ({ row }) => (
//                     <div className="flex space-x-2">
//                         <button
//                             onClick={() => handleEdit(row.original)}
//                             className="text-indigo-600 hover:text-indigo-900"
//                         >
//                             <SquarePen size={20} />
//                         </button>

//                         <button
//                             onClick={() => handleDelete(row.original.id)}
//                             className="text-red-600 hover:text-red-900"
//                         >
//                             <Trash size={20} />
//                         </button>
//                     </div>
//                 ),
//             },
//         ],
//         []
//     );

//     // React Table Setup
//     const {
//         getTableProps,
//         getTableBodyProps,
//         headerGroups,
//         page,
//         prepareRow,
//         canPreviousPage,
//         canNextPage,
//         pageOptions,
//         pageCount,
//         gotoPage,
//         nextPage,
//         previousPage,
//         setPageSize,
//         state: { pageIndex, pageSize },
//     } = useTable(
//         {
//             columns,
//             data: allUser,
//             initialState: { pageIndex: 0, pageSize: 5 },
//         },
//         useSortBy,
//         usePagination
//     );

//     // handleDelete
//     const handleDelete = async (id) => {
//         if (!confirm("Are you sure you want to delete this user?")) {
//             return;
//         }

//         try {
//             await axios.delete(route("ouruser.destroy", { id: id }));
//             setReloadTrigger((prev) => !prev);
//         } catch (error) {
//             console.log(error);
//             alert("Failed to delete user. Please try again.");
//         }
//     };

//     // handleEdit
//     const handleEdit = (user) => {
//         setEditingUser(user);
//         setShowEditForm(true);
//         setShowAddForm(false);
//     };

//     // Handle cancel edit
//     const handleCancelEdit = () => {
//         setEditingUser(null);
//         setShowEditForm(false);
//     };

//     // Handle cancel add
//     const handleCancelAdd = () => {
//         setShowAddForm(false);
//     };

//     // Handle form success
//     const handleFormSuccess = () => {
//         setReloadTrigger((prev) => !prev);
//         setShowAddForm(false);
//         setShowEditForm(false);
//         setEditingUser(null);
//     };

//     // Handle add new user
//     const handleAddNew = () => {
//         setEditingUser(null);
//         setShowAddForm(true);
//         setShowEditForm(false);
//     };

//     const handleLogout = () => {
//         axios
//             .post(route("logout"))
//             .then((response) => {
//                 if (response.data.redirect) {
//                     window.location.href = response.data.redirect;
//                 } else {
//                     window.location.href = "/login";
//                 }
//             })
//             .catch((error) => {
//                 console.error("logout error:", error);
//                 console.error("Failed to logout. Please try again.");
//             });
//     };

//     return (
//         <Wrapper>
//             <div className="p-6">
//                 {/* <Link
//                 href={"/dashboard"}
//                 className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
//             >
//                 <ChevronLeft size={20} />
//                 <span className="font-medium">Back to Dashboard</span>
//             </Link> */}

//                 {error && (
//                     <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//                         {error}
//                     </div>
//                 )}

//                 {/* Add New User Button */}
//                 <div className="mb-6 flex justify-between items-center">
//                     <h1 className="text-2xl font-bold mb-4">User Management</h1>
//                     {/* <button
//                     onClick={handleAddNew}
//                     className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
//                 >
//                     Add New User
//                 </button> */}

//                     <div className="flex flex-col items-end gap-4">
//                         {/* Logout Button */}
//                         {/* <button
//                         onClick={handleLogout}
//                         className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
//                     >
//                         Log Out
//                     </button> */}

//                         {/* Add Gallery Button */}
//                         <button
//                             onClick={handleAddNew}
//                             className="bg-blue-600  text-white px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-lg text-sm sm:text-base font-light md:font-medium  hover:bg-blue-700 transition-colors flex items-center justify-centerw-full sm:w-auto">
//                             <FiPlus className="mr-1 sm:mr-2 text-sm sm:text-base" />
//                             Add New User
//                         </button>
//                     </div>
//                 </div>

//                 {/* Add Form Modal */}
//                 {showAddForm && (
//                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//                         <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
//                             <div className="p-6">
//                                 <div className="flex justify-between items-center mb-6">
//                                     <h2 className="text-xl font-bold text-gray-900">
//                                         Add New User
//                                     </h2>
//                                     <button
//                                         onClick={handleCancelAdd}
//                                         className="text-gray-400 hover:text-gray-600 transition-colors"
//                                     >
//                                         <svg
//                                             className="w-6 h-6"
//                                             fill="none"
//                                             stroke="currentColor"
//                                             viewBox="0 0 24 24"
//                                         >
//                                             <path
//                                                 strokeLinecap="round"
//                                                 strokeLinejoin="round"
//                                                 strokeWidth={2}
//                                                 d="M6 18L18 6M6 6l12 12"
//                                             />
//                                         </svg>
//                                     </button>
//                                 </div>
//                                 <AddUserForm
//                                     onSuccess={handleFormSuccess}
//                                     onClose={handleCancelAdd}
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Edit Form Modal */}
//                 {showEditForm && editingUser && (
//                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//                         <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
//                             <div className="p-6">
//                                 <div className="flex justify-between items-center mb-6">
//                                     <h2 className="text-xl font-bold text-gray-900">
//                                         Edit User
//                                     </h2>
//                                     <button
//                                         onClick={handleCancelEdit}
//                                         className="text-gray-400 hover:text-gray-600 transition-colors"
//                                     >
//                                         <svg
//                                             className="w-6 h-6"
//                                             fill="none"
//                                             stroke="currentColor"
//                                             viewBox="0 0 24 24"
//                                         >
//                                             <path
//                                                 strokeLinecap="round"
//                                                 strokeLinejoin="round"
//                                                 strokeWidth={2}
//                                                 d="M6 18L18 6M6 6l12 12"
//                                             />
//                                         </svg>
//                                     </button>
//                                 </div>
//                                 <EditUserForm
//                                     editingUser={editingUser}
//                                     onSuccess={handleFormSuccess}
//                                     onClose={handleCancelEdit}
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Users Table */}
//                 <div className="bg-white shadow-md rounded-lg overflow-hidden">
//                     {loading ? (
//                         <div className="p-8 text-center">
//                             <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
//                             <p className="mt-2 text-gray-600">
//                                 Loading users...
//                             </p>
//                         </div>
//                     ) : allUser.length === 0 ? (
//                         <div className="p-8 text-center">
//                             <p className="text-gray-600">No users found.</p>
//                         </div>
//                     ) : (
//                         <>
//                             <div className="overflow-x-auto">
//                                 <table
//                                     {...getTableProps()}
//                                     className="min-w-full divide-y divide-gray-200"
//                                 >
//                                     <thead className="bg-gray-50">
//                                         {headerGroups.map((headerGroup) => (
//                                             <tr
//                                                 {...headerGroup.getHeaderGroupProps()}
//                                             >
//                                                 {headerGroup.headers.map(
//                                                     (column) => (
//                                                         <th
//                                                             {...column.getHeaderProps(
//                                                                 column.getSortByToggleProps()
//                                                             )}
//                                                             className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                                                         >
//                                                             <div className="flex items-center">
//                                                                 {column.render(
//                                                                     "Header"
//                                                                 )}
//                                                                 {column.isSorted ? (
//                                                                     column.isSortedDesc ? (
//                                                                         <ChevronDown
//                                                                             size={
//                                                                                 16
//                                                                             }
//                                                                             className="ml-1"
//                                                                         />
//                                                                     ) : (
//                                                                         <ChevronUp
//                                                                             size={
//                                                                                 16
//                                                                             }
//                                                                             className="ml-1"
//                                                                         />
//                                                                     )
//                                                                 ) : (
//                                                                     ""
//                                                                 )}
//                                                             </div>
//                                                         </th>
//                                                     )
//                                                 )}
//                                             </tr>
//                                         ))}
//                                     </thead>

//                                     <tbody
//                                         {...getTableBodyProps()}
//                                         className="bg-white divide-y divide-gray-200"
//                                     >
//                                         {page.map((row) => {
//                                             prepareRow(row);
//                                             return (
//                                                 <tr
//                                                     {...row.getRowProps()}
//                                                     className="hover:bg-gray-50"
//                                                 >
//                                                     {row.cells.map((cell) => (
//                                                         <td
//                                                             {...cell.getCellProps()}
//                                                             className="px-6 py-4 whitespace-nowrap"
//                                                         >
//                                                             {cell.render(
//                                                                 "Cell"
//                                                             )}
//                                                         </td>
//                                                     ))}
//                                                 </tr>
//                                             );
//                                         })}
//                                     </tbody>
//                                 </table>
//                             </div>

//                             {/* Pagination */}
//                             <div className="flex items-center justify-between p-4 bg-gray-50 border-t">
//                                 <div className="flex items-center">
//                                     <span className="text-sm mr-2">Show</span>

//                                     <select
//                                         value={pageSize}
//                                         onChange={(e) =>
//                                             setPageSize(Number(e.target.value))
//                                         }
//                                         className="border rounded px-2 py-1 text-sm"
//                                     >
//                                         {[5, 10, 20].map((size) => (
//                                             <option key={size} value={size}>
//                                                 {size}
//                                             </option>
//                                         ))}
//                                     </select>

//                                     <span className="text-sm ml-2">
//                                         entries
//                                     </span>
//                                 </div>

//                                 <div className="flex items-center space-x-2">
//                                     <button
//                                         onClick={() => gotoPage(0)}
//                                         disabled={!canPreviousPage}
//                                         className={`p-1 rounded ${
//                                             !canPreviousPage
//                                                 ? "opacity-50 cursor-not-allowed"
//                                                 : "hover:bg-gray-200"
//                                         }`}
//                                     >
//                                         <ChevronLeft size={18} />
//                                     </button>

//                                     <button
//                                         onClick={() => previousPage()}
//                                         disabled={!canPreviousPage}
//                                         className={`px-3 py-1 rounded ${
//                                             !canPreviousPage
//                                                 ? "opacity-50 cursor-not-allowed"
//                                                 : "hover:bg-gray-200"
//                                         }`}
//                                     >
//                                         Previous
//                                     </button>

//                                     <span className="text-sm">
//                                         Page <b>{pageIndex + 1}</b> of{" "}
//                                         <b>{pageOptions.length}</b>
//                                     </span>

//                                     <button
//                                         onClick={() => nextPage()}
//                                         disabled={!canNextPage}
//                                         className={`px-3 py-1 rounded ${
//                                             !canNextPage
//                                                 ? "opacity-50 cursor-not-allowed"
//                                                 : "hover:bg-gray-200"
//                                         }`}
//                                     >
//                                         Next
//                                     </button>

//                                     <button
//                                         onClick={() => gotoPage(pageCount - 1)}
//                                         disabled={!canNextPage}
//                                         className={`p-1 rounded ${
//                                             !canNextPage
//                                                 ? "opacity-50 cursor-not-allowed"
//                                                 : "hover:bg-gray-200"
//                                         }`}
//                                     >
//                                         <ChevronRight size={18} />
//                                     </button>
//                                 </div>
//                             </div>
//                         </>
//                     )}
//                 </div>
//             </div>
//         </Wrapper>
//     );
// };

// export default UserManagement;


import React, { useMemo, useState, useEffect } from "react";
import { useTable, useSortBy, usePagination } from "react-table";
import axios from "axios";
import {
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    SquarePen,
    Trash,
} from "lucide-react";
import { Link } from "@inertiajs/react";
import AddUserForm from "@/AddFormComponent/AddUserForm";
import EditUserForm from "@/EditFormComponents/EditUserForm";
import { FiPlus } from "react-icons/fi";
import Wrapper from "@/AdminWrapper/Wrapper";

const UserManagement = () => {
    const [allUser, setAllUser] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await axios.get(route("ouruser.index"));
                setAllUser(response.data.data || response.data.users || []);
            } catch (error) {
                console.error("fetching error ", error);
                setError("Failed to fetch users. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [reloadTrigger]);

    const columns = useMemo(
        () => [
            {
                Header: "S/N",
                accessor: (row, i) => i + 1,
                id: "sn",
                width: 50,
            },
            {
                Header: "Name",
                accessor: "name",
            },
            {
                Header: "Email",
                accessor: "email",
            },
            {
                Header: "Actions",
                id: "actions",
                disableSortBy: true,
                Cell: ({ row }) => (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleEdit(row.original)}
                            className="text-indigo-600 hover:text-indigo-900"
                            aria-label="Edit user"
                        >
                            <SquarePen size={20} />
                        </button>
                        <button
                            onClick={() => handleDelete(row.original.id)}
                            className="text-red-600 hover:text-red-900"
                            aria-label="Delete user"
                        >
                            <Trash size={20} />
                        </button>
                    </div>
                ),
            },
        ],
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        prepareRow,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },
    } = useTable(
        {
            columns,
            data: allUser,
            initialState: { pageIndex: 0, pageSize: 5 },
        },
        useSortBy,
        usePagination
    );

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this user?")) {
            return;
        }

        try {
            await axios.delete(route("ouruser.destroy", { id: id }));
            setReloadTrigger((prev) => !prev);
        } catch (error) {
            console.log(error);
            alert("Failed to delete user. Please try again.");
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setShowEditForm(true);
        setShowAddForm(false);
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setShowEditForm(false);
    };

    const handleCancelAdd = () => {
        setShowAddForm(false);
    };

    const handleFormSuccess = () => {
        setReloadTrigger((prev) => !prev);
        setShowAddForm(false);
        setShowEditForm(false);
        setEditingUser(null);
    };

    const handleAddNew = () => {
        setEditingUser(null);
        setShowAddForm(true);
        setShowEditForm(false);
    };

    return (
        <Wrapper>
            <div className="px-2 sm:px-6 lg:px-8 py-6 lg:py-8">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Header Section - Responsive Flex */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h1 className="text-xl sm:text-2xl font-bold">User Management</h1>
                    <button
                        onClick={handleAddNew}
                        className="flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto"
                    >
                        <FiPlus className="mr-2 text-sm" />
                        <span className="text-sm sm:text-base">Add New User</span>
                    </button>
                </div>

                {/* Add Form Modal */}
                {showAddForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <div className="p-4 sm:p-6">
                                <div className="flex justify-between items-center mb-4 sm:mb-6">
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Add New User</h2>
                                    <button
                                        onClick={handleCancelAdd}
                                        className="text-gray-400 hover:text-gray-600"
                                        aria-label="Close"
                                    >
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <AddUserForm onSuccess={handleFormSuccess} onClose={handleCancelAdd} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Form Modal */}
                {showEditForm && editingUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <div className="p-4 sm:p-6">
                                <div className="flex justify-between items-center mb-4 sm:mb-6">
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Edit User</h2>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="text-gray-400 hover:text-gray-600"
                                        aria-label="Close"
                                    >
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <EditUserForm
                                    editingUser={editingUser}
                                    onSuccess={handleFormSuccess}
                                    onClose={handleCancelEdit}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Table - Fully Responsive */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    {loading ? (
                        <div className="p-6 sm:p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-gray-900"></div>
                            <p className="mt-2 text-sm sm:text-base text-gray-600">Loading users...</p>
                        </div>
                    ) : allUser.length === 0 ? (
                        <div className="p-6 sm:p-8 text-center">
                            <p className="text-sm sm:text-base text-gray-600">No users found.</p>
                        </div>
                    ) : (
                        <>
                            {/* Table Container */}
                            <div className="overflow-x-auto">
                                <table
                                    {...getTableProps()}
                                    className="min-w-full divide-y divide-gray-200"
                                >
                                    <thead className="bg-gray-50">
                                        {headerGroups.map((headerGroup) => (
                                            <tr {...headerGroup.getHeaderGroupProps()}>
                                                {headerGroup.headers.map((column) => (
                                                    <th
                                                        {...column.getHeaderProps(column.getSortByToggleProps())}
                                                        className="px-3 py-3 sm:px-6 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider"
                                                    >
                                                        <div className="flex items-center">
                                                            {column.render("Header")}
                                                            {column.isSorted ? (
                                                                column.isSortedDesc ? (
                                                                    <ChevronDown size={14} className="ml-1" />
                                                                ) : (
                                                                    <ChevronUp size={14} className="ml-1" />
                                                                )
                                                            ) : null}
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
                                        {page.map((row) => {
                                            prepareRow(row);
                                            return (
                                                <tr {...row.getRowProps()} className="hover:bg-gray-50">
                                                    {row.cells.map((cell) => (
                                                        <td
                                                            {...cell.getCellProps()}
                                                            className="px-3 py-4 sm:px-6 whitespace-nowrap text-sm"
                                                        >
                                                            {cell.render("Cell")}
                                                        </td>
                                                    ))}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 bg-gray-50 border-t gap-3">
                                <div className="flex items-center flex-wrap justify-center sm:justify-start gap-2">
                                    <span className="text-xs sm:text-sm">Show</span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => setPageSize(Number(e.target.value))}
                                        className="border rounded px-2 py-1 text-xs sm:text-sm"
                                    >
                                        {[5, 10, 20].map((size) => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="text-xs sm:text-sm">entries</span>
                                </div>

                                <div className="flex items-center space-x-1 sm:space-x-2">
                                    <button
                                        onClick={() => gotoPage(0)}
                                        disabled={!canPreviousPage}
                                        className={`p-1 rounded ${!canPreviousPage ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
                                        aria-label="First page"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={() => previousPage()}
                                        disabled={!canPreviousPage}
                                        className={`px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm rounded ${!canPreviousPage ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
                                    >
                                        Previous
                                    </button>
                                    <span className="text-xs sm:text-sm whitespace-nowrap">
                                        Page <b>{pageIndex + 1}</b> of <b>{pageOptions.length}</b>
                                    </span>
                                    <button
                                        onClick={() => nextPage()}
                                        disabled={!canNextPage}
                                        className={`px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm rounded ${!canNextPage ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
                                    >
                                        Next
                                    </button>
                                    <button
                                        onClick={() => gotoPage(pageCount - 1)}
                                        disabled={!canNextPage}
                                        className={`p-1 rounded ${!canNextPage ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
                                        aria-label="Last page"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Wrapper>
    );
};

export default UserManagement;