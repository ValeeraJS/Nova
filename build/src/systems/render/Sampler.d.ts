export declare class Sampler {
    dirty: boolean;
    descriptor: Required<GPUSamplerDescriptor>;
    name: string;
    constructor(option?: GPUSamplerDescriptor, name?: string);
    setAddressMode(u: GPUAddressMode, v: GPUAddressMode, w?: GPUAddressMode): this;
    setFilterMode(mag: GPUFilterMode, min: GPUFilterMode, mipmap?: GPUFilterMode): this;
    setLodClamp(min: number, max: number): this;
    setMaxAnisotropy(v: number): this;
    setCompare(v: GPUCompareFunction): this;
}
