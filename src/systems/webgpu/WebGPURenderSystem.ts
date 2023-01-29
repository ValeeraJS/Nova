import type { IWorld } from "@valeera/x";
import { GPURendererContext, IWebGPURenderer } from "./IWebGPURenderer";
import { RenderSystemInCanvas } from "../RenderSystem";
import { IRenderSystemInCanvasOptions } from "../IRenderSystem";
import { IEntity } from "@valeera/x";
import { RENDERABLE } from "../../components/constants";

export class WebGPURenderSystem extends RenderSystemInCanvas {

	public static async detect(
		canvas: HTMLCanvasElement = document.createElement("canvas"),
	): Promise<{ gpu: GPUCanvasContext, adapter: GPUAdapter, device: GPUDevice }> {
		const gpu = canvas.getContext("webgpu") as GPUCanvasContext;

		if (!gpu) {
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

		return { gpu, adapter, device };
	}
	rendererMap: Map<string, IWebGPURenderer> = new Map();
	inited = false;
	context: undefined | GPURendererContext = undefined;
	public currentCommandEncoder: GPUCommandEncoder;
	public swapChainTexture: GPUTexture;
	public targetTexture: GPUTexture;
	private renderPassDescriptor: GPURenderPassDescriptor;

	constructor(name: string = "WebGPU Render System", options: IRenderSystemInCanvasOptions = {}) {
		super(name, options);
		WebGPURenderSystem.detect(this.canvas).then((data) => {
			this.context = data as any;
			this.context.preferredFormat = navigator.gpu.getPreferredCanvasFormat();
			this.setRenderPassDescripter();
			data.gpu.configure({
				device: data.device,
				usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
				format: this.context.preferredFormat,
				alphaMode: "premultiplied"
			});
			this.inited = true;
		});
	}

	public resize(width: number, height: number, resolution: number = this.resolution): this {
		super.resize(width, height, resolution);
		if (this.context) {
			this.setRenderPassDescripter();

			if (this.targetTexture) {
				this.targetTexture.destroy();
			}
			this.targetTexture = this.context.device.createTexture({
				size: [this.canvas.width, this.canvas.height],
				format: this.context.preferredFormat,
				usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
			});
		}
		return this;
	}

	run(world: IWorld): this {
		if (!this.inited) {
			return this;
		}
		this.loopStart();
		const w = this.canvas.width;
		const h = this.canvas.height;
		const passEncoder = this.context.passEncoder as GPURenderPassEncoder;
		passEncoder.setViewport(
			this.viewport.x * w, this.viewport.y * h, this.viewport.width * w, this.viewport.height * h, this.viewport.minDepth, this.viewport.maxDepth);
		passEncoder.setScissorRect(
			this.scissor.x * w, this.scissor.y * h, this.scissor.width * w, this.scissor.height * h);
		world.store.set("passEncoder", passEncoder);
		super.run(world);
		this.loopEnd();

		return this;
	}

	handle(entity: IEntity): this {
		if (entity.disabled) {
			return this;
		}
		// 根据不同类别进行渲染
		this.rendererMap.get(entity.getComponent(RENDERABLE)?.data)?.render(entity, this.context);
		return this;
	}

	private loopStart() {
		this.currentCommandEncoder = this.context.device.createCommandEncoder();
		this.swapChainTexture = this.context.gpu.getCurrentTexture();
		this.renderPassDescriptor.colorAttachments[0].view = this.swapChainTexture.createView();
		this.context.passEncoder = this.currentCommandEncoder.beginRenderPass(this.renderPassDescriptor);
	}

	private loopEnd() {
		this.context.passEncoder.end();
		this.context.device.queue.submit([this.currentCommandEncoder.finish()]);
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
					clearValue: this.clearColorGPU,
					storeOp: "store"
				}
			]
		}
		if (!this.options.noDepthTexture) {
			this.#depthTexture = this.context.device.createTexture({
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