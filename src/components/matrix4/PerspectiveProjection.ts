import { Matrix4 } from "@valeera/mathx";
import AProjection3 from "./AProjection3";

export default class PerspectiveProjection extends AProjection3 {
    options: { fovy: number; aspect: number; near: number; far: number; };

    constructor(fovy: number = Math.PI * 0.25, aspect: number = window.innerWidth / window.innerHeight, near: number = 0.01, far: number = 100) {
        super();
        this.options = {
            fovy,
            aspect,
            near,
            far,
        }
        this.update();
    }

    get fovy() {
        return this.options.fovy;
    }

    set fovy(value: number) {
        this.options.fovy = value;

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


    set(fovy: number = this.fovy, aspect: number = this.aspect, near: number = this.near, far: number = this.far) {
        this.options.fovy = fovy;
        this.options.aspect = aspect;
        this.options.near = near;
        this.options.far = far;

        return this.update();
    }

    update() {
        Matrix4.perspectiveZ0(this.options.fovy, this.options.aspect, this.options.near, this.options.far, this.data);
        this.dirty = true;
        return this;
    }
}
