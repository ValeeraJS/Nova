import AScale3 from "./AScale3";
export default class Vector3Scale3 extends AScale3 {
    vec3: Float32Array;
    constructor(vec3?: Float32Array);
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
