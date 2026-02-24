import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // Ensure this path is correct
import { Search, Eye, Pencil, Trash2, Plus, X, Loader2 } from "lucide-react";

export default function BlogPostPage() {
  const navigate = useNavigate();

  // --- STATE ---
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedPost, setSelectedPost] = useState(null);

  const safePosts = Array.isArray(posts) ? posts : [];

  // --- FETCH DATA FROM DATABASE ---
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const [categoriesRes, postsRes] = await Promise.all([
          api.get("/categories"),
          api.get("/posts"),
        ]);
        // data should be the array of posts from your MongoDB
        const catData =
          categoriesRes.data?.data ||
          categoriesRes.data?.categories ||
          categoriesRes.data ||
          [];
        console.log("debugging categories ", categoriesRes.data);
        setCategories(catData);
        console.log("debugging categories ", categoriesRes.data);

        console.log("FULL POST RESPONSE:", postsRes.data);

        const postData =
          postsRes.data?.data || postsRes.data?.posts || postsRes.data || [];

        console.log("RESOLVED POST DATA:", postData);

        setPosts(Array.isArray(postData) ? postData : []);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // --- DELETE LOGIC (Updated for API) ---
  const deletePost = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await api.delete(`/posts/${id}`);
        setPosts(posts.filter((p) => p._id !== id));
      } catch (err) {
        alert("Failed to delete post");
      }
    }
  };

  // --- FILTER LOGIC post.categories?.some(cat=>cat._id===categoryFilter); ---
  const filteredPosts = safePosts.filter((post) => {
    const matchesSearch =
      post?.title?.toLowerCase()?.includes(search.toLowerCase()) ?? false;
    const matchesStatus =
      statusFilter === "All" ||
      post?.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesCategory =
      categoryFilter === "All" ||
      (Array.isArray(post?.categories) &&
        post.categories.some((cat) =>
          typeof cat === "object"
            ? cat._id === categoryFilter
            : cat === categoryFilter,
        ));
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const statusColors = {
    Published: "bg-green-50 text-green-600 border-green-100",
    Draft: "bg-orange-50 text-orange-600 border-orange-100",
    Scheduled: "bg-purple-50 text-purple-600 border-purple-100",
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-10 bg-slate-50/50 min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Blog Posts
          </h1>
          <p className="text-slate-500 font-medium">
            Manage your {safePosts.length} database entries
          </p>
        </div>
        <button
          onClick={() => navigate("/create")}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={20} /> New Post
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative flex-[2]">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-medium outline-none border border-transparent focus:border-blue-500/30 transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex-1 px-4 py-3 bg-slate-50 rounded-xl text-sm font-bold text-slate-600 outline-none border border-transparent focus:border-blue-500/30"
        >
          <option value="All">All Statuses</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
          <option value="Scheduled">Scheduled</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="flex-1 px-4 py-3 bg-slate-50 rounded-xl text-sm font-bold text-slate-600 outline-none border border-transparent focus:border-blue-500/30"
        >
          <option value="All">All Categories</option>
          {Array.isArray(categories) &&
            categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/30">
              <th className="px-6 py-4 text-[11px] uppercase font-black text-slate-400 tracking-widest w-[35%]">
                Title
              </th>
              <th className="px-6 py-4 text-[11px] uppercase font-black text-slate-400 tracking-widest text-center">
                Author
              </th>
              <th className="px-6 py-4 text-[11px] uppercase font-black text-slate-400 tracking-widest text-center">
                Category
              </th>{" "}
              {/* Column 3 */}
              <th className="px-6 py-4 text-[11px] uppercase font-black text-slate-400 tracking-widest text-center">
                Status
              </th>{" "}
              {/* Column 4 */}
              <th className="px-6 py-4 text-[11px] uppercase font-black text-slate-400 tracking-widest text-center">
                Date
              </th>
              <th className="px-6 py-4 text-[11px] uppercase font-black text-slate-400 tracking-widest text-center">
                Views
              </th>
              <th className="px-6 py-4 text-[11px] uppercase font-black text-slate-400 tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPosts.map((post) => (
              <tr
                key={post._id}
                className="group hover:bg-slate-50/50 transition-colors"
              >
                {/* 1. TITLE */}
                <td className="px-6 py-5 font-bold text-slate-800 text-sm">
                  <div className="font-bold text-slate-800 text-sm line-clamp-2">
                    {post.title}
                  </div>
                  {/* Tags */}
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {(() => {
                      const tagsArray = Array.isArray(post.tags)
                        ? post.tags
                        : typeof post.tags === "string"
                          ? post.tags.split(",").filter(Boolean)
                          : [];

                      return tagsArray.length > 0 ? (
                        tagsArray.map((tag, index) => (
                          <span
                            key={index}
                            className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap"
                          >
                            {tag?.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-slate-300 italic">
                          No tags
                        </span>
                      );
               })()}
                   
                  </div>
                </td>

                {/* 2. AUTHOR */}
                <td className="px-6 py-5 text-center text-sm font-medium text-slate-500">
                  {post.author || "Admin"}
                </td>

                {/* 3. CATEGORY (Matches Header 3) */}
                {/* CATEGORY COLUMN */}
                <td className="px-6 py-5 text-center">
                  <div className="flex flex-wrap justify-center gap-1">
                    {post.categories && post.categories.length > 0 ? (
                      post.categories.map((cat, index) => (
                        <span
                          key={cat._id || index}
                          className="text-[9px] font-black px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-tighter"
                        >
                          {cat.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-300 italic">
                        No Category
                      </span>
                    )}
                  </div>
                </td>

                {/* 4. STATUS (Matches Header 4) */}
                <td className="px-6 py-5 text-center">
                  <span
                    className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${statusColors[post.status] || "bg-gray-100 text-gray-400"}`}
                  >
                    {post.status}
                  </span>
                </td>

                {/* 5. DATE */}
                <td className="px-6 py-5 text-center text-sm font-medium text-slate-400">
                  {post.createdAt
                    ? new Date(post.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>

                {/* 6. VIEWS */}
                <td className="px-6 py-5 text-center text-sm font-bold text-slate-600">
                  {post.views || 0}
                </td>

                {/* 7. ACTIONS  navigate(`/edit/${post._id}`)
*/}
                <td className="px-6 py-5 text-right">
                  <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => navigate(`/edit/${post._id}`)}
                      className="p-2 text-slate-400 hover:text-blue-600"
                    >
                      <Pencil size={18} />
                    </button>
                    {/* Inside the map function in BlogPostPage.jsx */}
<button
  onClick={() => navigate(`/posts/view/${post._id}`)} 
  className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
  title="View Post"
>
  <Eye size={18} />
</button>
                    <button
                      onClick={() => deletePost(post._id)}
                      className="p-2 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PREVIEW MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 z-10"
            >
              <X size={20} />
            </button>
            <div className="h-40 bg-slate-100 flex items-center justify-center">
              {selectedPost.featuredImage ? (
                <img
                  src={selectedPost.featuredImage}
                  alt="Post Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-black text-4xl text-blue-600 uppercase">
                  {selectedPost.title.charAt(0)}
                </span>
              )}
            </div>
            <div className="p-8 space-y-4">
              <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {selectedPost.category}
              </span>
              <h2 className="text-xl font-black text-slate-900 leading-tight">
                {selectedPost.title}
              </h2>
              <div
                className="text-sm text-slate-500 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: selectedPost.excerpt }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
