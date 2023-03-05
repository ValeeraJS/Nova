import { Matrix3 } from "@valeera/mathx";
import { Entity, IEntity } from "@valeera/x";
import { MODEL_2D, MODEL_3D, WORLD_MATRIX3 } from "../components/constants";
import EuclidPosition2 from "../components/matrix3/EuclidPosition2";
import AngleRotation2 from "../components/matrix3/AngleRotation2";
import Matrix3Component from "../components/matrix3/Matrix3Component";
import Vector2Scale2 from "../components/matrix3/Vector2Scale2";
import { Anchor2 } from "../components";

export interface IObject2 extends IEntity {
    anchor: Matrix3Component;
    position: Matrix3Component;
    rotation: Matrix3Component;
    scaling: Matrix3Component;
    modelMatrix: Matrix3Component;
    worldMatrix: Matrix3Component;
}

export class Object2 extends Entity implements IObject2 {
    anchor: Matrix3Component;
    position: Matrix3Component;
    rotation: Matrix3Component;
    scaling: Matrix3Component;
    modelMatrix: Matrix3Component;
    worldMatrix: Matrix3Component;
    constructor(name: string = "Object3") {
        super(name);
        this.scaling = new Vector2Scale2();
        this.position = new EuclidPosition2();
        this.rotation = new AngleRotation2();
        this.anchor = new Anchor2();
        this.modelMatrix = new Matrix3Component(MODEL_2D, Matrix3.create(), [{
            label: MODEL_3D,
            unique: true 
        }]);
        this.worldMatrix = new Matrix3Component(WORLD_MATRIX3, Matrix3.create(), [{
            label: WORLD_MATRIX3,
            unique: true 
        }]);
    }
}
