import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { getAssetUrl } from "../utils/getAssetUrl";
import { motion, AnimatePresence } from "framer-motion";

interface LightboxModalProps {
  media: { type: "image" | "video"; url: string }[];
  initialIndex: number;
  onClose: () => void;
  currentIndex: number;
  setCurrentIndex: (idx: number) => void;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    zIndex: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
    zIndex: 0,
  }),
};

const swipeConfidenceThreshold = 60;

export function LightboxModal({
  media,
  currentIndex,
  onClose,
}: LightboxModalProps) {

  const [[index, direction], setIndex] = useState<[number, number]>([
    currentIndex,
    0,
  ]);

  function handleTouchStart(e: React.TouchEvent) {
    xRef.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - xRef.current;
    if (Math.abs(dx) > swipeConfidenceThreshold) {
      if (dx < 0) paginate(1); // swipe izquierda
      else paginate(-1); // swipe derecha
    }
  }

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const paginate = (newDirection: number) => {
    setIndex([
      (index + newDirection + media.length) % media.length,
      newDirection,
    ]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") paginate(-1);
      if (e.key === "ArrowRight") paginate(1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line
  }, [index, media.length]);

  const xRef = useRef(0);

  return createPortal(
    <div
      className="fixed inset-0 z-1500 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close button */}
      <button
        className="absolute top-6 right-6 text-white bg-black/50 rounded-full p-2 hover:bg-black/80 transition z-2000"
        onClick={onClose}
        aria-label="Cerrar"
      >
        <X size={32} />
      </button>
      {/* Prev */}
      <button
        className={clsx(
          "absolute left-4 md:left-12 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/70 rounded-full p-2 transition",
          media.length < 2 && "opacity-0 pointer-events-none"
        )}
        onClick={() => paginate(-1)}
        tabIndex={0}
        aria-label="Anterior"
      >
        <ChevronLeft size={32} />
      </button>
      {/* Next */}
      <button
        className={clsx(
          "absolute right-4 md:right-12 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/70 rounded-full p-2 transition",
          media.length < 2 && "opacity-0 pointer-events-none"
        )}
        onClick={() => paginate(1)}
        tabIndex={0}
        aria-label="Siguiente"
      >
        <ChevronRight size={32} />
      </button>
      {/* Media con animación */}
      <div className="max-w-full max-h-[90vh] flex items-center justify-center relative select-none">
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={index}
            className="w-full h-full flex items-center justify-center"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, type: "tween", ease: "easeInOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.9}
            onDragEnd={(_, { offset }) => {
              const swipe = Math.abs(offset.x) > swipeConfidenceThreshold;
              if (swipe) {
                if (offset.x < 0) paginate(1); // izquierda
                else paginate(-1); // derecha
              }
            }}
            style={{ touchAction: "pan-y" }} // Permite scroll vertical si es necesario
          >
            {media[index].type === "image" ? (
              <img
                src={getAssetUrl(media[index].url)}
                alt={`Vista ${index + 1}`}
                className="rounded-lg shadow-xl max-w-full max-h-[80vh] object-contain bg-black"
              />
            ) : (
              <video
                src={getAssetUrl(media[index].url)}
                controls
                className="rounded-lg shadow-xl max-w-full max-h-[80vh] bg-black"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>,
    document.body
  );
}