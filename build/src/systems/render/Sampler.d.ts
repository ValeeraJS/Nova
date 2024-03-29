export declare class Sampler {
    dirty: boolean;
    descriptor: Required<GPUSamplerDescriptor>;
    name: string;
    constructor(option?: GPUSamplerDescriptor, name?: string);
    get addressModeU(): GPUAddressMode;
    set addressModeU(value: GPUAddressMode);
    get addressModeV(): GPUAddressMode;
    set addressModeV(value: GPUAddressMode);
    get addressModeW(): GPUAddressMode;
    set addressModeW(value: GPUAddressMode);
    get magFilter(): GPUFilterMode;
    set magFilter(v: GPUFilterMode);
    get minFilter(): GPUFilterMode;
    set minFilter(v: GPUFilterMode);
    get mipmapFilter(): GPUMipmapFilterMode;
    set mipmapFilter(v: GPUMipmapFilterMode);
    get lodMaxClamp(): number;
    set lodMaxClamp(v: number);
    get lodMinClamp(): number;
    set lodMinClamp(v: number);
    get maxAnisotropy(): number;
    set maxAnisotropy(v: number);
    get compare(): GPUCompareFunction;
    set compare(v: GPUCompareFunction);
    setAddressMode(u: GPUAddressMode, v: GPUAddressMode, w?: GPUAddressMode): this;
    setFilterMode(mag: GPUFilterMode, min: GPUFilterMode, mipmap?: GPUFilterMode): this;
    setLodClamp(min: number, max: number): this;
    setMaxAnisotropy(v: number): this;
    setCompare(v: GPUCompareFunction): this;
}
