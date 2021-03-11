import AProjection3 from "./AProjection3";
export default abstract class PerspectiveProjection extends AProjection3 {
    fovy: number;
    aspect: number;
    near: number;
    far: number;
    vec3: any;
    data: Float32Array;
    constructor(fovy: number, aspect: number, near: number, far: number);
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
