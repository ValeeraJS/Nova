import Component from "@valeera/x/src/Component";
import Matrix4Component from "./matrix4/Matrix4Component";
export default class Object3 extends Component<string> {
    scaling: Matrix4Component;
    position: Matrix4Component;
    rotation: Matrix4Component;
    constructor(scaling: Matrix4Component, rotation: Matrix4Component, position: Matrix4Component);
    update(): this;
}
