import { Matrix3 } from "@valeera/mathx";
import ARotation2 from "./ARotation2";

export default class AngleRotation2 extends ARotation2 {
    #angle: number;
    data = Matrix3.identity();

    constructor(angle: number = 0) {
        super();
        this.#angle = angle;
        this.update();
    }

    get a() {
        return this.#angle;
    }

    set a(value: number) {
        this.#angle = value;
        this.update();
    }

    update() {
        Matrix3.fromRotation(this.#angle, this.data);
        this.dirty = true;

        return this;
    }
}
