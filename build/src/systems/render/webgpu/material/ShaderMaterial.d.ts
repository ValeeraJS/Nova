import { IUniformSlot } from "../../IMatrial";
import { Material } from "./Material";
export declare class ShaderMaterial extends Material {
    constructor(vertex: string, fragment: string, uniforms?: IUniformSlot<any>[], blend?: GPUBlendState);
}
