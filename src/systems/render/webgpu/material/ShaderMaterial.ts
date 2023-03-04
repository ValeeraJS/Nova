import { IUniformSlot } from "../../IMatrial";
import Material from "./Material";

export default class ShaderMaterial extends Material {
	constructor(vertex: string, fragment: string, uniforms: IUniformSlot[] = [], blend?: GPUBlendState) {
		super({
			code: vertex,
			dirty: true,
			entry: "main"
		}, {
			code: fragment,
			dirty: true,
			entry: "main"
		}, uniforms, blend);
		this.dirty = true;
	}
}
