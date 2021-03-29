let descriptor: GPUBufferDescriptor = {
    size: 0,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true
};

export default (gl: WebGLRenderingContext, data: Float32Array): WebGLBuffer => {
    const buffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
}
