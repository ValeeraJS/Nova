export type GPUObjecthasCache = GPUTexture | GPURenderPipeline | GPUShaderModule;

export interface IWebGPUObjectCache<T extends GPUObjecthasCache> {
    dirty: boolean;
    data: T;
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
