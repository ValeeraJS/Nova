import Component from "@valeera/x/src/Component";
import { Matrix4 } from "../../math/matrix";

export default class Matrix4Component extends Component<Float32Array> {
    constructor(name: string, data = Matrix4.create()) {
        super(name, data);
    }
}