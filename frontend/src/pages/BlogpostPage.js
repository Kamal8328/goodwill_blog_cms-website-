import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Search, Eye, Pencil, Trash2, Plus, X, Loader2 } from "lucide-react";

export default function BlogPostPage() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedPost, setSelectedPost] = useState(null);

  const safePosts = Array.isArray(posts) ? posts : [];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const [categoriesRes, postsRes] = await Promise.all([
          api.get("/categories"),
          api.get("/posts"),
        ]);

        const catData =
          categoriesRes.data?.data ||
          categoriesRes.data?.categories ||
          categoriesRes.data ||
          [];

        const postData =
          postsRes.data?.data || postsRes.data?.posts || postsRes.data || [];

        setCategories(catData);
        setPosts(Array.isArray(postData) ? postData : []);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const deletePost = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await api.delete(`/posts/${id}`);
        setPosts(posts.filter((p) => p._id !== id));
      } catch {
        alert("Failed to delete post");
      }
    }
  };

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
            : cat === categoryFilter
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
    <div className="px-4 sm:px-6 md:px-10 py-6 bg-slate-50/50 min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Blog Posts
          </h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base">
            Manage your {safePosts.length} database entries
          </p>
        </div>

        <button
          onClick={() => navigate("/create")}
          className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus size={20} /> New Post
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-medium outline-none border border-transparent focus:border-blue-500/30"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-auto px-4 py-3 bg-slate-50 rounded-xl text-sm font-bold text-slate-600 outline-none border border-transparent focus:border-blue-500/30"
        >
          <option value="All">All Statuses</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
          <option value="Scheduled">Scheduled</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full md:w-auto px-4 py-3 bg-slate-50 rounded-xl text-sm font-bold text-slate-600 outline-none border border-transparent focus:border-blue-500/30"
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/30">
              <th className="px-6 py-4 text-xs font-black text-slate-400 w-[35%]">
                Title
              </th>
              <th className="px-6 py-4 text-xs text-center font-black text-slate-400">
                Author
              </th>
              <th className="px-6 py-4 text-xs text-center font-black text-slate-400">
                Category
              </th>
              <th className="px-6 py-4 text-xs text-center font-black text-slate-400">
                Status
              </th>
              <th className="px-6 py-4 text-xs text-center font-black text-slate-400">
                Date
              </th>
              <th className="px-6 py-4 text-xs text-center font-black text-slate-400">
                Views
              </th>
              <th className="px-6 py-4 text-xs text-right font-black text-slate-400">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredPosts.map((post) => (
              <tr key={post._id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-5 font-bold text-sm text-slate-800">
                  {post.title}
                </td>
                <td className="px-6 py-5 text-center text-sm text-slate-500">
                  {post.author || "Admin"}
                </td>
                <td className="px-6 py-5 text-center">
                  {post.categories?.map((cat, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-black px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100 uppercase mr-1"
                    >
                      {cat.name}
                    </span>
                  ))}
                </td>
                <td className="px-6 py-5 text-center">
                  <span
                    className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase ${
                      statusColors[post.status] ||
                      "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-center text-sm text-slate-400">
                  {post.createdAt
                    ? new Date(post.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="px-6 py-5 text-center text-sm font-bold text-slate-600">
                  {post.views || 0}
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => navigate(`/edit/${post._id}`)}>
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/posts/view/${post._id}`)
                      }
                    >
                      <Eye size={18} />
                    </button>
                    <button onClick={() => deletePost(post._id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4">
        {filteredPosts.map((post) => (
          <div
            key={post._id}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200"
          >
            <h2 className="font-bold text-sm text-slate-800 mb-2 line-clamp-2">
              {post.title}
            </h2>

            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>{post.author || "Admin"}</span>
              <span>
                {post.createdAt
                  ? new Date(post.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>

            <div className="flex justify-between items-center mb-3">
              <span
                className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase ${
                  statusColors[post.status] ||
                  "bg-gray-100 text-gray-400"
                }`}
              >
                {post.status}
              </span>
              <span className="text-xs font-bold text-slate-600">
                {post.views || 0} views
              </span>
            </div>

            <div className="flex justify-end gap-3 border-t pt-3">
              <button onClick={() => navigate(`/edit/${post._id}`)}>
                <Pencil size={18} />
              </button>
              <button
                onClick={() =>
                  navigate(`/posts/view/${post._id}`)
                }
              >
                <Eye size={18} />
              </button>
              <button onClick={() => deletePost(post._id)}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}