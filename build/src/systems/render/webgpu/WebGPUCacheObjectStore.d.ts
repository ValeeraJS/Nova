import { IShaderProgram } from "../ShaderProgram";
import { Sampler } from "../Sampler";
import { Texture } from "../texture/Texture";
import { BufferFloat32 } from "../Buffer";
export type GPUObjectHasCache = GPUTexture | GPURenderPipeline | GPUShaderModule | GPUSampler | GPUBuffer;
export interface IWebGPUObjectCache<T extends GPUObjectHasCache> {
    dirty: boolean;
    data: T;
}
export interface WebGPUTextureCache extends IWebGPUObjectCache<GPUTexture>, GPUTextureDescriptor {
}
export interface WebGPUBufferCache extends IWebGPUObjectCache<GPUBuffer>, GPUBufferDescriptor {
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
    createGPUBufferCache: (buffer: BufferFloat32, device: GPUDevice) => WebGPUBufferCache;
    createGPUSamplerCache: (sampler: Sampler, device: GPUDevice) => WebGPUSamplerCache;
    createGPUShaderModuleCache: (shaderProgram: IShaderProgram, device: GPUDevice) => WebGPUShaderModuleCache;
    setDirty: (key: any, device?: GPUDevice) => any;
    checkDirty: (key: any, device?: GPUDevice) => boolean;
    getDirtyCache: (key: any, device?: GPUDevice) => IWebGPUObjectCache<GPUObjectHasCache>;
};
