export class Sampler {
    dirty: boolean = true;
    descriptor: Required<GPUSamplerDescriptor> = {} as any;
    name: string;
    constructor(option: GPUSamplerDescriptor = {}, name = "sampler") {
        this.descriptor.minFilter = option.minFilter ?? "linear";
        this.descriptor.magFilter = option.magFilter ?? "linear";
        this.descriptor.addressModeU = option.addressModeU ?? "repeat";
        this.descriptor.addressModeV = option.addressModeV ?? "repeat";
        this.descriptor.addressModeW = option.addressModeW ?? "repeat";
        this.descriptor.maxAnisotropy = option.maxAnisotropy ?? 1;
        this.descriptor.mipmapFilter = option.mipmapFilter ?? "linear";
        this.descriptor.lodMaxClamp = option.lodMaxClamp ?? 32;
        this.descriptor.lodMinClamp = option.lodMinClamp ?? 0;
        this.descriptor.compare = option.compare ?? undefined;
        this.name = name;
    }

    setAddressMode(u: GPUAddressMode, v: GPUAddressMode, w?: GPUAddressMode) {
        this.descriptor.addressModeU = u;
        this.descriptor.addressModeV = v;
        this.descriptor.addressModeW = w ?? this.descriptor.addressModeW;
        this.dirty = true;

        return this;
    }

    setFilterMode(mag: GPUFilterMode, min: GPUFilterMode, mipmap: GPUFilterMode) {
        this.descriptor.magFilter = mag;
        this.descriptor.minFilter = min;
        this.descriptor.mipmapFilter = mipmap;
        this.dirty = true;

        return this;
    }

    setLodClamp(min: number, max: number) {
        this.descriptor.lodMaxClamp = max;
        this.descriptor.lodMinClamp = min;
        this.dirty = true;

        return this;
    }

    setMaxAnisotropy(v: number) {
        this.descriptor.maxAnisotropy = v;
        this.dirty = true;

        return this;
    }

    setCompare(v: GPUCompareFunction) {
        this.descriptor.compare = v;
        this.dirty = true;

        return this;
    }
}
