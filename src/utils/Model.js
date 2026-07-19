export default class Model {
    constructor(session, ort) {
        this.session = session;
        this.ort = ort;
    }

    static async create(modelPath, gpu = true) {
        let ort;
        let executionProviders;

        if (gpu && navigator.gpu) {
            try {
                ort = await import("onnxruntime-web/webgpu");
                executionProviders = ["webgpu", "wasm"];
            } catch (e) {
                console.warn("WebGPU unavailable. Falling back to WASM.");
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

        return new Model(session, ort);
    }

    async run(feeds) {
        return await this.session.run(feeds);
    }

    async dispose() {
        await this.session.release();
    }
}