import Component from "@valeera/x/src/Component";

export default class ImageBitmapTexture extends Component<ImageBitmap> {
	loaded = false;
	dirty = false;
	width = 0;
	height = 0;
	sizeChanged = false;
	image?: HTMLImageElement;
	constructor(img: HTMLImageElement | string, name: string = "image-texture") {
		super(name);
		this.setImage(img);
	}

	async setImage(img: HTMLImageElement | string | ImageBitmap): Promise<this> {
		this.loaded = false;
		this.dirty = false;
		if (typeof img === "string") {
			let tmp = img;
			img = new Image();
			img.src = tmp;
		} else if (img instanceof ImageBitmap) {
			this.dirty = true;
			this.loaded = true;
			this.data = img;

			return this;
		}

		this.image = img;
		await img.decode();

		this.data = await createImageBitmap(img);
		if (this.width !== this.data.width || this.height !== this.data.height) {
			this.sizeChanged = true;
			this.width = this.data.width;
			this.height = this.data.height;
		}
		this.dirty = true;
		this.loaded = true;
		return this;
	}
}