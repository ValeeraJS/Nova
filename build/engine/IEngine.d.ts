/// <reference types="dist" />
export default interface IEngine {
    context: GPUCanvasContext | WebGLRenderingContext | WebGL2RenderingContext;
}
export declare enum EngineEvents {
    INITED = "inited"
}
export interface EngineOptions {
    width?: number;
    height?: number;
    resolution?: number;
    autoResize?: boolean;
}
declare const DEFAULT_ENGINE_OPTIONS: Required<EngineOptions>;
export { DEFAULT_ENGINE_OPTIONS };
