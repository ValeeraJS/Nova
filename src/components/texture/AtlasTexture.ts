import Component from "@valeera/x/src/Component";
import { drawSpriteBlock } from "../../utils/drawSpriteBlock";
import { IAltas } from "./spritesheet/ISpritesheet";

export default class AtlasTexture extends Component<ImageBitmap> {
    loaded = false;
    dirty = false;
    width = 0;
    height = 0;
    image?: HTMLImageElement;
    framesBitmap: ImageBitmap[] = [];
    constructor(json: IAltas, name: string = "atlas-texture") {
        super(name, null as any);
        this.width = json.spriteSize.w;
        this.height = json.spriteSize.h;

        this.setImage(json);
    }

    private async setImage(json: IAltas): Promise<this> {
        this.loaded = false;
        this.dirty = false;
        let img = new Image();
        img.src = json.image;

        this.image = img;
        await img.decode();

        this.data = await drawSpriteBlock(this.image, json.spriteSize.w, json.spriteSize.h, json.frame);

        this.dirty = true;
        this.loaded = true;
        return this;
    }
}

