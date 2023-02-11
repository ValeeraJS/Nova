import { BUFFER, SAMPLER, TEXTURE_IMAGE } from "../constants";
import { Texture } from "../texture";
import type ImageBitmapTexture from "../texture/ImageBitmapTexture";
import Sampler from "../texture/Sampler";
import IMaterial from "./IMatrial";
import Material from "./Material";

const CommonData = {
	date: new Date(),
	vs: `struct Uniforms {
        matrix: mat4x4<f32>
    }
    @binding(0) @group(0) var<uniform> uniforms: Uniforms;

    struct VertexOutput {
        @builtin(position) position: vec4<f32>,
        @location(0) uv: vec2<f32>
    }

    @vertex fn main(@location(0) position: vec3<f32>, @location(2) uv: vec2<f32>) -> VertexOutput {
        var out: VertexOutput;
        out.position = uniforms.matrix * vec4<f32>(position, 1.0);
        out.uv = uv;
        return out;
    }
    `
}

const emptyTexture = new Texture(512, 512);

export default class ShadertoyMaterial extends Material implements IMaterial {
	private dataD: Date;

	public constructor(fs: string, sampler: Sampler = new Sampler()) {
		super(CommonData.vs, fs, [
			{
				name: "iSampler0",
				type: SAMPLER,
				value: sampler,
				binding: 1,
				dirty: true,
			},
			{
				name: "iChannel0",
				type: TEXTURE_IMAGE,
				value: emptyTexture,
				binding: 2,
				dirty: true,
			},
			{
				name: "iChannel1",
				type: TEXTURE_IMAGE,
				value: emptyTexture,
				binding: 3,
				dirty: true,
			},
			{
				name: "iChannel2",
				type: TEXTURE_IMAGE,
				value: emptyTexture,
				binding: 4,
				dirty: true,
			},
			{
				name: "iChannel3",
				type: TEXTURE_IMAGE,
				value: emptyTexture,
				binding: 5,
				dirty: true,
			},
			{
				name: "uniforms",
				type: BUFFER,
				value: new Float32Array([
					CommonData.date.getFullYear(), // iDate 0-3
					CommonData.date.getMonth(),
					CommonData.date.getDate(),
					CommonData.date.getSeconds() + CommonData.date.getMinutes() * 60 + CommonData.date.getHours() + 3600,
					1024, 1024, // iResolution 4-5
					0, 0, // iMouse 6-7,
					0, // iTime 8
					0, // 9
					0, // 10
					0, // 11
				]),
				binding: 6,
				dirty: true,
			}
		]);
		this.dataD = CommonData.date;
		this.dirty = true;
	}

	public get sampler(): Sampler {
		return this.data.uniforms[0].value as Sampler;
	}

	public set sampler(sampler: Sampler) {
		this.data.uniforms[0].dirty = this.dirty = true;
		this.data.uniforms[0].value = sampler;
	}

	public get texture0(): ImageBitmapTexture {
		return this.data.uniforms[1].value as ImageBitmapTexture;
	}

	public set texture0(texture: ImageBitmapTexture) {
		this.data.uniforms[1].dirty = this.dirty = true;
		this.data.uniforms[1].value = texture;
	}

	public get texture1(): ImageBitmapTexture {
		return this.data.uniforms[2].value as ImageBitmapTexture;
	}

	public set texture1(texture: ImageBitmapTexture) {
		this.data.uniforms[2].dirty = this.dirty = true;
		this.data.uniforms[2].value = texture;
	}

	public get texture2(): ImageBitmapTexture {
		return this.data.uniforms[3].value as ImageBitmapTexture;
	}

	public set texture2(texture: ImageBitmapTexture) {
		this.data.uniforms[3].dirty = this.dirty = true;
		this.data.uniforms[3].value = texture;
	}

	public get texture3(): ImageBitmapTexture {
		return this.data.uniforms[4].value as ImageBitmapTexture;
	}

	public set texture3(texture: ImageBitmapTexture) {
		this.data.uniforms[4].dirty = this.dirty = true;
		this.data.uniforms[4].value = texture;
	}

	public get time(): number {
		return this.data.uniforms[5].value[8] as number;
	}

	public set time(time: number) {
		this.data.uniforms[5].dirty = this.dirty = true;
		this.data.uniforms[5].value[8] = time;
	}

	public get mouse(): ArrayLike<number> {
		let u = this.data.uniforms[5];
		return [u.value[6], u.value[7]];
	}

	public set mouse(mouse: ArrayLike<number>) {
		let u = this.data.uniforms[5];
		u.dirty = this.dirty = true;
		u.value[6] = mouse[0];
		u.value[7] = mouse[1];
	}

	public get date(): Date {
		return this.dataD;
	}

	public set date(d: Date) {
		const u = this.data.uniforms[5];
		u.dirty = this.dirty = true;
		u.value[0] = d.getFullYear();
		u.value[1] = d.getMonth();
		u.value[2] = d.getDate();
		u.value[3] = d.getSeconds() + d.getMinutes() * 60 + d.getHours() * 3600;

		this.dataD = d;
	}
}
