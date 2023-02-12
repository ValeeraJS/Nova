export type TextureOptions = {
	size: GPUExtent3DStrict;
	name?: string;
	format?: GPUTextureFormat;
	usage?: number;
	image?: undefined | null | ImageBitmap;
}

export class Texture {
	data: ImageBitmap | null | undefined;
	dirty: boolean = true;
	public descriptor: Required<GPUTextureDescriptor> = {
		size: [0, 0],
		format: "rgba8unorm",
		usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
		mipLevelCount: 1, 
		sampleCount: 1, 
		dimension: "2d", 
		viewFormats: [], 
		label: ""
	}

	public constructor(options: TextureOptions) {
		this.descriptor.size[0] = options.size[0];
		this.descriptor.size[1] = options.size[1];
		this.descriptor.format = options.format ?? "rgba8unorm";
		this.descriptor.usage = options.usage ?? (GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT);
		this.imageBitmap = options.image;
	}

	public destroy() {
		this.data?.close();
		this.data = undefined;
	}

	get width() {
		return this.descriptor.size[0];
	}

	set width(v: number) {
		this.descriptor.size[0] = v;
	}
	
	get height() {
		return this.descriptor.size[1];
	}

	set height(v: number) {
		this.descriptor.size[1] = v;
	}

	get imageBitmap() {
		return this.data;
	}

	set imageBitmap(img: ImageBitmap | undefined | null) {
		this.dirty = true;
		this.data = img;
	}
}
