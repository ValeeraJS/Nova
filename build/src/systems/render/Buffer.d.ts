export declare class BufferFloat32 extends Float32Array {
    dirty: boolean;
    name: string;
    descriptor: GPUBufferDescriptor;
    constructor(option: Partial<GPUBufferDescriptor> & {
        data?: Float32Array | number[];
    }, name?: string);
    set(arr: ArrayLike<number>, offset?: number): void;
}
