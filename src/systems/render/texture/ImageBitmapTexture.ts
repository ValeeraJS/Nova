import { Texture } from "./Texture";

export class ImageBitmapTexture extends Texture {
	loaded = false;
	sizeChanged = false;
	image: HTMLImageElement = new Image();

	constructor(img: HTMLImageElement | string | ImageBitmap, width: number, height: number, name: string = "image-texture") {
		super({
			size: [width, height],
			name,
		});
		this.setImage(img);
	}

	async setImage(img: HTMLImageElement | string | ImageBitmap): Promise<this> {
		this.loaded = false;
		this.dirty = false;
		if (typeof img === "string") {
			this.image.src = img;
		} else if (img instanceof ImageBitmap) {
			this.dirty = true;
			this.loaded = true;
			this.data = img;

			return this;
		} else {
			this.image = img;
		}

		await this.image.decode();

		this.data = await createImageBitmap(this.image);
		if (this.descriptor.size[0] !== this.data.width || this.descriptor.size[1] !== this.data.height) {
			this.sizeChanged = true;
			this.width = this.data.width;
			this.height = this.data.height;
		}
		this.dirty = true;
		this.loaded = true;
		return this;
	}
}