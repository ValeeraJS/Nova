export class Sampler {
    dirty: boolean = true;
    descriptor: Required<GPUSamplerDescriptor> = {} as any;
    name: string;
    constructor(option: GPUSamplerDescriptor = {}, name = "sampler") {
        this.descriptor.addressModeU = option.addressModeU ?? "repeat";
        this.descriptor.addressModeV = option.addressModeV ?? "repeat";
        this.descriptor.addressModeW = option.addressModeW ?? "repeat";
        this.descriptor.magFilter = option.magFilter ?? "linear";
        this.descriptor.minFilter = option.minFilter ?? "linear";
        this.descriptor.mipmapFilter = option.mipmapFilter ?? "linear";
        this.descriptor.maxAnisotropy = option.maxAnisotropy ?? 1;
        this.descriptor.lodMaxClamp = option.lodMaxClamp ?? 32;
        this.descriptor.lodMinClamp = option.lodMinClamp ?? 0;
        this.descriptor.compare = option.compare ?? undefined;
        this.name = name;
    }

    get addressModeU() {
        return this.descriptor.addressModeU;
    }

    set addressModeU(value: GPUAddressMode) {
        this.descriptor.addressModeU = value;
        this.dirty = true;
    }

    get addressModeV() {
        return this.descriptor.addressModeV;
    }

    set addressModeV(value: GPUAddressMode) {
        this.descriptor.addressModeV = value;
        this.dirty = true;
    }

    get addressModeW() {
        return this.descriptor.addressModeW;
    }

    set addressModeW(value: GPUAddressMode) {
        this.descriptor.addressModeW = value;
        this.dirty = true;
    }

    get magFilter(): GPUFilterMode {
        return this.descriptor.magFilter;
    }

    set magFilter(v: GPUFilterMode) {
        this.descriptor.magFilter = v;
        this.dirty = true;
    }

    get minFilter(): GPUFilterMode {
        return this.descriptor.minFilter;
    }

    set minFilter(v: GPUFilterMode) {
        this.descriptor.minFilter = v;
        this.dirty = true;
    }

    get mipmapFilter(): GPUMipmapFilterMode {
        return this.descriptor.mipmapFilter;
    }

    set mipmapFilter(v: GPUMipmapFilterMode) {
        this.descriptor.mipmapFilter = v;
        this.dirty = true;
    }

    get lodMaxClamp(): number {
        return this.descriptor.lodMaxClamp;
    }

    set lodMaxClamp(v: number) {
        this.descriptor.lodMaxClamp = v;
        this.dirty = true;
    }

    get lodMinClamp(): number {
        return this.descriptor.lodMinClamp;
    }

    set lodMinClamp(v: number) {
        this.descriptor.lodMinClamp = v;
        this.dirty = true;
    }

    get maxAnisotropy(): number {
        return this.descriptor.maxAnisotropy;
    }

    set maxAnisotropy(v: number) {
        this.descriptor.maxAnisotropy = v;
        this.dirty = true;
    }

	get compare(): GPUCompareFunction {
		return this.descriptor.compare;
	}

	set compare(v: GPUCompareFunction) {
		this.descriptor.compare = v;
        this.dirty = true;
	}

    setAddressMode(u: GPUAddressMode, v: GPUAddressMode, w?: GPUAddressMode) {
        this.descriptor.addressModeU = u;
        this.descriptor.addressModeV = v;
        this.descriptor.addressModeW = w ?? this.descriptor.addressModeW;
        this.dirty = true;

        return this;
    }

    setFilterMode(mag: GPUFilterMode, min: GPUFilterMode, mipmap?: GPUFilterMode) {
        this.descriptor.magFilter = mag;
        this.descriptor.minFilter = min;
        this.descriptor.mipmapFilter = mipmap ?? this.descriptor.mipmapFilter;
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
