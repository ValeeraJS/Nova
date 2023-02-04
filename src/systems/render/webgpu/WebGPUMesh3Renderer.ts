import { Matrix4 } from "@valeera/mathx";
import { IEntity } from "@valeera/x";
import Geometry, { AttributesNodeData } from "../../../components/geometry/Geometry";
import { BUFFER, GEOMETRY, MATERIAL, MESH3, SAMPLER, TEXTURE_IMAGE } from "../../../components/constants";
import { updateModelMatrixComponent } from "../../../components/matrix4/Matrix4Component";
import createVerticesBuffer from "./createVerticesBuffer";
import { GPURendererContext, IWebGPURenderer } from "./IWebGPURenderer";
import { IUniformSlot } from "../../../components/material/IMatrial";
import Material from "../../../components/material/Material";
import { ICamera3 } from "../../../entities/Camera3";
import Object3 from "../../../entities/Object3";
import { DEFAULT_MATERIAL3 } from "../../../components/material/defaultMaterial";

interface ICacheData {
	mvp: Float32Array;
	pipeline: GPURenderPipeline;
	uniformBuffer: GPUBuffer;
	attributesBuffers: GPUBuffer[];
	uniformBindGroup: GPUBindGroup;
	uniformMap: Map<any, IUniformSlot>;
	geometry: Geometry;
	material: Material;
}

export class WebGPUMesh3Renderer implements IWebGPURenderer {
	public static readonly renderTypes = MESH3;
	public readonly renderTypes = MESH3;
	public camera: ICamera3;
	private entityCacheData: Map<IEntity, ICacheData> = new Map();
	public constructor(camera: ICamera3) {
		this.camera = camera;
	}

	clearCache() {
		this.entityCacheData.clear();
		return this;
	}

	render(mesh: Object3, context: GPURendererContext): this {

		let cacheData = this.entityCacheData.get(mesh);
		// 假设更换了几何体和材质则重新生成缓存
		let material = mesh.getFirstComponentByTagLabel(MATERIAL) || DEFAULT_MATERIAL3;
		let geometry = mesh.getFirstComponentByTagLabel(GEOMETRY);

		if (!cacheData || mesh.getFirstComponentByTagLabel(MATERIAL)?.dirty || material !== cacheData.material || geometry !== cacheData.geometry || geometry.dirty) {
			cacheData = this.createCacheData(mesh, context);
			this.entityCacheData.set(mesh, cacheData);
		} else {
			// TODO update cache
			updateModelMatrixComponent(mesh);
		}

		context.passEncoder.setPipeline(cacheData.pipeline);
		// passEncoder.setScissorRect(0, 0, 400, 225);
		// TODO 有多个attribute buffer
		for (let i = 0; i < cacheData.attributesBuffers.length; i++) {
			context.passEncoder.setVertexBuffer(i, cacheData.attributesBuffers[i]);
		}

		const mvp = cacheData.mvp;
		Matrix4.multiply(this.camera.projection.data,
			(Matrix4.invert(updateModelMatrixComponent(this.camera).data) as Float32Array), mvp);
		Matrix4.multiply(mvp, mesh.worldMatrix.data, mvp);

		context.device.queue.writeBuffer(
			cacheData.uniformBuffer,
			0,
			mvp.buffer,
			mvp.byteOffset,
			mvp.byteLength
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
				if (uniform.value.loaded !== false) {
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
		context.passEncoder.draw((mesh.getFirstComponentByTagLabel(GEOMETRY) as Geometry).count, 1, 0, 0);

		return this;
	}

	private createCacheData(mesh: Object3, context: GPURendererContext): ICacheData {
		updateModelMatrixComponent(mesh);
		let device = context.device;

		let uniformBuffer = device.createBuffer({
			size: 64,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});
		let buffers = [];
		let geometry = mesh.getFirstComponentByTagLabel(GEOMETRY) as Geometry;
		geometry.dirty = true;
		let material = mesh.getFirstComponentByTagLabel(MATERIAL) as Material || DEFAULT_MATERIAL3;
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

		let uniforms: IUniformSlot[] = mesh.getFirstComponentByTagLabel(MATERIAL)?.data?.uniforms;
		let uniformMap = new Map();
		if (uniforms) {
			for (let i = 0; i < uniforms.length; i++) {
				const uniform = uniforms[i];
				if (uniform.type === BUFFER) {
					const buffer: GPUBuffer = device.createBuffer({
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
					const sampler: GPUSampler = device.createSampler(uniform.value.data);
					uniformMap.set(sampler, uniform);
					groupEntries.push({
						binding: uniform.binding,
						resource: sampler
					});
				} else if (uniform.type === TEXTURE_IMAGE) {
					uniform.value.dirty = true;
					uniform.dirty = true;
					const texture: GPUTexture = uniform.value instanceof GPUTexture ? uniform.value : device.createTexture({
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

		const uniformBindGroup = device.createBindGroup({
			layout: pipeline.getBindGroupLayout(0),
			entries: groupEntries,
		});

		return {
			mvp: new Float32Array(16),
			attributesBuffers: buffers,
			uniformBuffer,
			uniformBindGroup,
			pipeline,
			uniformMap,
			material,
			geometry
		}
	}

	private createPipeline(geometry: Geometry, material: Material, context: GPURendererContext) {
		const pipelineLayout = context.device.createPipelineLayout({
			bindGroupLayouts: [this.createBindGroupLayout(material, context)],
		});
		const vertexBuffers: GPUVertexBufferLayout[] = this.parseGeometryBufferLayout(geometry);
		const stages = this.createStages(material, vertexBuffers, context);
		const des: GPURenderPipelineDescriptor = {
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
			}
		};
		if (context.multisample) {
			des.multisample = context.multisample;
		}
		return context.device.createRenderPipeline(des);
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

	private createBindGroupLayout(material: Material, context: GPURendererContext) {
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

	private createStages(material: Material, vertexBuffers: GPUVertexBufferLayout[], context: GPURendererContext): {
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
