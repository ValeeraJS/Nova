import { DEFAULT_BLEND_STATE } from "../../Blend";
import { IMaterial, IShaderProgram, IUniformSlot } from "../../IMatrial";

export default class Material implements IMaterial {
	dirty: boolean;
	vertex: string;
	vertexShader: IShaderProgram;
	fragmentShader: IShaderProgram;
	blend: GPUBlendState;
	uniforms: IUniformSlot[];
	constructor(vertex: IShaderProgram, fragment: IShaderProgram, uniforms: IUniformSlot[] = [], blend: GPUBlendState = DEFAULT_BLEND_STATE) {
		this.dirty = true;
		this.vertexShader = vertex;
		this.fragmentShader = fragment;
		this.blend = blend;
		this.uniforms = uniforms;
	}

	public get vertexCode(): string {
		return this.vertexShader.code;
	}

	public set vertexCode(code: string) {
		this.vertexShader.code = code;
		this.vertexShader.dirty = true;
		this.dirty = true;
	}

	public get fragmentCode(): string {
		return this.vertexShader.code;
	}

	public set fragmentCode(code: string) {
		this.fragmentShader.code = code;
		this.fragmentShader.dirty = true;
		this.dirty = true;
	}
}
