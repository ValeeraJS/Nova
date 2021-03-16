import Component from "@valeera/x/src/Component";

export default class ImageTexture extends Component<any> {
	loaded = false;
	dirty = false;
    constructor(img: HTMLImageElement | string, name: string = "image-texture") {
		super(name);
		this.setImage(img);
    }

	setImage(img: HTMLImageElement | string) {
		this.loaded = false;
		this.dirty = false;
		if (typeof img === "string") {
			let tmp = img;
			img = new Image();
			img.src = tmp;
		}
		img.decode().then(()=>{
			return createImageBitmap(img as HTMLImageElement);
		}).then((bitmap)=>{
			this.data = bitmap;
			this.dirty = true;
			this.loaded = true;
		});
	}
}