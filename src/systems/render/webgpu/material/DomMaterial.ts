
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
		struct Uniforms {
			color : vec4<f32>
	  	};
	  	@binding(1) @group(0) var<uniform> uniforms : Uniforms;

float sdRoundBox( in vec2 p, in vec2 b, in vec4 r ) 
{
    r.xy = (p.x>0.0)?r.xy : r.zw;
    r.x  = (p.y>0.0)?r.x  : r.y;
    vec2 q = abs(p)-b+r.x;
    return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
}

		@fragment fn main() -> @location(0) vec4<f32> {
			return uniforms.color;
		}
	`
};

export default class DomMaterial extends Material {
	constructor(color: Float32Array = new Float32Array([1, 1, 1, 1])) {
		super(wgslShaders.vertex, wgslShaders.fragment, [{
			name: "color",
			value: color,
			binding: 1,
			dirty: true,
			type: BUFFER
		}]);
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
