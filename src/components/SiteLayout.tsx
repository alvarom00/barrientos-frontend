import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function SiteLayout() {
  return (
    <>
      {/* Fondo con molino y aspas perfectamente alineadas */}
      <div className="campo-bg-stage">
        <img src="/bg-campo.png" alt="" className="campo-bg-img" />
        <img
          src="/aspas-molino.png"
          alt=""
          className="campo-aspas-img"
          draggable={false}
        />
      </div>
      {/* Resto del layout (navbar, main, etc) */}
      <div className="relative z-10">
        <Navbar />
        <main className="max-w-5xl mx-auto p-4 md:p-8 pt-[72px] md:pt-[88px]">
          <Outlet />
        </main>
        <footer className="py-6 text-center text-xs text-neutral-500">
          Hecho por vos © {new Date().getFullYear()}
        </footer>
      </div>
    </>
  );
}
