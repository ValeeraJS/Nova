import { Material } from "./Material";

const vertexShader = `
struct Uniforms {
	modelViewProjectionMatrix : mat4x4<f32>
};

@binding(0) @group(0) var<uniform> uniforms : Uniforms;

struct VertexOutput {
	@builtin(position) position : vec4<f32>,
	@location(0) depth : vec4<f32>
};

@vertex fn main(@location(0) position : vec3<f32>) -> VertexOutput {
	var out: VertexOutput;
	out.position = uniforms.modelViewProjectionMatrix * vec4<f32>(position, 1.0);
	out.depth = out.position;
	return out;
}`;

const fragmentShader = `
// let PackUpscale: f32 = 1.003921568627451;
// let PackFactors: vec3<f32> = vec3<f32>( 256., 256., 256. );
// let ShiftRight8: f32 = 0.00390625;
// fn packDepthToRGBA(v: f32 ) -> vec4<f32> {
// 	var r: vec4<f32> = vec4<f32>( fract( v * PackFactors ), v );
// 	r = vec4<f32>(r.x, r.y - r.x * ShiftRight8, r.z - r.y * ShiftRight8, r.w - r.z * ShiftRight8);
// 	return r * PackUpscale;
// }
@fragment fn main(@location(0) depth : vec4<f32>) -> @location(0) vec4<f32> {
	var fragCoordZ: f32 = depth.z / depth.w;
	return vec4<f32>(vec3<f32>(pow(fragCoordZ, 490.)), 1.0);
}`;

export class DepthMaterial extends Material {
	constructor() {
		super({
			descriptor: {
				code: vertexShader,
			},
			dirty: true
		}, {
			descriptor: {
				code: fragmentShader,
			},
			dirty: true
		}, []);
		this.dirty = true;
	}
}
