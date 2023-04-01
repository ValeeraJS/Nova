import { IMaterial, IUniformSlot } from "../../IMatrial";
import { IShaderProgram } from "../../ShaderProgram";
export declare class Material implements IMaterial {
    dirty: boolean;
    vertex: string;
    vertexShader: IShaderProgram;
    fragmentShader: IShaderProgram;
    blend: GPUBlendState;
    uniforms: IUniformSlot<any>[];
    constructor(vertex: IShaderProgram, fragment: IShaderProgram, uniforms?: IUniformSlot<any>[], blend?: GPUBlendState);
    get vertexCode(): string;
    set vertexCode(code: string);
    get fragmentCode(): string;
    set fragmentCode(code: string);
}
