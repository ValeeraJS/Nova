import { Matrix4 } from "@valeera/mathx";
import AProjection3 from "./AProjection3";

export default abstract class PerspectiveProjection extends AProjection3 {
    fovy: number;
    aspect: number;
    near: number;
    far: number;
    vec3: any;
    data = new Float32Array(16);

    constructor(fovy: number, aspect: number, near: number, far: number) {
        super();
        this.fovy = fovy;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
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
        Matrix4.perspective(this.fovy, this.aspect, this.near, this.far, this.data);

        return this;
    }
}
