import { Component } from "@valeera/x";
import { Matrix3 } from "@valeera/mathx";
import { IObject2 } from "../../entities/Object2";

export interface ComponentTag {
	readonly label: string;
	readonly unique: boolean;
}

export default class Matrix3Component extends Component<Float32Array> {
	constructor(name: string, data = Matrix3.create(), tags: ComponentTag[] = []) {
		super(data, tags, name);
		this.dirty = true;
	}
}

export const updateModelMatrixComponent = (mesh: IObject2) => {
	let p3 = mesh.position;
	let r3 = mesh.rotation;
	let s3 = mesh.scaling;
	let a3 = mesh.anchor;
	let m3 = mesh.modelMatrix;
	let worldMatrix = mesh.worldMatrix;

	if (p3?.dirty || r3?.dirty || s3?.dirty || a3?.dirty) {
		Matrix3.fromArray(p3?.data || Matrix3.UNIT_MATRIX3, m3.data);
		if (r3) {
			Matrix3.multiplyRotationMatrix(m3.data, r3.data, m3.data);
		}
		if (s3) {
			Matrix3.multiplyScaleMatrix(m3.data, s3.data, m3.data);
		}
		if (a3) {
			Matrix3.multiplyTranslateMatrix(m3.data, a3.data, m3.data);
		}
		if (p3) {
			p3.dirty = false;
		}
		if (r3) {
			r3.dirty = false;
		}
		if (s3) {
			s3.dirty = false;
		}
		if (a3) {
			a3.dirty = false;
		}
	}

	if (mesh.parent) {
		let parentWorldMatrix = (mesh.parent as IObject2).worldMatrix?.data ?? Matrix3.UNIT_MATRIX3;
		Matrix3.multiply(parentWorldMatrix, m3.data, worldMatrix.data);
	} else {
		Matrix3.fromArray(m3.data, worldMatrix.data);
	}
	return m3;
}
