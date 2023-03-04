
import { ColorGPU, Vector4 } from "@valeera/mathx";
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

export default class DomMaterial extends Material {
	constructor() {
		super({
			descriptor: {
				code: wgslShaders.vertex,
			},
			dirty: true
		}, {
			descriptor: {
				code: wgslShaders.fragment,
			},
			dirty: true,
		}, [{
			name: "backgroundColor",
			value: new ColorGPU(),
			binding: 1,
			dirty: true,
			type: BUFFER
		}, {
			name: "borderColor",
			value: new ColorGPU(1,1,1,1),
			binding: 2,
			dirty: true,
			type: BUFFER
		}, {
			name: "size",
			value: new Vector4(128, 32, 0, 0),
			binding: 3,
			dirty: true,
			type: BUFFER
		}, {
			name: "borderWidth",
			value: new Vector4(2, 2, 2, 2),
			binding: 4,
			dirty: true,
			type: BUFFER
		}, {
			name: "borderRadius",
			value: new Vector4(10, 10, 10, 10),
			binding: 5,
			dirty: true,
			type: BUFFER
		}]);
		this.dirty = true;
	}

	get backgroundColor() {
		return this.uniforms[0].value as ColorGPU;
	}
	
	set backgroundColor(c: ColorGPU) {
		this.uniforms[0].value = c;
		this.uniforms[0].dirty = true;
		this.dirty = true;
	}
	
	get borderColor() {
		return this.uniforms[1].value as ColorGPU;
	}
	
	set borderColor(c: ColorGPU) {
		this.uniforms[1].value = c;
		this.uniforms[1].dirty = true;
		this.dirty = true;
	}

	get height() {
		return this.uniforms[2].value[1] as number;
	}
	
	set height(c: number) {
		this.uniforms[2].value[1] = c;
		this.uniforms[2].dirty = true;
		this.dirty = true;
	}
	
	get width() {
		return this.uniforms[2].value[0] as number;
	}
	
	set width(c: number) {
		this.uniforms[2].value[0] = c;
		this.uniforms[2].dirty = true;
		this.dirty = true;
	}
}
