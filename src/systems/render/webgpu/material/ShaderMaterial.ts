import { IUniformSlot } from "../../IMatrial";
import Material from "./Material";

export default class ShaderMaterial extends Material {
	constructor(vertex: string, fragment: string, uniforms: IUniformSlot<any>[] = [], blend?: GPUBlendState) {
		super({
			descriptor: {
				code: vertex,
			},
			dirty: true,
		}, {
			descriptor: {
				code: fragment,
			},
			dirty: true,
		}, uniforms, blend);
		this.dirty = true;
	}
}
