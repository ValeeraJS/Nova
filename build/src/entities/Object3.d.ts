import { Entity, IEntity } from "@valeera/x";
import Matrix4Component from "../components/matrix4/Matrix4Component";
export interface IObject3 extends IEntity {
    anchor: Matrix4Component;
    position: Matrix4Component;
    rotation: Matrix4Component;
    scaling: Matrix4Component;
    modelMatrix: Matrix4Component;
    worldMatrix: Matrix4Component;
}
export default class Object3 extends Entity implements IObject3 {
    anchor: Matrix4Component;
    position: Matrix4Component;
    rotation: Matrix4Component;
    scaling: Matrix4Component;
    modelMatrix: Matrix4Component;
    worldMatrix: Matrix4Component;
    constructor(name?: string);
}
