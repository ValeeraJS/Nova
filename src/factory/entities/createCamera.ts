import Entity from "@valeera/x/src/Entity";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import IWorld from "@valeera/x/src/interfaces/IWorld";
import { AProjection3, EuclidPosition3, EulerRotation3, Matrix4Component, Vector3Scale3 } from "../../components/matrix4";
import { MODEL_3D, ROTATION_3D, SCALING_3D, TRANSLATION_3D } from "../../components/constants";
import { Matrix4 } from "@valeera/mathx";

export default (projection: AProjection3, name = "camera", world?: IWorld): IEntity => {
    const entity = new Entity(name) as any;
    entity.addComponent(projection)
        .addComponent(new EuclidPosition3())
        .addComponent(new EulerRotation3())
        .addComponent(new Vector3Scale3())
        .addComponent(new Matrix4Component(MODEL_3D, Matrix4.create(), [{
            label: MODEL_3D,
            unique: true 
        }]))

    if (world) {
        world.addEntity(entity);
        world.store.set("activeCamera", entity);
    }
    return entity;
}
