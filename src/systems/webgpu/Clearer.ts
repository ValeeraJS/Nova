import { createJson, IColorGPUJson } from "@valeera/mathx/src/color/ColorGPU";
import WebGPUEngine from "../../engine/WebGPUEngine";

export default class Clearer {
	public color: IColorGPUJson;
	public engine: WebGPUEngine;
	private renderPassDescriptor: GPURenderPassDescriptor;
	private depthTexture: GPUTexture;
	public constructor(engine: WebGPUEngine, color: IColorGPUJson = createJson()) {
		this.engine = engine;
		this.color = color;
		console.log(engine)
		this.depthTexture = engine.device.createTexture({
			size: { width: engine.canvas.width, height: engine.canvas.height, depthOrArrayLayers: 1 },
			format: "depth24plus",
			usage: GPUTextureUsage.RENDER_ATTACHMENT
		});
		this.renderPassDescriptor = {
			colorAttachments: [
				{
					view: null as any,
					loadValue: this.color,
					storeOp: 'store'
				}
			],
			depthStencilAttachment: {
				view: this.depthTexture.createView(),
				depthLoadValue: 1.0,
				depthStoreOp: "store",
				stencilLoadValue: 0,
				stencilStoreOp: "store"
			}
		}
	}

	public setColor(color: IColorGPUJson) {
		this.color = color;

		return this;
	}

	public updateColor(color: IColorGPUJson) {
		this.color.r = color.r;
		this.color.g = color.g;
		this.color.b = color.b;
		this.color.a = color.a;

		return this;
	}

	public clear(commandEncoder: GPUCommandEncoder): GPURenderPassEncoder {
		// const textureView = swapChain.getCurrentTexture().createView();
		(this.renderPassDescriptor.colorAttachments as any)[0].loadValue = this.color;
		(this.renderPassDescriptor.colorAttachments as any)[0].view = this.engine.context
			.getCurrentTexture()
			.createView();
		return commandEncoder.beginRenderPass(this.renderPassDescriptor);
	}
}
