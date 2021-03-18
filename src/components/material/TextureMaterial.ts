import { Component } from "@valeera/x/src";
import ImageBitmapTexture from "../texture/ImageBitmapTexture";
import Sampler from "../texture/Sampler";
import IMaterial, { IShaderCode } from "./IMatrial";

const wgslShaders = {
	vertex: `
		[[block]] struct Uniforms {
			[[offset(0)]] matrix : mat4x4<f32>;
	  	};
	  	[[binding(0), group(0)]] var<uniform> uniforms : Uniforms;
		[[builtin(position)]] var<out> fragPosition : vec4<f32>;
		[[location(0)]] var<out> fragUV : vec2<f32>;
		[[location(0)]] var<in> position : vec3<f32>;
		[[location(2)]] var<in> uv : vec2<f32>;

		[[stage(vertex)]] fn main() -> void {
			fragPosition = uniforms.matrix * vec4<f32>(position, 1.0);
			fragUV = uv;
			return;
		}
	`,
	fragment: `
		[[binding(1), group(0)]] var mySampler: sampler;
		[[binding(2), group(0)]] var myTexture: texture_2d<f32>;
		[[location(0)]] var<out> fragColor : vec4<f32>;
		[[location(0)]] var<in> fragUV: vec2<f32>;

		[[stage(fragment)]] fn main() -> void {
			fragColor = textureSample(myTexture, mySampler, fragUV);
			return;
		}
	`
};

export default class TextureMaterial extends Component<IShaderCode> implements IMaterial {
	data!: IShaderCode;
	constructor(texture: ImageBitmapTexture, sampler: Sampler = new Sampler()) {
		super("material", {
			...wgslShaders,
			uniforms: [{
				name: "mySampler",
				type: "sampler",
				value: sampler,
				binding: 1,
				dirty: true
			}, {
				name: "myTexture",
				type: "sampled-texture",
				value: texture,
				binding: 2,
				dirty: true
			}]
		});
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
