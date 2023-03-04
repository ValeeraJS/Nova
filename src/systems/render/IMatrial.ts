import { IShaderProgram } from "./ShaderProgram";

export interface IUniformSlot {
    name: string;
    value: any;
    binding: number;
    dirty: boolean;
    type: string;
    buffer?: any;
}

export interface IMaterial {
    vertexShader: IShaderProgram;
    fragmentShader: IShaderProgram;
    uniforms: IUniformSlot[];
    blend: GPUBlendState;
    dirty: boolean;
}
