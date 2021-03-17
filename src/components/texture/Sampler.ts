import Component from "@valeera/x/src/Component";

export default class Sampler extends Component<GPUSamplerDescriptor> {
    data: GPUSamplerDescriptor = {};
    constructor(option: GPUSamplerDescriptor = {}) {
        super("sampler", option);
        this.dirty = true;
    }

    setAddressMode(u: GPUAddressMode, v: GPUAddressMode, w: GPUAddressMode) {
        this.data.addressModeU = u;
        this.data.addressModeV = v;
        this.data.addressModeW = w;
        this.dirty = true;

        return this;
    }
    
    setFilterMode(mag: GPUFilterMode, min: GPUFilterMode, mipmap: GPUFilterMode) {
        this.data.magFilter = mag;
        this.data.minFilter = min;
        this.data.mipmapFilter = mipmap;
        this.dirty = true;
        
        return this;
    }

    setLodClamp(min: number, max: number) {
        this.data.lodMaxClamp = max;
        this.data.lodMinClamp = min;

        return this;
    }

    setMaxAnisotropy(v: number) {
        this.data.maxAnisotropy = v;

        return this;
    }

    setCompare(v: GPUCompareFunction) {
        this.data.compare = v;

        return this;
    }
}
