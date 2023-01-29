import Component from "@valeera/x/src/Component";
import WebGPUEngine from "../../engine/WebGPUEngine";

export default class EngineTexture extends Component<GPUTexture> {
	width: number;
	height: number;

	// public constructor(engine: WebGPUEngine, name: string = "texture-gpu") {
	// 	super(name, engine.device.createTexture({
	// 		size: [engine.options.width, engine.options.height],
	// 		format: engine.preferredFormat,
	// 		usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
	// 	}));
	// 	this.width = engine.options.width;
	// 	this.height = engine.options.height;
	// 	this.dirty = true;
	// }

	public destroy() {
		this.data = undefined;
		this.width = 0;
		this.height = 0;
	}
}
