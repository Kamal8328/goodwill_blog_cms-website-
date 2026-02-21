import React, { useState, useMemo, useEffect } from "react";
import { Search, Eye, Download, Loader2, ArrowUpDown, X } from "lucide-react";
import api from "../services/api"; 

export default function CounsellingdataPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedClient, setSelectedClient] = useState(null);

  const perPage = 10;

  // ===== FETCH DATA FROM BACKEND =====
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await api.get("/clients");
        setClients(data);
      } catch (error) {
        console.error("Sync Error: Could not fetch from /api/clients", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  // ===== FILTERING & SORTING LOGIC =====
  const processedClients = useMemo(() => {
    let filtered = clients.filter(c =>
      (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.city || "").toLowerCase().includes(search.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key] || "";
      const bValue = b[sortConfig.key] || "";
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [clients, search, sortConfig]);

  const totalPages = Math.ceil(processedClients.length / perPage);
  const visibleClients = processedClients.slice((page - 1) * perPage, page * perPage);

  // ===== CSV EXPORT =====
  const downloadCSV = () => {
    const headers = ["Name", "Email", "Phone", "City", "Date"];
    const rows = processedClients.map(c => [
      `"${c.name}"`, c.email, `"${c.phone}"`, `"${c.city}"`, new Date(c.createdAt).toLocaleDateString()
    ].join(","));
    
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Counselling Leads</h1>
          <p className="text-slate-500 font-medium">Real-time sync with MongoDB</p>
        </div>
        <button onClick={downloadCSV} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-3 rounded-xl shadow-sm hover:bg-slate-50 transition-all font-bold">
          <Download size={18}/> Export CSV
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
        <input
          placeholder="Search by name, email, or city..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-white shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-400 outline-none transition-all"
        />
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center flex flex-col justify-center items-center gap-4 text-slate-400">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
            <p className="font-semibold">Fetching leads from server...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-slate-500 text-[11px] uppercase tracking-widest font-bold">
                <th className="p-5 text-left cursor-pointer hover:text-indigo-600" onClick={() => setSortConfig({ key: 'name', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                  <div className="flex items-center gap-2">Client Name <ArrowUpDown size={12}/></div>
                </th>
                <th className="p-5 text-left">Contact Info</th>
                <th className="p-5 text-left">Location</th>
                <th className="p-5 text-left">Status</th>
                <th className="p-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visibleClients.length === 0 ? (
                <tr><td colSpan="5" className="p-20 text-center text-slate-400">No data found in database.</td></tr>
              ) : (
                visibleClients.map(client => (
                  <tr key={client._id} className="group hover:bg-indigo-50/30 transition-colors">
                    <td className="p-5 font-bold text-slate-700">{client.name}</td>
                    <td className="p-5">
                      <div className="text-slate-600 text-sm font-medium">{client.email}</div>
                      <div className="text-slate-400 text-xs font-mono">{client.phone}</div>
                    </td>
                    <td className="p-5 font-semibold text-slate-600">{client.city}</td>
                    <td className="p-5">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-600 uppercase">New Lead</span>
                    </td>
                    <td className="p-5 text-right">
                      <button onClick={() => setSelectedClient(client)} className="p-2.5 text-slate-400 hover:text-indigo-600 transition-all"><Eye size={18}/></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-8">
        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 disabled:opacity-30 transition-all">Prev</button>
        <p className="text-slate-400 text-sm font-medium">Page {page} of {totalPages || 1}</p>
        <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)} className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 disabled:opacity-30 transition-all">Next</button>
      </div>

      {/* DETAIL MODAL */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setSelectedClient(null)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 text-center relative shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedClient(null)} className="absolute right-6 top-6 text-slate-300 hover:text-slate-600"><X size={24}/></button>
            <div className="w-20 h-20 rounded-3xl bg-indigo-600 text-white text-2xl font-black flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">{selectedClient.name?.[0].toUpperCase()}</div>
            <h2 className="text-2xl font-black text-slate-800 mb-6">{selectedClient.name}</h2>
            <div className="space-y-4 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-slate-600 text-sm"><strong>Email:</strong> <span className="float-right">{selectedClient.email}</span></p>
                <p className="text-slate-600 text-sm"><strong>Phone:</strong> <span className="float-right font-mono">{selectedClient.phone}</span></p>
                <p className="text-slate-600 text-sm"><strong>City:</strong> <span className="float-right">{selectedClient.city}</span></p>
                <hr className="border-slate-200"/>
                <p className="text-slate-400 text-[10px] text-center uppercase tracking-widest mt-2">Captured: {new Date(selectedClient.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}