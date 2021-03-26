export default interface IEngine {
	context: GPUCanvasContext | WebGLRenderingContext | WebGL2RenderingContext;
}

export enum EngineEvents {
	INITED = "inited"
}
