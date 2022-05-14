import { Matrix4 } from "@valeera/mathx";
import { Entity, IEntity, IWorld } from "@valeera/x";
import Component from "@valeera/x/src/Component";
import { MODEL_3D, WORLD_MATRIX } from "../components/constants";
import EuclidPosition3 from "../components/matrix4/EuclidPosition3";
import EulerRotation3 from "../components/matrix4/EulerRotation3";
import Matrix4Component from "../components/matrix4/Matrix4Component";
import Vector3Scale3 from "../components/matrix4/Vector3Scale3";

export interface IObject3 extends IEntity {
    anchor: Matrix4Component;
    position: Matrix4Component;
    rotation: Matrix4Component;
    scaling: Matrix4Component;
    modelMatrix: Matrix4Component;
    worldMatrix: Matrix4Component;
}

export default class Object3 extends Entity implements IObject3 {
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
        this.anchor = new EuclidPosition3();
        this.modelMatrix = new Matrix4Component(MODEL_3D, Matrix4.create(), [{
            label: MODEL_3D,
            unique: true 
        }]);
        this.worldMatrix = new Matrix4Component(WORLD_MATRIX, Matrix4.create(), [{
            label: WORLD_MATRIX,
            unique: true 
        }]);
    }
}
