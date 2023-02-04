import { Component } from "@valeera/x";
export default class Texture extends Component<ImageBitmap | undefined | null> {
    dirty: boolean;
    width: number;
    height: number;
    constructor(width: number, height: number, img: ImageBitmap | undefined | null, name?: string);
    destroy(): void;
    get imageBitmap(): ImageBitmap | undefined | null;
    set imageBitmap(img: ImageBitmap | undefined | null);
}
