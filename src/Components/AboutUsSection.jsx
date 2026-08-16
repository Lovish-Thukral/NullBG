import { motion } from "framer-motion";

const highlights = [
  ["On-device AI", "Local processing keeps your files private and fast."],
  ["Precision editing", "Clean cutouts for product shots, portraits, and content."],
  ["No upload friction", "Everything stays in your browser for a streamlined workflow."],
  ["Built for creators", "Simple tools for teams that need polished visuals quickly."],
];

// Framer Motion Animation Variants
const textVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
  },
};

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Delays each card slightly for a ripple effect
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  },
};

export default function AboutUsSection() {
  return (
    <section
      id="about-us"
      className="w-full scroll-mt-24 px-6 py-20 md:px-12 md:py-28 lg:px-20 xl:px-32 2xl:px-40"
    >
      {/* We removed the max-w-7xl to let it cover more width, using a wider max-w for ultrawide screens */}
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 xl:gap-32 lg:items-center">
          
          {/* Left Side: Copy */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={textVariants}
            className="w-full"
          >
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#cb2957] sm:text-sm">
              About Us
            </p>
            <h2 className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              Remove backgrounds. <br className="hidden sm:block" />
              Keep control.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[#d5d5d5] sm:text-lg lg:text-xl">
              NullBG was built for people who want quick, private, high-quality image editing without sending files to a server. Our AI-powered workflow runs directly on your device, helping creators, marketers, and teams move faster while keeping their work secure.
            </p>
          </motion.div>

          {/* Right Side: Features Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={gridVariants}
            className="grid gap-4 sm:grid-cols-2 sm:gap-6"
          >
            {highlights.map(([title, text]) => (
              <motion.div
                key={title}
                variants={cardVariants}
                className="group flex flex-col justify-center rounded-2xl border border-[#dddddd]/10 bg-[#0b0b0b]/60 p-6 backdrop-blur-md transition-all duration-300 hover:border-[#cb2957]/50 hover:bg-[#151515]"
              >
                <h3 className="text-base font-bold text-white sm:text-lg transition-colors group-hover:text-[#cb2957]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#d0d0d0]">
                  {text}
                </p>
              </motion.div>
            ))}
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}