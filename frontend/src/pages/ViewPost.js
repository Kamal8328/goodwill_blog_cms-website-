import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { FaArrowLeft, FaSpinner } from "react-icons/fa";

export default function ViewPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [relatedByCategory, setRelatedByCategory] = useState([]);
  const [relatedByTags, setRelatedByTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/posts/${id}`);
        setPost(data);

        // Fetch related by first category
        if (data.categories?.length > 0) {
          const categoryId =
            typeof data.categories[0] === "object"
              ? data.categories[0]._id
              : data.categories[0];

          const res = await api.get(`/posts?category=${categoryId}`);
          setRelatedByCategory(
            res.data.filter((p) => p._id !== id).slice(0, 3)
          );
        }

        // Fetch related by first tag
        if (data.tags?.length > 0) {
          const firstTag = Array.isArray(data.tags)
            ? data.tags[0]
            : data.tags.split(",")[0];

          const res = await api.get(`/posts?tag=${firstTag}`);
          setRelatedByTags(
            res.data.filter((p) => p._id !== id).slice(0, 3)
          );
        }

      } catch (err) {
        console.error("Fetch error:", err);
        navigate("/blogpost");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-3xl text-blue-600" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-200 rounded-full"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">View Post</h1>
      </div>

      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow space-y-8">

        {/* Title */}
        <h2 className="text-4xl font-bold">{post.title}</h2>

        {/* Featured Image */}
        {post.featuredImage?.url && (
          <img
            src={post.featuredImage.url}
            alt="Featured"
            className="w-full h-96 object-cover rounded-xl"
          />
        )}

        {/* Content */}
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Categories */}
        {post.categories?.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-3">Categories</h3>
            <div className="flex gap-3 flex-wrap">
              {post.categories.map((cat) => (
                <span
                  key={typeof cat === "object" ? cat._id : cat}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg"
                >
                  {typeof cat === "object" ? cat.name : cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {post.tags && (
          <div>
            <h3 className="font-semibold text-lg mb-3">Tags</h3>
            <div className="flex gap-3 flex-wrap">
              {Array.isArray(post.tags)
                ? post.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg"
                    >
                      #{tag}
                    </span>
                  ))
                : post.tags}
            </div>
          </div>
        )}

        {/* ================= RELATED BY CATEGORY ================= */}
        {relatedByCategory.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-4">
              Related by Category
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              {relatedByCategory.map((item) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/posts/view/${item._id}`)}
                  className="bg-gray-50 p-5 rounded-xl shadow hover:shadow-lg cursor-pointer transition"
                >
                  {item.featuredImage?.url && (
                    <img
                      src={item.featuredImage.url}
                      alt=""
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h4 className="font-semibold text-lg">
                    {item.title}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= RELATED BY TAG ================= */}
        {relatedByTags.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-4">
              Related by Tag
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              {relatedByTags.map((item) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/posts/view/${item._id}`)}
                  className="bg-gray-50 p-5 rounded-xl shadow hover:shadow-lg cursor-pointer transition"
                >
                  {item.featuredImage?.url && (
                    <img
                      src={item.featuredImage.url}
                      alt=""
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h4 className="font-semibold text-lg">
                    {item.title}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
