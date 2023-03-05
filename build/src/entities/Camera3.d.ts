import Matrix4Component from "../components/matrix4/Matrix4Component";
import { Object3, IObject3 } from "./Object3";
export interface ICamera3 extends IObject3 {
    projection: Matrix4Component;
}
export declare class Camera3 extends Object3 implements ICamera3 {
    projection: Matrix4Component;
    constructor(name: string, projection: Matrix4Component);
}
