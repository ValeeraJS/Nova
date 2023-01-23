import Component from "@valeera/x/src/Component";

export default class Texture extends Component<ImageBitmap | undefined | null> {
	dirty = false;
	width: number;
	height: number;

	public constructor(width: number, height: number, img: ImageBitmap | undefined | null, name: string = "texture") {
		super(name, img);
		this.width = width;
		this.height = height;
		this.imageBitmap = img;
	}

	public destroy() {
		this.data?.close();
		this.data = undefined;
		this.width = 0;
		this.height = 0;
	}

	get imageBitmap() {
		return this.data;
	}

	set imageBitmap(img: ImageBitmap | undefined | null) {
		this.dirty = true;
		this.data = img;
	}
}