import Component from "@valeera/x/src/Component";
import { Matrix4 } from "@valeera/mathx";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import { ANCHOR_3D, MODEL_3D, ROTATION_3D, SCALING_3D, TRANSLATION_3D, WORLD_MATRIX } from "../constants";
import { ComponentTag } from "@valeera/x/src/interfaces/IComponent";
import { Entity } from "@valeera/x";

export default class Matrix4Component extends Component<Float32Array> {
    data!: Float32Array;
    constructor(name: string, data = Matrix4.create(), tags: ComponentTag[] = []) {
        super(name, data, tags);
        this.dirty = true;
    }
}

export const updateModelMatrixComponent = (mesh: IEntity) => {
    let p3 = mesh.getComponent(TRANSLATION_3D) as Matrix4Component;
    let r3 = mesh.getComponent(ROTATION_3D) as Matrix4Component;
    let s3 = mesh.getComponent(SCALING_3D) as Matrix4Component;
    let a3 = mesh.getComponent(ANCHOR_3D) as Matrix4Component;
    let m3 = mesh.getComponent(MODEL_3D) as Matrix4Component;
    let worldMatrix = mesh.getComponent(WORLD_MATRIX) as Matrix4Component;
    if (!worldMatrix) {
        worldMatrix = new Matrix4Component(WORLD_MATRIX);
        mesh.addComponent(worldMatrix);
    }
    if (!m3) {
        m3 = new Matrix4Component(MODEL_3D);
        mesh.addComponent(m3);
    }
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

    if (mesh.parent) {
        let parentWorldMatrix = (mesh.parent as Entity).getFirstComponentByTagLabel(WORLD_MATRIX)?.data || Matrix4.UNIT_MATRIX4;
        Matrix4.multiply(parentWorldMatrix, m3.data, worldMatrix.data);
    } else {
        Matrix4.fromArray(m3.data, worldMatrix.data);
    }

    return m3;
}
