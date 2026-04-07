import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import AddBlogForm from "@/AddFormComponent/AddBlogForm";
import EditBlogForm from "@/EditFormComponents/EditBlogForm";
import {
    FiSearch,
    FiArrowRight,
    FiClock,
    FiUser,
    FiCalendar,
    FiBookmark,
    FiEdit,
    FiTrash2,
    FiPlus,
    FiX,
} from "react-icons/fi";
import { ChevronLeft } from "lucide-react";
import Wrapper from "@/AdminWrapper/Wrapper";

const BlogList = () => {
    const [featuredPosts, setFeaturedPosts] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    // const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const imgurl = import.meta.env.VITE_IMAGE_PATH;

    // Fetch blog data from Laravel API
    const fetchBlogData = async () => {
        try {
            setLoading(true);
            const response = await fetch(route("ourblog.index"));

            if (!response.ok) {
                throw new Error("Failed to fetch blog data");
            }

            const result = await response.json();

            if (result.status && result.data) {
                const allPosts = result.data;

                // Transform API data to match your component structure
                const transformedPosts = allPosts.map((post) => ({
                    id: post.id,
                    title: post.title,
                    excerpt: post.short_description,
                    category: post.category,
                    date: new Date(post.created_at).toLocaleDateString(
                        "en-US",
                        {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        }
                    ),
                    readTime: post.duration,
                    image: post.image
                        ? `${imgurl}/${post.image}`
                        : "/images/default-blog.jpg",
                    author: "Instructor Team",
                    // Include all original data for editing
                    originalData: post,
                }));

                // Set featured posts (first 2 as featured, adjust logic as needed)
                setFeaturedPosts(transformedPosts.slice(0, 2));

                // Set recent posts (all posts or adjust logic)
                setRecentPosts(transformedPosts.slice(2));
            }
        } catch (err) {
            setError(err.message);
            console.error("Error fetching blog data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogData();
    }, [reloadTrigger]);

    // Handle edit blog
    const handleEdit = (blog) => {
        setEditingBlog(blog.originalData);
        setShowEditForm(true);
    };

    // Handle delete blog
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this blog post?")) {
            return;
        }
        try {
            const response = await axios.delete(
                route("ourblog.destroy", { id: id })
            );
            console.log(response.data);
            setReloadTrigger((prev) => !prev);
        } catch (error) {
            console.log(error);
        }
    };
    // Handle blog added
    const handleBlogAdded = () => {
        fetchBlogData();
        setShowAddForm(false);
    };

    // Handle blog updated
    const handleBlogUpdated = () => {
        fetchBlogData();
        setShowEditForm(false);
        setEditingBlog(null);
    };

    // Handle form close
    const handleCloseAddForm = () => {
        setShowAddForm(false);
    };

    const handleCloseEditForm = () => {
        setShowEditForm(false);
        setEditingBlog(null);
    };

    // Error state
    if (error) {
        return (
            <Wrapper>
                <div className="bg-gray-50 min-h-screen">
                    <div className="px-2 sm:px-6 lg:px-8 py-6 lg:py-8">
                        <div className="flex justify-end items-start px-4 mb-12">
                            <div className="flex flex-col items-end gap-4">
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="bg-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:bg-indigo-700 transition-colors flex items-center"
                                >
                                    <FiPlus className="mr-2" />
                                    Add Blog
                                </button>
                            </div>
                        </div>

                        <div className="text-center mb-16">
                            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-1 rounded-full mb-4">
                                Featured Content
                            </span>
                            <h2 className="text-3xl font-bold mb-4">
                                Must-Read Driving Guides
                            </h2>
                            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
                        </div>

                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
                            Error loading blog posts: {error}
                            <button
                                onClick={() => window.location.reload()}
                                className="ml-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </Wrapper>
        );
    }

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
            {/* Add Blog Form Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">
                                    Add New Blog Post
                                </h2>
                                <button
                                    onClick={handleCloseAddForm}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    <FiX />
                                </button>
                            </div>
                            <AddBlogForm
                                onClose={handleCloseAddForm}
                                onSuccess={handleBlogAdded}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Blog Form Modal */}
            {showEditForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">
                                    Edit Blog Post
                                </h2>
                                <button
                                    onClick={handleCloseEditForm}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    <FiX />
                                </button>
                            </div>
                            <EditBlogForm
                                blog={editingBlog}
                                onClose={handleCloseEditForm}
                                onSuccess={handleBlogUpdated}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-gray-50 min-h-screen">
                {/* Featured Posts */}
                <section className="px-2 sm:px-6 lg:px-8 py-6 lg:py-8">
                    <div className="flex justify-end items-start px-4 mb-12">
                        <div className="flex flex-col items-end gap-4">
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:bg-indigo-700 transition-colors flex items-center"
                            >
                                <FiPlus className="mr-2" />
                                Add Blog
                            </button>
                        </div>
                    </div>

                    <div className="text-center mb-16">
                        <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-1 rounded-full mb-4">
                            Featured Content
                        </span>
                        <h2 className="text-3xl font-bold mb-4">
                            Must-Read Driving Guides
                        </h2>
                        <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
                    </div>

                    {/* Loading State - Matches Testimonial and Gallery pattern */}
                    {loading && (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            <p className="mt-4 text-gray-600">
                                Loading blog posts...
                            </p>
                        </div>
                    )}

                    {/* Blog Content - Only show when not loading */}
                    {!loading && (
                        <>
                            {/* Featured Posts */}
                            {featuredPosts.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-8">
                                    {featuredPosts.map((post) => (
                                        <div
                                            key={post.id}
                                            className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group relative"
                                        >
                                            {/* Edit/Delete Actions */}
                                            <div className="absolute top-4 right-4 flex space-x-2 z-10">
                                                <button
                                                    onClick={() => handleEdit(post)}
                                                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit size={16} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(post.id)
                                                    }
                                                    className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="relative h-64 overflow-hidden">
                                                <img
                                                    src={post.image}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    onError={(e) => {
                                                        e.target.src =
                                                            "/images/default-blog.jpg";
                                                    }}
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                                                    <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                                        {post.category}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-8">
                                                <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                                                    <span className="flex items-center">
                                                        <FiCalendar className="mr-1.5" />
                                                        {post.date}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <FiUser className="mr-1.5" />
                                                        Admin
                                                    </span>
                                                </div>

                                                <h3 className="text-2xl font-bold mb-4 leading-snug">
                                                    {post.title}
                                                </h3>
                                                <p className="text-gray-600 mb-6">
                                                    {post.excerpt}
                                                </p>

                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-500 flex items-center">
                                                        <FiClock className="mr-1.5" />
                                                        {post.readTime}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg">
                                        No featured posts available.
                                    </p>
                                </div>
                            )}

                            {/* Recent Posts Section */}
                            {recentPosts.length > 0 && (
                                <section className="max-w-6xl mx-auto px-4 pb-20 mt-12">
                                    <div className="text-center mb-16">
                                        <h2 className="text-3xl font-bold mb-4">
                                            Recent Posts
                                        </h2>
                                        <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
                                    </div>

                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {recentPosts.map((post) => (
                                            <div
                                                key={post.id}
                                                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group relative"
                                            >
                                                {/* Edit/Delete Actions */}
                                                <div className="absolute top-4 right-4 flex space-x-2 z-10">
                                                    <button
                                                        onClick={() => handleEdit(post)}
                                                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <FiEdit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(post.id)
                                                        }
                                                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                </div>

                                                <div className="relative h-48 overflow-hidden">
                                                    <img
                                                        src={post.image}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        onError={(e) => {
                                                            e.target.src =
                                                                "/images/default-blog.jpg";
                                                        }}
                                                    />
                                                </div>

                                                <div className="p-6">
                                                    <span className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded mb-3">
                                                        {post.category}
                                                    </span>
                                                    <h3 className="text-lg font-bold mb-2 line-clamp-2">
                                                        {post.title}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                        {post.excerpt}
                                                    </p>
                                                    <div className="flex justify-between items-center text-sm text-gray-500">
                                                        <span>{post.date}</span>
                                                        <span className="flex items-center">
                                                            <FiClock className="mr-1" />
                                                            {post.readTime}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                </section>
            </div>
        </Wrapper>
    );
};

export default BlogList;


// import React, { useState, useEffect } from "react";
// import { Link } from "@inertiajs/react";
// import AddBlogForm from "@/AddFormComponent/AddBlogForm";
// import EditBlogForm from "@/EditFormComponents/EditBlogForm";
// import {
//     FiSearch,
//     FiArrowRight,
//     FiClock,
//     FiUser,
//     FiCalendar,
//     FiBookmark,
//     FiEdit,
//     FiTrash2,
//     FiPlus,
//     FiX,
// } from "react-icons/fi";
// import { ChevronLeft } from "lucide-react";
// import Wrapper from "@/AdminWrapper/Wrapper";

// const BlogList = () => {
//     const [featuredPosts, setFeaturedPosts] = useState([]);
//     const [recentPosts, setRecentPosts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [showAddForm, setShowAddForm] = useState(false);
//     const [showEditForm, setShowEditForm] = useState(false);
//     const [editingBlog, setEditingBlog] = useState(null);
//     // const [deleteConfirm, setDeleteConfirm] = useState(null);
//     const [reloadTrigger, setReloadTrigger] = useState(false);
//     const imgurl = import.meta.env.VITE_IMAGE_PATH;

//     // Fetch blog data from Laravel API
//     const fetchBlogData = async () => {
//         try {
//             setLoading(true);
//             const response = await fetch(route("ourblog.index"));

//             if (!response.ok) {
//                 throw new Error("Failed to fetch blog data");
//             }

//             const result = await response.json();

//             if (result.status && result.data) {
//                 const allPosts = result.data;

//                 // Transform API data to match your component structure
//                 const transformedPosts = allPosts.map((post) => ({
//                     id: post.id,
//                     title: post.title,
//                     excerpt: post.short_description,
//                     category: post.category,
//                     date: new Date(post.created_at).toLocaleDateString(
//                         "en-US",
//                         {
//                             month: "short",
//                             day: "numeric",
//                             year: "numeric",
//                         }
//                     ),
//                     readTime: post.duration,
//                     image: post.image
//                         ? `${imgurl}/${post.image}`
//                         : "/images/default-blog.jpg",
//                     author: "Instructor Team",
//                     // Include all original data for editing
//                     originalData: post,
//                 }));

//                 // Set featured posts (first 2 as featured, adjust logic as needed)
//                 setFeaturedPosts(transformedPosts.slice(0, 2));

//                 // Set recent posts (all posts or adjust logic)
//                 setRecentPosts(transformedPosts.slice(2));
//             }
//         } catch (err) {
//             setError(err.message);
//             console.error("Error fetching blog data:", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchBlogData();
//     }, [reloadTrigger]);

//     // Handle edit blog
//     const handleEdit = (blog) => {
//         setEditingBlog(blog.originalData);
//         setShowEditForm(true);
//     };

//     // Handle delete blog
//     const handleDelete = async (id) => {
//         if (!window.confirm("Are you sure you want to delete this blog post?")) {
//             return;
//         }
//         try {
//             const response = await axios.delete(
//                 route("ourblog.destroy", { id: id })
//             );
//             console.log(response.data);
//             setReloadTrigger((prev) => !prev);
//         } catch (error) {
//             console.log(error);
//         }
//     };
//     // Handle blog added
//     const handleBlogAdded = () => {
//         fetchBlogData();
//         setShowAddForm(false);
//     };

//     // Handle blog updated
//     const handleBlogUpdated = () => {
//         fetchBlogData();
//         setShowEditForm(false);
//         setEditingBlog(null);
//     };

//     // Handle form close
//     const handleCloseAddForm = () => {
//         setShowAddForm(false);
//     };

//     const handleCloseEditForm = () => {
//         setShowEditForm(false);
//         setEditingBlog(null);
//     };

//     // Loading state
//     // if (loading) {
//     //     return (
//     //         <div className="min-h-screen flex items-center justify-center">
//     //             <div className="text-center">
//     //                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//     //                 <p className="mt-4 text-gray-600">Loading blog posts...</p>
//     //             </div>
//     //         </div>
//     //     );
//     // }

//     // Error state
//     if (error) {
//         return (
//             <div className="min-h-screen flex items-center justify-center">
//                 <div className="text-center text-red-600">
//                     <p>Error loading blog posts: {error}</p>
//                     <button
//                         onClick={() => window.location.reload()}
//                         className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//                     >
//                         Retry
//                     </button>
//                 </div>
//             </div>
//         );
//     }

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
//             {/* Add Blog Form Modal */}
//             {showAddForm && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//                     <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//                         <div className="p-6">
//                             <div className="flex justify-between items-center mb-6">
//                                 <h2 className="text-2xl font-bold">
//                                     Add New Blog Post
//                                 </h2>
//                                 <button
//                                     onClick={handleCloseAddForm}
//                                     className="text-gray-500 hover:text-gray-700 text-2xl"
//                                 >
//                                     <FiX />
//                                 </button>
//                             </div>
//                             <AddBlogForm
//                                 onClose={handleCloseAddForm}
//                                 onSuccess={handleBlogAdded}
//                             />
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Edit Blog Form Modal */}
//             {showEditForm && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//                     <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//                         <div className="p-6">
//                             <div className="flex justify-between items-center mb-6">
//                                 <h2 className="text-2xl font-bold">
//                                     Edit Blog Post
//                                 </h2>
//                                 <button
//                                     onClick={handleCloseEditForm}
//                                     className="text-gray-500 hover:text-gray-700 text-2xl"
//                                 >
//                                     <FiX />
//                                 </button>
//                             </div>
//                             <EditBlogForm
//                                 blog={editingBlog}
//                                 onClose={handleCloseEditForm}
//                                 onSuccess={handleBlogUpdated}
//                             />
//                         </div>
//                     </div>
//                 </div>
//             )}

          

//             {/* <section className="relative overflow-hidden h-[60vh]">
//                 <div className="absolute inset-0 w-full h-full">
//                     <img
//                         src="/images/bg.webp"
//                         alt="Banner background"
//                         className="w-full h-full object-cover object-center"
//                         loading="eager"
//                     />

//                     <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-transparent" />
//                 </div>

//                 <div className="relative container mx-auto h-full flex justify-center items-center px-4">
//                     <div className="max-w-2xl text-white text-center">
//                         <Link
//                             href={"/dashboard"}
//                             className="text-4xl md:text-5xl font-bold mb-4 underline"
//                         >
//                             Blog
//                         </Link>
//                         <p className="text-xl mb-6">
//                             Latest driving tips and resources
//                         </p>

//                         <button
//                             onClick={() => setShowAddForm(true)}
//                             className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
//                         >
//                             <FiPlus className="mr-2" />
//                             Add New Blog Post
//                         </button>
//                     </div>
//                 </div>
//             </section> */}

//             <div className="bg-gray-50 min-h-screen">
//                 {/* Featured Posts */}
//                 <section className=" px-2 sm:px-6 lg:px-8 py-6 lg:py-8">
//                     {/* <Link
//                         href={"/dashboard"}
//                         className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
//                     >
//                         <ChevronLeft size={20} />
//                         <span className="font-medium">Back to Dashboard</span>
//                     </Link>

//                     <div className="mb-8">
//                         <button
//                             onClick={() => setShowAddForm(true)}
//                             className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
//                         >
//                             <FiPlus className="mr-2" />
//                             Add New Blog Post
//                         </button>
//                     </div> */}

//                     <div className="flex justify-end items-start px-4 mb-12">
//                         {/* Back Button */}
//                         {/* <Link
//                             href="/dashboard"
//                             className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
//                         >
//                             <ChevronLeft size={20} />
//                             <span className="font-medium">
//                                 Back to Dashboard
//                             </span>
//                         </Link> */}

//                         {/* Right Section (Logout on top, Add button below) */}
//                         <div className="flex flex-col items-end gap-4">
//                             {/* Logout Button */}
//                             {/* <button
//                                 onClick={handleLogout}
//                                 className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
//                             >
//                                 Log Out
//                             </button> */}

//                             {/* Add Gallery Button */}
//                             <button
//                                 onClick={() => setShowAddForm(true)}
//                                 className="bg-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:bg-indigo-700 transition-colors flex items-center"
//                             >
//                                 <FiPlus className="mr-2" />
//                                 Add Blog
//                             </button>
//                         </div>
//                     </div>
//                     <div className="text-center mb-16">
//                         <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-1 rounded-full mb-4">
//                             Featured Content
//                         </span>
//                         <h2 className="text-3xl font-bold mb-4">
//                             Must-Read Driving Guides
//                         </h2>
//                         <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
//                     </div>

//                     {featuredPosts.length > 0 ? (
//                         <div className="grid md:grid-cols-2 gap-8">
//                             {featuredPosts.map((post) => (
//                                 <div
//                                     key={post.id}
//                                     className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group relative"
//                                 >
//                                     {/* Edit/Delete Actions */}
//                                     <div className="absolute top-4 right-4 flex space-x-2 z-10">
//                                         <button
//                                             onClick={() => handleEdit(post)}
//                                             className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
//                                             title="Edit"
//                                         >
//                                             <FiEdit size={16} />
//                                         </button>
//                                         <button
//                                             onClick={() =>
//                                                         handleDelete(post.id)
//                                                     }
//                                             className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
//                                             title="Delete"
//                                         >
//                                             <FiTrash2 size={16} />
//                                         </button>
//                                     </div>

//                                     <div className="relative h-64 overflow-hidden">
//                                         <img
//                                             src={post.image}
//                                             alt={post.title}
//                                             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
//                                             onError={(e) => {
//                                                 e.target.src =
//                                                     "/images/default-blog.jpg";
//                                             }}
//                                         />
//                                         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
//                                             <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
//                                                 {post.category}
//                                             </span>
//                                         </div>
//                                     </div>

//                                     <div className="p-8">
//                                         <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
//                                             <span className="flex items-center">
//                                                 <FiCalendar className="mr-1.5" />
//                                                 {post.date}
//                                             </span>
//                                             <span className="flex items-center">
//                                                 <FiUser className="mr-1.5" />
//                                                 Admin
//                                             </span>
//                                         </div>

//                                         <h3 className="text-2xl font-bold mb-4 leading-snug">
//                                             {post.title}
//                                         </h3>
//                                         <p className="text-gray-600 mb-6">
//                                             {post.excerpt}
//                                         </p>

//                                         <div className="flex justify-between items-center">
//                                             <span className="text-sm text-gray-500 flex items-center">
//                                                 <FiClock className="mr-1.5" />
//                                                 {post.readTime}
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     ) : (
//                         <div className="text-center py-12">
//                             <p className="text-gray-500 text-lg">
//                                 No featured posts available.
//                             </p>
//                         </div>
//                     )}
//                 </section>

//                 {/* Recent Posts Section */}
//                 {recentPosts.length > 0 && (
//                     <section className="max-w-6xl mx-auto px-4 pb-20">
//                         <div className="text-center mb-16">
//                             <h2 className="text-3xl font-bold mb-4">
//                                 Recent Posts
//                             </h2>
//                             <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
//                         </div>

//                         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//                             {recentPosts.map((post) => (
//                                 <div
//                                     key={post.id}
//                                     className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group relative"
//                                 >
//                                     {/* Edit/Delete Actions */}
//                                     <div className="absolute top-4 right-4 flex space-x-2 z-10">
//                                         <button
//                                             onClick={() => handleEdit(post)}
//                                             className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
//                                             title="Edit"
//                                         >
//                                             <FiEdit size={14} />
//                                         </button>
//                                         <button
//                                             onClick={() =>
//                                                 setDeleteConfirm(post)
//                                             }
//                                             className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
//                                             title="Delete"
//                                         >
//                                             <FiTrash2 size={14} />
//                                         </button>
//                                     </div>

//                                     <div className="relative h-48 overflow-hidden">
//                                         <img
//                                             src={post.image}
//                                             alt={post.title}
//                                             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
//                                             onError={(e) => {
//                                                 e.target.src =
//                                                     "/images/default-blog.jpg";
//                                             }}
//                                         />
//                                     </div>

//                                     <div className="p-6">
//                                         <span className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded mb-3">
//                                             {post.category}
//                                         </span>
//                                         <h3 className="text-lg font-bold mb-2 line-clamp-2">
//                                             {post.title}
//                                         </h3>
//                                         <p className="text-gray-600 text-sm mb-4 line-clamp-2">
//                                             {post.excerpt}
//                                         </p>
//                                         <div className="flex justify-between items-center text-sm text-gray-500">
//                                             <span>{post.date}</span>
//                                             <span className="flex items-center">
//                                                 <FiClock className="mr-1" />
//                                                 {post.readTime}
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </section>
//                 )}
//             </div>
//         </Wrapper>
//     );
// };

// export default BlogList;


