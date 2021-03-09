import { Matrix4 } from "../math/matrix";
import Matrix4Component from "./Matrix4Component";

export default abstract class AbstractRotation3 extends Matrix4Component {
    constructor(data = Matrix4.create()) {
        super('rotation3', data);
    }
}
