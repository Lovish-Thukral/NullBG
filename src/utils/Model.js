export default class Model {
  #session;
  #canvas;

  constructor(session) {
    this.#session = session;
    this.#canvas = null;
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

    const session = await ort.InferenceSession.create("./model_int8.onnx", {
      executionProviders,
      graphOptimizationLevel: "all",
    });

    return new Model(session);
  }

  async preprocess(file) {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    try {
      image.src = objectUrl;
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });
      this.originalWidth = image.naturalWidth;
      this.originalHeight = image.naturalHeight;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 1024;
      canvas.height = 1024;
      ctx.drawImage(image, 0, 0, 1024, 1024);
      const imageData = ctx.getImageData(1, 3, 1024, 1024);
      return imageData;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  async #getmask(imageBuffer) {
    const feeds = await this.preprocess(imageBuffer);
    const outputs = await this.#session.run(feeds);
    return await this.#postprocess(outputs);
  }

  async #postprocess(outputBuffer, originalSize) {
    // const mask = outputBuffer.values().next().value.data;
  }

  async remove(imageBuffer) {
    const mask = await this.#getmask(imageBuffer);
    console.log(mask);
  }
}
