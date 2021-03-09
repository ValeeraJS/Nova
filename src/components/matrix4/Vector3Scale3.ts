import { Matrix4 } from "@valeera/mathx";
import AScale3 from "./AScale3";

export default class Vector3Scale3 extends AScale3 {
    vec3: Float32Array;
    data = new Float32Array(16);

    constructor(vec3: Float32Array) {
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
        Matrix4.fromScaling(this.vec3, this.data);

        return this;
    }
}
