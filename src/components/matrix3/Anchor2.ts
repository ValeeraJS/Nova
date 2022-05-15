import { ANCHOR_2D } from "../constants";
import { IVector2, Matrix3, Vector2 } from "@valeera/mathx";
import Matrix3Component from "./Matrix3Component";

export default class Anchor2 extends Matrix3Component {
	vec3: Vector2 = new Vector2();
    constructor(vec: IVector2 | Float32Array | number[] = Vector2.VECTOR2_ZERO) {
        super(ANCHOR_2D, Matrix3.create(), [{
			label: ANCHOR_2D,
			unique: true
		}]);
		Vector2.fromArray(vec, 0, this.vec3);
		this.update();
    }
    
	get x() {
		return this.vec3[0];
	}

	set x(value: number) {
		this.vec3[0] = value;
		this.data[6] = value;
		this.dirty = true;
	}

	get y() {
		return this.vec3[1];
	}

	set y(value: number) {
		this.vec3[1] = value;
		this.data[7] = value;
		this.dirty = true;
	}

	set(arr: Float32Array | number[]) {
		this.vec3.set(arr);

        this.data[6] = arr[0];
        this.data[7] = arr[1];
        this.dirty = true;
		return this;
	}

	setXY(x: number, y: number, z: number) {
		this.vec3[0] = x;
		this.vec3[1] = y;

		this.data[6] = x;
		this.data[7] = y;
		this.dirty = true;

		return this;
	}

	update() {
		Matrix3.fromTranslation(this.vec3, this.data);
		this.dirty = true;

		return this;
	}
}
