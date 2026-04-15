import React, { useMemo, useState, useEffect } from "react";
import { Edit, SquarePen, Trash, Trash2 } from "lucide-react";
import { Link } from "@inertiajs/react";
import axios from "axios";
import AddUserForm from "@/AddFormComponent/AddUserForm";
import EditUserForm from "@/EditFormComponents/EditUserForm";
import { FiPlus } from "react-icons/fi";
import Wrapper from "@/AdminWrapper/Wrapper";
import MyTable from "@/MyTable/MyTable";

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
                // setAllUser(response.data.data || response.data.users || []);
                const data = response.data.data || response.data.users || [];
                setAllUser([...data].sort((a, b) => b.id - a.id));
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
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            aria-label="Edit user"
                        >
                            <Edit size={18} />
                        </button>
                        <button
                            onClick={() => handleDelete(row.original.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            aria-label="Delete user"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ),
            },
        ],
        [],
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

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold">
                        User Management
                    </h1>
                    <button
                        onClick={handleAddNew}
                        className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-full font-medium hover:bg-indigo-700 transition-colors w-full sm:w-auto"
                    >
                        <FiPlus className="mr-2 text-sm" />
                        <span className="text-sm sm:text-base">
                            Add New User
                        </span>
                    </button>
                </div>

                {/* Add Form Modal */}
                {showAddForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <div className="p-4 sm:p-6">
                                <div className="flex justify-between items-center mb-4 sm:mb-6">
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                        Add New User
                                    </h2>
                                    <button
                                        onClick={handleCancelAdd}
                                        className="text-gray-400 hover:text-gray-600"
                                        aria-label="Close"
                                    >
                                        <svg
                                            className="w-5 h-5 sm:w-6 sm:h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <AddUserForm
                                    onSuccess={handleFormSuccess}
                                    onClose={handleCancelAdd}
                                />
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
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                        Edit User
                                    </h2>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="text-gray-400 hover:text-gray-600"
                                        aria-label="Close"
                                    >
                                        <svg
                                            className="w-5 h-5 sm:w-6 sm:h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
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

                {/* Users Table */}
                {loading ? (
                    <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <p className="mt-2 text-gray-600">Loading users...</p>
                    </div>
                ) : allUser.length === 0 ? (
                    <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-8 text-center">
                        <p className="text-gray-600">No users found.</p>
                    </div>
                ) : (
                    <MyTable columns={columns} data={allUser} />
                )}
            </div>
        </Wrapper>
    );
};

export default UserManagement;