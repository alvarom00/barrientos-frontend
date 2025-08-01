import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PropertyDetail from "./pages/PropertyDetail"
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PropertyForm from "./pages/PropertyForm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />

        {/* Admin login */}
        <Route path="/admin/login" element={<Login />} />

        {/* Protected admin pages */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/create"
          element={
            <ProtectedRoute>
              <PropertyForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/edit/:id"
          element={
            <ProtectedRoute>
              <PropertyForm />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
