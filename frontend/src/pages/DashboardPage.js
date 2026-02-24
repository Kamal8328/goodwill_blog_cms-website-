import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  FileText,
  CheckCircle,
  Edit3,
  Calendar,
  Plus,
  Pencil,
  Eye,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({});
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/analytics/dashboard");
        setStats(res.data.stats);
        setRecentPosts(res.data.recentPosts);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  const statusColor = status => {
    if (status === "Published") return "bg-green-100 text-green-600";
    if (status === "Draft") return "bg-orange-100 text-orange-600";
    return "bg-purple-100 text-purple-600";
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen p-10">
      <h1 className="text-3xl font-black mb-10">Dashboard</h1>

      {/* STATS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={FileText} color="bg-blue-600" title="Total Posts" value={stats.totalPosts}/>
        <StatCard icon={CheckCircle} color="bg-green-600" title="Published" value={stats.publishedPosts}/>
        <StatCard icon={Edit3} color="bg-orange-500" title="Drafts" value={stats.draftPosts}/>
        <StatCard icon={Calendar} color="bg-purple-600" title="Scheduled" value={stats.scheduledPosts}/>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* RECENT ACTIVITY */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border">
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-black">Recent Activity</h2>
            <button
    onClick={() => navigate("/blogpost")}
    className="text-sm font-bold text-blue-600 hover:underline"
  >
    View All
  </button>
          </div>

          {recentPosts.map(post => (
            <div key={post._id} className="flex justify-between items-center p-4 border rounded-2xl mb-3">
              <div>
                <h3 className="font-bold">{post.title}</h3>
                <div className="flex gap-4 text-xs text-gray-400 mt-1">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1">
                    <Eye size={14}/> {post.views} views
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor(post.status)}`}>
                  {post.status}
                </span>
                <Pencil size={16} className="cursor-pointer"
                  onClick={() =>navigate(`/edit/${post._id}`)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">

          {/* CREATE */}
          <div className="bg-[#253E90] text-white p-8 rounded-3xl">
            <Plus size={30} className="mb-4" />
            <h2 className="text-xl font-bold">Create New Post</h2>
            <p className="text-blue-100 mb-6">Start writing your next blog article</p>
            <button
              onClick={() => navigate("/create")}
              className="bg-white text-[#253E90] w-full py-3 rounded-xl font-bold"
            >
              New Post
            </button>
          </div>

          {/* QUICK STATS */}
          <div className="bg-white p-8 rounded-3xl border">
            <h2 className="font-bold mb-6">Quick Stats</h2>
            <QuickRow label="Categories" value={stats.categoriesCount}/>
            <QuickRow label="Tags" value={stats.tagsCount}/>
            <QuickRow label="Media Files" value={stats.mediaCount}/>
            <QuickRow label="Total Views" value={stats.totalViews}/>
          </div>

        </div>
      </div>
    </div>
  );
}

const StatCard = ({ icon: Icon, color, title, value }) => (
  <div className="bg-white p-6 rounded-3xl border">
    <div className={`w-12 h-12 flex items-center justify-center text-white rounded-xl ${color}`}>
      <Icon size={22} />
    </div>
    <h2 className="text-2xl font-black mt-4">{value || 0}</h2>
    <p className="text-xs text-gray-400 uppercase">{title}</p>
  </div>
);

const QuickRow = ({ label, value }) => (
  <div className="flex justify-between mb-3 text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="font-bold">{value || 0}</span>
  </div>
);
