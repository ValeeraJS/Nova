import { drawSpriteBlock } from "../../utils/drawSpriteBlock";
import ISpritesheet from "./spritesheet/ISpritesheet";
import Texture from "./Texture";

export default class SpritesheetTexture extends Texture {
    loaded = false;
    frame = 0; // 当前帧索引
    image?: HTMLImageElement;
    framesBitmap: ImageBitmap[] = [];
    constructor(json: ISpritesheet, name: string = "spritesheet-texture") {
        super(json.spriteSize.w, json.spriteSize.h, null, name);

        this.setImage(json);
    }

    private async setImage(json: ISpritesheet): Promise<this> {
        this.loaded = false;
        this.dirty = false;
        let img = new Image();
        img.src = json.image;

        this.image = img;
        await img.decode();

        // canvas.width = json.spriteSize.w;
        // canvas.height = json.spriteSize.h;
        for (let item of json.frames) {
            this.framesBitmap.push(await drawSpriteBlock(this.image, json.spriteSize.w, json.spriteSize.h, item));
        }
        this.data = this.framesBitmap[0];

        this.dirty = true;
        this.loaded = true;
        return this;
    }

    setFrame(frame: number) {
        this.frame = frame;
        this.data = this.framesBitmap[frame];
        this.dirty = true;
    }
}

