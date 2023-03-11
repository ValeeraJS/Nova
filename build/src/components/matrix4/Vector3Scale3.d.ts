import { Vector3, Vector3Like } from "@valeera/mathx";
import AScale3 from "./AScale3";
export default class Vector3Scale3 extends AScale3 {
    vec3: Vector3;
    constructor(vec3?: Vector3Like);
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    get z(): number;
    set z(value: number);
    set(arr: Float32Array | number[] | number): this;
    setXYZ(x: number, y: number, z: number): this;
    update(): this;
}
