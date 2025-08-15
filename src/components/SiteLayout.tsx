import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function SiteLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-main-cover">
      {/* Navbar fijo */}
      <Navbar />

      {/* Contenido */}
      <main className="flex-1 max-w-5xl mx-auto p-4 md:p-8 pt-[128px] md:pt-[144px] w-full">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-[#2c2e3e] text-white border-t border-[#514737]">
        <div className="max-w-6xl mx-auto px-4 py-10 grid gap-10 md:grid-cols-3">
          {/* Columna izquierda: slogan */}
          <div className="flex flex-col justify-center md:items-start items-center text-center md:text-left">
            <p className="text-base md:text-lg tracking-wide text-white" style={{ fontFamily: "'PT Serif', serif" }}>
              CONFIANZA Y DEDICACIÓN.
            </p>
          </div>

          {/* Columna centro: contacto */}
          <div className="text-center">
            <p className="uppercase text-xs font-semibold tracking-wider text-white/70">
              Encontranos en
            </p>
            <div className="mt-2 flex items-start justify-center gap-2">
              {/* Icono ubicación */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mt-0.5"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
              </svg>
              <address className="not-italic text-sm text-white/80 max-w-[220px]">
                Las Heras 2849, Bahía Blanca, Provincia de Buenos Aires
              </address>
            </div>
            <a
              href="tel:+5492914421242"
              className="mt-2 inline-flex items-center gap-2 text-base font-semibold hover:opacity-90 transition"
              aria-label="Llamar al 2914421242"
            >
              {/* Icono teléfono */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6.62 10.79a15.478 15.478 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z" />
              </svg>
              2914421242
            </a>
          </div>

          {/* Columna derecha: redes */}
          <div className="text-center md:text-right">
            <p className="uppercase text-xs font-semibold tracking-wider text-white/70">
              Seguinos en
            </p>
            <div className="mt-3 flex justify-center md:justify-end gap-3">
              <a
                href="https://www.instagram.com/barrientos_propiedades"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-white/10 hover:bg-white/15 transition"
              >
                {/* Instagram */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm0 2h10a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3zm5 2.75a6.25 6.25 0 100 12.5 6.25 6.25 0 000-12.5zm0 2a4.25 4.25 0 110 8.5 4.25 4.25 0 010-8.5zM18.5 5.5a1 1 0 100 2 1 1 0 000-2z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/people/Barrientos-Propiedades/61567855262155"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-white/10 hover:bg-white/15 transition"
              >
                {/* Facebook */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.02H7.9v-2.9h2.54V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.77l-.44 2.9h-2.33V22c4.78-.75 8.44-4.91 8.44-9.93z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Línea inferior */}
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-4 text-center text-xs text-white/60" style={{ fontFamily: "'PT Serif', serif" }}>
            Barrientos Propiedades © {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  );
}
