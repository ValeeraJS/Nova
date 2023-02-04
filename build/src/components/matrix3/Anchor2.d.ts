import { IVector2, Vector2 } from "@valeera/mathx";
import Matrix3Component from "./Matrix3Component";
export default class Anchor2 extends Matrix3Component {
    vec2: Vector2;
    constructor(vec?: IVector2 | Float32Array | number[]);
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    set(arr: Float32Array | number[]): this;
    setXY(x: number, y: number, z: number): this;
    update(): this;
}
