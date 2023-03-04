import { IShaderProgram } from "../IMatrial";
import { Sampler } from "../texture/Sampler";
import { Texture } from "../texture/Texture";
export type GPUObjectHasCache = GPUTexture | GPURenderPipeline | GPUShaderModule | GPUSampler;
export interface IWebGPUObjectCache<T extends GPUObjectHasCache> {
    dirty: boolean;
    data: T;
}
export interface WebGPUTextureCache extends IWebGPUObjectCache<GPUTexture>, GPUTextureDescriptor {
    size: GPUExtent3DStrict;
    format: GPUTextureFormat;
    usage: number;
}
export interface WebGPUShaderModuleCache extends IWebGPUObjectCache<GPUShaderModule>, GPUShaderModuleDescriptor {
}
export interface WebGPUSamplerCache extends IWebGPUObjectCache<GPUSampler>, GPUSamplerDescriptor {
    minFilter: GPUFilterMode;
    magFilter: GPUFilterMode;
    mipmapFilter: GPUMipmapFilterMode;
    addressModeU: GPUAddressMode;
    addressModeV: GPUAddressMode;
    addressModeW: GPUAddressMode;
    maxAnisotropy: number;
    lodMaxClamp: number;
    lodMinClamp: number;
    compare: GPUCompareFunction | undefined;
}
export declare const WebGPUCacheObjectStore: {
    caches: Map<any, Map<GPUDevice, IWebGPUObjectCache<GPUObjectHasCache>>>;
    getCaches: (objects: any) => Map<GPUDevice, IWebGPUObjectCache<GPUObjectHasCache>>;
    getCache: (key: any, device: GPUDevice) => IWebGPUObjectCache<GPUObjectHasCache>;
    clearCaches: (objects: any) => any;
    clearCache: (objects: any, device: GPUDevice) => any;
    createGPUTextureCache: (texture: Texture, device: GPUDevice) => WebGPUTextureCache;
    createGPUSamplerCache: (sampler: Sampler, device: GPUDevice) => WebGPUSamplerCache;
    createGPUShaderModuleCache: (shaderProgram: IShaderProgram, device: GPUDevice) => WebGPUShaderModuleCache;
    setDirty: (key: any, device?: GPUDevice) => any;
    checkDirty: (key: any, device?: GPUDevice) => boolean;
    getDirtyCache: (key: any, device?: GPUDevice) => IWebGPUObjectCache<GPUObjectHasCache>;
};
