import { Component } from "@valeera/x";
import { MATERIAL } from "../constants";
import { DEFAULT_BLEND_STATE } from "./Blend";
import IMaterial, { IShaderCode, IUniformSlot } from "./IMatrial";

export default class Material extends Component<IShaderCode> implements IMaterial {
	tags = [{
		label: MATERIAL,
		unique: true
	}];
	constructor(vertex: string, fragment: string, uniforms: IUniformSlot[] = [], blend: GPUBlendState = DEFAULT_BLEND_STATE) {
		super("material", { vertex, fragment, uniforms, blend });
		this.dirty = true;
	}

	public get blend(): GPUBlendState {
		return this.data.blend;
	}
	
	public set blend(blend: GPUBlendState) {
		this.data.blend = blend;
	}

	public get vertexShader(): string {
		return this.data.vertex;
	}
	
	public set vertexShader(code: string) {
		this.data.vertex = code;
	}
	
	public get fragmentShader(): string {
		return this.data.fragment;
	}
	
	public set fragmentShader(code: string) {
		this.data.fragment = code;
	}
}
