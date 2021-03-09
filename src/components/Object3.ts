import Component from "@valeera/x/src/Component";
import { Matrix4 } from "../math/matrix";
import Matrix4Component from "./matrix4/Matrix4Component";

export default class Object3 extends Component<string>{
    scaling: Matrix4Component;
    position: Matrix4Component;
    rotation: Matrix4Component;
    constructor(scaling: Matrix4Component, rotation: Matrix4Component, position: Matrix4Component) {
        super('modelMatrix', Matrix4.identity());
        this.scaling = scaling;
        this.position = position;
        this.rotation = rotation;
    }

    update() {
        Matrix4.multiply(this.position.data, this.rotation.data, this.data);
        Matrix4.multiply(this.data, this.scaling.data, this.data);

        return this;
    }
}
