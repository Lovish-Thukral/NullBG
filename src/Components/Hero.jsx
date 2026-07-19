import Model from "../utils/Model";
import { useDropzone } from "react-dropzone";
import { useEffect, useContext, useState, useRef } from "react";
import { ImageContext } from "../Context/ImageContext";
import { motion } from "framer-motion";
import before from "../assets/noremove.jpg";
import arrow from "../assets/uploadarrow.gif";
import compare from '../assets/compare-icon.svg'
import removed from '../assets/eraser-icon.svg'
import original from '../assets/original.svg'
import addimage from '../assets/add-image-icon.svg'
import share from '../assets/share-icon.svg'

function SampleComponent() {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const beforeImageSrc = before;
  const afterImageSrc = before;

  const handleMove = (e) => {
    if (!isDragging || !containerRef.current) return;

    const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;

    const newPosition = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(newPosition);
  };

  const handleMouseUp = () => setIsDragging(false);

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
      transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      className="relative flex flex-col justify-center items-center w-full max-w-lg xl:max-w-xl mx-auto z-10"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 bg-[#cb2957]/20 blur-[90px] -z-10 rounded-full pointer-events-none"></div>

      <div
        ref={containerRef}
        className="relative w-full aspect-[4/5] md:aspect-square lg:aspect-[4/5] bg-[#000000] border border-[#dddddd]/10 rounded-[1.75rem] shadow-[0_18px_45px_rgba(0,0,0,0.8)] overflow-hidden cursor-ew-resize select-none group ring-1 ring-[#cb2957]/10"
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        onMouseMove={handleMove}
        onTouchMove={handleMove}
      >
        <img
          src={afterImageSrc}
          alt="After"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        <img
          src={beforeImageSrc}
          alt="Before"
          className="absolute inset-0 w-full h-full object-cover brightness-50"
          draggable={false}
          style={{
            clipPath: `polygon(0 0, ${position}% 0, ${position}% 100%, 0 100%)`,
          }}
        />

        <div
          className="absolute inset-y-0 w-[2.5px] bg-[#cb2957] shadow-[0_0_18px_rgba(203,41,87,0.8)] z-10"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-[#cb2957] rounded-full flex items-center justify-center shadow-[0_0_24px_rgba(203,41,87,0.5)] transition-transform group-hover:scale-110 border-2 border-[#eeeeee]/20">
            <div className="flex gap-1.5">
              <div className="w-[1.5px] h-3.5 bg-[#eeeeee] rounded-full"></div>
              <div className="w-[1.5px] h-3.5 bg-[#eeeeee] rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="absolute top-5 left-5 bg-[#000000]/60 backdrop-blur-md text-[#eeeeee] text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full border border-[#dddddd]/10 pointer-events-none">
          Before
        </div>
        <div className="absolute top-5 right-5 bg-[#cb2957]/20 backdrop-blur-md text-[#cb2957] font-bold tracking-[0.2em] uppercase text-[10px] px-4 py-1.5 rounded-full border border-[#cb2957]/30 pointer-events-none shadow-[0_0_18px_rgba(203,41,87,0.15)]">
          After
        </div>
      </div>
    </motion.div>
  );
}

function OriginalHero(buttonfunction, isDragActive) {
  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-28 items-center py-20 px-8 md:px-12 z-10">
      <div className="order-1 flex flex-col justify-center items-center lg:items-start text-center lg:text-left z-50 w-full">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-5xl md:text-6xl lg:text-7xl xl:text-[5rem] font-extrabold tracking-tight leading-[1.1]"
        >
          Remove Image <br className="hidden lg:block" />
          <span className="text-[#cb2957]">Backgrounds</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-xl text-[#dddddd] mt-8 font-medium max-w-lg leading-[1.8]"
        >
          Instantly remove backgrounds with studio-quality accuracy. 100%
          on-device AI processing. No uploads. No cloud. Complete privacy.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className={`flex flex-col w-full max-w-lg justify-center items-center space-y-6 mt-12 px-8 py-14 cursor-pointer transition-all duration-300 rounded-[2rem] border ${
            isDragActive
              ? "border-[#cb2957] bg-[#cb2957]/10 scale-[1.02] shadow-[0_0_35px_rgba(203,41,87,0.15)]"
              : "border-[#dddddd]/10 bg-zinc-900/40 hover:border-[#dddddd]/20 hover:bg-zinc-800/60"
          }`}
          onClick={buttonfunction}
        >
          {isDragActive ? (
            <>
              <img
                src={arrow}
                alt="Drop your image here"
                className="m-auto h-20 w-20 brightness-0 invert opacity-100 scale-110 drop-shadow-[0_0_18px_rgba(238,238,238,0.5)] transition-transform duration-300"
              />
              <div className="text-[#cb2957] font-bold text-xl tracking-wider uppercase mt-4">
                Drop Image Here
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                className="bg-[#cb2957] text-[#eeeeee] px-12 py-5 rounded-full font-bold text-lg hover:shadow-[0_0_30px_rgba(203,41,87,0.4)] hover:scale-105 transition-all duration-300"
              >
                Upload Image
              </button>

              <div className="flex flex-col justify-center items-center space-y-3 mt-6 text-center">
                <div className="text-base font-semibold text-[#eeeeee]">
                  Or drag and drop an image here
                </div>

                <div className="text-sm font-medium text-[#dddddd] uppercase tracking-widest">
                  Supports PNG, JPG, WEBP, and HEIC
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>

      <div className="order-2 flex justify-center w-full">
        {SampleComponent()}
      </div>
    </div>
  );
}

function RemovalHeroScreen(isDragActive, buttonfunction) {
  const option = {
    "Original" : original,
    "Removed" : removed,
    "Add Image" : addimage,
    "Share" : share,
    "Compare" : compare

  }
  return (
    <div>
      <div className="w-[70vw] rounded-3xl border border-[#cb2957]/90 bg-[#000000]/90 backdrop-blur-3xl">
      <ul className="flex flex-row justify-evenly items-center">
        <li></li>
      </ul>

      </div>
    </div>
  )
}

export default function Hero() {
  const [loadedModel, setloadedmodel] = useState(false)
  const { imageMap, addImage, removeImage, updateImageStatus } =
    useContext(ImageContext);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      "image/heic": [".heic"],
    },
    multiple: true,
    noClick: true,
    noKeyboard: true,
    onDrop: (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        const path = `${file.path} ${file.lastModified}`;
        addImage(file, path);
      });
    },
  });

  useEffect(() => {
    let mounted = false;

    async function loadModel() {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        const gpuSupported = adapter ? true : false;
        const session = await Model.create(gpuSupported);
        if (session) {
          console.log("Model Loaded:", session);
          setloadedmodel(true)
        }
      } catch (err) {
        console.error("Failed to load model:", err);
      }
    }

    loadModel();

    return () => {
      mounted = true;
    };
  }, []);

  return (
    <section
      className="relative w-full min-h-[90vh] flex flex-col items-center text-[#eeeeee] overflow-hidden selection:bg-[#cb2957]/40"
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <article className="sr-only">
        <h2>Free AI Background Remover Tool - 100% Private</h2>
        <p>
          Use our free, completely private AI background remover tool. Powered
          by local WebGPU technology, this image editing software runs entirely
          on your device, ensuring zero data leaves your computer. Instantly cut
          out subjects, create transparent backgrounds, and edit photos without
          cloud uploads. Perfect for e-commerce product photos, profile
          pictures, graphic design, and professional photography.
        </p>
        <h3>Features & Tags</h3>
        <ul>
          <li>Remove background from image free</li>
          <li>AI background eraser</li>
          <li>Make image background transparent</li>
          <li>On-device photo editing WebGPU</li>
          <li>High-resolution image cutout</li>
          <li>Remove background from PNG, JPG, WEBP, HEIC</li>
          <li>Convert JPG to transparent PNG</li>
          <li>Batch process background removal</li>
          <li>Best alternative to cloud background removers</li>
          <li>Privacy-first offline photo editor</li>
          <li>Background Removal with Zero Quality loss</li>
          <li>completely free bg removal</li>
          <li>no quality loss background removal</li>
          <li>free HD background bg removal</li>
        </ul>
      </article>

    {OriginalHero(open, isDragActive)}
    {RemovalHeroScreen(isDragActive, open)}

    </section>
  );
}
