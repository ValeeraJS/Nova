import { Vector3Like } from "@valeera/mathx";
import { Entity } from "@valeera/x";
import Matrix4Component from "../components/matrix4/Matrix4Component";
export interface IObject3 extends Entity {
    anchor: Matrix4Component;
    position: Matrix4Component;
    rotation: Matrix4Component;
    scaling: Matrix4Component;
    modelMatrix: Matrix4Component;
    worldMatrix: Matrix4Component;
}
export declare class Object3 extends Entity implements IObject3 {
    anchor: Matrix4Component;
    position: Matrix4Component;
    rotation: Matrix4Component;
    scaling: Matrix4Component;
    modelMatrix: Matrix4Component;
    worldMatrix: Matrix4Component;
    constructor(name?: string);
    localToWorld(vec: Vector3Like): Vector3Like;
    worldToLocal(vec: Vector3Like): Vector3Like;
    worldToScreen(vec3: Vector3Like): void;
    updateWorldMatrix(updateParent?: boolean, updateChildren?: boolean): this;
}
