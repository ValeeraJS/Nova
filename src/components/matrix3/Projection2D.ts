import { Matrix3 } from "@valeera/mathx";
import AProjection2 from "./AProjection2";

export default class Projection2D extends AProjection2 {
    options: { left: number; right: number; bottom: number; top: number;};

    constructor(left: number = -window.innerWidth * 0.005, right: number = window.innerWidth * 0.005, bottom: number = -window.innerHeight * 0.005, top: number = window.innerHeight * 0.005) {
        super();
        this.options = {
            left,
            right,
            bottom,
            top
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

    set(left: number = this.left, right: number = this.right, bottom: number = this.bottom, top: number = this.top) {
        this.options.left = left;
        this.options.right = right;
        this.options.bottom = bottom;
        this.options.top = top;

        return this.update();
    }

    update() {
        orthogonal(this.options.left, this.options.right, this.options.bottom, this.options.top, this.data);
        this.dirty = true;

        return this;
    }
}

const orthogonal = (
    left: number,
    right: number,
    bottom: number,
    top: number,
    out: Matrix3 = new Matrix3()
): Matrix3 => {
    const c = 1 / (left - right);
    const b = 1 / (bottom - top);

    out[0] = -2 * c;
    out[1] = 0;
    out[2] = 0;

    out[3] = 0;
    out[4] = -2 * b;
    out[5] = 0;

    // out[6] = 0;
    // out[7] = 0;
    out[6] = (left + right) * c;
    out[7] = (top + bottom) * b;
    out[8] = 1;

    return out;
};