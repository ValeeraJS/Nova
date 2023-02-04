import { IVector3, Vector3 } from "@valeera/mathx";
import Matrix4Component from "./Matrix4Component";
export default class Anchor3 extends Matrix4Component {
    vec3: Vector3;
    constructor(vec?: IVector3 | Float32Array | number[]);
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
