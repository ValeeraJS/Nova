/// <reference types="dist" />
import { IColorGPUJson, IColorGPU, IColorRGB, IColorRGBA, IColorRGBAJson, IColorRGBJson } from "@valeera/mathx";
import WebGPUEngine from "../../engine/WebGPUEngine";
export default class Clearer {
    color: IColorGPU;
    engine: WebGPUEngine;
    private renderPassDescriptor;
    private depthTexture;
    constructor(engine: WebGPUEngine, color?: IColorGPU | string | Float32Array | number[] | number | IColorRGB | IColorRGBA);
    setColor(color: IColorGPU | string | Float32Array | number[] | number | IColorRGB | IColorRGBA | IColorRGBAJson | IColorRGBJson): this;
    updateColor(color: IColorGPUJson): this;
    clear(commandEncoder: GPUCommandEncoder): GPURenderPassEncoder;
}
