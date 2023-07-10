let descriptor: GPUBufferDescriptor = {
	size: 0,
	usage: GPUBufferUsage.VERTEX,
	mappedAtCreation: true
};

export default (device: GPUDevice, data: Float32Array, usage: number = GPUBufferUsage.VERTEX) => {
	descriptor.size = data.byteLength;
	descriptor.usage = usage;
	let buffer = device.createBuffer(descriptor);
	new Float32Array(buffer.getMappedRange()).set(data);
	buffer.unmap();
	return buffer;
}
