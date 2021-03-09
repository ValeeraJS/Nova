import { from } from "@valeera/mathx/src/euler/Euler";
import IEuler, { EulerRotationOrders }from "@valeera/mathx/src/euler/IEuler";
import { fromEuler } from "@valeera/mathx/src/matrix/Matrix4";
import ARotation3 from "./ARotation3";

export default class EulerRotation3 extends ARotation3 {
    euler: IEuler;
    data = new Float32Array(16);

    constructor(euler: IEuler = {
        x: 0,
        y: 0,
        z: 0,
        order: EulerRotationOrders.XYZ,
    }) {
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
