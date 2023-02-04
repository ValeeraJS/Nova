import { Matrix3 } from "@valeera/mathx";
import ARotation2 from "./ARotation2";
export default class AngleRotation2 extends ARotation2 {
    #private;
    data: Matrix3;
    constructor(angle?: number);
    get a(): number;
    set a(value: number);
    update(): this;
}
