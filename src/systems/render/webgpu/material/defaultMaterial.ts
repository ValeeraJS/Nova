import Material from "./Material";

const fs = `
struct Uniforms {
	modelViewProjectionMatrix : mat4x4<f32>
};
@binding(0) @group(0) var<uniform> uniforms : Uniforms;

struct VertexOutput {
	@builtin(position) Position : vec4<f32>
};

fn mapRange(
	value: f32,
	range1: vec2<f32>,
	range2: vec2<f32>,
) -> f32 {
	var d1: f32 = range1.y - range1.x;
	var d2: f32 = range2.y - range2.x;

	return (value - d1 * 0.5) / d2 / d1;
};

@vertex fn main(@location(0) position : vec3<f32>) -> VertexOutput {
	var output : VertexOutput;
	output.Position = uniforms.modelViewProjectionMatrix * vec4<f32>(position, 1.0);
	if (output.Position.w == 1.0) {
		output.Position.z = mapRange(output.Position.z, vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, 0.0));
	}
	return output;
}
`;

const vs = `
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
