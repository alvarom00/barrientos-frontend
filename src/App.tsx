import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PropertyDetail from "./pages/PropertyDetail";
import Login from "./pages/Login";
import Campos from "./pages/Campos";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PropertyForm from "./pages/PropertyForm";
import SiteLayout from "./components/SiteLayout";
import ErrorPage from "./pages/ErrorPage";
import Publicar from "./pages/Publicar";
import WhatsAppFab from "./components/WhatsAppFab";
import Nosotros from "./pages/Nosotros";

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        {/* Layout envuelve todo excepto el login */}
        <Route element={<SiteLayout />}>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/publicar" element={<Publicar />} />
          <Route path="/nosotros" element={<Nosotros />} />

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
          <Route path="/comprar" element={<Campos operationType="Venta" />} />
          <Route
            path="/alquilar"
            element={<Campos operationType="Arrendamiento" />}
          />
          <Route path="/campos" element={<Campos />} />
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
      <WhatsAppFab />
    </BrowserRouter>
    
    </>
    
  );
}

export default App;
