import AtlasTexture from "../texture/AtlasTexture";
import ImageBitmapTexture from "../texture/ImageBitmapTexture";
import Sampler from "../texture/Sampler";
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
	data!: IShaderCode;
	constructor(texture: ImageBitmapTexture | AtlasTexture, sampler: Sampler = new Sampler()) {
		super(wgslShaders.vertex, wgslShaders.fragment, [
			{
				name: "mySampler",
				type: "sampler",
				value: sampler,
				binding: 1,
				dirty: true
			},
			{
				name: "myTexture",
				type: "sampled-texture",
				value: texture,
				binding: 2,
				dirty: true
			}
		]);
		this.dirty = true;
	}

	get sampler(): Sampler {
		return this.data.uniforms[0].value as Sampler;
	}

	set sampler(sampler: Sampler) {
		this.data.uniforms[0].dirty = this.dirty = true;
		this.data.uniforms[0].value = sampler;
	}

	get texture(): ImageBitmapTexture {
		return this.data.uniforms[1].value as ImageBitmapTexture;
	}

	set texture(texture: ImageBitmapTexture) {
		this.data.uniforms[1].dirty = this.dirty = true;
		this.data.uniforms[1].value = texture;
	}

	setTextureAndSampler(texture: ImageBitmapTexture, sampler?: Sampler): this {
		this.texture = texture;
		if (sampler) {
			this.sampler = sampler;
		}

		return this;
	}
}
