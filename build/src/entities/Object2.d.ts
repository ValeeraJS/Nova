import { Entity } from "@valeera/x";
import Matrix3Component from "../components/matrix3/Matrix3Component";
export interface IObject2 extends Entity {
    anchor: Matrix3Component;
    position: Matrix3Component;
    rotation: Matrix3Component;
    scaling: Matrix3Component;
    modelMatrix: Matrix3Component;
    worldMatrix: Matrix3Component;
}
export declare class Object2 extends Entity implements IObject2 {
    anchor: Matrix3Component;
    position: Matrix3Component;
    rotation: Matrix3Component;
    scaling: Matrix3Component;
    modelMatrix: Matrix3Component;
    worldMatrix: Matrix3Component;
    constructor(name?: string);
}
