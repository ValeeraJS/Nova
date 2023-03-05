import { GPURendererContext, IWebGPURenderer } from "./IWebGPURenderer";
import { ICamera2 } from "../../../entities/Camera2";
import { Object2 } from "../../../entities/Object2";
export declare class WebGPUMesh2Renderer implements IWebGPURenderer {
    static readonly renderTypes = "mesh2";
    readonly renderTypes = "mesh2";
    camera: ICamera2;
    private entityCacheData;
    constructor(camera: ICamera2);
    clearCache(): this;
    render(entity: Object2, context: GPURendererContext): this;
    private createCacheData;
    private createPipeline;
    private parseGeometryBufferLayout;
    private createBindGroupLayout;
    private createStages;
}
