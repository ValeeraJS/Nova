import { Component, ComponentTag } from "@valeera/x";
import { Matrix3 } from "@valeera/mathx";
import { IObject3 } from "../../entities/Object3";
export default class Matrix3Component extends Component<Float32Array> {
    constructor(name: string, data?: Matrix3, tags?: ComponentTag[]);
}
export declare const updateModelMatrixComponent: (mesh: IObject3) => import("..").Matrix4Component;
