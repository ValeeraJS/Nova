import IComponent from "@valeera/x/src/interfaces/IComponent";

export interface IShaderCode {
    vertex: string;
    fragment: string;
}

export default interface IMaterial extends IComponent<IShaderCode> {}