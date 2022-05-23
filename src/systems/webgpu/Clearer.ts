import { IColorGPUJson, IColorGPU, ColorGPU, IColorRGB, IColorRGBA, ColorRGB, ColorRGBA, IColorRGBAJson, IColorRGBJson  } from "@valeera/mathx";
import WebGPUEngine from "../../engine/WebGPUEngine";

export default class Clearer {
	public color: IColorGPU = new ColorGPU();
	public engine: WebGPUEngine;
	private renderPassDescriptor: GPURenderPassDescriptor;
	private depthTexture: GPUTexture;
	public constructor(engine: WebGPUEngine, color: IColorGPU | string | Float32Array | number[] | number | IColorRGB | IColorRGBA = new ColorGPU()) {
		this.engine = engine;
		this.setColor(color);
		
		this.depthTexture = engine.device.createTexture({
			size: { width: engine.canvas.width, height: engine.canvas.height, depthOrArrayLayers: 1 },
			format: "depth24plus",
			usage: GPUTextureUsage.RENDER_ATTACHMENT
		});
		this.renderPassDescriptor = {
			colorAttachments: [
				{
					view: null,
					clearOp: "clear",
					clearValue: this.color,
					storeOp: "store"
				}
			],
			depthStencilAttachment: {
				view: this.depthTexture.createView(),
				depthClearValue: 1.0,
				depthLoadOp: "clear",
				depthStoreOp: "store"
			}
		} as any
	}

	public setColor(color: IColorGPU | string | Float32Array | number[] | number | IColorRGB | IColorRGBA | IColorRGBAJson | IColorRGBJson) {
		if (color instanceof ColorGPU) {
			this.color = color;
		} else if (typeof color === "string") {
			ColorGPU.fromString(color, this.color);
		} else if (typeof color === "number") {
			ColorGPU.fromHex(color, 1, this.color);
		}  else if (color instanceof ColorRGB ) {
			ColorGPU.fromColorRGB(color, this.color);
		} else if (color instanceof ColorRGBA ) {
			ColorGPU.fromColorRGBA(color, this.color);
		} else if (color instanceof Float32Array || color instanceof Array) {
			ColorGPU.fromArray(color, this.color);
		} else if (color instanceof Float32Array || color instanceof Array) {
			ColorGPU.fromArray(color, this.color);
		} else {
			if ("a" in color) {
				ColorGPU.fromJson(color as IColorRGBAJson, this.color);
			} else {
				ColorGPU.fromJson({
					...color as IColorRGBJson,
					a: 1
				}, this.color);
			}
		}
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
		(this.renderPassDescriptor.colorAttachments)[0].loadOp = "clear";
		(this.renderPassDescriptor.colorAttachments)[0].clearValue = this.color;
		(this.renderPassDescriptor.colorAttachments)[0].view = this.engine.context
			.getCurrentTexture()
			.createView();
		return commandEncoder.beginRenderPass(this.renderPassDescriptor);
	}
}
