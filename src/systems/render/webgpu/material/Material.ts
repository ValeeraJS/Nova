import { DEFAULT_BLEND_STATE } from "../../Blend";
import { IMaterial, IUniformSlot } from "../../IMatrial";
import { IShaderProgram } from "../../ShaderProgram";

export class Material implements IMaterial {
	dirty: boolean;
	vertex: string;
	vertexShader: IShaderProgram;
	fragmentShader: IShaderProgram;
	blend: GPUBlendState;
	uniforms: IUniformSlot<any>[];
	constructor(vertex: IShaderProgram, fragment: IShaderProgram, uniforms: IUniformSlot<any>[] = [], blend: GPUBlendState = DEFAULT_BLEND_STATE) {
		this.dirty = true;
		this.vertexShader = vertex;
		this.fragmentShader = fragment;
		this.blend = blend;
		this.uniforms = uniforms;
	}

	public get vertexCode(): string {
		return this.vertexShader.descriptor.code;
	}

	public set vertexCode(code: string) {
		this.vertexShader.descriptor.code = code;
		this.vertexShader.dirty = true;
		this.dirty = true;
	}

	public get fragmentCode(): string {
		return this.vertexShader.descriptor.code;
	}

	public set fragmentCode(code: string) {
		this.fragmentShader.descriptor.code = code;
		this.fragmentShader.dirty = true;
		this.dirty = true;
	}
}
