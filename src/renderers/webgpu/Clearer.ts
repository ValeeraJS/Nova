import { createJson, IColorGPUJson } from "@valeera/mathx/src/color/ColorGPU";
import WebGPUEngine from "../../engine/WebGPUEngine";

export default class Clearer {
	public color: IColorGPUJson;
	public engine: WebGPUEngine;
	renderPassDescriptor: GPURenderPassDescriptor;
	public constructor(engine: WebGPUEngine, color: IColorGPUJson = createJson()) {
		this.engine = engine;
		this.color = color;
		const depthTexture = engine.device?.createTexture({
			size: { width: engine.canvas.width, height: engine.canvas.height, depthOrArrayLayers: 1 },
			format: "depth24plus-stencil8",
			usage: GPUTextureUsage.RENDER_ATTACHMENT
		});
		this.renderPassDescriptor = {
			colorAttachments: [
				{
					attachment: null,
					loadValue: color
				}
			] as any,
			depthStencilAttachment: {
				attachment: depthTexture.createView(),
				depthLoadValue: 1.0,
				depthStoreOp: "store",
				stencilLoadValue: 0,
				stencilStoreOp: "store"
			}
		}
	}

	public clear(commandEncoder: GPUCommandEncoder, swapChain: GPUSwapChain): GPURenderPassEncoder {
		const textureView = swapChain.getCurrentTexture().createView();
		(this.renderPassDescriptor.colorAttachments as any)[0].attachment = textureView;
		return commandEncoder.beginRenderPass(this.renderPassDescriptor);
	}
}
