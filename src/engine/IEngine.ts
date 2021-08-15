export default interface IEngine {
	context: GPUPresentationContext | WebGLRenderingContext | WebGL2RenderingContext;
}

export enum EngineEvents {
	INITED = "inited"
}
