/// <reference types="dist" />
import Component from "@valeera/x/src/Component";
export default class Sampler extends Component<GPUSamplerDescriptor> {
    data: GPUSamplerDescriptor;
    constructor(option?: GPUSamplerDescriptor);
    setAddressMode(u: GPUAddressMode, v: GPUAddressMode, w: GPUAddressMode): this;
    setFilterMode(mag: GPUFilterMode, min: GPUFilterMode, mipmap: GPUFilterMode): this;
    setLodClamp(min: number, max: number): this;
    setMaxAnisotropy(v: number): this;
    setCompare(v: GPUCompareFunction): this;
}