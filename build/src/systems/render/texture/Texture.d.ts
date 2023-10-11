export type TextureOptions = {
    size: GPUExtent3DStrict;
    name?: string;
    format?: GPUTextureFormat;
    usage?: number;
    source?: undefined | null | GPUImageCopyExternalImageSource;
    label?: string;
};
export declare class Texture {
    data: GPUImageCopyExternalImageSource | null | undefined;
    dirty: boolean;
    name: string;
    descriptor: Required<GPUTextureDescriptor>;
    constructor(options: TextureOptions);
    destroy(): void;
    get width(): number;
    set width(v: number);
    get height(): number;
    set height(v: number);
    get source(): GPUImageCopyExternalImageSource | undefined | null;
    set source(img: GPUImageCopyExternalImageSource | undefined | null);
}
