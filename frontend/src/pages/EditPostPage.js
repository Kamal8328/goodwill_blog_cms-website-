import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RichTextEditor from "../components/RichTextEditor";
import api from "../services/api";

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
  }, []);

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
      console.log(err);
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
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // ===== IMAGE HANDLER =====
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFeaturedImage(file);
    if (file) setImagePreview(URL.createObjectURL(file));
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

      if (featuredImage) formData.append("file", featuredImage);

      await api.put(`/posts/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(`Post ${overrideStatus || status} successfully`);
      navigate("/admin/blogposts");
    } catch (err) {
      alert("Update failed");
      console.log(err);
    }
  };

  if (loading) return <p className="p-10">Loading post...</p>;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* TOP HEADER */}
      <div className="bg-white border-b px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold cursor-pointer" onClick={() => navigate(-1)}>← Edit Post</h1>
        <div className="flex gap-3">
          <button
            className="btn-secondary"
            onClick={() => setShowPreview((prev) => !prev)}
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
          <button
            className="btn-secondary"
            onClick={addTag}
          >
            Save Draft
          </button>
          <button
            className="btn-primary"
            onClick={(e) => handleSubmit(e, "Published")}
          >
            Publish
          </button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className={`grid gap-10 p-8 ${showPreview ? "grid-cols-2" : "grid-cols-1"}`}>
        {/* LEFT FORM */}
        <div className="space-y-8">
          <div>
            <label className="label">Post Title</label>
            <input
              className="input"
              placeholder="Enter your post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="label">URL Slug</label>
            <input
              className="input"
              placeholder="post-url-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Featured Image</label>
            <div className="upload-box">
              <input type="file" onChange={handleImageChange} />
              <p className="text-gray-500 mt-2">Click to upload featured image</p>
              {imagePreview && <img src={imagePreview} className="preview-img" alt="" />}
            </div>
          </div>

          <div>
            <label className="label">Content</label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>

          <div>
            <label className="label">Excerpt</label>
            <textarea
              className="input h-24"
              placeholder="Brief description of your post..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat._id.toString())}
                  className={`pill ${selectedCategory === cat._id.toString() ? "pill-active" : ""}`}
                >
                  {cat.name}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Tags</label>
            <div className="flex gap-2">
              <input
                className="input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="Press Enter to add tag"
              />
              <button className="btn-secondary" onClick={addTag}>Add</button>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {tags.map((tag, i) => (
                <span key={i} onClick={() => removeTag(i)} className="tag-pill">{tag} ✕</span>
              ))}
            </div>
          </div>

          <div className="section">
            <h3 className="section-title">SEO Settings</h3>
            <input
              className="input mt-3"
              placeholder="SEO Title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
            />
            <textarea className="input mt-3" placeholder="SEO Description" />
          </div>

          <div className="section">
            <h3 className="section-title">Publishing Options</h3>
            <select
              className="input mt-3"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>
        </div>

        {/* RIGHT PREVIEW */}
        {showPreview && (
          <div className="bg-white p-8 rounded-xl shadow sticky top-6 h-fit">
            <p className="text-gray-400 mb-4">Live Preview</p>
            <h1 className="text-3xl font-bold mb-3">{title || "Your post title will appear here"}</h1>
            <div className="flex items-center gap-3 mb-6">
              <div className="avatar">A</div>
              <div>
                <p className="font-medium">Admin</p>
                <p className="text-sm text-gray-400">February 19, 2026</p>
              </div>
            </div>
            {imagePreview && <img src={imagePreview} className="rounded-lg mb-6" alt="" />}
            <p className="text-gray-500">{excerpt}</p>
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        )}
      </div>

      {/* STYLES */}
      <style>{`
        .input {width:100%; padding:12px; border:1px solid #ddd; border-radius:10px}
        .label {font-weight:600; margin-bottom:6px; display:block}
        .btn-primary {background:#2563eb; color:white; padding:10px 18px; border-radius:10px}
        .btn-secondary {border:1px solid #ddd; padding:10px 18px; border-radius:10px; background:white}
        .upload-box {border:2px dashed #ddd; padding:30px; border-radius:14px; text-align:center}
        .preview-img {margin-top:10px; border-radius:10px}
        .pill {background:#eee; padding:8px 14px; border-radius:999px; cursor:pointer}
        .pill-active {background:#2563eb; color:white}
        .tag-pill {background:#f1f5f9; padding:6px 12px; border-radius:999px; cursor:pointer}
        .section {border-top:1px solid #eee; padding-top:20px}
        .section-title {font-weight:700}
        .avatar {width:40px; height:40px; background:#2563eb; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center}
      `}</style>
    </div>
  );
};

export default EditPostPage;



