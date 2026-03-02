import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RichTextEditor from "../components/RichTextEditor";
import { FiEye, FiEyeOff, FiSave, FiCheckCircle } from "react-icons/fi";
import { FaArrowLeft } from "react-icons/fa";
import api from "../services/api";
import "./EditPostPage";

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
  const [showPreview, setShowPreview] = useState(false);

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
          newTag.toLowerCase()
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

      if (featuredImage) {
        formData.append("featuredImage", featuredImage);
      }

      await api.put(`/posts/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      {/* alert(`Post ${overrideStatus || status} successfully`); */}
      alert(`Post Updated successfully`);
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
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 relative">
      {/* ===== HEADER ===== */}
      <div className="bg-white sticky top-0 z-40 border-b px-4 md:px-8 py-4 flex justify-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FaArrowLeft className="text-gray-500" />
          </button>
          <h1 className="text-lg md:text-xl font-bold">Edit Post</h1>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            className="btn-secondary flex items-center gap-2 text-sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <FiEyeOff /> : <FiEye />}
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>

          <button
            className="btn-secondary flex items-center gap-2 text-sm"
            onClick={(e) => handleSubmit(e, "Draft")}
          >
            <FiSave /> Save Draft
          </button>

          <button
            className="btn-primary flex items-center gap-2 text-sm"
            onClick={(e) => handleSubmit(e, "Published")}
          >
            <FiCheckCircle /> Update Changes
          </button>
        </div>
      </div>

      {/* ===== MAIN GRID ===== */}
      <div className="relative">
        <div
          className={`grid gap-10 p-4 md:p-8 xl:p-10 max-w-[1600px] mx-auto ${
            showPreview ? "xl:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {/* ===== LEFT FORM ===== */}
          <div className="space-y-10">

            {/* TITLE */}
            <div>
              <label className="label">Post Title</label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* FEATURED IMAGE */}
            <div>
              <label className="label">Featured Image</label>
              <div className="upload-box">
                <input
                  type="file"
                  className="hidden"
                  id="fileUpload"
                  onChange={handleImageChange}
                />
                <label htmlFor="fileUpload" className="cursor-pointer block">
                  Click to upload featured image
                </label>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    className="preview-img"
                    alt="Preview"
                  />
                )}
              </div>
            </div>

            {/* CONTENT */}
            <div>
              <label className="label">Content Body</label>
              <div className="border rounded-2xl bg-white overflow-hidden">
                <RichTextEditor value={content} onChange={setContent} />
              </div>
            </div>

            {/* EXCERPT */}
            <div>
              <label className="label">Excerpt</label>
              <textarea
                className="input h-28"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>

            {/* CATEGORY + STATUS */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="section-title mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => setSelectedCategory(cat._id)}
                      className={`pill ${
                        selectedCategory === cat._id
                          ? "pill-active"
                          : ""
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="section-title mb-3">Status</h3>
                <select
                  className="input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>
            </div>

            {/* TAGS */}
            <div>
              <h3 className="section-title mb-3">Tags</h3>
              <div className="flex gap-2 mb-3">
                <input
                  className="input flex-1"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                />
                <button className="btn-secondary" onClick={addTag}>
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span key={i} className="tag-pill">
                    #{typeof tag === "object" ? tag.name : tag}
                    <button
                      onClick={() => removeTag(i)}
                      className="ml-2 text-red-500"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ===== DESKTOP PREVIEW ===== */}
          {showPreview && (
            <div className="hidden xl:block">
              <div className="bg-white rounded-3xl shadow-xl sticky top-28 h-[85vh] overflow-y-auto p-8 space-y-6">
                <h1 className="text-3xl font-bold">
                  {title || "Untitled Post"}
                </h1>

                {imagePreview && (
                  <img
                    src={imagePreview}
                    className="rounded-2xl"
                    alt="Preview"
                  />
                )}

                <p className="italic text-slate-500">
                  {excerpt || "Add excerpt..."}
                </p>

                <div
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ===== MOBILE MODAL PREVIEW ===== */}
        {showPreview && (
          <div className="xl:hidden fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md h-[90vh] rounded-3xl overflow-y-auto p-6 relative">
              <button
                onClick={() => setShowPreview(false)}
                className="absolute top-4 right-4 bg-gray-200 px-3 py-1 rounded-full text-sm"
              >
                Close
              </button>

              <h1 className="text-2xl font-bold mb-4">
                {title || "Untitled Post"}
              </h1>

              {imagePreview && (
                <img
                  src={imagePreview}
                  className="rounded-xl mb-4"
                  alt="Preview"
                />
              )}

              

              <div
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ===== STYLES ===== */}
      <style>{`
        .input { width: 100%; padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 12px; }
        .btn-primary { background: #2563eb; color: white; padding: 10px 18px; border-radius: 10px; }
        .btn-secondary { background: white; border: 1px solid #e2e8f0; padding: 10px 18px; border-radius: 10px; }
        .upload-box { border: 2px dashed #e2e8f0; padding: 30px; border-radius: 20px; text-align: center; background: white; }
        .preview-img { margin-top: 15px; border-radius: 12px; max-height: 200px; }
        .pill { padding: 6px 14px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; }
        .pill-active { background: #eff6ff; border-color: #3b82f6; color: #3b82f6; }
        .tag-pill { background: #f1f5f9; padding: 6px 10px; border-radius: 8px; font-size: 0.8rem; }
        .label { font-size: 0.75rem; font-weight: 700; margin-bottom: 6px; display: block; }
        .section-title { font-weight: 700; }
      `}</style>
    </div>
  );
};

export default EditPostPage;