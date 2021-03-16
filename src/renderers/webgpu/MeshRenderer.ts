import { Matrix4 } from "@valeera/mathx/src/matrix";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import Geometry3 from "../../components/geometry/Geometry3";
import WebGPUEngine from "../../engine/WebGPUEngine";
import createVerticesBuffer from "../../webgpu/createVerticesBuffer";
import IRenderer from "./IRenderer";

interface ICacheData {
	matrixM: Float32Array;
	pipeline: GPURenderPipeline;
	uniformBuffer: GPUBuffer;
	attributesBuffer: GPUBuffer;
	uniformBindGroup: GPUBindGroup;
}

export default class MeshRenderer implements IRenderer {
	public static readonly renderTypes = "mesh";
	public readonly renderTypes = "mesh";
	private entityCacheData: WeakMap<IEntity, ICacheData> = new WeakMap();
	engine: WebGPUEngine;
	public constructor(engine: WebGPUEngine) {
		this.engine = engine;
	}

	private getModelMatrix(mesh: IEntity, matrixM: Float32Array) {
		let p3 = mesh.getComponent('position3');
		let r3 = mesh.getComponent('rotation3');
		let s3 = mesh.getComponent('scale3');
		if (p3?.dirty || r3?.dirty || s3?.dirty) {
			let matrixT = p3?.data || Matrix4.create();
			let matrixR = r3?.data || Matrix4.create();
			let matrixS = s3?.data || Matrix4.create();
			Matrix4.multiply(matrixT, matrixR, matrixM);
			Matrix4.multiply(matrixM, matrixS, matrixM);
			
			if (p3) {
				p3.dirty = false;
			}
			if (r3) {
				r3.dirty = false;
			}
			if (s3) {
				s3.dirty = false;
			}
		}

		return matrixM;
	}

	render(mesh: IEntity, camera: IEntity, passEncoder: GPURenderPassEncoder, scissor?: any): this {
		let cacheData = this.entityCacheData.get(mesh);
		if (!cacheData) {
			cacheData = this.createCacheData(mesh);
			this.entityCacheData.set(mesh, cacheData);
		} else {
			// TODO update cache
			let matrixM = cacheData.matrixM;
			this.getModelMatrix(mesh, matrixM);
		}

		passEncoder.setPipeline(cacheData.pipeline);
		// passEncoder.setScissorRect(0, 0, 400, 225);
		// TODO 有多个attribute buffer
		passEncoder.setVertexBuffer(0, cacheData.attributesBuffer);

		const mvp = Matrix4.identity();
		// TODO 视图矩阵
		Matrix4.multiply(camera.getComponent("projection3")?.data, Matrix4.create(), mvp);
		Matrix4.multiply(mvp, cacheData.matrixM, mvp);

		this.engine.device.queue.writeBuffer(
			cacheData.uniformBuffer,
			0,
			mvp.buffer,
			mvp.byteOffset,
			mvp.byteLength
		);

		passEncoder.setBindGroup(0, cacheData.uniformBindGroup);
		passEncoder.draw((mesh.getComponent("geometry3") as Geometry3).count, 1, 0, 0);

		return this;
	}

	private createCacheData(mesh: IEntity): ICacheData {
		let matrixM = Matrix4.create();
		this.getModelMatrix(mesh, matrixM);

		let uniformBuffer = this.engine.device.createBuffer({
			size: 4 * 16,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});
		// TODO
		let attributesBuffer = createVerticesBuffer(this.engine.device, mesh.getComponent('geometry3')?.data[0].data);

		let pipeline = this.createPipeline(mesh);
		let uniformBindGroup = this.engine.device.createBindGroup({
			layout: pipeline.getBindGroupLayout(0),
			entries: [
				{
					binding: 0,
					resource: {
						buffer: uniformBuffer,
					},
				}
			],
		});

		// console.log(pipeline);
		return {
			attributesBuffer,
			matrixM,
			uniformBuffer,
			uniformBindGroup,
			pipeline,
		}
	}

	private createPipeline(mesh: IEntity) {
		const pipelineLayout = this.engine.device.createPipelineLayout({
			bindGroupLayouts: [this.createBindGroupLayout()],
		});
		let stages = this.createStages();
		let geometry = mesh.getComponent('geometry3') as Geometry3;
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
				vertexBuffers: [{
					arrayStride: geometry.data[0].stride * geometry.data[0].data.BYTES_PER_ELEMENT as any,
					attributes: [{
						shaderLocation: 0,
						offset: geometry.data[0].attributes[0].offset,
						format: "float32x" + geometry.data[0].attributes[0].length,
					}]
				}]
			} as any,
		});

		return pipeline;
	}

	private createBindGroupLayout() {
		return this.engine.device.createBindGroupLayout({
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX,
					type: 'uniform-buffer',
				}
			],
		});
	}

	private createStages() {
		let vertexStage = {
			module: this.engine.device.createShaderModule({
				code: wgslShaders.vertex,
			}),
			entryPoint: "main",
		};
		let fragmentStage = {
			module: this.engine.device.createShaderModule({
				code: wgslShaders.fragment,
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
