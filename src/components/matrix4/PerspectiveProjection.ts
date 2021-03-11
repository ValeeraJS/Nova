import { Matrix4 } from "@valeera/mathx";
import AProjection3 from "./AProjection3";

export default abstract class PerspectiveProjection extends AProjection3 {
    data = new Float32Array(16);

    constructor(fovy: number, aspect: number, near: number, far: number) {
        super();
        this.fovy = fovy;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.update();
    }

    get fovy() {
        return this.fovy;
    }
    
    set fovy(value: number) {
        this.fovy = value;

        this.update();
    }
    
    get aspect() {
        return this.aspect;
    }
    
    set aspect(value: number) {
        this.aspect = value;

        this.update();
    }
    
    get near() {
        return this.near;
    }
    
    set near(value: number) {
        this.near = value;

        this.update();
    }
    
    get far() {
        return this.far;
    }
    
    set far(value: number) {
        this.far = value;

        this.update();
    }


    set(fovy: number = this.fovy, aspect: number = this.aspect, near: number = this.near, far: number = this.far) {
        this.fovy = fovy;
        this.aspect = aspect;
        this.near = near;
        this.far = far;

        return this.update();
    }

    update() {
        Matrix4.perspective(this.fovy, this.aspect, this.near, this.far, this.data);
        this.dirty = true;
        return this;
    }
}
