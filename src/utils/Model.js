export default class Model {
  #session;

  constructor(session) {
    this.#session = session;
    this.originalHeight = null;
    this.originalWidth = null;
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

  // Draws image to a 1024x1024 canvas, returns Float32Array NCHW tensor, ImageNet-normalized
  #preprocess(image) {
    this.originalWidth = image.naturalWidth;
    this.originalHeight = image.naturalHeight;

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, 1024, 1024);

    const { data } = ctx.getImageData(0, 0, 1024, 1024); // RGBA 0..255

    const size = 1024 * 1024;
    const float32Data = new Float32Array(3 * size); // CHW

    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];

    for (let i = 0; i < size; i++) {
      const r = data[i * 4] / 255;
      const g = data[i * 4 + 1] / 255;
      const b = data[i * 4 + 2] / 255;

      float32Data[i] = (r - mean[0]) / std[0];
      float32Data[size + i] = (g - mean[1]) / std[1];
      float32Data[2 * size + i] = (b - mean[2]) / std[2];
    }

    return float32Data;
  }

  // Call once after Model.create() if you need to inspect the real tensor names, e.g.:
  // console.log(model.getIOInfo());
  getIOInfo() {
    return {
      inputNames: this.#session.inputNames,
      outputNames: this.#session.outputNames,
    };
  }

  async #getmask(file) {
    const image = await this.#loadImage(file);
    const tensorData = this.#preprocess(image);

    const ort = await import("onnxruntime-web");
    const inputTensor = new ort.Tensor("float32", tensorData, [1, 3, 1024, 1024]);

    // Read actual input/output names from the loaded model instead of hardcoding —
    // these vary between export/quantization versions (e.g. "input" vs "input_image")
    const inputName = this.#session.inputNames[0];
    const outputName = this.#session.outputNames[this.#session.outputNames.length - 1];

    const feeds = { [inputName]: inputTensor };
    const outputs = await this.#session.run(feeds);
    const output = outputs[outputName];

    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < output.data.length; i++) {
      const v = output.data[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }

    return { logits: output.data, image, rawMin: min, rawMax: max };
  }

  // Applies sigmoid to raw logits -> [0,1] probability mask
  #sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  // Resizes the 1024x1024 mask to original dimensions and applies it as alpha
  #postprocess(logits, image, rawMin, rawMax) {
    const { originalWidth: w, originalHeight: h } = this;

    // If raw output already looks like it's in [0,1] (probabilities), don't
    // sigmoid again — applying sigmoid to an already-squashed value produces
    // a narrow, near-uniform band (~0.5-0.75) instead of a sharp mask.
    const alreadyProbabilities = rawMin >= -0.01 && rawMax <= 1.01;

    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = 1024;
    maskCanvas.height = 1024;
    const maskCtx = maskCanvas.getContext("2d");
    const maskImageData = maskCtx.createImageData(1024, 1024);

    for (let i = 0; i < logits.length; i++) {
      const prob = alreadyProbabilities ? logits[i] : this.#sigmoid(logits[i]);
      const v = Math.max(0, Math.min(1, prob)) * 255;
      maskImageData.data[i * 4] = v;
      maskImageData.data[i * 4 + 1] = v;
      maskImageData.data[i * 4 + 2] = v;
      maskImageData.data[i * 4 + 3] = 255;
    }
    maskCtx.putImageData(maskImageData, 0, 0);

    // Scale mask up to original size (bilinear, via canvas drawImage)
    const scaledMaskCanvas = document.createElement("canvas");
    scaledMaskCanvas.width = w;
    scaledMaskCanvas.height = h;
    const scaledMaskCtx = scaledMaskCanvas.getContext("2d");
    scaledMaskCtx.drawImage(maskCanvas, 0, 0, w, h);
    const scaledMaskData = scaledMaskCtx.getImageData(0, 0, w, h).data;

    // Draw original image at full size, punch alpha from the mask
    const outCanvas = document.createElement("canvas");
    outCanvas.width = w;
    outCanvas.height = h;
    const outCtx = outCanvas.getContext("2d");
    outCtx.drawImage(image, 0, 0, w, h);
    const outImageData = outCtx.getImageData(0, 0, w, h);

    for (let i = 0; i < w * h; i++) {
      outImageData.data[i * 4 + 3] = scaledMaskData[i * 4]; // alpha = mask value
    }
    outCtx.putImageData(outImageData, 0, 0);

    return outCanvas;
  }

  // DEBUG: returns the raw 1024x1024 grayscale mask as a PNG blob, with no
  // resizing or compositing — use this to check if the mask itself is a
  // clean person-shaped blob or garbage, independent of postprocess bugs.
  async debugMask(file) {
    const { logits, rawMin, rawMax } = await this.#getmask(file);
    const alreadyProbabilities = rawMin >= -0.01 && rawMax <= 1.01;

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(1024, 1024);

    for (let i = 0; i < logits.length; i++) {
      const prob = alreadyProbabilities ? logits[i] : this.#sigmoid(logits[i]);
      const v = Math.max(0, Math.min(1, prob)) * 255;
      imageData.data[i * 4] = v;
      imageData.data[i * 4 + 1] = v;
      imageData.data[i * 4 + 2] = v;
      imageData.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create debug mask blob"));
      }, "image/png");
    });
  }

  // Returns a Blob (PNG with transparent background)
  async remove(file) {
    const { logits, image, rawMin, rawMax } = await this.#getmask(file);
    const canvas = this.#postprocess(logits, image, rawMin, rawMax);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create output blob"));
      }, "image/png");
    });
  }
}