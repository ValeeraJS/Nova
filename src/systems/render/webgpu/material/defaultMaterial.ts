import Material from "./Material";

const vs = `
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
`;

const fs = `
@fragment fn main() -> @location(0) vec4<f32> {
	return vec4<f32>(1., 1., 1., 1.0);
}
`

export const DEFAULT_MATERIAL3 = new Material({
	descriptor: {
		code: vs,
	},
	dirty: true
}, {
	descriptor: {
		code: fs,
	},
	dirty: true
});
