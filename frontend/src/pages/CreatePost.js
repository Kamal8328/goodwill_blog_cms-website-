import { useState, useEffect } from "react";
import RichTextEditor from "../components/RichTextEditor";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { FaArrowLeft, FaEye, FaEyeSlash, FaSpinner, FaCloudUploadAlt, FaHashtag, FaImage } from "react-icons/fa";

export default function CreatePost() {
  const navigate = useNavigate();

  // FORM STATE
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tags, setTags] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // UI STATE
  const [isAutoSlug, setIsAutoSlug] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [dbCategories, setDbCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // TOGGLE CATEGORY
  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  // FETCH CATEGORIES
  useEffect(() => {
    const fetchMasterCategories = async () => {
      try {
        const { data } = await api.get("/categories");
        setDbCategories(data || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err.response?.data || err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchMasterCategories();
  }, []);

  // AUTO-GENERATE SLUG
  useEffect(() => {
    if (!isAutoSlug || !title.trim()) return;
    const generated = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generated);
  }, [title, isAutoSlug]);

  // SEO Helpers
  const countWords = (str) => (!str ? 0 : str.trim().split(/\s+/).filter(Boolean).length);
  const getCountColor = (count, limit) => count > limit ? "text-red-500 font-bold" : "text-emerald-500 font-medium";

  // IMAGE HANDLER
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };
  

  // PUBLISH / SAVE POST
  const handlePublish = async (statusType) => {
    const token = localStorage.getItem("token")
    if(!token){
      alert("You must be logged in to create a post.")
      navigate("/login")
    }
    if (!title.trim()) return alert("Title is required!");
    if (selectedCategories.length === 0) return alert("Please select at least one category!");

    setLoading(true);
    setLoadingMessage(statusType === "Published" ? "Publishing Post..." : "Saving Draft...");

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("slug", slug.trim());
      formData.append("content", content);
      formData.append("excerpt", excerpt.trim());
      formData.append("status", statusType);

      selectedCategories.forEach(id => formData.append("categories", id));

      const tagArray = tags.split(",").map(t => t.trim()).filter(Boolean);
      formData.append("tags", JSON.stringify(tagArray));

      formData.append("metaTitle", metaTitle.trim());
      formData.append("metaDescription", metaDesc.trim());

      if (featuredImage) formData.append("featuredImage", featuredImage);
      console.log(featuredImage);
      

      await api.post("/posts", formData, { headers: { 
        "Content-Type": "multipart/form-data" ,
        "Authorisation": `Bearer ${token}`
      } });

      alert(`Post ${statusType.toLowerCase()} successfully!`);
      navigate("/blogpost");
       console.log(formData);
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong. Please try again.";
      alert("Error: " + message);
      console.error(err);
    } finally {
      setLoading(false);
    }

   
    

    
    
  };



  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans relative">
      {/* LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-blue-100 text-center">
            <FaSpinner className="animate-spin text-3xl text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-800">{loadingMessage}</h3>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaArrowLeft className="text-gray-500" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Create New Post</h1>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setShowPreview(!showPreview)} 
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-gray-200 transition-all"
          >
            {showPreview ? <FaEyeSlash /> : <FaEye />} Preview
          </button>
          <button 
            onClick={() => handlePublish("Draft")} 
            className="px-4 py-2 text-slate-500 font-bold hover:text-slate-800 transition-colors"
          >
            Save Draft
          </button>
          <button 
            onClick={() => handlePublish("Published")} 
            disabled={loading}
            className="bg-[#253E90] hover:bg-blue-800 text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-blue-900/10 flex items-center gap-2 transition-all active:scale-95"
          >
            <FaCloudUploadAlt /> Publish
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className={`grid gap-8 transition-all duration-500 ${showPreview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 max-w-4xl mx-auto"}`}>
          
          {/* EDITOR COLUMN */}
          <div className="space-y-8">
            {/* TITLE + SLUG */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Article Title</label>
              <input 
                className="w-full text-2xl font-black outline-none border-b-2 border-transparent focus:border-blue-100 transition-all" 
                placeholder="Enter title here..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="mt-4 flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-50 p-2 rounded-lg">
                <span className="shrink-0">/blog/</span>
                <input 
                  className="bg-transparent outline-none w-full text-blue-600" 
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setIsAutoSlug(false);
                  }}
                />
              </div>
            </div>

            {/* FEATURED IMAGE */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Featured Image</label>
              <div 
                onClick={() => document.getElementById('file-upload')?.click()}
                className="group relative aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all overflow-hidden"
              >
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="text-center">
                    <FaImage className="mx-auto text-4xl text-slate-200 mb-2" />
                    <p className="text-sm font-bold text-slate-400">Click to upload cover photo</p>
                  </div>
                )}
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                />
              </div>
            </div>

            {/* RICH EDITOR */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
              <RichTextEditor value={content} onChange={setContent} />
            </div>

            {/* CATEGORIES */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-4 tracking-widest">
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {dbCategories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => toggleCategory(cat._id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      selectedCategories.includes(cat._id)
                        ? "bg-[#253E90] text-white border-[#253E90] shadow-md"
                        : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
                {categoriesLoading && (
                <span className="text-xs text-slate-400 italic">Loding categories...</span>
                )}
                {!categoriesLoading && dbCategories.length === 0 && (
                <span className="text-xs text-red-400 italic">No categories found</span>
                )}
              </div>
            </div>


            {/* TAGS – now correctly outside categories */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-3">Tags</label>
              <div className="relative">
                <FaHashtag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  className="w-full bg-slate-50 p-4 pl-10 rounded-xl outline-none text-sm font-medium"
                  placeholder="visa, guide, travel, budget..."
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-800 border-b pb-4">SEO Settings</h3>
              <div>
                <div className="flex justify-between text-[10px] mb-2 font-black uppercase text-slate-400">
                  <span>Meta Title</span>
                  <div className="flex gap-2">
                    <span className={getCountColor(metaTitle.length, 60)}>{metaTitle.length}/60</span>
                    <span>{countWords(metaTitle)} words</span>
                  </div>
                </div>
                <input 
                  className="w-full p-4 bg-slate-50 rounded-xl outline-none text-sm font-bold border border-transparent focus:border-blue-100" 
                  value={metaTitle} 
                  onChange={(e) => setMetaTitle(e.target.value)} 
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-2 font-black uppercase text-slate-400">
                  <span>Meta Description</span>
                  <div className="flex gap-2">
                    <span className={getCountColor(metaDesc.length, 160)}>{metaDesc.length}/160</span>
                    <span>{countWords(metaDesc)} words</span>
                  </div>
                </div>
                <textarea 
                  className="w-full p-4 bg-slate-50 rounded-xl outline-none text-sm h-24 resize-none border border-transparent focus:border-blue-100" 
                  value={metaDesc} 
                  onChange={(e) => setMetaDesc(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* PREVIEW COLUMN */}
          {showPreview && (
            <div className="bg-white border rounded-[3rem] shadow-2xl h-fit sticky top-28 p-10 overflow-hidden border-slate-100">
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategories.length > 0 ? (
                  selectedCategories.map(id => {
                    const cat = dbCategories.find(c => c._id === id);
                    return cat ? (
                      <span 
                        key={id} 
                        className="bg-blue-50 text-[#253E90] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest"
                      >
                        {cat.name}
                      </span>
                    ) : null;
                  })
                ) : (
                  <span className="text-[10px] text-slate-300 italic uppercase">Uncategorized</span>
                )}
              </div>

              <h1 className="text-4xl font-black text-slate-900 leading-tight mb-4">
                {title.trim() || "Untitled Post"}
              </h1>

              {tags.trim() && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {tags.split(',').map((tag, i) => {
                    const trimmed = tag.trim();
                    return trimmed ? (
                      <span 
                        key={i} 
                        className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md flex items-center gap-1 font-bold"
                      >
                        <FaHashtag size={8} className="text-blue-400" /> {trimmed}
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              <div className="mb-8">
                {preview ? (
                  <img 
                    src={preview} 
                    className="w-full rounded-2xl shadow-lg object-cover max-h-[400px]" 
                    alt="Cover" 
                  />
                ) : (
                  <div className="w-full h-64 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
                    <FaImage size={40} className="mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No Image Provided</p>
                  </div>
                )}
              </div>
              
              <div 
                className="prose prose-slate max-w-none prose-headings:font-black prose-p:text-slate-600"
                dangerouslySetInnerHTML={{ __html: content || "<i>Post content preview...</i>" }} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}