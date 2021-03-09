import { from } from "../../math/euler/Euler";
import IEuler from "../../math/euler/IEuler";
import { fromEuler } from "../../math/matrix/Matrix4";
import AbstractRotation3 from "./AbstractRotation3";

export default abstract class EulerRotation3 extends AbstractRotation3 {
    euler: IEuler;

    constructor(euler: IEuler) {
        super();
        this.euler = euler;
        this.update();
    }

    get x() {
        return this.euler.x;
    }

    set x(value: number) {
        this.euler.x = value;
        this.update();
    }

    get y() {
        return this.euler.y;
    }

    set y(value: number) {
        this.euler.y = value;
        this.update();
    }

    get z() {
        return this.euler.z;
    }

    set z(value: number) {
        this.euler.z = value;
        this.update();
    }

    set(arr: IEuler) {
        from(arr, this.euler);

        return this.update();
    }

    update() {
        fromEuler(this.euler, this.data);

        return this;
    }
}
