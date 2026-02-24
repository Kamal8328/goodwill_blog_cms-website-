import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api'; 
import { Search, Filter, Calendar, Clock, Tag, X, ChevronLeft, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  
  const resultsRef = useRef(null); // For scroll behavior

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [postsRes, catsRes] = await Promise.all([
        api.get('/posts'),
        api.get('/categories')
      ]);
      setBlogs(Array.isArray(postsRes.data) ? postsRes.data : []);
      setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Backend server unreachable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Behavior Fix: Scroll to results when category changes
  const handleCategoryChange = (slug) => {
    setActiveCategory(slug);
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 1. Updated Selection Logic
const handleOpenBlog = (blog) => {
  setSelectedBlog(blog);
  // This changes the URL to /blogs/your-slug without reloading
  window.history.pushState(null, '', `/blogs/${blog.slug}`);
};

const handleCloseBlog = () => {
  setSelectedBlog(null);
  // This resets the URL back to /blogs when modal closes
  window.history.pushState(null, '', '/blogs');
};

// 2. Add deep-linking support
// This ensures if someone refreshes on a slug, the modal opens automatically
useEffect(() => {
  const path = window.location.pathname;
  if (path.includes('/blogs/') && blogs.length > 0) {
    const slug = path.split('/').pop();
    const foundBlog = blogs.find(b => b.slug === slug);
    if (foundBlog) setSelectedBlog(foundBlog);
  }
}, [blogs]);

  const getImageUrl = (blog) => {
    const path = blog.featuredImage?.url;
    if (!path) return 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?q=80&w=1000&auto=format&fit=crop';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${path}`;
  };

  // Robust Filtering Logic
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === "All" || 
      blog.categories?.some(cat => {
        // We check slug first, then fallback to name if slug wasn't populated
        const catSlug = typeof cat === 'object' ? cat.slug : null;
        const catName = typeof cat === 'object' ? cat.name : null;
        return catSlug === activeCategory || catName === activeCategory;
      });

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50/30 font-sans pb-20 text-gray-900">
      <header className="bg-[#0a328a] text-white pt-24 pb-44 relative overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <nav className="text-blue-200 text-sm mb-3">Home › Blogs</nav>
          <h1 className="text-6xl font-black mb-6 tracking-tight italic">Insights</h1>
          <div className="w-20 h-1.5 bg-white mx-auto rounded-full"></div>
        </div>
      </header>

      <main className="container mx-auto px-6 -mt-28 relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 border border-gray-100 mb-12">
          <div className="flex items-center gap-4 px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus-within:ring-4 ring-blue-500/10 transition-all mb-8">
            <Search className="text-gray-400" size={24} />
            <input 
              type="text" 
              placeholder="Search articles..." 
              className="w-full bg-transparent outline-none text-lg text-gray-800 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleCategoryChange("All")}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeCategory === "All" 
                ? "bg-[#0a328a] text-white shadow-xl scale-105" 
                : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-100"
              }`}
            >
              All Articles ({blogs.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                  activeCategory === cat.slug 
                  ? "bg-[#0a328a] text-white shadow-xl scale-105" 
                  : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-100"
                }`}
              >
                {cat.name}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                  activeCategory === cat.slug ? "bg-blue-800 text-blue-100" : "bg-gray-100 text-gray-400"
                }`}>
                  {cat.postCount}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div ref={resultsRef} className="flex items-center gap-3 mb-10 border-b border-gray-200 pb-5">
          <Tag className="text-[#0a328a] rotate-90" size={28} />
          <h2 className="text-3xl font-black">
            {activeCategory === "All" ? "All Articles" : activeCategory.replace('-', ' ')}
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-blue-700">
            <Loader2 className="animate-spin mb-4" size={50} />
            <p className="font-bold tracking-widest uppercase text-xs text-gray-400">Loading...</p>
          </div>
        ) : error ? (
          <div className="bg-white border border-red-100 p-12 rounded-[2.5rem] text-center max-w-2xl mx-auto shadow-xl">
            <AlertCircle className="mx-auto text-red-500 mb-6" size={64} />
            <h3 className="text-2xl font-black text-gray-900 mb-2">Error</h3>
            <p className="text-gray-500 mb-8">{error}</p>
            <button onClick={fetchData} className="bg-[#0a328a] text-white px-10 py-4 rounded-2xl font-bold">Retry</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredBlogs.map((blog) => (
  <BlogCard 
    key={blog._id} 
    blog={blog} 
    onClick={() => handleOpenBlog(blog)} // Pass the whole blog here
    imageUrl={getImageUrl(blog)}
  />
))}
          </div>
        )}
      </main>

      {selectedBlog && <DetailOverlay blog={selectedBlog} onClose={() => setSelectedBlog(null)} imageUrl={getImageUrl(selectedBlog)} />}
    </div>
  );
};

const BlogCard = ({ blog, onClick, imageUrl }) => (
  <div onClick={onClick} className="bg-white rounded-[2.5rem] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col cursor-pointer group hover:-translate-y-2">
    <div className="relative h-72 w-full overflow-hidden">
      <img src={imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
    </div>
    <div className="p-8 flex flex-col flex-grow">
      <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
        {blog.categories?.[0]?.name || "Article"}
      </span>
      <h3 className="text-2xl font-extrabold text-gray-900 mb-4 leading-tight group-hover:text-[#0a328a] transition-colors line-clamp-2 italic">
        {blog.title}
      </h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
        {blog.description || "Read more about our latest updates..."}
      </p>
      <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between text-gray-400 text-[10px] font-bold uppercase tracking-widest">
        <div className="flex items-center gap-2"><Calendar size={14} className="text-blue-500" /><span>{new Date(blog.createdAt).toLocaleDateString()}</span></div>
        <div className="flex items-center gap-2"><Clock size={14} className="text-blue-500" /><span>6 Min Read</span></div>
      </div>
    </div>
  </div>
);

const DetailOverlay = ({ blog, onClose, imageUrl }) => (
  <div className="fixed inset-0 z-[100] flex flex-col bg-white animate-in fade-in zoom-in-95 duration-300">
    {/* Full Screen Header */}
    <div className="sticky top-0 bg-white/95 backdrop-blur-md z-30 p-6 border-b border-gray-100 flex items-center justify-between">
      <button onClick={onClose} className="flex items-center gap-2 text-[#0a328a] font-black text-sm uppercase tracking-widest group">
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to Insights
      </button>
      <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
        <X size={32} className="text-gray-400 group-hover:text-red-500 transition-colors" />
      </button>
    </div>

    {/* Scrollable Content Area */}
    <div className="flex-grow overflow-y-auto">
      {/* Immersive Hero Header */}
      <div className="relative w-full h-[60vh] min-h-[500px]">
        <img src={imageUrl} className="w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end">
          <div className="container mx-auto px-6 pb-16 max-w-5xl text-white">
            <span className="bg-[#0a328a] px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 inline-block shadow-xl">
              {blog.category?.name || "Resource Guide"}
            </span>
            <h1 className="text-5xl md:text-8xl font-black leading-tight tracking-tighter mb-4">{blog.title}</h1>
            <div className="flex items-center gap-4 text-blue-200 font-bold uppercase text-xs tracking-widest">
               <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
               <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
               <span>6 Min Read</span>
            </div>
          </div>
        </div>
      </div>

      <article className="container mx-auto px-6 py-16 max-w-4xl">
        {/* Content Body */}
        <div 
          className="prose prose-xl prose-blue max-w-none text-gray-700 leading-relaxed font-light first-letter:text-8xl first-letter:font-black first-letter:text-[#0a328a] first-letter:mr-4 first-letter:float-left"
          dangerouslySetInnerHTML={{ __html: blog.content }} 
        />

        {/* --- DOORSTEP COUNSELLING CTA --- */}
        <div className="mt-24 p-12 bg-gradient-to-br from-blue-700 to-[#0a328a] rounded-[3rem] shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">Expert Guidance <br/>at Your Doorstep.</h2>
            <p className="text-blue-100 text-lg opacity-90 max-w-md">Book a personalized 1-on-1 counseling session in the comfort of your home.</p>
          </div>
          <button className="bg-white text-[#0a328a] px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
            Book Counselling
          </button>
        </div>

        <div className="mt-20 text-center pb-20">
           <button onClick={onClose} className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.4em] hover:text-[#0a328a]">
             Close Article
           </button>
        </div>
      </article>
    </div>
  </div>
);
export default BlogPage;