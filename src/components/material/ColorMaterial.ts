import { Component } from "@valeera/x/src";
import IMaterial, { IShaderCode } from "./IMatrial";

const wgslShaders = {
	vertex: `
		struct Uniforms {
			modelViewProjectionMatrix : mat4x4<f32>;
	  	};
	  	@binding(0) @group(0) var<uniform> uniforms : Uniforms;

		struct VertexOutput {
			@builtin(position) position : vec4<f32>;
		};

		@stage(vertex) fn main(@location(0) position : vec3<f32>) -> VertexOutput {
			var out: VertexOutput;
			out.position = uniforms.modelViewProjectionMatrix * vec4<f32>(position, 1.0);
			return out;
		}
	`,
	fragment: `
		struct Uniforms {
			color : vec4<f32>;
	  	};
	  	@binding(1) @group(0) var<uniform> uniforms : Uniforms;

		@stage(fragment) fn main() -> @location(0) vec4<f32> {
			return uniforms.color;
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
				dirty: true,
				type: "uniform-buffer",
				buffer: {
					type: "",
				}
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
