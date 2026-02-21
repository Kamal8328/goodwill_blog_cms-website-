import { useState, useEffect } from "react";
import api from "../../services/api"; // adjust path
import { FaPlus, FaEdit, FaTrash, FaSpinner } from "react-icons/fa";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/categories");
      setCategories(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setError("");
      setSuccess("");

      if (editingId) {
        // Update
        await api.put(`/categories/${editingId}`, { name: formData.name.trim() });
        setSuccess("Category updated!");
      } else {
        // Create
        await api.post("/categories", { name: formData.name.trim() });
        setSuccess("Category created!");
      }

      setFormData({ name: "" });
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (cat) => {
    setFormData({ name: cat.name });
    setEditingId(cat._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category? Posts may lose this category.")) return;

    try {
      await api.delete(`/categories/${id}`);
      setSuccess("Category deleted!");
      fetchCategories();
    } catch (err) {
      setError("Cannot delete — maybe used in posts?");
    }
  };

  const cancelEdit = () => {
    setFormData({ name: "" });
    setEditingId(null);
    setError("");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Manage Categories</h1>

      {/* Messages */}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">{success}</div>}

      {/* Form - Create / Edit */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-4">
          {editingId ? "Edit Category" : "Add New Category"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Category name (e.g., Study Abroad)"
            className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#253E90]"
            required
          />
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-[#253E90] text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-800 transition flex items-center gap-2"
            >
              {editingId ? <FaEdit /> : <FaPlus />} {editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <FaSpinner className="animate-spin text-3xl text-[#253E90] mx-auto mb-4" />
            <p className="text-slate-500">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No categories yet. Add your first one above!
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="flex items-center justify-between p-5 hover:bg-slate-50 transition"
              >
                <div className="font-medium text-slate-800">{cat.name}</div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}