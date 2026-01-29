import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }} basename="/The-Royal-Gym">
      <div className="bg-royal-900 text-white min-h-screen font-body selection:bg-royal-gold selection:text-black">
        <Navbar />
        <App />
        <Footer />
      </div>
    </Router>
  </StrictMode>
);
