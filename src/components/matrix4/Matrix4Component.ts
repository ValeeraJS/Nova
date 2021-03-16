import Component from "@valeera/x/src/Component";
import { Matrix4 } from "@valeera/mathx";

export default class Matrix4Component extends Component<Float32Array> {
    data!: Float32Array;
    constructor(name: string, data = Matrix4.create()) {
        super(name, data);
        this.dirty = true;
    }
}