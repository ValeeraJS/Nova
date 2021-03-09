import { Matrix4 } from "../math/matrix";
import Matrix4Component from "./Matrix4Component";

export default abstract class AbstractScale3 extends Matrix4Component {
    constructor(data = Matrix4.create()) {
        super('scale3', data);
    }
}
