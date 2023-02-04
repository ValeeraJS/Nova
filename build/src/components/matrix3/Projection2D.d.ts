import AProjection2 from "./AProjection2";
export default class Projection2D extends AProjection2 {
    options: {
        left: number;
        right: number;
        bottom: number;
        top: number;
    };
    constructor(left?: number, right?: number, bottom?: number, top?: number);
    get left(): number;
    set left(value: number);
    get right(): number;
    set right(value: number);
    get top(): number;
    set top(value: number);
    get bottom(): number;
    set bottom(value: number);
    set(left?: number, right?: number, bottom?: number, top?: number): this;
    update(): this;
}
