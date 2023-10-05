import AProjection3 from "./AProjection3";
export declare class PerspectiveProjectionX extends AProjection3 {
    options: {
        fovx: number;
        aspect: number;
        near: number;
        far: number;
    };
    constructor(fovx?: number, aspect?: number, near?: number, far?: number);
    get fovx(): number;
    set fovx(value: number);
    get aspect(): number;
    set aspect(value: number);
    get near(): number;
    set near(value: number);
    get far(): number;
    set far(value: number);
    set(fovx?: number, aspect?: number, near?: number, far?: number): this;
    update(inverse?: boolean): this;
}
