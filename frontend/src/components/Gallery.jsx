import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// Images (unchanged)
const images = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=600",
  "https://media.istockphoto.com/id/2218966877/photo/young-male-athlete-adding-weights-to-barbell-in-gym.webp?a=1&b=1&s=612x612&w=0&k=20&c=A_kY9YwsMtwUZ1rTBsysheY23NrmfCwY65FbkIo0FXY=",
  "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&q=80&w=600",
  // add more images freely
];

const INITIAL_COUNT = 6;

const Gallery = () => {
  const [showAll, setShowAll] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const visibleImages = showAll ? images : images.slice(0, INITIAL_COUNT);

  const openModal = (index) => setActiveIndex(index);
  const closeModal = () => setActiveIndex(null);

  const prevImage = () =>
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const nextImage = () =>
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <section id="gallery" className="section-padding bg-royal-800">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold font-sans mb-12 text-center">
          The <span className="text-gradient-gold">Space</span>
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleImages.map((src, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-xl aspect-[4/3] cursor-pointer"
              onClick={() => openModal(index)}
            >
              <img
                src={src}
                alt={`Gym ${index}`}
                className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-royal-gold border border-royal-gold px-4 py-2 uppercase tracking-widest text-sm font-bold">
                  View
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Show More */}
        {images.length > INITIAL_COUNT && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowAll(!showAll)}
              className="border border-royal-gold text-royal-gold px-6 py-2 rounded-full hover:bg-royal-gold hover:text-black transition"
            >
              {showAll ? "Show Less" : "Show More"}
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {activeIndex !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          {/* Close */}
          <button
            onClick={closeModal}
            className="absolute top-6 right-6 text-white hover:text-royal-gold transition"
          >
            <X size={32} />
          </button>

          {/* Left */}
          <button
            onClick={prevImage}
            className="absolute left-6 bg-black/60 border border-white/20 rounded-full 
                      p-1 text-white hover:text-royal-gold hover:border-royal-gold 
                      transition hover:scale-110"
          >

            <ChevronLeft size={40} />
          </button>

          {/* Image */}
          <div className="max-w-5xl w-full px-6">
            <img
              src={images[activeIndex]}
              alt="Full view"
              className="w-full max-h-[80vh] object-contain rounded-xl mx-auto"
            />

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition ${
                    i === activeIndex ? "bg-royal-gold" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right */}
          <button
            onClick={nextImage}
            className="absolute right-6 bg-black/60 border border-white/20 rounded-full 
                      p-1 text-white hover:text-royal-gold hover:border-royal-gold 
                      transition hover:scale-110"
          >
            <ChevronRight size={40} />
          </button>
        </div>
      )}
    </section>
  );
};

export default Gallery;
