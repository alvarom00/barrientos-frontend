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

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < breakpoint
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);
  return isMobile;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Bloquea el scroll cuando el menú está abierto
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <nav className="fixed w-full z-1100 transition-all duration-300 bg-background/80 backdrop-blur-md shadow-xs">
      <div className="flex items-center justify-between px-4 py-2 sm:px-8">
        <span className="text-xl font-bold text-primary">
          Inmobiliaria Rural
        </span>

        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-2 text-foreground z-1200 border border-primary rounded-lg hover:bg-primary/10 active:scale-95 transition-all"
          aria-label="Abrir menú"
        >
          <Menu size={28} />
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
                {/* Mobile: menú centrado, violeta fuerte */}
                {isMobile ? (
                  // MENÚ FULLSCREEN MOBILE
                  <motion.aside
                    className="fixed top-0 right-0 h-full w-80 max-w-[95vw] z-1200 bg-gray-800/90 shadow-2xl border-l border-primary flex flex-col"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={menuVariants}
                  >
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="absolute top-5 right-5 p-2 border border-primary rounded-full bg-background/90 hover:bg-primary/30 text-primary hover:text-primary-foreground shadow-lg transition"
                      aria-label="Cerrar menú"
                    >
                      <X size={28} />
                    </button>
                    <nav className="flex flex-col mt-20 gap-5 px-6">
                      {navItems.map((item) => (
                        <motion.div
                          key={item.to}
                          whileHover={{
                            scale: 1.05,
                            boxShadow: "0 8px 28px rgba(59,49,140,0.17)",
                            backgroundColor: "#3b318c",
                          }}
                          whileTap={{ scale: 0.97 }}
                          className="rounded-xl"
                        >
                          <NavLink
                            to={item.to}
                            className={({ isActive }) =>
                              clsx(
                                "w-full block text-center border-2 border-white rounded-xl px-4 py-4 font-bold text-lg shadow-lg transition-all duration-200",
                                // Botón activo SOLO en mobile: fondo blanco, texto violeta intenso
                                isActive
                                  ? "bg-white text-primary"
                                  : "bg-transparent text-white hover:bg-[#4232a8] hover:text-yellow-300"
                              )
                            }
                            style={{
                              letterSpacing: 0.5,
                            }}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {item.label}
                          </NavLink>
                        </motion.div>
                      ))}
                    </nav>
                  </motion.aside>
                ) : (
                  // Desktop: lateral animado, dark/light, animaciones
                  <motion.aside
                    className="fixed top-0 right-0 h-full w-80 max-w-[90vw] z-1200 bg-white dark:bg-[#232347] shadow-2xl border-l border-primary flex flex-col"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={menuVariants}
                  >
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="absolute top-5 right-5 p-2 text-foreground border border-primary rounded-full bg-background hover:bg-primary/10"
                      aria-label="Cerrar menú"
                    >
                      <X size={28} />
                    </button>
                    <nav className="flex flex-col mt-16 gap-4 px-6">
                      {navItems.map((item) => (
                        <motion.div
                          key={item.to}
                          whileHover={{
                            scale: 1.045,
                            boxShadow: "0 8px 24px rgba(59,49,140,0.14)",
                            backgroundColor: "#3b318c",
                            color: "#fff",
                          }}
                          whileTap={{ scale: 0.98 }}
                          className="rounded-lg"
                        >
                          <NavLink
                            to={item.to}
                            className={({ isActive }) =>
                              clsx(
                                "flex items-center border border-primary rounded-lg px-4 py-3 font-semibold text-lg transition-all duration-200 bg-background/80",
                                "hover:bg-primary hover:text-yellow-300 hover:shadow-lg focus:bg-primary focus:text-yellow-300 focus:shadow",
                                isActive
                                  ? "bg-primary text-yellow-300 shadow"
                                  : "text-foreground"
                              )
                            }
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {item.label}
                          </NavLink>
                        </motion.div>
                      ))}
                    </nav>
                  </motion.aside>
                )}
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    </nav>
  );
}
