import { Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSiteData } from "./context/SiteDataContext";
import UserView from "./components/UserView";
import AdminRoutes from "./admin/AdminRoutes";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  const { loading, error } = useSiteData();

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900">
          <Loader2 className="h-12 w-12 text-purple-500 animate-spin mb-4" />
          <h2 className="text-white text-lg animate-pulse">
            Loading The Royal Gym...
          </h2>
        </div>
      </>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/*" element={<UserView />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
