import type { Entity } from "@valeera/x";
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
    beforeRender?(context: GPURendererContext): this;
    render(entity: Entity, context: GPURendererContext): any; // 处理渲染逻辑
}
