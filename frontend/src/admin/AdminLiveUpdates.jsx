import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import {
    FileText, UploadCloud, Trash2, Loader2, X, Save,
    CheckCircle2, Download, CheckSquare, Square,
    Edit3, Layout, Search, Plus, FileIcon,
    MoreVertical, AlertCircle, RefreshCw
} from 'lucide-react';
import { server_domain } from "../Helpers/Domain";
import { loadAccessToken } from "../api/auth";
import { ToastCustom, FullPageLoader } from "../Helpers/Utils";

const API_URL = `${server_domain}api/live-updates/`;

// --- UTILITY: Extract Filename from URL ---
const getFileName = (url) => {
    if (!url) return "Unknown File";
    try {
        const decoded = decodeURIComponent(url);
        // Split by slash and take the last part
        const parts = decoded.split('/');
        let filename = parts.pop();
        // Remove generic Cloudinary version prefixes if present (e.g., v16234/)
        // Usually not needed for simple display, but keeps it clean
        if (filename.includes('?')) filename = filename.split('?')[0];
        return filename;
    } catch (e) {
        return "Attachment";
    }
};

const LiveUpdateManager = () => {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('library'); // 'library' | 'create'

    // --- SELECTION STATE ---
    const [selectedIds, setSelectedIds] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // --- EDIT MODAL STATE ---
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null); // The original object
    const [editFormData, setEditFormData] = useState({ subject: '', description: '', newFiles: [] });

    // --- CREATE STATE ---
    const [newPost, setNewPost] = useState({ title: '', description: '', files: [] });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- UI STATE ---
    const [searchQuery, setSearchQuery] = useState("");
    const [toast, setToast] = useState(null);
    const fileInputRef = useRef(null);
    const editFileInputRef = useRef(null);

    // --- INITIAL LOAD ---
    useEffect(() => {
        fetchUpdates();
    }, []);

    const showToast = (message, type = 'success') => setToast({ message, type });

    const fetchUpdates = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_URL);
            // Sort by newest first just in case backend doesn't
            const sorted = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setUpdates(sorted);
        } catch (error) {
            showToast("Failed to sync updates. Check connection.", "error");
        } finally {
            setLoading(false);
        }
    };

    // --- SEARCH FILTER ---
    const filteredUpdates = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return updates.filter(u =>
            (u.subject?.toLowerCase() || "").includes(query) ||
            (u.description?.toLowerCase() || "").includes(query)
        );
    }, [searchQuery, updates]);

    // --- HANDLER: CREATE POST ---
    const handleCreate = async () => {
        if (!newPost.title.trim()) return showToast("Subject is required", "error");

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('subject', newPost.title);
        formData.append('description', newPost.description);
        newPost.files.forEach(file => formData.append('uploaded_files', file));

        try {
            await axios.post(API_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${loadAccessToken()}`
                }
            });
            showToast("Broadcast published successfully");
            setNewPost({ title: '', description: '', files: [] });
            setActiveTab('library');
            fetchUpdates();
        } catch (e) {
            showToast("Publication failed. Try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- HANDLER: DELETE (Single & Batch) ---
    const handleDelete = async (ids) => {
        const targetIds = Array.isArray(ids) ? ids : [ids];
        if (targetIds.length === 0) return;

        if (!window.confirm(`Are you sure you want to permanently delete ${targetIds.length} update(s)?`)) return;

        // Optimistic UI Update (Remove immediately)
        const previousUpdates = [...updates];
        setUpdates(prev => prev.filter(u => !targetIds.includes(u.id)));
        setSelectedIds([]);
        setIsSelectionMode(false);

        try {
            await Promise.all(targetIds.map(id =>
                axios.delete(`${API_URL}${id}/`, {
                    headers: { Authorization: `Bearer ${loadAccessToken()}` }
                })
            ));
            showToast("Deleted successfully");
        } catch (e) {
            // Revert if failed
            setUpdates(previousUpdates);
            showToast("Delete failed. Permission denied?", "error");
        }
    };

    // --- HANDLER: EDIT MODAL ---
    const openEditModal = (item) => {
        setEditingPost(item);
        setEditFormData({
            subject: item.subject,
            description: item.description,
            newFiles: []
        });
        setEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingPost) return;
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('subject', editFormData.subject);
        formData.append('description', editFormData.description);
        // Append NEW files only
        editFormData.newFiles.forEach(file => formData.append('uploaded_files', file));

        try {
            await axios.patch(`${API_URL}${editingPost.id}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${loadAccessToken()}`
                }
            });
            showToast("Changes saved");
            setEditModalOpen(false);
            fetchUpdates(); // Refresh to see changes
        } catch (error) {
            showToast("Update failed", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- HANDLER: FILE DOWNLOAD ---
    const handleDownload = async (fileUrl, originalName) => {
        try {
            showToast("Starting download...", "success");
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // Use the actual filename if possible
            link.setAttribute('download', originalName || 'download');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            showToast("Download failed. Opening in new tab.", "error");
            window.open(fileUrl, '_blank');
        }
    };

    // --- HANDLER: SELECTION ---
    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) return prev.filter(i => i !== id);
            return [...prev, id];
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === updates.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(updates.map(u => u.id));
        }
    };

    return (
        <div className="bg-slate-950 min-h-screen p-4 md:p-8 text-slate-200 selection:bg-blue-500/30 font-sans">
            {toast && <ToastCustom message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="max-w-7xl mx-auto">

                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg shadow-blue-900/20">
                            <FileText className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Live Manager</h1>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">System Operational</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                        {/* Search Bar */}
                        <div className="relative group flex-grow sm:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search updates..."
                                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-xs font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* View Toggles */}
                        <div className="bg-slate-900/80 p-1 rounded-xl border border-slate-800 flex shrink-0">
                            <button
                                onClick={() => setActiveTab('library')}
                                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'library' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Library
                            </button>
                            <button
                                onClick={() => setActiveTab('create')}
                                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'create' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Create New
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- MAIN CONTENT AREA --- */}
                {activeTab === 'library' && (
                    <>
                        {/* Toolbar */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={fetchUpdates}
                                    className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-white border border-slate-800 hover:border-slate-600 transition-all"
                                    title="Refresh Data"
                                >
                                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                                </button>
                                <button
                                    onClick={() => {
                                        setIsSelectionMode(!isSelectionMode);
                                        setSelectedIds([]);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${isSelectionMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/50' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600'}`}
                                >
                                    {isSelectionMode ? 'Exit Batch Mode' : 'Batch Actions'}
                                </button>
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                {filteredUpdates.length} Records Found
                            </div>
                        </div>

                        {/* Grid / List */}
                        <div className="grid grid-cols-1 gap-4">
                            {loading ? (
                                <div className="py-20 flex flex-col items-center text-slate-600">
                                    <Loader2 className="animate-spin mb-4" size={32} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Syncing Database...</span>
                                </div>
                            ) : filteredUpdates.length === 0 ? (
                                <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                                    <AlertCircle className="mx-auto text-slate-700 mb-4" size={48} />
                                    <p className="text-slate-500 text-sm font-medium">No updates found matching your criteria.</p>
                                </div>
                            ) : (
                                filteredUpdates.map(item => (
                                    <div
                                        key={item.id}
                                        className={`relative group bg-slate-900/40 border transition-all duration-300 rounded-2xl overflow-hidden ${
                                            selectedIds.includes(item.id)
                                                ? 'border-blue-500 ring-1 ring-blue-500/50 bg-blue-900/10'
                                                : 'border-white/5 hover:border-white/10 hover:bg-slate-900/80'
                                        }`}
                                    >
                                        <div className="p-6 flex flex-col md:flex-row gap-6">
                                            {/* Checkbox (Visible in Selection Mode or Hover) */}
                                            {(isSelectionMode || selectedIds.includes(item.id)) && (
                                                <div className="shrink-0 pt-1">
                                                    <button onClick={() => toggleSelect(item.id)} className="transition-transform active:scale-90">
                                                        {selectedIds.includes(item.id)
                                                            ? <CheckSquare className="text-blue-500" size={24}/>
                                                            : <Square className="text-slate-600 hover:text-slate-400" size={24}/>
                                                        }
                                                    </button>
                                                </div>
                                            )}

                                            {/* Content */}
                                            <div className="flex-grow min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white mb-2 leading-tight">{item.subject}</h3>
                                                        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4">
                                                    <span className="bg-slate-800 px-2 py-1 rounded text-slate-400">
                                                        {new Date(item.timestamp).toLocaleDateString()}
                                                    </span>
                                                            <span>{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons (Top Right) */}
                                                    <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => openEditModal(item)}
                                                            className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-lg transition-colors border border-white/5"
                                                            title="Edit Update"
                                                        >
                                                            <Edit3 size={16}/>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-2 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg transition-colors border border-white/5"
                                                            title="Delete Update"
                                                        >
                                                            <Trash2 size={16}/>
                                                        </button>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap font-medium">
                                                    {item.description}
                                                </p>

                                                {/* Attachments List */}
                                                {item.files && item.files.length > 0 && (
                                                    <div className="mt-6 pt-4 border-t border-white/5">
                                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">
                                                            Attached Documents ({item.files.length})
                                                        </p>
                                                        <div className="flex flex-wrap gap-3">
                                                            {item.files.map((fileObj, idx) => {
                                                                const fileName = getFileName(fileObj.file);
                                                                return (
                                                                    <div
                                                                        key={idx}
                                                                        className="flex items-center gap-3 bg-black/30 border border-white/10 hover:border-blue-500/30 rounded-lg px-3 py-2 pr-2 transition-all group/file"
                                                                    >
                                                                        <div className="p-1.5 bg-blue-500/10 rounded text-blue-400">
                                                                            <FileIcon size={14} />
                                                                        </div>
                                                                        <span className="text-xs text-slate-300 font-medium truncate max-w-[150px]" title={fileName}>
                                                                    {fileName}
                                                                </span>
                                                                        <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>
                                                                        <button
                                                                            onClick={() => handleDownload(fileObj.file, fileName)}
                                                                            className="p-1 text-slate-500 hover:text-white transition-colors"
                                                                            title="Download"
                                                                        >
                                                                            <Download size={14} />
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Batch Action Floating Bar */}
                        {isSelectionMode && (
                            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0F172A] border border-slate-700 pl-6 pr-2 py-2 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-6 duration-300">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-white tabular-nums">{selectedIds.length}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Selected</span>
                                </div>

                                <div className="h-6 w-[1px] bg-slate-700"></div>

                                <button onClick={toggleSelectAll} className="text-xs font-bold text-slate-300 hover:text-white uppercase tracking-wider">
                                    {selectedIds.length === updates.length ? 'None' : 'All'}
                                </button>

                                <button
                                    onClick={() => handleDelete(selectedIds)}
                                    disabled={selectedIds.length === 0}
                                    className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* --- CREATE TAB --- */}
                {activeTab === 'create' && (
                    <div className="max-w-2xl mx-auto bg-slate-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
                        <div className="mb-8">
                            <h2 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                                <Plus className="text-blue-500" /> New Broadcast
                            </h2>
                            <p className="text-xs text-slate-500 mt-2 font-medium ml-8">Publish updates to the live feed immediately.</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Subject Line</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-colors"
                                    placeholder="e.g. Server Maintenance Schedule"
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Content Body</label>
                                <textarea
                                    rows="5"
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-sm font-medium text-slate-300 outline-none focus:border-blue-500 transition-colors leading-relaxed"
                                    placeholder="Type the details of the update here..."
                                    value={newPost.description}
                                    onChange={(e) => setNewPost({...newPost, description: e.target.value})}
                                />
                            </div>

                            {/* File Drop Area */}
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Attachments</label>
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="border-2 border-dashed border-slate-800 bg-slate-900/50 rounded-2xl p-8 text-center hover:border-blue-500/50 hover:bg-slate-900 transition-all cursor-pointer group"
                                >
                                    <input
                                        type="file" multiple className="hidden" ref={fileInputRef}
                                        onChange={(e) => setNewPost({...newPost, files: [...newPost.files, ...Array.from(e.target.files)]})}
                                    />
                                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <UploadCloud className="text-slate-400 group-hover:text-blue-500" size={24} />
                                    </div>
                                    <p className="text-xs font-bold text-slate-300">Click to upload documents</p>
                                    <p className="text-[10px] text-slate-600 mt-1">Supports PDF, Images, and Docs</p>
                                </div>

                                {/* Staged Files Preview */}
                                {newPost.files.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {newPost.files.map((f, i) => (
                                            <div key={i} className="flex items-center justify-between bg-slate-800/50 px-4 py-2 rounded-lg border border-white/5">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <FileIcon size={14} className="text-blue-400 shrink-0" />
                                                    <span className="text-xs text-slate-300 truncate">{f.name}</span>
                                                    <span className="text-[10px] text-slate-600">({(f.size / 1024).toFixed(1)} KB)</span>
                                                </div>
                                                <button
                                                    onClick={() => setNewPost({...newPost, files: newPost.files.filter((_, idx) => idx !== i)})}
                                                    className="text-slate-500 hover:text-red-400 transition-colors"
                                                >
                                                    <X size={14}/>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleCreate}
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {isSubmitting ? 'Publishing...' : 'Publish Broadcast'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- EDIT MODAL OVERLAY --- */}
            {editModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0f172a] w-full max-w-lg rounded-3xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-3xl">
                            <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Edit Update</h3>
                            <button onClick={() => setEditModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">Subject</label>
                                <input
                                    type="text"
                                    value={editFormData.subject}
                                    onChange={(e) => setEditFormData({...editFormData, subject: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">Description</label>
                                <textarea
                                    rows="4"
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 focus:border-blue-500 outline-none resize-none leading-relaxed"
                                />
                            </div>

                            {/* Existing Files List */}
                            {editingPost?.files?.length > 0 && (
                                <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Current Attachments</p>
                                    <div className="space-y-2">
                                        {editingPost.files.map((file, i) => (
                                            <div key={i} className="flex items-center gap-3 text-xs text-slate-400">
                                                <FileIcon size={12} />
                                                <span className="truncate flex-grow">{getFileName(file.file)}</span>
                                                <span className="text-[10px] text-slate-600 italic">Saved</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add New Files */}
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Add New Attachments</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => editFileInputRef.current.click()}
                                        className="flex-grow py-3 border border-dashed border-slate-700 hover:border-blue-500 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus size={14}/> Attach File
                                    </button>
                                    <input
                                        type="file" multiple className="hidden" ref={editFileInputRef}
                                        onChange={(e) => setEditFormData({...editFormData, newFiles: [...editFormData.newFiles, ...Array.from(e.target.files)]})}
                                    />
                                </div>

                                {/* New Staged Files */}
                                {editFormData.newFiles.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {editFormData.newFiles.map((f, i) => (
                                            <div key={i} className="flex items-center justify-between bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20">
                                                <span className="text-xs text-blue-200 truncate">{f.name}</span>
                                                <button
                                                    onClick={() => setEditFormData({...editFormData, newFiles: editFormData.newFiles.filter((_, idx) => idx !== i)})}
                                                    className="text-blue-300 hover:text-white"
                                                >
                                                    <X size={14}/>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-800 bg-slate-900/50 rounded-b-3xl flex gap-3">
                            <button
                                onClick={() => setEditModalOpen(false)}
                                className="flex-1 py-3 rounded-xl text-xs font-bold uppercase text-slate-400 hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={isSubmitting}
                                className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-black uppercase text-white shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveUpdateManager;