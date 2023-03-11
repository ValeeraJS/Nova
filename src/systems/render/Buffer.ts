export class BufferFloat32 extends Float32Array {
    dirty: boolean = true;
    name: string;
    descriptor: GPUBufferDescriptor = {} as any;
    constructor(option: Partial<GPUBufferDescriptor>, name = "buffer") {
        super((option.size ?? 16) >> 2);
        this.name = name;
        this.descriptor.usage = option.usage ?? (GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
        this.descriptor.size = option.size ?? 16;
    }

    set(arr: ArrayLike<number>, offset?: number) {
        super.set(arr, offset);
        this.dirty = true;
    }
}
