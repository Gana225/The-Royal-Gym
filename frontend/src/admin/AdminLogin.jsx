import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Loader2, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../api/axios";
import { saveTokens } from "../api/auth"; 


export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const resp = await api.post("/token/", { username, password });
      const data = resp.data;
      saveTokens(data);
      setAuthToken(data.access);
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Authentication failed. Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  }

  // Staggered Animation Variants for a premium feel
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 10 }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans">
      
      {/* --- Premium Background Effects --- */}
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Top Light Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[440px] relative z-10 mx-4"
      >
        {/* --- Main Card --- */}
        <div className="relative group">
          {/* Animated Gradient Border Glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative p-8 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
            
            {/* Header Section */}
            <motion.div variants={itemVariants} className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-blue-600 mb-6 shadow-lg shadow-purple-500/20">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Admin Portal</h2>
              <p className="text-slate-300 text-base font-medium">Please sign in to continue</p>
            </motion.div>

            <form onSubmit={submit} className="space-y-6">
              
              {/* Username Field */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-sm font-bold text-purple-300 uppercase tracking-wide ml-1">
                  Username
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-white transition-colors duration-300" />
                  <input 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    placeholder="Enter your username" 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white placeholder-slate-500 font-medium transition-all duration-300 hover:border-slate-600"
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-purple-300 uppercase tracking-wide">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-white transition-colors duration-300" />
                  <input 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-950/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white placeholder-slate-500 font-medium transition-all duration-300 hover:border-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button 
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-purple-500/20 flex items-center justify-center gap-3 transition-all duration-300
                  ${isLoading 
                    ? 'bg-slate-800 cursor-not-allowed text-slate-400' 
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 hover:shadow-purple-500/40 border border-white/10'}
                `}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="tracking-wide">AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <span className="tracking-wide">SIGN IN DASHBOARD</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer */}
            <motion.div variants={itemVariants} className="mt-8 text-center">
              <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3" />
                256-bit SSL Encrypted Connection
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}