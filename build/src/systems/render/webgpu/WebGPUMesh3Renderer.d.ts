import { GPURendererContext, IWebGPURenderer } from "./IWebGPURenderer";
import { ICamera3 } from "../../../entities/Camera3";
import { Object3 } from "../../../entities/Object3";
export declare class WebGPUMesh3Renderer implements IWebGPURenderer {
    static readonly renderTypes = "mesh3";
    readonly renderTypes = "mesh3";
    camera: ICamera3;
    vpMatrix: Float32Array;
    private entityCacheData;
    constructor(camera?: ICamera3);
    clearCache(): this;
    beforeRender(): this;
    render(entity: Object3, context: GPURendererContext): this;
    private createCacheData;
    private createPipeline;
    private parseGeometryBufferLayout;
    private createBindGroupLayout;
    private createStages;
}
