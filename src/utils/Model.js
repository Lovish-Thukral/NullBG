export default class Model {
  #session;

  constructor(session) {
    this.#session = session;

    this.originalWidth = null;
    this.originalHeight = null;

    this.paddedSize = null;
    this.padLeft = null;
    this.padTop = null;
  }

  static async create(gpu = false) {
    let ort;
    let executionProviders;

    if (gpu && navigator.gpu) {
      try {
        ort = await import("onnxruntime-web/webgpu");
        executionProviders = ["webgpu", "wasm"];
      } catch {
        ort = await import("onnxruntime-web");
        executionProviders = ["wasm"];
      }
    } else {
      ort = await import("onnxruntime-web");
      executionProviders = ["wasm"];
    }

    const session = await ort.InferenceSession.create("./model_fp16.onnx", {
      executionProviders,
      graphOptimizationLevel: "all",
    });

    return new Model(session);
  }

  async #loadImage(file) {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    try {
      image.src = objectUrl;

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      return image;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  /*
   * PREPROCESS
   *
   * Original image
   *      ↓
   * Pad to square
   *      ↓
   * Resize square to 1024×1024
   *      ↓
   * ImageNet normalization
   *      ↓
   * CHW Float32 tensor
   */
  #preprocess(image) {
    const INPUT_SIZE = 1024;

    this.originalWidth = image.naturalWidth;
    this.originalHeight = image.naturalHeight;

    /*
     * Make the original image square WITHOUT
     * distorting it.
     */
    const paddedSize = Math.max(this.originalWidth, this.originalHeight);

    const padLeft = Math.floor((paddedSize - this.originalWidth) / 2);

    const padTop = Math.floor((paddedSize - this.originalHeight) / 2);

    /*
     * Store geometry so postprocessing can
     * remove exactly the same padding.
     */
    this.paddedSize = paddedSize;
    this.padLeft = padLeft;
    this.padTop = padTop;

    /*
     * Create square padded canvas.
     */
    const paddedCanvas = document.createElement("canvas");

    paddedCanvas.width = paddedSize;
    paddedCanvas.height = paddedSize;

    const paddedCtx = paddedCanvas.getContext("2d");

    if (!paddedCtx) {
      throw new Error("Failed to create padded canvas context.");
    }

    /*
     * Padding color.
     */
    paddedCtx.fillStyle = "black";

    paddedCtx.fillRect(0, 0, paddedSize, paddedSize);

    /*
     * Put the original image in the center
     * without changing its aspect ratio.
     */
    paddedCtx.drawImage(
      image,
      padLeft,
      padTop,
      this.originalWidth,
      this.originalHeight,
    );

    /*
     * Resize padded square to model input.
     */
    const inputCanvas = document.createElement("canvas");

    inputCanvas.width = INPUT_SIZE;
    inputCanvas.height = INPUT_SIZE;

    const inputCtx = inputCanvas.getContext("2d");

    if (!inputCtx) {
      throw new Error("Failed to create model input context.");
    }

    inputCtx.drawImage(
      paddedCanvas,
      0,
      0,
      paddedSize,
      paddedSize,
      0,
      0,
      INPUT_SIZE,
      INPUT_SIZE,
    );

    /*
     * Read pixels.
     */
    const { data } = inputCtx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);

    const size = INPUT_SIZE * INPUT_SIZE;

    const float32Data = new Float32Array(3 * size);

    /*
     * ImageNet normalization.
     */
    const mean = [0.485, 0.456, 0.406];

    const std = [0.229, 0.224, 0.225];

    /*
     * RGBA → CHW Float32
     */
    for (let i = 0; i < size; i++) {
      const offset = i * 4;

      const r = data[offset] / 255;

      const g = data[offset + 1] / 255;

      const b = data[offset + 2] / 255;

      float32Data[i] = (r - mean[0]) / std[0];

      float32Data[size + i] = (g - mean[1]) / std[1];

      float32Data[2 * size + i] = (b - mean[2]) / std[2];
    }

    return float32Data;
  }

  getIOInfo() {
    return {
      inputNames: this.#session.inputNames,
      outputNames: this.#session.outputNames,
    };
  }

  /*
   * MODEL INFERENCE
   */
  async #getMask(file) {
    const image = await this.#loadImage(file);

    const tensorData = this.#preprocess(image);

    const ort = await import("onnxruntime-web");

    const inputTensor = new ort.Tensor(
      "float32",
      tensorData,
      [1, 3, 1024, 1024],
    );

    const inputName = this.#session.inputNames[0];

    const outputName =
      this.#session.outputNames[this.#session.outputNames.length - 1];

    const outputs = await this.#session.run({
      [inputName]: inputTensor,
    });

    const output = outputs[outputName];

    if (!output) {
      throw new Error(`Model output "${outputName}" was not found.`);
    }

    let min = Infinity;
    let max = -Infinity;

    for (let i = 0; i < output.data.length; i++) {
      const value = output.data[i];

      if (value < min) {
        min = value;
      }

      if (value > max) {
        max = value;
      }
    }

    return {
      logits: output.data,
      image,
      rawMin: min,
      rawMax: max,
    };
  }

  #sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  /*
   * Create 1024×1024 probability mask.
   */
  #createMaskCanvas(logits, rawMin, rawMax) {
    const INPUT_SIZE = 1024;

    const alreadyProbabilities = rawMin >= -0.01 && rawMax <= 1.01;

    const maskCanvas = document.createElement("canvas");

    maskCanvas.width = INPUT_SIZE;
    maskCanvas.height = INPUT_SIZE;

    const maskCtx = maskCanvas.getContext("2d");

    if (!maskCtx) {
      throw new Error("Failed to create mask context.");
    }

    const maskImageData = maskCtx.createImageData(INPUT_SIZE, INPUT_SIZE);

    const pixelCount = INPUT_SIZE * INPUT_SIZE;

    for (let i = 0; i < pixelCount; i++) {
      const prob = alreadyProbabilities ? logits[i] : this.#sigmoid(logits[i]);

      const value = Math.max(0, Math.min(1, prob)) * 255;

      const offset = i * 4;

      maskImageData.data[offset] = value;

      maskImageData.data[offset + 1] = value;

      maskImageData.data[offset + 2] = value;

      maskImageData.data[offset + 3] = 255;
    }

    maskCtx.putImageData(maskImageData, 0, 0);

    return maskCanvas;
  }

  /*
   * Scale the 1024×1024 mask back to the
   * ORIGINAL PADDED SQUARE dimensions.
   */
  #scaleMaskToPaddedSize(maskCanvas) {
    const { paddedSize } = this;

    const scaledMaskCanvas = document.createElement("canvas");

    scaledMaskCanvas.width = paddedSize;

    scaledMaskCanvas.height = paddedSize;

    const scaledMaskCtx = scaledMaskCanvas.getContext("2d");

    if (!scaledMaskCtx) {
      throw new Error("Failed to create scaled mask context.");
    }

    scaledMaskCtx.imageSmoothingEnabled = true;
    scaledMaskCtx.imageSmoothingQuality = "high";

    scaledMaskCtx.drawImage(
      maskCanvas,
      0,
      0,
      1024,
      1024,
      0,
      0,
      paddedSize,
      paddedSize,
    );

    return scaledMaskCanvas;
  }

  /*
   * Create the original padded square image.
   *
   * This is intentionally recreated here rather than
   * returning the preprocessing canvas because the
   * preprocessing canvas was resized to 1024.
   */
  #createPaddedOriginal(image) {
    const { paddedSize, padLeft, padTop, originalWidth, originalHeight } = this;

    const paddedCanvas = document.createElement("canvas");

    paddedCanvas.width = paddedSize;

    paddedCanvas.height = paddedSize;

    const paddedCtx = paddedCanvas.getContext("2d");

    if (!paddedCtx) {
      throw new Error("Failed to create padded output context.");
    }

    paddedCtx.fillStyle = "black";

    paddedCtx.fillRect(0, 0, paddedSize, paddedSize);

    paddedCtx.drawImage(image, padLeft, padTop, originalWidth, originalHeight);

    return paddedCanvas;
  }

  /*
   * Apply the scaled mask to the ORIGINAL
   * padded square image.
   */
  #applyMaskToPaddedImage(paddedImage, paddedMask) {
    const { paddedSize } = this;

    const outputCanvas = document.createElement("canvas");

    outputCanvas.width = paddedSize;

    outputCanvas.height = paddedSize;

    const outputCtx = outputCanvas.getContext("2d");

    const maskCtx = paddedMask.getContext("2d");

    if (!outputCtx || !maskCtx) {
      throw new Error("Failed to create compositing contexts.");
    }

    /*
     * Draw padded original image.
     */
    outputCtx.drawImage(paddedImage, 0, 0, paddedSize, paddedSize);

    const outputImageData = outputCtx.getImageData(
      0,
      0,
      paddedSize,
      paddedSize,
    );

    const maskData = maskCtx.getImageData(0, 0, paddedSize, paddedSize).data;

    /*
     * Apply mask as alpha.
     */
    for (let i = 0; i < paddedSize * paddedSize; i++) {
      outputImageData.data[i * 4 + 3] = maskData[i * 4];
    }

    outputCtx.putImageData(outputImageData, 0, 0);

    return outputCanvas;
  }

  /*
   * Remove the padding ONLY AFTER
   * compositing the mask.
   */
  #removePaddingFromResult(paddedResult) {
    const { originalWidth, originalHeight, padLeft, padTop } = this;

    const finalCanvas = document.createElement("canvas");

    finalCanvas.width = originalWidth;

    finalCanvas.height = originalHeight;

    const finalCtx = finalCanvas.getContext("2d");

    if (!finalCtx) {
      throw new Error("Failed to create final canvas context.");
    }

    finalCtx.drawImage(
      paddedResult,

      // Source rectangle inside padded result.
      padLeft,
      padTop,
      originalWidth,
      originalHeight,

      // Destination rectangle.
      0,
      0,
      originalWidth,
      originalHeight,
    );

    return finalCanvas;
  }

  /*
   * POSTPROCESS
   *
   * 1024 mask
   *      ↓
   * scale to padded original size
   *      ↓
   * apply to padded original image
   *      ↓
   * remove padding
   */
  #postprocess(logits, image, rawMin, rawMax) {
    const maskCanvas = this.#createMaskCanvas(logits, rawMin, rawMax);

    const paddedMask = this.#scaleMaskToPaddedSize(maskCanvas);

    const paddedImage = this.#createPaddedOriginal(image);

    const paddedResult = this.#applyMaskToPaddedImage(paddedImage, paddedMask);

    return this.#removePaddingFromResult(paddedResult);
  }

  /*
   * PUBLIC API
   */
  async remove(file) {
    const { logits, image, rawMin, rawMax } = await this.#getMask(file);

    const resultCanvas = this.#postprocess(logits, image, rawMin, rawMax);

    return new Promise((resolve, reject) => {
      resultCanvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create output PNG blob."));
        }
      }, "image/png");
    });
  }

  async removeWithDebug(file) {
    const { logits, rawMin, rawMax } = await this.#getMask(file);

    const maskCanvas = this.#createMaskCanvas(logits, rawMin, rawMax);

    return new Promise((resolve, reject) => {
      maskCanvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create mask blob"));
        }
      }, "image/png");
    });
  }
}
