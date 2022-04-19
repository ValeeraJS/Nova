import Sampler from "../texture/Sampler";
import Texture from "../texture/Texture";
import IMaterial, { IShaderCode } from "./IMatrial";
import Material from "./Material";

const wgslShaders = {
	vertex: `
		struct Uniforms {
			 matrix : mat4x4<f32>
	  	};
	  	@binding(0) @group(0) var<uniform> uniforms : Uniforms;

		struct VertexOutput {
			@builtin(position) position : vec4<f32>,
			@location(0) uv : vec2<f32>
		};

		@stage(vertex) fn main(@location(0) position : vec3<f32>, @location(2) uv : vec2<f32>) -> VertexOutput {
			var out: VertexOutput;
			out.position = uniforms.matrix * vec4<f32>(position, 1.0);
			out.uv = uv;
			return out;
		}
	`,
	fragment: `
		@binding(1) @group(0) var mySampler: sampler;
		@binding(2) @group(0) var myTexture: texture_2d<f32>;

		@stage(fragment) fn main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
			return textureSample(myTexture, mySampler, uv);
		}
	`
};

export default class TextureMaterial extends Material implements IMaterial {
	public data!: IShaderCode;
	public constructor(texture: Texture, sampler: Sampler = new Sampler()) {
		super(wgslShaders.vertex, wgslShaders.fragment, [
			{
				binding: 1,
				name: "mySampler",
				type: "sampler",
				value: sampler,
				dirty: true
			},
			{
				binding: 2,
				name: "myTexture",
				type: "sampled-texture",
				value: texture,
				dirty: true
			}
		]);
		this.dirty = true;
	}

	public get sampler(): Sampler {
		return this.data.uniforms[0].value as Sampler;
	}

	public set sampler(sampler: Sampler) {
		this.data.uniforms[0].dirty = this.dirty = true;
		this.data.uniforms[0].value = sampler;
	}

	public get texture(): Texture {
		return this.data.uniforms[1].value as Texture;
	}

	public set texture(texture: Texture) {
		this.data.uniforms[1].dirty = this.dirty = true;
		this.data.uniforms[1].value = texture;
	}

	public setTextureAndSampler(texture: Texture, sampler?: Sampler): this {
		this.texture = texture;
		if (sampler) {
			this.sampler = sampler;
		}

		return this;
	}
}
