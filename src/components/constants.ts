import Material from "./material/Material";

// component type
export const ANCHOR_2D = "anchor2";
export const ANCHOR_3D = "anchor3";
export const GEOMETRY = "geometry";
export const MATERIAL = "material";
export const MODEL_2D = "model2";
export const MODEL_3D = "model3";
export const PROJECTION_2D = "projection2";
export const PROJECTION_3D = "projection3";
export const RENDERABLE = "renderable";
export const ROTATION_2D = "rotation2";
export const ROTATION_3D = "rotation3";
export const SCALING_2D = "scale2";
export const SCALING_3D = "scale3";
export const TRANSLATION_2D = "position2";
export const TRANSLATION_3D = "position3";
export const WORLD_MATRIX = "world-matrix";
export const VIEWING_3D = "viewing3";

// uniform type
export const SAMPLER = "sampler";
export const BUFFER = "buffer";
export const TEXTURE_IMAGE = "texture-image";
export const TEXTURE_GPU = "texture-gpu";

export const DEFAULT_MATERIAL = new Material(`
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

@stage(vertex) fn main(@location(0) position : vec3<f32>) -> VertexOutput {
	var output : VertexOutput;
	output.Position = uniforms.modelViewProjectionMatrix * vec4<f32>(position, 1.0);
	if (output.Position.w == 1.0) {
		output.Position.z = mapRange(output.Position.z, vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, 0.0));
	}
	return output;
}
`,`
@stage(fragment) fn main() -> @location(0) vec4<f32> {
	return vec4<f32>(1., 1., 1., 1.0);
}
`);