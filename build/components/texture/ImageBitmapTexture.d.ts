import Component from "@valeera/x/src/Component";
export default class ImageBitmapTexture extends Component<ImageBitmap> {
    loaded: boolean;
    dirty: boolean;
    width: number;
    height: number;
    sizeChanged: boolean;
    image: HTMLImageElement;
    constructor(img: HTMLImageElement | string, width: number, height: number, name?: string);
    setImage(img: HTMLImageElement | string | ImageBitmap): Promise<this>;
}
