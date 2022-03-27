import { Component } from "@valeera/x/src";
import IMaterial, { IShaderCode } from "./IMatrial";
export default class ColorMaterial extends Component<IShaderCode> implements IMaterial {
    constructor(color?: Float32Array);
    setColor(r: number, g: number, b: number, a: number): this;
}
