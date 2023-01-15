import { ANCHOR_3D } from "../constants";
import { IVector3, Matrix4, Vector3 } from "@valeera/mathx";
import Matrix4Component from "./Matrix4Component";

export default class Anchor3 extends Matrix4Component {
	vec3: Vector3 = new Vector3();
    constructor(vec: IVector3 | Float32Array | number[] = Vector3.VECTOR3_ZERO) {
        super(ANCHOR_3D, Matrix4.create(), [{
			label: ANCHOR_3D,
			unique: true
		}]);
		Vector3.fromArray(vec, 0, this.vec3);
		this.update();
    }
    
	get x() {
		return this.vec3[0];
	}

	set x(value: number) {
		this.vec3[0] = value;
		this.data[12] = -value;
		this.dirty = true;
	}

	get y() {
		return this.vec3[1];
	}

	set y(value: number) {
		this.vec3[1] = value;
		this.data[13] = -value;
		this.dirty = true;
	}

	get z() {
		return this.vec3[2];
	}

	set z(value: number) {
		this.vec3[2] = value;
		this.data[14] = -value;
		this.dirty = true;
	}

	set(arr: Float32Array | number[]) {
		this.vec3.set(arr);

		return this.update();
	}

	setXYZ(x: number, y: number, z: number) {
		this.vec3[0] = x;
		this.vec3[1] = y;
		this.vec3[2] = z;

		return this.update();
	}

	update() {
		this.data[12] = -this.x;
		this.data[13] = -this.y;
		this.data[14] = -this.z;
		this.dirty = true;

		return this;
	}
}
