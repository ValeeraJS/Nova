import type { IWorld } from "@valeera/x";
import { GPURendererContext, IWebGPURenderer } from "./IWebGPURenderer";
import { RenderSystemInCanvas } from "../RenderSystem";
import { IRenderSystemWebGPUOptions } from "../IRenderSystem";
import { IEntity } from "@valeera/x";
import IScissor from "../IScissor";
import { WebGPUPostProcessingPass } from "./WebGPUPostProcessingPass";
export declare class WebGPURenderSystem extends RenderSystemInCanvas {
    #private;
    static detect(canvas?: HTMLCanvasElement): Promise<{
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
    constructor(name?: string, options?: IRenderSystemWebGPUOptions);
    setMSAA(data: boolean | GPUMultisampleState): this;
    resize(width: number, height: number, resolution?: number): this;
    run(world: IWorld, time: number, delta: number): this;
    get scissor(): IScissor;
    set scissor(value: IScissor);
    handle(entity: IEntity): this;
    private loopStart;
    addPostprocessingPass(pass: WebGPUPostProcessingPass): void;
    removePostprocessingPass(pass: WebGPUPostProcessingPass): void;
    private postprocess;
    private loopEnd;
    private endTaskQueue;
    private setRenderPassDescripter;
}
