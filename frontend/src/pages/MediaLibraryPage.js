import React, { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import { Upload, Search, Copy, Trash2 } from "lucide-react";

export default function MediaLibraryPage() {
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await api.get("/media");
      setFiles(res.data);
    } catch (err) {
      console.error("Fetch failed");
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
      const res = await api.post("/media", formData);
      setFiles((prev) => [res.data, ...prev]);
    } catch (error) {
      alert("Upload failed");
    }
  };

  const deleteFile = async (id) => {
    if (!window.confirm("Delete this file?")) return;

    await api.delete(`/media/${id}`);
    fetchMedia();
  };

  const filteredFiles = useMemo(() => {
    return files.filter((file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);

  return (
    <div className="p-10">
      <div className="flex justify-between mb-6">
        <input
          type="file"
          onChange={handleUpload}
          className="border p-2"
        />

        <input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2"
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {filteredFiles.map((file) => (
            <div key={file._id} className="border p-4 rounded">
              <img
                src={file.url}
                alt=""
                className="h-40 w-full object-cover"
              />
              <p className="text-sm mt-2">{file.name}</p>

              <div className="flex justify-between mt-3">
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(file.url)
                  }
                >
                  <Copy size={16} />
                </button>

                <button onClick={() => deleteFile(file._id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}