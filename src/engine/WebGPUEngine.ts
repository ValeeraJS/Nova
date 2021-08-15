import EventDispatcher from "@valeera/eventdispatcher";
import IEngine, { EngineEvents } from "./IEngine";

export default class WebGPUEngine extends EventDispatcher implements IEngine {
	public static async detect(
		canvas: HTMLCanvasElement = document.createElement("canvas"),
	): Promise<{context: GPUPresentationContext, adapter: GPUAdapter, device: GPUDevice}> {
		const context = (canvas.getContext("webgpu") as any) as GPUPresentationContext;

		if (!context) {
			throw new Error('WebGPU not supported: ');
		}

		const adapter = await navigator?.gpu?.requestAdapter();

		if (!adapter) {
			throw new Error('WebGPU not supported: ');
		}

		const device = await adapter.requestDevice();

		if (!device) {
			throw new Error('WebGPU not supported: ');
		}

		return {context, adapter, device};
	}

	public adapter!: GPUAdapter;
	public canvas: HTMLCanvasElement;
	public context!: GPUPresentationContext;
	public device!: GPUDevice;
	public inited: boolean = false;
	public preferredFormat!: GPUTextureFormat;

	constructor(canvas: HTMLCanvasElement = document.createElement("canvas")) {
		super();
		this.canvas = canvas;
		WebGPUEngine.detect(canvas).then(({context, adapter, device})=> {
			this.context = context;
			this.adapter = adapter;
			this.device = device;
			this.inited = true;
			this.preferredFormat = context.getPreferredFormat(adapter);
			this.fire(EngineEvents.INITED, {
				eventKey: EngineEvents.INITED,
				target: this
			});
		}).catch((error) => {
			throw error;
		});
	}

	createRenderer() {
		
	}
}
