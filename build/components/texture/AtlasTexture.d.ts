import Component from "@valeera/x/src/Component";
import { IAltas } from "./spritesheet/ISpritesheet";
export default class AtlasTexture extends Component<ImageBitmap> {
    loaded: boolean;
    dirty: boolean;
    width: number;
    height: number;
    image?: HTMLImageElement;
    framesBitmap: ImageBitmap[];
    constructor(json: IAltas, name?: string);
    private setImage;
}
