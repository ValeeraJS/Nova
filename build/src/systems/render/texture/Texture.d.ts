export type TextureOptions = {
    size: number[];
    name?: string;
    format?: GPUTextureFormat;
    usage?: number;
    image?: undefined | null | ImageBitmap;
};
export declare class Texture {
    data: ImageBitmap | null | undefined;
    dirty: boolean;
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
