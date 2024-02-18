import AProjection3 from "../components/matrix4/AProjection3";
import { Object3, IObject3 } from "./Object3";
export interface ICamera3 extends IObject3 {
    projection: AProjection3;
}
export declare class Camera3 extends Object3 implements ICamera3 {
    projection: AProjection3;
    constructor(projection?: AProjection3, name?: string);
}
