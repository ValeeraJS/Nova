import { Component } from "@valeera/x";
import IMaterial, { IShaderCode, IUniformSlot } from "./IMatrial";

export default class Material extends Component<IShaderCode> implements IMaterial {
	constructor(vertex: string, fragment: string, uniforms: IUniformSlot[] = []) {
		super("material", { vertex, fragment, uniforms });
		this.dirty = true;
	}

	public get blend(): GPUBlendComponent | undefined {
		return this.data?.blend;
	}
	
	public set blend(blend: GPUBlendComponent | undefined): void {
		return this.data.blend = blend;
	}
}
