import { ColorGPU, ColorRGBA, IColorGPUJson, IColorRGB, IColorRGBA } from "@valeera/mathx"

export default interface IEngine {
	context: GPUCanvasContext | WebGLRenderingContext | WebGL2RenderingContext;
}

export enum EngineEvents {
	INITED = "inited",
	LOOP_STARTED = "loop-started",
	LOOP_ENDED = "loop-ended",
}

export interface EngineOptions {
	width?: number;
	height?: number;
	resolution?: number;
	autoResize?: boolean;
	noDepthTexture?: boolean;
	clearColor?: string | number | ColorGPU | Float32Array | number[] | IColorGPUJson;
	autoStart?: boolean;
	renderToSwapChain?: boolean;
	renderToTarget?: boolean;
}

const DEFAULT_ENGINE_OPTIONS: Required<EngineOptions> = {
	autoStart: true,
	width: window.innerWidth,
	height: window.innerHeight,
	resolution: window.devicePixelRatio,
	autoResize: false,
	noDepthTexture: false,
	clearColor: new ColorGPU(0, 0, 0, 1),
	renderToSwapChain: true,
	renderToTarget: false
}

export { DEFAULT_ENGINE_OPTIONS }
