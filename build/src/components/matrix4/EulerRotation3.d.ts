import { IEulerAngle, EulerRotationOrders } from "@valeera/mathx";
import ARotation3 from "./ARotation3";
export default class EulerRotation3 extends ARotation3 {
    euler: IEulerAngle;
    constructor(euler?: IEulerAngle);
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    get z(): number;
    set z(value: number);
    get order(): EulerRotationOrders;
    set order(value: EulerRotationOrders);
    set(arr: IEulerAngle): this;
    update(): this;
}
