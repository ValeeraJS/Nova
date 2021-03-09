import { Matrix4 } from "@valeera/mathx";
import APosition3 from "./APosition3";

export default class EuclidPosition3 extends APosition3 {
    vec3: Float32Array;
    data = new Float32Array(16);

    constructor(vec3: Float32Array = new Float32Array(3)) {
        super();
        this.vec3 = vec3;
        this.update();
    }

    get x() {
        return this.vec3[0];
    }

    set x(value: number) {
        this.vec3[0] = value;
        this.update();
    }

    get y() {
        return this.vec3[1];
    }

    set y(value: number) {
        this.vec3[1] = value;
        this.update();
    }

    get z() {
        return this.vec3[1];
    }

    set z(value: number) {
        this.vec3[2] = value;
        this.update();
    }

    set(arr: Float32Array | number[]) {
        this.vec3.set(arr);

        return this.update();
    }

    setXYZ(x: number, y: number, z: number) {
        this.vec3[0] = x;
        this.vec3[1] = y;
        this.vec3[2] = z;

        return this.update();
    }

    update() {
        Matrix4.fromTranslation(this.vec3, this.data);

        return this;
    }
}
