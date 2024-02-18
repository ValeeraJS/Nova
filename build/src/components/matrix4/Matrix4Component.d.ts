import { Matrix4 } from "@valeera/mathx";
import { Component } from "@valeera/x";
import { IObject3 } from "../../entities/Object3";
export interface ComponentTag {
    readonly label: string;
    readonly unique: boolean;
}
export default class Matrix4Component extends Component<Float32Array> {
    constructor(data: Matrix4, tags: ComponentTag[], name: string);
}
export declare const updateModelMatrixComponent: (obj3: IObject3) => Matrix4Component;
