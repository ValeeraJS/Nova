import EventFire from "@valeera/eventdispatcher";
import Timeline from "@valeera/timeline";
import { ColorGPU, IColorGPU, IColorRGB, IColorRGBA, IColorRGBAJson, IColorRGBJson } from "@valeera/mathx";
import getColorGPU from "../utils/getColorGPU";
import IEngine, { DEFAULT_ENGINE_OPTIONS, EngineEvents, EngineOptions } from "./IEngine";

export default class WebGPUEngine extends EventFire.mixin(Timeline) implements IEngine {
	public options: Required<EngineOptions>;
	public clearColor: ColorGPU = new ColorGPU(0, 0, 0, 1);
	public swapChainTexture: GPUTexture;
	public renderPassEncoder: GPURenderPassEncoder;
	public static async detect(
		canvas: HTMLCanvasElement = document.createElement("canvas"),
	): Promise<{ context: GPUCanvasContext, adapter: GPUAdapter, device: GPUDevice }> {
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

		return { context, adapter, device };
	}

	public static Events = EngineEvents;

	public adapter!: GPUAdapter;
	public canvas: HTMLCanvasElement;
	public context!: GPUCanvasContext;
	public device!: GPUDevice;
	public inited: boolean = false;
	public preferredFormat!: GPUTextureFormat;
	public currentCommandEncoder: GPUCommandEncoder;

	private renderPassDescriptor: GPURenderPassDescriptor;

	public constructor(canvas: HTMLCanvasElement = document.createElement("canvas"), options: EngineOptions = {}) {
		super();
		this.canvas = canvas;
		this.options = {
			...DEFAULT_ENGINE_OPTIONS,
			...options,
		}
		this.resize(options.width ?? window.innerWidth, options.height ?? window.innerHeight, options.resolution ?? window.devicePixelRatio);

		WebGPUEngine.detect(canvas).then(({ context, adapter, device }) => {
			this.context = context;
			this.adapter = adapter;
			this.device = device;
			this.inited = true;
			this.preferredFormat = context.getPreferredFormat(adapter);
			this.setRenderPassDescripter();
			this.fire(EngineEvents.INITED, {
				eventKey: EngineEvents.INITED,
				target: this
			});
			if (this.options.autoStart) {
				this.start();
			}
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

	public setClearColor(color: IColorGPU | string | Float32Array | number[] | number | IColorRGB | IColorRGBA | IColorRGBAJson | IColorRGBJson): this {
		getColorGPU(color, this.clearColor);
		return this;
	}

	protected update(time: number, delta: number): this {
		this.loopStart();
		super.update(time, delta);
		this.loopEnd();
		return this;
	}

	private loopStart() {
		this.currentCommandEncoder = this.device.createCommandEncoder();
		this.swapChainTexture = this.context.getCurrentTexture();
		this.renderPassDescriptor.colorAttachments[0].view = this.context
			.getCurrentTexture()
			.createView();
		this.renderPassEncoder = this.currentCommandEncoder.beginRenderPass(this.renderPassDescriptor);
	}

	private loopEnd() {
		this.renderPassEncoder.end();
		this.device.queue.submit([this.currentCommandEncoder.finish()]);
	}

	private setRenderPassDescripter() {
		let renderPassDescriptor: GPURenderPassDescriptor = {
			colorAttachments: [
				{
					view: null,
					loadOp: "clear",
					clearValue: this.clearColor,
					storeOp: "store"
				}
			]
		}
		if (!this.options.noDepthTexture) {
			let depthTexture = this.device.createTexture({
				size: { width: this.canvas.width, height: this.canvas.height, depthOrArrayLayers: 1 },
				format: "depth24plus",
				usage: GPUTextureUsage.RENDER_ATTACHMENT
			});
			renderPassDescriptor.depthStencilAttachment = {
				view: depthTexture.createView(),
				depthClearValue: 1.0,
				depthLoadOp: "clear",
				depthStoreOp: "store"
			};
		}

		this.renderPassDescriptor = renderPassDescriptor;
	}


}
