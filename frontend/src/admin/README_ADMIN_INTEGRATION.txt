/*
Add this AdminRoutes into your main Router in App.jsx or main.jsx.
Example (React Router v6):

import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminRoutes from "./admin/AdminRoutes";
import UserApp from "./UserApp"; // your existing app

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/*" element={<UserApp />} />
      </Routes>
    </BrowserRouter>
  );
}

*/