import { Sampler } from "./Sampler";
import { IShaderProgram } from "./ShaderProgram";
import { Texture } from "./texture";

export interface IUniformSlot<T> {
    name: string;
    value: T;
    binding: number;
    dirty: boolean;
    type: string;
}

export interface IUniformSlotSampler extends IUniformSlot<Sampler> {}
export interface IUniformSlotTexture extends IUniformSlot<Texture> {}
export interface IUniformSlotBuffer extends IUniformSlot<any> {
    buffer: any;
}

export interface IMaterial {
    vertexShader: IShaderProgram;
    fragmentShader: IShaderProgram;
    uniforms: IUniformSlot<any>[];
    blend: GPUBlendState;
    dirty: boolean;
    depthStencil: GPUDepthStencilState;
}
