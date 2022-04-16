import { Matrix4 } from "@valeera/mathx/src/matrix";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import Geometry3, { AttributesNodeData } from "../../components/geometry/Geometry3";
import { GEOMETRY_3D, MATERIAL, MODEL_3D, PROJECTION_3D } from "../../components/constants";
import { updateModelMatrixComponent } from "../../components/matrix4/Matrix4Component";
import createVerticesBuffer from "./createVerticesBuffer";
import IWebGLRenderer from "./IWebGLRenderer";
import { IUniformSlot } from "../../components/material/IMatrial";
import WebGLEngine from "../../engine/WebGLEngine";

interface ICacheData {
	mvp: Float32Array;
	pipeline: any;
	uniformBuffer: WebGLBuffer;
	attributesBuffers: WebGLBuffer[];
	uniformBindGroup: any;
	uniformMap: Map<any, IUniformSlot>;
}

export default class MeshRenderer implements IWebGLRenderer {
	public static readonly renderTypes = "mesh";
	public readonly renderTypes = "mesh";
	private entityCacheData: WeakMap<IEntity, ICacheData> = new WeakMap();
	engine: WebGLEngine;
	public constructor(engine: WebGLEngine) {
		this.engine = engine;
	}

	render(mesh: IEntity, camera: IEntity, _scissor?: any): this {
		let gl = this.engine.context;
		let cacheData = this.entityCacheData.get(mesh);
		if (!cacheData) {
			cacheData = this.createCacheData(mesh);
			this.entityCacheData.set(mesh, cacheData);
		} else {
			// TODO update cache
			updateModelMatrixComponent(mesh);
		}

		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK)

		// TODO 有多个attribute buffer
		for (let i = 0; i < cacheData.attributesBuffers.length; i++) {
			gl.enableVertexAttribArray(i);
			gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 0, 0);
		}

		gl.useProgram(cacheData.pipeline.program);

		const mvp = cacheData.mvp;
		Matrix4.multiply(camera.getComponent(PROJECTION_3D)?.data,
			(Matrix4.invert(updateModelMatrixComponent(camera).data) as Float32Array), mvp);
		Matrix4.multiply(mvp, mesh.getComponent(MODEL_3D)?.data, mvp);

		var mvpLocation = gl.getUniformLocation(cacheData.pipeline.program, "mvpMatrix");
		gl.uniformMatrix4fv(mvpLocation, false, mvp);

		cacheData.uniformMap.forEach((_uniform, _key) => {
			// if (uniform.type === "uniform-buffer" && uniform.dirty) {
			// 	this.engine.device.queue.writeBuffer(
			// 		key,
			// 		0,
			// 		uniform.value.buffer,
			// 		uniform.value.byteOffset,
			// 		uniform.value.byteLength
			// 	);
			// 	uniform.dirty = false;
			// } else if (uniform.type === "sampled-texture" && (uniform.dirty || uniform.value.dirty)) {
			// 	if (uniform.value.loaded) {
			// 		if (uniform.value.data) {
			// 			this.engine.device.queue.copyImageBitmapToTexture(
			// 				{ imageBitmap: uniform.value.data },
			// 				{ texture: key },
			// 				[uniform.value.data.width, uniform.value.data.height, 1]
			// 			);
			// 			uniform.dirty = false;
			// 		}
			// 	}
			// }
		});

		// passEncoder.setBindGroup(0, cacheData.uniformBindGroup);
		// passEncoder.draw((mesh.getComponent(GEOMETRY_3D) as Geometry3).count, 1, 0, 0);

		gl.drawArrays(gl.TRIANGLES, 0, (mesh.getComponent(GEOMETRY_3D) as Geometry3).count);

		return this;
	}

	private createCacheData(mesh: IEntity): ICacheData {
		updateModelMatrixComponent(mesh);
		let gl = this.engine.context;

		let uniformBuffer = gl.createBuffer() as WebGLBuffer;
		let buffers = [];
		let nodes = mesh.getComponent(GEOMETRY_3D)?.data as AttributesNodeData[];
		for (let i = 0; i < nodes.length; i++) {
			buffers.push(createVerticesBuffer(gl, nodes[i].data));
		}

		let pipeline = this.createPipeline(mesh);
		let groupEntries: any[] = [{
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
					let buffer: WebGLBuffer = gl.createBuffer() as WebGLBuffer;
					uniformMap.set(buffer, uniform);
					groupEntries.push({
						binding: uniform.binding,
						resource: {
							buffer
						}
					});
				} else if (uniform.type === "sampler") {
					// let sampler: GPUSampler = gl.createSampler(uniform.value);
					// uniformMap.set(sampler, uniform);
					// groupEntries.push({
					// 	binding: uniform.binding,
					// 	resource: sampler
					// });

					// console.log(sampler)
				} else if (uniform.type === "sampled-texture") {
					// let texture: GPUTexture = gl.createTexture({
					// 	size: [uniform.value.width || uniform.value.image.naturalWidth, uniform.value.height || uniform.value.image.naturalHeight, 1],
					// 	format: 'rgba8unorm',
					// 	usage: GPUTextureUsage.SAMPLED | GPUTextureUsage.COPY_DST,
					// });
					// uniformMap.set(texture, uniform);
					// groupEntries.push({
					// 	binding: uniform.binding,
					// 	resource: texture.createView()
					// });
				}
			}
		}

		let uniformBindGroup = {
			layout: pipeline.layout.bindGroupLayouts[0],
			entries: groupEntries,
		};

		console.log(uniformBindGroup);

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
		const pipelineLayout = {
			bindGroupLayouts: [this.createBindGroupLayout(mesh)],
		};
		let [vShader, fShader] = this.createStages(mesh);
		let gl = this.engine.context;
		const program = gl.createProgram() as WebGLProgram;
		gl.attachShader(program, vShader);
		gl.attachShader(program, fShader);
		gl.linkProgram(program);

		let geometry = mesh.getComponent(GEOMETRY_3D) as Geometry3;

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
				arrayStride: geometry.data[i].stride * geometry.data[i].data.BYTES_PER_ELEMENT as any,
				attributes: attributeDescripters
			});
		}

		let pipeline = {
			program,
			layout: pipelineLayout,
			vertexStage: vShader,
			fragmentStage: fShader,
			primitiveTopology: geometry.topology,
			colorStates: [
				{
					format: "bgra8unorm",
					blend: {
						operation: "add",
					}
				}
			],
			depthStencilState: {
				depthWriteEnabled: true,
				depthCompare: 'always',
				format: 'depth24plus-stencil8',
			},
			rasterizationState: {
				cullMode: geometry.cullMode,
			},
			vertexState: {
				vertexBuffers
			},
		};

		return pipeline;
	}

	private createBindGroupLayout(mesh: IEntity) {
		let uniforms: IUniformSlot[] = mesh.getComponent(MATERIAL)?.data?.uniforms;
		let entries: GPUBindGroupLayoutEntry[] = [
			{
				binding: 0,
				visibility: GPUShaderStage.VERTEX,
			}
		];
		if (uniforms) {
			for (let i = 0; i < uniforms.length; i++) {
				entries.push({
					visibility: GPUShaderStage.FRAGMENT,
					binding: uniforms[i].binding,
					// type: uniforms[i].type as any,
				});
			}
		}
		return {
			entries,
		};
	}

	private createStages(mesh: IEntity) {
		const material = mesh.getComponent(MATERIAL);
		const gl = this.engine.context;
		var vShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
		var fShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;

		gl.shaderSource(vShader, material?.data.vertex || glslShaders.vertex);
		gl.shaderSource(fShader, material?.data.fragment || glslShaders.fragment);

		gl.compileShader(vShader);
		if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
			console.error("Error vs:", gl.getShaderInfoLog(vShader));
		}

		gl.compileShader(fShader);
		if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
			console.error("Error fs:", gl.getShaderInfoLog(fShader));
		}
		return [vShader, fShader];
	}
}

const glslShaders = {
	vertex: `
		precision mediump float;

		attribute vec3 verPosition;
		uniform mat4 mvpMatrix;
	
		void main(){
			gl_Position= mvpMatrix * vec4(verPosition, 1.0);
		}
	`,
	fragment: `
		precision mediump float;

		void main(){
			gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
		}
	`
};
