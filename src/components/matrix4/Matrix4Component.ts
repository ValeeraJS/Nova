import Component from "@valeera/x/src/Component";
import { Matrix4 } from "@valeera/mathx";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import { MODEL_3D, ROTATION_3D, SCALING_3D, TRANSLATION_3D } from "./constants";

export default class Matrix4Component extends Component<Float32Array> {
    data!: Float32Array;
    constructor(name: string, data = Matrix4.create()) {
        super(name, data);
        this.dirty = true;
    }
}

export const updateModelMatrixComponent = (mesh: IEntity) => {
    let p3 = mesh.getComponent(TRANSLATION_3D);
    let r3 = mesh.getComponent(ROTATION_3D);
    let s3 = mesh.getComponent(SCALING_3D);
    let m3 = mesh.getComponent(MODEL_3D); 
    if (!m3) {
        m3 = new Matrix4Component(MODEL_3D);
        (mesh as any).addComponent(m3);
    }
    if (p3?.dirty || r3?.dirty || s3?.dirty) {
        let matrixT = p3?.data || Matrix4.create();
        let matrixR = r3?.data || Matrix4.create();
        let matrixS = s3?.data || Matrix4.create();
        Matrix4.multiply(matrixT, matrixR, m3.data);
        Matrix4.multiply(m3.data, matrixS, m3.data);

        if (p3) {
            p3.dirty = false;
        }
        if (r3) {
            r3.dirty = false;
        }
        if (s3) {
            s3.dirty = false;
        }
    }

    return m3;
}
