/// <reference types="dist" />
import EventDispatcher from "@valeera/eventdispatcher";
import IEngine, { EngineEvents } from "./IEngine";
export default class WebGPUEngine extends EventDispatcher implements IEngine {
    static detect(canvas?: HTMLCanvasElement): Promise<{
        context: GPUCanvasContext;
        adapter: GPUAdapter;
        device: GPUDevice;
    }>;
    static Events: typeof EngineEvents;
    adapter: GPUAdapter;
    canvas: HTMLCanvasElement;
    context: GPUCanvasContext;
    device: GPUDevice;
    inited: boolean;
    preferredFormat: GPUTextureFormat;
    constructor(canvas?: HTMLCanvasElement);
    createRenderer(): void;
}
