import { ColorGPU, Vector2, Vector2Like, Vector4, Vector4Like } from "@valeera/mathx";
import { SAMPLER, TEXTURE_IMAGE } from "../components/constants";
import { Texture, Sampler, BufferFloat32 } from "../systems/render";
import { IMaterial } from "../systems/render/IMatrial";
import { Material } from "../systems/render/webgpu";

const wgslShaders = {
	vertex: `
		struct Uniforms {
			 matrix : mat4x4<f32>
	  	};
		struct BitmapFont {
			channel : vec4<f32>,
			position : vec2<f32>,
			size : vec2<f32>,
			offset : vec2<f32>,
			bitmapSize : vec2<f32>,
			lineHeight : f32,
			baseLine: f32
		};
	  	@binding(0) @group(0) var<uniform> uniforms : Uniforms;
		@binding(3) @group(0) var<uniform> font: BitmapFont;

		struct VertexOutput {
			@builtin(position) position : vec4<f32>,
			@location(0) uv : vec2<f32>
		};

		@vertex fn main(@location(0) position : vec3<f32>, @location(2) uv : vec2<f32>) -> VertexOutput {
			var out: VertexOutput;
			var p = position;
			p.x *= font.size.x;
			p.y *= font.size.y;
			p.x += font.size.x * 0.5 + font.offset.x;
			p.y += font.size.y * 0.5 + font.offset.y;
			out.position = uniforms.matrix * vec4<f32>(p, 1.0);
			out.uv = uv;
			out.uv.x *= font.size.x / font.bitmapSize.x;
			out.uv.x += font.position.x / font.bitmapSize.x;
			out.uv.y *= font.size.y / font.bitmapSize.y;
			out.uv.y += font.position.y / font.bitmapSize.y;
			return out;
		}
	`,
	fragment: `
		@binding(1) @group(0) var mySampler: sampler;
		@binding(2) @group(0) var myTexture: texture_2d<f32>;

		@fragment fn main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
			return textureSample(myTexture, mySampler, uv);
		}
	`
};

export class BitmapFontMaterial extends Material implements IMaterial {
	public constructor(texture: Texture, sampler: Sampler = new Sampler()) {
		super({
			descriptor: {
				code: wgslShaders.vertex,
			},
			dirty: true,
		}, {
			descriptor: {
				code: wgslShaders.fragment,
			},
			dirty: true,
		}, [
			{
				binding: 1,
				name: "mySampler",
				type: SAMPLER,
				value: sampler,
				dirty: true
			},
			{
				binding: 2,
				name: "myTexture",
				type: TEXTURE_IMAGE,
				value: texture,
				dirty: true
			},
			{
				binding: 3,
				dirty: true,
				name: "alpha",
				type: "buffer",
				value: new BufferFloat32({
					data: [
						1, 1, 1, 1, // channel
						0, 0, // x y
						0, 0, // w h
						0, 0, // offset
						1, 1, // bitmap size
						1, 1, // lineHeight baseLine
						0, 0
					],
				}),
			},
			{
				binding: 4,
				dirty: true,
				name: "color",
				type: "buffer",
				value: new BufferFloat32({
					data: new ColorGPU(1, 1, 1, 1),
				}),
			},
		]);
		this.dirty = true;
	}

	#channel = new Vector4();
	#position = new Vector2();
	#size = new Vector2();
	#offset = new Vector2();
	#bitmapSize = new Vector2();

	public get sampler(): Sampler {
		return this.uniforms[0].value;
	}

	public set sampler(sampler: Sampler) {
		this.uniforms[0].dirty = this.dirty = true;
		this.uniforms[0].value = sampler;
	}

	public get texture(): Texture {
		return this.uniforms[1].value;
	}

	public set texture(texture: Texture) {
		this.uniforms[1].dirty = this.dirty = true;
		this.uniforms[1].value = texture;
	}

	public get channel(): Vector4 {
		return this.#channel;
	}

	public set channel(vec4: Vector4Like) {
		this.uniforms[2].dirty = this.dirty = true;
		this.#channel.set(vec4);
		this.uniforms[2].value[0] = vec4[0];
		this.uniforms[2].value[1] = vec4[1];
		this.uniforms[2].value[2] = vec4[2];
		this.uniforms[2].value[3] = vec4[3];
	}

	public get position(): Vector2 {
		return this.#position;
	}

	public set position(vec2: Vector2Like) {
		this.uniforms[2].dirty = this.dirty = true;
		this.#position.set(vec2);
		this.uniforms[2].value[4] = vec2[0];
		this.uniforms[2].value[5] = vec2[1];
	}


	public get size(): Vector2 {
		return this.#size;
	}

	public set size(vec2: Vector2Like) {
		this.uniforms[2].dirty = this.dirty = true;
		this.#size.set(vec2);
		this.uniforms[2].value[6] = vec2[0];
		this.uniforms[2].value[7] = vec2[1];
	}

	public get offset(): Vector2 {
		return this.#offset;
	}

	public set offset(vec2: Vector2Like) {
		this.uniforms[2].dirty = this.dirty = true;
		this.#offset.set(vec2);
		this.uniforms[2].value[8] = vec2[0];
		this.uniforms[2].value[9] = vec2[1];
	}
	
	public get bitmapSize(): Vector2 {
		return this.#bitmapSize;
	}

	public set bitmapSize(vec2: Vector2Like) {
		this.uniforms[2].dirty = this.dirty = true;
		this.#bitmapSize.set(vec2);
		this.uniforms[2].value[10] = vec2[0];
		this.uniforms[2].value[11] = vec2[1];
	}

	public setTextureAndSampler(texture: Texture, sampler?: Sampler): this {
		this.texture = texture;
		if (sampler) {
			this.sampler = sampler;
		}

		return this;
	}

	public update() {
		this.uniforms[2].dirty = this.dirty = true;
		this.uniforms[2].value[0] = this.channel[0];
		this.uniforms[2].value[1] = this.channel[1];
		this.uniforms[2].value[2] = this.channel[2];
		this.uniforms[2].value[3] = this.channel[3];
		
		this.uniforms[2].value[4] = this.#position[0];
		this.uniforms[2].value[5] = this.#position[1];
		this.uniforms[2].value[6] = this.#size[0];
		this.uniforms[2].value[7] = this.#size[1];
		this.uniforms[2].value[8] = this.#offset[0];
		this.uniforms[2].value[9] = this.#offset[1];
		this.uniforms[2].value[10] = this.#bitmapSize[0];
		this.uniforms[2].value[11] = this.#bitmapSize[1];

		return this;
	}
}
