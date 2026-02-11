import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { 
  Image as ImageIcon, UploadCloud, Camera, Trash2, 
  Loader2, X, Save, CheckCircle2,
  Download, CheckSquare, Square, SlidersHorizontal,
  Edit3, Layout, Search, Target, ChevronRight
} from 'lucide-react';
import { server_domain } from "../Helpers/Domain";
import { loadAccessToken } from "../api/auth";
import { secureSmartUpload } from "../Helpers/fileUpload";
import { ToastCustom, ProgressOverlay, FullPageLoader } from "../Helpers/Utils";

const API_URL = `${server_domain}api/gallery/`;

const AdminGalleryManager = () => {
  const [activeTab, setActiveTab] = useState('manage'); 
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selection & Edit State
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [editList, setEditList] = useState(null); 

  // UI Enhancement States
  const [toast, setToast] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({}); // Individual items
  const [globalProgress, setGlobalProgress] = useState(0);    // Overall batch %
  const [globalLoading, setGlobalLoading] = useState(null);  // Full screen loader label

  // Search & Camera States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const imageRefs = useRef({}); 
  const [newUploads, setNewUploads] = useState([]); 
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [viewImage, setViewImage] = useState(null); 

  useEffect(() => {
    fetchImages();
    return () => { if (stream) stream.getTracks().forEach(track => track.stop()); };
  }, []);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setExistingImages(response.data);
    } catch (error) {
      showToast("Sync Error: Failed to fetch gallery", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- SEARCH LOGIC (DSA Optimized) ---
  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return existingImages;
    const lowerQuery = searchQuery.toLowerCase();
    return existingImages.filter(img => 
      (img.title?.toLowerCase() || "").includes(lowerQuery) || 
      (img.description?.toLowerCase() || "").includes(lowerQuery)
    );
  }, [searchQuery, existingImages]);

  const scrollToImage = (id) => {
    setSearchQuery("");
    setSearchFocused(false);
    const element = imageRefs.current[id];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-4', 'ring-emerald-500', 'ring-offset-8', 'ring-offset-slate-950');
      setTimeout(() => element.classList.remove('ring-4', 'ring-emerald-500', 'ring-offset-8', 'ring-offset-slate-950'), 3000);
    }
  };

  const toggleSelectImage = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === existingImages.length) setSelectedIds([]);
    else setSelectedIds(existingImages.map(img => img.id));
  };

  // --- CAMERA LOGIC ---
  const startCamera = async () => {
    setCameraOpen(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) { 
        showToast("Access Denied: Please enable camera", "error");
        setCameraOpen(false); 
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStream(null);
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (video && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasRef.current.toBlob(blob => {
        const file = new File([blob], `cam_${Date.now()}.jpg`, { type: "image/jpeg" });
        setNewUploads(prev => [...prev, { id: Date.now(), file, preview: URL.createObjectURL(blob), title: '', description: '' }]);
        setActiveTab('upload');
        stopCamera();
      }, 'image/jpeg', 0.9);
    }
  };

  // --- UPLOAD ALL WITH GLOBAL & INDIVIDUAL PROGRESS ---
  const handleUploadAll = async () => {
    if (newUploads.length === 0) return;
    setUploading(true);
    setGlobalProgress(1);
    
    let completedCount = 0;
    const total = newUploads.length;

    try {
        await Promise.all(newUploads.map(async (item) => {
            setUploadProgress(prev => ({ ...prev, [item.id]: 2 }));

            const cloudRes = await secureSmartUpload(item.file, (progress) => {
                setUploadProgress(prev => ({ ...prev, [item.id]: progress }));
            });

            if (cloudRes.success) {
                await axios.post(`${server_domain}api/gallery/`, {
                    title: item.title,
                    description: item.description,
                    image: cloudRes.secure_url 
                }, {
                    headers: { Authorization: `Bearer ${loadAccessToken()}` }
                });
                
                completedCount++;
                setUploadProgress(prev => ({ ...prev, [item.id]: 100 }));
                setGlobalProgress((completedCount / total) * 100);
            } else {
                throw new Error(`Asset ${item.title} failed`);
            }
        }));

        showToast(`${newUploads.length} Assets Published Successfully`);
        setNewUploads([]);
        fetchImages();
        setActiveTab('manage');
    } catch (error) {
        showToast("Upload Error: Process interrupted", "error");
    } finally {
        setUploading(false);
        setTimeout(() => {
          setUploadProgress({});
          setGlobalProgress(0);
        }, 1500);
    }
  };

  // --- EDIT & SAVE LOGIC ---
  const handleOpenEdit = (target) => {
    const targets = Array.isArray(target) ? target : [target.id];
    setEditList(existingImages.filter(img => targets.includes(img.id)).map(img => ({ ...img })));
  };

  const updateEditListField = (id, field, value) => {
    setEditList(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSaveAllEdits = async () => {
    setGlobalLoading("Processing Metadata Update...");
    const token = loadAccessToken();
    try {
      await Promise.all(editList.map(item => 
        axios.patch(`${API_URL}${item.id}/`, { 
          title: item.title || "", 
          description: item.description || "" 
        }, { headers: { "Authorization": `Bearer ${token}` } })
      ));
      showToast("Database update successful");
      setEditList(null); setSelectedIds([]); setIsSelectionMode(false); fetchImages();
    } catch (error) {
      showToast("Update failed: Server error", "error");
    } finally { setGlobalLoading(null); }
  };

  // --- DOWNLOAD LOGIC ---
  const handleDownload = async (img) => {
    try {
        const res = await fetch(img.image);
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${img.title || 'gym_image'}.jpg`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (e) { showToast("Download restricted", "error"); }
  };

  const handleBulkDownload = async () => {
    setGlobalLoading("Initializing Zip Stream...");
    for (const id of selectedIds) {
      const img = existingImages.find(i => i.id === id);
      if (img) { 
        await handleDownload(img); 
        await new Promise(r => setTimeout(r, 800)); 
      }
    }
    setGlobalLoading(null);
    showToast(`${selectedIds.length} images exported`);
  };

  const handleBulkDelete = async (id = null) => {
    const targets = id ? [id] : selectedIds;
    if (targets.length === 0 || !window.confirm(`Wipe ${targets.length} assets permanently?`)) return;
    
    setGlobalLoading("De-linking from Cloudinary CDN...");
    const token = loadAccessToken();
    try {
      await Promise.all(targets.map(tId => axios.delete(`${API_URL}${tId}/`, { headers: { "Authorization": `Bearer ${token}` } })));
      showToast(`Purged ${targets.length} assets`);
      setExistingImages(prev => prev.filter(img => !targets.includes(img.id)));
      setSelectedIds([]); setIsSelectionMode(false);
    } catch (e) { showToast("Purge failed: Access denied", "error"); } finally { setGlobalLoading(null); }
  };

  return (
    <div className="bg-slate-950 min-h-screen p-4 md:p-8 text-slate-200 selection:bg-emerald-500/30">
      
      {/* GLOBAL HUD */}
      {toast && <ToastCustom message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {globalLoading && <FullPageLoader label={globalLoading} />}
      
      {/* Global Progress Bar (Top Fixed) */}
      {globalProgress > 0 && (
        <div className="fixed top-0 left-0 right-0 h-1 z-[1000] bg-slate-900 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 transition-all duration-500 ease-out"
            style={{ width: `${globalProgress}%` }}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-inner">
                <ImageIcon className="text-emerald-500" size={28} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Gallery</h1>
                <p className="text-[8px] text-slate-500 font-bold tracking-[0.2em] mt-1.5 uppercase">Asset Management</p>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="relative w-full max-w-md group">
            <div className={`flex items-center bg-slate-900 border ${searchFocused ? 'border-emerald-500 ring-4 ring-emerald-500/5' : 'border-slate-800'} rounded-xl px-4 py-2 transition-all duration-300`}>
                <Search size={18} className={searchFocused ? 'text-emerald-400' : 'text-slate-500'} />
                <input 
                    type="text" 
                    placeholder="Filter assets..." 
                    className="bg-transparent border-none outline-none ml-3 text-xs w-full text-white placeholder:text-slate-600 font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                />
            </div>
            {searchFocused && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-2xl z-50 max-h-[300px] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 backdrop-blur-2xl">
                    {filteredImages.length > 0 ? filteredImages.map(img => (
                        <div key={img.id} onClick={() => scrollToImage(img.id)} className="flex items-center gap-4 p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-none group/item transition-colors">
                            <img src={img.image} className="w-10 h-10 object-cover rounded-lg border border-white/10" alt="" />
                            <div className="flex-grow min-w-0">
                                <p className="text-xs font-bold text-white truncate uppercase italic">{img.title || "Untitled"}</p>
                                <p className="text-[9px] text-slate-500 truncate">{img.description || "No metadata"}</p>
                            </div>
                            <ChevronRight size={14} className="text-slate-700 group-hover/item:text-emerald-500 transition-colors" />
                        </div>
                    )) : <div className="p-8 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest">No Matches</div>}
                </div>
            )}
          </div>

          <div className="flex gap-3">
            <input type="file" ref={fileInputRef} onChange={(e) => {
                const files = Array.from(e.target.files);
                setNewUploads(prev => [...prev, ...files.map(f => ({ id: Date.now() + Math.random(), file: f, preview: URL.createObjectURL(f), title: '', description: '' }))]);
                setActiveTab('upload');
            }} multiple className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl hover:bg-slate-800 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><UploadCloud size={14}/> Upload</button>
            <button onClick={startCamera} className="bg-emerald-600 px-4 py-2 rounded-xl hover:bg-emerald-500 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/10 flex items-center gap-2 text-slate-950"><Camera size={14}/> Camera</button>
          </div>
        </div>

        {/* SUB-HEADER ACTIONS */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
            <div className="flex gap-1.5 bg-slate-900/50 p-1 rounded-xl border border-white/5 backdrop-blur-md">
                <button onClick={() => setActiveTab('manage')} className={`px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'manage' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>Library</button>
                <button onClick={() => setActiveTab('upload')} className={`px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'upload' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>Queue ({newUploads.length})</button>
            </div>

            {activeTab === 'manage' && existingImages.length > 0 && (
                <div className="flex items-center gap-2">
                    {!isSelectionMode ? (
                        <button onClick={() => setIsSelectionMode(true)} className="bg-slate-900 px-4 py-2 rounded-xl flex items-center gap-2 border border-slate-800 text-[10px] font-black uppercase tracking-widest hover:border-slate-600 transition-all text-slate-400"><SlidersHorizontal size={14}/> Batch Ops</button>
                    ) : (
                        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 pr-4 rounded-2xl border border-white/10 animate-in slide-in-from-right backdrop-blur-xl">
                            <button onClick={toggleSelectAll} className="px-3 py-1 text-[9px] font-black uppercase text-slate-400 hover:text-white transition-colors">{selectedIds.length === existingImages.length ? "Clear" : "All"}</button>
                            <div className="w-[1px] h-6 bg-slate-800 mx-1"></div>
                            <span className="text-xs text-emerald-400 font-black mr-4 tabular-nums">{selectedIds.length} <span className="text-slate-600 text-[9px] uppercase italic">Selected</span></span>
                            
                            <button onClick={handleBulkDownload} disabled={selectedIds.length === 0} className="p-2 bg-white/5 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-slate-950 transition-all disabled:opacity-20"><Download size={16} /></button>
                            <button onClick={() => handleOpenEdit(selectedIds)} disabled={selectedIds.length === 0} className="p-2 bg-white/5 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all disabled:opacity-20"><Edit3 size={16} /></button>
                            <button onClick={() => handleBulkDelete()} disabled={selectedIds.length === 0} className="p-2 bg-white/5 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all disabled:opacity-20"><Trash2 size={16} /></button>
                            <button onClick={() => { setIsSelectionMode(false); setSelectedIds([]); }} className="p-2 text-slate-500 hover:text-white ml-1 transition-colors"><X size={20} /></button>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* MAIN LIBRARY GRID */}
        {activeTab === 'manage' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredImages.map(img => {
                    const isSelected = selectedIds.includes(img.id);
                    return (
                        <div 
                          key={img.id} 
                          ref={el => imageRefs.current[img.id] = el} 
                          onClick={() => isSelectionMode ? toggleSelectImage(img.id) : setViewImage(img)} 
                          className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-500 cursor-pointer ${isSelected ? 'border-emerald-500 ring-4 ring-emerald-500/10 scale-95' : 'border-slate-800 hover:border-slate-600'}`}
                        >
                            <img src={img.image} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" alt="" />
                            
                            {!isSelectionMode && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(img); }} className="p-2 bg-black/80 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white border border-white/5 transition-all"><Edit3 size={14}/></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDownload(img); }} className="p-2 bg-black/80 text-emerald-400 rounded-xl hover:bg-emerald-600 hover:text-white border border-white/5 transition-all"><Download size={14}/></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleBulkDelete(img.id); }} className="p-2 bg-black/80 text-red-400 rounded-xl hover:bg-red-600 hover:text-white border border-white/5 transition-all"><Trash2 size={14}/></button>
                                </div>
                            )}

                            {isSelectionMode && (
                                <div className="absolute top-3 left-3 z-30">
                                  {isSelected ? <CheckSquare className="text-emerald-400 drop-shadow-lg" size={24} /> : <Square className="text-white/20" size={24} />}
                                </div>
                            )}
                            
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent pt-8">
                                <p className="text-[9px] font-black text-white truncate uppercase tracking-widest">{img.title || "Untitled"}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

        {/* UPLOAD QUEUE VIEW */}
        {activeTab === 'upload' && (
             <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-2 backdrop-blur-md">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                      <h3 className="text-xl font-black text-white flex items-center gap-3 italic uppercase"><CheckCircle2 className="text-emerald-500" size={24}/> Sync Queue</h3>
                      <p className="text-[10px] text-slate-500 font-bold mt-1.5 tracking-widest uppercase ml-9">{newUploads.length} Pending Assets</p>
                    </div>
                    <button 
                      onClick={handleUploadAll} 
                      disabled={uploading || newUploads.length === 0} 
                      className="w-full md:w-auto bg-emerald-500 text-slate-950 px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.15em] shadow-xl shadow-emerald-500/20 disabled:opacity-20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        {uploading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Publish Queue
                    </button>
                </div>

                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                    {newUploads.map(item => (
                        <div key={item.id} className="relative flex flex-col md:flex-row bg-[#0c0c0e] border border-white/5 rounded-2xl overflow-hidden shadow-xl group/card">
                            
                            {uploadProgress[item.id] !== undefined && (
                                <ProgressOverlay progress={uploadProgress[item.id]} label="Syncing" />
                            )}

                            <div className="w-full md:w-40 h-40 shrink-0 bg-black overflow-hidden">
                              <img src={item.preview} className="w-full h-full object-cover" alt="" />
                            </div>
                            
                            <div className="p-6 flex-grow flex flex-col gap-4 justify-center">
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Asset Label</label>
                                  <input 
                                    type="text" 
                                    value={item.title || ""} 
                                    onChange={(e) => setNewUploads(prev => prev.map(u => u.id === item.id ? {...u, title: e.target.value} : u))} 
                                    placeholder="Title..." 
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 outline-none transition-all font-bold italic" 
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Description</label>
                                  <textarea 
                                    rows="1" 
                                    value={item.description || ""} 
                                    onChange={(e) => setNewUploads(prev => prev.map(u => u.id === item.id ? {...u, description: e.target.value} : u))} 
                                    placeholder="Context..." 
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-xs text-white resize-none focus:border-emerald-500 outline-none transition-all font-medium" 
                                  />
                                </div>
                            </div>
                            <div className="bg-black/20 p-3 flex md:flex-col justify-center">
                               <button onClick={() => setNewUploads(prev => prev.filter(u => u.id !== item.id))} className="p-3 text-red-500/40 hover:text-red-500 transition-all"><Trash2 size={20}/></button>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        )}
      </div>

      {/* BATCH EDIT MODAL */}
      {editList && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-[#0e0e10] border border-white/10 w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95">
                  <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0e0e10] z-10">
                      <h3 className="text-lg font-black text-white flex items-center gap-3 italic uppercase"><Layout className="text-emerald-400" size={20}/> Batch Edit</h3>
                      <button onClick={() => setEditList(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-500"><X size={24}/></button>
                  </div>
                  <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                      {editList.map((item) => (
                          <div key={item.id} className="flex flex-col md:flex-row gap-6 bg-[#18181b]/50 p-6 rounded-2xl border border-white/5">
                              <div className="w-full md:w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-black border border-white/10">
                                <img src={item.image} className="w-full h-full object-cover" alt="" />
                              </div>
                              <div className="flex-grow space-y-4">
                                  <input type="text" value={item.title || ""} onChange={(e) => updateEditListField(item.id, 'title', e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-xs text-white focus:border-emerald-500 outline-none transition-all font-bold" />
                                  <textarea rows="1" value={item.description || ""} onChange={(e) => updateEditListField(item.id, 'description', e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-xs text-white focus:border-emerald-500 outline-none transition-all resize-none font-medium" />
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="p-6 border-t border-white/5 bg-[#0e0e10] flex gap-3">
                      <button onClick={() => setEditList(null)} className="flex-1 py-3 bg-white/5 text-white rounded-xl font-black uppercase text-[10px] border border-white/5">Discard</button>
                      <button onClick={handleSaveAllEdits} className="flex-[2] py-3 bg-emerald-500 text-slate-950 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/10">Commit Changes</button>
                  </div>
              </div>
          </div>
      )}

      {/* FULLSCREEN VIEWER */}
      {viewImage && (
          <div className="fixed inset-0 z-[250] bg-black/98 flex items-center justify-center p-6 backdrop-blur-2xl animate-in fade-in" onClick={() => setViewImage(null)}>
              <div className="absolute top-6 right-6 flex gap-3" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleDownload(viewImage)} className="p-3 bg-white/10 rounded-full text-white hover:bg-emerald-500 border border-white/10 transition-all"><Download size={24}/></button>
                  <button onClick={() => setViewImage(null)} className="p-3 bg-white/10 rounded-full text-white hover:bg-red-500 border border-white/10 transition-all"><X size={24}/></button>
              </div>
              <img src={viewImage.image} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-500" onClick={e => e.stopPropagation()} alt="" />
          </div>
      )}

      {/* CAMERA MODULE */}
      {cameraOpen && (
          <div className="fixed inset-0 z-[300] bg-black/98 flex items-center justify-center p-4 backdrop-blur-3xl">
              <div className="bg-[#0a0a0c] rounded-3xl overflow-hidden max-w-lg w-full border border-white/10 shadow-2xl relative animate-in zoom-in-90 duration-300">
                  <video ref={videoRef} autoPlay playsInline className="aspect-[3/4] object-cover bg-black w-full" />
                  <div className="p-8 flex justify-between items-center bg-[#0a0a0c]">
                      <button onClick={stopCamera} className="text-slate-500 font-black uppercase text-[9px] tracking-widest">Abort</button>
                      <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full p-1.5 shadow-2xl hover:scale-110 active:scale-90 transition-all">
                        <div className="w-full h-full border-4 border-slate-900 rounded-full bg-slate-100" />
                      </button>
                      <div className="w-12"></div>
                  </div>
              </div>
              <canvas ref={canvasRef} className="hidden"></canvas>
          </div>
      )}
    </div>
  );
};

export default AdminGalleryManager;