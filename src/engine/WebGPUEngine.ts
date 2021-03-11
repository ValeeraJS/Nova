import EventDispatcher from "@valeera/eventdispatcher";
import IEngine from "./IEngine";

export default class WebGPUEngine extends EventDispatcher implements IEngine {
	public static async detect(
		canvas: HTMLCanvasElement = document.createElement("canvas"),
	): Promise<{context: GPUCanvasContext, adapter: GPUAdapter, device: GPUDevice}> {
		const context = canvas.getContext("gpupresent");

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
	public context!: GPUCanvasContext;
	public device!: GPUDevice;
	public inited: boolean = false;

	public static INITED = "inited";

	constructor(canvas: HTMLCanvasElement) {
		super();
		this.canvas = canvas;
		WebGPUEngine.detect(canvas).then(({context, adapter, device})=> {
			this.context = context;
			this.adapter = adapter;
			this.device = device;
			this.inited = true;
			this.fire(WebGPUEngine.INITED, {
				eventKey: WebGPUEngine.INITED,
				target: this
			});
		}).catch((error)=>{
			throw error;
		});
	}

	createRenderer() {
		
	}
}
