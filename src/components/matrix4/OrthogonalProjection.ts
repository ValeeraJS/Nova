import { Matrix4 } from "@valeera/mathx";
import mapRange from "@valeera/mathx/src/common/mapRange";
import { WebGLNearFarRange, WebGPUNearFarRange } from "../../constants";
import AProjection3 from "./AProjection3";

export default abstract class PerspectiveProjection extends AProjection3 {
    data = new Float32Array(16);
    options: { left: number; right: number; bottom: number; top: number; near: number; far: number; };

    constructor(left: number, right: number, bottom: number, top: number, near: number, far: number) {
        super();
        this.options = {
            left,
            right,
            bottom,
            top,
            near,
            far,
        }
        this.update();
    }

    get left() {
        return this.options.left;
    }
    
    set left(value: number) {
        this.options.left = value;

        this.update();
    }
    
    get right() {
        return this.right;
    }
    
    set right(value: number) {
        this.options.right = value;

        this.update();
    }

    get top() {
        return this.top;
    }

    set top(value: number) {
        this.options.top = value;

        this.update();
    }
    
    get bottom() {
        return this.bottom;
    }
    
    set bottom(value: number) {
        this.options.bottom = value;

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


    set(left: number = this.left, right: number = this.right, bottom: number = this.bottom, top: number = this.top, near: number = this.near, far: number = this.far) {
        this.options.left = left;
        this.options.right = right;
        this.options.bottom = bottom;
        this.options.top = top;
        this.options.near = near;
        this.options.far = far;

        return this.update();
    }

    update() {
        Matrix4.orthogonal(this.options.left, this.options.right, this.options.bottom, this.options.top, this.options.near, this.options.far, this.data);
        this.dirty = true;
        return this;
    }
}
