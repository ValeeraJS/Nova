import { Component } from "@valeera/x";
import { Matrix3 } from "@valeera/mathx";
import { IObject2 } from "../../entities/Object2";
export interface ComponentTag {
    readonly label: string;
    readonly unique: boolean;
}
export default class Matrix3Component extends Component<Float32Array> {
    constructor(name: string, data?: Matrix3, tags?: ComponentTag[]);
}
export declare const updateModelMatrixComponent: (mesh: IObject2) => Matrix3Component;
