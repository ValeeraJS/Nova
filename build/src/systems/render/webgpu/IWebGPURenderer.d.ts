import type { IEntity } from "@valeera/x";
import { IRenderer } from "./../IRenderer";
export interface GPURendererContext {
    gpu: GPUCanvasContext;
    adapter: GPUAdapter;
    device: GPUDevice;
    passEncoder: GPURenderPassEncoder;
    preferredFormat: GPUTextureFormat;
    multisample?: GPUMultisampleState;
}
export interface IWebGPURenderer extends IRenderer {
    clearCache(): this;
    render(entity: IEntity, context: GPURendererContext): any;
}
