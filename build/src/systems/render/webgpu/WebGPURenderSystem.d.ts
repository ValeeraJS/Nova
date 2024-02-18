import type { World } from "@valeera/x";
import { GPURendererContext, IWebGPURenderer } from "./IWebGPURenderer";
import { RenderSystemInCanvas } from "../RenderSystem";
import { IRenderSystemWebGPUOptions } from "../IRenderSystem";
import { Entity } from "@valeera/x";
import IScissor from "../IScissor";
import { WebGPUPostProcessingPass } from "./WebGPUPostProcessingPass";
export declare class WebGPURenderSystem extends RenderSystemInCanvas {
    #private;
    static Events: {
        INITED: string;
    };
    static getAdapterAndDevice(adapterInput?: GPUAdapter, deviceInput?: GPUDevice): Promise<{
        adapter: GPUAdapter;
        device: GPUDevice;
    }>;
    static detect(canvas?: HTMLCanvasElement, adapterInput?: GPUAdapter, deviceInput?: GPUDevice): Promise<{
        gpu: GPUCanvasContext;
        adapter: GPUAdapter;
        device: GPUDevice;
    }>;
    rendererMap: Map<string, IWebGPURenderer>;
    inited: boolean;
    context: undefined | GPURendererContext;
    commandEncoder: GPUCommandEncoder;
    swapChainTexture: GPUTexture;
    targetTexture: GPUTexture;
    msaaTexture: GPUTexture;
    postprocessingPasses: Set<WebGPUPostProcessingPass>;
    private renderPassDescriptor;
    constructor(options?: IRenderSystemWebGPUOptions, adapterInput?: GPUAdapter, deviceInput?: GPUDevice, name?: string);
    get msaa(): boolean;
    set msaa(value: boolean);
    setMSAA(data: boolean | GPUMultisampleState): this;
    resize(width?: number, height?: number, resolution?: number): this;
    run(world: World, time: number, delta: number): this;
    get scissor(): IScissor;
    set scissor(value: IScissor);
    handleBefore(time: number, delta: number, world: World): this;
    handle(entity: Entity): this;
    private loopStart;
    add(renderOrPass: WebGPUPostProcessingPass | IWebGPURenderer): this;
    addPostprocessingPass(pass: WebGPUPostProcessingPass): this;
    removePostprocessingPass(pass: WebGPUPostProcessingPass): this;
    getFramePixelData(): Promise<ArrayBuffer>;
    private postprocess;
    private loopEnd;
    private endTaskQueue;
    private setRenderPassDescripter;
}
