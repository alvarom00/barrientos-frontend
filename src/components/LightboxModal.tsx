import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { getAssetUrl } from "../utils/getAssetUrl";
import { motion, AnimatePresence } from "framer-motion";
import type { MediaItem } from "./PropertyGallery";

interface LightboxModalProps {
  media: MediaItem[];
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
  center: { x: 0, opacity: 1, scale: 1, zIndex: 1 },
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
  setCurrentIndex,
  onClose,
}: LightboxModalProps) {
  const [[index, direction], setIndex] = useState<[number, number]>([
    currentIndex,
    0,
  ]);
  const xRef = useRef(0);

  function handleTouchStart(e: React.TouchEvent) {
    xRef.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - xRef.current;
    if (Math.abs(dx) > swipeConfidenceThreshold) {
      if (dx < 0) paginate(1);
      else paginate(-1);
    }
  }

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const paginate = (newDirection: number) => {
    const next = (index + newDirection + media.length) % media.length;
    setIndex([next, newDirection]);
    setCurrentIndex(next);
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

  const containerStyle: React.CSSProperties = {
    width: "min(92vw, 1100px)",
    maxWidth: "1100px",
    maxHeight: "80vh",
  };

  return createPortal(
    <div
      className="fixed inset-0 z-1500 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-6 right-6 text-white bg-black/50 rounded-full p-2 hover:bg-black/80 transition z-2000"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Cerrar"
      >
        <X size={32} />
      </button>

      {/* Prev — oculto en mobile */}
      <button
        className={clsx(
          "hidden md:flex absolute left-4 md:left-12 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/70 rounded-full p-2 transition",
          media.length < 2 && "opacity-0 pointer-events-none"
        )}
        onClick={(e) => {
          e.stopPropagation();
          paginate(-1);
        }}
        tabIndex={0}
        aria-label="Anterior"
      >
        <ChevronLeft size={32} />
      </button>

      {/* Next — oculto en mobile */}
      <button
        className={clsx(
          "hidden md:flex absolute right-4 md:right-12 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/70 rounded-full p-2 transition",
          media.length < 2 && "opacity-0 pointer-events-none"
        )}
        onClick={(e) => {
          e.stopPropagation();
          paginate(1);
        }}
        tabIndex={0}
        aria-label="Siguiente"
      >
        <ChevronRight size={32} />
      </button>

      {/* Contenido animado */}
      <div
        className="flex items-center justify-center relative select-none"
        style={containerStyle}
        onClick={(e) => e.stopPropagation()}
      >
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
                if (offset.x < 0) paginate(1);
                else paginate(-1);
              }
            }}
            style={{ touchAction: "pan-y" }}
          >
            {media[index].type === "image" && (
              <img
                src={getAssetUrl(media[index].url)}
                alt={`Vista ${index + 1}`}
                className="rounded-lg shadow-xl max-w-full max-h-[80vh] object-contain bg-black"
              />
            )}

            {media[index].type === "video-file" && (
              <video
                src={getAssetUrl(media[index].url)}
                controls
                preload="metadata"
                className="rounded-lg shadow-xl max-w-full max-h-[80vh] bg-black"
              />
            )}

            {media[index].type === "video-embed" && (
              <div
                className="rounded-lg shadow-xl bg-black w-full"
                style={{ aspectRatio: "16 / 9" }}
              >
                <iframe
                  className="w-full h-full rounded-lg"
                  src={media[index].embedSrc}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`Video ${index + 1}`}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>,
    document.body
  );
}
