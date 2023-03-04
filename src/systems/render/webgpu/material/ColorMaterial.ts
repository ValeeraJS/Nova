
import { BUFFER } from "../../../../components/constants";
import Material from "./Material";

const wgslShaders = {
	vertex: `
		struct Uniforms {
			modelViewProjectionMatrix : mat4x4<f32>
	  	};
	  	@binding(0) @group(0) var<uniform> uniforms : Uniforms;

		struct VertexOutput {
			@builtin(position) position : vec4<f32>
		};

		@vertex fn main(@location(0) position : vec3<f32>) -> VertexOutput {
			var out: VertexOutput;
			out.position = uniforms.modelViewProjectionMatrix * vec4<f32>(position, 1.0);
			return out;
		}
	`,
	fragment: `
	  	@binding(1) @group(0) var<uniform> color : vec4<f32>;

		@fragment fn main() -> @location(0) vec4<f32> {
			return color;
		}
	`
};

export default class ColorMaterial extends Material {
	constructor(color: Float32Array = new Float32Array([1, 1, 1, 1])) {
		super({
			descriptor: {
				code: wgslShaders.vertex,
			},
			dirty: true
		}, {
			descriptor: {
				code: wgslShaders.fragment,
			},
			dirty: true
		}, [{
			name: "color",
			value: color,
			binding: 1,
			dirty: true,
			type: BUFFER
		}]);
		this.dirty = true;
	}

	setColor(r: number, g: number, b: number, a: number): this {
		this.uniforms[0].value[0] = r;
		this.uniforms[0].value[1] = g;
		this.uniforms[0].value[2] = b;
		this.uniforms[0].value[3] = a;
		this.uniforms[0].dirty = true;

		return this;
	}
}
