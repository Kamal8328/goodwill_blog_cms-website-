import React, { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import { Upload, Search, Copy, Trash2, Loader2, CheckCircle } from "lucide-react";

export default function MediaLibraryPage() {
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await api.get("/media");
      const data = res.data?.data || res.data || [];
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setProcessing(true);
      const res = await api.post("/media", formData);
      const newFile = res.data?.data || res.data;
      setFiles((prev) => [newFile, ...prev]);
      e.target.value = null; 
    } catch (error) {
      alert("Upload failed. Ensure you are logged in and file is under 5MB.");
    } finally {
      setProcessing(false);
    }
  };

  const deleteFile = async (id) => {
    if (!window.confirm("Permanently delete this file?")) return;
    try {
      await api.delete(`/media/${id}`);
      setFiles((prev) => prev.filter((file) => file._id !== id));
    } catch (err) {
      alert("Delete failed. Token might be expired.");
    }
  };

  const copyToClipboard = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const filteredFiles = useMemo(() => {
    return files.filter((file) =>
      file.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);

  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-slate-900">Media Library</h1>
        <label className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all cursor-pointer ${
          processing ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}>
          {processing ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
          {processing ? "Uploading..." : "Upload Files"}
          <input type="file" onChange={handleUpload} className="hidden" disabled={processing} />
        </label>
      </div>

      <div className="relative mb-8 max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-white"
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredFiles.map((file) => (
            <div key={file._id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 group">
              <div className="relative h-48 rounded-xl overflow-hidden mb-3">
                <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
              </div>
              <p className="text-sm font-bold text-slate-700 truncate mb-4">{file.name}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => copyToClipboard(file.url, file._id)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    copySuccess === file._id ? "bg-green-100 text-green-600" : "bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  {copySuccess === file._id ? <CheckCircle size={14} /> : <Copy size={14} />}
                  {copySuccess === file._id ? "Copied" : "Copy URL"}
                </button>
                <button 
                  onClick={() => deleteFile(file._id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}