import Entity from "@valeera/x/src/Entity";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import IWorld from "@valeera/x/src/interfaces/IWorld";
import { AProjection3, Matrix4Component } from "../../components/matrix4";
import { MODEL_3D, ROTATION_3D, SCALING_3D, TRANSLATION_3D } from "../../components/constants";

export default (projection: AProjection3, name = "camera", world?: IWorld): IEntity => {
    const entity = new Entity(name) as any;
    entity.addComponent(projection)
        .addComponent(new Matrix4Component(TRANSLATION_3D))
        .addComponent(new Matrix4Component(ROTATION_3D))
        .addComponent(new Matrix4Component(SCALING_3D))
        .addComponent(new Matrix4Component(MODEL_3D))

    if (world) {
        world.addEntity(entity);
        world.store.set("activeCamera", entity);
    }
    return entity;
}
