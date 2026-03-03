import React, { useState } from "react";
import api from "../services/api";
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import logo from "../assets/gw.png";


export default function LoginPage() {
  const navigate =useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      navigate("/dashboard")
    } catch (err) {
      alert(err.response?.data?.message || "Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-black flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Abstract Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10">
        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl shadow-black">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-[#253E90] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
              <img src={logo} alt="Logo"/>
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">GOODWILL</h1>
            <p className="text-slate-400 mt-2 font-medium">Admin Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                <input 
                  type="email" 
                  className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl font-black outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                <input 
    type={showPassword ? "text" : "password"} // Dynamic type
    className="w-full bg-white/5 border border-white/10 p-4 pl-12 pr-12 rounded-2xl font-black outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
    placeholder="••••••••"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />
  
  {/* Toggle Button */}
  <button
    type="button" // Important: prevents form submission on click
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-4 top-1/2 -translate-y-1/2  hover:text-slate-40"
  >
    {showPassword ? (
      <EyeOff size={20} />
    ) : (
      <Eye size={20} />
    )}
  </button>
              </div>
              <p className="mt-2 text-base text-slate-400 text-center">
  <span
    className="text-blue-500 cursor-pointer font-semibold hover:border-b-2 hover:border-white"
    onClick={() => navigate("/forgot-password")}
  >
    Forgot password?
  </span>
</p>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-[#253E90] hover:bg-blue-700 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Login to Dashboard <ArrowRight size={20} /></>}
            </button>
          </form>
        </div>
      </div>
      

    </div>
  );
}