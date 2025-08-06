import { Outlet } from "react-router-dom";
import clsx from "clsx";
import Navbar from "./Navbar";

// Puedes definir el fondo del sitio (usando Tailwind)
// y la animación de fade-in en el home
export default function SiteLayout() {

  return (
    <div
      className={clsx(
        "min-h-screen w-full bg-gradient-to-br from-[#e6e9f0] to-[#eef2f3] dark:from-[#181824] dark:to-[#1a1a2e]",
        "text-neutral-900 dark:text-neutral-200 transition-colors duration-300"
      )}
    >
      <Navbar />
      <main className="max-w-5xl mx-auto p-4 md:p-8 pt-[72px] md:pt-[88px]">
        <Outlet />
      </main>
      <footer className="py-6 text-center text-xs text-neutral-500">
        Hecho por vos © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
