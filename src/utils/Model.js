export default class Model {
  #session;
  #ort;

  constructor(session, ort) {
    this.#session = session;
    this.#ort = ort;

    this.originalWidth = null;
    this.originalHeight = null;

    // Preprocessing metadata.
    // These are required to undo the padding later.
    this.resizedWidth = null;
    this.resizedHeight = null;
    this.padX = null;
    this.padY = null;
    this.scale = null;
  }

  static async create(gpu = false) {
    let ort;
    let executionProviders;

    if (gpu && navigator.gpu) {
      try {
        ort = await import("onnxruntime-web/webgpu");
        executionProviders = ["webgpu", "wasm"];
      } catch (error) {
        console.warn("WebGPU unavailable, falling back to WASM:", error);

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

    console.log("ONNX Runtime execution providers:", executionProviders);

    console.log("Model input names:", session.inputNames);

    console.log("Model output names:", session.outputNames);

    return new Model(session, ort);
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
   * Preprocess:
   *
   * Original image
   *      ↓
   * Preserve aspect ratio
   *      ↓
   * Resize
   *      ↓
   * Center inside 1024×1024 canvas
   *      ↓
   * Padding
   *      ↓
   * ImageNet normalization
   *      ↓
   * CHW Float32 tensor
   */
  #preprocess(image) {
    const INPUT_SIZE = 1024;

    this.originalWidth = image.naturalWidth;
    this.originalHeight = image.naturalHeight;

    const scale = Math.min(
      INPUT_SIZE / this.originalWidth,
      INPUT_SIZE / this.originalHeight,
    );

    const resizedWidth = Math.round(this.originalWidth * scale);
    const resizedHeight = Math.round(this.originalHeight * scale);

    const padX = Math.floor((INPUT_SIZE - resizedWidth) / 2);
    const padY = Math.floor((INPUT_SIZE - resizedHeight) / 2);

    this.scale = scale;
    this.resizedWidth = resizedWidth;
    this.resizedHeight = resizedHeight;
    this.padX = padX;
    this.padY = padY;

    const canvas = document.createElement("canvas");
    canvas.width = INPUT_SIZE;
    canvas.height = INPUT_SIZE;

    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!ctx) {
      throw new Error("Failed to create preprocessing context");
    }

    ctx.fillStyle = "rgb(127, 127, 127)";
    ctx.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE);

    ctx.drawImage(
      image,
      0,
      0,
      this.originalWidth,
      this.originalHeight,
      padX,
      padY,
      resizedWidth,
      resizedHeight,
    );

    const { data } = ctx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);

    const size = INPUT_SIZE * INPUT_SIZE;

    const float32Data = new Float32Array(3 * size);

    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];

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
   * Run inference.
   */
  async #getMask(file) {
    const image = await this.#loadImage(file);

    const tensorData = this.#preprocess(image);

    const INPUT_SIZE = 1024;

    const inputTensor = new this.#ort.Tensor("float32", tensorData, [
      1,
      3,
      INPUT_SIZE,
      INPUT_SIZE,
    ]);

    const inputName = this.#session.inputNames[0];

    const outputName = this.#session.outputNames[0];

    const outputs = await this.#session.run({
      [inputName]: inputTensor,
    });

    const output = outputs[outputName];

    if (!output) {
      throw new Error(`Model output "${outputName}" was not found`);
    }

    return {
      logits: output.data,
      image,
    };
  }

  #sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  #createMaskCanvas(logits) {
    const INPUT_SIZE = 1024;

    const maskCanvas = document.createElement("canvas");

    maskCanvas.width = INPUT_SIZE;
    maskCanvas.height = INPUT_SIZE;

    const ctx = maskCanvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to create mask canvas context");
    }

    const imageData = ctx.createImageData(INPUT_SIZE, INPUT_SIZE);

    const pixelCount = INPUT_SIZE * INPUT_SIZE;

    if (logits.length < pixelCount) {
      throw new Error(
        `Unexpected output size: ${logits.length}. Expected at least ${pixelCount}.`,
      );
    }

    for (let i = 0; i < pixelCount; i++) {
      const probability = this.#sigmoid(logits[i]);

      const value = Math.max(0, Math.min(255, probability * 255));

      const offset = i * 4;

      imageData.data[offset] = value;
      imageData.data[offset + 1] = value;
      imageData.data[offset + 2] = value;
      imageData.data[offset + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);

    return maskCanvas;
  }

  #removeMaskPadding(maskCanvas) {
    const { resizedWidth, resizedHeight, padX, padY } = this;

    const croppedMaskCanvas = document.createElement("canvas");

    croppedMaskCanvas.width = resizedWidth;
    croppedMaskCanvas.height = resizedHeight;

    const ctx = croppedMaskCanvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to create cropped mask context");
    }

    ctx.drawImage(
      maskCanvas,
      padX,
      padY,
      resizedWidth,
      resizedHeight,
      0,
      0,
      resizedWidth,
      resizedHeight,
    );

    return croppedMaskCanvas;
  }

  #resizeMaskToOriginal(maskCanvas) {
    const { originalWidth, originalHeight, resizedWidth, resizedHeight } =
      this;

    const scaledMaskCanvas = document.createElement("canvas");

    scaledMaskCanvas.width = originalWidth;
    scaledMaskCanvas.height = originalHeight;

    const ctx = scaledMaskCanvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to create scaled mask context");
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      maskCanvas,
      0,
      0,
      resizedWidth,
      resizedHeight,
      0,
      0,
      originalWidth,
      originalHeight,
    );

    return scaledMaskCanvas;
  }

  /*
   * Find the tight bounding box of "meaningfully opaque" pixels
   * in an RGBA buffer (alpha above a small threshold, to avoid
   * including near-invisible anti-aliased mask fringe pixels).
   * Returns null if nothing clears the threshold.
   */
  #computeAlphaBoundingBox(data, w, h, alphaThreshold = 8) {
    let minX = w;
    let minY = h;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < h; y++) {
      const rowOffset = y * w * 4;

      for (let x = 0; x < w; x++) {
        const alpha = data[rowOffset + x * 4 + 3];

        if (alpha > alphaThreshold) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < minX || maxY < minY) {
      return null;
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    };
  }

  #postprocess(logits, image) {
    const { originalWidth: w, originalHeight: h } = this;

    const maskCanvas = this.#createMaskCanvas(logits);
    const croppedMaskCanvas = this.#removeMaskPadding(maskCanvas);
    const scaledMaskCanvas = this.#resizeMaskToOriginal(croppedMaskCanvas);

    const scaledMaskCtx = scaledMaskCanvas.getContext("2d");

    if (!scaledMaskCtx) {
      throw new Error("Failed to read scaled mask context");
    }

    const scaledMaskData = scaledMaskCtx.getImageData(0, 0, w, h).data;

    // Sanity check: if the mask has (almost) no contrast, applying
    // it will produce a result indistinguishable from the original
    // — i.e. exactly the "nothing got cropped" symptom. Surface
    // that loudly instead of silently producing a full opaque image.
    {
      let minAlpha = 255;
      let maxAlpha = 0;
      for (let i = 0; i < scaledMaskData.length; i += 4) {
        const v = scaledMaskData[i];
        if (v < minAlpha) minAlpha = v;
        if (v > maxAlpha) maxAlpha = v;
      }
      if (maxAlpha - minAlpha < 10) {
        console.warn(
          `[Model] Mask has almost no contrast (min=${minAlpha}, max=${maxAlpha}). ` +
            "The model output may be inverted, empty, or misread — " +
            "check rawMask/scaledMask via removeWithDebug().",
        );
      }
    }

    // Paint the full-size masked image first (subject visible,
    // background transparent, canvas still w x h).
    const fullCanvas = document.createElement("canvas");

    fullCanvas.width = w;
    fullCanvas.height = h;

    const fullCtx = fullCanvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!fullCtx) {
      throw new Error("Failed to create output context");
    }

    fullCtx.drawImage(image, 0, 0, w, h);

    const fullImageData = fullCtx.getImageData(0, 0, w, h);

    for (let i = 0; i < w * h; i++) {
      fullImageData.data[i * 4 + 3] = scaledMaskData[i * 4];
    }

    fullCtx.putImageData(fullImageData, 0, 0);

    // Now actually crop: find the bounding box of the subject
    // (non-transparent pixels) and trim the canvas down to it.
    // Without this step the output stays the full original
    // width/height with the subject floating inside a mostly
    // transparent canvas — masked, but not cropped.
    const bbox = this.#computeAlphaBoundingBox(fullImageData.data, w, h);

    if (!bbox) {
      // Nothing detected as foreground — return the full
      // (fully transparent) canvas rather than throwing, so
      // callers can decide how to handle an empty result.
      return fullCanvas;
    }

    const outCanvas = document.createElement("canvas");

    outCanvas.width = bbox.width;
    outCanvas.height = bbox.height;

    const outCtx = outCanvas.getContext("2d");

    if (!outCtx) {
      throw new Error("Failed to create cropped output context");
    }

    outCtx.drawImage(
      fullCanvas,
      bbox.x,
      bbox.y,
      bbox.width,
      bbox.height,
      0,
      0,
      bbox.width,
      bbox.height,
    );

    return outCanvas;
  }

  #canvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create PNG blob"));
        }
      }, "image/png");
    });
  }

  /*
   * Public API. Returns the final cutout PNG blob.
   */
  async remove(file) {
    const { logits, image } = await this.#getMask(file);

    const canvas = this.#postprocess(logits, image);

    return this.#canvasToBlob(canvas);
  }

  /*
   * Debug / testing API.
   *
   * Runs the exact same pipeline as remove(), but returns every
   * intermediate stage as a PNG blob (plus the preprocessing
   * metadata) instead of just the final cutout. Useful for anyone
   * testing the model — render each stage in an <img> to see
   * exactly where the pipeline breaks down.
   *
   * Usage:
   *   const debug = await model.removeWithDebug(file);
   *   img1.src = URL.createObjectURL(debug.original);
   *   img2.src = URL.createObjectURL(debug.rawMask);
   *   img3.src = URL.createObjectURL(debug.croppedMask);
   *   img4.src = URL.createObjectURL(debug.scaledMask);
   *   img5.src = URL.createObjectURL(debug.result);
   *   console.log(debug.meta);
   *
   * Stages returned:
   *   - original:     the source image, untouched, at its natural size
   *   - rawMask:      1024x1024 grayscale mask straight off the model
   *                   (still includes the gray padding border)
   *   - croppedMask:  rawMask with the padding border removed
   *                   (resizedWidth x resizedHeight)
   *   - scaledMask:   croppedMask resized up to the original image's
   *                   dimensions — this is what actually gets used
   *                   as the alpha channel
   *   - result:       final cutout (original image + alpha from
   *                   scaledMask) — same as what remove() returns
   *   - meta:         preprocessing metadata (scale, padding,
   *                   resized/original dimensions)
   */
  async removeWithDebug(file) {
    const { logits, image } = await this.#getMask(file);

    const originalCanvas = document.createElement("canvas");
    originalCanvas.width = this.originalWidth;
    originalCanvas.height = this.originalHeight;
    originalCanvas
      .getContext("2d")
      .drawImage(image, 0, 0, this.originalWidth, this.originalHeight);

    const rawMaskCanvas = this.#createMaskCanvas(logits);
    const croppedMaskCanvas = this.#removeMaskPadding(rawMaskCanvas);
    const scaledMaskCanvas = this.#resizeMaskToOriginal(croppedMaskCanvas);
    const resultCanvas = this.#postprocess(logits, image);

    const [original, rawMask, croppedMask, scaledMask, result] =
      await Promise.all([
        this.#canvasToBlob(originalCanvas),
        this.#canvasToBlob(rawMaskCanvas),
        this.#canvasToBlob(croppedMaskCanvas),
        this.#canvasToBlob(scaledMaskCanvas),
        this.#canvasToBlob(resultCanvas),
      ]);

    return {
      original,
      rawMask,
      croppedMask,
      scaledMask,
      result,
      meta: {
        originalWidth: this.originalWidth,
        originalHeight: this.originalHeight,
        resizedWidth: this.resizedWidth,
        resizedHeight: this.resizedHeight,
        padX: this.padX,
        padY: this.padY,
        scale: this.scale,
        // Final cropped result's own dimensions — compare against
        // originalWidth/originalHeight above to see how tight the
        // bounding-box trim ended up.
        resultWidth: resultCanvas.width,
        resultHeight: resultCanvas.height,
      },
    };
  }
}