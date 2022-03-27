import IComponent from "@valeera/x/src/interfaces/IComponent";
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
}
export default interface IMaterial extends IComponent<IShaderCode> {
}
