import { Matrix4 } from "@valeera/mathx";
import type { Entity } from "@valeera/x";
import { Geometry, AttributesNodeData } from "../geometry/Geometry";
import { BUFFER, MESH3, RENDERABLE, SAMPLER, TEXTURE_IMAGE } from "../../../components/constants";
import { updateModelMatrixComponent } from "../../../components/matrix4/Matrix4Component";
import createVerticesBuffer from "./createVerticesBuffer";
import { GPURendererContext, IWebGPURenderer } from "./IWebGPURenderer";
import type { IMaterial, IUniformSlot } from "../IMatrial";
import { Camera3, ICamera3 } from "../../../entities/Camera3";
import { Object3 } from "../../../entities/Object3";
import { Mesh3 } from "../Mesh3";
import { WebGPUCacheObjectStore } from "./WebGPUCacheObjectStore";

interface ICacheData {
	mvp: Float32Array;
	pipeline: GPURenderPipeline;
	uniformBuffer: GPUBuffer;
	attributesBuffers: GPUBuffer[];
	uniformBindGroup: GPUBindGroup;
	uniformMap: Map<any, IUniformSlot<any>>;
	geometry: Geometry;
	material: IMaterial;
}

export class WebGPUMesh3Renderer implements IWebGPURenderer {
	public static readonly renderTypes = MESH3;
	public readonly renderTypes = MESH3;
	public camera: ICamera3;
	public vpMatrix = new Float32Array(16);

	private entityCacheData: Map<Entity, ICacheData> = new Map();

	public constructor(camera: ICamera3 = new Camera3()) {
		this.camera = camera;
	}

	clearCache() {
		this.entityCacheData.clear();
		return this;
	}

	beforeRender(): this {
		Matrix4.multiply(this.camera.projection.data,
			(Matrix4.invert(updateModelMatrixComponent(this.camera).data) as Float32Array), this.vpMatrix);

		return this;
	}

	render(entity: Object3, context: GPURendererContext): this {
		let cacheData = this.entityCacheData.get(entity);
		// 假设更换了几何体和材质则重新生成缓存
		const mesh3 = entity.getComponent(RENDERABLE) as Mesh3;
		const material = mesh3.material;
		const geometry = mesh3.geometry;

		// TODO 哪个改了更新对应cache
		if (!cacheData || material.dirty || material !== cacheData.material || geometry !== cacheData.geometry || geometry.dirty) {
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
		Matrix4.multiply(this.vpMatrix, entity.worldMatrix.data, mvp);

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
		context.passEncoder.draw(geometry.count, 1, 0, 0);

		return this;
	}

	private createCacheData(entity: Object3, context: GPURendererContext): ICacheData {
		updateModelMatrixComponent(entity);
		const device = context.device;

		const uniformBuffer = device.createBuffer({
			size: 64,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});
		const buffers = [];
		const mesh3 = entity.getComponent(RENDERABLE) as Mesh3;
		const geometry = mesh3.geometry;
		geometry.dirty = false;
		const material = mesh3.material;
		const nodes = geometry.data as AttributesNodeData[];
		for (let i = 0; i < nodes.length; i++) {
			buffers.push(createVerticesBuffer(device, nodes[i].data));
		}

		const pipeline = this.createPipeline(geometry, material, context);
		const groupEntries: GPUBindGroupEntry[] = [{
			binding: 0,
			resource: {
				buffer: uniformBuffer,
			},
		}];

		const uniforms: IUniformSlot<any>[] = material.uniforms;
		const uniformMap = new Map();
		if (uniforms) {
			for (let i = 0; i < uniforms.length; i++) {
				const uniform = uniforms[i];
				if (uniform.type === BUFFER) {
					const buffer: GPUBuffer = WebGPUCacheObjectStore.createGPUBufferCache(uniform.value, device).data;
					uniformMap.set(buffer, uniform);
					groupEntries.push({
						binding: uniform.binding,
						resource: {
							buffer
						}
					});
				} else if (uniform.type === SAMPLER) {
					const sampler = WebGPUCacheObjectStore.createGPUSamplerCache(uniform.value, device).data;
					uniformMap.set(sampler, uniform);
					groupEntries.push({
						binding: uniform.binding,
						resource: sampler
					});
				} else if (uniform.type === TEXTURE_IMAGE) {
					uniform.value.dirty = true;
					uniform.dirty = true;
					const texture = WebGPUCacheObjectStore.createGPUTextureCache(uniform.value, device).data;
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

	private createPipeline(geometry: Geometry, material: IMaterial, context: GPURendererContext) {
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
			depthStencil: material.depthStencil
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

	private createBindGroupLayout(material: IMaterial, context: GPURendererContext) {
		let uniforms: IUniformSlot<any>[] = material.uniforms;
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
						visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
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
			module: WebGPUCacheObjectStore.createGPUShaderModuleCache(material.vertexShader, context.device).data,
			entryPoint: material.vertexShader.entryPoint ?? "main",
			buffers: vertexBuffers
		};
		let fragment = {
			module: WebGPUCacheObjectStore.createGPUShaderModuleCache(material.fragmentShader, context.device).data,
			entryPoint: material.fragmentShader.entryPoint ?? "main",
			targets: [
				{
					format: context.preferredFormat,
					blend: material.blend
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
