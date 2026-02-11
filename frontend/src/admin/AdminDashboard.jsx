import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you use react-router
import { 
  Settings, 
  Radio, 
  Image as ImageIcon, 
  Calendar, 
  LogOut, 
  Activity, 
  Users, 
  TrendingUp, 
  Bell,
  ChevronRight
} from 'lucide-react';
import {logout} from "../api/auth";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live Clock Effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Logout Handler (Placeholder)
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("authToken");
        navigate("/login");
    }
  };

  // Dashboard Main Actions
  const actions = [
    { 
      title: "Edit Site Info", 
      icon: Settings, 
      path: "/admin/edit", 
      color: "text-blue-400", 
      gradient: "from-blue-500/20 to-blue-600/5",
      border: "group-hover:border-blue-500/50",
      desc: "Manage global settings, contact details, and pricing plans." 
    },
    { 
      title: "Post Live Update", 
      icon: Radio, 
      path: "/admin/live-updates", 
      color: "text-rose-400", 
      gradient: "from-rose-500/20 to-rose-600/5",
      border: "group-hover:border-rose-500/50",
      desc: "Broadcast real-time alerts or announcements to the homepage." 
    },
    { 
      title: "Gallery Manager", 
      icon: ImageIcon, 
      path: "/admin/gallery-management", 
      color: "text-purple-400", 
      gradient: "from-purple-500/20 to-purple-600/5",
      border: "group-hover:border-purple-500/50",
      desc: "Upload, organize, and delete gym photos and videos." 
    },
    { 
      title: "Event Manager", 
      icon: Calendar, 
      path: "/admin/events", 
      color: "text-emerald-400", 
      gradient: "from-emerald-500/20 to-emerald-600/5",
      border: "group-hover:border-emerald-500/50",
      desc: "Schedule workshops, competitions, and special classes." 
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      
      {/* --- Top Navigation Bar --- */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity className="text-slate-950 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Royal Gym</h1>
              <span className="text-xs text-emerald-400 font-medium tracking-wider uppercase">Admin Console</span>
            </div>
          </div>

          {/* Right Side: Clock & Profile */}
          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
              <p className="text-2xl font-bold text-white leading-none">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
                {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
            
            <div className="h-8 w-px bg-slate-800 hidden md:block"></div>

            <button 
              onClick={()=>{logout()}}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all duration-300 group"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* --- Main Dashboard Content --- */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Welcome Section */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h2 className="text-4xl font-extrabold text-white mb-2">Dashboard Overview</h2>
            <p className="text-slate-400 text-lg">Select a module below to manage your digital presence.</p>
          </div>
          
          {/* Quick Stats (Static Placeholders for "Premium" feel) */}
          <div className="flex gap-4">
            <div className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <Users className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Active Members</p>
                    <p className="text-xl font-bold text-white">1,248</p>
                </div>
            </div>
            <div className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Monthly Visits</p>
                    <p className="text-xl font-bold text-white">8.4k</p>
                </div>
            </div>
          </div>
        </div>

        {/* --- Action Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {actions.map((action, index) => (
            <div 
              key={index}
              onClick={() => navigate(action.path)}
              className={`group relative p-8 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${action.border}`}
            >
              {/* Background Gradient Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex-1">
                  <div className={`w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                    <action.icon className={`w-7 h-7 ${action.color}`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
                    {action.title}
                  </h3>
                  <p className="text-slate-400 group-hover:text-slate-300 transition-colors line-clamp-2">
                    {action.desc}
                  </p>
                </div>

                <div className="mt-2 p-2 rounded-full border border-slate-800 bg-slate-950 text-slate-600 group-hover:border-slate-600 group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- Recent System Activity (Optional Filler) --- */}
        <div className="mt-12">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-500" />
                System Status
            </h3>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </div>
                    <p className="text-sm text-slate-300">
                        All systems operational. Database connected securely via <span className="font-mono text-emerald-400">127.0.0.1:8000</span>.
                    </p>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;