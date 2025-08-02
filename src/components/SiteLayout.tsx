import { Outlet, useLocation } from "react-router-dom";
import clsx from "clsx";

// Puedes definir el fondo del sitio (usando Tailwind)
// y la animación de fade-in en el home
export default function SiteLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div className={clsx(
      "min-h-screen w-full bg-gradient-to-br from-[#e6e9f0] to-[#eef2f3] dark:from-[#181824] dark:to-[#1a1a2e]",
      "text-neutral-900 dark:text-neutral-200 transition-colors duration-300",
      isHome && "animate-fade-in"
    )}>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#202032]/80 backdrop-blur border-b border-border py-3 px-4 flex items-center justify-between">
        <h1 className="font-bold text-xl tracking-tight text-primary">Inmobiliaria</h1>
        {/* Aquí puedes poner tu menú, login, darkmode, etc */}
      </header>
      <main className="max-w-5xl mx-auto p-4 md:p-8">
        <Outlet />
      </main>
      <footer className="py-6 text-center text-xs text-neutral-500">Hecho por vos © {new Date().getFullYear()}</footer>
    </div>
  );
}
