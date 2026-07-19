import { useState } from "react";
import { ImageContext } from "./ImageContext";

export default function ImageProvider({ children }) {
  const [imageMap, setImageMap] = useState(new Map());

  const addImage = (file, key) => {
    if (imageMap.has(key)) {
      alert("image already exists");
      return;
    }
    setImageMap((prev) => {
      const next = new Map(prev);
      next.set(key, {
        file,
        status: "pending",
        preview: URL.createObjectURL(file),
        resultBlob: null,
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

      next.delete(key);

      return next;
    });
  };

  const updateImageStatus = (key, status, resultBlob = null) => {
    setImageMap((prev) => {
      const next = new Map(prev);

      const image = next.get(key);

      if (!image) return prev;

      next.set(key, {
        ...image,
        status,
        resultBlob,
      });

      return next;
    });
  };

  return (
    <ImageContext.Provider
      value={{
        imageMap : imageMap,
        addImage : addImage,
        removeImage : removeImage,
        updateImageStatus : updateImageStatus
      }}
    >
      {children}
    </ImageContext.Provider>
  );
}
