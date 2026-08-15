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

      // revoke any previous result URL before creating a new one, so we
      // don't leak blob URLs if this image gets reprocessed
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

  return (
    <ImageContext.Provider
      value={{
        imageMap: imageMap,
        addImage: addImage,
        removeImage: removeImage,
        updateImageStatus: updateImageStatus,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
}