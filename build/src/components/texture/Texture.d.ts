import { Component } from "@valeera/x";
export type TextureOptions = {
    size: number[];
    name?: string;
    format?: GPUTextureFormat;
    usage?: number;
    image?: undefined | null | ImageBitmap;
};
export default class Texture extends Component<ImageBitmap | undefined | null> {
    descriptor: GPUTextureDescriptor;
    constructor(options: TextureOptions);
    destroy(): void;
    get width(): number;
    set width(v: number);
    get height(): number;
    set height(v: number);
    get imageBitmap(): ImageBitmap | undefined | null;
    set imageBitmap(img: ImageBitmap | undefined | null);
}
