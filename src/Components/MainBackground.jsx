import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function MainBackground({ count = 100 }) {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const generateStars = () => {
      return Array.from({ length: count }).map(() => ({
        id: Math.random().toString(36).substring(2, 15),
        x: Math.random() * 100, 
        y: Math.random() * 100, 
        size: Math.random() * 4 + 2, 
        duration: Math.random() * 4 + 2, 
        delay: Math.random() * 5, 
        maxOpacity: Math.random() * 0.5 + 0.3,
      }));
    };

    setStars(generateStars());
  }, [count]);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-black">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-[#cb2957]"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            boxShadow: `0 0 ${star.size * 2}px #cb2957`,
          }}
          // INCREASED base opacity from 0.02 to 0.1
          initial={{ opacity: 0.1 }}
          animate={{
            opacity: [0.1, star.maxOpacity, 0.1],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}