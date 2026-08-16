import { useState } from "react";
import { ImageContext } from "./ImageContext";

export default function ImageProvider({ children }) {
  const [imageMap, setImageMap] = useState(new Map());

  const addImage = (key, file) => {
    if (imageMap.has(key)) {
      alert("image already exists");
      return;
    }
    setImageMap((prev) => {
      const next = new Map(prev);
      next.set(key, {
        file: file,
        status: "pending",
        preview: URL.createObjectURL(file),
        resultBlob: null,
        resultUrl: null,
      });
      return next;
    });
  };

  const removeImage = (key) => {
    setImageMap((prev) => {
      const next = new Map(prev);

      const image = next.get(key);

      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }
      if (image?.resultUrl) {
        URL.revokeObjectURL(image.resultUrl);
      }

      next.delete(key);

      return next;
    });
  };

  const updateImageStatus = (key, status, resultBlob = null) => {
    setImageMap((prev) => {
      const next = new Map(prev);

      const image = next.get(key);

      if (!image) return prev;

      if (image.resultUrl) {
        URL.revokeObjectURL(image.resultUrl);
      }

      const resultUrl = resultBlob ? URL.createObjectURL(resultBlob) : null;

      next.set(key, {
        ...image,
        status,
        resultBlob,
        resultUrl,
      });

      return next;
    });
  };

  const clearImages = () => {
    setImageMap((prev) => {
      prev.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
        if (image.resultUrl) {
          URL.revokeObjectURL(image.resultUrl);
        }
      });

      return new Map();
    });
  };

  return (
    <ImageContext.Provider
      value={{
        imageMap,
        addImage,
        removeImage,
        updateImageStatus,
        clearImages,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
}
