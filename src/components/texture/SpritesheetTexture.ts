import Component from "@valeera/x/src/Component";
import { drawSpriteBlock } from "../../utils/drawSpriteBlock";
import IFrame from "./spritesheet/IFrame";
import ISpritesheet from "./spritesheet/ISpritesheet";

// const canvas = document.createElement("canvas");
// const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

// async function drawSpriteBlock(image: HTMLImageElement, frame: IFrame): Promise<ImageBitmap> {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h, frame.dx, frame.dy, frame.w, frame.h);
//     return await createImageBitmap(canvas);
// }

export default class SpritesheetTexture extends Component<ImageBitmap> {
    loaded = false;
    dirty = false;
    frame = 0; // 当前帧索引
    width = 0;
    height = 0;
    image?: HTMLImageElement;
    framesBitmap: ImageBitmap[] = [];
    constructor(json: ISpritesheet, name: string = "spritesheet-texture") {
        super(name);
        this.width = json.spriteSize.w;
        this.height = json.spriteSize.h;

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

