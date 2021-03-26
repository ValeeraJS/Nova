import { createJson, IColorGPUJson } from "@valeera/mathx/src/color/ColorGPU";
import WebGLEngine from "../../engine/WebGLEngine";

export default class Clearer {
	public color: IColorGPUJson;
	public engine: WebGLEngine;
	public constructor(engine: WebGLEngine, color: IColorGPUJson = createJson()) {
		this.engine = engine;
		this.color = color;
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

	public clear(): this {
		let gl = this.engine.context;
		gl.clearColor(0.9, 0.95, 1, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);

		return this;
	}
}
