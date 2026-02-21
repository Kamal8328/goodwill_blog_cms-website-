import React, { useState, useMemo, useEffect } from "react";
import api from "../services/api";
import {
  Search,
  Pencil,
  Trash2,
  Tag as TagIcon,
  X,
  Check,
  XCircle,
} from "lucide-react";

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "" });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const res = await api.get("/tags");
      setTags(res.data);
    } catch (error) {
      console.error("Failed to fetch tags", error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (tag) => {
    setEditingId(tag._id);
    setEditForm({ name: tag.name });
  };

  const saveEdit = async (id) => {
    if (!editForm.name.trim()) return;

    try {
      await api.put(`/tags/${id}`, { name: editForm.name });
      await fetchTags();
      setEditingId(null);
    } catch (error) {
      alert("Failed to update tag");
    }
  };

  const deleteTag = async (id) => {
    if (!window.confirm("Are you sure to delete this tag?")) return;

    try {
      await api.delete(`/tags/${id}`);
      await fetchTags();
    } catch (error) {
      alert("Delete failed");
    }
  };

  const filteredTags = useMemo(() => {
    return tags.filter(
      (t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, tags]);

  return (
    <div className="p-10 bg-[#f5f7fb] min-h-screen font-sans">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Tags</h2>
        <p className="text-gray-500 text-sm">
          Manage and organize post labels
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-8 shadow-sm">
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
          <Search size={18} className="text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tags..."
            className="bg-transparent outline-none w-full text-sm font-medium text-slate-700"
          />
          {searchQuery && (
            <X
              size={16}
              className="text-gray-400 cursor-pointer"
              onClick={() => setSearchQuery("")}
            />
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">
          Loading tags...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTags.map((tag) => (
            <div
              key={tag._id}
              className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {editingId === tag._id ? (
                <div className="space-y-4">
                  <input
                    autoFocus
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ name: e.target.value })
                    }
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(tag._id)}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg text-xs flex items-center justify-center gap-1"
                    >
                      <Check size={14} /> Save
                    </button>

                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 bg-gray-100 py-2 rounded-lg text-xs flex items-center justify-center gap-1"
                    >
                      <XCircle size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">
                        {tag.name}
                      </h3>
                      <div className="text-xs font-mono text-blue-600">
                        /{tag.slug}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => startEditing(tag)}>
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => deleteTag(tag._id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500">
                    <TagIcon size={14} />
                    <span className="text-sm font-bold">
                      {tag.postCount || 0}
                    </span>
                    <span className="text-xs">posts</span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}