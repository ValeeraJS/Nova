import Component from "@valeera/x/src/Component";
import { Matrix4 } from "@valeera/mathx";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import { ANCHOR_3D, MODEL_3D, ROTATION_3D, SCALING_3D, TRANSLATION_3D } from "../constants";

export default class Matrix4Component extends Component<Float32Array> {
    data!: Float32Array;
    constructor(name: string, data = Matrix4.create()) {
        super(name, data);
        this.dirty = true;
    }
}

export const updateModelMatrixComponent = (mesh: IEntity) => {
    let p3 = mesh.getComponent(TRANSLATION_3D) as Matrix4Component;
    let r3 = mesh.getComponent(ROTATION_3D) as Matrix4Component;
    let s3 = mesh.getComponent(SCALING_3D) as Matrix4Component;
    let a3 = mesh.getComponent(ANCHOR_3D) as Matrix4Component;
    let m3 = mesh.getComponent(MODEL_3D) as Matrix4Component; 
    if (!m3) {
        m3 = new Matrix4Component(MODEL_3D);
        (mesh as any).addComponent(m3);
    }
    if (p3?.dirty || r3?.dirty || s3?.dirty || a3?.dirty) {
        Matrix4.fromArray(p3?.data || Matrix4.UNIT_MATRIX4, m3.data);
        if (r3) {
            Matrix4.multiply(m3.data, r3.data, m3.data);
        }
        if (s3) {
            Matrix4.multiply(m3.data, s3.data, m3.data);
        }
        if (a3) {
            Matrix4.multiply(m3.data, a3.data, m3.data);
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

    return m3;
}
