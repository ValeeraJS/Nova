import Entity from "@valeera/x/src/Entity";
import IComponent from "@valeera/x/src/interfaces/IComponent";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import IWorld from "@valeera/x/src/interfaces/IWorld";
import { EuclidPosition3, EulerRotation3, Matrix4Component, Vector3Scale3 } from "../../components/matrix4";
import { Renderable } from "../../components/tag";
import { MODEL_3D, WORLD_MATRIX } from "../../components/constants";
import { Matrix4 } from "@valeera/mathx/build/Mathx.module";

export default (geometry: IComponent<any>, name = "mesh", world?: IWorld): IEntity => {
    const entity = new Entity(name) as any;
    entity.addComponent(geometry)
        .addComponent(new EuclidPosition3())
        .addComponent(new EulerRotation3())
        .addComponent(new Vector3Scale3())
        .addComponent(new Matrix4Component(MODEL_3D, Matrix4.create(), [{
            label: MODEL_3D,
            unique: true 
        }]))
        .addComponent(new Matrix4Component(WORLD_MATRIX, Matrix4.create(), [{
            label: WORLD_MATRIX,
            unique: true 
        }]))
        .addComponent(new Renderable("mesh"));

    if (world) {
        world.addEntity(entity);
    }
    return entity;
}
