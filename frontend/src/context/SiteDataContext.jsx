import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const SiteDataContext = createContext(null);

export const SiteDataProvider = ({ children }) => {
  const [siteData, setSiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        const res = await api.get("/site_info/"); // use correct endpoint
        // If API returns list, pick first item
        setSiteData(Array.isArray(res.data) ? res.data[0] : res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load site data");
      } finally {
        setLoading(false);
      }
    };

    fetchSiteData();
  }, []);

  return (
    <SiteDataContext.Provider value={{ siteData, loading, error }}>
      {children}
    </SiteDataContext.Provider>
  );
};

// Custom hook (THIS is what you use everywhere)
// eslint-disable-next-line react-refresh/only-export-components
export const useSiteData = () => {
  const context = useContext(SiteDataContext);
  if (!context) {
    throw new Error("useSiteData must be used inside SiteDataProvider");
  }
  return context;
};
