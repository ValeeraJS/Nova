import { Spherical, SphericalLike } from "@valeera/mathx";
import APosition3 from "./APosition3";
export declare class SphericalPosition3 extends APosition3 {
    #private;
    spherical: Spherical;
    constructor(spherical?: Float32Array | number[]);
    get radius(): number;
    set radius(value: number);
    get phi(): number;
    set phi(value: number);
    get theta(): number;
    set theta(value: number);
    set(arr: SphericalLike): this;
    update(): this;
}
