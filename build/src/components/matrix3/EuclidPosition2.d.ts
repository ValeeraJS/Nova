import { Vector2 } from "@valeera/mathx";
import APosition2 from "./APosition2";
export default class EuclidPosition2 extends APosition2 {
    vec2: Vector2;
    constructor(vec2?: Float32Array | number[]);
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    set(arr: Float32Array | number[]): this;
    setXY(x: number, y: number): this;
    update(): this;
}
