import Matrix4Component from "../components/matrix4/Matrix4Component";
import Object3, { IObject3 } from "./Object3";

export interface ICamera3 extends IObject3 {
    projection: Matrix4Component;
}

export default class Camera3 extends Object3 implements ICamera3 {
    projection: Matrix4Component;
    constructor(name: string = "Camera3", projection: Matrix4Component) {
        super(name);
        this.projection = projection;
    }
}
