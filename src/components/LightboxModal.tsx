import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MediaItem } from "./PropertyGallery";

interface LightboxModalProps {
  media: MediaItem[];
  initialIndex: number;
  onClose: () => void;
  currentIndex: number;
  setCurrentIndex: (idx: number) => void;
}

export default function LightboxModal({
  media,
  initialIndex,
  onClose,
  setCurrentIndex,
}: LightboxModalProps) {
  const [index, setIndex] = useState(initialIndex);
  const [dir, setDir] = useState<1 | -1>(1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const prev = () => {
    setDir(-1);
    setIndex((i) => {
      const ni = (i - 1 + media.length) % media.length;
      setCurrentIndex(ni);
      return ni;
    });
  };
  const next = () => {
    setDir(+1);
    setIndex((i) => {
      const ni = (i + 1) % media.length;
      setCurrentIndex(ni);
      return ni;
    });
  };

  // swipe horizontal en modal
  const touch = useRef<{ x: number; y: number; lock?: "h" | "v" } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!touch.current) return;
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;

    if (!touch.current.lock) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) + 6) {
        touch.current.lock = "h";
      } else if (Math.abs(dy) > 10) {
        touch.current.lock = "v";
      }
    }
    if (touch.current.lock === "h") e.preventDefault();
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    const wasHorizontal = Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy);
    if (wasHorizontal) {
      if (dx < 0) next();
      else prev();
    }
    touch.current = null;
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm"
      onClick={(e) => {
        // cerrar sólo si clic fuera del media
        if (e.target === containerRef.current) onClose();
      }}
    >
      {/* cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white grid place-items-center z-20"
        aria-label="Cerrar"
      >
        <X />
      </button>

      {/* flechas SOLO desktop */}
      {media.length > 1 && (
        <>
          <button
            onClick={prev}
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white grid place-items-center z-20"
            aria-label="Anterior"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={next}
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white grid place-items-center z-20"
            aria-label="Siguiente"
          >
            <ChevronRight />
          </button>
        </>
      )}

      {/* área del media */}
      <div
        className="absolute inset-0 flex items-center justify-center p-4 select-none"
        style={{ overscrollBehavior: "contain", touchAction: "pan-y" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative w-full max-w-5xl aspect-video">
          <AnimatePresence initial={false} custom={dir} mode="wait">
            <motion.div
              key={index}
              custom={dir}
              initial={{ x: dir * 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -dir * 60, opacity: 0 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="absolute inset-0"
            >
              {media[index].type === "image" ? (
                <img
                  src={media[index].src}
                  className="absolute inset-0 w-full h-full object-contain"
                  alt={`Imagen ${index + 1}`}
                  draggable={false}
                />
              ) : media[index].embedSrc ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={media[index].embedSrc}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`Video ${index + 1}`}
                />
              ) : (
                <video
                  className="absolute inset-0 w-full h-full object-contain bg-black"
                  src={media[index].src}
                  controls
                  autoPlay={false}
                  playsInline
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>,
    document.body
  );
}
