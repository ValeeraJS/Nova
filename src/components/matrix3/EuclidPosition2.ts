import { Matrix3, Vector2 } from "@valeera/mathx";
import APosition2 from "./APosition2";

export default class EuclidPosition2 extends APosition2 {
	vec2: Vector2 = new Vector2();
	data = Matrix3.identity();

	constructor(vec2: Float32Array | number[] = new Float32Array(2)) {
		super();
		Vector2.fromArray(vec2, 0, this.vec2);
		this.update();
	}

	get x() {
		return this.vec2[0];
	}

	set x(value: number) {
		this.vec2[0] = value;
		this.data[6] = value;
		this.dirty = true;
	}

	get y() {
		return this.vec2[1];
	}

	set y(value: number) {
		this.vec2[1] = value;
		this.data[7] = value;
		this.dirty = true;
	}

	set(arr: Float32Array | number[]) {
		this.vec2.set(arr);

        this.data[6] = arr[0];
        this.data[7] = arr[1];
        this.dirty = true;
		return this;
	}

	setXY(x: number, y: number) {
		this.vec2[0] = x;
		this.vec2[1] = y;


		this.data[6] = x;
		this.data[7] = y;
		this.dirty = true;

		return this;
	}

	update() {
		Matrix3.fromTranslation(this.vec2, this.data);
		this.dirty = true;

		return this;
	}
}
