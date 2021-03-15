import Entity from "@valeera/x/src/Entity";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import IWorld from "@valeera/x/src/interfaces/IWorld";
import { AProjection3, Matrix4Component } from "../../components/matrix4";

export default (projection: AProjection3, name = "camera", world?: IWorld): IEntity => {
    const entity = new Entity(name);
    entity.addComponent(projection)
        .addComponent(new Matrix4Component("position3"))
        .addComponent(new Matrix4Component("rotation3"))
        .addComponent(new Matrix4Component("scale3"))

    if (world) {
        world.addEntity(entity);
        world.store.set("activeCamera", entity);
    }
    return entity;
}
