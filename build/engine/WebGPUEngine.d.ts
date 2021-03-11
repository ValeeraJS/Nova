/// <reference types="dist" />
import IEngine from "./IEngine";
export default class WebGPUEngine implements IEngine {
    static detect(canvas?: HTMLCanvasElement, engine?: WebGPUEngine): Promise<boolean>;
    adapter: GPUAdapter | null;
    context: GPUCanvasContext | null;
    device: GPUDevice | null;
    init(adapter: GPUAdapter, device: GPUDevice, contex: GPUCanvasContext): this;
}
