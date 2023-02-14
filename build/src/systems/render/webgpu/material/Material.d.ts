import { Component } from "@valeera/x";
import { IMaterial, IShaderCode, IUniformSlot } from "./IMatrial";
export default class Material extends Component<IShaderCode> implements IMaterial {
    tags: {
        label: string;
        unique: boolean;
    }[];
    constructor(vertex: string, fragment: string, uniforms?: IUniformSlot[], blend?: GPUBlendState);
    get blend(): GPUBlendState;
    set blend(blend: GPUBlendState);
    get vertexShader(): string;
    set vertexShader(code: string);
    get fragmentShader(): string;
    set fragmentShader(code: string);
}
