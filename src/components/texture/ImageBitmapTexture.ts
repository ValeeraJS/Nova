import Component from "@valeera/x/src/Component";

export default class ImageBitmapTexture extends Component<any> {
	loaded = false;
	dirty = false;
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
		this.dirty = true;
		this.loaded = true;
		return this;
	}
}