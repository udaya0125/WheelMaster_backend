import React, { useEffect, useState } from "react";
import axios from "axios";
import EditPriceForm from "@/EditFormComponents/EditPriceForm";
import AddPriceForm from "@/AddFormComponent/AddPriceForm";
import { FiPlus, FiX } from "react-icons/fi";
import Wrapper from "@/AdminWrapper/Wrapper";

const PricePackages = () => {
    const [allPrice, setAllPrice] = useState([]);
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const [editingPrice, setEditingPrice] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const response = await axios.get(route("ourprice.index"));
                setAllPrice(response.data.data || response.data);
            } catch (error) {
                console.error("fetching error ", error);
            }
        };
        fetchPrice();
    }, [reloadTrigger]);

    // handleDelete
    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this price package?")) {
            return;
        }

        try {
            await axios.delete(route("ourprice.destroy", { id: id }));
            setReloadTrigger((prev) => !prev);
        } catch (error) {
            console.log("Delete error:", error);
            alert("Error deleting price package");
        }
    };

    // handleEdit
    const handleEdit = (price) => {
        setEditingPrice(price);
        setShowEditForm(true);
    };

    const handleCloseEditForm = () => {
        setShowEditForm(false);
        setEditingPrice(null);
    };

    // Added these functions for Add Form
    const handleOpenAddForm = () => {
        setShowAddForm(true);
    };

    const handleCloseAddForm = () => {
        setShowAddForm(false);
    };

     const handleLogout = () => {
        axios
            .post(route("logout"))
            .then((response) => {
                if (response.data.redirect) {
                    window.location.href = response.data.redirect;
                } else {
                    window.location.href = "/login";
                }
            })
            .catch((error) => {
                console.error("logout error:", error);
                console.error("Failed to logout. Please try again.");
            });
    };

    return (
        <Wrapper>
            {/* Add Form Modal - Moved to top */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">
                                    Add New Price Package
                                </h2>
                                <button
                                    onClick={handleCloseAddForm}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    <FiX/>
                                </button>
                            </div>
                            <AddPriceForm
                                onClose={handleCloseAddForm}
                                setReloadTrigger={setReloadTrigger}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Form Modal */}
            {showEditForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">
                                Edit Price Package
                            </h2>
                            <button
                                onClick={handleCloseEditForm}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                               <FiX/>
                            </button>
                        </div>
                        <EditPriceForm
                            editingPrice={editingPrice}
                            onClose={handleCloseEditForm}
                            setReloadTrigger={setReloadTrigger}
                        />
                    </div>
                </div>
            )}

            {/* <section className="relative overflow-hidden h-[60vh]">
                <div className="absolute inset-0 w-full h-full">
                    <img
                        src="/images/bg.webp"
                        alt="Banner background"
                        className="w-full h-full object-cover object-center"
                        loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-transparent" />
                </div>

                <div className="relative container mx-auto h-full flex justify-center items-center px-4">
                    <div className="max-w-2xl text-white text-center">
                        <Link
                            href={"/dashboard"}
                            className="text-4xl md:text-5xl font-bold mb-4 underline"
                        >
                            Price Packages
                        </Link>
                        <p className="text-xl mb-6">
                            Manage your pricing plans and packages
                        </p>

                        <button
                            onClick={handleOpenAddForm}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
                        >
                            <FiPlus className="mr-2" />
                            Add New Price Package
                        </button>
                    </div>
                </div>
            </section> */}

            {/* Price Packages List */}
            <section className=" px-2 sm:px-6 lg:px-8 py-6 lg:py-8">
                {/* <Link href={'/dashboard'} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
                    <ChevronLeft size={20} />
                    <span className="font-medium">Back to Dashboard</span>
                </Link>
                
                <div className="mb-8">
                    <button
                        onClick={handleOpenAddForm}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                        <FiPlus className="mr-2" />
                        Add New Price Package
                    </button>
                </div> */}

                <div className="flex justify-end items-start px-4 mb-12">
                    {/* Back Button */}
                    {/* <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ChevronLeft size={20} />
                        <span className="font-medium">Back to Dashboard</span>
                    </Link> */}

                    {/* Right Section (Logout on top, Add button below) */}
                    <div className="flex flex-col items-end gap-4">
                        {/* Logout Button */}
                        {/* <button
                            onClick={handleLogout}
                            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                        >
                            Log Out
                        </button> */}

                        {/* Add Gallery Button */}
                        <button
                            onClick={handleOpenAddForm}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                        >
                            <FiPlus className="mr-2" />
                            Add New Price Package
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allPrice.map((price) => (
                        <div
                            key={price.id}
                            className="bg-white rounded-lg shadow-lg border border-gray-200 p-6"
                        >
                            {/* Category and Description Header */}
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-gray-800">
                                    {price.description}
                                </h3>
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                    {price.category || "Uncategorized"}
                                </span>
                            </div>

                            {/* Price and Discount */}
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                ${parseFloat(price.price).toFixed(2)}
                            </div>

                            {/* Display discount if available */}
                            {price.discount && (
                                <div className="text-green-600 font-semibold mb-2">
                                    {price.discount}
                                </div>
                            )}

                            <div className="text-gray-600 mb-4">
                                <span className="font-semibold">Duration:</span>{" "}
                                {price.duration}
                            </div>

                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-700 mb-2">
                                    Features:
                                </h4>
                                <div
                                    className="text-gray-600 whitespace-pre-line"
                                    dangerouslySetInnerHTML={{
                                        __html: price.features,
                                    }}
                                />
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEdit(price)}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-white py-2 px-4 rounded transition duration-200"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(price.id)}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition duration-200"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {allPrice.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">
                            No price packages found.
                        </p>
                        <button
                            onClick={handleOpenAddForm}
                            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
                        >
                            <FiPlus className="mr-2" />
                            Add Your First Price Package
                        </button>
                    </div>
                )}
            </section>
        </Wrapper>
    );
};

export default PricePackages;
