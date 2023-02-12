import { Texture } from "../texture/Texture";

export type GPUObjecthasCache = GPUTexture | GPURenderPipeline | GPUShaderModule;

export interface IWebGPUObjectCache<T extends GPUObjecthasCache> {
    dirty: boolean;
    data: T;
};

export interface WebGPUTextureCache extends IWebGPUObjectCache<GPUTexture> {
    width: number;
    height: number;
    format: string;
    usage: number;
}

const checkTextureCacheReuseable = (descriptor: GPUTextureDescriptor, cache: WebGPUTextureCache): boolean => {
    if (descriptor.size[0] !== cache.width) {
        return false;
    }
    if (descriptor.size[1] !== cache.height) {
        return false;
    }
    if (descriptor.format !== cache.format) {
        return false;
    }
    if (descriptor.usage !== cache.usage) {
        return false;
    }

    return true;
}

export const WebGPUCacheObjectStore = {
    caches: new Map<any, Map<GPUDevice, IWebGPUObjectCache<GPUObjecthasCache>>>(),
    getCaches: (objects: any) => {
        return WebGPUCacheObjectStore.caches.get(objects);
    },
    getCache: (key: any, device: GPUDevice) => {
        const caches = WebGPUCacheObjectStore.getCaches(key);
        return caches?.get(device);
    },
    clearCaches: (objects: any) => {
        const map = WebGPUCacheObjectStore.caches.get(objects);
        if (map) {
            map.forEach((cache) => {
                (cache.data as GPUTexture).destroy?.();
            });
            map.clear();
        }
        return WebGPUCacheObjectStore;
    },
    clearCache: (objects: any, device: GPUDevice) => {
        const map = WebGPUCacheObjectStore.caches.get(objects);
        if (map) {
            const cache = map.get(device);
            if (cache) {
                (cache.data as GPUTexture).destroy?.();
                map.delete(device);
            }
        }
        return WebGPUCacheObjectStore;
    },
    createGPUTextureCache: (texture: Texture, device: GPUDevice) => {
        let map = WebGPUCacheObjectStore.caches.get(texture);
        if (!map) {
            map = new Map();
            WebGPUCacheObjectStore.caches.set(texture, map);
        }
        let cache = map.get(device) as WebGPUTextureCache;
        if (cache) {
            if (cache.width === texture.width && cache.height === texture.height) {
                cache.dirty = true;
                return cache;
            } else {
                cache.data.destroy();
            }
        }
        
        const data = {
            dirty: true,
            data: device.createTexture(texture.descriptor)
        };
        map.set(device, data);

        return data;
    },
    // 一对多关系，所以原始引擎对象dirty需要和缓存对象挂钩
    setDirty: (key: any, device?: GPUDevice) => {
        const caches = WebGPUCacheObjectStore.getCaches(key);
        if (caches) {
            if (device) {
                const a = caches.get(device);
                if (a) {
                    a.dirty = true;
                }
            } else {
                caches.forEach((cache) => {
                    cache.dirty = true;
                });
            }
        }

        return WebGPUCacheObjectStore;
    },
    // 后续引擎对象的dirty需要和这个挂钩
    checkDirty: (key: any, device?: GPUDevice): boolean => {
        const caches = WebGPUCacheObjectStore.getCaches(key);
        if (!caches) {
            return true;
        }
        if (device) {
            const cache = caches.get(device);
            if (cache?.dirty) {
                return true;
            }
            return false;
        }
        let result = false;
        caches.forEach((c) => {
            if (c.dirty) {
                result = true;
            }
        });
        return result;
    },
    getDirtyCache: (key: any, device?: GPUDevice) => {
        const caches = WebGPUCacheObjectStore.getCaches(key);
        if (!caches) {
            return null;
        }
        return caches.get(device);
    }
}
