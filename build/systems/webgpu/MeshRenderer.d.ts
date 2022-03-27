/// <reference types="dist" />
import IEntity from "@valeera/x/src/interfaces/IEntity";
import WebGPUEngine from "../../engine/WebGPUEngine";
import IRenderer from "./IWebGPURenderer";
export default class MeshRenderer implements IRenderer {
    static readonly renderTypes = "mesh";
    readonly renderTypes = "mesh";
    private entityCacheData;
    engine: WebGPUEngine;
    constructor(engine: WebGPUEngine);
    render(mesh: IEntity, camera: IEntity, passEncoder: GPURenderPassEncoder, _scissor?: any): this;
    private createCacheData;
    private createPipeline;
    private createBindGroupLayout;
    private createStages;
}
