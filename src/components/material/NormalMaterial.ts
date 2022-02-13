import { Component } from "@valeera/x/src";
import IMaterial, { IShaderCode } from "./IMatrial";

const vertexShader = `
struct Uniforms {
	modelViewProjectionMatrix : mat4x4<f32>;
};
@binding(0) @group(0) var<uniform> uniforms : Uniforms;

struct VertexOutput {
	@builtin(position) position : vec4<f32>;
	@location(0) normal : vec4<f32>;
};

@stage(vertex) fn main(@location(0) position : vec3<f32>, @location(1) normal : vec3<f32>) -> VertexOutput {
	var out: VertexOutput;
	out.position = uniforms.modelViewProjectionMatrix * vec4<f32>(position, 1.0);
	out.normal = abs(normalize(uniforms.modelViewProjectionMatrix * vec4<f32>(normal, 0.0)));
	return out;
}`;

const fragmentShader = `
@stage(fragment) fn main(@location(0) normal : vec4<f32>) -> @location(0) vec4<f32> {
	return vec4<f32>(normal.x, normal.y, normal.z, 1.0);
}`;

export default class NormalMaterial extends Component<IShaderCode> implements IMaterial {	
	constructor() {
		super("material", {
			vertex: vertexShader,
			fragment: fragmentShader,
			uniforms: []
		});
		this.dirty = true;
	}
}
