import React, { useState, useEffect } from "react";
import axios from "axios";
import AddTestimonialForm from "@/AddFormComponent/AddTestimonialForm";
import { Link } from "@inertiajs/react";
import { FiEdit, FiTrash2, FiX, FiPlus } from "react-icons/fi";
import EditTestimonialForm from "@/EditFormComponents/EditTestimonialForm";
import { ChevronLeft } from "lucide-react";
import Wrapper from "@/AdminWrapper/Wrapper";

const Testimonial = () => {
    const [allTestimonials, setAllTestimonials] = useState([]);
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const imgurl = import.meta.env.VITE_IMAGE_PATH;

    // Use Effect
    useEffect(() => {
        const fetchReview = async () => {
            try {
                setLoading(true);
                const response = await axios.get(route("testimonials.index"));

                // Handle different response structures
                let testimonialsData = [];

                if (Array.isArray(response.data)) {
                    testimonialsData = response.data;
                } else if (response.data && Array.isArray(response.data.data)) {
                    testimonialsData = response.data.data;
                } else if (response.data && response.data.testimonials) {
                    testimonialsData = response.data.testimonials;
                } else {
                    console.warn(
                        "Unexpected API response structure:",
                        response.data,
                    );
                    testimonialsData = [];
                }

                // setAllTestimonials(testimonialsData);
                const sorted = [...response.data.data].sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at),
                );
                setAllTestimonials(sorted);
                setError(null);
            } catch (error) {
                console.error("Fetching error ", error);
                setError("Failed to load testimonials");
                setAllTestimonials([]);
            } finally {
                setLoading(false);
            }
        };

        fetchReview();
    }, [reloadTrigger]);

    // handleDelete
    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this testimonial?")) {
            return;
        }

        try {
            await axios.delete(route("testimonials.destroy", { id: id }));
            setReloadTrigger((prev) => !prev);
        } catch (error) {
            console.log(error);
            setError("Failed to delete testimonial");
        }
    };

    // handleEdit
    const handleEdit = (testimonial) => {
        setEditingTestimonial(testimonial);
        setShowForm(true);
    };

    // Handle add new testimonial
    const handleAddNew = () => {
        setShowAddForm(true);
    };

    // Handle Update after the edit
    const handleUpdate = async (formData, id) => {
        try {
            formData.append("_method", "PUT");
            const response = await axios.post(
                route("testimonials.update", { id }),
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );
            setReloadTrigger((prev) => !prev);
            setShowForm(false);
            setEditingTestimonial(null);
            return response.data;
        } catch (error) {
            console.log("Error updating testimonial", error);
            setError("Failed to update testimonial");
            throw error;
        }
    };

    // Handle Create Testimonial
    const handleCreate = async (formData) => {
        try {
            await axios.post(route("testimonials.store"), formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setReloadTrigger((prev) => !prev);
            setShowAddForm(false);
        } catch (error) {
            console.log("Error creating testimonial", error);
            setError("Failed to create testimonial");
            throw error;
        }
    };

    // Handle close forms
    const handleCloseAddForm = () => {
        setShowAddForm(false);
    };

    const handleCloseEditForm = () => {
        setShowForm(false);
        setEditingTestimonial(null);
    };

    // Safe data extraction helper functions
    const getTestimonialContent = (testimonial) => {
        return (
            testimonial.content || testimonial.comment || "No content available"
        );
    };

    const getAuthorName = (testimonial) => {
        return testimonial.name || testimonial.author_name || "Anonymous";
    };

    const getAuthorRole = (testimonial) => {
        return testimonial.role || testimonial.author_role || "Student";
    };

    const getAuthorImage = (testimonial) => {
        if (testimonial.avatar) {
            return `${imgurl}/${testimonial.avatar}`;
        }

        if (testimonial.author_image) {
            return `${imgurl}/${testimonial.author_image}`;
        }

        return "images/blog.png";
    };

    const getRating = (testimonial) => {
        return testimonial.rating || 5;
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
            {/* Add Form Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg  lg:text-2xl font-bold">
                                    Add New Testimonial
                                </h2>
                                <button
                                    onClick={handleCloseAddForm}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    <FiX />
                                </button>
                            </div>
                            <AddTestimonialForm
                                onClose={handleCloseAddForm}
                                onCreate={handleCreate}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Form Modal */}
            {showForm && editingTestimonial && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Edit Testimonial
                                </h2>
                                <button
                                    onClick={handleCloseEditForm}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg
                                        className="w-6 h-6"
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
                            <EditTestimonialForm
                                onClose={handleCloseEditForm}
                                editingTestimonial={editingTestimonial}
                                onUpdate={handleUpdate}
                            />
                        </div>
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
                            Testimonial
                        </Link>
                        <p className="text-xl mb-6">
                            Explore our collection of testimonials
                        </p>

                        <button
                            onClick={handleAddNew}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
                        >
                            <FiPlus className="mr-2" />
                            Add New Testimonial
                        </button>
                    </div>
                </div>
            </section> */}

            <section className="relative py-12 lg:py-2  overflow-hidden">
                {/* <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-20 left-10 w-40 h-40 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl"></div>
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl"></div>
                </div> */}

                <div className="px-2 sm:px-6 lg:px-8 py-6 lg:py-8">
                    {/* <Link
                        href={"/dashboard"}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ChevronLeft size={20} />
                        <span className="font-medium">Back to Dashboard</span>
                    </Link>

                    <div className="mb-8">
                        <button
                            onClick={handleAddNew}
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
                            <span className="font-medium">
                                Back to Dashboard
                            </span>
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
                                onClick={handleAddNew}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:bg-indigo-700 transition-colors flex items-center"
                            >
                                <FiPlus className="mr-2" />
                                Add Testimonial
                            </button>
                        </div>
                    </div>

                    {/* Section Header with Add Button */}
                    <div className="text-center mb-16">
                        <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full mb-4">
                            Success Stories
                        </span>
                        <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                            Voices of{" "}
                            <span className="text-blue-600">Confidence</span>
                        </h2>
                        <div className="mt-6 max-w-2xl mx-auto">
                            <p className="text-lg text-gray-700">
                                Don't just take our word for it. Here's what our
                                students have to say about their driving journey
                                with us.
                            </p>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
                            {error}
                            <button
                                onClick={() => setError(null)}
                                className="ml-4 text-red-800 hover:text-red-900 font-bold"
                            >
                                <FiX />
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-gray-600">
                                Loading testimonials...
                            </p>
                        </div>
                    )}

                    {/* Testimonial Grid */}
                    {!loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {Array.isArray(allTestimonials) &&
                            allTestimonials.length > 0
                                ? allTestimonials.map((testimonial) => (
                                      <div
                                          key={testimonial.id}
                                          className="relative group"
                                      >
                                          {/* Admin Actions */}
                                          <div className="absolute top-4 right-4 z-20 lg:opacity-0 lg:group-hover:opacity-100  lg:transition-opacity">
                                              <button
                                                  onClick={() =>
                                                      handleEdit(testimonial)
                                                  }
                                                  className="bg-blue-600 text-white p-2 rounded-lg mr-2 hover:bg-blue-700"
                                              >
                                                  <FiEdit />
                                              </button>
                                              <button
                                                  onClick={() =>
                                                      handleDelete(
                                                          testimonial.id,
                                                      )
                                                  }
                                                  className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
                                              >
                                                  <FiTrash2 />
                                              </button>
                                          </div>

                                          {/* Card */}
                                          <div className="h-full bg-white p-8 rounded-xl shadow-sm border border-gray-100 group-hover:border-blue-200 transition-all duration-300 transform group-hover:-translate-y-2">
                                              {/* Quote icon */}
                                              <div className="absolute top-6 right-6 text-blue-100 text-5xl font-serif">
                                                  "
                                              </div>

                                              {/* Rating Stars */}
                                              <div className="flex mb-4">
                                                  {[
                                                      ...Array(
                                                          getRating(
                                                              testimonial,
                                                          ),
                                                      ),
                                                  ].map((_, i) => (
                                                      <svg
                                                          key={i}
                                                          className="w-5 h-5 text-yellow-400 fill-current"
                                                          viewBox="0 0 20 20"
                                                          xmlns="http://www.w3.org/2000/svg"
                                                      >
                                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                      </svg>
                                                  ))}
                                              </div>

                                              {/* Testimonial Content */}
                                              {/* <blockquote className="text-gray-700 mb-6 leading-relaxed relative z-10 line-clamp-4">
                                                  {getTestimonialContent(
                                                      testimonial,
                                                  )}
                                              </blockquote> */}

                                              <div className="h-[96px] overflow-y-auto mb-6 pr-1 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
                                                  <blockquote className="text-gray-700 leading-relaxed">
                                                      {getTestimonialContent(
                                                          testimonial,
                                                      )}
                                                  </blockquote>
                                              </div>

                                              {/* Author Info */}
                                              <div className="flex items-center mt-8 pt-6 border-t border-gray-100">
                                                  <div className="relative">
                                                      <img
                                                          src={getAuthorImage(
                                                              testimonial,
                                                          )}
                                                          alt={getAuthorName(
                                                              testimonial,
                                                          )}
                                                          className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                                                      />
                                                      <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                                                          <svg
                                                              className="w-3 h-3 text-white"
                                                              fill="currentColor"
                                                              viewBox="0 0 20 20"
                                                              xmlns="http://www.w3.org/2000/svg"
                                                          >
                                                              <path
                                                                  fillRule="evenodd"
                                                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                  clipRule="evenodd"
                                                              />
                                                          </svg>
                                                      </div>
                                                  </div>
                                                  <div className="ml-4">
                                                      <p className="font-semibold text-gray-900">
                                                          {getAuthorName(
                                                              testimonial,
                                                          )}
                                                      </p>
                                                      {/* <p className="text-sm text-blue-600 font-medium">
                                                          {getAuthorRole(
                                                              testimonial
                                                          )}
                                                      </p> */}
                                                      {testimonial.location && (
                                                          <p className="text-xs text-gray-500">
                                                              {
                                                                  testimonial.location
                                                              }
                                                          </p>
                                                      )}
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  ))
                                : !loading && (
                                      <div className="col-span-full text-center py-12">
                                          <p className="text-gray-500 text-lg">
                                              No testimonials found.
                                          </p>
                                      </div>
                                  )}
                        </div>
                    )}
                </div>
            </section>
        </Wrapper>
    );
};

export default Testimonial;
