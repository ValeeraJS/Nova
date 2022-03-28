export default interface IEngine {
	context: GPUCanvasContext | WebGLRenderingContext | WebGL2RenderingContext;
}

export enum EngineEvents {
	INITED = "inited"
}

export interface EngineOptions {
	width?: number;
	height?: number;
	resolution?: number;
	autoResize?: boolean;
}

const DEFAULT_ENGINE_OPTIONS: Required<EngineOptions> = {
	width: window.innerWidth,
	height: window.innerHeight,
	resolution: window.devicePixelRatio,
	autoResize: true,
}

export { DEFAULT_ENGINE_OPTIONS }
