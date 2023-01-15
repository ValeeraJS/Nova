import { ANCHOR_2D } from "../constants";
import { IVector2, Matrix3, Vector2 } from "@valeera/mathx";
import Matrix3Component from "./Matrix3Component";

export default class Anchor2 extends Matrix3Component {
	vec2: Vector2 = new Vector2();
    constructor(vec: IVector2 | Float32Array | number[] = Vector2.VECTOR2_ZERO) {
        super(ANCHOR_2D, Matrix3.create(), [{
			label: ANCHOR_2D,
			unique: true
		}]);
		Vector2.fromArray(vec, 0, this.vec2);
		this.update();
    }
    
	get x() {
		return this.vec2[0];
	}

	set x(value: number) {
		this.vec2[0] = value;
		this.data[6] = -value;
		this.dirty = true;
	}

	get y() {
		return this.vec2[1];
	}

	set y(value: number) {
		this.vec2[1] = value;
		this.data[7] = -value;
		this.dirty = true;
	}

	set(arr: Float32Array | number[]) {
		this.vec2.set(arr);

		return this.update();
	}

	setXY(x: number, y: number, z: number) {
		this.vec2[0] = x;
		this.vec2[1] = y;

		return this.update();
	}

	update() {
		this.data[6] = -this.x;
		this.data[7] = -this.y;
		this.dirty = true;

		return this;
	}
}
