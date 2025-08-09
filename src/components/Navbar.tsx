import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const navItems = [
  { label: "Inicio", to: "/" },
  { label: "Vender o arrendar mi campo", to: "/publicar" },
  { label: "Comprar un campo", to: "/comprar" },
  { label: "Alquilar un campo", to: "/alquilar" },
  { label: "Todos los campos", to: "/campos" },
  { label: "Nosotros", to: "/nosotros" },
];

const menuVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, duration: 0.32 },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { type: "spring" as const, duration: 0.22 },
  },
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Bloquea el scroll cuando el menú está abierto
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <nav className="fixed w-full z-1100 bg-gris backdrop-blur-md shadow-xs border-b border-crema">
      <div className="flex items-center justify-between px-4 py-2 sm:px-8">
        <NavLink
          to="/"
          className="flex items-center gap-3 font-bold text-xl sm:text-3xl text-[#b2914a] whitespace-nowrap hover:opacity-90 transition"
          aria-label="Ir al inicio"
        >
          <img
            src="/barrientos-logo.png"
            className="h-15 sm:h-32 w-auto drop-shadow-md"
            alt="Campos Barrientos"
          />
          <span>Campos Barrientos</span>
        </NavLink>

        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-2 border-none bg-primary text-[#6B5432] rounded-lg shadow font-bold hover:bg-accent active:scale-95 transition-all"
          aria-label="Abrir menú"
        >
          <Menu size={28} color="#b2914a" />
        </button>

        {createPortal(
          <AnimatePresence>
            {isMenuOpen && (
              <>
                {/* Overlay */}
                <motion.div
                  className="fixed inset-0 z-1000 bg-black/40 backdrop-blur-[2px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  onClick={() => setIsMenuOpen(false)}
                />
                {/* MOBILE & DESKTOP MENU */}
                <motion.aside
                  className={clsx(
                    "menu-panel fixed top-0 right-0 h-full w-80 max-w-[95vw] z-1200",
                    "border-l border-white/10", // borde sutil (podés quitarlo)
                    "backdrop-blur-md shadow-none", // sin sombra para que no aparezcan las líneas
                    "flex flex-col text-[#f5f5f5]"
                  )}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={menuVariants}
                >
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="absolute top-5 right-5 p-2 border-none bg-primary text-[#6B5432] rounded-full shadow hover:bg-accent active:scale-95 transition"
                    aria-label="Cerrar menú"
                  >
                    <X size={28} color="#b2914a" />
                  </button>

                  <nav className="flex flex-col mt-20 gap-4 px-6 pb-8">
                    {navItems.map((item) => (
                      <motion.div
                        key={item.to}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="rounded-lg"
                      >
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            clsx(
                              // botón sutil, sin borde, con leve overlay
                              "block w-full text-center px-4 py-3 font-semibold text-lg rounded-lg transition-all duration-200",
                              "bg-white/20 text-white hover:bg-white/28", // normal/hover
                              isActive && "bg-white/32 ring-1 ring-white/25" // activo
                            )
                          }
                          style={{ letterSpacing: 0.5 }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.label}
                        </NavLink>
                      </motion.div>
                    ))}
                  </nav>
                </motion.aside>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    </nav>
  );
}
