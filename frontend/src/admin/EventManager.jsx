import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; // Quill styles
import {
    Calendar, MapPin, Trash2, Loader2, X, Save,
    CheckCircle2, Plus, Image as ImageIcon, Search,
    Edit3, Layout, ChevronRight
} from 'lucide-react';
import { server_domain } from "../Helpers/Domain";
import { loadAccessToken } from "../api/auth";
import { ToastCustom, FullPageLoader } from "../Helpers/Utils";

const API_URL = `${server_domain}api/events/`;

// React-Quill Toolbar Configuration (Adds Bold, Colors, Lists, etc.)
const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['clean']
    ],
};

const EventManager = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('library');

    // --- SELECTION & EDIT STATE ---
    const [selectedIds, setSelectedIds] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    // Form States (Create & Edit)
    const initialFormState = { title: '', highlights: '', description: '', location: '', files: [] };
    const [formData, setFormData] = useState(initialFormState);
    const [editFormData, setEditFormData] = useState({ ...initialFormState, newFiles: [] });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- UI STATE ---
    const [searchQuery, setSearchQuery] = useState("");
    const [toast, setToast] = useState(null);
    const fileInputRef = useRef(null);
    const editFileInputRef = useRef(null);

    useEffect(() => { fetchEvents(); }, []);

    const showToast = (message, type = 'success') => setToast({ message, type });

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_URL);
            setEvents(response.data);
        } catch (error) {
            showToast("Failed to sync events", "error");
        } finally { setLoading(false); }
    };

    // --- SEARCH FILTER ---
    const filteredEvents = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return events.filter(e =>
            (e.title?.toLowerCase() || "").includes(query) ||
            (e.location?.toLowerCase() || "").includes(query)
        );
    }, [searchQuery, events]);

    // --- CREATE HANDLER ---
    const handleCreate = async () => {
        if (!formData.title || !formData.location) return showToast("Title & Location are required", "error");

        setIsSubmitting(true);
        const data = new FormData();
        data.append('title', formData.title);
        data.append('highlights', formData.highlights); // This is now an HTML string from Quill
        data.append('description', formData.description); // This is now an HTML string from Quill
        data.append('location', formData.location);
        formData.files.forEach(file => data.append('uploaded_images', file));

        try {
            await axios.post(API_URL, data, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${loadAccessToken()}` }
            });
            showToast("Event Published Successfully");
            setFormData(initialFormState);
            setActiveTab('library');
            fetchEvents();
        } catch (e) { showToast("Publication Failed", "error"); }
        finally { setIsSubmitting(false); }
    };

    // --- EDIT HANDLER ---
    const openEditModal = (event) => {
        setEditingEvent(event);
        setEditFormData({
            title: event.title,
            highlights: event.highlights,
            description: event.description,
            location: event.location,
            newFiles: []
        });
        setEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        setIsSubmitting(true);
        const data = new FormData();
        data.append('title', editFormData.title);
        data.append('highlights', editFormData.highlights);
        data.append('description', editFormData.description);
        data.append('location', editFormData.location);
        editFormData.newFiles.forEach(file => data.append('uploaded_images', file));

        try {
            await axios.patch(`${API_URL}${editingEvent.id}/`, data, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${loadAccessToken()}` }
            });
            showToast("Event Updated Successfully");
            setEditModalOpen(false);
            fetchEvents();
        } catch (error) { showToast("Update Failed", "error"); }
        finally { setIsSubmitting(false); }
    };

    // --- DELETE HANDLER ---
    const handleDelete = async (ids) => {
        const targetIds = Array.isArray(ids) ? ids : [ids];
        if (!window.confirm(`Permanently delete ${targetIds.length} event(s)?`)) return;

        // Optimistic Update
        const prevEvents = [...events];
        setEvents(prev => prev.filter(e => !targetIds.includes(e.id)));
        setSelectedIds([]);
        setIsSelectionMode(false);

        try {
            await Promise.all(targetIds.map(id =>
                axios.delete(`${API_URL}${id}/`, { headers: { Authorization: `Bearer ${loadAccessToken()}` } })
            ));
            showToast("Events Deleted");
        } catch (e) {
            setEvents(prevEvents); // Revert on failure
            showToast("Delete Failed. Permission denied.", "error");
        }
    };

    const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    return (
        <div className="bg-slate-950 min-h-screen p-4 md:p-8 text-slate-200 font-sans selection:bg-purple-500/30">
            {/* Custom CSS to make React-Quill look good in Dark Mode */}
            <style dangerouslySetInnerHTML={{__html: `
        .ql-toolbar { background: #1e293b; border-radius: 0.75rem 0.75rem 0 0; border-color: #334155 !important; }
        .ql-container { background: #0f172a; border-radius: 0 0 0.75rem 0.75rem; border-color: #334155 !important; color: white; font-size: 14px; }
        .ql-editor { min-height: 120px; }
        .ql-snow .ql-stroke { stroke: #cbd5e1; }
        .ql-snow .ql-fill { fill: #cbd5e1; }
        .ql-snow .ql-picker { color: #cbd5e1; }
        .quill-content h1 { font-size: 1.5em; font-weight: bold; margin-bottom: 0.5em; }
        .quill-content h2 { font-size: 1.25em; font-weight: bold; margin-bottom: 0.5em; }
        .quill-content ul { list-style-type: disc; padding-left: 1.5em; }
        .quill-content ol { list-style-type: decimal; padding-left: 1.5em; }
        .quill-content a { color: #a855f7; text-decoration: underline; }
      `}} />

            {toast && <ToastCustom message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="max-w-7xl mx-auto">
                {/* --- HEADER --- */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg shadow-purple-900/30 border border-purple-500/20">
                            <Calendar className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Event Hub</h1>
                            <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-1">Schedules & Portfolios</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                        <div className="relative group flex-grow sm:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                            <input
                                type="text" placeholder="Search events or locations..."
                                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-xs font-medium outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-slate-600"
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 flex shrink-0 h-full">
                            <button onClick={() => setActiveTab('library')} className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'library' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:text-white'}`}>Library</button>
                            <button onClick={() => setActiveTab('create')} className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'create' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:text-white'}`}>New Event</button>
                        </div>
                    </div>
                </div>

                {/* --- LIBRARY VIEW --- */}
                {activeTab === 'library' && (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <button
                                onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedIds([]); }}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${isSelectionMode ? 'bg-purple-500/10 text-purple-400 border-purple-500/50' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600'}`}
                            >
                                {isSelectionMode ? 'Exit Batch Mode' : 'Batch Actions'}
                            </button>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{filteredEvents.length} Records</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loading ? (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-600">
                                    <Loader2 className="animate-spin mb-4" size={32} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Loading Events...</span>
                                </div>
                            ) : filteredEvents.map(event => (
                                <div key={event.id} className={`bg-slate-900/40 border rounded-3xl overflow-hidden transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/10 ${selectedIds.includes(event.id) ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-white/5 hover:border-white/10'}`}>
                                    {/* Image Header */}
                                    <div className="h-56 bg-black relative overflow-hidden">
                                        {event.files && event.files.length > 0 ? (
                                            <img src={event.files[0].file_url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-700"><ImageIcon size={48} strokeWidth={1}/></div>
                                        )}

                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>

                                        {/* Floating Actions */}
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                                            <button onClick={() => openEditModal(event)} className="p-2.5 bg-black/60 backdrop-blur-md rounded-xl text-white hover:bg-purple-600 transition-all border border-white/10"><Edit3 size={16}/></button>
                                            <button onClick={() => handleDelete(event.id)} className="p-2.5 bg-black/60 backdrop-blur-md rounded-xl text-white hover:bg-red-600 transition-all border border-white/10"><Trash2 size={16}/></button>
                                        </div>

                                        {/* Selection Checkbox */}
                                        {(isSelectionMode || selectedIds.includes(event.id)) && (
                                            <div className="absolute top-4 left-4 z-10" onClick={() => toggleSelect(event.id)}>
                                                <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${selectedIds.includes(event.id) ? 'bg-purple-500 border-purple-500 scale-110' : 'border-white/50 bg-black/40 hover:border-white'}`}>
                                                    {selectedIds.includes(event.id) && <CheckCircle2 size={18} className="text-white" />}
                                                </div>
                                            </div>
                                        )}

                                        {/* Location Badge */}
                                        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-purple-300">
                                            <MapPin size={12}/>
                                            <span className="text-[9px] font-black uppercase tracking-widest truncate max-w-[150px]">{event.location}</span>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-black text-white mb-3 leading-tight uppercase tracking-tight">{event.title}</h3>

                                        {/* Render Highlight HTML Safely */}
                                        <div className="bg-slate-950/50 rounded-2xl p-4 border border-white/5 mb-4 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">Highlights</div>
                                            {/* dangerouslySetInnerHTML renders the text styled from Quill */}
                                            <div
                                                className="text-xs text-slate-300 quill-content line-clamp-3"
                                                dangerouslySetInnerHTML={{ __html: event.highlights }}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            <span>{new Date(event.timestamp).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1 text-purple-400 group-hover:text-purple-300 transition-colors cursor-pointer">View Details <ChevronRight size={14}/></span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* --- CREATE TAB --- */}
                {activeTab === 'create' && (
                    <div className="max-w-4xl mx-auto bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 md:p-10 backdrop-blur-sm shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight mb-8 flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg"><Plus className="text-purple-500" size={24}/></div>
                            Schedule New Event
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Event Title <span className="text-red-500">*</span></label>
                                <input type="text" className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-purple-500 transition-colors" placeholder="e.g. Annual Fitness Gala" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Location <span className="text-red-500">*</span></label>
                                <input type="text" className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-purple-500 transition-colors" placeholder="e.g. Main Gym Arena" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                            </div>
                        </div>

                        {/* WYSIWYG Editor for Highlights */}
                        <div className="mb-8">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Event Highlights</label>
                            <ReactQuill
                                theme="snow"
                                value={formData.highlights}
                                onChange={(content) => setFormData({...formData, highlights: content})}
                                modules={quillModules}
                                placeholder="Highlight the best parts using bold, colors, or bullet points..."
                            />
                        </div>

                        {/* WYSIWYG Editor for Description */}
                        <div className="mb-8">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Full Description</label>
                            <ReactQuill
                                theme="snow"
                                value={formData.description}
                                onChange={(content) => setFormData({...formData, description: content})}
                                modules={quillModules}
                                placeholder="Provide the complete agenda and details..."
                            />
                        </div>

                        {/* File Upload Zone */}
                        <div className="mb-10">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Event Photos</label>
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className="border-2 border-dashed border-slate-700 bg-slate-900/30 rounded-2xl p-10 text-center hover:border-purple-500/50 hover:bg-slate-900 transition-all cursor-pointer group"
                            >
                                <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => setFormData({...formData, files: [...formData.files, ...Array.from(e.target.files)]})} />
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <ImageIcon className="text-slate-400 group-hover:text-purple-400" size={28} />
                                </div>
                                <p className="text-sm font-bold text-white mb-1">Click to browse or drop images here</p>
                                <p className="text-xs text-slate-500">Supports JPG, PNG, WEBP</p>
                            </div>

                            {/* Preview Uploaded Files */}
                            {formData.files.length > 0 && (
                                <div className="flex flex-wrap gap-3 mt-4 p-4 bg-slate-900/50 rounded-xl border border-white/5">
                                    {formData.files.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-lg">
                                            <span className="text-[10px] text-purple-200 font-bold max-w-[150px] truncate">{f.name}</span>
                                            <button onClick={() => setFormData({...formData, files: formData.files.filter((_, idx) => idx !== i)})} className="text-purple-400 hover:text-white transition-colors">
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
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black uppercase tracking-widest text-xs py-5 rounded-xl shadow-xl shadow-purple-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {isSubmitting ? 'Publishing...' : 'Publish Event'}
                        </button>
                    </div>
                )}
            </div>

            {/* --- EDIT MODAL --- */}
            {editModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-[#0f172a] w-full max-w-3xl rounded-3xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-3xl">
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-2">
                                <Edit3 className="text-purple-500"/> Edit Event
                            </h3>
                            <button onClick={() => setEditModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Title</label>
                                    <input type="text" value={editFormData.title} onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-bold text-white focus:border-purple-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Location</label>
                                    <input type="text" value={editFormData.location} onChange={(e) => setEditFormData({...editFormData, location: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-bold text-white focus:border-purple-500 outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Highlights</label>
                                <ReactQuill theme="snow" value={editFormData.highlights} onChange={(content) => setEditFormData({...editFormData, highlights: content})} modules={quillModules} />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Description</label>
                                <ReactQuill theme="snow" value={editFormData.description} onChange={(content) => setEditFormData({...editFormData, description: content})} modules={quillModules} />
                            </div>

                            <div className="p-6 border border-dashed border-slate-700 rounded-2xl bg-slate-900/30">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 text-center">Add More Photos to Gallery</label>
                                <div className="flex justify-center">
                                    <button onClick={() => editFileInputRef.current.click()} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2">
                                        <Plus size={16}/> Select Images
                                    </button>
                                    <input type="file" multiple accept="image/*" className="hidden" ref={editFileInputRef} onChange={(e) => setEditFormData({...editFormData, newFiles: [...editFormData.newFiles, ...Array.from(e.target.files)]})} />
                                </div>
                                {editFormData.newFiles.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                                        {editFormData.newFiles.map((f, i) => (
                                            <div key={i} className="bg-purple-500/10 text-purple-300 text-[10px] px-3 py-1.5 rounded-md border border-purple-500/20 flex items-center gap-2">
                                                <span className="max-w-[100px] truncate">{f.name}</span>
                                                <X size={12} className="cursor-pointer hover:text-white" onClick={() => setEditFormData({...editFormData, newFiles: editFormData.newFiles.filter((_, idx) => idx !== i)})} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-800 bg-slate-900/50 rounded-b-3xl flex gap-3">
                            <button onClick={() => setEditModalOpen(false)} className="flex-1 py-4 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-white/5 rounded-xl transition-colors">Cancel</button>
                            <button onClick={handleSaveEdit} disabled={isSubmitting} className="flex-[2] py-4 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg flex justify-center items-center gap-2 disabled:opacity-50">
                                {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- BATCH DELETE FLOATING BAR --- */}
            {isSelectionMode && selectedIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-[#0F172A] border border-slate-700 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-6">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white tabular-nums">{selectedIds.length}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Selected</span>
                    </div>
                    <div className="w-[1px] h-6 bg-slate-700"></div>
                    <button onClick={() => handleDelete(selectedIds)} className="text-red-400 hover:text-red-300 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors">
                        <Trash2 size={16}/> Delete Batch
                    </button>
                </div>
            )}
        </div>
    );
};

export default EventManager;