import { Matrix4 } from "@valeera/mathx/src/matrix";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import Geometry3, { AttributesNodeData } from "../../components/geometry/Geometry3";
import { GEOMETRY_3D, MATERIAL, MODEL_3D, PROJECTION_3D } from "../../components/constants";
import { updateModelMatrixComponent } from "../../components/matrix4/Matrix4Component";
import WebGPUEngine from "../../engine/WebGPUEngine";
import createVerticesBuffer from "../../webgpu/createVerticesBuffer";
import IRenderer from "./IRenderer";
import { IUniformSlot } from "../../components/material/IMatrial";

interface ICacheData {
	mvp: Float32Array;
	pipeline: GPURenderPipeline;
	uniformBuffer: GPUBuffer;
	attributesBuffers: GPUBuffer[];
	uniformBindGroup: GPUBindGroup;
	uniformMap: Map<any, IUniformSlot>;
}

export default class MeshRenderer implements IRenderer {
	public static readonly renderTypes = "mesh";
	public readonly renderTypes = "mesh";
	private entityCacheData: WeakMap<IEntity, ICacheData> = new WeakMap();
	engine: WebGPUEngine;
	public constructor(engine: WebGPUEngine) {
		this.engine = engine;
	}

	render(mesh: IEntity, camera: IEntity, passEncoder: GPURenderPassEncoder, scissor?: any): this {
		let cacheData = this.entityCacheData.get(mesh);
		if (!cacheData) {
			cacheData = this.createCacheData(mesh);
			this.entityCacheData.set(mesh, cacheData);
		} else {
			// TODO update cache
			updateModelMatrixComponent(mesh);
		}

		passEncoder.setPipeline(cacheData.pipeline);
		// passEncoder.setScissorRect(0, 0, 400, 225);
		// TODO 有多个attribute buffer
		for (let i = 0; i < cacheData.attributesBuffers.length; i++) {
			passEncoder.setVertexBuffer(i, cacheData.attributesBuffers[i]);
		}

		const mvp = cacheData.mvp;
		// TODO 视图矩阵
		Matrix4.multiply(camera.getComponent(PROJECTION_3D)?.data,
			(Matrix4.invert(updateModelMatrixComponent(camera).data) as Float32Array), mvp);
		Matrix4.multiply(mvp, mesh.getComponent(MODEL_3D)?.data, mvp);

		this.engine.device.queue.writeBuffer(
			cacheData.uniformBuffer,
			0,
			mvp.buffer,
			mvp.byteOffset,
			mvp.byteLength
		);

		cacheData.uniformMap.forEach((uniform, key) => {
			if (uniform.type === "uniform-buffer" && uniform.dirty) {
				this.engine.device.queue.writeBuffer(
					key,
					0,
					uniform.value.buffer,
					uniform.value.byteOffset,
					uniform.value.byteLength
				);
				uniform.dirty = false;
			} else if (uniform.type === "sampled-texture" && (uniform.dirty || uniform.value.dirty)) {
				// console.log(uniform);
				if (uniform.value.loaded) {
					if (uniform.value.data) {
						this.engine.device.queue.copyImageBitmapToTexture(
							{ imageBitmap: uniform.value.data },
							{ texture: key },
							[uniform.value.data.width, uniform.value.data.height, 1]
						);
						uniform.dirty = false;
					}
				}
			}
		});

		passEncoder.setBindGroup(0, cacheData.uniformBindGroup);
		passEncoder.draw((mesh.getComponent(GEOMETRY_3D) as Geometry3).count, 1, 0, 0);

		return this;
	}

	private createCacheData(mesh: IEntity): ICacheData {
		updateModelMatrixComponent(mesh);
		let device = this.engine.device;

		let uniformBuffer = device.createBuffer({
			size: 64,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});
		let buffers = [];
		let nodes = mesh.getComponent(GEOMETRY_3D)?.data as AttributesNodeData[];
		for (let i = 0; i < nodes.length; i++) {
			buffers.push(createVerticesBuffer(device, nodes[i].data));
		}

		let pipeline = this.createPipeline(mesh);
		let groupEntries: GPUBindGroupEntry[] = [{
			binding: 0,
			resource: {
				buffer: uniformBuffer,
			},
		}];

		let uniforms: IUniformSlot[] = mesh.getComponent(MATERIAL)?.data?.uniforms;
		let uniformMap = new Map();
		if (uniforms) {
			for (let i = 0; i < uniforms.length; i++) {
				let uniform = uniforms[i];
				if (uniform.type === "uniform-buffer") {
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
				} else if (uniform.type === "sampler") {
					let sampler: GPUSampler = device.createSampler(uniform.value);
					uniformMap.set(sampler, uniform);
					groupEntries.push({
						binding: uniform.binding,
						resource: sampler
					});
				} else if (uniform.type === "sampled-texture") {
					let texture: GPUTexture = device.createTexture({
						size: [uniform.value?.width || uniform.value.image.naturalWidth, uniform.value?.height || uniform.value.image.naturalHeight, 1],
						format: 'rgba8unorm',
						usage: GPUTextureUsage.SAMPLED | GPUTextureUsage.COPY_DST,
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
			mvp: new Float32Array(16),
			attributesBuffers: buffers,
			uniformBuffer,
			uniformBindGroup,
			pipeline,
			uniformMap
		}
	}

	private createPipeline(mesh: IEntity) {
		const pipelineLayout = this.engine.device.createPipelineLayout({
			bindGroupLayouts: [this.createBindGroupLayout(mesh)],
		});
		let stages = this.createStages(mesh);
		let geometry = mesh.getComponent(GEOMETRY_3D) as Geometry3;

		let vertexBuffers: Array<GPUVertexBufferLayoutDescriptor> = [];
		let location = 0;
		for (let i = 0; i < geometry.data.length; i++) {
			let data = geometry.data[i];
			let attributeDescripters: GPUVertexAttributeDescriptor[] = [];
			for (let j = 0; j < data.attributes.length; j++) {
				attributeDescripters.push({
					shaderLocation: location++,
					offset: data.attributes[j].offset * data.data.BYTES_PER_ELEMENT,
					format: "float32x" + data.attributes[j].length as GPUVertexFormat,
				});
			}
			vertexBuffers.push({
				arrayStride: geometry.data[i].stride * geometry.data[i].data.BYTES_PER_ELEMENT as any,
				attributes: attributeDescripters
			});
		}

		let pipeline = this.engine.device.createRenderPipeline({
			layout: pipelineLayout,
			vertexStage: stages[0],
			fragmentStage: stages[1],
			primitiveTopology: geometry.topology,
			colorStates: [
				{
					format: "bgra8unorm"
				}
			],
			depthStencilState: {
				depthWriteEnabled: true,
				depthCompare: 'less',
				format: 'depth24plus-stencil8',
			},
			rasterizationState: {
				cullMode: geometry.cullMode,
			},
			vertexState: {
				vertexBuffers
			},
		});

		return pipeline;
	}

	private createBindGroupLayout(mesh: IEntity) {
		let uniforms: IUniformSlot[] = mesh.getComponent(MATERIAL)?.data?.uniforms;
		let entries: GPUBindGroupLayoutEntry[] = [
			{
				binding: 0,
				visibility: GPUShaderStage.VERTEX,
				type: 'uniform-buffer',
			}
		];
		if (uniforms) {
			for (let i = 0; i < uniforms.length; i++) {
				entries.push({
					visibility: GPUShaderStage.FRAGMENT,
					binding: uniforms[i].binding,
					type: uniforms[i].type as any,
				});
			}
		}
		return this.engine.device.createBindGroupLayout({
			entries,
		});
	}

	private createStages(mesh: IEntity) {
		const material = mesh.getComponent(MATERIAL);
		let vertexStage = {
			module: this.engine.device.createShaderModule({
				code: material?.data.vertex || wgslShaders.vertex,
			}),
			entryPoint: "main",
		};
		let fragmentStage = {
			module: this.engine.device.createShaderModule({
				code: material?.data.fragment || wgslShaders.fragment,
			}),
			entryPoint: "main"
		};
		return [vertexStage, fragmentStage];
	}
}

const wgslShaders = {
	vertex: `
		[[block]] struct Uniforms {
			[[offset(0)]] modelViewProjectionMatrix : mat4x4<f32>;
	  	};
	  	[[binding(0), group(0)]] var<uniform> uniforms : Uniforms;

		[[builtin(position)]] var<out> out_position : vec4<f32>;
		[[location(0)]] var<in> a_position : vec3<f32>;

		[[stage(vertex)]] fn main() -> void {
			out_position = uniforms.modelViewProjectionMatrix * vec4<f32>(a_position, 1.0);
			return;
		}
	`,
	fragment: `
		[[location(0)]] var<out> fragColor : vec4<f32>;

		[[stage(fragment)]] fn main() -> void {
			fragColor = vec4<f32>(1., 1., 1., 1.0);
			return;
		}
	`
};
