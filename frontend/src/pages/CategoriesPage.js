import React, { useState, useEffect } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  X,
  Save,
  RotateCcw,
  Hash,
  Loader2,
  Search
} from "lucide-react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";


export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: ""
  });

  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();


  // FETCH
  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/categories");
      setCategories(data);
      setFilteredCategories(data);
    } catch (error) {
      console.error("Failed to load categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // SEARCH FILTER
  useEffect(() => {
    const filtered = categories.filter(cat =>
      cat.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [search, categories]);

  const generateSlug = text =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleNameChange = name => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: "", slug: "", description: "" });
    setIsModalOpen(true);
  };

  const openEditModal = cat => {
    setEditingId(cat._id);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description
    });
    setIsModalOpen(true);
  };

  const saveCategory = async e => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setSaving(true);

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, formData);
      } else {
        await api.post("/categories", formData);
      }

      await fetchCategories();
      setIsModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async id => {
    if (window.confirm("Delete this category permanently?")) {
      try {
        await api.delete(`/categories/${id}`);
        setCategories(prev => prev.filter(cat => cat._id !== id));
      } catch {
        alert("Failed to delete category");
      }
    }
  };

  return (
  <div className="p-10 bg-[#f8fafc] min-h-screen">

    {/* HEADER */}
    <div className="flex justify-between items-center mb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
        <p className="text-slate-500 mt-1">
          Organize your blog posts by categories
        </p>
      </div>

      <button
        onClick={openAddModal}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl shadow-sm transition active:scale-95 font-semibold"
      >
        <Plus size={18} /> New Category
      </button>
    </div>

    {/* TABLE */}
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {loading ? (
        <div className="p-16 flex flex-col items-center text-slate-400">
          <Loader2 className="animate-spin mb-2" />
          Loading categories...
        </div>
      ) : (
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr className="text-xs uppercase text-slate-400 tracking-wider">
              <th className="px-8 py-4">Name</th>
              <th className="px-8 py-4">Slug</th>
              <th className="px-8 py-4">Description</th>
              <th className="px-8 py-4">Posts</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-10 text-center text-slate-400">
                  No categories found.
                </td>
              </tr>
            ) : (
              filteredCategories.map(cat => (
                <tr key={cat._id} className="hover:bg-slate-50 transition">
                  
                  {/* NAME */}
                  <td className="px-8 py-5 font-semibold text-slate-800">
                    {cat.name}
                  </td>

                  {/* SLUG PILL */}
                  <td className="px-8 py-5">
                    <span className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-lg font-mono">
                      {cat.slug}
                    </span>
                  </td>

                  {/* DESCRIPTION */}
                  <td className="px-8 py-5 text-slate-600 text-sm max-w-md">
                    {cat.description || "-"}
                  </td>

                  {/* POSTS COUNT */}
                  <td className="px-8 py-5">
                    <span className="bg-indigo-100 text-indigo-600 text-xs px-3 py-1 rounded-full font-semibold">
                      {cat.postCount ?? 0} posts
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-8 py-5">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => deleteCategory(cat._id)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>

    {/* MODAL (keep your existing modal exactly same) */}
    {isModalOpen && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl w-full max-w-lg p-8 relative shadow-xl">
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute right-6 top-6 text-slate-400"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-bold mb-6">
            {editingId ? "Update Category" : "Add Category"}
          </h2>

          <form onSubmit={saveCategory} className="space-y-4">
            <input
              required
              placeholder="Category Name"
              className="w-full p-3 border rounded-xl"
              value={formData.name}
              onChange={e => handleNameChange(e.target.value)}
            />

            <input
              readOnly
              className="w-full p-3 bg-slate-100 rounded-xl text-sm"
              value={formData.slug}
            />

            <textarea
              rows={3}
              placeholder="Description"
              className="w-full p-3 border rounded-xl"
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 text-white px-6 py-2 rounded-xl"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);
}