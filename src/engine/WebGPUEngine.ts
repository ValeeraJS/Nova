import EventFire from "@valeera/eventdispatcher";
import Timeline from "@valeera/timeline";
import { ColorGPU } from "@valeera/mathx";
import getColorGPU, { ColorFormatType } from "../utils/getColorGPU";
import IEngine, { DEFAULT_ENGINE_OPTIONS, EngineEvents, EngineOptions } from "./IEngine";

export default class WebGPUEngine extends EventFire.mixin(Timeline) implements IEngine {
	public options: Required<EngineOptions>;
	public swapChainTexture: GPUTexture;
	public targetTexture: GPUTexture;
	public renderPassEncoder: GPURenderPassEncoder;
	public static async detect(
		canvas: HTMLCanvasElement = document.createElement("canvas"),
	): Promise<{ context: GPUCanvasContext, adapter: GPUAdapter, device: GPUDevice }> {
		const context = canvas.getContext("webgpu") as GPUCanvasContext;

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
	#clearColorGPU = new ColorGPU(0, 0, 0, 1);

	get clearColor(): ColorFormatType {
		return this.options.clearColor;
	}

	set clearColor(value: ColorFormatType) {
		this.options.clearColor = value;
		getColorGPU(value, this.#clearColorGPU);
	}

	get resolution(): number {
		return this.options.resolution;
	}

	set resolution(v: number) {
		this.options.resolution = v;

		this.resize(this.options.width, this.options.height, v);
	}

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
			this.preferredFormat = navigator.gpu.getPreferredCanvasFormat();
			this.setRenderPassDescripter();
			this.targetTexture = this.device.createTexture({
				size: [this.canvas.width, this.canvas.height],
				format: this.preferredFormat,
				usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
			});
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
		if (this.device) {
			this.setRenderPassDescripter();

			if (this.targetTexture) {
				this.targetTexture.destroy();
			}
			this.targetTexture = this.device.createTexture({
				size: [this.canvas.width, this.canvas.height],
				format: this.preferredFormat,
				usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
			});
		}
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
		this.renderPassDescriptor.colorAttachments[0].view = this.options.renderToSwapChain ? this.swapChainTexture.createView() : this.targetTexture.createView();
		this.renderPassEncoder = this.currentCommandEncoder.beginRenderPass(this.renderPassDescriptor);
		this.fire(EngineEvents.LOOP_STARTED, this);
	}

	private loopEnd() {
		this.renderPassEncoder.end();
		this.fire(EngineEvents.LOOP_ENDED, this);
		this.device.queue.submit([this.currentCommandEncoder.finish()]);
	}

	#depthTexture: GPUTexture | undefined;

	private setRenderPassDescripter() {
		if (this.#depthTexture) {
			this.#depthTexture.destroy();
		}
		let renderPassDescriptor: GPURenderPassDescriptor = {
			colorAttachments: [
				{
					view: null,
					loadOp: "clear",
					clearValue: this.#clearColorGPU,
					storeOp: "store"
				}
			]
		}
		if (!this.options.noDepthTexture) {
			this.#depthTexture = this.device.createTexture({
				size: { width: this.canvas.width, height: this.canvas.height, depthOrArrayLayers: 1 },
				format: "depth24plus",
				usage: GPUTextureUsage.RENDER_ATTACHMENT
			});
			renderPassDescriptor.depthStencilAttachment = {
				view: this.#depthTexture.createView(),
				depthClearValue: 1.0,
				depthLoadOp: "clear",
				depthStoreOp: "store"
			};
		}

		this.renderPassDescriptor = renderPassDescriptor;
	}
}
