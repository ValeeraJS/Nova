import { Component } from "@valeera/x/src";
import IMaterial, { IShaderCode } from "./IMatrial";

export default class ShaderMaterial extends Component<IShaderCode> implements IMaterial {
    constructor(vertex: string, fragment: string) {
        super("material", { vertex, fragment });
        this.dirty = true;
    }
}
