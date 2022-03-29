import Component from "@valeera/x/src/Component";
import ISpritesheet from "./spritesheet/ISpritesheet";
export default class SpritesheetTexture extends Component<ImageBitmap> {
    loaded: boolean;
    dirty: boolean;
    frame: number;
    width: number;
    height: number;
    image?: HTMLImageElement;
    framesBitmap: ImageBitmap[];
    constructor(json: ISpritesheet, name?: string);
    private setImage;
    setFrame(frame: number): void;
}
