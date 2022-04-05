import EventDispatcher from "@valeera/eventdispatcher";
import IEngine, { DEFAULT_ENGINE_OPTIONS, EngineEvents, EngineOptions } from "./IEngine";

export default class WebGPUEngine extends EventDispatcher implements IEngine {
	public options:  Required<EngineOptions>;
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

	public constructor(canvas: HTMLCanvasElement = document.createElement("canvas"), options: EngineOptions = {}) {
		super();
		this.canvas = canvas;
		this.options = {
			...DEFAULT_ENGINE_OPTIONS,
			...options,
		}
		this.resize(options.width ?? window.innerWidth, options.height ?? window.innerHeight, options.resolution ?? window.devicePixelRatio);
		
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

	public resize(width: number, height: number, resolution: number = this.options.resolution): this {
		this.options.width = width;
		this.options.height = height;
		this.options.resolution = resolution;
		this.canvas.style.width = width + 'px';
		this.canvas.style.height = height + 'px';
		this.canvas.width = width * resolution;
		this.canvas.height = height * resolution;
		return this;
	}

	createRenderer() {
		
	}
}
