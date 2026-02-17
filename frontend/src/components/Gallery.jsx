import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Info, Eye, Download } from 'lucide-react';

const INITIAL_COUNT = 8; 
const MAX_DESC_LENGTH = 80;

const Gallery = ({ images = [] }) => {
  const [showAll, setShowAll] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null); // Lightbox
  const [infoPopup, setInfoPopup] = useState(null);     // Info Modal

  // --- RESTORED LOGIC: Visibility ---
  const visibleImages = showAll ? images : images.slice(0, INITIAL_COUNT);

  // --- RESTORED LOGIC: Modal Handlers ---
  const openImageModal = (index) => {
    setActiveIndex(index);
    setInfoPopup(null);
  };
  
  const closeImageModal = () => setActiveIndex(null);

  const prevImage = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // --- RESTORED LOGIC: Text Truncation ---
  const renderDescription = (text, item) => {
    if (!text) return null;
    
    if (text.length <= MAX_DESC_LENGTH) {
        return <p className="text-gray-400 text-xs mt-2 leading-relaxed">{text}</p>;
    }
    
    return (
      <p className="text-gray-400 text-xs mt-2 leading-relaxed">
        {text.substring(0, MAX_DESC_LENGTH)}...
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setInfoPopup(item);
          }}
          className="ml-1 text-amber-500 hover:text-amber-400 font-bold underline underline-offset-2"
        >
          Read More
        </button>
      </p>
    );
  };

  return (
    <section id="gallery" className="py-24 bg-[#0a0a0b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase italic">
            THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600">SPACE</span>
          </h2>
          <div className="w-20 h-1 bg-amber-500 mx-auto mt-4 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)]"></div>
        </div>

        {/* --- GRID LAYOUT --- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
          {visibleImages.map((item, index) => (
            <div
              key={item.id || index}
              className="group bg-[#121214] border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-amber-500/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-500 flex flex-col"
              onClick={() => openImageModal(index)}
            >
              {/* Image Container */}
              <div className="relative h-48 sm:h-56 overflow-hidden bg-black">
                <img
                  src={item.image}
                  alt={item.title || `Gallery ${index}`}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                />

                {/* Overlay UI */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="p-3 bg-white/10 rounded-full backdrop-blur-md border border-white/20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <Maximize2 size={22} className="text-amber-400" />
                    </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="p-5 flex flex-col flex-grow">
                {item.title ? (
                    <h3 className="text-white font-bold text-sm md:text-base truncate group-hover:text-amber-500 transition-colors">
                      {item.title}
                    </h3>
                ) : (
                    <h3 className="text-gray-600 font-medium text-sm italic">Gallery Image</h3>
                )}

                {renderDescription(item.description, item)}
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {images.length > INITIAL_COUNT && (
          <div className="text-center mt-16">
            <button
              onClick={() => setShowAll(!showAll)}
              className="group relative px-10 py-3 overflow-hidden rounded-full border border-amber-500/50 text-amber-500 font-bold uppercase text-xs tracking-[0.2em] hover:text-black transition-colors duration-300"
            >
              <span className="absolute inset-0 bg-amber-500 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
              <span className="relative z-10">{showAll ? "Show Less" : "View All Photos"}</span>
            </button>
          </div>
        )}
      </div>

      {/* --- INFO POPUP (RESTORED LOGIC & UI) --- */}
      {infoPopup && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div 
            className="bg-[#161618] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-64 w-full relative">
                <img src={infoPopup.image} alt="" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setInfoPopup(null)}
                  className="absolute top-4 right-4 bg-black/60 p-2 rounded-full text-white hover:bg-amber-500 transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#161618] to-transparent"></div>
            </div>

            <div className="px-8 pb-8 -mt-6 relative">
                <h3 className="text-2xl font-bold text-white mb-4">{infoPopup.title || "Details"}</h3>
                <div className="text-gray-400 text-sm leading-relaxed max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {infoPopup.description}
                </div>
                <button 
                    onClick={() => setInfoPopup(null)}
                    className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                >
                    Close
                </button>
            </div>
          </div>
        </div>
      )}

      {/* --- LIGHTBOX (RESTORED LOGIC & UI) --- */}
      {activeIndex !== null && (
        <div className="fixed inset-0 bg-black/98 z-[150] flex items-center justify-center animate-in fade-in duration-300">
          
          {/* Top Controls */}
          <div className="absolute top-0 w-full p-6 flex justify-between items-center z-[160]">
             <span className="text-white/40 font-mono text-xs uppercase tracking-widest">
                {activeIndex + 1} / {images.length}
             </span>
             <button onClick={closeImageModal} className="text-white hover:text-amber-500 transition p-2 bg-white/5 rounded-full">
                <X size={28} />
             </button>
          </div>

          <button onClick={prevImage} className="absolute left-4 md:left-8 bg-white/5 p-4 rounded-full text-white hover:bg-amber-500 hover:text-black transition-all z-[160]">
            <ChevronLeft size={32} />
          </button>

          <div className="w-full h-full p-4 flex flex-col items-center justify-center">
            <img
              src={images[activeIndex].image}
              alt=""
              className="max-w-full max-h-[80vh] object-contain rounded shadow-2xl"
            />
            {images[activeIndex].title && (
                <div className="mt-8 text-center animate-in slide-in-from-bottom-2">
                    <p className="text-white font-bold text-lg tracking-[0.1em] uppercase italic">
                        {images[activeIndex].title}
                    </p>
                    <div className="w-12 h-0.5 bg-amber-500 mx-auto mt-2"></div>
                </div>
            )}
          </div>

          <button onClick={nextImage} className="absolute right-4 md:right-8 bg-white/5 p-4 rounded-full text-white hover:bg-amber-500 hover:text-black transition-all z-[160]">
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </section>
  );
};

export default Gallery;