/// <reference types="dist" />
export type GPUObjecthasCache = GPUTexture | GPURenderPipeline | GPUShaderModule;
export interface IWebGPUObjectCache<T extends GPUObjecthasCache> {
    dirty: boolean;
    data: T;
}
export declare const WebGPUCacheObjectStore: {
    caches: Map<any, Map<GPUDevice, IWebGPUObjectCache<GPUObjecthasCache>>>;
    getCaches: (objects: any) => Map<GPUDevice, IWebGPUObjectCache<GPUObjecthasCache>>;
    getCache: (key: any, device: GPUDevice) => IWebGPUObjectCache<GPUObjecthasCache>;
    setDirty: (key: any, device?: GPUDevice) => any;
    checkDirty: (key: any, device?: GPUDevice) => boolean;
    getDirtyCache: (key: any, device?: GPUDevice) => IWebGPUObjectCache<GPUObjecthasCache>;
};
