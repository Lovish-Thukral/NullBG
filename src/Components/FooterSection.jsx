import { motion } from "framer-motion";

const productItems = [
  { label: "Background Remover", href: "#home" },
  { label: "Compare", href: "#home" },
  { label: "Features", href: "#about-us" },
  { label: "How It Works", href: "#home" },
];

const resourceItems = [
  { label: "Contact", href: "#contact-us" },
  { label: "Privacy & Terms", href: "#privacy-terms" },
];

const socialItems = [
  { label: "GitHub", href: "https://github.com/Lovish-Thukral" },
  { label: "Instagram", href: "https://lovishthukral.netlify.app/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/lavi-khatri/" },
  { label: "X", href: "https://x.com/TheUndevloper" },
];

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  },
};

const bottomVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.8, delay: 0.5 } 
  },
};

export default function FooterSection() {
  return (
    <footer className="w-full border-t border-[#dddddd]/10 bg-[#050505] px-6 py-16 md:px-12 md:py-20 lg:px-20 xl:px-32 2xl:px-40">
      <div className="mx-auto w-full max-w-[1500px]">
        
        {/* Main Footer Content */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="flex flex-col justify-between gap-12 border-b border-[#dddddd]/10 pb-12 lg:flex-row lg:gap-20 xl:pb-16"
        >
          {/* Left Side: Brand & Mission */}
          <motion.div variants={itemVariants} className="max-w-xl lg:max-w-md xl:max-w-lg">
            <h3 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              <span className="text-[#cb2957]">Remove backgrounds.</span> <br />
              Keep control.
            </h3>
            <p className="mt-5 text-base leading-relaxed text-[#a0a0a0] sm:text-lg">
              AI-powered background removal that runs directly on your device. Your images stay private and are processed locally in your browser.
            </p>
          </motion.div>

          {/* Right Side: Links Grid */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:gap-16 xl:gap-24">
            
            {/* Product Links */}
            <motion.div variants={itemVariants}>
              <h4 className="mb-5 text-lg font-bold text-white">Product</h4>
              <ul className="space-y-3">
                {productItems.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm font-medium text-[#888888] transition-colors duration-200 hover:text-[#cb2957]"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Resources Links */}
            <motion.div variants={itemVariants}>
              <h4 className="mb-5 text-lg font-bold text-white">Resources</h4>
              <ul className="space-y-3">
                {resourceItems.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm font-medium text-[#888888] transition-colors duration-200 hover:text-[#cb2957]"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Connect Links */}
            <motion.div variants={itemVariants} className="col-span-2 sm:col-span-1">
              <h4 className="mb-5 text-lg font-bold text-white">Connect</h4>
              <ul className="space-y-3 flex flex-row flex-wrap sm:flex-col gap-x-6 sm:gap-x-0">
                {socialItems.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-[#888888] transition-colors duration-200 hover:text-[#cb2957]"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

          </div>
        </motion.div>

        {/* Bottom Section: Copyright & Disclaimer */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={bottomVariants}
          className="mt-8 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left"
        >
          <p className="text-sm font-medium text-[#777777]">
            © {new Date().getFullYear()} NullBG. All rights reserved.
          </p>
          <div className="flex items-center gap-2 rounded-full border border-[#cb2957]/20 bg-[#cb2957]/5 px-4 py-1.5">
            <div className="h-2 w-2 rounded-full bg-[#cb2957] animate-pulse"></div>
            <p className="text-xs font-semibold text-[#cb2957]">
              100% on-device processing.
            </p>
          </div>
        </motion.div>

      </div>
    </footer>
  );
}