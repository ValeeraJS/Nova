import { Component } from "@valeera/x/src";
import IMaterial, { IShaderCode } from "./IMatrial";

const wgslShaders = {
	vertex: `
		[[block]] struct Uniforms {
			[[offset(0)]] modelViewProjectionMatrix : mat4x4<f32>;
	  	};
	  	[[binding(0), group(0)]] var<uniform> uniforms : Uniforms;

		[[builtin(position)]] var<out> out_position : vec4<f32>;
		[[location(0)]] var<in> a_position : vec3<f32>;

		[[stage(vertex)]] fn main() -> void {
			out_position = uniforms.modelViewProjectionMatrix * vec4<f32>(a_position, 1.0);
			return;
		}
	`,
	fragment: `
		[[binding(1), group(0)]] var mySampler: sampler;
		[[binding(2), group(0)]] var myTexture: texture_2d<f32>;
		[[location(0)]] var<out> fragColor : vec4<f32>;

		[[stage(fragment)]] fn main() -> void {
			fragColor = uniforms.color;
			return;
		}
	`
};

export default class ColorMaterial extends Component<IShaderCode> implements IMaterial {
	constructor(color: Float32Array = new Float32Array([1, 1, 1, 1])) {
		super("material", {
			...wgslShaders,
			uniforms: [{
				name: "color",
				value: color,
				binding: 1,
				dirty: true
			}]
		});
		this.dirty = true;
	}

	setColor(r: number, g: number, b: number, a: number): this {
		if (this.data) {
			this.data.uniforms[0].value[0] = r;
			this.data.uniforms[0].value[1] = g;
			this.data.uniforms[0].value[2] = b;
			this.data.uniforms[0].value[3] = a;
			this.data.uniforms[0].dirty = true;
		}
		return this;
	}
}
