import Component from "@valeera/x/src/Component";
import { Matrix4 } from "@valeera/mathx";
import IEntity from "@valeera/x/src/interfaces/IEntity";
export default class Matrix4Component extends Component<Float32Array> {
    data: Float32Array;
    constructor(name: string, data?: Matrix4);
}
export declare const updateModelMatrixComponent: (mesh: IEntity) => Matrix4Component;
