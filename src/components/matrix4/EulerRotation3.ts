import { Matrix4, EulerAngle, IEulerAngle, EulerRotationOrders } from "@valeera/mathx";
import ARotation3 from "./ARotation3";

export default class EulerRotation3 extends ARotation3 {
    euler: IEulerAngle;

    constructor(euler: IEulerAngle = {
        x: 0,
        y: 0,
        z: 0,
        order: EulerAngle.ORDERS.XYZ,
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
    

    get order() {
        return this.euler.order;
    }

    set order(value: EulerRotationOrders) {
        this.euler.order = value;
        this.update();
    }

    set(arr: IEulerAngle) {
        this.x = arr.x;
        this.y = arr.y;
        this.z = arr.z;
        this.order = arr.order;

        return this.update();
    }

    update() {
        Matrix4.fromEuler(this.euler, this.data);
        this.dirty = true;

        return this;
    }
}
