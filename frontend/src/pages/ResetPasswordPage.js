import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Passwords do not match");

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      alert("Password updated! Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Reset failed. Link may be expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Set New Password</h2>
        


<div className="space-y-4">
  {/* New Password Field */}
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      placeholder="New Password"
      className="w-full p-3 pr-10 border rounded-lg"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
    >
      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  </div>

  {/* Confirm Password Field */}
  <div className="relative mb-6">
    <input
      type={showConfirmPassword ? "text" : "password"}
      placeholder="Confirm New Password"
      className="w-full p-3 pr-10 border rounded-lg"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      required
    />
    <button
      type="button"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
    >
      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  </div>
</div>
        <button
          disabled={loading}
          className="w-full bg-[#2f4fb6] text-white py-3 rounded-lg font-bold hover:bg-[#233d96] transition-all"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}