import EventDispatcher from "@valeera/eventdispatcher";
import IEngine, { DEFAULT_ENGINE_OPTIONS, EngineEvents, EngineOptions } from "./IEngine";

export default class WebGPUEngine extends EventDispatcher implements IEngine {
	public static async detect(
		canvas: HTMLCanvasElement = document.createElement("canvas"),
	): Promise<{context: GPUCanvasContext, adapter: GPUAdapter, device: GPUDevice}> {
		const context = (canvas.getContext("webgpu") as any) as GPUCanvasContext;

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

	public static Events = EngineEvents;

	public adapter!: GPUAdapter;
	public canvas: HTMLCanvasElement;
	public context!: GPUCanvasContext;
	public device!: GPUDevice;
	public inited: boolean = false;
	public preferredFormat!: GPUTextureFormat;

	public constructor(canvas: HTMLCanvasElement = document.createElement("canvas"), options: EngineOptions = DEFAULT_ENGINE_OPTIONS) {
		super();
		this.canvas = canvas;
		this.resize(options.width ?? DEFAULT_ENGINE_OPTIONS.width, options.height ?? DEFAULT_ENGINE_OPTIONS.height, options.resolution ?? DEFAULT_ENGINE_OPTIONS.resolution);
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

	public resize(width: number, height: number, resolution: number): this {
		this.canvas.style.width = width + 'px';
		this.canvas.style.height = height + 'px';
		this.canvas.width = width * resolution;
		this.canvas.height = height * resolution;
		return this;
	}

	createRenderer() {
		
	}
}
