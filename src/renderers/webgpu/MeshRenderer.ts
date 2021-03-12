import { Matrix4 } from "@valeera/mathx/src/matrix";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import Geometry3 from "../../components/geometry/Geometry3";
import WebGPUEngine from "../../engine/WebGPUEngine";
import IRenderer from "./IRenderer";

interface ICacheData {
	matrixM: Float32Array;
	pipeline: GPURenderPipeline;
	uniformBuffer: GPUBuffer;
}

export default class MeshRenderer implements IRenderer{
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
		} else {
			// TODO update cache
		}

		this.passEncoder.setPipeline(pipeline);
		this.passEncoder.setScissorRect(0, 0, 400, 225);
		for (let i = 0; i < mesh.geometry.nodes.length; i++) {
			this.passEncoder.setVertexBuffer(i, mesh.geometry.nodes[i].buffer.gpuBuffer);
		}

		const mvp = Matrix4.identity();

		

		Matrix4.multiply(camera.projectionMatrix, camera.viewMatrix, mvp);
		Matrix4.multiply(mvp, mesh.modelMatrix, mvp);

		this.device.queue.writeBuffer(
			mesh.uniformBuffer,
			0,
			mvp.buffer,
			mvp.byteOffset,
			mvp.byteLength
		);
		this.passEncoder.setBindGroup(0, mesh.uniformBindGroup);
		this.passEncoder.draw(mesh.geometry.length, 1, 0, 0);

		return this;
	}

	private createCacheData(mesh: IEntity): ICacheData {
		let matrixT = mesh.getComponent('position3')?.data || Matrix4.create();
		let matrixR = mesh.getComponent('rotation3')?.data || Matrix4.create();
		let matrixS = mesh.getComponent('scale3')?.data || Matrix4.create();
		let matrixM = Matrix4.create();
		Matrix4.multiply(matrixT, matrixR, matrixM);
		Matrix4.multiply(matrixM, matrixS, matrixM);

		let uniformBuffer = this.engine.device.createBuffer({
			size: 4 * 16,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});
		return {
			matrixM,
			uniformBuffer,
			pipeline: this.createPipeline(mesh),
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
                vertexBuffers: {
					arrayStride: 6 * geometry.data[0].data.BYTES_PER_ELEMENT as any,
					attributes:[{
						shaderLocation: 0,
						offset: 0,
						format: "float32x3"
					}]
				}
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
                code: ``,
            }),
            entryPoint: wgslShaders.vertex,
        };
        let fragmentStage = {
            module: this.engine.device.createShaderModule({
                code: ``,
            }),
            entryPoint: wgslShaders.fragment
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
		[[location(0)]] var<out> out_color : vec3<f32>;
		[[location(0)]] var<in> a_position : vec3<f32>;
		[[location(1)]] var<in> a_color : vec3<f32>;
		[[stage(vertex)]]
		fn main() -> void {
			out_position = uniforms.modelViewProjectionMatrix * vec4<f32>(a_position, 1.0);
			out_color = a_color;
			return;
		}
	`,
	fragment: `
		[[location(0)]] var<out> fragColor : vec4<f32>;
		[[location(0)]] var<in> in_color : vec3<f32>;
		[[stage(fragment)]]
		fn main() -> void {
			fragColor = vec4<f32>(in_color, 1.0);
			return;
		}
	`
};
