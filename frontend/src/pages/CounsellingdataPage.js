import React, { useState, useMemo, useEffect } from "react";
import { Search, Eye, Download, Loader2, ArrowUpDown, X } from "lucide-react";
import api from "../services/api";

export default function CounsellingdataPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [selectedClient, setSelectedClient] = useState(null);

  const perPage = 10;

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await api.get("/clients");
        setClients(data);
      } catch (error) {
        console.error("Sync Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const processedClients = useMemo(() => {
    let filtered = clients.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.city || "").toLowerCase().includes(search.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key] || "";
      const bValue = b[sortConfig.key] || "";
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [clients, search, sortConfig]);

  const totalPages = Math.ceil(processedClients.length / perPage);
  const visibleClients = processedClients.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const downloadCSV = () => {
    const headers = ["Name", "Email", "Phone", "City", "Date"];
    const rows = processedClients.map((c) =>
      [
        `"${c.name}"`,
        c.email,
        `"${c.phone}"`,
        `"${c.city}"`,
        new Date(c.createdAt).toLocaleDateString(),
      ].join(",")
    );

    const blob = new Blob(
      [[headers.join(","), ...rows].join("\n")],
      { type: "text/csv" }
    );
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 bg-[#f8fafc] min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Counselling Leads
          </h1>
          <p className="text-slate-500 text-sm">
            Real-time sync with MongoDB
          </p>
        </div>

        <button
          onClick={downloadCSV}
          className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-3 rounded-xl shadow-sm hover:bg-slate-50 transition font-semibold text-sm"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative mb-6">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
        />
        <input
          placeholder="Search by name, email, or city..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-400 outline-none text-sm"
        />
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <Loader2 className="animate-spin text-indigo-600 mx-auto" size={40} />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr className="text-slate-500 text-xs uppercase font-bold">
                <th className="p-5 text-left">Client</th>
                <th className="p-5 text-left">Contact</th>
                <th className="p-5 text-left">City</th>
                <th className="p-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleClients.map((client) => (
                <tr key={client._id} className="hover:bg-indigo-50">
                  <td className="p-5 font-semibold">{client.name}</td>
                  <td className="p-5 text-sm text-slate-600">
                    {client.email}
                    <div className="text-xs text-slate-400">
                      {client.phone}
                    </div>
                  </td>
                  <td className="p-5">{client.city}</td>
                  <td className="p-5 text-right">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="p-2 text-slate-400 hover:text-indigo-600"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4">
        {visibleClients.map((client) => (
          <div
            key={client._id}
            className="bg-white rounded-2xl shadow-md p-5 border border-slate-100"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-800">
                  {client.name}
                </h3>
                <p className="text-sm text-slate-500">
                  {client.email}
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  {client.phone}
                </p>
                <p className="text-sm mt-2 text-slate-600">
                  📍 {client.city}
                </p>
              </div>
              <button
                onClick={() => setSelectedClient(client)}
                className="p-2 text-slate-400 hover:text-indigo-600"
              >
                <Eye size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-6 py-2 bg-white border rounded-xl text-sm font-semibold disabled:opacity-40"
        >
          Prev
        </button>

        <p className="text-slate-500 text-sm">
          Page {page} of {totalPages || 1}
        </p>

        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage(page + 1)}
          className="px-6 py-2 bg-white border rounded-xl text-sm font-semibold disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {/* MODAL */}
      {selectedClient && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedClient(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedClient(null)}
              className="absolute right-6 top-6 text-slate-400"
            >
              <X size={22} />
            </button>

            <h2 className="text-xl font-bold mb-4">
              {selectedClient.name}
            </h2>

            <div className="space-y-3 text-sm text-slate-600">
              <p><strong>Email:</strong> {selectedClient.email}</p>
              <p><strong>Phone:</strong> {selectedClient.phone}</p>
              <p><strong>City:</strong> {selectedClient.city}</p>
              <p className="text-xs text-slate-400 mt-4">
                Captured: {new Date(selectedClient.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}