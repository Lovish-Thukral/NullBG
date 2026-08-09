// export default class Model {
//   #session;
//   #canvas;

//   constructor(session) {
//     this.#session = session;
//     this.#canvas = null;
//   }
//   /**
//    * Creates an ONNX Runtime inference session.
//    *
//    * @param {boolean} [gpu=true] - Whether to attempt WebGPU acceleration.
//    * @returns {Promise<Model>} A Model instance containing the inference session.
//    */
//   static async create(gpu = false) {
//     let ort;
//     let executionProviders;

//     if (gpu && navigator.gpu) {
//       try {
//         ort = await import("onnxruntime-web/webgpu");
//         executionProviders = ["webgpu", "wasm"];
//       } catch {
//         ort = await import("onnxruntime-web");
//         executionProviders = ["wasm"];
//       }
//     } else {
//       ort = await import("onnxruntime-web");
//       executionProviders = ["wasm"];
//     }

//     const session = await ort.InferenceSession.create("./model_int8.onnx", {
//       executionProviders,
//       graphOptimizationLevel: "all",
//     });

//     return new Model(session);
//   }

//   /**
//    * Remove The Backgroud from the images.
//    *
//    * @param {Blob} [imageBugger] Buffer of Image to Process.
//    * @returns {removedImageBlob} result image blob with background removed.
//    */
//   async remove(imageBuffer) {
//     const feeds = await this.#preprocess(imageBuffer);
//     const outputs = await this.#session.run(feeds);
//     return await this.#postprocess(outputs);
//   }

//   /**
//    * Releases the resources used by the ONNX Runtime inference session.
//    *
//    * @returns {Promise<void>} A promise that resolves when the session is released.
//    */
//   async dispose() {
//     await this.#session.release();
//   }
//   async dispose() {
//     await this.#session.release();
//   }

//   async #preprocess(imageBuffer) {
//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");

//     canvas.width = 1024;
//     canvas.height = 1024;

//     const image = await this.#loadImage(imageBuffer);

//     ctx.drawImage(image, 0, 0, 1024, 1024);

//     const imageData = ctx.getImageData(0, 0, 1024, 1024);

//     return imageData;
//   }

//   async #postprocess(outputs) {}
// }
