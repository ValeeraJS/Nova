import { Matrix4 } from "@valeera/mathx";
import AProjection3 from "./AProjection3";

export class PerspectiveProjectionX extends AProjection3 {
    options: { fovx: number; aspect: number; near: number; far: number; };

    constructor(fovx: number = Math.PI * 0.25, aspect: number = window.innerWidth / window.innerHeight, near: number = 0.01, far: number = 100) {
        super();
        this.options = {
            fovx,
            aspect,
            near,
            far,
        }
        this.update();
    }

    get fovx() {
        return this.options.fovx;
    }

    set fovx(value: number) {
        this.options.fovx = value;

        this.update();
    }

    get aspect() {
        return this.options.aspect;
    }

    set aspect(value: number) {
        this.options.aspect = value;

        this.update();
    }

    get near() {
        return this.options.near;
    }

    set near(value: number) {
        this.options.near = value;

        this.update();
    }

    get far() {
        return this.options.far;
    }

    set far(value: number) {
        this.options.far = value;

        this.update();
    }


    set(fovx: number = this.fovx, aspect: number = this.aspect, near: number = this.near, far: number = this.far) {
        this.options.fovx = fovx;
        this.options.aspect = aspect;
        this.options.near = near;
        this.options.far = far;

        return this.update();
    }

    update() {
        Matrix4.perspectiveZ0(this.options.fovx / this.options.aspect, this.options.aspect, this.options.near, this.options.far, this.data);
        this.dirty = true;
        return this;
    }
}
