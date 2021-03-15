import Entity from "@valeera/x/src/Entity";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import IWorld from "@valeera/x/src/interfaces/IWorld";
import { AProjection3, EuclidPosition3, EulerRotation3, Vector3Scale3 } from "../../components/matrix4";

export default (projection: AProjection3, name = "camera", world?: IWorld): IEntity => {
    const entity = new Entity(name);
    entity.addComponent(projection)
        .addComponent(new EuclidPosition3())
        .addComponent(new Vector3Scale3())
        .addComponent(new EulerRotation3());

    if (world) {
        world.addEntity(entity);
        world.store.set("activeCamera", entity);
    }
    return entity;
}
