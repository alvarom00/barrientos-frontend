import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PropertyDetail from "./pages/PropertyDetail";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PropertyForm from "./pages/PropertyForm";
import SiteLayout from "./components/SiteLayout";
import ErrorPage from "./pages/ErrorPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout envuelve todo excepto el login */}
        <Route element={<SiteLayout />}>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />

          {/* Admin (protegidas) */}
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
          <Route
            path="/error500"
            element={
              <ErrorPage
                code={500}
                title="Error del servidor"
                message="Ocurrió un error inesperado. Intente más tarde."
              />
            }
          />
          <Route path="*" element={<ErrorPage />} />
        </Route>
        {/* Login fuera del layout */}
        <Route path="/admin/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
