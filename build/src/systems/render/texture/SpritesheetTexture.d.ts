import { ISpritesheet } from "./spritesheet/ISpritesheet";
import { Texture } from "./Texture";
export declare class SpritesheetTexture extends Texture {
    loaded: boolean;
    frame: number;
    image?: HTMLImageElement;
    framesBitmap: ImageBitmap[];
    constructor(json: ISpritesheet, name?: string);
    private setImage;
    setFrame(frame: number): void;
}
