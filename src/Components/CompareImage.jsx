import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import before from "../assets/noremove.jpg";

export function CompareImage({ beforeImage = null, afterImage = null }) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(null);
  const containerRef = useRef(null);

  const beforeImageSrc = beforeImage || before;
  const afterImageSrc = afterImage || before;

  const updatePosition = (clientX) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    setPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;

    if (naturalWidth && naturalHeight) {
      setAspectRatio(naturalWidth / naturalHeight);
    }
  };

  useEffect(() => {
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="relative w-fit max-w-full mx-auto flex items-center justify-center">
      <div ref={containerRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} style={{ aspectRatio: aspectRatio || "1 / 1" }} className="relative w-fit max-w-full overflow-hidden rounded-[1.75rem] bg-white shadow-[0_18px_45px_rgba(0,0,0,0.8)] cursor-ew-resize select-none touch-none group">
        <img src={afterImageSrc} alt="After" onLoad={handleImageLoad} draggable={false} className="block max-w-full max-h-[calc(100dvh-260px)] w-auto h-auto object-contain bg-white pointer-events-none select-none" />

        <img src={beforeImageSrc} alt="Before" draggable={false} className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none" style={{ clipPath: `polygon(0 0, ${position}% 0, ${position}% 100%, 0 100%)` }} />

        <div className="absolute top-0 bottom-0 w-[2px] bg-[#cb2957] z-20 pointer-events-none shadow-[0_0_18px_rgba(203,41,87,0.8)]" style={{ left: `${position}%`, transform: "translateX(-50%)" }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#cb2957] flex items-center justify-center shadow-[0_0_24px_rgba(203,41,87,0.5)] transition-transform duration-200 group-hover:scale-110">
            <div className="flex gap-1.5">
              <div className="w-[1.5px] h-4 bg-white rounded-full" />
              <div className="w-[1.5px] h-4 bg-white rounded-full" />
            </div>
          </div>
        </div>

        <div className="absolute top-4 left-4 z-30 bg-black/65 backdrop-blur-md text-white text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full border border-white/10 pointer-events-none">
          Before
        </div>

        <div className="absolute top-4 right-4 z-30 bg-[#cb2957]/15 backdrop-blur-md text-[#cb2957] text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full border border-[#cb2957]/30 pointer-events-none">
          After
        </div>
      </div>
    </motion.div>
  );
}