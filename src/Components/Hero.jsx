import Model from "../utils/Model";
import { useDropzone } from "react-dropzone";
import { useEffect, useContext, useState, useRef } from "react";
import { ImageContext } from "../Context/ImageContext";
import { motion } from "framer-motion";

// Component Imports
import { CompareImage } from "./CompareImage";

// Assets Import
import arrow from "../assets/uploadarrow.gif";
import compare from "../assets/compare-icon.svg";
import removed from "../assets/eraser-icon.svg";
import original from "../assets/original.svg";
import addimage from "../assets/add-image-icon.svg";
import share from "../assets/share-icon.svg";

const checkGPU = async () => {
  const adapter = await navigator.gpu?.requestAdapter();
  return !!adapter;
};

export default function Hero() {
  const [loadedModel, setloadedmodel] = useState(false);
  const { imageMap, addImage, removeImage, updateImageStatus } =
    useContext(ImageContext);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const loadingRef = useRef(false);
  const modelRef = useRef(null);

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
        addImage(path, file);
      });
    },
  });

  useEffect(() => {
    if (loadingRef.current || modelRef.current) {
      return;
    }

    loadingRef.current = true;

    const load = async () => {
      try {
        const gpuSupported = await checkGPU();
        const session = await Model.create(gpuSupported);

        if (session) {
          modelRef.current = session;
          setloadedmodel(true);
          console.log("Model Loaded:", session);
        }
      } catch (err) {
        console.error("Failed to load model:", err);
      } finally {
        loadingRef.current = false;
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (isProcessing) return;
    if (imageMap.size === 0 || !loadedModel) return;

    const pendingEntry = Array.from(imageMap.entries()).find(
      ([, image]) => image.status === "pending",
    );

    if (!pendingEntry) return;
    const [path, image] = pendingEntry;

    setIsProcessing(true);
    setCurrentImage(image);
    updateImageStatus(path, "processing");
    
    const process = async () => {
      try {
        const mask = await modelRef.current.preprocess(image.file);
        console.log("Mask generated for", path, mask);
        updateImageStatus(path, "completed", mask);
      } catch (error) {
        console.error("Error processing image:", error);
        updateImageStatus(path, "error");
      } finally {
        setIsProcessing(false);
      }
    };
    
    process();
  }, [imageMap, loadedModel, isProcessing]);

  function OriginalHero() {
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
            onClick={open}
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
          {CompareImage()}
        </div>
      </div>
    );
  }

  function RemovalHeroScreen() {
    const ImageOption = {
      Original: original,
      Removed: removed,
      "Add Image": addimage,
      Share: share,
      Compare: compare,
    };

    const optionEntries = Object.entries(ImageOption);
    return (
      <div className="flex justify-center items-center w-full z-20 mt-10 px-4 md:px-0">
        <div className="flex flex-row items-center justify-between w-full max-w-5xl rounded-full border border-[#cb2957]/30 bg-[#000000]/80 backdrop-blur-xl p-2 md:px-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] ring-1 ring-[#cb2957]/10">
          <button className="order-1 md:order-3 flex-shrink-0 flex items-center justify-center bg-[#cb2957] text-[#eeeeee] p-3 md:px-6 md:py-2.5 rounded-full hover:bg-[#a82046] hover:shadow-[0_0_20px_rgba(203,41,87,0.4)] hover:scale-105 transition-all duration-300 md:ml-8">
            {/* Download SVG */}
            <svg
              className="w-5 h-5 md:mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {/* Text hidden on mobile, visible on medium+ screens */}
            <span className="hidden md:inline font-semibold tracking-wide">
              Download
            </span>
          </button>

          <div className="order-2 md:order-1 flex-1 overflow-x-auto no-scrollbar relative flex items-center ml-3 md:ml-0 mr-1 md:mr-0">
            <ul className="flex flex-row items-center w-max pr-8 md:pr-0">
              {optionEntries.map(([key, item], index) => (
                <li key={key} className="flex flex-row items-center">
                  <button
                    onClick={open}
                    className="flex flex-row items-center justify-center cursor-pointer transition-all duration-300 group whitespace-nowrap text-[#dddddd] px-3 py-2 rounded-full hover:bg-[#eeeeee]/10"
                  >
                    <img
                      src={item}
                      alt={key}
                      className="h-4 w-4 md:h-5 md:w-5 object-contain mr-2 md:mr-2.5 invert opacity-70 group-hover:opacity-100 transition-all duration-300"
                    />
                    <span className="text-xs md:text-sm font-semibold tracking-wide group-hover:text-[#cb2957] transition-colors duration-300">
                      {key}
                    </span>
                  </button>
                  {index === 2 && (
                    <div className="h-6 w-[1px] bg-[#dddddd]/20 mx-2 md:mx-6 flex-shrink-0" />
                  )}
                </li>
              ))}
            </ul>
            <div className="md:hidden sticky right-0 top-0 bottom-0 flex items-center justify-center pl-2 pr-1 bg-gradient-to-l from-black via-black/90 to-transparent pointer-events-none">
              <svg
                className="w-5 h-5 text-[#cb2957] animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
          <div></div>
        </div>

        <div>
          {imageMap.size != 0 && (
            <div>
              {
                currentImage && (
                  <img src={currentImage.preview} />
                )
              }
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <section
      className="relative w-full min-h-[90vh] flex flex-col items-center text-[#eeeeee] overflow-hidden selection:bg-[#cb2957]/40"
      {...getRootProps()}
    >
      <input {...getInputProps()} />

      {imageMap.size != 0 ? <RemovalHeroScreen /> : <OriginalHero />}
    </section>
  );
}
