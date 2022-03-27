import IEntity from "@valeera/x/src/interfaces/IEntity";
import IWebGLRenderer from "./IWebGLRenderer";
import WebGLEngine from "../../engine/WebGLEngine";
export default class MeshRenderer implements IWebGLRenderer {
    static readonly renderTypes = "mesh";
    readonly renderTypes = "mesh";
    private entityCacheData;
    engine: WebGLEngine;
    constructor(engine: WebGLEngine);
    render(mesh: IEntity, camera: IEntity, _scissor?: any): this;
    private createCacheData;
    private createPipeline;
    private createBindGroupLayout;
    private createStages;
}
