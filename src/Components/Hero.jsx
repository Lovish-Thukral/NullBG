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
  const [selectedPath, setSelectedPath] = useState(null);
  const [viewMode, setViewMode] = useState("removed"); // "removed" | "original" | "compare"
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
        // auto-select the first dropped image if nothing is selected yet
        setSelectedPath((prev) => prev ?? path);
      });
    },
  });

  // Load model once
  useEffect(() => {
    if (loadingRef.current || modelRef.current) return;
    loadingRef.current = true;

    const load = async () => {
      try {
        const gpuSupported = await checkGPU();
        const session = await Model.create(gpuSupported);

        if (session) {
          modelRef.current = session;
          setloadedmodel(true);
        }
      } catch (err) {
        console.error("Failed to load model:", err);
      } finally {
        loadingRef.current = false;
      }
    };

    load();
  }, []);

  // Process images one at a time, in the order they were added
  useEffect(() => {
    if (isProcessing || !loadedModel || imageMap.size === 0) return;

    const pendingEntry = Array.from(imageMap.entries()).find(
      ([, image]) => image.status === "pending",
    );
    if (!pendingEntry) return;

    const [path, image] = pendingEntry;

    setIsProcessing(true);
    updateImageStatus(path, "processing");

    (async () => {
      try {
        const resultBlob = await modelRef.current.remove(image.file);
        updateImageStatus(path, "completed", resultBlob);
      } catch (error) {
        console.error("Error processing image:", path, error);
        updateImageStatus(path, "error");
      } finally {
        setIsProcessing(false);
      }
    })();
  }, [imageMap, loadedModel, isProcessing, updateImageStatus]);

  // Keep selection valid if the selected image gets removed
  useEffect(() => {
    if (imageMap.size === 0) {
      setSelectedPath(null);
      return;
    }
    if (!selectedPath || !imageMap.has(selectedPath)) {
      setSelectedPath(Array.from(imageMap.keys())[0]);
    }
  }, [imageMap, selectedPath]);

  const handleSelect = (path) => {
    setSelectedPath(path);
    setViewMode("removed");
  };

  const selectedImage = selectedPath ? imageMap.get(selectedPath) : null;

  const handleDownload = () => {
    if (!selectedImage?.resultBlob) return;
    const a = document.createElement("a");
    a.href = selectedImage.resultUrl;
    a.download = `removed-bg-${selectedPath.split(" ")[0].split("/").pop() || "image"}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleShare = async () => {
    if (!selectedImage?.resultBlob) return;
    const file = new File([selectedImage.resultBlob], "image.png", {
      type: "image/png",
    });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
      } catch {
        // user cancelled share sheet, ignore
      }
    } else {
      handleDownload();
    }
  };

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

  function OptionsBar() {
    return (
      <div className="flex flex-row items-center justify-between w-full max-w-5xl rounded-full border border-[#cb2957]/30 bg-[#000000]/80 backdrop-blur-xl p-2 md:px-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] ring-1 ring-[#cb2957]/10">
        <button
          onClick={handleDownload}
          disabled={selectedImage?.status !== "completed"}
          className="order-1 md:order-3 flex-shrink-0 flex items-center justify-center bg-[#cb2957] text-[#eeeeee] p-3 md:px-6 md:py-2.5 rounded-full hover:bg-[#a82046] hover:shadow-[0_0_20px_rgba(203,41,87,0.4)] hover:scale-105 transition-all duration-300 md:ml-8 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none disabled:cursor-not-allowed"
        >
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
          <span className="hidden md:inline font-semibold tracking-wide">
            Download
          </span>
        </button>

        <div className="order-2 md:order-1 flex-1 overflow-x-auto no-scrollbar relative flex items-center ml-3 md:ml-0 mr-1 md:mr-0">
          <ul className="flex flex-row items-center w-max pr-8 md:pr-0">
            <li className="flex flex-row items-center">
              <button
                onClick={() => setViewMode("removed")}
                disabled={selectedImage?.status !== "completed"}
                className={`flex flex-row items-center justify-center cursor-pointer transition-all duration-300 group whitespace-nowrap px-3 py-2 rounded-full hover:bg-[#eeeeee]/10 disabled:opacity-40 disabled:cursor-not-allowed ${
                  viewMode === "removed" ? "text-[#cb2957]" : "text-[#dddddd]"
                }`}
              >
                <img
                  src={removed}
                  alt="Removed"
                  className="h-4 w-4 md:h-5 md:w-5 object-contain mr-2 md:mr-2.5 invert opacity-70 group-hover:opacity-100 transition-all duration-300"
                />
                <span className="text-xs md:text-sm font-semibold tracking-wide">
                  Removed
                </span>
              </button>
              <div className="h-6 w-[1px] bg-[#dddddd]/20 mx-2 md:mx-6 flex-shrink-0" />
            </li>

            <li className="flex flex-row items-center">
              <button
                onClick={() => setViewMode("original")}
                className={`flex flex-row items-center justify-center cursor-pointer transition-all duration-300 group whitespace-nowrap px-3 py-2 rounded-full hover:bg-[#eeeeee]/10 ${
                  viewMode === "original" ? "text-[#cb2957]" : "text-[#dddddd]"
                }`}
              >
                <img
                  src={original}
                  alt="Original"
                  className="h-4 w-4 md:h-5 md:w-5 object-contain mr-2 md:mr-2.5 invert opacity-70 group-hover:opacity-100 transition-all duration-300"
                />
                <span className="text-xs md:text-sm font-semibold tracking-wide">
                  Original
                </span>
              </button>
              <div className="h-6 w-[1px] bg-[#dddddd]/20 mx-2 md:mx-6 flex-shrink-0" />
            </li>

            <li className="flex flex-row items-center">
              <button
                onClick={open}
                className="flex flex-row items-center justify-center cursor-pointer transition-all duration-300 group whitespace-nowrap text-[#dddddd] px-3 py-2 rounded-full hover:bg-[#eeeeee]/10"
              >
                <img
                  src={addimage}
                  alt="Add Image"
                  className="h-4 w-4 md:h-5 md:w-5 object-contain mr-2 md:mr-2.5 invert opacity-70 group-hover:opacity-100 transition-all duration-300"
                />
                <span className="text-xs md:text-sm font-semibold tracking-wide group-hover:text-[#cb2957] transition-colors duration-300">
                  Add Image
                </span>
              </button>
              <div className="h-6 w-[1px] bg-[#dddddd]/20 mx-2 md:mx-6 flex-shrink-0" />
            </li>

            <li className="flex flex-row items-center">
              <button
                onClick={handleShare}
                disabled={selectedImage?.status !== "completed"}
                className="flex flex-row items-center justify-center cursor-pointer transition-all duration-300 group whitespace-nowrap text-[#dddddd] px-3 py-2 rounded-full hover:bg-[#eeeeee]/10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <img
                  src={share}
                  alt="Share"
                  className="h-4 w-4 md:h-5 md:w-5 object-contain mr-2 md:mr-2.5 invert opacity-70 group-hover:opacity-100 transition-all duration-300"
                />
                <span className="text-xs md:text-sm font-semibold tracking-wide group-hover:text-[#cb2957] transition-colors duration-300">
                  Share
                </span>
              </button>
              <div className="h-6 w-[1px] bg-[#dddddd]/20 mx-2 md:mx-6 flex-shrink-0" />
            </li>

            <li className="flex flex-row items-center">
              <button
                onClick={() => setViewMode("compare")}
                disabled={selectedImage?.status !== "completed"}
                className={`flex flex-row items-center justify-center cursor-pointer transition-all duration-300 group whitespace-nowrap px-3 py-2 rounded-full hover:bg-[#eeeeee]/10 disabled:opacity-40 disabled:cursor-not-allowed ${
                  viewMode === "compare" ? "text-[#cb2957]" : "text-[#dddddd]"
                }`}
              >
                <img
                  src={compare}
                  alt="Compare"
                  className="h-4 w-4 md:h-5 md:w-5 object-contain mr-2 md:mr-2.5 invert opacity-70 group-hover:opacity-100 transition-all duration-300"
                />
                <span className="text-xs md:text-sm font-semibold tracking-wide group-hover:text-[#cb2957] transition-colors duration-300">
                  Compare
                </span>
              </button>
            </li>
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
      </div>
    );
  }

  function CenterPreview() {
    if (!selectedImage) return null;

    const isCompleted = selectedImage.status === "completed";
    const originalSrc = selectedImage.preview;
    const removedSrc = selectedImage.resultUrl;

    let content;
    if (viewMode === "compare" && isCompleted && originalSrc && removedSrc) {
      content = (
        // Added bg-white and overflow-hidden to keep the rounded corners clean
        <div className="w-full h-full flex items-center justify-center bg-white rounded-3xl overflow-hidden">
          <CompareImage beforeImage={originalSrc} afterImage={removedSrc} />
        </div>
      );
    } else if (viewMode === "removed" && isCompleted && removedSrc) {
      content = (
        <img
          src={removedSrc}
          alt="Background removed"
          // Replaced bg-amber-50 with bg-white
          className="w-full h-full object-contain rounded-3xl bg-white"
        />
      );
    } else {
      content = (
        <img
          src={originalSrc}
          alt="Original"
          // Added bg-white to the original image so toggling views feels seamless
          className="w-full h-full object-contain rounded-3xl bg-white"
        />
      );
    }

    return (
      <div className="relative flex-1 flex items-center justify-center w-full max-w-5xl mx-auto my-6 min-h-0">
        {content}

        {selectedImage.status === "processing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-3xl backdrop-blur-sm z-10">
            <div className="h-10 w-10 border-4 border-[#cb2957] border-t-transparent rounded-full animate-spin" />
            <span className="mt-4 text-sm font-semibold tracking-wide text-[#eeeeee]">
              Removing background...
            </span>
          </div>
        )}

        {selectedImage.status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-3xl z-10">
            <span className="text-sm font-semibold text-red-400">
              Failed to process this image
            </span>
          </div>
        )}
      </div>
    );
  }

  function ThumbnailStrip() {
    const entries = Array.from(imageMap.entries());
    if (entries.length === 0) return null;

    return (
      <div className="w-full max-w-3xl mx-auto mt-8 px-4">
        <div className="flex flex-row items-center gap-3 overflow-x-auto no-scrollbar pb-2">
          {entries.map(([path, image]) => {
            const isSelected = path === selectedPath;
            const thumbSrc = image.resultUrl || image.preview;

            return (
              <div
                key={path}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(path)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleSelect(path);
                }}
                className={`relative flex-shrink-0 h-16 w-16 md:h-20 md:w-20 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-[#cb2957] scale-105 shadow-[0_0_15px_rgba(203,41,87,0.4)]"
                    : "border-[#dddddd]/15 hover:border-[#dddddd]/40"
                }`}
              >
                <img
                  src={thumbSrc}
                  alt=""
                  className="h-full w-full object-cover"
                />

                {image.status === "processing" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="h-4 w-4 border-2 border-[#eeeeee] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {image.status === "error" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-900/50">
                    <span className="text-[10px] font-bold text-red-200">
                      !
                    </span>
                  </div>
                )}

                {image.status === "pending" && (
                  <div className="absolute inset-0 bg-black/40" />
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(path);
                  }}
                  className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-black/70 text-[#eeeeee] text-[10px] flex items-center justify-center hover:bg-[#cb2957] transition-colors"
                >
                  ×
                </button>
              </div>
            );
          })}

          {/* add-more thumbnail */}
          <button
            onClick={open}
            className="flex-shrink-0 h-16 w-16 md:h-20 md:w-20 rounded-2xl border-2 border-dashed border-[#dddddd]/20 hover:border-[#cb2957]/50 flex items-center justify-center transition-colors duration-200"
          >
            <img
              src={addimage}
              alt="Add"
              className="h-6 w-6 invert opacity-60"
            />
          </button>
        </div>
      </div>
    );
  }

  function RemovalHeroScreen() {
    return (
      // Added flex-1 and h-full so the entire removal screen takes up 100% of the parent's height
      <div className="flex flex-col items-center w-full h-full flex-1 z-20 pt-8 pb-4 px-4 md:px-8 min-h-0">
        <OptionsBar />
        <CenterPreview />
        <ThumbnailStrip />
      </div>
    );
  }

  return (
    <section
      // Added h-screen to strictly enforce viewport height
      className="relative w-full min-h-[90vh] h-screen flex flex-col items-center text-[#eeeeee] overflow-hidden selection:bg-[#cb2957]/40"
      {...getRootProps()}
    >
      <input {...getInputProps()} />

      {imageMap.size !== 0 ? <RemovalHeroScreen /> : <OriginalHero />}
    </section>
  );
}
