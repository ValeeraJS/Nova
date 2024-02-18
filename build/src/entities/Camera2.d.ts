import Matrix3Component from "../components/matrix3/Matrix3Component";
import { Object2, IObject2 } from "./Object2";
export interface ICamera2 extends IObject2 {
    projection: Matrix3Component;
}
export declare class Camera2 extends Object2 implements ICamera2 {
    projection: Matrix3Component;
    constructor(projection: Matrix3Component, name?: string);
}
