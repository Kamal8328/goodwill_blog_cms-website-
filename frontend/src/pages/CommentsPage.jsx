import { useState, useEffect } from "react";
import api from "../services/api";
import { Trash2, Loader2 } from "lucide-react";

export default function CommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const { data } = await api.get("/comments");
      setComments(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (id) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">

      <h1 className="text-xl md:text-2xl font-bold mb-6">
        Blog Comments
      </h1>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-4 text-left">Blog</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Address</th>
              <th className="p-4 text-left">Message</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {comments.map((comment) => (
              <tr
                key={comment._id}
                className="border-t hover:bg-gray-50"
              >

                <td className="p-4 font-medium">
                  {comment.blogId?.title}
                </td>

                <td className="p-4">{comment.name}</td>

                <td className="p-4">{comment.email}</td>

                <td className="p-4">{comment.phone}</td>

                <td className="p-4 max-w-xs truncate">
                  {comment.address}
                </td>

                <td className="p-4 max-w-md truncate">
                  {comment.message}
                </td>

                <td className="p-4 text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </td>

                <td className="p-4 text-right">
                  <button
                    onClick={() => deleteComment(comment._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">

        {comments.map((comment) => (

          <div
            key={comment._id}
            className="bg-white p-4 rounded-xl shadow space-y-2"
          >

            <div className="font-semibold text-gray-800">
              {comment.blogId?.title}
            </div>

            <div className="text-sm">
              <strong>Name:</strong> {comment.name}
            </div>

            <div className="text-sm">
              <strong>Email:</strong> {comment.email}
            </div>

            <div className="text-sm">
              <strong>Phone:</strong> {comment.phone}
            </div>

            <div className="text-sm">
              <strong>Address:</strong> {comment.address}
            </div>

            <div className="text-sm">
              <strong>Message:</strong> {comment.message}
            </div>

            <div className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </div>

            <button
              onClick={() => deleteComment(comment._id)}
              className="flex items-center gap-2 text-red-500 pt-2"
            >
              <Trash2 size={16} />
              Delete
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}