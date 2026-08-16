import { createContext } from "react";

export const ImageContext = createContext({
  imageMap: new Map(),
  addImage: () => {},
  removeImage: () => {},
  updateImageStatus: () => {},
  clearImages: () => {},
});

