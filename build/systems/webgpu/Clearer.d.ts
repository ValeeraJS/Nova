/// <reference types="dist" />
import { IColorGPUJson } from "@valeera/mathx/src/color/ColorGPU";
import WebGPUEngine from "../../engine/WebGPUEngine";
export default class Clearer {
    color: IColorGPUJson;
    engine: WebGPUEngine;
    private renderPassDescriptor;
    private depthTexture;
    constructor(engine: WebGPUEngine, color?: IColorGPUJson);
    setColor(color: IColorGPUJson): this;
    updateColor(color: IColorGPUJson): this;
    clear(commandEncoder: GPUCommandEncoder): GPURenderPassEncoder;
}
