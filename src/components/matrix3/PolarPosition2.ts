import { Matrix3, Vector2, Polar } from "@valeera/mathx";
import APosition2 from "./APosition2";

export default class PolarPosition2 extends APosition2 {
	polar: Polar = new Polar();

	constructor(radius: number = 0, angle: number = 0) {
		super();
		this.polar.r = radius;
		this.polar.a = angle;
	}

	get r() {
		return this.polar.r;
	}

	set r(value: number) {
		this.polar.r = value;
		this.update();
	}

	get a() {
		return this.polar[1];
	}

	set a(value: number) {
		this.polar[1] = value;
		this.update();
	}

	set(r: number, a: number) {
		this.polar.a = a;
		this.polar.r = r;

		return this;
	}

	update() {
		this.data[6] = this.polar.x();
		this.data[7] = this.polar.y();
		this.dirty = true;
		
		return this;
	}
}
