import { Matrix4, Vector3Like, Vector3 } from "@valeera/mathx";
import { Entity, IEntity } from "@valeera/x";
import { Anchor3 } from "../components";
import { MODEL_3D, WORLD_MATRIX4 } from "../components/constants";
import EuclidPosition3 from "../components/matrix4/EuclidPosition3";
import EulerRotation3 from "../components/matrix4/EulerRotation3";
import Matrix4Component, { updateModelMatrixComponent } from "../components/matrix4/Matrix4Component";
import Vector3Scale3 from "../components/matrix4/Vector3Scale3";

export interface IObject3 extends IEntity {
    anchor: Matrix4Component;
    position: Matrix4Component;
    rotation: Matrix4Component;
    scaling: Matrix4Component;
    modelMatrix: Matrix4Component;
    worldMatrix: Matrix4Component;
}

const TEMP_MATRIX4 = new Matrix4();

export class Object3 extends Entity implements IObject3 {
    anchor: Matrix4Component;
    position: Matrix4Component;
    rotation: Matrix4Component;
    scaling: Matrix4Component;
    modelMatrix: Matrix4Component;
    worldMatrix: Matrix4Component;
    constructor(name: string = "Object3") {
        super(name);
        this.scaling = new Vector3Scale3();
        this.position = new EuclidPosition3();
        this.rotation = new EulerRotation3();
        this.anchor = new Anchor3();
        this.modelMatrix = new Matrix4Component(MODEL_3D, Matrix4.create(), [{
            label: MODEL_3D,
            unique: true 
        }]);
        this.worldMatrix = new Matrix4Component(WORLD_MATRIX4, Matrix4.create(), [{
            label: WORLD_MATRIX4,
            unique: true 
        }]);
    }

    localToWorld(vec: Vector3Like) {
        return Vector3.transformMatrix4(vec, this.worldMatrix.data, vec);
    }

    worldToLocal(vec: Vector3Like) {
        Matrix4.invert(this.worldMatrix.data, TEMP_MATRIX4);

        return Vector3.transformMatrix4(vec, TEMP_MATRIX4, vec);
    }

    worldToScreen(vec3: Vector3Like) {
        
    }

    updateWorldMatrix(updateParent: boolean = false, updateChildren: boolean = false): this {
        if (updateParent && this.parent && this.parent instanceof Object3) {
            this.parent.updateWorldMatrix(true, false);
        }
        updateModelMatrixComponent(this);
        if (updateChildren) {
            for (let i = 0, len = this.children.length; i < len; i++) {
                const child = this.children[i];
                if (child instanceof Object3) {
                    child.updateWorldMatrix(false, true);
                }
            }
        }

        return this;
    }
}
