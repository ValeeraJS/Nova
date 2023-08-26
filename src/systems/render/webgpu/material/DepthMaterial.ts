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
const PackUpscale: f32 = 256. / 255.;
const PackFactors: vec3<f32> = vec3<f32>( 16777216., 65536., 256. );
const ShiftRight8: f32 = 1. / 256.;

fn packDepthToRGBA(v:f32) -> vec4<f32> {
	var val: vec3<f32> = fract(v * PackFactors);
	var r: vec4<f32> = vec4<f32>(val, v);
	r.y -= val.x * ShiftRight8;
	r.z -= val.y * ShiftRight8;
	r.w -= val.z * ShiftRight8;
	// r.yzw -= r.xyz * ShiftRight8;
	return r * PackUpscale;
	// return val;
}

@fragment fn main(@location(0) depth : vec4<f32>) -> @location(0) vec4<f32> {
	var fragCoordZ: f32 = depth.z / depth.w;
	return vec4<f32>(fragCoordZ,fragCoordZ,fragCoordZ,1.);
	// return vec4<f32>(packDepthToRGBA(fragCoordZ));
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
