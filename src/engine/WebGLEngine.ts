import EventDispatcher from "@valeera/eventdispatcher";
import IEngine, { EngineEvents } from "./IEngine";

export default class WebGLEngine extends EventDispatcher implements IEngine {
	public static async detect(
		canvas: HTMLCanvasElement = document.createElement("canvas"),
	): Promise<{context: WebGLRenderingContext}> {
		const context = canvas.getContext("webgl");

		if (!context) {
			throw new Error('WebGL not supported: ');
		}

		return {context};
	}

	public canvas: HTMLCanvasElement;
	public context!: WebGLRenderingContext;
	public inited: boolean = false;

	constructor(canvas: HTMLCanvasElement = document.createElement("canvas")) {
		super();
		this.canvas = canvas;
		WebGLEngine.detect(canvas).then(({context})=> {
			this.context = context;
			this.inited = true;
			this.fire(EngineEvents.INITED, {
				eventKey: EngineEvents.INITED,
				target: this
			});
		}).catch((error)=>{
			throw error;
		});
	}

	createRenderer() {
		
	}
}
