import createVerticesBuffer from "./createVerticesBuffer";
import { GPURendererContext } from "./IWebGPURenderer";

const plane = new Float32Array([ // pos2 uv
	-1, 1, 0, 0,
	1, 1, 1, 0,
	-1, -1, 0, 1,
	1, -1, 1, 1,
]);

const vertexShader = `
struct VertexOutput {
	@builtin(position) position : vec4<f32>,
	@location(0) uv : vec2<f32>
}
  
@vertex
fn main(
	@location(0) position : vec2<f32>,
	@location(1) uv : vec2<f32>
) -> VertexOutput {
	var output : VertexOutput;
	output.position = vec4(position, 0., 1.);
	output.uv = uv;
	return output;
}`;

export class WebGPUPostProcessingPass {
	pipeline: GPURenderPipeline | undefined;
	shader: string;
	dirty: boolean;
	verticesBuffer: GPUBuffer;
	sampler: GPUSampler;
	name: string;
	disabled = false;
	resolution = new Float32Array([window.innerWidth, window.innerHeight]);
	constructor(name: string, shader: string) {
		this.shader = shader;
		this.name = name;
		this.dirty = true;
	}
	update(context: GPURendererContext) {
		if (!this.dirty) {
			return this;
		}
		this.sampler = context.device.createSampler({
			magFilter: 'linear',
			minFilter: 'linear',
		});
		this.verticesBuffer = context.device.createBuffer({
			size: plane.byteLength,
			usage: GPUBufferUsage.VERTEX,
			mappedAtCreation: true,
		});
		new Float32Array(this.verticesBuffer.getMappedRange()).set(plane);
		this.verticesBuffer.unmap();
		let entries: GPUBindGroupLayoutEntry[] = [
			{
				binding: 0,
				visibility: GPUShaderStage.FRAGMENT,
				sampler: {
					type: 'filtering'
				},
			},
			{
				binding: 1,
				visibility: GPUShaderStage.FRAGMENT,
				texture: {
					sampleType: 'float',
				},
			},
			{
				binding: 2,
				visibility: GPUShaderStage.FRAGMENT,
				buffer: {
					type: 'uniform',
				},
			}
		];
		const pipelineLayout = context.device.createPipelineLayout({
			bindGroupLayouts: [context.device.createBindGroupLayout({
				entries,
			})],
		});
		this.pipeline = context.device.createRenderPipeline({
			layout: pipelineLayout,
			vertex: {
				module: context.device.createShaderModule({
					code: vertexShader,
				}),
				entryPoint: 'main',
				buffers: [
					{
						arrayStride: 16,
						attributes: [
							{
								// position
								shaderLocation: 0,
								offset: 0,
								format: 'float32x2',
							},
							{
								// uv
								shaderLocation: 1,
								offset: 8,
								format: 'float32x2',
							},
						],
					},
				],
			},
			fragment: {
				module: context.device.createShaderModule({
					code: this.shader,
				}),
				entryPoint: 'main',
				targets: [
					{
						format: context.preferredFormat,
					},
				],
			},
			primitive: {
				topology: 'triangle-strip',
			},
			depthStencil: {
				depthWriteEnabled: true,
				depthCompare: 'less',
				format: 'depth24plus',
			},
		});

		this.dirty = false;

		return this;
	}
	render(context: GPURendererContext, texture: GPUTexture) {
		if (this.disabled) {
			return;
		}
		this.update(context);

		const uniformBindGroup = context.device.createBindGroup({
			layout: this.pipeline.getBindGroupLayout(0),
			entries: [
				{
					binding: 0,
					resource: this.sampler,
				},
				{
					binding: 1,
					resource: texture.createView(),
				},
				{
					binding: 2,
					resource: {
						buffer: createVerticesBuffer(context.device, this.resolution, GPUBufferUsage.UNIFORM),
					},
				}
			],
		});

		const passEncoder = context.passEncoder;
		passEncoder.setPipeline(this.pipeline);
		passEncoder.setBindGroup(0, uniformBindGroup);
		passEncoder.setVertexBuffer(0, this.verticesBuffer);
		passEncoder.draw(4, 1, 0, 0);
	}
}
