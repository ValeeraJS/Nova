import { Matrix4 } from "@valeera/mathx";
import { ComponentTag, Component } from "@valeera/x";
import { IObject3 } from "../../entities/Object3";
export default class Matrix4Component extends Component<Float32Array> {
    constructor(name: string, data?: Matrix4, tags?: ComponentTag[]);
}
export declare const updateModelMatrixComponent: (obj3: IObject3) => Matrix4Component;
