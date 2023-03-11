import { Matrix4, Vector3, Vector3Like } from "@valeera/mathx";
import AScale3 from "./AScale3";

const DEFAULT_SCALE = [1, 1, 1];

export default class Vector3Scale3 extends AScale3 {
    vec3: Vector3;

    constructor(vec3: Vector3Like = new Float32Array(DEFAULT_SCALE)) {
        super();
        this.vec3 = Vector3.fromArray(vec3);
        this.update();
    }

    get x() {
        return this.vec3[0];
    }

    set x(value: number) {
        this.vec3[0] = value;
        this.data[0] = value;
        this.dirty = true;
    }

    get y() {
        return this.vec3[1];
    }

    set y(value: number) {
        this.vec3[1] = value;
        this.data[5] = value;
        this.dirty = true;
    }

    get z() {
        return this.vec3[1];
    }

    set z(value: number) {
        this.vec3[2] = value;
        this.data[10] = value;
        this.dirty = true;
    }

    set(arr: Float32Array | number[] | number) {
        if (typeof arr === 'number') {
            Vector3.fromScalar(arr, this.vec3);
        } else {
            this.vec3.set(arr);
        }

        return this.update();
    }

    setXYZ(x: number, y: number, z: number) {
        this.vec3[0] = x;
        this.vec3[1] = y;
        this.vec3[2] = z;
        
        this.data[0] = x;
        this.data[5] = y;
        this.data[10] = z;
        this.dirty = true;

        return this;
    }

    update() {
        Matrix4.fromScaling(this.vec3, this.data);

        return this;
    }
}
