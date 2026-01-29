//App.jsx
import { Routes, Route } from "react-router-dom";
import UserView from "./components/UserView";
import AdminRoutes from "./admin/AdminRoutes";

function App() {
  return (
    <>
    <Routes>
      <Route path="/*" element={<UserView/>}/>
      <Route path="/admin/*" element={<AdminRoutes/>}/>
    </Routes>
    </>
  );
}

export default App;