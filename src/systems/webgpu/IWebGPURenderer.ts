import type { IEntity } from "@valeera/x";
import { IRenderer } from "./../IRenderer";

export interface GPURendererContext {
    gpu: GPUCanvasContext;
    adapter: GPUAdapter;
    device: GPUDevice;
    passEncoder: GPURenderPassEncoder;
    preferredFormat: GPUTextureFormat;
}

export interface IWebGPURenderer extends IRenderer {
    render(entity: IEntity, context: GPURendererContext): any; // 处理渲染逻辑
}
