import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Calendar, MapPin, Loader2, Star,
    X, ZoomIn, Download, ImageIcon, ChevronDown, ChevronUp
} from 'lucide-react';
import { server_domain } from "../Helpers/Domain";

const API_URL = `${server_domain}api/events/`;

const EventsShowcase = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI States
    const [lightbox, setLightbox] = useState({ isOpen: false, url: null, title: '' });
    const [expandedDesc, setExpandedDesc] = useState({});
    const [expandedHigh, setExpandedHigh] = useState({});

    // Carousel States
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(API_URL);
                setEvents(response.data);
            } catch (error) {
                console.error("Failed to load events:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // --- CAROUSEL LOGIC ---
    const handleScroll = () => {
        if (!carouselRef.current) return;
        const container = carouselRef.current;
        const scrollCenter = container.scrollLeft + container.clientWidth / 2;

        let closestIndex = 0;
        let minDistance = Infinity;

        // Find which card is closest to the center of the screen
        Array.from(container.children).forEach((child, index) => {
            const childCenter = child.offsetLeft + child.clientWidth / 2;
            const distance = Math.abs(scrollCenter - childCenter);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }
        });

        if (activeIndex !== closestIndex) {
            setActiveIndex(closestIndex);
        }
    };

    const scrollToEvent = (index) => {
        if (!carouselRef.current) return;
        const container = carouselRef.current;
        const child = container.children[index];
        if (child) {
            container.scrollTo({
                left: child.offsetLeft - container.clientWidth / 2 + child.clientWidth / 2,
                behavior: 'smooth'
            });
        }
    };

    // Toggle Handlers
    const toggleDesc = (id) => setExpandedDesc(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleHigh = (id) => setExpandedHigh(prev => ({ ...prev, [id]: !prev[id] }));

    const downloadImage = async (url, eventTitle, index) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            const cleanTitle = eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            link.download = `${cleanTitle}_gallery_${index + 1}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (e) {
            window.open(url, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-[#06090f] text-slate-200 py-10 font-sans selection:bg-purple-500/30 overflow-hidden relative">

            {/* Inline style to hide ugly default scrollbars but keep functionality */}
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <div className="max-w-[1600px] mx-auto w-full">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 px-4 sm:px-6 lg:px-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight flex items-center justify-center md:justify-start gap-2">
                            <Calendar className="text-purple-500" size={24} />
                            <span>Event <span className="text-purple-500">Directory</span></span>
                        </h1>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-800 rounded-full px-3 py-1.5 flex items-center gap-2 backdrop-blur-md shadow-lg">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                            {events.length} Active Events
                        </span>
                    </div>
                </div>

                {/* --- CAROUSEL VIEW --- */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="animate-spin text-purple-500 mb-3" size={28} />
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Syncing...</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-16 mx-4 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
                        <p className="text-slate-500 text-xs font-medium">No events scheduled right now.</p>
                    </div>
                ) : (
                    <div className="relative w-full pb-12">
                        {/* Scrollable Track */}
                        <div
                            ref={carouselRef}
                            onScroll={handleScroll}
                            className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar items-center py-10 px-[10vw] md:px-[35vw] gap-6 scroll-smooth"
                        >
                            {events.map((event, index) => {
                                const isActive = index === activeIndex;

                                return (
                                    <div
                                        key={event.id}
                                        onClick={() => !isActive && scrollToEvent(index)}
                                        className={`shrink-0 snap-center w-[85vw] sm:w-[340px] lg:w-[400px] flex flex-col rounded-[2rem] overflow-hidden transition-all duration-700 ease-out cursor-pointer
                                            ${isActive
                                            ? 'bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-purple-500/50 scale-100 opacity-100 shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)] z-20'
                                            : 'bg-slate-900/40 border border-white/5 scale-[0.85] opacity-40 blur-[1px] hover:opacity-60 z-10'
                                        }`}
                                    >
                                        {/* Cover Image */}
                                        <div className="relative h-40 bg-slate-950 overflow-hidden shrink-0">
                                            {event.files && event.files.length > 0 ? (
                                                <img
                                                    src={event.files[0].file_url}
                                                    className="w-full h-full object-cover transition-transform duration-700"
                                                    alt={event.title}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-slate-900/50">
                                                    <ImageIcon size={24} className="mb-1 opacity-40"/>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                                            {/* Date Badge */}
                                            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 flex flex-col items-center text-center shadow-lg">
                                                <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest leading-none mb-1">
                                                    {new Date(event.timestamp).toLocaleString('default', { month: 'short' })}
                                                </span>
                                                <span className="text-xl font-black text-white leading-none">
                                                    {new Date(event.timestamp).getDate()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content Body */}
                                        <div className="p-5 flex-grow flex flex-col">
                                            <div className="flex items-center gap-1.5 text-purple-400 mb-2">
                                                <MapPin size={12} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest truncate">{event.location}</span>
                                            </div>

                                            <h2 className="text-xl font-black text-white uppercase italic leading-tight mb-4">
                                                {event.title}
                                            </h2>

                                            {/* Highlights */}
                                            <div className="bg-black/40 rounded-xl p-3 mb-4 border border-white/5 relative">
                                                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-purple-500 rounded-l-xl"></div>
                                                <div className="flex items-center gap-1.5 text-[9px] font-black text-purple-400 uppercase tracking-widest mb-2">
                                                    <Star size={12} /> Highlights
                                                </div>
                                                <div
                                                    className={`prose prose-invert prose-p:text-[11px] prose-p:leading-snug prose-p:my-0 prose-strong:text-white prose-a:text-purple-400 prose-ul:my-0 prose-ul:pl-4 prose-li:text-[11px] text-slate-300 transition-all duration-300 ${expandedHigh[event.id] || !isActive ? 'line-clamp-2' : ''}`}
                                                    dangerouslySetInnerHTML={{ __html: event.highlights }}
                                                />
                                                {isActive && event.highlights?.length > 80 && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleHigh(event.id); }}
                                                        className="mt-2 text-[9px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest flex items-center gap-1 transition-colors"
                                                    >
                                                        {expandedHigh[event.id] ? <><ChevronUp size={10} /> Less</> : <><ChevronDown size={10} /> More</>}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Description */}
                                            <div className="relative flex-grow flex flex-col mb-2">
                                                <div
                                                    className={`text-[11px] text-slate-400 leading-relaxed font-medium transition-all duration-300 ${expandedDesc[event.id] || !isActive ? 'line-clamp-3' : ''}`}
                                                    dangerouslySetInnerHTML={{ __html: event.description }}
                                                />
                                                {isActive && event.description?.length > 120 && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleDesc(event.id); }}
                                                        className="mt-2 text-[9px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest flex items-center gap-1 self-start transition-colors"
                                                    >
                                                        {expandedDesc[event.id] ? <><ChevronUp size={10} /> Less</> : <><ChevronDown size={10} /> More</>}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Gallery Thumbnails (Only interactive if active) */}
                                        {event.files && event.files.length > 0 && (
                                            <div className="bg-slate-950/80 p-4 border-t border-white/5 shrink-0">
                                                <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar snap-x">
                                                    {event.files.map((fileObj, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden group/thumb snap-start border border-white/10 bg-black"
                                                        >
                                                            <img
                                                                src={fileObj.file_url}
                                                                alt="thumb"
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-110"
                                                            />
                                                            {isActive && (
                                                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-1.5 backdrop-blur-[1px]">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); setLightbox({ isOpen: true, url: fileObj.file_url, title: event.title }); }}
                                                                        className="text-white hover:text-purple-400 transition-colors"
                                                                    >
                                                                        <ZoomIn size={12} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); downloadImage(fileObj.file_url, event.title, idx); }}
                                                                        className="text-white hover:text-blue-400 transition-colors"
                                                                    >
                                                                        <Download size={12} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* --- PAGINATION DOTS --- */}
                        <div className="flex justify-center items-center gap-2 mt-6">
                            {events.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => scrollToEvent(index)}
                                    className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                                        activeIndex === index
                                            ? 'w-8 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]'
                                            : 'w-2 bg-slate-700 hover:bg-slate-500'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* --- LIGHTBOX MODAL --- */}
            {lightbox.isOpen && (
                <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent z-10">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1 max-w-[60%]">
                            {lightbox.title}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => downloadImage(lightbox.url, lightbox.title, 0)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-md text-white text-[9px] font-black uppercase tracking-widest transition-colors"
                            >
                                <Download size={12} /> Save
                            </button>
                            <button
                                onClick={() => setLightbox({ isOpen: false, url: null, title: '' })}
                                className="p-1.5 bg-white/10 hover:bg-red-500 rounded-md text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="relative w-full h-full flex items-center justify-center" onClick={() => setLightbox({ isOpen: false, url: null, title: '' })}>
                        <img
                            src={lightbox.url}
                            alt="Fullscreen view"
                            className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl border border-white/5 animate-in zoom-in-95 duration-300"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventsShowcase;