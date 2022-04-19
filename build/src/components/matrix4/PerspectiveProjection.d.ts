import AProjection3 from "./AProjection3";
export default class PerspectiveProjection extends AProjection3 {
    data: Float32Array;
    options: {
        fovy: number;
        aspect: number;
        near: number;
        far: number;
    };
    constructor(fovy: number, aspect: number, near: number, far: number);
    get fovy(): number;
    set fovy(value: number);
    get aspect(): number;
    set aspect(value: number);
    get near(): number;
    set near(value: number);
    get far(): number;
    set far(value: number);
    set(fovy?: number, aspect?: number, near?: number, far?: number): this;
    update(): this;
}
