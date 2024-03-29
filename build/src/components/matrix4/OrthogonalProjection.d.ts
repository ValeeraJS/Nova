import AProjection3 from "./AProjection3";
export default class OrthogonalProjection extends AProjection3 {
    options: {
        left: number;
        right: number;
        bottom: number;
        top: number;
        near: number;
        far: number;
    };
    constructor(left?: number, right?: number, bottom?: number, top?: number, near?: number, far?: number);
    get left(): number;
    set left(value: number);
    get right(): number;
    set right(value: number);
    get top(): number;
    set top(value: number);
    get bottom(): number;
    set bottom(value: number);
    get near(): number;
    set near(value: number);
    get far(): number;
    set far(value: number);
    set(left?: number, right?: number, bottom?: number, top?: number, near?: number, far?: number): this;
    update(inverse?: boolean): this;
}
