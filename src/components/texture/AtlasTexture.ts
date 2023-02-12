import { drawSpriteBlock } from "../../utils/drawSpriteBlock";
import { IAltas } from "./spritesheet/ISpritesheet";
import Texture from "./Texture";

export default class AtlasTexture extends Texture {
    loaded = false;
    image?: HTMLImageElement;
    framesBitmap: ImageBitmap[] = [];
    constructor(json: IAltas, name: string = "atlas-texture") {
        super({
            size: [json.spriteSize.w, json.spriteSize.h],
            name
        });

        this.setImage(json);
    }

    private async setImage(json: IAltas): Promise<this> {
        this.loaded = false;
        this.dirty = false;
        let img = new Image();
        img.src = json.image;

        this.image = img;
        await img.decode();

        this.imageBitmap = await drawSpriteBlock(this.image, json.spriteSize.w, json.spriteSize.h, json.frame);

        this.loaded = true;
        return this;
    }
}

