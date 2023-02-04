import { Vector3, Vector3Like } from "@valeera/mathx";
import APosition3 from "./APosition3";
export default class EuclidPosition3 extends APosition3 {
    vec3: Vector3;
    constructor(vec3?: Vector3Like);
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
