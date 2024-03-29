
import { SAMPLER, TEXTURE_IMAGE } from "../../../../components/constants";
import { Texture, Sampler } from "../../texture";
import { IMaterial } from "../../IMatrial";
import { Material } from "./Material";
import { BufferFloat32 } from "../../Buffer";

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

		@vertex fn main(@location(0) position : vec3<f32>, @location(2) uv : vec2<f32>) -> VertexOutput {
			var out: VertexOutput;
			out.position = uniforms.matrix * vec4<f32>(position, 1.0);
			out.uv = uv;
			return out;
		}
	`,
	fragment: `
		@binding(1) @group(0) var mySampler: sampler;
		@binding(2) @group(0) var myTexture: texture_2d<f32>;
		@binding(3) @group(0) var<uniform> alpha: f32;

		@fragment fn main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
			return textureSample(myTexture, mySampler, uv) * vec4<f32>(1., 1., 1., alpha);
		}
	`
};

export class TextureMaterial extends Material implements IMaterial {
	public constructor(texture: Texture, sampler: Sampler = new Sampler()) {
		super({
			descriptor: {
				code: wgslShaders.vertex,
			},
			dirty: true,
		}, {
			descriptor: {
				code: wgslShaders.fragment,
			},
			dirty: true,
		}, [
			{
				binding: 1,
				name: "mySampler",
				type: SAMPLER,
				value: sampler,
				dirty: true
			},
			{
				binding: 2,
				name: "myTexture",
				type: TEXTURE_IMAGE,
				value: texture,
				dirty: true
			},
			{
				binding: 3,
				dirty: true,
				name: "alpha",
				type: "buffer",
				value: new BufferFloat32({
					size: 4,
					data: [1],
				}),
			},
		]);
		this.dirty = true;
	}

	public get sampler(): Sampler {
		return this.uniforms[0].value;
	}

	public set sampler(sampler: Sampler) {
		this.uniforms[0].dirty = this.dirty = true;
		this.uniforms[0].value = sampler;
	}

	public get texture(): Texture {
		return this.uniforms[1].value;
	}

	public set texture(texture: Texture) {
		this.uniforms[1].dirty = this.dirty = true;
		this.uniforms[1].value = texture;
	}

	public get alpha(): number {
		return this.uniforms[2].value[0] as number;
	}

	public set alpha(alpha: number) {
		this.uniforms[2].dirty = this.dirty = true;
		this.uniforms[2].value[0] = alpha;
	}

	public setTextureAndSampler(texture: Texture, sampler?: Sampler): this {
		this.texture = texture;
		if (sampler) {
			this.sampler = sampler;
		}

		return this;
	}
}
