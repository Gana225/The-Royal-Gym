import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Bell,
    Clock,
    FileText,
    Download,
    Loader2,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Paperclip,
    Activity
} from 'lucide-react';
import { server_domain } from "../Helpers/Domain";

const API_URL = `${server_domain}api/live-updates/`;

const getFileName = (url) => {
    if (!url) return "Attachment";
    try {
        let filename = decodeURIComponent(url).split('/').pop();
        if (filename.includes('?')) filename = filename.split('?')[0];
        return filename;
    } catch (e) { return "Attachment"; }
};

const formatDate = (isoString) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(date);
};

const LiveUpdatesFeed = () => {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedDesc, setExpandedDesc] = useState({});

    useEffect(() => {
        const fetchUpdates = async () => {
            try {
                const response = await axios.get(API_URL);
                setUpdates(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to load updates:", err);
                setError("Unable to load live updates at this time.");
                setLoading(false);
            }
        };
        fetchUpdates();
    }, []);

    const toggleDesc = (id) => {
        setExpandedDesc(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleDownload = (fileUrl, e) => {
        e.stopPropagation();
        window.open(fileUrl, '_blank');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#090E17] p-4 md:p-8 font-sans selection:bg-indigo-500/30">

            {/* Main Widget Container */}
            <div className="w-full max-w-3xl bg-[#131A2B]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative h-[85vh] max-h-[800px]">

                {/* Decorative Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-500/20 blur-[100px] pointer-events-none"></div>

                {/* Header Section */}
                <div className="relative z-10 p-6 md:px-8 border-b border-white/5 bg-[#131A2B]/50 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                                <Activity className="h-7 w-7 animate-pulse" />
                                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-500 border-2 border-[#131A2B]"></span>
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-2xl font-bold text-white tracking-tight">
                                    Live Updates
                                </h2>
                                <p className="text-sm text-slate-400 flex items-center mt-1 font-medium">
                                    <Sparkles className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
                                    Real-time activity feed
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="relative flex-1 overflow-hidden flex flex-col z-10">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-indigo-400 space-y-4">
                            <Loader2 className="h-10 w-10 animate-spin" />
                            <p className="text-slate-400 font-medium">Syncing feed...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full text-rose-400 space-y-4">
                            <AlertCircle className="h-12 w-12 opacity-80" />
                            <p className="font-medium">{error}</p>
                        </div>
                    ) : updates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                            <Bell className="h-12 w-12 opacity-20" />
                            <p className="text-lg font-medium">All caught up!</p>
                        </div>
                    ) : (
                        /* Smooth Scroll Container */
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scroll-smooth styled-scrollbar">

                            {updates.map((update, index) => {
                                const isExpanded = expandedDesc[update.id];
                                const hasLongText = update.description && update.description.length > 180;

                                return (
                                    <div
                                        key={update.id}
                                        className="group relative bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-indigo-500/30 rounded-3xl p-6 md:p-7 transition-all duration-500 ease-out flex flex-col gap-5 shadow-lg"
                                    >
                                        {/* Header Row (Title & Date) - Strictly aligned */}
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 w-full">
                                            {/* min-w-0 is CRUCIAL here to prevent flex blowout from long unbroken strings */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xl font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors duration-300 break-words [overflow-wrap:anywhere] leading-snug">
                                                    {update.subject}
                                                </h3>
                                            </div>

                                            {/* shrink-0 ensures the date tag is never squished by the title */}
                                            <div className="shrink-0 flex items-center text-xs font-medium text-slate-400 bg-[#090E17]/80 px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
                                                <Clock className="h-3.5 w-3.5 mr-1.5 text-indigo-400/70" />
                                                {formatDate(update.timestamp)}
                                            </div>
                                        </div>

                                        {/* Description Container */}
                                        <div className="relative w-full min-w-0">
                                            <p className={`text-base font-medium text-slate-300/80 leading-relaxed break-words [overflow-wrap:anywhere] ${!isExpanded && hasLongText ? 'line-clamp-3' : ''}`}>
                                                {update.description}
                                            </p>

                                            {hasLongText && (
                                                <button
                                                    onClick={() => toggleDesc(update.id)}
                                                    className="mt-3 flex items-center text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg w-fit"
                                                >
                                                    {isExpanded ? (
                                                        <>Show less <ChevronUp className="ml-1.5 h-4 w-4" /></>
                                                    ) : (
                                                        <>Read full description <ChevronDown className="ml-1.5 h-4 w-4" /></>
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        {/* Attachments Section - Switched to Grid for perfect alignment */}
                                        {update.files && update.files.length > 0 && (
                                            <div className="pt-5 mt-2 border-t border-white/5">
                                                <div className="flex items-center text-sm font-semibold text-slate-400 mb-4">
                                                    <Paperclip className="h-4 w-4 mr-2 text-indigo-400/70" />
                                                    Attached Files ({update.files.length})
                                                </div>

                                                {/* Grid layout ensures items are uniform and perfectly aligned */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                                                    {update.files.map((fileObj) => (
                                                        <button
                                                            key={fileObj.id}
                                                            onClick={(e) => handleDownload(fileObj.file, e)}
                                                            className="flex items-center gap-3 p-3 bg-[#090E17]/50 border border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/10 rounded-xl transition-all duration-300 group/btn w-full min-w-0 text-left"
                                                        >
                                                            <div className="shrink-0 p-2 bg-slate-800/80 group-hover/btn:bg-indigo-500/20 rounded-lg transition-colors">
                                                                <FileText className="h-4 w-4 text-slate-400 group-hover/btn:text-indigo-400" />
                                                            </div>

                                                            {/* truncate handles long file names cleanly */}
                                                            <div className="flex-1 min-w-0 flex flex-col">
                                                                <span className="text-sm font-medium text-slate-300 group-hover/btn:text-white truncate transition-colors">
                                                                    {getFileName(fileObj.file)}
                                                                </span>
                                                            </div>

                                                            <div className="shrink-0 pl-2">
                                                                <Download className="h-4 w-4 text-slate-500 group-hover/btn:text-indigo-400 opacity-0 group-hover/btn:opacity-100 transition-all transform translate-y-1 group-hover/btn:translate-y-0" />
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Styles for Scrollbar and Animations */}
            <style jsx>{`
                .styled-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .styled-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .styled-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .styled-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
};

export default LiveUpdatesFeed;