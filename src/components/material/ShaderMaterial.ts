import { Component } from "@valeera/x";
import IMaterial, { IShaderCode, IUniformSlot } from "./IMatrial";

export default class ShaderMaterial extends Component<IShaderCode> implements IMaterial {
	constructor(vertex: string, fragment: string, uniforms: IUniformSlot[] = []) {
		super("material", { vertex, fragment, uniforms });
		this.dirty = true;
	}
}
