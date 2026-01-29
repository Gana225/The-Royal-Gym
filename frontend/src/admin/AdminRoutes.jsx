//AdminRoutes
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import { loadAccessToken } from "../api/auth";
import { setAuthToken } from "../api/axios";
import Navbar from "../components/Navbar";

const RequireAuth = ({ children }) => {
  const token = loadAccessToken();
  if (token) {
    setAuthToken(token);
    return children;
  }
  return <Navigate to="login" replace />;
};

export default function AdminRoutes() {
  return (
    <>
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/dashboard" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
    </Routes>
    </>
  );
}