import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function SiteLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-main-cover">
      <Navbar />
      
      <main className="flex-1 max-w-5xl mx-auto p-4 md:p-8 pt-[128px] md:pt-[144px] w-full">
        <Outlet />
      </main>

      <footer className="py-6 text-center text-xs text-white">
        Barrientos Propiedades © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
