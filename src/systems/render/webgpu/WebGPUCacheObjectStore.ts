import { IShaderProgram } from "../ShaderProgram";
import { Sampler } from "../Sampler";
import { Texture } from "../texture/Texture";
import { BufferFloat32 } from "../Buffer";

export type GPUObjectHasCache = GPUTexture | GPURenderPipeline | GPUShaderModule | GPUSampler | GPUBuffer;

export interface IWebGPUObjectCache<T extends GPUObjectHasCache> {
    dirty: boolean;
    data: T;
};

export interface WebGPUTextureCache extends IWebGPUObjectCache<GPUTexture>, GPUTextureDescriptor{}

export interface WebGPUBufferCache extends IWebGPUObjectCache<GPUBuffer>, GPUBufferDescriptor{}

export interface WebGPUShaderModuleCache extends IWebGPUObjectCache<GPUShaderModule>, GPUShaderModuleDescriptor{}

export interface WebGPUSamplerCache extends IWebGPUObjectCache<GPUSampler>, GPUSamplerDescriptor{
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

const checkTextureCacheReuseable = (descriptor: GPUTextureDescriptor, cache: WebGPUTextureCache): boolean => {
    if (descriptor.size[0] !== cache.size[0]) {
        return false;
    }
    if (descriptor.size[1] !== cache.size[1]) {
        return false;
    }
    if (descriptor.format !== cache.format) {
        return false;
    }
    if (descriptor.usage !== cache.usage) {
        return false;
    }
    if (descriptor.dimension !== cache.dimension) {
        return false;
    }
    if (descriptor.sampleCount !== cache.sampleCount) {
        return false;
    }
    if (descriptor.mipLevelCount !== cache.mipLevelCount) {
        return false;
    }

    return true;
}

const checkShaderModuleCacheReuseable = (descriptor: GPUShaderModuleDescriptor , cache: WebGPUShaderModuleCache) => {
    if (descriptor.code !== cache.code) {
        return false;
    }

    return true;
}

const checkBufferCacheReuseable = (descriptor: GPUBufferDescriptor, cache: WebGPUBufferCache): boolean => {
    if (descriptor.size !== cache.data.size) {
        return false;
    }
    if (descriptor.usage !== cache.data.usage) {
        return false;
    }
    return true;
}

const checkSamplerCacheReuseable = (descriptor: GPUSamplerDescriptor, cache: WebGPUSamplerCache): boolean => {
    if (descriptor.addressModeU !== cache.addressModeU) {
        return false;
    }
    if (descriptor.addressModeV !== cache.addressModeV) {
        return false;
    }
    if (descriptor.addressModeW !== cache.addressModeW) {
        return false;
    }
    if (descriptor.minFilter !== cache.minFilter) {
        return false;
    }
    if (descriptor.magFilter !== cache.magFilter) {
        return false;
    }
    if (descriptor.mipmapFilter !== cache.mipmapFilter) {
        return false;
    }
    if (descriptor.maxAnisotropy !== cache.maxAnisotropy) {
        return false;
    }
    if (descriptor.lodMaxClamp !== cache.lodMaxClamp) {
        return false;
    }
    if (descriptor.lodMinClamp !== cache.lodMinClamp) {
        return false;
    }
    if (descriptor.compare !== cache.compare) {
        return false;
    }
    return true;
}

export const WebGPUCacheObjectStore = {
    caches: new Map<any, Map<GPUDevice, IWebGPUObjectCache<GPUObjectHasCache>>>(),
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
            if (checkTextureCacheReuseable(texture.descriptor, cache)) {
                cache.dirty = true;
                return cache;
            } else {
                cache.data.destroy();
            }
        }
        
        cache = {
            dirty: true,
            data: device.createTexture(texture.descriptor),
            ...texture.descriptor
        };
        map.set(device, cache);

        return cache;
    },
    createGPUBufferCache: (buffer: BufferFloat32, device: GPUDevice) => {
        let map = WebGPUCacheObjectStore.caches.get(buffer);
        if (!map) {
            map = new Map();
            WebGPUCacheObjectStore.caches.set(buffer, map);
        }
        let cache = map.get(device) as WebGPUBufferCache;
        if (cache) {
            if (checkBufferCacheReuseable(buffer.descriptor, cache)) {
                cache.dirty = true;
                cache.data.label = buffer.name;
                return cache;
            } else {
                cache.data.destroy();
            }
        }
        
        cache = {
            dirty: true,
            data: device.createBuffer(buffer.descriptor),
            ...buffer.descriptor,
        };
        map.set(device, cache);

        return cache;
    },
    createGPUSamplerCache: (sampler: Sampler, device: GPUDevice) => {
        let map = WebGPUCacheObjectStore.caches.get(sampler);
        if (!map) {
            map = new Map();
            WebGPUCacheObjectStore.caches.set(sampler, map);
        }
        let cache = map.get(device) as WebGPUSamplerCache;
        if (cache) {
            if (checkSamplerCacheReuseable(sampler.descriptor, cache)) {
                cache.dirty = true;
                cache.data.label = sampler.name;
                return cache;
            }
        }
        
        cache = {
            dirty: true,
            data: device.createSampler(sampler.descriptor),
            ...sampler.descriptor,
        };
        map.set(device, cache);

        return cache;
    },
    createGPUShaderModuleCache: (shaderProgram: IShaderProgram, device: GPUDevice) => {
        let map = WebGPUCacheObjectStore.caches.get(shaderProgram);
        if (!map) {
            map = new Map();
            WebGPUCacheObjectStore.caches.set(shaderProgram, map);
        }
        let cache = map.get(device) as WebGPUShaderModuleCache;
        if (cache) {
            if (checkShaderModuleCacheReuseable(shaderProgram.descriptor, cache)) {
                cache.dirty = true;
                cache.data.label = shaderProgram.name;
                return cache;
            }
        }
        
        cache = {
            dirty: true,
            data: device.createShaderModule(shaderProgram.descriptor),
            ...shaderProgram.descriptor,
        };
        map.set(device, cache);

        return cache;
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
