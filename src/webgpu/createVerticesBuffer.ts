let descriptor: GPUBufferDescriptor = {
    size: 0,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true
};

export default (device: GPUDevice, data: Float32Array) => {
    descriptor.size = data.byteLength;
    let buffer = device.createBuffer(descriptor);
    new Float32Array(buffer.getMappedRange()).set(data);
    buffer.unmap();
    return buffer;
}
