import { Matrix4 } from "@valeera/mathx";
import { Component } from "@valeera/x";
import { IObject3 } from "../../entities/Object3";

export interface ComponentTag {
	readonly label: string;
	readonly unique: boolean;
}

export default class Matrix4Component extends Component<Float32Array> {
    constructor(data = Matrix4.create(), tags: ComponentTag[] = [], name: string) {
        super(data, tags, name);
        this.dirty = true;
    }
}

export const updateModelMatrixComponent = (obj3: IObject3) => {
    let p3 = obj3.position;
    let r3 = obj3.rotation;
    let s3 = obj3.scaling;
    let a3 = obj3.anchor;
    let m3 = obj3.modelMatrix;
    let worldMatrix = obj3.worldMatrix;

    if (p3?.dirty || r3?.dirty || s3?.dirty || a3?.dirty) {
        Matrix4.fromArray(p3?.data || Matrix4.UNIT_MATRIX4, m3.data);
        if (r3) {
            Matrix4.multiply(m3.data, r3.data, m3.data);
        }
        if (s3) {
            Matrix4.multiplyScaleMatrix(m3.data, s3.data, m3.data);
        }
        if (a3) {
            Matrix4.multiplyTranslateMatrix(m3.data, a3.data, m3.data);
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

    if (obj3.parent) {
        let parentWorldMatrix = (obj3.parent as IObject3).worldMatrix?.data ?? Matrix4.UNIT_MATRIX4;
        Matrix4.multiply(parentWorldMatrix, m3.data, worldMatrix.data);
    } else {
        Matrix4.fromArray(m3.data, worldMatrix.data);
    }

    return m3;
}
