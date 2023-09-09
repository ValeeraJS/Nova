import { Matrix3 } from "@valeera/mathx";
import AScale2 from "./AScale2";

const DEFAULT_SCALE = [1, 1];

export default class Vector2Scale2 extends AScale2 {
    vec2: Float32Array;

    constructor(vec2: Float32Array = new Float32Array(DEFAULT_SCALE)) {
        super();
        this.vec2 = vec2;
        this.update();
    }

    get x() {
        return this.vec2[0];
    }

    set x(value: number) {
        this.vec2[0] = value;
        this.data[0] = value;
        this.dirty = true;
    }

    get y() {
        return this.vec2[1];
    }

    set y(value: number) {
        this.vec2[1] = value;
        this.data[4] = value;
        this.dirty = true;
    }

    set(arr: Float32Array | number[]) {
        this.vec2.set(arr);

        return this.update();
    }

    setXY(x: number, y: number) {
        this.vec2[0] = x;
        this.vec2[1] = y;
        
        this.data[0] = x;
        this.data[4] = y;
        this.dirty = true;

        return this;
    }

    update() {
        Matrix3.fromScaling(this.vec2, this.data);

        return this;
    }
}
