import { Texture } from "./Texture";
export declare class ImageBitmapTexture extends Texture {
    loaded: boolean;
    sizeChanged: boolean;
    image: HTMLImageElement;
    constructor(img: HTMLImageElement | string | ImageBitmap, width: number, height: number, name?: string);
    setImage(img: HTMLImageElement | string | ImageBitmap): Promise<this>;
}
