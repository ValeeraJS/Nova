import { IComponent } from "@valeera/x";
export interface IUniformSlot {
    name: string;
    value: any;
    binding: number;
    dirty: boolean;
    type: string;
    buffer?: any;
}
export interface IShaderCode {
    vertex: string;
    fragment: string;
    uniforms: IUniformSlot[];
    blend: GPUBlendState;
}
export interface IMaterial extends IComponent<IShaderCode> {
}
