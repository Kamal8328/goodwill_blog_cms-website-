import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RichTextEditor from "../components/RichTextEditor";
import { FiEye, FiEyeOff, FiSave, FiCheckCircle } from "react-icons/fi";
import { FaArrowLeft } from "react-icons/fa";
import api from "../services/api";
import "./EditPostPage"

const EditPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ===== STATES =====
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [status, setStatus] = useState("draft");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showPreview, setShowPreview] = useState(true);

  // ===== FETCH POST DATA =====
  useEffect(() => {
    fetchPost();
    fetchCategories();
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await api.get(`/posts/${id}`);
      const post = res.data;
      setTitle(post.title || "");
      setSlug(post.slug || "");
      setExcerpt(post.excerpt || "");
      setContent(post.content || "");
      setMetaTitle(post.metaTitle || "");
      setStatus(post.status || "draft");
      setTags(post.tags || []);
      setSelectedCategory(post.categories?.[0]?._id?.toString() || "");

      if (post.featuredImage?.url) {
        setImagePreview(post.featuredImage.url);
      }
      setLoading(false);
    } catch (err) {
      alert("Failed to load post");
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const res = await api.get("/categories");
    setCategories(res.data);
  };

  // ===== TAGS HANDLER =====
  const addTag = (e) => {
    if ((e.key === "Enter" || e.type === "click") && tagInput.trim() !== "") {
      e.preventDefault();
      const newTag = tagInput.trim();
      const exists = tags.some(
        (t) =>
          (typeof t === "object" ? t.name.toLowerCase() : t.toLowerCase()) ===
          newTag.toLowerCase(),
      );
      if (!exists) setTags([...tags, newTag]);
      setTagInput("");
    }
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // ===== IMAGE HANDLER =====
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ===== UPDATE POST =====
  const handleSubmit = async (e, overrideStatus) => {
    if (e) e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("excerpt", excerpt);
      formData.append("content", content);
      formData.append("metaTitle", metaTitle);
      formData.append("status", overrideStatus || status);
      formData.append("categories", selectedCategory);
      formData.append("tags", JSON.stringify(tags));
      // EditPostPage.jsx inside handleSubmit
if (featuredImage) {
  formData.append("featuredImage", featuredImage); // Change "file" to "featuredImage"
}

      await api.put(`/posts/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(`Post ${overrideStatus || status} successfully`);
      navigate("/admin/blogposts");
    } catch (err) {
      alert("Update failed");
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center font-bold text-slate-400">
        Loading editor...
      </div>
    );

  return (
    <div className="bg-slate-50 min-h-screen font-sans antialiased text-slate-900">
      {/* TOP HEADER */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaArrowLeft className="text-gray-500" />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            Edit Post
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            className="btn-secondary text-sm font-semibold flex items-center gap-2"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
          <button
            className="btn-secondary text-sm font-semibold flex items-center gap-2"
            onClick={(e) => handleSubmit(e, "Draft")}
          >
            <FiSave size={18} /> Save Draft
          </button>
          <button
            className="btn-primary text-sm font-bold shadow-lg shadow-blue-200 flex items-center gap-2"
            onClick={(e) => handleSubmit(e, "Published")}
          >
            <FiCheckCircle size={18} /> Publish Changes
          </button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div
        className={`grid gap-10 p-10 max-w-[1600px] mx-auto ${showPreview ? "grid-cols-2" : "grid-cols-1"}`}
      >
        {/* LEFT FORM */}
        <div className="space-y-10">
          <section className="space-y-6">
            <div>
              <label className="label">Post Title</label>
              <input
                className="input text-lg font-semibold"
                placeholder="Enter title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Featured Image</label>
              <div className="upload-box group transition-all hover:border-blue-400 hover:bg-blue-50/30">
                <input
                  type="file"
                  className="hidden"
                  id="fileUpload"
                  onChange={handleImageChange}
                />
                <label htmlFor="fileUpload" className="cursor-pointer block">
                  <p className="text-slate-500 font-medium">
                    Click to upload featured image
                  </p>
                </label>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    className="preview-img ring-4 ring-white shadow-xl"
                    alt="Preview"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="label">Content Body</label>
              <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
                <RichTextEditor value={content} onChange={setContent} />
              </div>
            </div>

            <div>
              <label className="label">Excerpt</label>
              <textarea
                className="input h-28 resize-none leading-relaxed"
                placeholder="Short summary..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>
          </section>

          <div className="grid grid-cols-2 gap-6">
            <div className="section">
              <h3 className="section-title mb-4">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat._id)}
                    className={`pill ${selectedCategory === cat._id ? "pill-active" : "pill-inactive"}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="section">
              <h3 className="section-title mb-4">Status</h3>
              <select
                className="input bg-white"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Draft">Draft Mode</option>
                <option value="Published">Published</option>
              </select>
            </div>
          </div>

          <div className="section bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="section-title mb-4">Post Tags</h3>
            <div className="flex gap-2 mb-4">
              <input
                className="input flex-1"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="Add tag..."
              />
              <button className="btn-secondary" onClick={addTag}>
                Add
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag, i) => (
                <span key={i} className="tag-pill">
                  # {typeof tag === "object" ? tag.name : tag}
                  <button
                    onClick={() => removeTag(i)}
                    className="ml-2 hover:text-red-500"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PREVIEW */}
        {/* RIGHT PREVIEW */}
{showPreview && (
  <div className="w-full h-full min-w-0">
    {/* OUTER CONTAINER */}
    <div className="bg-white rounded-[2.5rem] shadow-2xl sticky top-28 border border-slate-100 h-[85vh] flex flex-col overflow-hidden">
      
      {/* 1. FIXED STATUS HEADER */}
      <div className="flex-none bg-white/90 backdrop-blur-md px-10 py-6 border-b border-slate-50 flex justify-between items-center z-30">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600 border-2 border-white shadow-sm"></span>
          </div>
          <span className="text-[11px] font-black tracking-[0.2em] uppercase text-slate-800">
            Live Preview
          </span>
        </div>
        <div className="flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Synced</span>
        </div>
      </div>

      {/* 2. SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-premium relative">
        {/* Subtle top gradient to soften the text entry */}
        <div className="sticky top-0 h-8 w-full bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>

        <div className="px-10 pb-20 space-y-8">
          {/* Title */}
          <h1 className="text-4xl font-black text-slate-900 leading-tight break-words tracking-tight drop-shadow-sm">
            {title || "Untitled Post"}
          </h1>

          {/* UPGRADED ADMIN AVATAR */}
          <div className="flex items-center gap-4 py-5 border-y border-slate-50/80">
            <div className="relative group cursor-pointer">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl rotate-3 group-hover:rotate-0 transition-transform duration-300 flex items-center justify-center text-white font-black text-lg shadow-xl ring-4 ring-slate-50">
                A
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-none">Admin Editor</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1.5 flex items-center gap-1">
                Verified Author <span className="text-blue-500">●</span> {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Featured Image with "Pop" effect */}
          {imagePreview && (
            <div className="rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-100/50 border border-slate-100 transform transition-hover hover:scale-[1.01] duration-500">
              <img src={imagePreview} className="w-full h-auto object-cover" alt="Preview" />
            </div>
          )}

          {/* Excerpt with better Typography */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 rounded-full opacity-20"></div>
            <p className="text-xl text-slate-500 font-medium leading-relaxed pl-8 break-words italic tracking-tight">
              {excerpt || "Add an excerpt to refine the summary..."}
            </p>
          </div>

          {/* Main Body with Typography Polish */}
          <div 
            className="prose-responsive text-slate-700 leading-[1.8] text-lg pb-10" 
            dangerouslySetInnerHTML={{ __html: content }} 
          />
        </div>
      </div>
    </div>
  </div>
)}        {/* RIGHT PREVIEW */}
      </div>

      <style>{`
        .input { width: 100%; padding: 14px 18px; border: 1.5px solid #e2e8f0; border-radius: 14px; outline: none; transition: 0.2s; background: #fff; }
        .input:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 131, 246, 0.1); }
        .label { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 8px; display: block; }
        .btn-primary { background: #2563eb; color: white; padding: 12px 24px; border-radius: 12px; border: none; cursor: pointer; display: flex; align-items: center; }
        .btn-secondary { background: white; border: 1.5px solid #e2e8f0; padding: 12px 24px; border-radius: 12px; cursor: pointer; color: #475569; display: flex; align-items: center; }
        .upload-box { border: 2px dashed #e2e8f0; padding: 40px; border-radius: 20px; text-align: center; background: white; }
        .preview-img { margin-top: 20px; border-radius: 12px; max-height: 200px; }
        .pill { padding: 8px 16px; border-radius: 10px; cursor: pointer; font-size: 0.85rem; font-weight: 700; border: 1.5px solid #e2e8f0; background: white; }
        .pill-active { background: #eff6ff; border-color: #3b82f6; color: #3b82f6; }
        .tag-pill { background: #f8fafc; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; border: 1px solid #e2e8f0; }
        .section-title { font-size: 1rem; font-weight: 800; color: #1e293b; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default EditPostPage;
