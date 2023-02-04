import AScale2 from "./AScale2";
export default class Vector2Scale2 extends AScale2 {
    vec2: Float32Array;
    constructor(vec2?: Float32Array);
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    set(arr: Float32Array | number[]): this;
    setXY(x: number, y: number, z: number): this;
    update(): this;
}
