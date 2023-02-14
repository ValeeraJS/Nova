import { IUniformSlot } from "./IMatrial";
import Material from "./Material";

export default class ShaderMaterial extends Material {
	constructor(vertex: string, fragment: string, uniforms: IUniformSlot[] = [], blend?: GPUBlendState) {
		super(vertex, fragment, uniforms, blend);
		this.dirty = true;
	}
}
