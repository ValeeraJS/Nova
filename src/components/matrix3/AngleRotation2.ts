import { Matrix3 } from "@valeera/mathx";
import ARotation2 from "./ARotation2";

export default class AngleRotation2 extends ARotation2 {
    _angle: number;
    data = Matrix3.identity();

    constructor(angle: number = 0) {
        super();
        this._angle = angle;
        this.update();
    }

    get angle() {
        return this._angle;
    }

    set angle(value: number) {
        this._angle = value;
        this.update();
    }

    update() {
        Matrix3.fromRotation(this._angle, this.data);
        this.dirty = true;

        return this;
    }
}
