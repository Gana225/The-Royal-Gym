//AdminRoutes
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import { loadAccessToken } from "../api/auth";
import { setAuthToken } from "../api/axios";
import AdminGalleryManagement from "../admin/AdminGalleryManager";
import EditSiteInfo from "./EditSiteInfo"
import EventManager from "./EventManager.jsx";
import LiveUpdateManager from "./AdminLiveUpdates.jsx";

const RequireAuth = ({ children }) => {
  const token = loadAccessToken();
  if (token) {
    setAuthToken(token);
    return children;
  }
  return <Navigate to="/admin/login" replace />;
};

export default function AdminRoutes() {
  return (
    <>
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/dashboard" element={<RequireAuth><AdminDashboard/></RequireAuth>} />
      <Route path="/edit" element={<RequireAuth><EditSiteInfo/></RequireAuth>}/>
      <Route path="/gallery-management" element={<RequireAuth><AdminGalleryManagement/></RequireAuth>}/>
      <Route path="/event-manager" element={<RequireAuth><EventManager /></RequireAuth>}/>
      <Route path="/live-update-manager" element={<RequireAuth><LiveUpdateManager/></RequireAuth>}/>
    </Routes>
    </>
  );
}