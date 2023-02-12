export type TextureOptions = {
    size: GPUExtent3DStrict;
    name?: string;
    format?: GPUTextureFormat;
    usage?: number;
    image?: undefined | null | ImageBitmap;
};
export declare class Texture {
    data: ImageBitmap | null | undefined;
    dirty: boolean;
    descriptor: Required<GPUTextureDescriptor>;
    constructor(options: TextureOptions);
    destroy(): void;
    get width(): number;
    set width(v: number);
    get height(): number;
    set height(v: number);
    get imageBitmap(): ImageBitmap | undefined | null;
    set imageBitmap(img: ImageBitmap | undefined | null);
}
