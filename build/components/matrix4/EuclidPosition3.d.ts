import { Matrix4, Vector3 } from "@valeera/mathx";
import APosition3 from "./APosition3";
export default class EuclidPosition3 extends APosition3 {
    vec3: Vector3;
    data: Matrix4;
    constructor(vec3?: Float32Array | number[]);
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    get z(): number;
    set z(value: number);
    set(arr: Float32Array | number[]): this;
    setXYZ(x: number, y: number, z: number): this;
    update(): this;
}
