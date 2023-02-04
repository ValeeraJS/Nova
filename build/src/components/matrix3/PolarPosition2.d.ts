import { Polar } from "@valeera/mathx";
import APosition2 from "./APosition2";
export default class PolarPosition2 extends APosition2 {
    polar: Polar;
    constructor(radius?: number, angle?: number);
    get r(): number;
    set r(value: number);
    get a(): number;
    set a(value: number);
    set(r: number, a: number): this;
    update(): this;
}
