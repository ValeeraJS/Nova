import IEuler from "@valeera/mathx/src/euler/IEuler";
import ARotation3 from "./ARotation3";
export default class EulerRotation3 extends ARotation3 {
    euler: IEuler;
    data: Float32Array;
    constructor(euler?: IEuler);
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    get z(): number;
    set z(value: number);
    set(arr: IEuler): this;
    update(): this;
}
