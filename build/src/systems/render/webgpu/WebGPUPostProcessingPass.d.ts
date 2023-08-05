import { GPURendererContext } from "./IWebGPURenderer";
export declare class WebGPUPostProcessingPass {
    pipeline: GPURenderPipeline | undefined;
    shader: string;
    dirty: boolean;
    verticesBuffer: GPUBuffer;
    sampler: GPUSampler;
    name: string;
    disabled: boolean;
    resolution: Float32Array;
    constructor(name: string, shader: string);
    update(context: GPURendererContext): this;
    render(context: GPURendererContext, texture: GPUTexture): void;
}
