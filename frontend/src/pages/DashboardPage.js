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
  <div className="bg-[#f8fafc] min-h-screen p-4 sm:p-6 lg:p-10">
    
    {/* Title */}
    <h1 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-10">
      Dashboard
    </h1>

    {/* STATS */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
      <StatCard icon={FileText} color="bg-blue-600" title="Total Posts" value={stats.totalPosts}/>
      <StatCard icon={CheckCircle} color="bg-green-600" title="Published" value={stats.publishedPosts}/>
      <StatCard icon={Edit3} color="bg-orange-500" title="Drafts" value={stats.draftPosts}/>
      <StatCard icon={Calendar} color="bg-purple-600" title="Scheduled" value={stats.scheduledPosts}/>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">

      {/* RECENT ACTIVITY */}
      <div className="xl:col-span-2 bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
          <h2 className="text-lg sm:text-xl font-black">
            Recent Activity
          </h2>

          <button
            onClick={() => navigate("/blogpost")}
            className="text-sm font-bold text-blue-600 hover:underline self-start sm:self-auto"
          >
            View All
          </button>
        </div>

        {recentPosts.length === 0 ? (
          <p className="text-gray-400 text-sm">No recent posts available.</p>
        ) : (
          recentPosts.map(post => (
            <div
              key={post._id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-xl sm:rounded-2xl mb-3"
            >
              {/* Left Content */}
              <div>
                <h3 className="font-bold text-sm sm:text-base">
                  {post.title}
                </h3>

                <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1">
                  <span>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>

                  <span className="flex items-center gap-1">
                    <Eye size={14}/> {post.views} views
                  </span>
                </div>
              </div>

              {/* Right Content */}
              <div className="flex items-center gap-3 sm:gap-4 justify-between sm:justify-end">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor(post.status)}`}>
                  {post.status}
                </span>

                <Pencil
                  size={16}
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => navigate(`/edit/${post._id}`)}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="space-y-6">

        {/* CREATE */}
        <div className="bg-[#253E90] text-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl">
          <Plus size={26} className="mb-4" />
          <h2 className="text-lg sm:text-xl font-bold">
            Create New Post
          </h2>
          <p className="text-blue-100 text-sm mb-6">
            Start writing your next blog article
          </p>

          <button
            onClick={() => navigate("/create")}
            className="bg-white text-[#253E90] w-full py-3 rounded-xl font-bold hover:scale-[1.02] transition"
          >
            New Post
          </button>
        </div>

        {/* QUICK STATS */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border">
          <h2 className="font-bold mb-6 text-sm sm:text-base">
            Quick Stats
          </h2>

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
  <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border">
    <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white rounded-xl ${color}`}>
      <Icon size={20} />
    </div>

    <h2 className="text-xl sm:text-2xl font-black mt-4">
      {value || 0}
    </h2>

    <p className="text-xs text-gray-400 uppercase">
      {title}
    </p>
  </div>
);

const QuickRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 py-2 border-b last:border-b-0">
    
    {/* Label */}
    <span className="text-gray-500 text-sm sm:text-base truncate">
      {label}
    </span>

    {/* Value */}
    <span className="font-bold text-sm sm:text-base whitespace-nowrap">
      {value || 0}
    </span>

  </div>
);
