/// <reference types="dist" />
export default interface IEngine {
    context: GPUCanvasContext | WebGLRenderingContext | WebGL2RenderingContext;
}
export declare enum EngineEvents {
    INITED = "inited"
}
