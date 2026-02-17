import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, HashRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import {SiteDataProvider} from "./context/SiteDataContext"


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SiteDataProvider>
      <HashRouter future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}>
        <div className="bg-royal-900 text-white min-h-screen font-body selection:bg-royal-gold selection:text-black">
          <App />
        </div>
      </HashRouter>
    </SiteDataProvider>
  </StrictMode>
);
