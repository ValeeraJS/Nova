import { Matrix4, Spherical, SphericalLike, Vector3 } from "@valeera/mathx";
import APosition3 from "./APosition3";

export class SphericalPosition3 extends APosition3 {
	spherical: Spherical = new Spherical();
	#vec3: Vector3 = new Vector3();

	constructor(spherical: Float32Array | number[] = new Float32Array(3)) {
		super();
		Spherical.fromArray(spherical, this.spherical);
		this.update();
	}

	get radius() {
		return this.spherical[0];
	}

	set radius(value: number) {
		this.spherical[0] = value;
		this.update();
	}

	get phi() {
		return this.spherical[1];
	}

	set phi(value: number) {
		this.spherical[1] = value;
		this.update();
	}

	get theta() {
		return this.spherical[2];
	}

	set theta(value: number) {
		this.spherical[2] = value;
		this.update();
	}

	set(arr: SphericalLike): this {
		this.spherical.set(arr);

		return this.update();
	}

	update(): this {
		this.spherical.toVector3(this.#vec3);
		Matrix4.fromTranslation(this.#vec3, this.data);
		this.dirty = true;

		return this;
	}
}
