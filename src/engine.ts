export class Engine {

    public adapter: GPUAdapter;
    device: GPUDevice;
    constructor() {
        
    }

    async init() {
        const adapter = await navigator?.gpu?.requestAdapter();
        if (!adapter) {
            throw new Error("WebGPU not supported");
        }
        this.adapter = adapter;
	    const device = await this.adapter.requestDevice();
        if (!device) {
            throw new Error("WebGPU not supported");
        }
        this.device = device;

        return this;
    }
}
