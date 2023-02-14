import Geometry, { AttributesNodeData } from "..//geometry/Geometry";
import { BUFFER, MESH2, RENDERABLE, SAMPLER, TEXTURE_IMAGE } from "../../../components/constants";
import { updateModelMatrixComponent } from "../../../components/matrix3/Matrix3Component";
import createVerticesBuffer from "./createVerticesBuffer";
import { GPURendererContext, IWebGPURenderer } from "./IWebGPURenderer";
import { IMaterial, IUniformSlot } from "./material/IMatrial";
import { ICamera2 } from "../../../entities/Camera2";
import Object2 from "../../../entities/Object2";
import { Matrix3, Matrix4 } from "@valeera/mathx";
import { IEntity } from "@valeera/x";
import { Mesh2 } from "./Mesh2";

interface ICacheData {
	mvpExt: Float32Array;
	mvp: Float32Array;
	pipeline: GPURenderPipeline;
	uniformBuffer: GPUBuffer;
	attributesBuffers: GPUBuffer[];
	uniformBindGroup: GPUBindGroup;
	uniformMap: Map<any, IUniformSlot>;
	geometry: Geometry;
	material: IMaterial;
}

export class WebGPUMesh2Renderer implements IWebGPURenderer {
	public static readonly renderTypes = MESH2;
	public readonly renderTypes = MESH2;
	public camera: ICamera2;
	private entityCacheData: Map<IEntity, ICacheData> = new Map();

	public constructor(camera: ICamera2) {
		this.camera = camera;
	}

	clearCache() {
		this.entityCacheData.clear();
		return this;
	}

	render(entity: Object2, context: GPURendererContext): this {
		let cacheData = this.entityCacheData.get(entity);

		let mesh2 = entity.getComponent(RENDERABLE) as Mesh2;
		let material = mesh2.material;
		let geometry = mesh2.geometry;

		if (!cacheData || material.dirty || material !== cacheData.material || geometry !== cacheData.geometry) {
			cacheData = this.createCacheData(entity, context);
			this.entityCacheData.set(entity, cacheData);
		} else {
			// TODO update cache
			updateModelMatrixComponent(entity);
		}

		context.passEncoder.setPipeline(cacheData.pipeline);
		// passEncoder.setScissorRect(0, 0, 400, 225);
		// TODO 有多个attribute buffer
		for (let i = 0; i < cacheData.attributesBuffers.length; i++) {
			context.passEncoder.setVertexBuffer(i, cacheData.attributesBuffers[i]);
		}

		const mvp = cacheData.mvp;
		const mvpExt = cacheData.mvpExt;
		Matrix3.multiply(this.camera.projection.data,
			(Matrix3.invert(updateModelMatrixComponent(this.camera).data) as Float32Array), mvp);
		Matrix3.multiply(mvp, entity.worldMatrix.data, mvp);
		fromMatrix3MVP(mvp, mvpExt);

		context.device.queue.writeBuffer(
			cacheData.uniformBuffer,
			0,
			mvpExt.buffer,
			mvpExt.byteOffset,
			mvpExt.byteLength
		);

		cacheData.uniformMap.forEach((uniform, key) => {
			if (uniform.type === BUFFER && uniform.dirty) {
				context.device.queue.writeBuffer(
					key,
					0,
					uniform.value.buffer,
					uniform.value.byteOffset,
					uniform.value.byteLength
				);
				uniform.dirty = false;
			} else if (uniform.type === TEXTURE_IMAGE && (uniform.dirty || uniform.value.dirty)) {
				if (uniform.value.loaded) {
					if (uniform.value.data) {
						context.device.queue.copyExternalImageToTexture(
							{ source: uniform.value.data },
							{ texture: key },
							[uniform.value.data.width, uniform.value.data.height, 1]
						);
						uniform.value.dirty = uniform.dirty = false;
					}
				}
			}
		});

		context.passEncoder.setBindGroup(0, cacheData.uniformBindGroup);
		context.passEncoder.draw(geometry.count, 1, 0, 0);

		return this;
	}

	private createCacheData(entity: Object2, context: GPURendererContext): ICacheData {
		updateModelMatrixComponent(entity);
		let device = context.device;

		let uniformBuffer = device.createBuffer({
			size: 64,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		const mesh = entity.getComponent(RENDERABLE) as Mesh2;
		let buffers = [];
		let geometry = mesh.geometry;
		let material = mesh.material;
		let nodes = geometry.data as AttributesNodeData[];
		for (let i = 0; i < nodes.length; i++) {
			buffers.push(createVerticesBuffer(device, nodes[i].data));
		}

		let pipeline = this.createPipeline(geometry, material, context);
		let groupEntries: GPUBindGroupEntry[] = [{
			binding: 0,
			resource: {
				buffer: uniformBuffer,
			},
		}];

		let uniforms: IUniformSlot[] = material.data?.uniforms;
		let uniformMap = new Map();
		if (uniforms) {
			for (let i = 0; i < uniforms.length; i++) {
				let uniform = uniforms[i];
				if (uniform.type === BUFFER) {
					let buffer: GPUBuffer = device.createBuffer({
						size: uniform.value.length * 4,
						usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
					});
					uniformMap.set(buffer, uniform);
					groupEntries.push({
						binding: uniform.binding,
						resource: {
							buffer
						}
					});
				} else if (uniform.type === SAMPLER) {
					let sampler: GPUSampler = device.createSampler(uniform.value.data);
					uniformMap.set(sampler, uniform);
					groupEntries.push({
						binding: uniform.binding,
						resource: sampler
					});
				} else if (uniform.type === TEXTURE_IMAGE) {
					let texture: GPUTexture = uniform.value instanceof GPUTexture ? uniform.value : device.createTexture({
						size: [uniform.value.width || uniform.value.image.naturalWidth, uniform.value.height || uniform.value.image.naturalHeight, 1],
						format: 'rgba8unorm',
						usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
					});
					uniformMap.set(texture, uniform);
					groupEntries.push({
						binding: uniform.binding,
						resource: texture.createView()
					});
				}
			}
		}

		let uniformBindGroup = device.createBindGroup({
			layout: pipeline.getBindGroupLayout(0),
			entries: groupEntries,
		});

		return {
			mvpExt: new Matrix4(),
			mvp: new Matrix3(),
			attributesBuffers: buffers,
			uniformBuffer,
			uniformBindGroup,
			pipeline,
			uniformMap,
			material,
			geometry
		};
	}

	private createPipeline(geometry: Geometry, material: IMaterial, context: GPURendererContext) {
		const pipelineLayout = context.device.createPipelineLayout({
			bindGroupLayouts: [this.createBindGroupLayout(material, context)],
		});
		let vertexBuffers: GPUVertexBufferLayout[] = this.parseGeometryBufferLayout(geometry);

		let stages = this.createStages(material, vertexBuffers, context);

		let pipeline = context.device.createRenderPipeline({
			layout: pipelineLayout,
			vertex: stages.vertex,
			fragment: stages.fragment,
			primitive: {
				topology: geometry.topology,
				cullMode: geometry.cullMode,
				frontFace: geometry.frontFace,
			},
			depthStencil: {
				depthWriteEnabled: true,
				depthCompare: 'less',
				format: 'depth24plus',
			},
		});

		return pipeline;
	}

	private parseGeometryBufferLayout(geometry: Geometry) {
		let vertexBuffers: Array<GPUVertexBufferLayout> = [];
		let location = 0;
		for (let i = 0; i < geometry.data.length; i++) {
			let data = geometry.data[i];
			let attributeDescripters: GPUVertexAttribute[] = [];
			for (let j = 0; j < data.attributes.length; j++) {
				attributeDescripters.push({
					shaderLocation: location++,
					offset: data.attributes[j].offset * data.data.BYTES_PER_ELEMENT,
					format: "float32x" + data.attributes[j].length as GPUVertexFormat,
				});
			}
			vertexBuffers.push({
				arrayStride: geometry.data[i].stride * geometry.data[i].data.BYTES_PER_ELEMENT,
				attributes: attributeDescripters
			});
		}

		return vertexBuffers;
	}

	private createBindGroupLayout(material: IMaterial, context: GPURendererContext) {
		let uniforms: IUniformSlot[] = material.data.uniforms;
		let entries: GPUBindGroupLayoutEntry[] = [
			{
				binding: 0,
				visibility: GPUShaderStage.VERTEX,
				buffer: {
					type: 'uniform',
				}
			}
		];
		if (uniforms) {
			for (let i = 0; i < uniforms.length; i++) {
				if (uniforms[i].type === SAMPLER) {
					entries.push({
						visibility: GPUShaderStage.FRAGMENT,
						binding: uniforms[i].binding,
						sampler: {
							type: 'filtering'
						},
					});
				} else if (uniforms[i].type === TEXTURE_IMAGE) {
					entries.push({
						visibility: GPUShaderStage.FRAGMENT,
						binding: uniforms[i].binding,
						texture: {
							sampleType: 'float',
						},
					});
				} else {
					entries.push({
						visibility: GPUShaderStage.FRAGMENT,
						binding: uniforms[i].binding,
						buffer: {
							type: 'uniform',
						}
					});
				}

			}
		}
		return context.device.createBindGroupLayout({
			entries,
		});
	}

	private createStages(material: IMaterial, vertexBuffers: GPUVertexBufferLayout[], context: GPURendererContext): {
		vertex: GPUVertexState,
		fragment: GPUFragmentState
	} {
		let vertex = {
			module: context.device.createShaderModule({
				code: material.data.vertex,
			}),
			entryPoint: "main",
			buffers: vertexBuffers
		};
		let fragment = {
			module: context.device.createShaderModule({
				code: material.data.fragment,
			}),
			entryPoint: "main",
			targets: [
				{
					format: context.preferredFormat,
					blend: material?.data.blend
				}
			]
		};

		material.dirty = false;
		return {
			vertex,
			fragment
		};
	}
}

function fromMatrix3MVP(
	data: Float32Array | number[] | Matrix3,
	out = new Matrix4()
): Matrix4 {
	out[0] = data[0];
	out[1] = data[1];
	out[2] = 0;
	out[3] = 0;

	out[4] = data[3];
	out[5] = data[4];
	out[6] = 0;
	out[7] = 0;

	out[8] = 0;
	out[9] = 0;
	out[10] = 1;
	out[11] = 0;

	out[12] = data[6];
	out[13] = data[7];
	out[14] = 0;
	out[15] = 1;

	return out;
};
