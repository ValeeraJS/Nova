import type { IWorld } from "@valeera/x";
import { GPURendererContext, IWebGPURenderer } from "./IWebGPURenderer";
import { RenderSystemInCanvas } from "../RenderSystem";
import { IRenderSystemWebGPUOptions } from "../IRenderSystem";
import { IEntity } from "@valeera/x";
import { RENDERABLE } from "../../../components/constants";
import IScissor from "../IScissor";
import { WebGPUPostProcessingPass } from "./WebGPUPostProcessingPass";

export class WebGPURenderSystem extends RenderSystemInCanvas {

	public static async detect(
		canvas: HTMLCanvasElement = document.createElement("canvas"),
	): Promise<{ gpu: GPUCanvasContext, adapter: GPUAdapter, device: GPUDevice }> {
		const gpu = canvas.getContext("webgpu") as any as GPUCanvasContext;

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
	public commandEncoder: GPUCommandEncoder;
	public swapChainTexture: GPUTexture;
	public targetTexture: GPUTexture;
	public msaaTexture: GPUTexture;
	public postprocessingPasses = new Set<WebGPUPostProcessingPass>();
	private renderPassDescriptor: GPURenderPassDescriptor;

	constructor(name: string = "WebGPU Render System", options: IRenderSystemWebGPUOptions = {}) {
		super(name, options);
		WebGPURenderSystem.detect(this.canvas).then((data) => {
			this.context = data as any;
			this.context.preferredFormat = navigator.gpu.getPreferredCanvasFormat();
			this.#msaa = !!options.multisample;
			this.setMSAA(options.multisample ?? false);
			this.setRenderPassDescripter();
			data.gpu.configure({
				device: data.device,
				usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
				format: this.context.preferredFormat,
				alphaMode: "premultiplied"
			});
			this.targetTexture = this.context.device.createTexture({
				size: [this.canvas.width, this.canvas.height],
				format: this.context.preferredFormat,
				usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC
			});
			if (options.multisample?.count > 1) {
				this.msaaTexture = this.context.device.createTexture({
					size: [this.canvas.width, this.canvas.height],
					format: this.context.preferredFormat,
					sampleCount: this.context.multisample ? (this.context.multisample.count ?? 1) : 1,
					usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
				});
			}
			this.inited = true;
		});
	}

	#msaa = false;

	get msaa() {
		return this.#msaa;
	}

	set msaa(value: boolean) {
		if (value === this.#msaa) {
			return;
		}
		this.#msaa = value;
		this.setMSAA(value);
	}

	setMSAA(data: boolean | GPUMultisampleState) {
		this.endTaskQueue.push(() => {
			if (typeof data === 'boolean') {
				if (data) {
					this.context.multisample = {
						count: 4
					};
				} else {
					delete this.context.multisample;
				}
			} else {
				if (data.count === 1) {
					delete this.context.multisample;
				} else {
					this.context.multisample = data;
				}
			}

			this.setRenderPassDescripter();
			for (const renderer of this.rendererMap) {
				renderer[1].clearCache();
			}
		});
		return this;
	}

	public resize(width: number, height: number, resolution: number = this.resolution): this {
		super.resize(width, height, resolution);
		if (this.context) {
			this.setRenderPassDescripter();

			if (this.targetTexture) {
				this.targetTexture.destroy();
			}
			if (this.msaaTexture) {
				this.msaaTexture.destroy();
				this.msaaTexture = undefined;
			}
			this.targetTexture = this.context.device.createTexture({
				size: [this.canvas.width, this.canvas.height],
				format: this.context.preferredFormat,
				usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST
			});
		}
		return this;
	}

	run(world: IWorld, time: number, delta: number): this {
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
		super.run(world, time, delta);
		this.postprocess(world, time, delta);
		this.loopEnd();

		return this;
	}

	#scissor: IScissor = {
		x: 0,
		y: 0,
		width: 1,
		height: 1
	};

	get scissor() {
		return this.#scissor;
	}

	set scissor(value: IScissor) {
		this.#scissor = value;
	}

	handleBefore(time: number, delta: number, world: IWorld): this {
		if (this.disabled) {
			return this;
		}
		super.handleBefore(time, delta, world);
		
		// 根据不同类别进行渲染
		this.rendererMap.forEach((renderer: IWebGPURenderer) => {
			renderer.beforeRender?.(this.context);
		});
		return this;
	}

	handle(entity: IEntity): this {
		if (entity.disabled) {
			return this;
		}
		// 根据不同类别进行渲染
		this.rendererMap.get(entity.getComponent(RENDERABLE)?.data.type)?.render(entity, this.context);
		return this;
	}

	private loopStart() {
		this.commandEncoder = this.context.device.createCommandEncoder();
		this.swapChainTexture = this.context.gpu.getCurrentTexture();
		if (this.context.multisample?.count > 1) {
			if (!this.msaaTexture) {
				this.msaaTexture = this.context.device.createTexture({
					size: [this.canvas.width, this.canvas.height],
					format: this.context.preferredFormat,
					sampleCount: this.context.multisample ? (this.context.multisample.count ?? 1) : 1,
					usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
				});
			}
			this.renderPassDescriptor.colorAttachments[0].view = this.msaaTexture.createView();
			this.renderPassDescriptor.colorAttachments[0].resolveTarget = this.swapChainTexture.createView();
		} else {
			this.renderPassDescriptor.colorAttachments[0].view = this.swapChainTexture.createView();
		}
		this.context.passEncoder = this.commandEncoder.beginRenderPass(this.renderPassDescriptor);
	}

	public addPostprocessingPass(pass: WebGPUPostProcessingPass) {
		this.postprocessingPasses.add(pass);
	}

	public removePostprocessingPass(pass: WebGPUPostProcessingPass) {
		this.postprocessingPasses.delete(pass);
	}


	public async getFramePixelData() {
		const width = this.swapChainTexture.width;
		const height = this.swapChainTexture.height;
		const numChannels = 4;
		const size = Math.ceil(width * numChannels / 256) * 256;

		const buffer = this.context.device.createBuffer({ size: size * height, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });

		const commandEncoder = this.context.device.createCommandEncoder({});

		commandEncoder.copyTextureToBuffer({
			texture: this.targetTexture,
			origin: {
				x: 0,
				y: 0,
				z: 0
			}
		}, {
			buffer: buffer,
			offset: 0,
			bytesPerRow: size,
			rowsPerImage: height
		}, {
			width,
			height,
			depthOrArrayLayers: 1
		});

		this.context.device.queue.submit([commandEncoder!.finish()]);

		await buffer.mapAsync(GPUMapMode.READ);
		const copyArrayBuffer = buffer.getMappedRange();
  
		console.log(new Uint8Array(copyArrayBuffer));
	}

	private postprocess(world: any, time: number, delta: number) {
		this.postprocessingPasses.forEach((pass) => {
			if (pass.disabled) {
				return;
			}
			this.context.passEncoder.end();
			this.commandEncoder.copyTextureToTexture(
				{
					texture: this.swapChainTexture,
				},
				{
					texture: this.targetTexture,
				},
				[this.swapChainTexture.width, this.swapChainTexture.height]
			);
			this.context.passEncoder = this.commandEncoder.beginRenderPass(this.renderPassDescriptor);
			pass.render(this.context, this.targetTexture);
		});
	}

	private loopEnd() {
		this.context.passEncoder.end();
		this.commandEncoder.copyTextureToTexture(
			{
				texture: this.swapChainTexture,
			},
			{
				texture: this.targetTexture,
			},
			[this.swapChainTexture.width, this.swapChainTexture.height]
		);
		this.context.device.queue.submit([this.commandEncoder.finish()]);
		while (this.endTaskQueue.length) {
			this.endTaskQueue.shift()();
		}
	}

	private endTaskQueue: Function[] = [];

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
				sampleCount: this.context.multisample ? (this.context.multisample.count ?? 1) : 1,
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
