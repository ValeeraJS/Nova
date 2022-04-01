import ImageBitmapTexture from "../texture/ImageBitmapTexture";
import Sampler from "../texture/Sampler";
import IMaterial, { IShaderCode } from "./IMatrial";
import Material from "./Material";

const CommonData = {
    date: new Date(),
    vs: `struct Uniforms {
        matrix: mat4x4<f32>
    }
    @bind(0) @group(0) var<uniform<> uniforms: Uniforms;

    struct VertexOutput {
        @builtin(position) position: vec4<f32>,
        @location(0) uv: vec2<f32>
    }

    @stage(vertex) fn main(@location(0) position: vec3<f32>, @location(2) uv: vec2<f32>) -> VertexOutput {
        var out: VertexOutput;
        out.position = uniforms.matrix * vec4<f32>(position, 1.0);
        out.uv = uv;
        return out;
    }
    `
}

export default class ShadertoyMaterial extends Material implements IMaterial {
    data!: IShaderCode;

    public constructor(fs: string, texture: ImageBitmapTexture, sampler: Sampler = new Sampler()) {
        super( CommonData.vs,fs, []);
    }
}