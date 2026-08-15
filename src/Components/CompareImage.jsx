import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import before from "../assets/noremove.jpg";

export function CompareImage({beforeImage = null, afterImage = null} ) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const beforeImageSrc = beforeImage || before;
  const afterImageSrc = afterImage || before;

  const handleMove = (e) => {
    if (!isDragging || !containerRef.current) return;

    const clientX = e.type.includes("touch")
      ? e.touches[0].clientX
      : e.clientX;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;

    const newPosition = Math.max(
      0,
      Math.min(100, (x / rect.width) * 100)
    );

    setPosition(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchend", handleMouseUp);
    } else {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.8,
        delay: 0.3,
        ease: "easeOut",
      }}
      className="relative flex flex-col justify-center items-center w-full max-w-lg xl:max-w-xl mx-auto z-10"
    >
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/5] md:aspect-square lg:aspect-[4/5] bg-[#000000] border border-[#dddddd]/10 rounded-[1.75rem] shadow-[0_18px_45px_rgba(0,0,0,0.8)] overflow-hidden cursor-ew-resize select-none group ring-1 ring-[#cb2957]/10"
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        onMouseMove={handleMove}
        onTouchMove={handleMove}
      >
        {/* After image */}
        <img
          src={afterImageSrc}
          alt="After"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* Before image */}
        <img
          src={beforeImageSrc}
          alt="Before"
          className="absolute inset-0 w-full h-full object-cover brightness-50"
          draggable={false}
          style={{
            clipPath: `polygon(
              0 0,
              ${position}% 0,
              ${position}% 100%,
              0 100%
            )`,
          }}
        />

        {/* Slider line */}
        <div
          className="absolute inset-y-0 w-[2.5px] bg-[#cb2957] shadow-[0_0_18px_rgba(203,41,87,0.8)] z-10"
          style={{
            left: `${position}%`,
            transform: "translateX(-50%)",
          }}
        >
          {/* Slider handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-[#cb2957] rounded-full flex items-center justify-center shadow-[0_0_24px_rgba(203,41,87,0.5)] transition-transform group-hover:scale-110 border-2 border-[#eeeeee]/20">
            <div className="flex gap-1.5">
              <div className="w-[1.5px] h-3.5 bg-[#eeeeee] rounded-full" />
              <div className="w-[1.5px] h-3.5 bg-[#eeeeee] rounded-full" />
            </div>
          </div>
        </div>

        {/* Before label */}
        <div className="absolute top-5 left-5 bg-[#000000]/60 backdrop-blur-md text-[#eeeeee] text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full border border-[#dddddd]/10 pointer-events-none">
          Before
        </div>

        {/* After label */}
        <div className="absolute top-5 right-5 bg-[#cb2957]/20 backdrop-blur-md text-[#cb2957] font-bold tracking-[0.2em] uppercase text-[10px] px-4 py-1.5 rounded-full border border-[#cb2957]/30 pointer-events-none shadow-[0_0_18px_rgba(203,41,87,0.15)]">
          After
        </div>
      </div>
    </motion.div>
  );
}