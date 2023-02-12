import { IAltas } from "./spritesheet/ISpritesheet";
import { Texture } from "./Texture";
export declare class AtlasTexture extends Texture {
    loaded: boolean;
    image?: HTMLImageElement;
    framesBitmap: ImageBitmap[];
    constructor(json: IAltas, name?: string);
    private setImage;
}
