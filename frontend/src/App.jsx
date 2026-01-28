import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import DailyStatus from './components/DailyStatus';
import Pricing from './components/Pricing';
import Gallery from './components/Gallery';
import Footer from './components/Footer';

function App() {
  return (
    <div className="bg-royal-900 text-white min-h-screen font-body selection:bg-royal-gold selection:text-black">
      <Navbar />
      <Hero />
      <DailyStatus />
      <Features />
      <Pricing />
      <Gallery />
      <Footer />
    </div>
  );
}

export default App;