import { Texture } from "../../../components";
export type GPUObjecthasCache = GPUTexture | GPURenderPipeline | GPUShaderModule;
export interface IWebGPUObjectCache<T extends GPUObjecthasCache> {
    dirty: boolean;
    data: T;
}
export interface WebGPUTextureCache extends IWebGPUObjectCache<GPUTexture> {
    width: number;
    height: number;
    format: string;
    usage: number;
}
export declare const WebGPUCacheObjectStore: {
    caches: Map<any, Map<GPUDevice, IWebGPUObjectCache<GPUObjecthasCache>>>;
    getCaches: (objects: any) => Map<GPUDevice, IWebGPUObjectCache<GPUObjecthasCache>>;
    getCache: (key: any, device: GPUDevice) => IWebGPUObjectCache<GPUObjecthasCache>;
    clearCaches: (objects: any) => any;
    clearCache: (objects: any, device: GPUDevice) => any;
    createGPUTextureCache: (texture: Texture, device: GPUDevice) => {
        dirty: boolean;
        data: GPUTexture;
    };
    setDirty: (key: any, device?: GPUDevice) => any;
    checkDirty: (key: any, device?: GPUDevice) => boolean;
    getDirtyCache: (key: any, device?: GPUDevice) => IWebGPUObjectCache<GPUObjecthasCache>;
};
