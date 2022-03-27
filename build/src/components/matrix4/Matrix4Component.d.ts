import Component from "@valeera/x/src/Component";
import IEntity from "@valeera/x/src/interfaces/IEntity";
export default class Matrix4Component extends Component<Float32Array> {
    data: Float32Array;
    constructor(name: string, data?: Float32Array);
}
export declare const updateModelMatrixComponent: (mesh: IEntity) => import("@valeera/x/src/interfaces/IComponent").default<any>;
