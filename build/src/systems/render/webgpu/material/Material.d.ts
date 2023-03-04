import { IMaterial, IShaderProgram, IUniformSlot } from "../../IMatrial";
export default class Material implements IMaterial {
    dirty: boolean;
    vertex: string;
    vertexShader: IShaderProgram;
    fragmentShader: IShaderProgram;
    blend: GPUBlendState;
    uniforms: IUniformSlot[];
    constructor(vertex: IShaderProgram, fragment: IShaderProgram, uniforms?: IUniformSlot[], blend?: GPUBlendState);
    get vertexCode(): string;
    set vertexCode(code: string);
    get fragmentCode(): string;
    set fragmentCode(code: string);
}
