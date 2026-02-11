import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-scroll';
import { useSiteData } from "../context/SiteDataContext";

const Hero = () => {
  const { siteData } = useSiteData();

  return (
    <section
      id="home"
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
    >
      {/* FIX: 
         1. Removed the <img> tag.
         2. Added style={{ backgroundImage... }} to apply the dynamic URL.
         3. Kept bg-cover, bg-center, bg-no-repeat to handle sizing.
      */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:bg-fixed z-0"
        style={{ backgroundImage: `url(${siteData.main_bg_image})` }}
      />
      {/* {console.log(siteData.main_bg_image)} */}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-royal-900 z-10"></div>

      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-royal-gold font-medium tracking-[0.3em] uppercase mb-4 text-sm md:text-base">
            Premium Fitness Experience
          </h2>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-sans text-white mb-6 leading-tight">
            SCULPT YOUR <br />
            <span className="text-gradient-gold">LEGACY</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light">
            Where luxury meets performance. Join the elite community dedicated to physical excellence.
          </p>
          
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <button className="px-8 py-4 bg-royal-gold text-white font-bold uppercase tracking-wider rounded-none hover:bg-yellow-400 transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              Join Now
            </button>
            <Link to="membership" smooth={true} duration={500}>
              <button className="px-8 py-4 border border-royal-gold text-royal-gold font-bold uppercase tracking-wider rounded-none hover:bg-royal-gold hover:text-black transition-all duration-300">
                View Plans
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ChevronDown className="text-white/50 w-8 h-8" />
      </motion.div>
    </section>
  );
};

export default Hero;