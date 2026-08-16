import { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.webp";
import buymecoffee from "../assets/buymeacoffee.webp";
import { ImageContext } from "../Context/ImageContext";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { clearImages } = useContext(ImageContext);

  const navItems = [
    { label: "Home", sectionId: "home" },
    { label: "About Us", sectionId: "about-us" },
    { label: "Contact Us", sectionId: "contact-us" },
  ];

  const handleNavClick = (item) => {
    setIsOpen(false);

    if (item.label === "Home") {
      clearImages();
    }

    const section = document.getElementById(item.sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="fixed top-0 z-50 w-full h-max backdrop-blur-md border-b border-[#cb2957]/20 shadow-[0_4px_30px_-5px_rgba(203,41,87,0.3)]">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16 py-4 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center cursor-pointer"
          onClick={() => handleNavClick(navItems[0])}
        >
          <img
            src={logo}
            alt="NullBG"
            className="object-contain w-10 md:w-12 mr-3 inline"
          />
          <span className="text-2xl md:text-3xl font-black text-[#cb2957] tracking-wide">
            NullBG
          </span>
        </motion.div>

        <div className="hidden md:flex items-center space-x-12">
          <ul className="flex space-x-10">
            {navItems.map((item, index) => (
              <motion.li
                key={item.sectionId}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => handleNavClick(item)}
                className="text-[#dddddd] font-semibold text-sm uppercase tracking-widest cursor-pointer transition-colors duration-300 hover:text-[#cb2957]"
              >
                {item.label}
              </motion.li>
            ))}
          </ul>
          <motion.a
            href="https://www.buymeacoffee.com/lovishthukral"
            target="_blank"
            rel="noreferrer"
            whileHover={{
              rotate: [-15, 15, -15],
              transition: {
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="inline-flex"
          >
            <img
              src={buymecoffee}
              alt="buymeacoffee"
              className="h-8 brightness-125"
            />
          </motion.a>
        </div>

        <div className="md:hidden flex items-center">
          <a
            href="https://www.buymeacoffee.com/lovishthukral"
            target="_blank"
            rel="noreferrer"
            className="inline-flex"
          >
            <img
              src={buymecoffee}
              alt="buymeacoffee"
              className="w-7 mr-6 cursor-pointer hover:scale-110 brightness-125"
            />
          </a>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-[#eeeeee] focus:outline-none"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "calc(100vh - 72px)" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden absolute flex w-full top-full left-0 items-center justify-center bg-[#000000]/90 backdrop-blur-3xl border-t border-[#cb2957]/20 overflow-hidden z-20"
          >
            <ul className="flex flex-col items-center py-6 space-y-6">
              {navItems.map((item, index) => (
                <motion.li
                  key={item.sectionId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleNavClick(item)}
                  className="text-[#dddddd] bg-[#000000]/95 font-semibold text-lg uppercase tracking-widest cursor-pointer hover:text-[#cb2957] transition-colors duration-300 border-b border-white"
                >
                  {item.label}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
