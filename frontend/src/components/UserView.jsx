import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Hero from './Hero';
import Features from './Features';
import DailyStatus from './DailyStatus';
import Pricing from './Pricing';
import Gallery from './Gallery';
import AdminGalleryManager from "../admin/AdminGalleryManager"
import { Loader2 } from 'lucide-react'; // Assuming you have lucide-react installed

// Ensure this import path is correct for your project structure
import { server_domain } from "../Helpers/Domain";

const UserView = () => {
  const [galleryData, setGalleryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await axios.get(`${server_domain}api/gallery/`);
        setGalleryData(response.data);
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  return (
    <>
      <Hero />
      <DailyStatus />
      <Features />
      <Pricing />
      
      {loading ? (
        <div className="h-96 flex items-center justify-center bg-royal-800">
           <Loader2 className="w-10 h-10 text-royal-gold animate-spin" />
        </div>
      ) : (
        <Gallery images={galleryData} />
      )}
    </>
  );
};

export default UserView;