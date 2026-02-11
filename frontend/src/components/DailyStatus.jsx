/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trash2, Bell, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { saveStatus, getActiveStatuses, deleteStatusManual } from '../utils/statusStorage';

const DailyStatus = () => {
  const [statuses, setStatuses] = useState([]);
  const [input, setInput] = useState('');
  const [isAdmin, setIsAdmin] = useState(true); // Simulating Admin View

  // Load statuses and set up auto-refresh
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatuses(getActiveStatuses());
    
    // Check every minute for expired statuses
    const interval = setInterval(() => {
      setStatuses(getActiveStatuses());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const updated = saveStatus(input);
    setStatuses(updated);
    setInput('');
  };

  const handleDelete = (id) => {
    const updated = deleteStatusManual(id);
    setStatuses(updated);
  };

  return (
    <section id="status" className="section-padding bg-royal-800 relative">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Bell className="text-royal-gold animate-pulse" />
          <h2 className="text-3xl font-bold font-sans">Live <span className="text-gradient-gold">Updates</span></h2>
        </div>

        {/* Admin Input Area */}
        {isAdmin && (
          <div className="mb-10 glass-card p-6 rounded-xl">
            <form onSubmit={handleAdd} className="flex gap-4">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Post a daily update (Auto-deletes in 24h)..."
                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-royal-gold text-white"
              />
              <button type="submit" className="bg-royal-gold hover:text-black text-white p-3 rounded-lg hover:bg-yellow-400 transition-colors">
                <Send size={20} />
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2 ml-1">* Simulating Admin Mode. These updates appear live to members.</p>
          </div>
        )}

        {/* Status Feed */}
        <div className="space-y-4">
          <AnimatePresence>
            {statuses.length === 0 ? (
              <p className="text-gray-500 italic">No updates for today.</p>
            ) : (
              statuses.map((status) => (
                <motion.div
                  key={status.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-black/40 border-l-4 border-royal-gold p-5 rounded-r-lg flex justify-between items-start group hover:bg-black/60 transition-colors"
                >
                  <div>
                    <p className="text-lg text-white mb-2">{status.text}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock size={12} />
                      <span>Posted {formatDistanceToNow(status.timestamp)} ago</span>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete(status.id)}
                      className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default DailyStatus;